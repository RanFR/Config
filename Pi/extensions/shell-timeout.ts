// 强制限制内置 bash/powershell 工具的执行时长。
//
// 背景：pi 的 bash/powershell 工具的 timeout 参数是可选的，且默认没有超时。
// 命令挂起时工具会一直运行，elapsed 可达数万秒。此扩展通过 tool_call
// 钩子在每次 shell 调用前注入/钳制 timeout（单位：秒）。
//
// 按需修改下面两个常量即可，重启 pi 或执行 /reload 生效。
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";

const DEFAULT_TIMEOUT_S = 300; // 模型未指定 timeout 时使用的默认值（秒）
const MAX_TIMEOUT_S = 600; // 允许的上限，即使模型显式传了更大的值也会被钳制（秒）

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", (event) => {
		if (
			isToolCallEventType("bash", event) ||
			isToolCallEventType("powershell", event)
		) {
			const requested =
				typeof event.input.timeout === "number" && event.input.timeout > 0
					? event.input.timeout
					: DEFAULT_TIMEOUT_S;
			const capped = Math.min(requested, MAX_TIMEOUT_S);
			if (capped !== event.input.timeout) {
				event.input.timeout = capped;
			}
		}
	});
}
