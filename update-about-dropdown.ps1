# PowerShell script to update "About Us" to "About" across all HTML files
$files = Get-ChildItem -Path . -Include "*.html" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace button text
    $content = $content -replace 'About Us</button>', 'About</button>'
    
    # Replace aria-label
    $content = $content -replace 'aria-label="About Us"', 'aria-label="About"'
    
    # Replace comments
    $content = $content -replace '// Mobile: tap to open About Us dropdown', '// Mobile: tap to open About dropdown'
    
    # Only write if changes were made
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Done updating About dropdown across all files."