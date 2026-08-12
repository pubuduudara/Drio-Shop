<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->numberBetween(10, 80) * 100;
        $shipping = $subtotal >= 5000 ? 0 : 600;

        return [
            'order_number' => Order::generateOrderNumber(),
            'user_id' => null,
            'status' => OrderStatus::Pending,
            'customer_name' => $this->faker->name(),
            'customer_email' => $this->faker->unique()->safeEmail(),
            'customer_phone' => $this->faker->numerify('0##-####-####'),
            // Japanese address format (§6).
            'postal_code' => $this->faker->numerify('###-####'),
            'prefecture' => $this->faker->randomElement([
                'Tokyo', 'Osaka', 'Kanagawa', 'Aichi', 'Fukuoka', 'Hokkaido',
            ]),
            'city' => $this->faker->city(),
            'address_line1' => $this->faker->streetAddress(),
            'address_line2' => null,
            'subtotal_minor' => $subtotal,
            'shipping_minor' => $shipping,
            'tax_minor' => 0,
            'total_minor' => $subtotal + $shipping,
            'currency' => 'JPY',
            'notes' => null,
        ];
    }

    public function status(OrderStatus $status): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => $status,
        ]);
    }
}
