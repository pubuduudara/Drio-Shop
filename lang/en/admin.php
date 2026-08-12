<?php

declare(strict_types=1);

/*
 * Server-side admin strings (§9.3).
 *
 * Toasts, validation overrides and attribute labels — anything Laravel puts
 * into a response rather than React rendering — lives here. Interface chrome
 * lives in resources/js/locales/en/admin.json.
 *
 * Feedback uses the same verb as the button that caused it: "Save changes"
 * answers with "Changes saved" (§8).
 */

return [

    'toast' => [
        'saved' => 'Changes saved',
    ],

    'fields' => [
        'name' => 'name',
        'short_description' => 'short description',
        'description' => 'description',
        'title' => 'title',
        'intro' => 'intro',
        'ingredients' => 'ingredients',
        'steps' => 'method',
        'body' => 'review body',
        'headline' => 'headline',
        'subhead' => 'subhead',
        'primary_cta' => 'primary button label',
        'secondary_cta' => 'secondary button label',
    ],

    'validation' => [
        'compare_at_price' => 'The compare-at price must be higher than the price, or empty.',
        'relative_href' => 'Use an app path starting with a slash, like /shop.',
    ],

    'products' => [
        'created' => ':name created',
        'deleted' => ':name deleted',
        'quick_saved' => ':name updated',
        'bulk' => [
            'activate' => '{0} No products activated|{1} 1 product activated|[2,*] :count products activated',
            'deactivate' => '{0} No products deactivated|{1} 1 product deactivated|[2,*] :count products deactivated',
            'delete' => '{0} No products deleted|{1} 1 product deleted|[2,*] :count products deleted',
        ],
        'media' => [
            'uploaded' => '{1} Image uploaded|[2,*] :count images uploaded',
            'deleted' => 'Image deleted',
        ],
    ],

    'orders' => [
        'invalid_transition' => 'An order cannot move from :from to :to.',
        'status_saved' => 'Moved to :status',
        'packing_slip' => 'Packing slip',
        'print' => 'Print this slip',
        'tagline' => 'Sri Lankan Flavours',
        'ship_to' => 'Ship to',
        'contact' => 'Contact',
        'status' => 'Status',
        'item' => 'Item',
        'quantity' => 'Qty',
        'unit_price' => 'Unit price',
        'line_total' => 'Line total',
        'subtotal' => 'Subtotal',
        'shipping' => 'Shipping',
        'total' => 'Total',
        'notes' => 'Notes',
        'slip_footer' => 'Thank you for cooking with DRIO.',
    ],

    'recipes' => [
        'created' => ':name created',
        'deleted' => ':name deleted',
    ],

    'reviews' => [
        'moderated' => 'Review updated',
        'deleted' => 'Review from :name deleted',
    ],

    'heroSlides' => [
        'created' => 'Slide created',
        'deleted' => 'Slide deleted',
        'reordered' => 'Order saved',
    ],

    'categories' => [
        'created' => ':name created',
        'deleted' => ':name deleted',
        'reordered' => 'Order saved',
        'has_products' => 'Move or delete this category\'s products first — deleting it would take them with it.',
    ],

];
