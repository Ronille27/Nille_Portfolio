Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) "images\profile.jpg"))
Write-Output "Pixels above hair (X=540, Y=10..180):"
for ($y = 10; $y -le 180; $y += 20) {
    $c = $bmp.GetPixel(540, $y)
    Write-Output "Y=$y -> R=$($c.R), G=$($c.G), B=$($c.B)"
}

Write-Output "Pixels at top border (X=100..900, Y=5):"
for ($x = 100; $x -le 900; $x += 100) {
    $c = $bmp.GetPixel($x, 5)
    Write-Output "X=$x, Y=5 -> R=$($c.R), G=$($c.G), B=$($c.B)"
}
$bmp.Dispose()
