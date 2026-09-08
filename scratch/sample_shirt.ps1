Add-Type -AssemblyName System.Drawing
$filePath = Join-Path (Get-Location) "images\profile.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($filePath)

Write-Output "Sampling shirt pixels at Y=850:"
for ($x = 300; $x -le 700; $x += 50) {
    $c = $bmp.GetPixel($x, 850)
    Write-Output "Shirt ($x, 850): R=$($c.R), G=$($c.G), B=$($c.B)"
}
$bmp.Dispose()
