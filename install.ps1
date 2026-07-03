function Install-EvenHubAppUI {
    param([string[]]$InstallerArgs = @())

    $ErrorActionPreference = "Stop"
    $repo = "JustinasLa/evenhub-app-ui"
    $node = Get-Command node -ErrorAction SilentlyContinue

    if (-not $node) {
        Write-Error "evenhub-app-ui: Node.js 18 or newer is required."
        return
    }

    $nodeMajor = [int](& node -p "process.versions.node.split('.')[0]")
    if ($nodeMajor -lt 18) {
        Write-Error "evenhub-app-ui: Node.js 18 or newer is required; found $nodeMajor."
        return
    }

    if ($PSCommandPath) {
        $localInstaller = Join-Path (Split-Path -Parent $PSCommandPath) "bin\install.js"
        if (Test-Path -LiteralPath $localInstaller) {
            & node $localInstaller @InstallerArgs
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
}

Install-EvenHubAppUI -InstallerArgs $args
