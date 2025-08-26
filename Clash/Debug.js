// 调试脚本，用于在本地运行和调试
const fs = require("fs");
const yaml = require("js-yaml");

// 读取并解析 YAML 文件
const configYaml = fs.readFileSync("./config.yaml", "utf8");
const configObj = yaml.load(configYaml);

// 引入你的主脚本
const { main } = require("./Script.js"); // 路径根据实际情况调整

// 运行主函数
const result = main(configObj);

// 将结果写入Yaml，便于对比和查看
fs.writeFileSync("output.yaml", yaml.dump(result), "utf8");
