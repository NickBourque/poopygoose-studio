# Local preview server for the site and the dev tools (Windows PowerShell 5.1+).
#   powershell -ExecutionPolicy Bypass -File tools\serve.ps1
# then open http://localhost:8765/site/
# Serves the repo root over HTTP. The dev pages in tools/ also save their output through it:
# a PUT to /some/path.png writes the request body to that file. Local use only.
param([int]$Port = 8765)

$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css'; '.js' = 'text/javascript'; '.json' = 'application/json'
  '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.webp' = 'image/webp'; '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'
  '.mp4' = 'video/mp4'; '.webm' = 'video/webm'; '.glb' = 'model/gltf-binary'; '.webmanifest' = 'application/manifest+json'
  '.md' = 'text/markdown; charset=utf-8'
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root on http://localhost:$Port/ (Ctrl+C to stop)"
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext(); $req = $ctx.Request; $res = $ctx.Response
    try {
      $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
      $path = [IO.Path]::GetFullPath((Join-Path $Root $rel))
      if (-not $path.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) { $res.StatusCode = 403; continue }
      if ($req.HttpMethod -eq 'PUT') {
        New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
        $out = [IO.File]::Create($path); $req.InputStream.CopyTo($out); $out.Close()
        $res.StatusCode = 201
      } else {
        if (Test-Path $path -PathType Container) { $path = Join-Path $path 'index.html' }
        if (Test-Path $path -PathType Leaf) {
          $ext = [IO.Path]::GetExtension($path).ToLower()
          $res.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
          $res.Headers.Add('Cache-Control', 'no-store')
          $bytes = [IO.File]::ReadAllBytes($path); $res.ContentLength64 = $bytes.Length
          $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else { $res.StatusCode = 404 }
      }
    } catch { $res.StatusCode = 500 } finally { $res.Close() }
  }
} finally { $listener.Stop() }
