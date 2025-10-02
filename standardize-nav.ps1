# Standardize navigation across all HTML files to match index.html exactly

$correctNav = @'
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

$files = Get-ChildItem -Path . -Filter "*.html" -Recurse | Where-Object { 
    $_.Name -notlike "*test*" -and 
    $_.Name -notlike "*admin*" -and 
    $_.FullName -notlike "*\gallery\*" -and
    $_.Name -ne "index.html"
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Find navigation section and replace with correct order
    # Pattern: starts after dropdown, ends before </nav>
    $pattern = '(?<=</div>\s*</div>\s*\n)\s*<a href="/events\.html">Events</a>.*?(?=\s*</nav>)'
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, $correctNav
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host "Standardized: $($file.FullName)"
    } else {
        Write-Host "Pattern not found in: $($file.FullName)"
    }
}

Write-Host "Navigation standardization complete."