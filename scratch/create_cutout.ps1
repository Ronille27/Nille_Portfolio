Add-Type -AssemblyName System.Drawing

$inputPath = Join-Path (Get-Location) "images\profile.jpg"
$outputPath = Join-Path (Get-Location) "images\profile-cutout.png"

Write-Output "Loading: $inputPath"
$srcBmp = [System.Drawing.Bitmap]::FromFile($inputPath)
$w = $srcBmp.Width
$h = $srcBmp.Height

# Create output ARGB bitmap
$outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Lock bits for fast memory processing
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$srcData = $srcBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$outData = $outBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$stride = $srcData.Stride
$bytesTotal = $stride * $h

$srcBytes = New-Object byte[] $bytesTotal
$outBytes = New-Object byte[] $bytesTotal

[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $bytesTotal)
$srcBmp.UnlockBits($srcData)

# Array to track background pixels: 0 = unvisited, 1 = background, 2 = subject
$bgMask = New-Object byte[] ($w * $h)

function IsBgPixel($b, $g, $r) {
    # Neutral bright studio background check
    if ($r -ge 225 -and $g -ge 225 -and $b -ge 225) {
        $rgDiff = [Math]::Abs($r - $g)
        $rbDiff = [Math]::Abs($r - $b)
        $gbDiff = [Math]::Abs($g - $b)
        # Background is neutral white (low chroma), shirt has warm chroma (r - b > 14)
        if ($rgDiff -le 8 -and $rbDiff -le 10 -and $gbDiff -le 8) {
            return $true
        }
    }
    return $false
}

Write-Output "Running boundary-seeded flood fill..."
# BFS Queue
$queue = New-Object System.Collections.Generic.Queue[int]

# Seed from top border, left border, and right border
for ($x = 0; $x -lt $w; $x++) {
    $idx = $x
    $byteIdx = $idx * 4
    if (IsBgPixel $srcBytes[$byteIdx] $srcBytes[$byteIdx+1] $srcBytes[$byteIdx+2]) {
        $bgMask[$idx] = 1
        $queue.Enqueue($idx)
    }
}

for ($y = 1; $y -lt $h; $y++) {
    # Left border
    $leftIdx = $y * $w
    $leftByte = $leftIdx * 4
    if (IsBgPixel $srcBytes[$leftByte] $srcBytes[$leftByte+1] $srcBytes[$leftByte+2]) {
        if ($bgMask[$leftIdx] -eq 0) {
            $bgMask[$leftIdx] = 1
            $queue.Enqueue($leftIdx)
        }
    }
    
    # Right border
    $rightIdx = $y * $w + ($w - 1)
    $rightByte = $rightIdx * 4
    if (IsBgPixel $srcBytes[$rightByte] $srcBytes[$rightByte+1] $srcBytes[$rightByte+2]) {
        if ($bgMask[$rightIdx] -eq 0) {
            $bgMask[$rightIdx] = 1
            $queue.Enqueue($rightIdx)
        }
    }
}

# BFS flood fill
while ($queue.Count -gt 0) {
    $curr = $queue.Dequeue()
    $cx = $curr % $w
    $cy = [Math]::Floor($curr / $w)
    
    # 4-connectivity neighbors
    $neighbors = @(
        @($cx - 1, $cy),
        @($cx + 1, $cy),
        @($cx, $cy - 1),
        @($cx, $cy + 1)
    )
    
    foreach ($n in $neighbors) {
        $nx = $n[0]
        $ny = $n[1]
        if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
            $nIdx = $ny * $w + $nx
            if ($bgMask[$nIdx] -eq 0) {
                $nByte = $nIdx * 4
                $nb = $srcBytes[$nByte]
                $ng = $srcBytes[$nByte+1]
                $nr = $srcBytes[$nByte+2]
                if (IsBgPixel $nb $ng $nr) {
                    $bgMask[$nIdx] = 1
                    $queue.Enqueue($nIdx)
                }
            }
        }
    }
}

Write-Output "Applying alpha matte and contour anti-aliasing..."
# Copy pixels with alpha channel
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $idx = $y * $w + $x
        $byteIdx = $idx * 4
        
        $b = $srcBytes[$byteIdx]
        $g = $srcBytes[$byteIdx+1]
        $r = $srcBytes[$byteIdx+2]
        
        if ($bgMask[$idx] -eq 1) {
            # Background -> Fully transparent
            $outBytes[$byteIdx] = 0
            $outBytes[$byteIdx+1] = 0
            $outBytes[$byteIdx+2] = 0
            $outBytes[$byteIdx+3] = 0
        } else {
            # Subject pixel -> Check if neighbor is background for smooth edge anti-aliasing
            $bgNeighbors = 0
            for ($dy = -1; $dy -le 1; $dy++) {
                for ($dx = -1; $dx -le 1; $dx++) {
                    $ex = $x + $dx
                    $ey = $y + $dy
                    if ($ex -ge 0 -and $ex -lt $w -and $ey -ge 0 -and $ey -lt $h) {
                        if ($bgMask[$ey * $w + $ex] -eq 1) {
                            $bgNeighbors++
                        }
                    }
                }
            }
            
            $alpha = 255
            if ($bgNeighbors -gt 0) {
                # Edge pixel -> feather slightly
                $alpha = [byte][Math]::Round(255 * (1.0 - ($bgNeighbors / 12.0)))
                if ($alpha -lt 40) { $alpha = 40 }
            }
            
            $outBytes[$byteIdx] = $b
            $outBytes[$byteIdx+1] = $g
            $outBytes[$byteIdx+2] = $r
            $outBytes[$byteIdx+3] = $alpha
        }
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($outBytes, 0, $outData.Scan0, $bytesTotal)
$outBmp.UnlockBits($outData)

Write-Output "Saving transparent PNG to: $outputPath"
$outBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$srcBmp.Dispose()
$outBmp.Dispose()

Write-Output "Done! File size: $((Get-Item $outputPath).Length) bytes"
