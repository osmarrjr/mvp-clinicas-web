$projectMarker = "mvp-clinicas-web"
$killed = 0

Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Where-Object {
    $cmd = $_.CommandLine
    if (-not $cmd) { return $false }
    ($cmd -match 'next(\\.js)?\\dist|next dev|next start|next build') -or
    ($cmd -like "*$projectMarker*")
  } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    $killed++
  }

Write-Output $killed
