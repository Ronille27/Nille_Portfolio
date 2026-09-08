Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class BackgroundRemover
{
    private static bool IsBg(byte b, byte g, byte r)
    {
        if (r >= 222 && g >= 222 && b >= 222)
        {
            int rg = Math.Abs(r - g);
            int rb = Math.Abs(r - b);
            int gb = Math.Abs(g - b);
            if (rg <= 8 && rb <= 12 && gb <= 8 && (r - b) < 14)
            {
                return true;
            }
        }
        return false;
    }

    public static void Process(string inputPath, string outputPath)
    {
        using (Bitmap src = new Bitmap(inputPath))
        {
            int w = src.Width;
            int h = src.Height;
            using (Bitmap dest = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                Rectangle rect = new Rectangle(0, 0, w, h);
                BitmapData srcData = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                BitmapData destData = dest.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

                int stride = srcData.Stride;
                int bytesTotal = stride * h;

                byte[] srcBytes = new byte[bytesTotal];
                byte[] destBytes = new byte[bytesTotal];

                Marshal.Copy(srcData.Scan0, srcBytes, 0, bytesTotal);

                byte[] bgMask = new byte[w * h];
                Queue<int> queue = new Queue<int>();

                // Seed top edge
                for (int x = 0; x < w; x++)
                {
                    int p = x * 4;
                    if (IsBg(srcBytes[p], srcBytes[p + 1], srcBytes[p + 2]))
                    {
                        bgMask[x] = 1;
                        queue.Enqueue(x);
                    }
                }

                // Seed left and right edges
                for (int y = 1; y < h; y++)
                {
                    int lIdx = y * w;
                    int lp = lIdx * 4;
                    if (bgMask[lIdx] == 0 && IsBg(srcBytes[lp], srcBytes[lp + 1], srcBytes[lp + 2]))
                    {
                        bgMask[lIdx] = 1;
                        queue.Enqueue(lIdx);
                    }

                    int rIdx = y * w + (w - 1);
                    int rp = rIdx * 4;
                    if (bgMask[rIdx] == 0 && IsBg(srcBytes[rp], srcBytes[rp + 1], srcBytes[rp + 2]))
                    {
                        bgMask[rIdx] = 1;
                        queue.Enqueue(rIdx);
                    }
                }

                // BFS Flood Fill
                int[] dx = new int[] { -1, 1, 0, 0 };
                int[] dy = new int[] { 0, 0, -1, 1 };

                while (queue.Count > 0)
                {
                    int curr = queue.Dequeue();
                    int cx = curr % w;
                    int cy = curr / w;

                    for (int i = 0; i < 4; i++)
                    {
                        int nx = cx + dx[i];
                        int ny = cy + dy[i];

                        if (nx >= 0 && nx < w && ny >= 0 && ny < h)
                        {
                            int nIdx = ny * w + nx;
                            if (bgMask[nIdx] == 0)
                            {
                                int np = nIdx * 4;
                                if (IsBg(srcBytes[np], srcBytes[np + 1], srcBytes[np + 2]))
                                {
                                    bgMask[nIdx] = 1;
                                    queue.Enqueue(nIdx);
                                }
                            }
                        }
                    }
                }

                // Apply alpha channel & boundary anti-aliasing
                for (int y = 0; y < h; y++)
                {
                    for (int x = 0; x < w; x++)
                    {
                        int idx = y * w + x;
                        int p = idx * 4;

                        if (bgMask[idx] == 1)
                        {
                            destBytes[p] = 0;
                            destBytes[p + 1] = 0;
                            destBytes[p + 2] = 0;
                            destBytes[p + 3] = 0;
                        }
                        else
                        {
                            int bgNeighbors = 0;
                            for (int ey = Math.Max(0, y - 1); ey <= Math.Min(h - 1, y + 1); ey++)
                            {
                                for (int ex = Math.Max(0, x - 1); ex <= Math.Min(w - 1, x + 1); ex++)
                                {
                                    if (bgMask[ey * w + ex] == 1) bgNeighbors++;
                                }
                            }

                            byte alpha = 255;
                            if (bgNeighbors > 0)
                            {
                                alpha = (byte)Math.Max(50, Math.Round(255.0 * (1.0 - (bgNeighbors / 12.0))));
                            }

                            destBytes[p] = srcBytes[p];
                            destBytes[p + 1] = srcBytes[p + 1];
                            destBytes[p + 2] = srcBytes[p + 2];
                            destBytes[p + 3] = alpha;
                        }
                    }
                }

                Marshal.Copy(destBytes, 0, destData.Scan0, bytesTotal);

                src.UnlockBits(srcData);
                dest.UnlockBits(destData);

                dest.Save(outputPath, ImageFormat.Png);
            }
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

$inPath = Join-Path (Get-Location) "images\profile.jpg"
$outPath = Join-Path (Get-Location) "images\profile-cutout.png"

Write-Output "Running BackgroundRemover in C#..."
$sw = [System.Diagnostics.Stopwatch]::StartNew()
[BackgroundRemover]::Process($inPath, $outPath)
$sw.Stop()

Write-Output "Complete in $($sw.ElapsedMilliseconds) ms!"
Write-Output "Output size: $((Get-Item $outPath).Length) bytes"
