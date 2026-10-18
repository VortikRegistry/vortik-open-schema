# Public link previews

Home, proposal search and the curated explorer declare Open Graph image metadata
and an X large-image card. Page-specific titles, descriptions and canonical URLs
remain distinct. The shared artwork describes the reference as a whole and has
no proposal counts, protocol schedules or service-health claims that can expire.

## Assets

- `assets/social-preview.svg` is the editable source, using the existing Vortik
  mark, site colors and typography.
- `assets/social-preview.png` is the 1200 × 630 raster export used by crawlers.
- Both are static public assets. No tracker, remote font or new runtime is added.
- The Pages workflow compares both published files against its validated artifact.

The PNG can be regenerated with an SVG renderer using DejaVu Sans. Check the
result visually and verify its dimensions before committing a changed export.
Do not substitute an SVG URL for the crawler-facing PNG metadata.

The metadata describes the site independently of the visitor's query or selected
comparison. A valid published image does not prove that a social platform has
refreshed its cached preview. No social post or external message is sent by this
implementation.

Protocol reference: <https://ogp.me/>.
