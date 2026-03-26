# ===============================
# PowerShell 7 Profile
# ===============================

# 代理
$env:HTTP_PROXY  = "http://example.com:port"
$env:HTTPS_PROXY = "http://example.com:port"
$env:NO_PROXY    = "localhost,127.0.0.1,::1"
$env:http_proxy  = $env:HTTP_PROXY
$env:https_proxy = $env:HTTPS_PROXY
$env:no_proxy    = $env:NO_PROXY

# 默认编辑器 VS Code
if (Get-Command code -ErrorAction SilentlyContinue) {
	$env:EDITOR = "code --wait"
}

# 路径移动快捷方式
function .. { Set-Location .. }
function ... { Set-Location ../.. }
function .... { Set-Location ../../.. }
