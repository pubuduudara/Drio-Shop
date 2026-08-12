<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Support\TranslatableRules;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Create and update for hero slides (§8).
 *
 * CTA labels are copy and translate; the hrefs beside them are routes and
 * deliberately do not (§6).
 */
class HeroSlideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ...TranslatableRules::make('headline', ['string', 'max:200']),
            ...TranslatableRules::make('subhead', ['string', 'max:400'], required: false),
            ...TranslatableRules::make('primary_cta_label', ['string', 'max:60'], required: false),
            ...TranslatableRules::make('secondary_cta_label', ['string', 'max:60'], required: false),

            /*
             * App-relative paths only. An absolute URL here would let a slide
             * send the homepage's primary call to action off-site.
             */
            'primary_cta_href' => ['nullable', 'string', 'max:255', 'starts_with:/'],
            'secondary_cta_href' => ['nullable', 'string', 'max:255', 'starts_with:/'],

            'sort_order' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return TranslatableRules::attributeNames([
            'headline' => __('admin.fields.headline'),
            'subhead' => __('admin.fields.subhead'),
            'primary_cta_label' => __('admin.fields.primary_cta'),
            'secondary_cta_label' => __('admin.fields.secondary_cta'),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'primary_cta_href.starts_with' => __('admin.validation.relative_href'),
            'secondary_cta_href.starts_with' => __('admin.validation.relative_href'),
        ];
    }
}
