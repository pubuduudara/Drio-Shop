---
paths:
  - 'app/Models/**'
---

# Models

## Media-owning models eager-load media
Product, Category, Recipe, Review and HeroSlide all declare `protected $with = ['media']`. Do not remove it, and add it to any new model whose resource calls `MediaPresenter`.

`MediaPresenter` reaches for media inside the resource, and Spatie's `getMedia()` lazy-loads the relation when it is not already there — so without this every card in a grid costs its own query. Measured before the fix: the shop page went 10 → 19 queries when the catalogue went 3 → 12 products; the homepage sat at 19. After: shop is 9 at any size, homepage 6.

Doing it on the model rather than at each call site is deliberate — a new listing page cannot reintroduce the N+1 by forgetting to ask for it. tests/Feature/QueryBudgetTest.php doubles the row count and asserts the query count does not move; that is the tripwire.
