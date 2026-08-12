<?php

declare(strict_types=1);

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The shop's filter, sort and pagination inputs (§7.12).
 *
 * A read endpoint, but the query string is still user input: an unvalidated
 * `sort` reaches `orderBy` and an unvalidated `max` reaches a `where`. The
 * rules are permissive — a bad filter should not error, it should be ignored —
 * which is why every key is `nullable` rather than required.
 */
class ShopFilterRequest extends FormRequest
{
    public const array SORTS = ['featured', 'price_asc', 'price_desc', 'newest'];

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
            // The header's search overlay lands here rather than on a separate
            // results page, so search is one more filter of the same grid.
            'q' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:255'],
            'min' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'max' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'dietary' => ['nullable', 'string', Rule::in(['vegetarian'])],
            'sort' => ['nullable', 'string', Rule::in(self::SORTS)],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * The validated filter set, normalised so the controller never has to ask
     * whether a key is present.
     *
     * @return array{q: string|null, category: string|null, min: int|null, max: int|null, dietary: string|null, sort: string}
     */
    public function filters(): array
    {
        $term = trim((string) $this->validated('q'));

        return [
            'q' => $term === '' ? null : $term,
            'category' => $this->validated('category'),
            'min' => $this->validated('min') !== null ? (int) $this->validated('min') : null,
            'max' => $this->validated('max') !== null ? (int) $this->validated('max') : null,
            'dietary' => $this->validated('dietary'),
            'sort' => $this->validated('sort') ?? 'featured',
        ];
    }
}
