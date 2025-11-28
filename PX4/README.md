# PX4-Autopilot ROS 环境配置

本配置用于添加 PX4-Autopilot 到 ROS 环境，通过 roslaunch 即可启动仿真环境。

## 功能说明

`setup_px4_autopilot.sh` 脚本会自动配置以下环境变量：

- **ROS_PACKAGE_PATH**: 添加 PX4 源码路径和 Gazebo 仿真路径
- **GAZEBO_PLUGIN_PATH**: 添加 PX4 Gazebo 插件路径
- **GAZEBO_MODEL_PATH**: 添加 PX4 Gazebo 模型路径
- **LD_LIBRARY_PATH**: 添加 PX4 构建库路径

## 使用方法

### 1. 运行配置脚本

运行如下命令执行脚本

```bash
source setup_px4_autopilot.sh
```

### 2. 启动仿真环境

配置完成后，可以使用以下命令启动 PX4 仿真：

```bash
# 启动mavros的四旋翼仿真
roslaunch px4 mavros_posix_sitl.launch
```

### 3. 使用 QGroundControl

```bash
# 如果已安装 QGroundControl，可以连接到仿真
qgroundcontrol
```

## 环境要求

- ROS (Robot Operating System)
- Gazebo 仿真器
- PX4-Autopilot 源码 (位于 `$HOME/apps/px4-autopilot`)
- 已编译的 PX4 SITL

## 测试版本

- 在 PX4 v1.12.3 版本中进行测试
- 脚本路径配置为 `$HOME/apps/px4-autopilot`

## 注意事项

- 确保已正确编译 PX4-Autopilot
- 脚本会自动检查路径是否已存在，避免重复添加
- 每次启动新终端时都需要重新运行此脚本

## 故障排除

如果遇到以下问题：

1. **找不到 roslaunch 命令**: 确保已安装并正确配置 ROS
2. **路径不存在**: 检查 `$HOME/apps/px4-autopilot` 目录是否存在
