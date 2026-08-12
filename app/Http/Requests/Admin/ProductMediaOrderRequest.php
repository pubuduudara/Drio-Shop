<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Gallery reordering and the choice of primary image (§8).
 *
 * Both arrive on one endpoint because the Media tab saves the arrangement as a
 * whole: dragging a tile to the front and marking it primary are one editorial
 * gesture, and splitting them would let the two states disagree.
 */
class ProductMediaOrderRequest extends FormRequest
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
            'order' => ['required', 'array'],
            'order.*' => ['integer'],
            'primary_id' => ['nullable', 'integer'],
        ];
    }
}
