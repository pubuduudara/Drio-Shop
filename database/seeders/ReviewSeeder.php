<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Review;
use App\Support\Locales;
use Illuminate\Database\Seeder;

/**
 * The homepage testimonial carousel (§7.8).
 *
 * The first four reproduce the mockup — Niroshi/Tokyo, Kenji/Osaka,
 * Saman/Yokohama, Ayumi/Nagoya, all five stars, with the sentiment shown.
 * The rest give the carousel something to scroll to.
 *
 * These carry no `product_id`: they praise the brand, which is why that column
 * is nullable (§6).
 */
class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $locale = Locales::default();

        $reviews = [
            // ---- The four the mockup shows ----
            [
                'name' => 'Niroshi',
                'city' => 'Tokyo',
                'body' => 'The taste is amazing! It brings back memories of home. Highly recommend DRIO products.',
            ],
            [
                'name' => 'Kenji',
                'city' => 'Osaka',
                'body' => 'Excellent quality and beautiful packaging. You can feel the love in every product.',
            ],
            [
                'name' => 'Saman',
                'city' => 'Yokohama',
                'body' => 'Finally, authentic Sri Lankan flavours in Japan! My family loves the jackfruit and curry powder.',
            ],
            [
                'name' => 'Ayumi',
                'city' => 'Nagoya',
                'body' => 'Fast delivery and top-notch quality. DRIO is now our go-to for Sri Lankan ingredients.',
            ],

            // ---- Enough more to make the carousel worth scrolling ----
            [
                'name' => 'Dilani',
                'city' => 'Kobe',
                'body' => 'I cooked polos curry for my Japanese colleagues and they asked for the recipe. That says everything.',
            ],
            [
                'name' => 'Yuki',
                'city' => 'Sapporo',
                'body' => 'I had never cooked Sri Lankan food before. The roasted curry powder made it easy to start.',
            ],
            [
                'name' => 'Chaminda',
                'city' => 'Nagoya',
                'body' => 'The goraka is the real thing. I have not found it anywhere else in Japan.',
            ],
            [
                'name' => 'Haruka',
                'city' => 'Fukuoka',
                'body' => 'Everything arrived sealed and fresh, and the cinnamon smells like nothing from the supermarket.',
            ],
            [
                'name' => 'Ruwan',
                'city' => 'Kawasaki',
                'body' => 'My mother approved, and she does not approve of much. Ordering again this month.',
            ],
            [
                'name' => 'Mika',
                'city' => 'Kyoto',
                'body' => 'The dried jackfruit rehydrates perfectly. I keep two packs in the cupboard now.',
            ],
            [
                'name' => 'Anushka',
                'city' => 'Saitama',
                'body' => 'Ordering from here costs less than the shop near the station and the quality is far better.',
            ],
            [
                'name' => 'Takeshi',
                'city' => 'Hiroshima',
                'body' => 'Clear instructions on the pack and a genuinely good result the first time I tried.',
            ],
            [
                'name' => 'Priyanka',
                'city' => 'Chiba',
                'body' => 'The curry leaves still smell like curry leaves. That is rarer than it should be.',
            ],
            [
                'name' => 'Sho',
                'city' => 'Sendai',
                'body' => 'Good packaging, quick delivery, and the chilli powder has real heat behind it.',
            ],
        ];

        foreach ($reviews as $index => $review) {
            Review::query()->updateOrCreate(
                [
                    'customer_name' => $review['name'],
                    'customer_city' => $review['city'],
                ],
                [
                    'product_id' => null,
                    'rating' => 5,
                    'body' => [$locale => $review['body']],
                    'is_published' => true,
                    'is_featured' => true,
                    'created_at' => now()->subDays($index),
                ],
            );
        }

        // A couple awaiting moderation, so the admin queue (§8) is not empty
        // the first time it is opened.
        Review::factory()
            ->count(3)
            ->unpublished()
            ->create();
    }
}
