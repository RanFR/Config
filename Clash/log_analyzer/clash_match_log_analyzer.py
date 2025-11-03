#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Clash 内核 Match 规则日志检测工具

该工具用于扫描指定文件夹下的所有日志文件，提取包含 "match Match" 关键词的行，
并从中提取出匹配的网址，保存到输出文件中。

"""

import os
import re
import sys
from pathlib import Path
from typing import List, Set


class ClashLogAnalyzer:
    """Clash 日志分析器"""

    def __init__(self, log_dir: str, output_file: str):
        """
        初始化日志分析器

        Args:
            log_dir: 日志文件所在目录
            output_file: 输出文件路径
        """
        self.log_dir = Path(log_dir)
        self.output_file = Path(output_file)
        self.matched_urls: Set[str] = set()

        # 用于匹配 "match Match" 行的正则表达式
        self.match_pattern = re.compile(
            r'.*match Match\s+(.+?)(?:\s|$)',
            re.IGNORECASE
        )

        # 用于提取网址的正则表达式
        self.url_pattern = re.compile(
            r'(https?://[^\s]+)|([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?)',
            re.IGNORECASE
        )

    def find_log_files(self) -> List[Path]:
        """
        查找目录下的所有日志文件

        Returns:
            日志文件路径列表
        """
        log_files = []

        # 常见的日志文件扩展名
        log_extensions = {'.log', '.txt', '.out'}

        if not self.log_dir.exists():
            print(f"错误: 目录 {self.log_dir} 不存在")
            return log_files

        for file_path in self.log_dir.rglob('*'):
            if file_path.is_file() and file_path.suffix.lower() in log_extensions:
                log_files.append(file_path)
                print(f"发现日志文件: {file_path}")

        return log_files

    def extract_urls_from_line(self, line: str) -> List[str]:
        """
        从一行中提取网址

        Args:
            line: 日志行内容

        Returns:
            提取到的网址列表
        """
        urls = []

        # 首先检查是否包含 "match Match" 关键词
        if 'match Match' not in line:
            return urls

        # 使用 match Pattern 匹配整行
        match_result = self.match_pattern.match(line)
        if match_result:
            match_content = match_result.group(1)
            # 从匹配的内容中提取网址
            url_matches = self.url_pattern.findall(match_content)
            for url_tuple in url_matches:
                for url in url_tuple:
                    if url and url.strip():
                        cleaned_url = url.strip().rstrip('.,;:!?)')
                        if cleaned_url not in urls:
                            urls.append(cleaned_url)
        else:
            # 如果 match Pattern 不匹配，尝试直接在整行中搜索网址
            url_matches = self.url_pattern.findall(line)
            for url_tuple in url_matches:
                for url in url_tuple:
                    if url and url.strip():
                        cleaned_url = url.strip().rstrip('.,;:!?)')
                        if cleaned_url not in urls:
                            urls.append(cleaned_url)

        return urls

    def analyze_file(self, file_path: Path) -> int:
        """
        分析单个日志文件

        Args:
            file_path: 日志文件路径

        Returns:
            找到的匹配数量
        """
        match_count = 0

        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                print(f"正在分析文件: {file_path}")

                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line:
                        continue

                    # 检查是否包含 "match Match" 关键词
                    if 'match Match' in line:
                        urls = self.extract_urls_from_line(line)
                        for url in urls:
                            if url not in self.matched_urls:
                                self.matched_urls.add(url)
                                match_count += 1
                                print(f"  发现匹配 (行 {line_num}): {url}")

        except Exception as e:
            print(f"错误: 读取文件 {file_path} 时出错: {e}")

        return match_count

    def save_results(self) -> None:
        """
        保存结果到输出文件
        """
        try:
            # 确保输出目录存在
            self.output_file.parent.mkdir(parents=True, exist_ok=True)

            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write("# Clash 内核 Match 规则匹配网址\n")
                f.write(f"# 生成时间: {self.get_current_time()}\n")
                f.write(f"# 总计匹配网址数: {len(self.matched_urls)}\n")
                f.write("# " + "=" * 60 + "\n\n")

                # 按字母顺序排序输出
                sorted_urls = sorted(self.matched_urls)

                for i, url in enumerate(sorted_urls, 1):
                    f.write(f"{i}. {url}\n")

            print(f"结果已保存到: {self.output_file}")
            print(f"共提取到 {len(self.matched_urls)} 个唯一网址")

        except Exception as e:
            print(f"错误: 保存结果文件时出错: {e}")

    def get_current_time(self) -> str:
        """
        获取当前时间字符串

        Returns:
            格式化的时间字符串
        """
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def run(self) -> None:
        """
        运行分析过程
        """
        print("=" * 60)
        print("Clash 内核 Match 规则日志检测工具")
        print("=" * 60)
        print(f"日志目录: {self.log_dir}")
        print(f"输出文件: {self.output_file}")
        print("-" * 60)

        # 查找日志文件
        log_files = self.find_log_files()

        if not log_files:
            print("未找到任何日志文件")
            return

        print(f"找到 {len(log_files)} 个日志文件")
        print("-" * 60)

        # 分析所有文件
        total_matches = 0
        for file_path in log_files:
            matches = self.analyze_file(file_path)
            total_matches += matches

        print("-" * 60)
        print(f"分析完成! 总共找到 {len(self.matched_urls)} 个唯一网址")

        # 保存结果
        if self.matched_urls:
            self.save_results()
        else:
            print("未找到任何匹配的网址")


def main():
    """主函数"""
    # 默认配置
    default_log_dir = str(Path(__file__).resolve().parent)
    print(default_log_dir)
    default_output_file = Path(__file__).resolve().parent / "matched_urls.txt"

    # 检查命令行参数
    if len(sys.argv) > 1:
        log_dir = sys.argv[1]
    else:
        log_dir = default_log_dir

    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    else:
        output_file = default_output_file

    print("使用说明:")
    print(f"  python {sys.argv[0]} [日志目录] [输出文件]")
    print(f"  默认日志目录: {default_log_dir}")
    print(f"  默认输出文件: {default_output_file}")
    print()

    # 创建分析器并运行
    analyzer = ClashLogAnalyzer(log_dir, output_file)
    analyzer.run()


if __name__ == "__main__":
    main()
