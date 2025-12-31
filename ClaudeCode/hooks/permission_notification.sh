#!/bin/bash

MESSAGE="Claude Code 需要你的权限批准"

if command -v notify-send &> /dev/null; then
    notify-send -u critical "Claude Code - 权限请求" "$MESSAGE" -i dialog-warning
else
    echo -e "\a"
    echo "⚠️  $MESSAGE"
fi

exit 0
