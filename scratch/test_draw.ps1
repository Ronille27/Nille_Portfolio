Add-Type -AssemblyName System.Drawing
$filePath = Join-Path (Get-Location) "images\profile.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($filePath)
Write-Output "Loaded bitmap: $($bmp.Width) x $($bmp.Height)"
$pixel = $bmp.GetPixel(10, 10)
Write-Output "Top-left pixel: R=$($pixel.R), G=$($pixel.G), B=$($pixel.B)"
$bmp.Dispose()
