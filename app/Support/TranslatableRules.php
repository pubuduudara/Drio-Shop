<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Validation rules for a translatable attribute (§9.5).
 *
 * The default locale is required and every other enabled locale is optional,
 * because a half-translated catalogue must still save — the fallback renders
 * English rather than an empty string (§9.4).
 *
 * The locale list comes from App\Support\Locales, never from a literal, so
 * enabling Japanese widens every admin form's validation with no edit here
 * and none in any Form Request (§9.1).
 */
final class TranslatableRules
{
    /**
     * @param  list<string>  $rules  Applied to each per-locale value.
     * @param  bool  $required  Whether the default locale must be filled.
     * @return array<string, list<string>>
     */
    public static function make(string $attribute, array $rules = ['string', 'max:255'], bool $required = true): array
    {
        $built = [
            $attribute => [$required ? 'required' : 'nullable', 'array'],
        ];

        foreach (Locales::enabled() as $locale) {
            $isDefault = $locale === Locales::default();

            $built["{$attribute}.{$locale}"] = [
                $required && $isDefault ? 'required' : 'nullable',
                ...$rules,
            ];
        }

        return $built;
    }

    /**
     * Friendly attribute names for the per-locale keys, so a failure reads
     * "The name field is required." rather than naming `name.en`.
     *
     * @param  array<string, string>  $attributes  Attribute name => label.
     * @return array<string, string>
     */
    public static function attributeNames(array $attributes): array
    {
        $names = [];

        foreach ($attributes as $attribute => $label) {
            foreach (Locales::enabled() as $locale) {
                $names["{$attribute}.{$locale}"] = Locales::isSingle()
                    ? $label
                    : "{$label} (".Locales::meta($locale)['label'].')';
            }
        }

        return $names;
    }
}
