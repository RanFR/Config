/**
 * Clash Verge 配置脚本
 * 用于自动配置DNS、规则提供器和路由规则
 * @author RanFR
 * @version 1.9.1
 * @date 2025-08-21
 * @description 重新调整了负载均衡组的生成，并默认代理走该组
 * @description 修改默认的回退DNS为IP地址
 **/

// 代理提供商名称
const PROXY_PROVIDER_NAME = "";

// 代理服务器组名称
const PROXY_GROUP_NAME = "LoadBalance";

// 规则URL配置
const RULE_URL = "";

/** DNS配置 */
const dnsConfig = {
  ipv6: true,
  nameservers: {
    // IPV4 的DNS服务器配置
    ipv4: {
      default: [
        "223.5.5.5", // 阿里
        "119.29.29.29", // 腾讯
      ],
      domestic: [
        "223.5.5.5", // 阿里
        "223.6.6.6", // 阿里
        "119.29.29.29", // 腾讯
      ],
      foreign: [
        "1.1.1.1", // Cloudflare
        "1.0.0.1", // Cloudflare
        "8.8.8.8", // Google
        "8.8.4.4", // Google
      ],
    },
    // IPV6 的DNS服务器配置
    ipv6: {
      default: [
        "2400:3200::1", // 阿里
        "2402:4e00::", // 腾讯
      ],
      domestic: [
        "2400:3200::1", // 阿里
        "2400:3200:baba::1", // 阿里
        "2402:4e00::", // 腾讯
      ],
      foreign: [
        "2606:4700:4700::1111", // Cloudflare
        "2606:4700:4700::1001", // Cloudflare
        "2001:4860:4860::8888", // Google
        "2001:4860:4860::8844", // Google
      ],
    },
    // DoH 服务器
    doh: {
      domestic: [
        "https://dns.alidns.com/dns-query", // 阿里
        "https://doh.pub/dns-query", // 腾讯
      ],
      foreign: [
        "https://cloudflare-dns.com/dns-query", // Cloudflare
        "https://dns.google/dns-query", // Google
      ],
    },
  },
  // Fake IP过滤列表
  fakeIpFilters: [
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
  ],
  // 回退过滤器配置
  fallbackFilter: {
    geoip: true, // 启用地理位置过滤
    "geoip-code": "CN", // 仅针对中国地区
    ipcidr: [
      "240.0.0.0/4", // 保留地址段
      "0.0.0.0/32", // 无效地址
    ],
    // 避免可能受到污染的地址解析到国内
    domain: [
      "+.google.com",
      "+.youtube.com",
      "+.github.com",
      "+.githubusercontent.com",
    ],
  },
};

// 负载均衡配置
const loadBalanceConfig = {
  // 基础负载均衡配置
  base: {
    // 最小节点数量阈值
    minNodesThreshold: 5,
    // 负载均衡组名称
    groupName: "LoadBalance",
    // 负载均衡策略
    strategy: "consistent-hashing",
    // 健康检查URL
    healthCheckUrl: "https://www.gstatic.com/generate_204",
    // 健康检查间隔（秒）
    healthCheckInterval: 600,
    // 时间限制（毫秒）
    timeout: 1500,
  },
  // 负载均衡地区节点配置
  region: {
    // 主要地区关键词（香港、台湾、新加坡）
    primary: [
      "香港",
      "台湾",
      "新加坡",
      "Hong Kong",
      "Taiwan",
      "Singapore",
      "hk",
      "tw",
      "sg",
    ],
    // 可选地区关键词（日本、韩国）
    optional: ["日本", "韩国", "Japan", "South Korea", "jp", "kr"],
  },
};

// 规则配置
const rulesConfig = {
  // 通用属性
  common: {
    type: "http",
    format: "yaml",
    interval: 86400, // 24小时
    behavior: "classical",
  },
  // 规则提供
  ruleProviders: {
    proxy: [
      "AI",
      "Cloudflare",
      "DevSites",
      "Docker",
      "GitHub",
      "Google",
      "JsDelivr",
      "Microsoft",
      "Misc",
      "Mozilla",
      "Overleaf",
      "Scholar",
      "SourceForge",
      "Wikipedia",
      "Yandex",
      "YouTube",
    ],
    direct: ["Bing", "China"],
  },
};

/**
 * 生成DNS配置
 * @returns {Object} DNS配置对象
 */
function createDnsConfig() {
  // 组建包含 IPV4 和 IPV6 的默认 DNS 服务器
  let defaultDns = [...dnsConfig.nameservers.ipv4.default];
  if (dnsConfig.ipv6) {
    defaultDns.push(...dnsConfig.nameservers.ipv6.default);
  }

  // 组建包含 IPV4 和 IPV6 的回退 DNS 服务器
  let fallbackDns = [...dnsConfig.nameservers.ipv4.foreign];
  if (dnsConfig.ipv6) {
    fallbackDns.push(...dnsConfig.nameservers.ipv6.foreign);
  }

  // 组合国内与国外的DoH服务器
  let allDoH = [
    ...dnsConfig.nameservers.doh.domestic,
    ...dnsConfig.nameservers.doh.foreign,
  ];

  // 最终的DNS配置
  let config = {
    enable: true,
    ipv6: dnsConfig.ipv6,
    listen: ":1053",
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "use-hosts": true,
    // 默认
    "default-nameserver": defaultDns,
    // 默认走加密DNS（DoH/DoT）
    nameserver: dnsConfig.nameservers.doh.domestic,
    "fake-ip-filter": dnsConfig.fakeIpFilters,
    // 回退走国外的DoH
    fallback: fallbackDns,
    "fallback-filter": dnsConfig.fallbackFilter,
    "proxy-server-nameserver": allDoH,
  };

  return config;
}

/**
 * 高效生成规则提供器URL
 * @param {string} name - 规则名称
 * @returns {string} 完整的URL
 */
function createRuleUrl(name) {
  let baseUrl = RULE_URL;
  const path = `${name}.yaml`;
  return `${baseUrl}${path}`;
}

/**
 * 生成单个规则提供器配置
 * @param {string} name - 规则名称
 * @returns {Object} 规则提供器对象
 */
function createRuleProvider(name) {
  let ruleProvider = {
    ...rulesConfig.common,
    url: createRuleUrl(name),
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

  console.log(
    `正在生成 ${rulesConfig.ruleProviders.direct.length} 个直连规则提供器`
  );
  // 获取直连规则
  rulesConfig.ruleProviders.direct.forEach((name) => {
    const provider = createRuleProvider(name);
    providers[name] = provider;
  });

  console.log(
    `正在生成 ${rulesConfig.ruleProviders.proxy.length} 个代理规则提供器`
  );
  // 获取代理规则
  rulesConfig.ruleProviders.proxy.forEach((name) => {
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
  console.log(`添加 ${rulesConfig.ruleProviders.direct.length} 个直连规则`);
  rulesConfig.ruleProviders.direct.forEach((name) => {
    const ruleStr = `RULE-SET,${name},DIRECT`;
    rules.push(ruleStr);
  });

  // 添加代理规则
  console.log(`添加 ${rulesConfig.ruleProviders.proxy.length} 个代理规则`);
  rulesConfig.ruleProviders.proxy.forEach((name) => {
    const ruleStr = `RULE-SET,${name},${PROXY_GROUP_NAME}`;
    rules.push(ruleStr);
  });

  // 添加 GEO 策略
  console.log("添加 GEO 策略规则");
  rules.push("GEOIP,LAN,DIRECT");
  rules.push("GEOIP,CN,DIRECT");
  rules.push("GEOSITE,CN,DIRECT");

  // 添加匹配代理规则
  console.log("添加匹配代理规则");
  rules.push(`MATCH,${PROXY_GROUP_NAME}`);

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
  // 判断传入参数是否有效且为数组类型
  if (
    !Array.isArray(items) ||
    !Array.isArray(keywords) ||
    items.length === 0 ||
    keywords.length === 0
  ) {
    return [];
  }

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
 * @param {string} regionType - 地区类型 ('PRIMARY'|'OPTIONAL'|'ALL')
 * @returns {Array} 匹配的节点组
 */
function extractRegionProxies(proxies, regionType) {
  // 判断是否传入有效的代理列表
  if (!Array.isArray(proxies) || proxies.length === 0) return [];

  // 如果地区类型为 ALL，返回所有节点
  if (regionType == "ALL") {
    return proxies.map((item) => item.name).filter(Boolean);
  }

  // 如果地区类型为 PRIMARY 或 OPTIONAL，提取对应的关键词
  let keywords;
  if (regionType === "PRIMARY") {
    keywords = loadBalanceConfig.region.primary;
  } else if (regionType === "OPTIONAL") {
    keywords = loadBalanceConfig.region.optional;
  } else {
    console.warn(`未知的地区类型: ${regionType}`);
    return [];
  }

  // 匹配的代理节点组
  const matchedProxies = filterByKeywords(proxies, keywords);

  return matchedProxies;
}

/**
 * 创建负载均衡组配置
 * @param {Array} proxies - 节点列表
 * @returns {Object} 负载均衡组配置对象
 */

/**
 * 记录节点提取结果
 * @param {string} groupName - 代理组名称
 * @param {number} primaryCount - 主要地区节点数量
 * @param {number} optionalCount - 可选地区节点数量
 * @param {number} totalCount - 总节点数量
 */
function logExtractionResults(primaryCount, optionalCount, totalCount) {
  console.log(`提取到 ${primaryCount} 个主要地区节点（香港、台湾、新加坡）`);
  console.log(`提取到 ${optionalCount} 个可选地区节点（日本、韩国）`);
  console.log(`总计提取到 ${totalCount} 个负载均衡节点`);
}

/**
 * 创建负载均衡组
 * @param {Array} proxies - 代理节点列表
 * @returns {Object} 处理结果 loadBalanceGroup
 */
const createLoadBalanceGroup = (proxies) => {
  if (!Array.isArray(proxies)) {
    console.warn(`代理组没有有效的 proxies 列表`);
    return null;
  }

  // 记录提取的节点个数
  let primaryCount = 0;
  let optionalCount = 0;
  let targetCount = 0;

  // 提取主要地区节点
  console.log("提取主要地区节点");
  const primaryProxies = extractRegionProxies(proxies, "PRIMARY");
  primaryCount = primaryProxies.length;
  let targetGroupProxies = [...primaryProxies];
  targetCount = targetGroupProxies.length;

  // 如果主要地区节点不足，尝试添加可选地区节点
  if (primaryCount < loadBalanceConfig.base.minNodesThreshold) {
    console.log("主要地区节点不足，尝试添加可选地区节点");
    const optionalProxies = extractRegionProxies(proxies, "OPTIONAL");
    targetGroupProxies.push(...optionalProxies);
    optionalCount = optionalProxies.length;
    targetCount = targetGroupProxies.length;
  }

  // 如果主要地区节点和可选节点均不足，考虑添加所有节点到负载均衡组
  if (primaryCount + optionalCount < loadBalanceConfig.base.minNodesThreshold) {
    console.log("主要地区节点和可选地区节点均不足，添加所有节点");
    const allProxies = extractRegionProxies(proxies, "ALL");
    targetGroupProxies = allProxies;
    targetCount = targetGroupProxies.length;
  }

  // 记录提取结果
  logExtractionResults(primaryCount, optionalCount, targetCount);

  // 记录负载均衡组的节点信息
  const loadBalanceGroup = {
    name: loadBalanceConfig.base.groupName,
    type: "load-balance",
    strategy: loadBalanceConfig.base.strategy,
    proxies: targetGroupProxies,
    url: loadBalanceConfig.base.healthCheckUrl,
    interval: loadBalanceConfig.base.healthCheckInterval,
    timeout: loadBalanceConfig.base.timeout,
    lazy: true,
  };

  return loadBalanceGroup;
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
  return false;
}

/**
 * 处理代理组配置
 * @param {Object} config - 配置对象
 * @returns {Object} 新的代理组配置
 */
const processProxyGroupsConfig = (config) => {
  if (!Array.isArray(config["proxy-groups"])) {
    console.warn("配置中未找到 proxy-groups，跳过代理组修改");
    return [];
  }

  // 创建负载均衡组
  console.log("正在创建负载均衡组...");
  const loadBalanceGroup = createLoadBalanceGroup(config["proxies"]);

  // 如果负载均衡组存在，则添加到配置中
  let proxyGroups = config["proxy-groups"];
  if (loadBalanceGroup) {
    console.log(`负载均衡组已创建: ${loadBalanceGroup.name}，并添加到代理组中`);
    proxyGroups.push(loadBalanceGroup);
  }

  return proxyGroups;
};

/**
 * 生成配置摘要
 * @param {Object} configurations - 配置对象
 * @param {number} executionTime - 执行时间
 * @returns {void}
 */
const logConfigurationSummary = (configurations, executionTime) => {
  console.log("配置处理完成");
  console.log("DNS配置: 已更新");
  console.log(
    `规则提供器: ${Object.keys(configurations["rule-providers"]).length} 个`
  );
  console.log(`路由规则: ${configurations.rules.length} 条`);
  console.log(`执行时间: ${executionTime}ms`);
};

/**
 * 主配置函数 - Clash Verge 脚本入口点
 * @param {Object} config - 原始Clash配置对象
 * @param {string} [profileName] - 配置文件名称
 * @returns {Object} 修改后的配置对象
 */
function main(config, profileName = "Unknown") {
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

    // 记录执行结果
    const executionTime = Date.now() - startTime;
    logConfigurationSummary(configurations, executionTime);

    return config;
  } catch (error) {
    console.error(`配置处理失败: ${error.message}`);
    console.error(`错误堆栈: ${error.stack}`);
    console.warn("返回原始配置以确保Clash正常运行");
    return config;
  }
}

// 导出main函数，方便程序调试
// module.exports = { main };
