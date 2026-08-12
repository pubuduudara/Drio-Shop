<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\HeroSlide;
use App\Support\MediaPresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
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
            /*
             * The headline is authored with newlines and split here rather
             * than in the component, so an editor controls where the three
             * lines break — and a Japanese headline can break somewhere else
             * entirely without a code change (§7.2).
             */
            'headlineLines' => $this->headlineLines(),
            'subhead' => $this->subhead,
            'primaryCta' => $this->cta(
                $this->primary_cta_label,
                $this->primary_cta_href,
            ),
            'secondaryCta' => $this->cta(
                $this->secondary_cta_label,
                $this->secondary_cta_href,
            ),
            'media' => MediaPresenter::first(
                $this->resource,
                'primary',
                $this->headlineLines()[0] ?? '',
            ),
        ];
    }

    /**
     * @return list<string>
     */
    private function headlineLines(): array
    {
        return array_values(array_filter(
            array_map(trim(...), preg_split('/\R/', (string) $this->headline) ?: []),
            fn (string $line): bool => $line !== '',
        ));
    }

    /**
     * @return array{label: string, href: string}|null
     */
    private function cta(?string $label, ?string $href): ?array
    {
        if ($label === null || $href === null) {
            return null;
        }

        return ['label' => $label, 'href' => $href];
    }
}
