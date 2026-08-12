<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\Category;
use App\Support\Locales;
use App\Support\TranslatableRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Create and update for categories (§8).
 */
class CategoryRequest extends FormRequest
{
    /**
     * The icon keys the drawn SVG set actually covers (§6). A key outside this
     * list would render nothing, so it is a validation failure rather than a
     * silently empty badge.
     */
    public const array ICON_KEYS = ['leaf', 'powder', 'chilli', 'spice'];

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $category = $this->route('category');

        return [
            ...TranslatableRules::make('name'),
            ...TranslatableRules::make('description', ['string', 'max:500'], required: false),

            'slug' => [
                'required', 'string', 'max:255', 'alpha_dash',
                Rule::unique('categories', 'slug')
                    ->ignore($category instanceof Category ? $category->id : null),
            ],
            'icon_key' => ['required', 'string', Rule::in(self::ICON_KEYS)],
            'is_featured' => ['boolean'],
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
            'description' => __('admin.fields.description'),
        ]);
    }

    protected function prepareForValidation(): void
    {
        $slug = (string) $this->input('slug', '');

        if ($slug === '') {
            $slug = (string) $this->input('name.'.Locales::default(), '');
        }

        $this->merge(['slug' => Str::slug($slug)]);
    }
}
