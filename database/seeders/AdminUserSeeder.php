<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

/**
 * The seeded console account (§8): admin@drio.jp / password.
 *
 * There is no public registration for the admin — accounts come from here or
 * from an existing admin's invite.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['admin', 'manager'] as $role) {
            Role::findOrCreate($role, 'web');
        }

        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@drio.jp'],
            [
                'name' => 'DRIO Admin',
                'password' => Hash::make('password'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ],
        );

        $admin->syncRoles(['admin']);
    }
}
