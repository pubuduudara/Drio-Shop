<?php

declare(strict_types=1);

/*
 * Server-side storefront strings (§9.3). Anything Laravel renders or returns —
 * validation summaries, mail, flash messages — belongs here rather than in a
 * controller string literal.
 */

return [

    'tokens' => [
        'server_string' => 'This line was translated on the server, in :locale.',
    ],

    'cart' => [
        'out_of_stock' => 'That product just sold out. Try another size or check back shortly.',
        'stock_limited' => 'Only :count left, so that is what we put in your cart.',
    ],

    'checkout' => [
        'postal_code_format' => 'Enter a postal code as 7 digits, like 150-0001.',
        'cart_empty' => 'Your cart emptied before the order went through. Add something and try again.',
        'unavailable' => 'One of those products is no longer on sale. Remove it and try again.',
        'insufficient_stock' => 'Someone got there first — there is no longer enough stock for one of your lines.',
    ],

    'contact' => [
        'name_required' => 'Enter your name.',
        'email_required' => 'Enter an email address so we can reply.',
        'email_invalid' => 'Enter a valid email address.',
        'subject_required' => 'Add a subject.',
        'message_required' => 'Write your message.',
        'message_short' => 'Add a little more detail — at least ten characters.',
    ],

    'newsletter' => [
        'subscribed' => 'You are on the list. Watch your inbox for the next dispatch.',
        'already_subscribed' => 'That address is already subscribed.',
        'email_required' => 'Enter an email address.',
        'email_invalid' => 'Enter a valid email address.',
    ],

];
