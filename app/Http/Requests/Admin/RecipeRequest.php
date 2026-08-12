<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\Recipe;
use App\Support\Locales;
use App\Support\TranslatableRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Create and update for recipes (§8).
 *
 * `ingredients` and `steps` are translatable *lists* — the stored JSON is keyed
 * by locale and each value is an array of strings — so they need their own
 * rules rather than TranslatableRules, which builds scalar ones.
 */
class RecipeRequest extends FormRequest
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
        $recipe = $this->route('recipe');

        return [
            ...TranslatableRules::make('title'),
            ...TranslatableRules::make('intro', ['string', 'max:1000'], required: false),
            ...$this->listRules('ingredients'),
            ...$this->listRules('steps'),

            'slug' => [
                'required', 'string', 'max:255', 'alpha_dash',
                Rule::unique('recipes', 'slug')
                    ->ignore($recipe instanceof Recipe ? $recipe->id : null),
            ],

            'prep_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'cook_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'serves' => ['nullable', 'integer', 'min:1', 'max:100'],

            'is_vegetarian' => ['boolean'],
            'is_traditional' => ['boolean'],
            'is_quick' => ['boolean'],
            'is_published' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:100000'],

            'product_ids' => ['array'],
            'product_ids.*' => ['integer', Rule::exists('products', 'id')],
        ];
    }

    /**
     * A translatable list: required as an array in every enabled locale, with
     * at least one entry in the default one. An empty method is not a recipe.
     *
     * @return array<string, list<string>>
     */
    private function listRules(string $attribute): array
    {
        $rules = [$attribute => ['required', 'array']];

        foreach (Locales::enabled() as $locale) {
            $isDefault = $locale === Locales::default();

            $rules["{$attribute}.{$locale}"] = $isDefault
                ? ['required', 'array', 'min:1']
                : ['nullable', 'array'];

            $rules["{$attribute}.{$locale}.*"] = ['string', 'max:500'];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return TranslatableRules::attributeNames([
            'title' => __('admin.fields.title'),
            'intro' => __('admin.fields.intro'),
            'ingredients' => __('admin.fields.ingredients'),
            'steps' => __('admin.fields.steps'),
        ]);
    }

    protected function prepareForValidation(): void
    {
        $slug = (string) $this->input('slug', '');

        if ($slug === '') {
            $slug = (string) $this->input('title.'.Locales::default(), '');
        }

        $this->merge(['slug' => Str::slug($slug)]);

        // Blank rows are how a repeatable builder represents "not filled in
        // yet"; they should not reach the database as empty ingredients.
        foreach (['ingredients', 'steps'] as $attribute) {
            $value = $this->input($attribute);

            if (! is_array($value)) {
                continue;
            }

            $this->merge([
                $attribute => array_map(
                    fn ($entries) => is_array($entries)
                        ? array_values(array_filter(
                            array_map(fn ($entry) => is_string($entry) ? trim($entry) : $entry, $entries),
                            fn ($entry): bool => is_string($entry) && $entry !== '',
                        ))
                        : $entries,
                    $value,
                ),
            ]);
        }
    }
}
