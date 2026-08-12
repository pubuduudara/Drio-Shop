<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property string $name Resolved to the active locale by HasTranslations.
 * @property string $slug
 * @property string|null $description
 * @property string $icon_key
 * @property int $sort_order
 * @property bool $is_featured
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'slug', 'description', 'icon_key', 'sort_order', 'is_featured'])]
class Category extends Model implements HasMedia
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    use HasTranslations;
    use InteractsWithMedia;

    /**
     * JSON columns keyed by locale (§6). Reading `$category->name` returns a
     * plain string in the active locale, so nothing downstream — resource,
     * controller or component — has to know translation exists (§9.4).
     *
     * @var list<string>
     */
    public array $translatable = ['name', 'description'];

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
     * Route model binding uses the canonical English slug for every locale, by
     * design — see §6 on why slugs are deliberately not translatable.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * @param  Builder<$this>  $query
     */
    #[Scope]
    protected function featured(Builder $query): void
    {
        $query->where('is_featured', true);
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
            'sort_order' => 'integer',
            'is_featured' => 'boolean',
        ];
    }
}
