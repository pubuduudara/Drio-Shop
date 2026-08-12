<?php

declare(strict_types=1);

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Checkout (§7.12): contact, a Japanese-format shipping address, and the
 * payment method stub.
 *
 * The keys are grouped by the step that owns them, which is how the front end
 * knows which step to reopen when a submission comes back with errors.
 */
class CheckoutRequest extends FormRequest
{
    /** The stub methods offered until a real gateway is connected. */
    public const array PAYMENT_METHODS = ['card', 'konbini', 'bank_transfer', 'cod'];

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
            // Contact
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['required', 'string', 'email:rfc', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:32'],

            /*
             * Japanese address format (§6). The postal code is validated in
             * the shape Japan Post actually issues — 7 digits, optionally
             * hyphenated after the third — rather than as free text, because a
             * malformed one fails at the courier rather than here.
             */
            'postal_code' => ['required', 'string', 'regex:/^\d{3}-?\d{4}$/'],
            'prefecture' => ['required', 'string', Rule::in(self::PREFECTURES)],
            'city' => ['required', 'string', 'max:120'],
            'address_line1' => ['required', 'string', 'max:180'],
            'address_line2' => ['nullable', 'string', 'max:180'],

            // Payment
            'payment_method' => ['required', 'string', Rule::in(self::PAYMENT_METHODS)],

            // Review
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'postal_code.regex' => __('storefront.checkout.postal_code_format'),
        ];
    }

    protected function prepareForValidation(): void
    {
        $postal = (string) $this->input('postal_code', '');

        // Full-width digits and stray spaces are what a Japanese IME produces;
        // normalise rather than bounce the customer for their keyboard.
        $this->merge([
            'postal_code' => trim(mb_convert_kana($postal, 'n')),
        ]);
    }

    /**
     * The 47 prefectures. A free-text field here produces "Tokyo", "tokyo",
     * "東京都" and "Tokyo-to" in the same column, which makes shipping labels
     * and any future rate table unusable.
     */
    public const array PREFECTURES = [
        'Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima',
        'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa',
        'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano',
        'Gifu', 'Shizuoka', 'Aichi', 'Mie',
        'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara', 'Wakayama',
        'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi',
        'Tokushima', 'Kagawa', 'Ehime', 'Kochi',
        'Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki',
        'Kagoshima', 'Okinawa',
    ];
}
