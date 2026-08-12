<?php

declare(strict_types=1);

namespace App\Http\Requests\Storefront;

use App\Support\CartManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Adding a product to the cart (§7.4).
 */
class AddToCartRequest extends FormRequest
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
            'product_id' => [
                'required',
                'integer',
                // Only what is actually on sale. An inactive product has no
                // page to have been added from, so this is a tampered request.
                Rule::exists('products', 'id')->where('is_active', true),
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
                'max:'.CartManager::MAX_QUANTITY_PER_LINE,
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->mergeIfMissing(['quantity' => 1]);
    }
}
