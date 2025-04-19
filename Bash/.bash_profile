# ~/.bash_profile: executed by the command interpreter for login shells.

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi

# set PATH so it includes user's private sh files if it exists
if [ -d "$HOME/.local/bin/sh" ]; then
  PATH="$HOME/.local/bin/sh:$PATH"
fi
