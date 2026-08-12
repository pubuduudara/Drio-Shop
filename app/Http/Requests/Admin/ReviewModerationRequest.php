<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * One-click moderation from the queue (§8): approve, unapprove, feature or
 * unfeature without opening the review's form.
 */
class ReviewModerationRequest extends FormRequest
{
    public const array ACTIONS = ['publish', 'unpublish', 'feature', 'unfeature'];

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
        ];
    }
}
