<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\SubscriberRowResource;
use App\Models\Subscriber;
use App\Support\PaginatedPayload;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * The newsletter list (§8), with a CSV export.
 */
final class SubscriberController extends Controller
{
    private const int PER_PAGE = 50;

    public function index(Request $request): Response
    {
        $filters = ['search' => trim((string) $request->string('search'))];

        $subscribers = Subscriber::query()
            ->when(
                $filters['search'] !== '',
                fn ($query) => $query->where('email', 'like', '%'.$filters['search'].'%'),
            )
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('admin/subscribers/index', [
            'subscribers' => PaginatedPayload::make($subscribers, SubscriberRowResource::class),
            'filters' => $filters,
            'total' => Subscriber::query()->count(),
        ]);
    }

    /**
     * Streamed rather than built in memory: a mailing list is the one table
     * here that grows without bound, and a 50,000-row export should not be
     * held in a PHP array first.
     */
    public function export(): StreamedResponse
    {
        $filename = 'drio-subscribers-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'wb');

            fputcsv($handle, ['email', 'locale', 'confirmed_at', 'subscribed_at']);

            Subscriber::query()->orderBy('id')->chunk(500, function ($chunk) use ($handle): void {
                foreach ($chunk as $subscriber) {
                    fputcsv($handle, [
                        $subscriber->email,
                        $subscriber->locale,
                        $subscriber->confirmed_at?->toDateTimeString(),
                        $subscriber->created_at?->toDateTimeString(),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
