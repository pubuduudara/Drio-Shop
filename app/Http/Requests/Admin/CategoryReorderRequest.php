<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Drag-to-reorder on the categories list (§8). The client posts the ids in
 * their new order and the server derives `sort_order` from the position, so a
 * dropped row cannot leave two categories claiming the same slot.
 */
class CategoryReorderRequest extends FormRequest
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
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('categories', 'id')],
        ];
    }
}
