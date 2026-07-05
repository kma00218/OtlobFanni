---
name: Sibling fixed FABs overlapping each other
description: Multiple global fixed-position floating buttons at the same bottom offset can visually overlap and steal clicks from each other, not just from page content.
---

The otlob-fanni app has three global `position: fixed` buttons rendered on most routes: a centered "Install App" banner (near-full width, high z-index) and two corner buttons (Search, My Requests) at the same `bottom` offset. On narrow viewports the centered banner's content can extend far enough to overlap one of the corner buttons, and since it has a higher z-index it wins clicks — making the corner button appear "broken" with no error or visual clue.

**Why:** A previous memory (`fab-overlap-bottom-padding.md`) covered page content getting overlapped by these FABs, but sibling FAB-vs-FAB overlap is a distinct failure mode: it only shows up on real narrow phones, not always in wide desktop screenshots, and produces no console error — it silently misroutes taps to the wrong button.

**How to apply:** When adding or repositioning any global fixed FAB in this app, give it a distinct `bottom` offset from the other global FABs (don't just match existing ones) so their hit areas can't overlap regardless of viewport width or RTL/LTR side. Verify on a narrow (~375-400px) viewport, not just wide desktop.
