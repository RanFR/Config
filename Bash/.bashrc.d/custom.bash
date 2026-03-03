#!/bin/bash

# Acados
case ":${LD_LIBRARY_PATH}:" in
*:"$HOME/.local/lib":*) ;;
*)
	export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:$HOME/.local/lib"
	;;
esac
export ACADOS_SOURCE_DIR="$HOME/.local"

# Astral uv
if command -v uv >/dev/null 2>&1; then
	eval "$(uv generate-shell-completion bash)"
fi

# Bun
export BUN_INSTALL="$HOME/.bun"
case ":${PATH}:" in
*:"$BUN_INSTALL/bin":*) ;;
*)
	export PATH="$BUN_INSTALL/bin:$PATH"
	;;
esac

# CUDA
case ":${PATH}:" in
*:"/usr/local/cuda/bin":*) ;;
*)
	export PATH=${PATH}:/usr/local/cuda/bin
	;;
esac
case ":${LD_LIBRARY_PATH}:" in
*:"/usr/local/cuda/lib":*) ;;
*)
	export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/local/cuda/lib"
	;;
esac

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"                   # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && source "$NVM_DIR/bash_completion" # This loads nvm bash_completion

# opencode
case ":$PATH:" in
*:"$HOME/.opencode/bin":*) ;;
*)
	export PATH=$PATH:$HOME/.opencode/bin
	;;
esac

# ROS
source /opt/ros/noetic/setup.bash
# 禁用ROS1 Rviz的EOL警告
export DISABLE_ROS1_EOL_WARNINGS=true

# Rust
source "$HOME/.cargo/env"

# TexLive
case ":${PATH}:" in
*:"/usr/local/texlive/2025/bin/x86_64-linux":*) ;;
*)
	export PATH="${PATH}:/usr/local/texlive/2025/bin/x86_64-linux"
	;;
esac
