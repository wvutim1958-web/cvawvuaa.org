# Build minutes.json from PDFs in assets/minutes
# Usage: Run from repo root or adjust $root accordingly
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$minutesDir = Join-Path $root 'assets/minutes'
$outFile = Join-Path $minutesDir 'minutes.json'

if(!(Test-Path $minutesDir)){
  Write-Error "Minutes folder not found: $minutesDir"
}

$items = @()
Get-ChildItem -Path $minutesDir -Filter *.pdf | ForEach-Object {
  $file = $_.Name
  $full = $_.FullName
  # Try to parse YYYY-MM-DD in filename
  $dateMatch = [regex]::Match($file, '(\d{4})[-_](\d{2})[-_](\d{2})')
  if($dateMatch.Success){
    $date = "$($dateMatch.Groups[1].Value)-$($dateMatch.Groups[2].Value)-$($dateMatch.Groups[3].Value)"
  } else {
    $date = $_.LastWriteTime.ToString('yyyy-MM-dd')
  }
  $titleBase = [System.IO.Path]::GetFileNameWithoutExtension($file)
  $title = $titleBase -replace '[-_]', ' '
  $items += [pscustomobject]@{
    date = $date
    title = $title
    file = $file
  }
}

# sort newest first
$items = $items | Sort-Object -Property date -Descending

# emit JSON with UTF8 no BOM
$json = $items | ConvertTo-Json -Depth 3
[System.IO.File]::WriteAllText($outFile, $json, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Wrote $outFile with $($items.Count) item(s)."