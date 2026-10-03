function Install-EvenHubAppUI {
    param([string[]]$InstallerArgs = @())

    $ErrorActionPreference = "Stop"
    $repo = "JustinasLa/evenhub-app-ui"
    $node = Get-Command node -ErrorAction SilentlyContinue

    if (-not $node) {
        Write-Error "evenhub-app-ui: Node.js 22.20.0 or newer is required."
        return
    }

    $nodeVersion = & node -p "process.versions.node"
    $versionParts = $nodeVersion.Split('.')
    if ([int]$versionParts[0] -lt 22 -or ([int]$versionParts[0] -eq 22 -and [int]$versionParts[1] -lt 20)) {
        Write-Error "evenhub-app-ui: Node.js 22.20.0 or newer is required; found $nodeVersion."
        return
    }

    if ($PSCommandPath) {
        $localInstaller = Join-Path (Split-Path -Parent $PSCommandPath) "bin\install.js"
        if (Test-Path -LiteralPath $localInstaller) {
            & node $localInstaller @InstallerArgs
            if ($LASTEXITCODE -ne 0) {
                throw "evenhub-app-ui: installer exited with status $LASTEXITCODE."
            }
            return
        }
    }

    $npx = Get-Command npx.cmd -ErrorAction SilentlyContinue
    if (-not $npx) {
        $npx = Get-Command npx -ErrorAction SilentlyContinue
    }
    if (-not $npx) {
        Write-Error "evenhub-app-ui: npx is required and normally ships with Node.js."
        return
    }

    & $npx.Source -y "github:$repo" @InstallerArgs
    if ($LASTEXITCODE -ne 0) {
        throw "evenhub-app-ui: installer exited with status $LASTEXITCODE."
    }
}

Install-EvenHubAppUI -InstallerArgs $args
