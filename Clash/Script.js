/**
 * Clash Verge 配置脚本
 * 用于自动配置DNS、规则提供器和路由规则
 * @author RanFR
 * @version 2.2.0
 * @date 2025-09-01
 * @description 修改了AI规则组的代理节点，如ChatGPT、Gemini等等，使用给定的ChatGPT组而非通用代理节点组
 **/

// 规则仓库地址
const RULE_URL = "";

// 健康检查链接
const HEALTH_CHECK_URL = "https://www.gstatic.com/generate_204";

// 直连规则
const DIRECT_RULES = ["Bing", "China"];

// 代理规则
const PROXY_RULES = [
  "AI",
  "Cloudflare",
  "DevSites",
  "Docker",
  "GitHub",
  "Google",
  "JetBrains",
  "JsDelivr",
  "Microsoft",
  "Misc",
  "Mozilla",
  "Overleaf",
  "Scholar",
  "SourceForge",
  "Telegram",
  "Wikipedia",
  "Yandex",
  "YouTube",
];

// 最小的负载均衡节点数量
const MIN_LOAD_BALANCE_NODES = 5;

// 负载均衡提取提取的节点，选取一个主要地区
const LOAD_BALANCE_REGIONS = "hk";

// 节点地区关键词
const NODE_REGION_KEYWORDS = {
  hk: ["香港", "Hong Kong", "hk"],
  tw: ["台湾", "Taiwan", "tw"],
  sg: ["新加坡", "Singapore", "sg"],
  jp: ["日本", "Japan", "jp"],
  kr: ["韩国", "Korea", "kr"],
  us: ["美国", "United States", "us"],
};

// AI组的关键词
const AI_GROUP_KEYWORDS = ["ChatGPT", "Claude"];

/**
 * 生成DNS配置
 * @returns {Object} DNS配置对象
 */
function createDnsConfig() {
  // 默认 DNS
  let defaultDns = [
    "223.5.5.5",
    "223.6.6.6",
    "2400:3200::1",
    "2400:3200:baba::1",
  ];

  // fake ip 过滤
  let fakeIpFilters = [
    // 局域网和本地地址
    "*.lan",
    "*.local",
    "*.arpa",
    // NTP时间同步
    "time.*.com",
    "ntp.*.com",
    "*.ntp.org",
    // 网络检测
    "*.msftncsi.com",
    "www.msftconnecttest.com",
  ];

  // 默认的域名解析服务器
  let nameservers = [
    "https://doh.pub/dns-query",
    "https://dns.alidns.com/dns-query",
  ];

  // 后备域名解析服务器
  let fallbackDns = ["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"];

  // 后备域名解析服务器筛选
  let fallbackFilter = {
    geoip: true, // 启用地理位置过滤
    "geoip-code": "CN", // 仅针对中国地区
    ipcidr: [
      "240.0.0.0/4", // 保留地址段
    ],
    // 避免可能受到污染的地址解析到国内
    domain: [
      "+.google.com",
      "+.youtube.com",
      "+.github.com",
      "+.githubusercontent.com",
    ],
  };

  // 最终的DNS配置
  let config = {
    enable: true,
    ipv6: true,
    listen: ":1053",
    "default-nameserver": defaultDns,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": fakeIpFilters,
    nameserver: nameservers,
    fallback: fallbackDns,
    "fallback-filter": fallbackFilter,
  };

  return config;
}

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

  // 获取直连规则
  DIRECT_RULES.forEach((name) => {
    const provider = createRuleProvider(name);
    providers[name] = provider;
  });

  // 获取代理规则
  PROXY_RULES.forEach((name) => {
    const provider = createRuleProvider(name);
    providers[name] = provider;
  });

  return providers;
}

/**
 * 生成路由规则列表
 * @returns {Array} 规则列表
 */
function createRoutingRules() {
  const rules = [];

  // 添加直连规则
  console.log(`添加 ${DIRECT_RULES.length} 个直连规则`);
  DIRECT_RULES.forEach((name) => {
    const ruleStr = `RULE-SET,${name},DIRECT`;
    rules.push(ruleStr);
  });

  // 添加代理规则
  console.log(`添加 ${PROXY_RULES.length} 个代理规则`);
  PROXY_RULES.forEach((name) => {
    let ruleStr = `RULE-SET,${name},Default`;
    // 为AI类单独建立一个代理组
    if (name === "AI") {
      ruleStr = `RULE-SET,${name},AI`;
    }
    rules.push(ruleStr);
  });

  // 添加 GEO 策略
  console.log("添加 GEO 策略规则");
  rules.push("GEOIP,LAN,DIRECT");
  rules.push("GEOIP,CN,DIRECT");
  rules.push("GEOSITE,CN,DIRECT");

  // 添加匹配代理规则
  console.log("添加匹配代理规则");
  rules.push(`MATCH,Default`);

  console.log(`总共生成了 ${rules.length} 条路由规则`);
  return rules;
}

/**
 * 通用关键词过滤函数
 * @param {Array} items - 待过滤的字符串数组
 * @param {Array} keywords - 关键词数组
 * @returns {Array} 匹配的字符串数组
 */
function filterByKeywords(items, keywords) {
  const matchedNames = [];
  items.forEach((item) => {
    if (item && typeof item.name === "string") {
      for (const keyword of keywords) {
        if (item.name.includes(keyword)) {
          matchedNames.push(item.name);
          break;
        }
      }
    }
  });

  return matchedNames;
}

/**
 * 按地区类型提取节点
 * @param {Array} proxies - 节点列表
 * @param {string} regionType - 地区类型 ('LoadBalance'|'PRIMARY'|'ALL')
 * @returns {Array} 匹配的节点组
 */
function extractRegionProxies(proxies, regionType) {
  // 如果地区类型为 ALL，返回所有节点
  if (regionType == "ALL") {
    return proxies.map((item) => item.name).filter(Boolean);
  }

  // 如果地区类型类LoadBalance，则为负载均衡组提取节点
  let keywords = [];
  if (regionType === "LoadBalance") {
    keywords.push(...NODE_REGION_KEYWORDS[LOAD_BALANCE_REGIONS]);
  }

  // 如果地区类型为 PRIMARY ，提取对应的关键词
  if (regionType === "PRIMARY") {
    keywords = [];
    Object.values(NODE_REGION_KEYWORDS).forEach((regionKeywords) => {
      keywords.push(...regionKeywords);
    });
  }

  // 匹配的代理节点组
  const matchedProxies = filterByKeywords(proxies, keywords);

  return matchedProxies;
}

/**
 * 创建手动选择组
 * @param {Array} proxies - 代理节点列表
 * @returns {Object} 手动选择组
 */
const createSelectGroup = (proxies) => {
  // 获取目标节点，默认将所有节点作为手动选择对象
  let targetGroupProxies = extractRegionProxies(proxies, "ALL");

  // 创建手动选择组
  const selectGroup = {
    name: "Select",
    type: "select",
    proxies: targetGroupProxies,
  };

  return selectGroup;
};

/**
 * 创建延迟选优组
 * @param {Array} proxies - 代理节点列表
 * @returns {Object} 延迟选优组
 */
const createUrlTestGroup = (proxies) => {
  // 获取目标节点，默认将所有节点作为延迟选优对象
  let targetGroupProxies = extractRegionProxies(proxies, "PRIMARY");

  // 创建延迟选优组
  const urlTestGroup = {
    name: "UrlTest",
    type: "url-test",
    proxies: targetGroupProxies,
    url: HEALTH_CHECK_URL,
    interval: 900, // 检查时间间隔
    tolerance: 150, // 偏差小于tolerance的节点不主动切换
    lazy: true, // 没有选中时不主动检测延迟
  };

  return urlTestGroup;
};

/**
 * 创建负载均衡组
 * @param {Array} proxies - 代理节点列表
 * @returns {Object} 处理结果 loadBalanceGroup
 */
const createLoadBalanceGroup = (proxies) => {
  // 记录提取的节点个数
  let primaryCount = 0;
  let targetCount = 0;

  // 提取主要地区节点
  console.log("提取主要地区节点");
  const primaryProxies = extractRegionProxies(proxies, "LoadBalance");
  primaryCount = primaryProxies.length;
  let targetGroupProxies = [...primaryProxies];
  targetCount = targetGroupProxies.length;

  // 如果主要地区节点不足，考虑添加所有节点到负载均衡组
  if (primaryCount < MIN_LOAD_BALANCE_NODES) {
    console.log("主要地区节点不足，添加所有节点");
    const allProxies = extractRegionProxies(proxies, "ALL");
    targetGroupProxies = allProxies;
    targetCount = targetGroupProxies.length;
  }

  // 记录提取结果
  console.log(`提取到 ${primaryCount} 个主要地区节点`);
  console.log(`总计提取到 ${targetCount} 个负载均衡节点`);

  // 记录负载均衡组的节点信息
  const loadBalanceGroup = {
    name: "LoadBalance",
    type: "load-balance",
    strategy: "consistent-hashing",
    proxies: targetGroupProxies,
    url: HEALTH_CHECK_URL,
    interval: 900,
    lazy: true,
  };

  return loadBalanceGroup;
};

/**
 * 创建故障转移组
 * @param {Array} proxies - 代理节点列表
 * @returns {Object} 故障转移组
 */
const createFallbackGroup = (proxies) => {
  // 获取目标节点，默认将所有节点作为故障转移对象
  let targetGroupProxies = extractRegionProxies(proxies, "PRIMARY");

  // 创建故障转移组
  const fallbackGroup = {
    name: "Fallback",
    type: "fallback",
    proxies: targetGroupProxies,
    url: HEALTH_CHECK_URL,
    interval: 300, // 每5分钟检查1次
    lazy: true, // 没有选中时不主动检测延迟
  };

  return fallbackGroup;
};

/**
 * 创建AI组
 * @param {Array} config - 配置文件对象
 * @returns {Object} AI组
 */
const createAIGroup = (config) => {
  // 检查是否存在包含ChatGPT字样的代理组
  let targetGroupProxies = [];
  const existingGroups = config["proxy-groups"] || [];
  const chatgptGroup = existingGroups.find((group) => {
    if (!group.name) return false;
    return AI_GROUP_KEYWORDS.some((keyword) => group.name.includes(keyword));
  });

  if (chatgptGroup && chatgptGroup.proxies) {
    console.log(`找到ChatGPT代理组: ${chatgptGroup.name}`);
    targetGroupProxies = chatgptGroup.proxies;
  } else {
    console.log("未找到ChatGPT代理组，使用负载均衡节点");
    targetGroupProxies = extractRegionProxies(config["proxies"], "LoadBalance");
  }

  // 创建AI组，基于负载均衡设置
  const aiGroup = {
    name: "AI",
    type: "load-balance",
    strategy: "consistent-hashing",
    proxies: targetGroupProxies,
    url: HEALTH_CHECK_URL,
    interval: 900,
    lazy: true,
  };

  return aiGroup;
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
    proxies: ["Select", "UrlTest", "LoadBalance", "Fallback", "AI", "DIRECT"],
  };
  newProxyGroups.push(defaultGroup);

  // 创建手动选择组
  console.log("正在创建手动选择组...");
  const selectGroup = createSelectGroup(config["proxies"]);
  newProxyGroups.push(selectGroup);

  // 创建延迟选优组
  console.log("正在创建延迟选优组...");
  const urlTestGroup = createUrlTestGroup(config["proxies"]);
  newProxyGroups.push(urlTestGroup);

  // 创建负载均衡组
  console.log("正在创建负载均衡组...");
  const loadBalanceGroup = createLoadBalanceGroup(config["proxies"]);
  newProxyGroups.push(loadBalanceGroup);

  // 创建故障转移组
  console.log("正在创建故障转移组...");
  const fallbackGroup = createFallbackGroup(config["proxies"]);
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
      dns: createDnsConfig(),
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
