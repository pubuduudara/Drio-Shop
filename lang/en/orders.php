<?php

declare(strict_types=1);

/*
 * Order lifecycle labels, read by App\Enums\OrderStatus::label() for anything
 * the server renders — mail, packing slips, exports (§6).
 */

return [

    'status' => [
        'pending' => 'Pending',
        'paid' => 'Paid',
        'processing' => 'Processing',
        'shipped' => 'Shipped',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled',
        'refunded' => 'Refunded',
    ],

    /*
     * The stub methods offered until a gateway is connected. The choice is
     * recorded on the order's notes, not charged.
     */
    'payment_method' => [
        'card' => 'Credit card',
        'konbini' => 'Konbini payment',
        'bank_transfer' => 'Bank transfer',
        'cod' => 'Cash on delivery',
    ],

    'payment_recorded' => 'Payment method chosen at checkout: :method (not yet charged).',

    'status_changed' => ':from → :to',

];
