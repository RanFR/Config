-- Pull in the wezterm API
local wezterm = require("wezterm")
local act = wezterm.action

-- This will hold the configuration.
local config = {}

-- Check updates
config.check_for_updates = true
config.check_for_updates_interval_seconds = 86400

-- Color and Appearance
config.color_scheme = "OneHalfDark"

-- Scroll bar
config.enable_scroll_bar = true

-- Front end
-- If you experience issues with the default WebGpu renderer, you can switch to 'OpenGL' or 'Software'.
config.front_end = "WebGpu"

-- Fonts
config.font = wezterm.font("Maple Mono NF CN")
config.font_size = 16

-- If only one tab is open, disable the tab bar
config.hide_tab_bar_if_only_one_tab = true

-- Keys
config.keys = {
	{
		key = "-",
		mods = "ALT",
		action = act.SplitVertical({ domain = "CurrentPaneDomain" }),
	},
	{
		key = "=",
		mods = "ALT",
		action = act.SplitHorizontal({ domain = "CurrentPaneDomain" }),
	},
	{
		key = "w",
		mods = "CTRL",
		action = act.CloseCurrentPane({ confirm = false }),
	},
	{
		key = "LeftArrow",
		mods = "ALT",
		action = act.ActivatePaneDirection("Left"),
	},
	{
		key = "RightArrow",
		mods = "ALT",
		action = act.ActivatePaneDirection("Right"),
	},
	{
		key = "UpArrow",
		mods = "ALT",
		action = act.ActivatePaneDirection("Up"),
	},
	{
		key = "DownArrow",
		mods = "ALT",
		action = act.ActivatePaneDirection("Down"),
	}
}
-- ALT + number to activate that tab
for i = 1, 8 do
	table.insert(config.keys, {
		key = tostring(i),
		mods = "ALT",
		action = act.ActivateTab(i - 1),
	})
end

-- Mouse
config.mouse_bindings = {
	{
		event = { Up = { streak = 1, button = "Left" } },
		mods = "NONE",
		action = act.CompleteSelection "ClipboardAndPrimarySelection"
	},
	{
		event = { Up = { streak = 1, button = "Left" } },
		mods = "CTRL",
		action = act.OpenLinkAtMouseCursor
	}
}

-- Finally, return the configuration to wezterm
return config
