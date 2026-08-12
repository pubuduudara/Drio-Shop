<?php

declare(strict_types=1);

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Newsletter signup (§7.10). Validation lives here rather than in the
 * controller, per the project's write-endpoint convention.
 */
class SubscribeRequest extends FormRequest
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
            'email' => [
                'required',
                'string',
                /*
                 * `rfc` only, deliberately. Adding `dns` would put a live MX
                 * lookup on the request path — slow, and it fails closed, so a
                 * DNS hiccup silently rejects a real subscriber. A dead row in
                 * `subscribers` is the cheaper mistake.
                 */
                'email:rfc',
                'max:255',
                Rule::unique('subscribers', 'email'),
            ],
        ];
    }

    /**
     * Messages say what to fix rather than apologising (§7.10).
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => __('storefront.newsletter.email_required'),
            'email.email' => __('storefront.newsletter.email_invalid'),
            'email.unique' => __('storefront.newsletter.already_subscribed'),
        ];
    }
}
