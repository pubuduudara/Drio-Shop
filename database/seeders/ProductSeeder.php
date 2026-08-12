<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Support\Locales;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * The catalogue.
 *
 * The five best sellers reproduce the mockup exactly — name, price, star
 * rating and review count — so the built homepage is directly comparable to
 * the reference (§6). The rest are plausible stock that makes pagination,
 * filters, sale badges and stock states testable.
 */
class ProductSeeder extends Seeder
{
    /**
     * Ratings shown on the homepage cards. Reviews are generated to average to
     * exactly these values, because the card reads its rating from the
     * reviews table rather than a denormalised column.
     *
     * @var list<array{slug: string, rating: float, reviews: int}>
     */
    private const array BEST_SELLER_RATINGS = [
        ['slug' => 'dehydrated-jackfruit', 'rating' => 4.5, 'reviews' => 128],
        ['slug' => 'dehydrated-polos-jackfruit', 'rating' => 5.0, 'reviews' => 96],
        ['slug' => 'roasted-curry-powder', 'rating' => 4.5, 'reviews' => 72],
        ['slug' => 'chilli-powder', 'rating' => 4.0, 'reviews' => 84],
        ['slug' => 'dehydrated-breadfruit-chips', 'rating' => 4.5, 'reviews' => 64],
    ];

    public function run(): void
    {
        $locale = Locales::default();
        $categories = Category::query()->pluck('id', 'slug');

        foreach ($this->products() as $index => $product) {
            Product::query()->updateOrCreate(
                ['slug' => $product['slug']],
                [
                    'category_id' => $categories[$product['category']],
                    'name' => [$locale => $product['name']],
                    'short_description' => [$locale => $product['short']],
                    'description' => [$locale => $product['description']],
                    'sku' => $product['sku'],
                    'price_minor' => $product['price'],
                    'compare_at_price_minor' => $product['compare_at'] ?? null,
                    'currency' => 'JPY',
                    'weight_grams' => $product['grams'],
                    'stock_quantity' => $product['stock'],
                    'is_active' => $product['active'] ?? true,
                    'is_best_seller' => $product['best_seller'] ?? false,
                    'is_vegetarian' => $product['vegetarian'] ?? true,
                    'sort_order' => $index,
                ],
            );
        }

        $this->seedBestSellerReviews();
    }

    /**
     * Generates product reviews that average to the exact rating on each
     * mockup card.
     *
     * A 4.5 average over 128 reviews is 64 fives and 64 fours — no rounding
     * fudge, so the star component renders a real half star rather than one
     * faked for the screenshot.
     */
    private function seedBestSellerReviews(): void
    {
        $locale = Locales::default();
        $bodies = [
            'Exactly what I was missing. Tastes like the kitchen back home.',
            'Arrived quickly and beautifully packed. Will order again.',
            'The aroma when it hits the pan is unmistakable.',
            'Good quality and a fair price for what you get.',
            'My family finished the first pack in a week.',
            'Reliable every time I order. No complaints at all.',
        ];

        foreach (self::BEST_SELLER_RATINGS as $target) {
            $product = Product::query()->where('slug', $target['slug'])->first();

            if ($product === null || $product->reviews()->exists()) {
                continue;
            }

            $base = (int) floor($target['rating']);
            $topCount = (int) round(($target['rating'] - $base) * $target['reviews']);

            $rows = [];

            for ($i = 0; $i < $target['reviews']; $i++) {
                $rows[] = [
                    'product_id' => $product->id,
                    'customer_name' => 'Customer '.($i + 1),
                    'customer_city' => null,
                    'rating' => $i < $topCount ? $base + 1 : $base,
                    'body' => json_encode([$locale => $bodies[$i % count($bodies)]]),
                    'is_published' => true,
                    'is_featured' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Bulk insert: several hundred rows through Eloquent would make
            // `migrate:fresh --seed` noticeably slower for no benefit.
            foreach (array_chunk($rows, 100) as $chunk) {
                DB::table('reviews')->insert($chunk);
            }
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function products(): array
    {
        return [
            // ---- The five best sellers, exactly as the mockup shows them ----
            [
                'slug' => 'dehydrated-jackfruit',
                'name' => 'Dehydrated Jackfruit',
                'category' => 'dehydrated-vegetables',
                'sku' => 'DRIO-DJ-200',
                'price' => 1580,
                'grams' => 200,
                'stock' => 84,
                'best_seller' => true,
                'short' => 'Young jackfruit, sun-dried and ready for curry.',
                'description' => 'Harvested young and dried slowly in the Sri Lankan sun, this jackfruit rehydrates in minutes and holds its bite through a long simmer. One pack makes curry for four.',
            ],
            [
                'slug' => 'dehydrated-polos-jackfruit',
                'name' => 'Dehydrated Polos Jackfruit',
                'category' => 'dehydrated-vegetables',
                'sku' => 'DRIO-DP-200',
                'price' => 1680,
                'grams' => 200,
                'stock' => 62,
                'best_seller' => true,
                'short' => 'Baby jackfruit for the classic polos ambula.',
                'description' => 'Polos is jackfruit picked before the seeds harden, and it is the heart of one of the island\'s best-loved curries. Dried here in thick pieces so it stays meaty.',
            ],
            [
                'slug' => 'roasted-curry-powder',
                'name' => 'Roasted Curry Powder',
                'category' => 'curry-powder',
                'sku' => 'DRIO-RC-100',
                'price' => 980,
                'grams' => 100,
                'stock' => 140,
                'best_seller' => true,
                'short' => 'Dark, roasted and built for meat and fish curries.',
                'description' => 'Coriander, cumin, fennel and curry leaf, dry-roasted until dark before grinding. This is the blend that gives Sri Lankan curry its depth and colour.',
            ],
            [
                'slug' => 'chilli-powder',
                'name' => 'Chilli Powder',
                'category' => 'chilli-powder',
                'sku' => 'DRIO-CP-100',
                'price' => 880,
                'grams' => 100,
                'stock' => 156,
                'best_seller' => true,
                'short' => 'Sun-dried Sri Lankan chillies, ground fine.',
                'description' => 'Ground from whole sun-dried chillies with nothing else added. Bright red, properly hot, and nothing like the dull powder sold as chilli elsewhere.',
            ],
            [
                'slug' => 'dehydrated-breadfruit-chips',
                'name' => 'Dehydrated Breadfruit Chips',
                'category' => 'dehydrated-vegetables',
                'sku' => 'DRIO-DB-150',
                'price' => 1480,
                'grams' => 150,
                'stock' => 48,
                'best_seller' => true,
                'short' => 'Sliced breadfruit, ready to fry or curry.',
                'description' => 'Breadfruit sliced thin and dried, so it can go straight into hot oil for chips or into coconut milk for a gentle curry.',
            ],

            // ---- Dehydrated vegetables ----
            [
                'slug' => 'dehydrated-ash-plantain',
                'name' => 'Dehydrated Ash Plantain',
                'category' => 'dehydrated-vegetables',
                'sku' => 'DRIO-AP-200',
                'price' => 1280,
                'grams' => 200,
                'stock' => 36,
                'short' => 'Alu kesel, dried and ready for tempering.',
                'description' => 'Ash plantain holds its shape beautifully in a tempered curry. Soak for ten minutes and cook as you would fresh.',
            ],
            [
                'slug' => 'dehydrated-bitter-gourd',
                'name' => 'Dehydrated Bitter Gourd',
                'category' => 'dehydrated-vegetables',
                'sku' => 'DRIO-BG-150',
                'price' => 1180,
                'grams' => 150,
                'stock' => 7,
                'short' => 'Karawila slices for a proper bitter curry.',
                'description' => 'Dried in thin rings, which tames the bitterness just enough while keeping the character that makes karawila worth cooking.',
            ],
            [
                'slug' => 'dehydrated-drumstick-leaves',
                'name' => 'Dehydrated Drumstick Leaves',
                'category' => 'dehydrated-vegetables',
                'sku' => 'DRIO-DL-100',
                'price' => 980,
                'grams' => 100,
                'stock' => 54,
                'short' => 'Murunga leaves for mallum and kola kanda.',
                'description' => 'Shade-dried to keep the colour, these go straight into a mallum with fresh coconut or into a morning kola kanda.',
            ],
            [
                'slug' => 'dehydrated-okra',
                'name' => 'Dehydrated Okra',
                'category' => 'dehydrated-vegetables',
                'sku' => 'DRIO-OK-150',
                'price' => 1080,
                'grams' => 150,
                'stock' => 41,
                'compare_at' => 1280,
                'short' => 'Bandakka rings, dried without losing their bite.',
                'description' => 'Cut into rings and dried quickly so they crisp in the pan rather than turning to slime. Good in a dry curry or fried with onion.',
            ],

            // ---- Curry powder ----
            [
                'slug' => 'unroasted-curry-powder',
                'name' => 'Unroasted Curry Powder',
                'category' => 'curry-powder',
                'sku' => 'DRIO-UC-100',
                'price' => 940,
                'grams' => 100,
                'stock' => 98,
                'short' => 'Pale, fragrant, and made for vegetable curries.',
                'description' => 'The same spices as the roasted blend, ground raw. Lighter in colour and far more floral — this is what a white potato or ash plantain curry wants.',
            ],
            [
                'slug' => 'jaffna-curry-powder',
                'name' => 'Jaffna Curry Powder',
                'category' => 'curry-powder',
                'sku' => 'DRIO-JC-100',
                'price' => 1120,
                'grams' => 100,
                'stock' => 44,
                'short' => 'Northern blend, heavier on chilli and fennel.',
                'description' => 'The northern style: hotter, with more fennel and a deep red colour. Traditionally the blend for crab and fish.',
            ],
            [
                'slug' => 'fish-curry-powder',
                'name' => 'Fish Curry Powder',
                'category' => 'curry-powder',
                'sku' => 'DRIO-FC-100',
                'price' => 1050,
                'grams' => 100,
                'stock' => 61,
                'vegetarian' => false,
                'short' => 'Built around fenugreek and goraka.',
                'description' => 'Fenugreek and black pepper forward, balanced for the sourness of goraka. Made for a slow-cooked ambul thiyal.',
            ],
            [
                'slug' => 'black-pepper-curry-blend',
                'name' => 'Black Pepper Curry Blend',
                'category' => 'curry-powder',
                'sku' => 'DRIO-BP-100',
                'price' => 1180,
                'grams' => 100,
                'stock' => 29,
                'short' => 'Hill-country pepper, coarsely ground.',
                'description' => 'Pepper from the hill country does the heavy lifting here, with just enough coriander to round it. Good on anything cooked dry.',
            ],

            // ---- Chilli powder ----
            [
                'slug' => 'kochchi-chilli-powder',
                'name' => 'Kochchi Chilli Powder',
                'category' => 'chilli-powder',
                'sku' => 'DRIO-KC-050',
                'price' => 1020,
                'grams' => 50,
                'stock' => 33,
                'short' => 'Serious heat. Use less than you think.',
                'description' => 'Ground from kochchi, the small island chilli that carries real heat. A quarter teaspoon changes a whole pot.',
            ],
            [
                'slug' => 'chilli-flakes',
                'name' => 'Chilli Flakes',
                'category' => 'chilli-powder',
                'sku' => 'DRIO-CF-100',
                'price' => 920,
                'grams' => 100,
                'stock' => 72,
                'short' => 'Coarse flakes for tempering and sambol.',
                'description' => 'Crushed rather than ground, so the seeds stay in and the heat arrives slowly. The right texture for a seeni sambol.',
            ],
            [
                'slug' => 'mild-chilli-powder',
                'name' => 'Mild Chilli Powder',
                'category' => 'chilli-powder',
                'sku' => 'DRIO-MC-100',
                'price' => 860,
                'grams' => 100,
                'stock' => 0,
                'short' => 'Colour and warmth without the burn.',
                'description' => 'For cooking that needs the deep red of Sri Lankan chilli without the heat. Good for children and for anyone easing in.',
            ],

            // ---- Traditional ingredients ----
            [
                'slug' => 'goraka',
                'name' => 'Goraka',
                'category' => 'traditional-ingredients',
                'sku' => 'DRIO-GO-100',
                'price' => 1150,
                'grams' => 100,
                'stock' => 52,
                'short' => 'The sour fruit behind ambul thiyal.',
                'description' => 'Dried garcinia, almost black, intensely sour. A few pieces will preserve and flavour a whole fish curry.',
            ],
            [
                'slug' => 'pandan-leaves-rampe',
                'name' => 'Pandan Leaves (Rampe)',
                'category' => 'traditional-ingredients',
                'sku' => 'DRIO-PL-030',
                'price' => 780,
                'grams' => 30,
                'stock' => 88,
                'short' => 'Rampe, for rice and for every curry base.',
                'description' => 'Dried in lengths so you can tear off what you need. Goes into the pot with the curry leaf and stays there.',
            ],
            [
                'slug' => 'curry-leaves',
                'name' => 'Curry Leaves',
                'category' => 'traditional-ingredients',
                'sku' => 'DRIO-CL-030',
                'price' => 720,
                'grams' => 30,
                'stock' => 4,
                'short' => 'Karapincha, shade-dried to keep the oil.',
                'description' => 'Shade-dried rather than sun-dried, which keeps the aromatic oil in the leaf. Bloom them in hot oil before anything else goes in.',
            ],
            [
                'slug' => 'maldive-fish-flakes',
                'name' => 'Maldive Fish Flakes',
                'category' => 'traditional-ingredients',
                'sku' => 'DRIO-MF-100',
                'price' => 1650,
                'grams' => 100,
                'stock' => 27,
                'vegetarian' => false,
                'short' => 'Umbalakada — the island\'s savoury backbone.',
                'description' => 'Cured, smoked and dried tuna, flaked. A spoonful gives a sambol or a curry the salt-and-smoke depth nothing else quite replaces.',
            ],
            [
                'slug' => 'cinnamon-quills',
                'name' => 'Cinnamon Quills',
                'category' => 'traditional-ingredients',
                'sku' => 'DRIO-CQ-050',
                'price' => 1380,
                'grams' => 50,
                'stock' => 46,
                'compare_at' => 1580,
                'short' => 'True Ceylon cinnamon, hand-rolled.',
                'description' => 'The real thing, not cassia — pale, papery and sweet rather than hot. Rolled by hand in the south where it has always been grown.',
            ],
            [
                'slug' => 'coconut-treacle',
                'name' => 'Coconut Treacle',
                'category' => 'traditional-ingredients',
                'sku' => 'DRIO-CT-250',
                'price' => 1480,
                'grams' => 250,
                'stock' => 18,
                'active' => false,
                'short' => 'Kithul treacle, dark and smoky.',
                'description' => 'Tapped from the kithul palm and reduced slowly. Poured over curd, or anywhere you would otherwise reach for honey.',
            ],
        ];
    }
}
