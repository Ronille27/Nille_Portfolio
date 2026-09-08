Add-Type -AssemblyName System.Drawing
$filePath = Join-Path (Get-Location) "images\profile.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($filePath)
Write-Output "Image size: $($bmp.Width) x $($bmp.Height)"

$samples = @(
  @(0, 0), @(512, 0), @(1023, 0),
  @(0, 200), @(1023, 200),
  @(0, 500), @(1023, 500),
  @(0, 700), @(1023, 700),
  @(0, 900), @(1023, 900)
)

foreach ($s in $samples) {
  $x = $s[0]
  $y = $s[1]
  $c = $bmp.GetPixel($x, $y)
  Write-Output "Point ($x, $y): R=$($c.R), G=$($c.G), B=$($c.B)"
}
$bmp.Dispose()
