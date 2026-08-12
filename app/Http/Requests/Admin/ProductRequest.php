<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\Product;
use App\Support\Locales;
use App\Support\TranslatableRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

/**
 * Create and update share one set of rules (§8).
 *
 * The two endpoints validate the same product; the only difference is which
 * row a uniqueness check should ignore, and that is one line rather than a
 * second class that drifts out of step with this one.
 */
class ProductRequest extends FormRequest
{
    /** Authorisation is the `can:access-admin` middleware on the route group. */
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
            ...TranslatableRules::make('name'),
            ...TranslatableRules::make('short_description', ['string', 'max:500'], required: false),
            ...TranslatableRules::make('description', ['string', 'max:20000'], required: false),

            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', $this->unique('slug')],
            'sku' => ['required', 'string', 'max:64', $this->unique('sku')],

            // Money is integer minor units, never a decimal (§2).
            'price_minor' => ['required', 'integer', 'min:0', 'max:100000000'],
            'compare_at_price_minor' => ['nullable', 'integer', 'min:0', 'max:100000000', 'gt:price_minor'],
            'currency' => ['required', 'string', 'size:3'],

            'weight_grams' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:1000000'],

            'is_active' => ['boolean'],
            'is_best_seller' => ['boolean'],
            'is_vegetarian' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:100000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return TranslatableRules::attributeNames([
            'name' => __('admin.fields.name'),
            'short_description' => __('admin.fields.short_description'),
            'description' => __('admin.fields.description'),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'compare_at_price_minor.gt' => __('admin.validation.compare_at_price'),
        ];
    }

    /**
     * The slug is derived from the default-locale name when the editor leaves
     * it blank, and normalised when they don't — a hand-typed slug with spaces
     * should still save rather than bounce the whole form.
     */
    protected function prepareForValidation(): void
    {
        $slug = (string) $this->input('slug', '');

        if ($slug === '') {
            $slug = (string) $this->input('name.'.Locales::default(), '');
        }

        $this->merge(['slug' => Str::slug($slug)]);
    }

    private function unique(string $column): Unique
    {
        $product = $this->route('product');

        return Rule::unique('products', $column)
            ->ignore($product instanceof Product ? $product->id : null);
    }
}
