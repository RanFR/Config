/**
 * Clash Verge 配置脚本
 * 用于自动配置DNS、规则提供器、代理组和路由规则
 * @author RanFR
 * @version 2.10.0
 * @date 2025-11-20
 * @description 优化规则配置，优先使用GEO提供规则直连
 **/

// 规则仓库地址
const RULE_URL = "";

// 健康检查链接
const HEALTH_CHECK_URL = "https://www.gstatic.com/generate_204";

// DNS 配置常量
const DNS_CONFIG = {
  enable: true,
  listen: "127.0.0.1:5335",
  ipv6: false, // 动态设置
  "cache-algorithm": "arc", // or lru
  "prefer-h3": true,
  "enhanced-mode": "fake-ip",
  "direct-nameserver": [
    "system",
    "https://dns.alidns.com/dns-query",
    "https://doh.pub/dns-query",
  ],
  "default-nameserver": ["tls://223.5.5.5:853", "tls://119.29.29.29:853"],
  nameserver: [
    "https://cloudflare-dns.com/dns-query",
    "https://dns.google/dns-query",
  ],
  "proxy-server-nameserver": [
    "https://dns.alidns.com/dns-query",
    "https://doh.pub/dns-query",
  ],
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-range-v6": "fdfe:dcba:9876::/64",
  "fake-ip-filter": [
    "*.lan",
    "*.local",
    "+.msftconnecttest.com",
    "+.msftncsi.com",
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
    "localhost.work.weixin.qq.com",
  ],
};

// 直连规则
const DIRECT_RULES = [];

// AI组专用规则
const AI_RULES = ["Claude", "Gemini", "Grok", "OpenAI"];

// 代理规则
const PROXY_RULES = [
  "Amazon",
  "Cloudflare",
  "DevSites",
  "Docker",
  "Game",
  "GitHub",
  "Google",
  "Intel",
  "JetBrains",
  "JsDelivr",
  "Microsoft",
  "Misc",
  "Mozilla",
  "Overleaf",
  "Scholar",
  "SourceForge",
  "Steam",
  "Telegram",
  "Ubuntu",
  "Wikipedia",
  "X",
  "Yandex",
  "YouTube",
];

// 自动选择组关键词
const URLTEST_KEYWORDS = ["自动", "Auto"];

// 故障转移组关键词
const FALLBACK_KEYWORDS = ["故障", "Fallback"];

// AI组的关键词
const AI_GROUP_KEYWORDS = ["ChatGPT", "OpenAI", "Claude", "Gemini", "Grok"];

/**
 * 生成单个规则提供器配置
 * @param {string} name - 规则名称
 * @returns {Object} 规则提供器对象
 */
function createRuleProvider(name) {
  let ruleProvider = {
    type: "http",
    format: "yaml",
    interval: 86400, // 每天更新
    behavior: "classical",
    url: `${RULE_URL}${name}.yaml`,
    path: `RuleProvider/${name}.yaml`,
  };
  return ruleProvider;
}

/**
 * 生成所有规则提供器
 * @returns {Object} 所有规则提供器配置
 */
function createAllRuleProviders() {
  let providers = {};

  // 只合并AI规则和代理规则（跳过空的直连规则）
  const allRules = [...AI_RULES, ...PROXY_RULES];

  allRules.forEach((name) => {
    const provider = createRuleProvider(name);
    providers[name] = provider;
  });

  return providers;
}

/**
 * 生成 DNS 配置
 * @param {Object} config - 机场配置文件对象
 * @returns {Object} DNS 配置对象
 */
function createDNSConfig(config) {
  console.log("生成 DNS 配置");

  // 智能获取 IPv6 设置，优先级：dns.ipv6 > 根级别 ipv6 > false
  let ipv6Enabled = false; // 默认值

  if (config && config.dns && typeof config.dns.ipv6 === "boolean") {
    ipv6Enabled = config.dns.ipv6;
    console.log(`使用机场配置中的 DNS IPv6 设置: ${ipv6Enabled}`);
  } else if (config && typeof config.ipv6 === "boolean") {
    ipv6Enabled = config.ipv6;
    console.log(`使用机场配置中的全局 IPv6 设置: ${ipv6Enabled}`);
  } else {
    console.log(`机场配置未找到 IPv6 设置，使用默认值: ${ipv6Enabled}`);
  }

  // 创建动态 DNS 配置
  const dynamicDnsConfig = {
    ...DNS_CONFIG,
    ipv6: ipv6Enabled,
  };

  return dynamicDnsConfig;
}

/**
 * 生成路由规则列表
 * @returns {Array} 规则列表
 */
function createRoutingRules() {
  const rules = [];

  // 优先添加局域网规则
  console.log("添加局域网直连规则");
  rules.push("GEOIP,private,DIRECT,no-resolve");

  // 添加中国规则 - 中国域名/IP直连
  console.log("添加中国直连规则");
  rules.push("GEOSITE,cn,DIRECT");
  rules.push("GEOIP,cn,DIRECT");

  // 添加AI规则
  console.log(`添加 ${AI_RULES.length} 个AI规则`);
  AI_RULES.forEach((name) => {
    const ruleStr = `RULE-SET,${name},AI`;
    rules.push(ruleStr);
  });

  // 添加代理规则
  console.log(`添加 ${PROXY_RULES.length} 个代理规则`);
  PROXY_RULES.forEach((name) => {
    const ruleStr = `RULE-SET,${name},Default`;
    rules.push(ruleStr);
  });

  // 添加匹配代理规则
  console.log("添加匹配代理规则");
  rules.push(`MATCH,Default`);

  console.log(`总共生成了 ${rules.length} 条路由规则`);
  return rules;
}

/**
 * 提取所有节点名称
 * @param {Array} proxies - 节点列表
 * @returns {Array} 所有节点名称
 */
function extractAllProxies(proxies) {
  return proxies.map((item) => item.name).filter(Boolean);
}

/**
 * 将香港/台湾节点优先置前，保持各分组内的原始相对顺序
 * @param {Array<string>} names - 节点名称列表
 * @returns {Array<string>} 重新排序后的节点名称
 */
function prioritizeHKAndTW(names) {
  const HK_PATTERNS = [
    /香港/,
    /hong\s*kong/i,
    /\bHK\b/i,
    /\bHKG\b/i,
    /\[(\s*)HK(\s*)\]/i,
    /\((\s*)HK(\s*)\)/i,
  ];

  const TW_PATTERNS = [
    /台湾|台灣/,
    /tai\s*wan/i,
    /\bTW\b/i,
    /\bTWN\b/i,
    /\bTPE\b/i,
    /taipei/i,
  ];

  const isMatch = (s, patterns) => patterns.some((re) => re.test(s));

  const hk = [];
  const tw = [];
  const others = [];

  names.forEach((n) => {
    const name = String(n);
    if (isMatch(name, HK_PATTERNS)) hk.push(n);
    else if (isMatch(name, TW_PATTERNS)) tw.push(n);
    else others.push(n);
  });

  return [...hk, ...tw, ...others];
}

/**
 * 创建手动选择组
 * @param {Array} proxies - 代理节点列表
 * @returns {Object} 手动选择组
 */
const createSelectGroup = (proxies) => {
  // 获取目标节点，默认将所有节点作为手动选择对象
  let targetGroupProxies = extractAllProxies(proxies);

  // 创建手动选择组
  const selectGroup = {
    name: "Select",
    type: "select",
    proxies: targetGroupProxies,
  };

  return selectGroup;
};

/**
 * 递归查找代理组中的实际节点
 * @param {string} proxyName - 代理名称
 * @param {Array} allProxies - 所有代理节点
 * @param {Array} allGroups - 所有代理组
 * @param {Set} visited - 已访问的代理组（防止循环引用）
 * @returns {Array} 实际节点列表
 */
const resolveProxyNodes = (
  proxyName,
  allProxies,
  allGroups,
  visited = new Set()
) => {
  // 防止循环引用
  if (visited.has(proxyName)) {
    console.warn(`检测到循环引用: ${proxyName}`);
    return [];
  }

  // 检查是否是实际节点
  const isRealNode = allProxies.some((proxy) => proxy.name === proxyName);
  if (isRealNode) {
    return [proxyName];
  }

  // 检查是否是代理组
  const proxyGroup = allGroups.find((group) => group.name === proxyName);
  if (proxyGroup && proxyGroup.proxies) {
    visited.add(proxyName);
    const resolvedNodes = [];

    // 递归解析组中的每个代理
    proxyGroup.proxies.forEach((subProxy) => {
      const subNodes = resolveProxyNodes(
        subProxy,
        allProxies,
        allGroups,
        new Set(visited)
      );
      resolvedNodes.push(...subNodes);
    });

    return resolvedNodes;
  }

  // 如果既不是节点也不是组，可能是内置代理（如DIRECT、REJECT）
  console.warn(`未找到代理: ${proxyName}`);
  return [];
};

/**
 * 通用代理组创建函数
 * @param {Object} config - 配置文件对象
 * @param {string} groupName - 代理组名称
 * @param {string} groupType - 代理组类型
 * @param {Array} keywords - 匹配关键词
 * @param {Object} extraOptions - 额外配置选项
 * @returns {Object} 代理组配置
 */
const createProxyGroup = (
  config,
  groupName,
  groupType,
  keywords,
  extraOptions = {}
) => {
  let targetGroupProxies = [];
  const existingGroups = config["proxy-groups"] || [];
  const allProxies = config["proxies"] || [];

  // 查找匹配的代理组
  const searchedGroup = existingGroups.find((group) => {
    if (!group.name) return false;
    return keywords.some((keyword) => group.name.includes(keyword));
  });

  if (searchedGroup && searchedGroup.proxies) {
    console.log(`找到${groupName}代理组: ${searchedGroup.name}`);

    // 解析代理组中的实际节点
    const resolvedNodes = [];
    searchedGroup.proxies.forEach((proxyName) => {
      const nodes = resolveProxyNodes(proxyName, allProxies, existingGroups);
      resolvedNodes.push(...nodes);
    });

    // 去重并过滤掉内置代理
    const uniqueNodes = [...new Set(resolvedNodes)].filter((nodeName) => {
      return !["DIRECT", "REJECT", "PASS"].includes(nodeName);
    });

    targetGroupProxies = uniqueNodes;
    console.log(
      `${groupName}组解析得到 ${targetGroupProxies.length} 个实际节点`
    );
  } else {
    console.log(`未找到${groupName}代理组，使用所有节点`);
    targetGroupProxies = extractAllProxies(config["proxies"]);
  }

  // 如果没有找到任何节点，使用所有节点作为后备
  if (targetGroupProxies.length === 0) {
    console.warn(`${groupName}组未找到任何可用节点，使用所有节点作为后备`);
    targetGroupProxies = extractAllProxies(config["proxies"]);
  }

  // 创建代理组基础配置
  const proxyGroup = {
    name: groupName,
    type: groupType,
    proxies: targetGroupProxies,
    ...extraOptions,
  };

  return proxyGroup;
};

/**
 * 创建延迟选优组
 * @param {Object} config - 配置文件对象
 * @returns {Object} 延迟选优组
 */
const createUrlTestGroup = (config) => {
  return createProxyGroup(config, "UrlTest", "url-test", URLTEST_KEYWORDS, {
    url: HEALTH_CHECK_URL,
    interval: 900, // 检查时间间隔15分钟
    tolerance: 150, // 偏差小于tolerance的节点不主动切换
    lazy: true, // 没有选中时不主动检测延迟
  });
};

/**
 * 创建故障转移组
 * @param {Object} config - 配置文件对象
 * @returns {Object} 故障转移组
 */
const createFallbackGroup = (config) => {
  const group = createProxyGroup(
    config,
    "Fallback",
    "fallback",
    FALLBACK_KEYWORDS,
    {
      url: HEALTH_CHECK_URL,
      interval: 900, // 每15分钟检查1次
      lazy: true, // 没有选中时不主动检测延迟
    }
  );
  if (Array.isArray(group.proxies)) {
    group.proxies = prioritizeHKAndTW(group.proxies);
  }
  return group;
};

/**
 * 创建AI组
 * @param {Object} config - 配置文件对象
 * @returns {Object} AI组
 */
const createAIGroup = (config) => {
  const group = createProxyGroup(config, "AI", "fallback", AI_GROUP_KEYWORDS, {
    url: HEALTH_CHECK_URL,
    interval: 900, // 15分钟检查一次
  });
  if (Array.isArray(group.proxies)) {
    group.proxies = prioritizeHKAndTW(group.proxies);
  }
  return group;
};

// ==================== 主函数 ====================

/**
 * 验证配置对象
 * @param {any} config - 配置对象
 * @returns {boolean} 是否有效
 */
function isValidConfig(config) {
  // 如果配置无效，返回 true；否则返回 false
  if (!config || typeof config !== "object") {
    return true;
  }

  // 检查 proxies 是否有效
  if (!Array.isArray(config.proxies) || config.proxies.length === 0) {
    return true;
  }

  return false;
}

/**
 * 处理代理组配置
 * @param {Object} config - 配置对象
 * @returns {Object} 新的代理组配置
 */
const processProxyGroupsConfig = (config) => {
  // 新的代理组
  console.log("正在处理代理组配置...");
  let newProxyGroups = [];

  // 创建默认组
  let defaultGroup = {
    name: "Default",
    type: "select",
    proxies: ["Select", "UrlTest", "Fallback", "DIRECT"],
  };
  newProxyGroups.push(defaultGroup);

  // 创建手动选择组
  console.log("正在创建手动选择组...");
  const selectGroup = createSelectGroup(config["proxies"]);
  newProxyGroups.push(selectGroup);

  // 创建延迟选优组
  console.log("正在创建延迟选优组...");
  const urlTestGroup = createUrlTestGroup(config);
  newProxyGroups.push(urlTestGroup);

  // 创建故障转移组
  console.log("正在创建故障转移组...");
  const fallbackGroup = createFallbackGroup(config);
  newProxyGroups.push(fallbackGroup);

  // 创建AI组
  console.log("正在创建AI组...");
  const aiGroup = createAIGroup(config);
  newProxyGroups.push(aiGroup);

  return newProxyGroups;
};

/**
 * 主配置函数 - Clash Verge 脚本入口点
 * @param {Object} config - 原始Clash配置对象
 * @param {string} [profileName] - 配置文件名称
 * @returns {Object} 修改后的配置对象
 */
function main(config, profileName = "Default") {
  const startTime = Date.now();

  try {
    if (isValidConfig(config)) {
      throw new Error("Invalid config object provided");
    }

    console.log(`开始处理配置文件: ${profileName}`);

    // 生成核心配置
    const configurations = {
      dns: createDNSConfig(config),
      "rule-providers": createAllRuleProviders(),
      rules: createRoutingRules(),
      "proxy-groups": processProxyGroupsConfig(config),
    };

    // 应用配置
    Object.assign(config, configurations);

    // 执行时间
    const executionTime = Date.now() - startTime;
    console.log("配置处理完成");
    console.log(`执行时间: ${executionTime}ms`);

    return config;
  } catch (error) {
    console.error(`配置处理失败: ${error.message}`);
    console.error(`错误堆栈: ${error.stack}`);
    console.warn("返回原始配置以确保Clash正常运行");
    return config;
  }
}
