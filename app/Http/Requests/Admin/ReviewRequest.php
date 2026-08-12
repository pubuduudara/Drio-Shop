<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Support\TranslatableRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The moderation queue's edit form (§8).
 *
 * `product_id` is nullable by design: the homepage testimonials are brand
 * feedback rather than product feedback (§6).
 */
class ReviewRequest extends FormRequest
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
            ...TranslatableRules::make('body', ['string', 'max:2000']),

            'product_id' => ['nullable', 'integer', Rule::exists('products', 'id')],
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_city' => ['nullable', 'string', 'max:120'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'is_published' => ['boolean'],
            'is_featured' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return TranslatableRules::attributeNames(['body' => __('admin.fields.body')]);
    }
}
