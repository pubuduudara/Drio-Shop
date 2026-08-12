<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Moving an order to a new status, with a note (§8).
 *
 * The allowed destinations come from the enum's own transition table rather
 * than from a list here, so the console cannot move an order somewhere the
 * business does not allow — a delivered order cannot go back to pending.
 */
class OrderStatusRequest extends FormRequest
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
            'status' => [
                'required',
                'string',
                Rule::enum(OrderStatus::class),
            ],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $order = $this->route('order');

                if (! $order instanceof Order || $validator->errors()->has('status')) {
                    return;
                }

                $target = OrderStatus::from((string) $this->input('status'));

                if (! $order->status->canTransitionTo($target)) {
                    $validator->errors()->add('status', __('admin.orders.invalid_transition', [
                        'from' => $order->status->label(),
                        'to' => $target->label(),
                    ]));
                }
            },
        ];
    }
}
