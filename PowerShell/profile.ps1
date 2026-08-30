# ===============================
# PowerShell 7 Profile
# ===============================

# 定义代理服务器地址和端口 (请根据实际情况修改)
$Global:ProxyAddress = "http://example.com:port"  # 替换为实际的代理地址和端口

# 开启代理函数
function proxyon {
    # 设置环境变量 (影响当前会话及启动的子进程)
    $env:HTTP_PROXY = $Global:ProxyAddress
    $env:HTTPS_PROXY = $Global:ProxyAddress
    $env:ALL_PROXY = $Global:ProxyAddress

    Write-Host "Proxy enabled: $Global:ProxyAddress"
}

# 关闭代理函数
function proxyoff {
    # 清除环境变量
    $env:HTTP_PROXY = $null
    $env:HTTPS_PROXY = $null
    $env:ALL_PROXY = $null

    Write-Host "Proxy disabled."
}

# 默认编辑器 VS Code
if (Get-Command code -ErrorAction SilentlyContinue) {
	$env:EDITOR = "code --wait"
}
