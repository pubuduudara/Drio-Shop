---
paths:
  - app/Http/Controllers/Admin/ProductMediaController.php
---

# Admin

## The primary image is a copy that remembers its gallery row
`primary` is a single-file collection holding a *copy* of a `gallery` row, not a move — a product's main shot is usually also a gallery shot. The copy carries a `source_media_id` custom property naming the gallery row it came from.

Identify the primary by that id, never by `file_name`. Two uploads can share a name, and matching on one marks the wrong tile in the Media tab and clears the wrong copy on delete.

Because the copy is its own row, deleting a gallery tile must also handle its primary: `destroy()` clears the collection and promotes the next gallery image. Without that the tab shows an empty gallery while the storefront card keeps rendering a deleted photograph — that state existed in the dev database and is what the fix was written against.

Uploaded media needs `php artisan storage:link`; `public/storage` is gitignored, so composer's `setup` and `post-autoload-dump` both run it now.
