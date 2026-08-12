<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ReviewFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property int|null $product_id
 * @property string $customer_name
 * @property string|null $customer_city
 * @property int $rating
 * @property string $body
 * @property bool $is_published
 * @property bool $is_featured
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'product_id', 'customer_name', 'customer_city', 'rating', 'body',
    'is_published', 'is_featured',
])]
class Review extends Model implements HasMedia
{
    /** @use HasFactory<ReviewFactory> */
    use HasFactory;

    use HasTranslations;
    use InteractsWithMedia;

    /**
     * The reviewer's name and city are proper nouns and stay plain; only the
     * body is copy that would be translated.
     *
     * @var list<string>
     */
    public array $translatable = ['body'];

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

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @param  Builder<$this>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('is_published', true);
    }

    /**
     * Featured reviews are the homepage carousel (§7.8) — brand testimonials
     * rather than product feedback, which is why `product_id` is nullable.
     *
     * @param  Builder<$this>  $query
     */
    #[Scope]
    protected function featured(Builder $query): void
    {
        $query->where('is_featured', true);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')->singleFile();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }
}
