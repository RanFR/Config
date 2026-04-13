# Acados
export ACADOS_SOURCE_DIR="$HOME/source/acados"
case ":${LD_LIBRARY_PATH}:" in
*:"${ACADOS_SOURCE_DIR}/lib":*) ;;
*)
	export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:${ACADOS_SOURCE_DIR}/lib"
	;;
esac

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
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && source "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# OpenCode
export OPENCODE_BIN_DIR="${HOME}/.opencode/bin"
case ":$PATH:" in
*:"${OPENCODE_BIN_DIR}":*) ;;
*)
	export PATH=${PATH}:${OPENCODE_BIN_DIR}
	;;
esac
