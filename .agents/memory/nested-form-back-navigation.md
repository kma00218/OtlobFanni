---
name: Nested form back navigation vs global app back
description: A sub-view's own "back" control must never be confused with a page's global/header back button, or users get sent out of the flow entirely.
---

A page with a persistent global header back button (browser/route history) and internal sub-views (e.g. a "landing" menu that leads to "new"/"track" forms) needs two functionally distinct back affordances:

- The global header back button navigates *out* of the whole page/route (history.back()).
- Each internal sub-view needs its own local back control that only resets internal view state back to the sub-menu, not the browser history.

**Why:** Users cannot tell these apart if the local back control is a plain text link ("‹ رجوع") that looks similar to, or is positioned near, the global header's back button. They end up leaving the entire flow by accident and lose their place.

**How to apply:** Give the local/internal back button a visually distinct treatment (e.g. a circular icon button inside a card, next to the sub-view's own title) so it reads as "go back one level in this feature," clearly separate from the app-wide back button in the header.
