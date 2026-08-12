<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shapes a paginator into the payload every paginated Inertia page reads.
 *
 * Laravel's own paginated resource response re-introduces the `data` envelope
 * that AppServiceProvider deliberately turns off, and it emits snake_case keys
 * that would be the only snake_case in the front end. Shaping it here keeps one
 * camelCase contract — `data`, `meta`, `links` — for every list page.
 *
 * @phpstan-type PaginationMeta array{currentPage: int, lastPage: int, perPage: int, total: int, from: int|null, to: int|null}
 */
final class PaginatedPayload
{
    /**
     * @param  LengthAwarePaginator<int, covariant \Illuminate\Database\Eloquent\Model>  $paginator
     * @param  class-string<JsonResource>  $resource
     * @return array{data: mixed, meta: PaginationMeta, links: array{prev: string|null, next: string|null}}
     */
    public static function make(LengthAwarePaginator $paginator, string $resource): array
    {
        return [
            'data' => $resource::collection($paginator->getCollection()),
            'meta' => [
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'links' => [
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ];
    }
}
