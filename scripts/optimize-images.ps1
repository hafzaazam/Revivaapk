#Requires -Version 5.1
<#
.SYNOPSIS
  Re-encodes oversized source images in place using .NET System.Drawing.

.DESCRIPTION
  The scroll-film frames are 3840x2160 JPEGs (~1.5-2 MB each, 235 MB total) even
  though the canvas is a full-viewport decorative backdrop masked by a radial
  gradient. Downscaling to 1600px wide at quality 72 keeps them visually
  indistinguishable in context while cutting the payload by roughly 12x.

  Public product/photo PNGs are re-encoded the same way. Product shots with an
  alpha channel (bottle-*.png, box.png) keep PNG; opaque photography becomes JPEG.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/optimize-images.ps1
#>
[CmdletBinding()]
param(
  [string]$Root,
  [int]$FrameMaxWidth = 1600,
  [long]$FrameMaxBytes = 400KB,
  [int]$FrameQuality = 72,
  [int]$StillMaxWidth = 1400,
  [int]$StillQuality = 78
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

# $PSScriptRoot is not populated inside a param() default, so resolve here.
if (-not $Root) {
  $Root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
}

function Save-Jpeg {
  param(
    [System.Drawing.Image]$Image,
    [string]$Path,
    [int]$Quality
  )
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
  $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
  $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality
  )
  $Image.Save($Path, $codec, $encoderParams)
}

# Swaps the freshly encoded temp file over the original, then clears the temp.
function Swap-InPlace {
  param([string]$Path)
  $tmp = "$Path.opt.tmp"
  [System.IO.File]::Delete($Path)
  [System.IO.File]::Move($tmp, $Path)
}

function Test-HasAlpha([string]$Path) {
  $img = [System.Drawing.Image]::FromFile($Path)
  try {
    return $img.PixelFormat.ToString() -match 'Alpha|PArgb'
  } finally { $img.Dispose() }
}

function Resize-Image {
  <#
    Decodes `Path`, downscales so width <= `MaxWidth` using high-quality
    bicubic, re-encodes as JPEG at `Quality`, and returns what changed.

    The source handle is released before the file is rewritten: GDI+ keeps an
    exclusive lock on the file it decoded from, so the swap has to happen
    after Dispose() or the delete fails with a sharing violation.
  #>
  param(
    [string]$Path,
    [int]$MaxWidth,
    [int]$Quality,
    [switch]$ForceJpeg,
    [long]$MinBytes = 0
  )

  $before = (Get-Item -LiteralPath $Path).Length

  $tmp = "$Path.opt.tmp"
  if ([System.IO.File]::Exists($tmp)) { [System.IO.File]::Delete($tmp) }

  $src = [System.Drawing.Image]::FromFile($Path)
  $bmp = $null
  try {
    $scale = 1.0
    if ($src.Width -gt $MaxWidth) { $scale = $MaxWidth / $src.Width }
    $w = [int][Math]::Max(1, [Math]::Round($src.Width * $scale))
    $h = [int][Math]::Max(1, [Math]::Round($src.Height * $scale))

    # Nothing to gain: small enough already and no re-encode requested.
    if ($w -eq $src.Width -and $MinBytes -gt 0 -and $before -le $MinBytes -and -not $ForceJpeg) {
      return [pscustomobject]@{ File = Split-Path -Leaf $Path; Before = $before; After = $before; Skipped = $true }
    }

    $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $bmp.SetResolution($src.HorizontalResolution, $src.VerticalResolution)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
      $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.DrawImage($src, 0, 0, $w, $h)
    } finally { $g.Dispose() }

    # Encode while the bitmap is still alive; the file swap waits for Dispose().
    Save-Jpeg -Image $bmp -Path $tmp -Quality $Quality
  } finally {
    if ($bmp) { $bmp.Dispose() }
    $src.Dispose()
  }

  Swap-InPlace -Path $Path

  $after = (Get-Item -LiteralPath $Path).Length
  return [pscustomobject]@{ File = Split-Path -Leaf $Path; Before = $before; After = $after; Skipped = $false }
}

$framesDir = Join-Path $Root 'src\assets\reviva'
$imagesDir = Join-Path $Root 'public\images'

$totalBefore = 0L
$totalAfter = 0L
$rows = @()

# --- 1. Scroll-film frames -------------------------------------------------
if (Test-Path -LiteralPath $framesDir) {
  $frames = Get-ChildItem -LiteralPath $framesDir -Filter '*.jpg' -File | Sort-Object Name
  Write-Host "Optimizing $($frames.Count) scroll-film frames..." -ForegroundColor Cyan
  $i = 0
  foreach ($f in $frames) {
    $i++
    $r = Resize-Image -Path $f.FullName -MaxWidth $FrameMaxWidth -Quality $FrameQuality -MinBytes $FrameMaxBytes
    $totalBefore += $r.Before; $totalAfter += $r.After
    if ($i % 25 -eq 0 -or $i -eq $frames.Count) {
      Write-Host ("  {0}/{1} frames" -f $i, $frames.Count)
    }
  }
}

# --- 2. Oversized public images ------------------------------------------
# Assets that rely on transparency stay PNG (alpha is only preserved for PNG
# here). Everything else is opaque photography and gets re-encoded to JPEG --
# including the ones that were mislabelled as .png, which are renamed to .jpg
# so the served Content-Type matches the actual bytes.
$keepPng = @('bottle-solo.png', 'bottle.png', 'product-bottle.png', 'box.png',
  'product-box.png', 'bottle-box.png', 'product-pack.png', 'product-hero.png',
  'favicon.png', 'apple-touch-icon.png')

if (Test-Path -LiteralPath $imagesDir) {
  $stills = Get-ChildItem -LiteralPath $imagesDir -File |
    Where-Object { $_.Extension -in '.png', '.jpg', '.jpeg' -and $_.Name -notin $keepPng } |
    Sort-Object Name
  Write-Host "Optimizing $($stills.Count) public images..." -ForegroundColor Cyan
  foreach ($f in $stills) {
    $r = Resize-Image -Path $f.FullName -MaxWidth $StillMaxWidth -Quality $StillQuality -ForceJpeg
    $totalBefore += $r.Before; $totalAfter += $r.After

    $note = ''
    if ($f.Extension -eq '.png') {
      # JPEG bytes under a .png name: rename so the CDN sends image/jpeg.
      $newPath = [System.IO.Path]::ChangeExtension($f.FullName, '.jpg')
      [System.IO.File]::Delete($newPath)
      [System.IO.File]::Move($f.FullName, $newPath)
      $note = '  (renamed .png -> .jpg, update references)'
    }
    if (-not $r.Skipped) {
      Write-Host ("  {0,-24} {1,7} KB -> {2,7} KB{3}" -f $r.File,
        [math]::Round($r.Before / 1KB), [math]::Round($r.After / 1KB), $note)
    }
  }
}

Write-Host ''
Write-Host ("Saved {0:N1} MB  ({1:N1} MB -> {2:N1} MB)" -f
  (($totalBefore - $totalAfter) / 1MB), ($totalBefore / 1MB), ($totalAfter / 1MB)) `
  -ForegroundColor Green
