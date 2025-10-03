Add your meeting minutes PDFs to this folder and update minutes.json to make them appear on the Minutes page.

Two options:
1) Quick: Manually edit minutes.json and add entries like:
	[
	  { "date": "2025-09-15", "title": "September 15, 2025 — Board Meeting", "file": "2025-09-15-board.pdf", "note": "Approved Oct 2025" }
	]
	Where "file" is the exact PDF filename placed in this folder.

2) Script: Use scripts/build-minutes-json.ps1 to auto-generate minutes.json from all PDFs here.
	- Requires PowerShell on Windows.
	- It detects YYYY-MM-DD in filenames for the date; otherwise uses file modified date.

After updating, commit and deploy.
Place approved meeting minutes PDFs here (e.g., 2025-09-01.pdf).