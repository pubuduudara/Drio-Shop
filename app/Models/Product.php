<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property int $category_id
 * @property string $name
 * @property string $slug
 * @property string|null $short_description
 * @property string|null $description
 * @property string $sku
 * @property int $price_minor
 * @property int|null $compare_at_price_minor
 * @property string $currency
 * @property int|null $weight_grams
 * @property int $stock_quantity
 * @property bool $is_active
 * @property bool $is_best_seller
 * @property bool $is_vegetarian
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'category_id', 'name', 'slug', 'short_description', 'description', 'sku',
    'price_minor', 'compare_at_price_minor', 'currency', 'weight_grams',
    'stock_quantity', 'is_active', 'is_best_seller', 'is_vegetarian', 'sort_order',
])]
class Product extends Model implements HasMedia
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    use HasTranslations;
    use InteractsWithMedia;
    use SoftDeletes;

    /** Stock *below* this reads as low and warns on the dashboard — §8 says
     * "stock < 10", so ten units is not yet a warning. */
    public const int LOW_STOCK_THRESHOLD = 10;

    /**
     * Custom property on a `primary` copy naming the `gallery` row it came
     * from (§8, .ai/rules/admin.md). Shared with ProductMediaController so
     * the write side and the read side agree on one name.
     */
    public const string PRIMARY_SOURCE_PROPERTY = 'source_media_id';

    /**
     * @var list<string>
     */
    public array $translatable = ['name', 'short_description', 'description'];

    /**
     * Media is eager-loaded on every query.
     *
     * `MediaPresenter` reaches for it inside the resource, and Spatie's
     * `getMedia()` lazy-loads the relation when it is not already there — so
     * without this every card in a grid costs its own query, and a shop page
     * of twelve products issued twelve of them. Doing it here rather than at
     * each call site means a new listing cannot reintroduce the N+1 by
     * forgetting to ask for it.
     *
     * @var list<string>
     */
    protected $with = ['media'];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<ProductVariant, $this>
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * @return HasMany<Review, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * @return BelongsToMany<Recipe, $this>
     */
    public function recipes(): BelongsToMany
    {
        // See Recipe::products() — the pivot is `recipe_product` per §6, not
        // the alphabetical name Laravel would infer.
        return $this->belongsToMany(Recipe::class, 'recipe_product')
            ->withTimestamps();
    }

    public function isInStock(): bool
    {
        return $this->stock_quantity > 0;
    }

    public function isLowStock(): bool
    {
        return $this->stock_quantity > 0
            && $this->stock_quantity < self::LOW_STOCK_THRESHOLD;
    }

    /** Whether to show a struck-through was-price (§5.4). */
    public function isOnSale(): bool
    {
        return $this->compare_at_price_minor !== null
            && $this->compare_at_price_minor > $this->price_minor;
    }

    /**
     * @param  Builder<$this>  $query
     */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * @param  Builder<$this>  $query
     */
    #[Scope]
    protected function bestSellers(Builder $query): void
    {
        $query->where('is_best_seller', true);
    }

    /**
     * @param  Builder<$this>  $query
     */
    #[Scope]
    protected function ordered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * `primary` is the card and hero image; `gallery` is the product detail
     * carousel (§6). Both stay empty until the client uploads real assets, at
     * which point `<Media />` starts rendering images with no code change.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('primary')->singleFile();
        $this->addMediaCollection('gallery');
    }

    /**
     * The `primary` image, but only once its `source_media_id` is confirmed
     * to still name a row in `gallery` (§8, .ai/rules/admin.md).
     *
     * `ProductMediaController` never leaves `primary` in any other state, but
     * a primary copy that outlives the gallery row it was copied from — from
     * data written outside that controller, or from a bug in an earlier
     * version of it — must stop rendering rather than have the storefront
     * card keep showing a photograph the admin Media tab cannot see or
     * remove.
     */
    public function primaryImage(): ?Media
    {
        $primary = $this->getMedia('primary')->first();

        if (! $primary instanceof Media) {
            return null;
        }

        $sourceId = $primary->getCustomProperty(self::PRIMARY_SOURCE_PROPERTY);

        if (! is_numeric($sourceId)) {
            return null;
        }

        return $this->getMedia('gallery')->contains('id', (int) $sourceId) ? $primary : null;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_minor' => 'integer',
            'compare_at_price_minor' => 'integer',
            'weight_grams' => 'integer',
            'stock_quantity' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'is_best_seller' => 'boolean',
            'is_vegetarian' => 'boolean',
        ];
    }
}
