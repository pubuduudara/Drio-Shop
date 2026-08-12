---
paths:
  - app/Support/CartManager.php
  - app/Support/OrderTotals.php
---

# Support

## The guest cart is keyed by its own cookie, not the session id
`carts.session_id` holds the value of the `drio_cart` cookie, never `sessions.id`. The column keeps the name §6 gave it; what it stores is a 40-char random token issued by CartManager.

Two reasons this is not the session id: a session expires in hours and regenerates on login, and a basket filled last night should still be there this morning. It also means `AdoptGuestCart` does not have to run before Fortify regenerates the session.

The cookie is in the `encryptCookies(except:)` list in bootstrap/app.php — it is an opaque id that identifies no one, and tests need to read it back.

Feature tests must call the `withGuestCart()` helper in tests/Pest.php: the Laravel test client does not feed response cookies into the next request, so a guest cart otherwise starts empty on every call.

## One calculator owns shipping and totals
Never recompute shipping or a total anywhere else. `App\Support\OrderTotals` is the only thing that knows the rules, and the drawer, the cart page, the checkout review step and `PlaceOrder` all read it — a total the customer agreed to differing from the total charged arrives as a chargeback.

Two settled decisions inside it:
- An empty basket ships for nothing, so a ¥0 cart never reads as owing ¥600 postage.
- `taxMinor` is 0 by design, not by omission. Japanese retail prices are quoted tax-inclusive, so consumption tax is already inside `price_minor`. Breaking it out needs the client's confirmed tax treatment and registration number; inventing a rate would put a wrong figure on a receipt.

`PlaceOrder` prices from the locked product rows, never from `cart_items.unit_price_minor` — that is a working value that may be minutes old.
