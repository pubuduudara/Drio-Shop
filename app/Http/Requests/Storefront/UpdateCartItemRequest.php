<?php

declare(strict_types=1);

namespace App\Http\Requests\Storefront;

use App\Support\CartManager;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Changing a line's quantity from the drawer or the cart page (§7.12).
 *
 * Zero is allowed and means remove: a stepper at 1 whose minus is pressed
 * should empty the line rather than refuse.
 */
class UpdateCartItemRequest extends FormRequest
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
            'quantity' => [
                'required',
                'integer',
                'min:0',
                'max:'.CartManager::MAX_QUANTITY_PER_LINE,
            ],
        ];
    }
}
