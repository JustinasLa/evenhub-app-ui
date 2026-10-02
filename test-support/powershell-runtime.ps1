$config = $env:EVENHUB_WRAPPER_TEST | ConvertFrom-Json
$global:EvenHubWrapperTest = $config

function Write-TestInvocation {
    param([string]$Command, [string[]]$Arguments)
    $record = @{ command = $Command; args = @($Arguments) } | ConvertTo-Json -Compress
    [IO.File]::AppendAllText($global:EvenHubWrapperTest.callsFile, $record + [Environment]::NewLine)
}

# Resolve only test doubles, so the wrapper can never install real skills.
function global:Get-Command {
    param([string]$Name, $ErrorAction)
    if ($Name -eq "node" -and $global:EvenHubWrapperTest.node) {
        return [PSCustomObject]@{ Source = "node" }
    }
    if ($Name -eq "npx.cmd" -and $global:EvenHubWrapperTest.npx -in @("cmd", "both")) {
        return [PSCustomObject]@{ Source = "Invoke-TestNpxCmd" }
    }
    if ($Name -eq "npx" -and $global:EvenHubWrapperTest.npx -in @("plain", "both")) {
        return [PSCustomObject]@{ Source = "Invoke-TestNpx" }
    }
}

function global:Test-Path {
    param([string]$LiteralPath)
    if ($global:EvenHubWrapperTest.local) {
        $expected = Join-Path (Split-Path -Parent $global:EvenHubWrapperTest.wrapper) "bin\install.js"
        if ($LiteralPath -ne $expected) { throw "unexpected local installer path: $LiteralPath" }
        return $true
    }
    return $false
}

function global:node {
    if ($args[0] -eq "-p") {
        if ($args[1] -ne "process.versions.node.split('.')[0]") { throw "unexpected version probe" }
        $global:LASTEXITCODE = 0
        return $global:EvenHubWrapperTest.major
    }
    Write-TestInvocation -Command "node" -Arguments $args
    $global:LASTEXITCODE = $global:EvenHubWrapperTest.status
}

function global:Invoke-TestNpxCmd {
    Write-TestInvocation -Command "npx.cmd" -Arguments $args
    $global:LASTEXITCODE = $global:EvenHubWrapperTest.status
}

function global:Invoke-TestNpx {
    Write-TestInvocation -Command "npx" -Arguments $args
    $global:LASTEXITCODE = $global:EvenHubWrapperTest.status
}

try {
    $installerArgs = @($config.args)
    if ($config.downloaded) {
        $source = [IO.File]::ReadAllText($config.wrapper)
        & ([ScriptBlock]::Create($source)) @installerArgs
    } else {
        & $config.wrapper @installerArgs
    }
    exit 0
} catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    exit 1
}
