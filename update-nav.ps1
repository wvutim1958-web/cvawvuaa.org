# Update navigation across all HTML files to fix Calendar/News confusion and add Search + Newsletters

$files = Get-ChildItem -Path . -Filter "*.html" -Recurse | Where-Object { $_.Name -notlike "*test*" -and $_.Name -notlike "*admin*" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Update the navigation pattern - old navigation with "Calendar" pointing to news.html
    $oldNav = @'
      <a href="/events.html">Events</a>
      <a href="/scores.html">Scores</a>
      <a href="/resources.html">Resources</a>
      <a href="/programs.html">Programs</a>
      <a href="/scholarship.html">Scholarship</a>
      <a href="/media.html">Media</a>
      <a href="/news.html">Calendar</a>
      <button class="theme-toggle" aria-label="Toggle theme">
        <span class="theme-icon">🌙</span>
      </button>
'@

    $newNav = @'
      <a href="/events.html">Events</a>
      <a href="/news.html">News</a>
      <a href="/newsletters/">Newsletters</a>
      <a href="/scores.html">Scores</a>
      <a href="/resources.html">Resources</a>
      <a href="/programs.html">Programs</a>
      <a href="/scholarship.html">Scholarship</a>
      <a href="/media.html">Media</a>
      <a href="/search.html">🔍 Search</a>
      <button class="theme-toggle" aria-label="Toggle theme">
        <span class="theme-icon">🌙</span>
      </button>
'@

    if ($content -match [regex]::Escape($oldNav)) {
        $content = $content -replace [regex]::Escape($oldNav), $newNav
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Navigation update complete."