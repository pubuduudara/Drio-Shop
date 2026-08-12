<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Inline price and stock edits from the products table (§8).
 *
 * Repricing and restocking is the thing the client will do most often, so it
 * has its own narrow endpoint rather than round-tripping the whole product
 * form — the row posts two integers and nothing else can be changed by it.
 */
class ProductQuickUpdateRequest extends FormRequest
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
            'price_minor' => ['required', 'integer', 'min:0', 'max:100000000'],
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:1000000'],
        ];
    }
}
