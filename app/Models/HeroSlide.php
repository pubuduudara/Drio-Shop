<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\HeroSlideFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Translatable\HasTranslations;

/**
 * @property int $id
 * @property string $headline
 * @property string|null $subhead
 * @property string|null $primary_cta_label
 * @property string|null $primary_cta_href
 * @property string|null $secondary_cta_label
 * @property string|null $secondary_cta_href
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'headline', 'subhead', 'primary_cta_label', 'primary_cta_href',
    'secondary_cta_label', 'secondary_cta_href', 'sort_order', 'is_active',
])]
class HeroSlide extends Model implements HasMedia
{
    /** @use HasFactory<HeroSlideFactory> */
    use HasFactory;

    use HasTranslations;
    use InteractsWithMedia;

    /**
     * CTA labels are copy and translate; the hrefs beside them are routes and
     * deliberately do not.
     *
     * @var list<string>
     */
    public array $translatable = [
        'headline',
        'subhead',
        'primary_cta_label',
        'secondary_cta_label',
    ];

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
            'is_active' => 'boolean',
        ];
    }
}
