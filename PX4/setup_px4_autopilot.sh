#!/bin/bash

SRC_DIR="$HOME/apps/px4-autopilot"
BUILD_DIR="$SRC_DIR/build/px4_sitl_default"

# Define a function to check and add paths
add_to_env_var() {
    local VAR_NAME=$1
    local VAR_VALUE=$2
    local VAR_CONTENT=$(eval echo \$$VAR_NAME)

    if [[ ":$VAR_CONTENT:" != *":$VAR_VALUE:"* ]]; then
        export $VAR_NAME="$VAR_CONTENT:$VAR_VALUE"
        echo "Added to $VAR_NAME: $VAR_VALUE"
    else
        echo "$VAR_NAME already contains: $VAR_VALUE"
    fi
}

# Use the function to add paths
add_to_env_var "ROS_PACKAGE_PATH" "${SRC_DIR}"
add_to_env_var "ROS_PACKAGE_PATH" "${SRC_DIR}/Tools/sitl_gazebo"
add_to_env_var "GAZEBO_PLUGIN_PATH" "${BUILD_DIR}/build_gazebo"
add_to_env_var "GAZEBO_MODEL_PATH" "${SRC_DIR}/Tools/sitl_gazebo/models"
add_to_env_var "LD_LIBRARY_PATH" "${BUILD_DIR}/build_gazebo"
