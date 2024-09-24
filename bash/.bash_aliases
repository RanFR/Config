# Ros catkin_make
alias cm="catkin_make --cmake-args -DCMAKE_EXPORT_COMPILE_COMMANDS=ON"
alias cmr="catkin_make --cmake-args -DCMAKE_BUILD_TYPE=Release"
alias cmc="catkin_make clean"
# For cuda-10, the maximum version of gcc/g++ is 8, but the default version in Ubuntu20 is 9.4.0
alias cmcuda="catkin_make --cmake-args -DCMAKE_BUILE_TYPE=Release -DCMAKE_C_COMPILER=gcc-8 -DCMAKE_CXX_COMPILER=g++-8"

# Ros catkin tools
alias cb="catkin build"
