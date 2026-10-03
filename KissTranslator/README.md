# Kiss Translator

Kiss Translator 自定义翻译接口配置

## [百度翻译](baidu.js)

API 配置网站见[百度翻译 API-接入文档](https://fanyi-api.baidu.com/doc/21)

- 翻译的网站填写：_https://fanyi-api.baidu.com/api/trans/vip/translate_
- 翻译的密钥填写格式为：`appid#key`

百度翻译需要使用 MD5 算法对请求进行签名校验，请求 Hook 中包含完整的自研实现，不依赖任何全局函数：

- MD5 基于 UTF-8 字节数组实现，可正确处理中文、emoji 等多字节字符；
- 使用自写的 percentEncode（RFC 3986，大写十六进制）代替 encodeURIComponent；
- 兼容 KISS Translator 在 Firefox 中的 sval 沙盒（Xray 包装会剥离部分全局函数，如 `String.fromCharCode`、`encodeURIComponent`、`Math` 静态方法等）。

响应 Hook 会将百度常见错误码（52001 超时、54003 频率受限、54004 余额不足、58000 IP 白名单等）转换为可读的中文提示，便于排查配置问题。
