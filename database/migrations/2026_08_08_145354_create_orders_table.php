<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->string('order_number')->unique();
            // Nullable: guest checkout is the default path (§6).
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('status')->default(OrderStatus::Pending->value);

            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();

            // Japanese address format (§6).
            $table->string('postal_code');
            $table->string('prefecture');
            $table->string('city');
            $table->string('address_line1');
            $table->string('address_line2')->nullable();

            $table->unsignedInteger('subtotal_minor');
            $table->unsignedInteger('shipping_minor')->default(0);
            $table->unsignedInteger('tax_minor')->default(0);
            $table->unsignedInteger('total_minor');
            $table->string('currency', 3)->default('JPY');

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('customer_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
