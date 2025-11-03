# Clash 内核 Match 规则日志检测工具

## 概述

这是一个专门用于检测 Clash 内核 match 规则的日志分析工具。它可以扫描指定文件夹下的所有日志文件，识别包含 `match Match` 关键词的行，并从中提取匹配的网址。

## 功能特性

- 🔍 **智能关键词匹配**: 专门识别 `match Match` 规则行
- 🌐 **多种网址格式支持**: 支持 HTTP/HTTPS 和域名格式
- 📁 **批量文件处理**: 自动扫描目录下所有日志文件
- 📝 **结构化输出**: 生成格式化的结果文件
- 🚀 **简单易用**: 支持命令行参数和默认配置

## 使用方法

### 基本用法

```bash
# 使用默认配置
python3 clash_match_log_analyzer.py

# 指定日志目录
python3 clash_match_log_analyzer.py /path/to/log/directory

# 指定日志目录和输出文件
python3 clash_match_log_analyzer.py /path/to/log/directory /path/to/output.txt
```

### 默认配置

- **日志目录**: `.`
- **输出文件**: `./matched_urls.txt`

## 输入格式

工具支持以下格式的日志行：

```text
2025-11-03 21:10:16 INFO [TCP] match Match https://www.youtube.com/watch?v=example -> PROXY
2025-11-03 21:10:17 INFO [TCP] match Match facebook.com -> REJECT
```

## 输出格式

生成的输出文件包含：

```text
# Clash 内核 Match 规则匹配网址
# 生成时间: 2025-11-03 21:23:00
# 总计匹配网址数: 6
# ============================================================

1. discord.com/api
2. facebook.com
3. https://twitter.com/user/status
4. https://www.netflix.com/title/example
5. https://www.youtube.com/watch?v=example
6. instagram.com/profile
```

## 支持的文件类型

- `.log` 文件
- `.txt` 文件
- `.out` 文件

## 技术实现

### 核心算法

1. **文件扫描**: 递归扫描指定目录下的所有日志文件
2. **关键词匹配**: 使用正则表达式匹配 `match Match` 关键词
3. **网址提取**: 使用多重正则表达式提取各种格式的网址
4. **去重处理**: 自动去除重复的网址
5. **排序输出**: 按字母顺序排序输出结果

### 正则表达式模式

- **Match 行匹配**: `.*match Match\s+(.+?)(?:\s|$)`
- **网址提取**: `(https?://[^\s]+)|([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?)`

## 错误处理

- 文件读取错误会显示详细错误信息但不会中断程序
- 编码问题使用 `errors='ignore'` 参数处理
- 目录不存在时会给出明确提示

## 示例

### 示例日志文件内容

```text
2025-11-03 21:10:15 INFO [TCP] www.google.com:443 -> DIRECT
2025-11-03 21:10:16 INFO [TCP] match Match https://www.youtube.com/watch?v=example -> PROXY
2025-11-03 21:10:17 INFO [TCP] match Match facebook.com -> REJECT
2025-11-03 21:10:18 INFO [TCP] api.github.com -> DIRECT
```

### 运行结果

```text
============================================================
Clash 内核 Match 规则日志检测工具
============================================================
日志目录: /home/ranfr/Projects/RanFR/Config/Clash/Temp
输出文件: /home/ranfr/Projects/RanFR/Config/Clash/Temp/matched_urls.txt
------------------------------------------------------------
发现日志文件: /home/ranfr/Projects/RanFR/Config/Clash/Temp/sample_clash.log
找到 1 个日志文件
------------------------------------------------------------
正在分析文件: /home/ranfr/Projects/RanFR/Config/Clash/Temp/sample_clash.log
  发现匹配 (行 2): https://www.youtube.com/watch?v=example
  发现匹配 (行 3): facebook.com
------------------------------------------------------------
分析完成! 总共找到 2 个唯一网址
结果已保存到: /home/ranfr/Projects/RanFR/Config/Clash/Temp/matched_urls.txt
共提取到 2 个唯一网址
```

## 系统要求

- Python 3.6+
- Linux/macOS/Windows

## 注意事项

1. 确保对日志目录有读取权限
2. 确保对输出目录有写入权限
3. 大型日志文件可能需要较长处理时间
4. 建议定期清理旧的输出文件

## 更新日志

- **v1.0** (2025-11-03): 初始版本，支持基本的 match 规则检测和网址提取功能
