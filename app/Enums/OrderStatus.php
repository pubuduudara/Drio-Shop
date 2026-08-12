<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * The order lifecycle (§6). Admin status transitions are validated against
 * `canTransitionTo`, so the console cannot move an order somewhere the
 * business does not allow.
 */
enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';

    /**
     * The translation key for this status, resolved server-side for mail and
     * client-side for the admin table.
     */
    public function label(): string
    {
        return __("orders.status.{$this->value}");
    }

    /** Statuses that no longer move on their own. */
    public function isTerminal(): bool
    {
        return in_array($this, [self::Delivered, self::Cancelled, self::Refunded], true);
    }

    /**
     * Whether the order has been paid for, which is what makes it count
     * towards revenue on the dashboard.
     */
    public function isPaid(): bool
    {
        return in_array(
            $this,
            [self::Paid, self::Processing, self::Shipped, self::Delivered],
            true,
        );
    }

    /**
     * @return list<self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pending => [self::Paid, self::Cancelled],
            self::Paid => [self::Processing, self::Cancelled, self::Refunded],
            self::Processing => [self::Shipped, self::Cancelled, self::Refunded],
            self::Shipped => [self::Delivered, self::Refunded],
            self::Delivered => [self::Refunded],
            self::Cancelled, self::Refunded => [],
        };
    }

    public function canTransitionTo(self $status): bool
    {
        return in_array($status, $this->allowedTransitions(), true);
    }
}
