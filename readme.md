## Content & Engagement Features

### RSVPs
- Page: `events/rsvp.html`
- Delivery: Uses FormSubmit to email the chapter inbox (`president@cvawvuaa.org`).
- Local capture: Saved in browser localStorage for quick admin review.
- Admin view: Append `?admin=1` to the RSVP URL to see a table of local entries.
- Export/Import: Buttons to export JSON or CSV; import a JSON file to restore.

### Gallery by Year
- Data: `content/gallery.json`
- Page: `/gallery/` with a year dropdown and quick year links.
- Derives year from `date`, `year`, or from the path like `/assets/gallery/2025/...`.
- Per-year pages: e.g., `/gallery/2025/` redirects to `?year=2025`.

### Scholarship Recipients
- Data: `content/scholarship-recipients.json` (array of {year, name, program, hometown, blurb, photo}).
- Rendered on `/scholarship.html` under "Recent Scholarship Recipients".

### Newsletter Archive
- Data: `newsletters/posts.json` (array of {date, title, url, attachment, summary}).
- Page: `/newsletters/` renders posts from the JSON.

## How to Update
- Add gallery items by editing `content/gallery.json` and putting images under `/assets/gallery/YYYY/...`.
- Add scholarship recipients by editing `content/scholarship-recipients.json`.
- Add newsletter items by editing `newsletters/posts.json` and placing detail pages/attachments as linked.
- Manage RSVPs from the browser: export CSV/JSON for records.

# cvawvuaa
Central Virginia Chapter of WVU Alumni
