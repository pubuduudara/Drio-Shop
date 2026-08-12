<?php

declare(strict_types=1);

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The contact form (§7.12).
 */
class ContactRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:120'],
            // `rfc` only, for the reason documented on SubscribeRequest.
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'subject' => ['required', 'string', 'max:160'],
            'message' => ['required', 'string', 'min:10', 'max:4000'],
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
            'name.required' => __('storefront.contact.name_required'),
            'email.required' => __('storefront.contact.email_required'),
            'email.email' => __('storefront.contact.email_invalid'),
            'subject.required' => __('storefront.contact.subject_required'),
            'message.required' => __('storefront.contact.message_required'),
            'message.min' => __('storefront.contact.message_short'),
        ];
    }
}
