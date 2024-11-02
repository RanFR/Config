#!/bin/bash

# 设置ROS的镜像列表
setup_ros_mirror() {
    local mirror_url="https://mirrors.ustc.edu.cn/ros/ubuntu/"
    local distro="focal"
    local mirror_file="/etc/apt/sources.list.d/ros.list"

    if [ ! -f "$mirror_file" ]; then
        echo "Creating $mirror_file..."
        touch "$mirror_file"
    fi

    # 写入新的源地址
    echo "deb $mirror_url $distro main" > "$mirror_file"
}

# 设置ROS密钥
setup_ros_key() {
    apt-get install -y curl
    curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | apt-key add -
}

# 安装ROS
install_ros() {
    apt-get update
    apt-get install -y ros-noetic-desktop-full
}

# 设置环境变量
setup_environment() {
    DESC="source /opt/ros/noetic/setup.bash"
    if ! grep -qF "$DESC" ~/.bashrc; then
        echo -e "\n# Ros Noetic" >> ~/.bashrc
        echo "$DESC" >> ~/.bashrc
    fi
}

# 安装构建依赖项
install_dependencies() {
    apt-get install -y python3-rosdep python3-rosinstall python3-rosinstall-generator python3-wstool build-essential
    rosdep init
    rosdep update
}

# 主函数
main() {
    setup_ros_mirror
    setup_ros_key
    install_ros
    setup_environment
    install_dependencies
}

# 执行主函数
main
