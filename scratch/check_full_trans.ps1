Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) "images\profile-cutout.png"))
$w = $bmp.Width
$h = $bmp.Height

$transCount = 0
$opaqueCount = 0
$semiCount = 0

for ($y = 0; $y -lt $h; $y += 5) {
    for ($x = 0; $x -lt $w; $x += 5) {
        $a = $bmp.GetPixel($x, $y).A
        if ($a -eq 0) { $transCount++ }
        elseif ($a -eq 255) { $opaqueCount++ }
        else { $semiCount++ }
    }
}
Write-Output "Total sampled: $($transCount + $opaqueCount + $semiCount)"
Write-Output "Transparent (A=0): $transCount ($([Math]::Round($transCount * 100 / ($transCount + $opaqueCount + $semiCount), 1))%)"
Write-Output "Opaque (A=255): $opaqueCount ($([Math]::Round($opaqueCount * 100 / ($transCount + $opaqueCount + $semiCount), 1))%)"
Write-Output "Feathered edge (0 < A < 255): $semiCount ($([Math]::Round($semiCount * 100 / ($transCount + $opaqueCount + $semiCount), 1))%)"

$bmp.Dispose()
