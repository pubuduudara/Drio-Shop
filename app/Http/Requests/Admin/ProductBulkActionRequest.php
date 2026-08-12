<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Bulk activate, deactivate or delete from the products table (§8).
 */
class ProductBulkActionRequest extends FormRequest
{
    public const array ACTIONS = ['activate', 'deactivate', 'delete'];

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
            'action' => ['required', 'string', Rule::in(self::ACTIONS)],
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer', Rule::exists('products', 'id')],
        ];
    }
}
