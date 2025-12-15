#!/bin/bash

MESSAGE="Claude 正在等待你的输入"

if command -v notify-send &> /dev/null; then
    notify-send -u normal "Claude Code - 等待输入" "$MESSAGE" -i dialog-information
else
    echo -e "\a"
    echo "⏰ $MESSAGE"
fi

exit 0
