# Kiss Translator

Kiss Translator 自定义翻译接口配置

## [百度翻译](baidu.js)

API 配置网站见[百度翻译 API-接入文档](https://fanyi-api.baidu.com/doc/21)

由于百度翻译需要使用 MD5 算法进行校验，因此在请求 Hook 中增加了 MD5 的实现。

翻译的网站填写：_https://fanyi-api.baidu.com/api/trans/vip/translate_
翻译的密钥填写格式为：`appid#key`。

## [智谱大模型](zhipu.js)

智谱大模型采用了其提供的`GLM-4.5-Flash`模型，免费使用，最大并发数为 2。

在智谱 AI 的[官网](bigmodel.cn)申请 API 即可。
