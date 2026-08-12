<?php

namespace App\Providers;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureAuthorization();

        /*
         * Resource collections reach Inertia as plain arrays rather than
         * `{"data": [...]}`. The wrapper is a REST convention that buys
         * nothing here and would force every page component to unwrap a prop
         * it should just receive as a list.
         */
        JsonResource::withoutWrapping();
    }

    /**
     * Gate the admin console (§8).
     *
     * `is_admin` arrives with the Phase 2 users migration; until then the
     * null-coalesce keeps the gate closed rather than erroring.
     */
    protected function configureAuthorization(): void
    {
        Gate::define('access-admin', fn (User $user): bool => (bool) ($user->is_admin ?? false));
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
