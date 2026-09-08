Add-Type -AssemblyName System.Drawing
$filePath = Join-Path (Get-Location) "images\profile.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($filePath)

function IsBg($c) {
    # Check if pixel is background (very bright and low saturation)
    return ($c.R -ge 232 -and $c.G -ge 232 -and $c.B -ge 235 -and [Math]::Abs($c.R - $c.G) -le 10 -and [Math]::Abs($c.R - $c.B) -le 12)
}

$testYs = @(100, 200, 300, 500, 700, 900)
foreach ($y in $testYs) {
    $firstNonBg = -1
    $lastNonBg = -1
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if (-not (IsBg $c)) {
            if ($firstNonBg -eq -1) { $firstNonBg = $x }
            $lastNonBg = $x
        }
    }
    Write-Output "Y=$y -> Subject spans from X=$firstNonBg to X=$lastNonBg (Width: $($lastNonBg - $firstNonBg))"
}
$bmp.Dispose()
