<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\RecipeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string|null $intro
 * @property list<string> $ingredients
 * @property list<string> $steps
 * @property int|null $prep_minutes
 * @property int|null $cook_minutes
 * @property int|null $serves
 * @property bool $is_vegetarian
 * @property bool $is_traditional
 * @property bool $is_quick
 * @property bool $is_published
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'title', 'slug', 'intro', 'ingredients', 'steps', 'prep_minutes',
    'cook_minutes', 'serves', 'is_vegetarian', 'is_traditional', 'is_quick',
    'is_published', 'sort_order',
])]
class Recipe extends Model implements HasMedia
{
    /** @use HasFactory<RecipeFactory> */
    use HasFactory;

    use HasTranslations;
    use InteractsWithMedia;

    /**
     * `ingredients` and `steps` are translatable lists — the stored JSON is
     * keyed by locale and each value is an array. Translatable resolves the
     * locale, so reading `$recipe->steps` yields a plain list of strings.
     *
     * @var list<string>
     */
    public array $translatable = ['title', 'intro', 'ingredients', 'steps'];

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
     * The products a recipe uses, which drives the "shop the ingredients"
     * block on a recipe page (§7.12).
     *
     * @return BelongsToMany<Product, $this>
     */
    public function products(): BelongsToMany
    {
        // Named explicitly: §6 specifies `recipe_product`, whereas Laravel's
        // alphabetical convention would look for `product_recipe`.
        return $this->belongsToMany(Product::class, 'recipe_product')
            ->withTimestamps();
    }

    public function totalMinutes(): ?int
    {
        if ($this->prep_minutes === null && $this->cook_minutes === null) {
            return null;
        }

        return ($this->prep_minutes ?? 0) + ($this->cook_minutes ?? 0);
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
     * @param  Builder<$this>  $query
     */
    #[Scope]
    protected function ordered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('primary')->singleFile();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'prep_minutes' => 'integer',
            'cook_minutes' => 'integer',
            'serves' => 'integer',
            'sort_order' => 'integer',
            'is_vegetarian' => 'boolean',
            'is_traditional' => 'boolean',
            'is_quick' => 'boolean',
            'is_published' => 'boolean',
        ];
    }
}
