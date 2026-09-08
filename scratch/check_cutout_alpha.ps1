Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) "images\profile-cutout.png"))
Write-Output "Alpha check on images/profile-cutout.png:"
Write-Output "(10, 10): A=$($bmp.GetPixel(10, 10).A)"
Write-Output "(540, 50): A=$($bmp.GetPixel(540, 50).A)"
Write-Output "(540, 100): A=$($bmp.GetPixel(540, 100).A)"
Write-Output "(540, 300 - face): A=$($bmp.GetPixel(540, 300).A)"
$bmp.Dispose()
