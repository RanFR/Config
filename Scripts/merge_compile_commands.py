import os
import json

# 获取当前工作目录，判断是在项目根目录下，还是在其他目录下（比如scripts目录下）
# 通过判断当前目录下是否存在src目录，来判断是否在项目根目录下
current_path = os.getcwd()
if os.path.exists(os.path.join(current_path, 'src')):
    workspace = current_path
else:
    # 返回目录的上一级目录，作为项目根目录
    workspace = os.path.dirname(current_path)
build_dir = os.path.join(workspace, 'build')

# 用于存储合并的编译命令
compile_commands = []

# 遍历 build 目录及其子目录，查找 compile_commands.json 文件
for root, _, files in os.walk(build_dir):
    # 跳过 build 根目录下的 compile_commands.json 文件
    if root == build_dir and 'compile_commands.json' in files:
        continue
    if 'compile_commands.json' in files:
        file_path = os.path.join(root, 'compile_commands.json')
        if os.path.getsize(file_path) > 0:  # 检查文件是否为空
            try:
                with open(file_path, 'r') as f:
                    compile_commands.extend(json.load(f))
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON from {file_path}: {e}")
        else:
            print(f"Skipping empty file: {file_path}")

# 定义目标 compile_commands.json 文件路径
output_file_path = os.path.join(build_dir, 'compile_commands.json')

# 检查 build 目录是否存在，如果不存在则创建
if not os.path.exists(build_dir):
    os.makedirs(build_dir)

# 写入合并后的编译命令到 compile_commands.json 文件中
with open(output_file_path, 'w') as f:
    json.dump(compile_commands, f, indent=2)

print(f"Compile commands have been written to {output_file_path}")
