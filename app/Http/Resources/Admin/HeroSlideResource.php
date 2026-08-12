<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\HeroSlide;
use App\Support\Locales;
use App\Support\MediaPresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A hero slide as the admin list and form read it — full translation maps, per
 * the §9.4 exception documented on ProductFormResource.
 *
 * @mixin HeroSlide
 */
class HeroSlideResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'headline' => $this->translations('headline'),
            'subhead' => $this->translations('subhead'),
            'primaryCtaLabel' => $this->translations('primary_cta_label'),
            'secondaryCtaLabel' => $this->translations('secondary_cta_label'),
            'primaryCtaHref' => $this->primary_cta_href,
            'secondaryCtaHref' => $this->secondary_cta_href,
            'sortOrder' => $this->sort_order,
            'isActive' => $this->is_active,
            // Resolved, for the list's preview line.
            'resolvedHeadline' => $this->headline,
            'media' => MediaPresenter::first($this->resource, 'primary', $this->headline),
        ];
    }

    /**
     * @return array<string, string>
     */
    private function translations(string $attribute): array
    {
        /** @var array<string, string> $stored */
        $stored = $this->getTranslations($attribute);
        $out = [];

        foreach (Locales::enabled() as $locale) {
            $out[$locale] = $stored[$locale] ?? '';
        }

        return $out;
    }
}
