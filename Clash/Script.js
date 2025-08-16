/**
 * Clash Verge 配置脚本
 * 用于自动配置DNS、规则提供器和路由规则
 * @author RanFR
 * @version 1.7.1
 * @date 2025-08-16
 * @description 新增Yandex和Reddit规则
 **/

// 代理服务器组名称
const PROXY_GROUP_NAME = "";

// 规则URL配置
const RULE_URL = "";

/** DNS配置 */
const dnsConfig = {
  nameservers: {
    // 国内DNS服务器
    domestic: [
      "223.5.5.5", // 阿里
      "223.6.6.6", // 阿里
      "119.29.29.29", // 腾讯
      "182.254.116.116", // 腾讯
    ],
    // 国外DNS服务器
    international: [
      "1.1.1.1", // Cloudflare
      "1.0.0.1", // Cloudflare
      "8.8.8.8", // Google
      "8.8.4.4", // Google
    ],
    // IPv6 DNS服务器
    ipv6: [
      "2400:3200::1", // 阿里
      "2400:3200:baba::1", // 阿里
      "2606:4700:4700::1111", // Cloudflare
      "2606:4700:4700::1001", // Cloudflare
      "2001:4860:4860::8888", // Google
      "2001:4860:4860::8844", // Google
    ],
    // DoH服务器
    doh: [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query",
      "https://cloudflare-dns.com/dns-query",
    ],
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
  },
};

// 负载均衡配置
const loadBalanceConfig = {
  // 基础负载均衡配置
  base: {
    /*
    最小节点数量阈值
    主要地区节点少于此数量时，添加可选地区节点
    */
    minNodesThreshold: 5,
    // 负载均衡组名称
    groupName: "LoadBalance",
    // 负载均衡策略
    strategy: "consistent-hashing",
    // 健康检查URL
    healthCheckUrl: "http://www.gstatic.com/generate_204",
    // 健康检查间隔（秒）
    healthCheckInterval: 300,
    // 容错阈值（毫秒）
    tolerance: 300,
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
  ruleProviders: [
    "AI",
    "Cloudflare",
    "DevSites",
    "Docker",
    "GitHub",
    "Google",
    "JsDelivr",
    "Microsoft",
    "Misc",
    "Overleaf",
    "Scholar",
    "SourceForge",
    "Wikipedia",
    "Yandex",
    "YouTube",
  ],
};

/**
 * 生成DNS配置
 * @returns {Object} DNS配置对象
 */
function createDnsConfig() {
  // 定义DNS服务器配置
  let allNameservers = [
    ...dnsConfig.nameservers.domestic,
    ...dnsConfig.nameservers.international,
    ...dnsConfig.nameservers.ipv6,
    ...dnsConfig.nameservers.doh,
  ];

  let config = {
    enable: true,
    ipv6: true,
    listen: ":1053",
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "use-hosts": true,
    "default-nameserver": dnsConfig.nameservers.domestic,
    nameserver: allNameservers,
    "fake-ip-filter": dnsConfig.fakeIpFilters,
    fallback: dnsConfig.nameservers.international,
    "fallback-filter": dnsConfig.fallbackFilter,
    "proxy-server-nameserver": dnsConfig.nameservers.doh,
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

  console.log(`正在生成 ${rulesConfig.ruleProviders.length} 个规则提供器`);

  // 获取规则
  rulesConfig.ruleProviders.forEach((name) => {
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

  // 添加代理规则
  console.log(`添加 ${rulesConfig.ruleProviders.length} 个代理规则`);
  rulesConfig.ruleProviders.forEach((name) => {
    const ruleStr = `RULE-SET,${name},${PROXY_GROUP_NAME}`;
    rules.push(ruleStr);
  });

  // 添加 GEO 策略
  console.log("添加 GEO 策略规则");
  rules.push("GEOIP,LAN,DIRECT");
  rules.push("GEOIP,CN,DIRECT");
  rules.push("GEOSITE,CN,DIRECT");

  // 添加默认直连规则
  console.log("添加默认直连规则");
  rules.push("MATCH,DIRECT");

  console.log(`总共生成了 ${rules.length} 条路由规则`);
  return rules;
}

/**
 * 高效提取指定地区的节点（直接在此处小写关键词）
 * @param {Array} proxies - 节点列表
 * @param {string} regionType - 地区类型 ('PRIMARY', 'OPTIONAL')
 * @returns {Array} 匹配的节点列表
 */

/**
 * 通用关键词过滤函数
 * @param {Array} items - 待过滤的字符串数组
 * @param {Array} keywords - 关键词数组
 * @param {Object} [options] - 可选项 { ignoreCase: true/false }
 * @returns {Array} 匹配的字符串数组
 */
function filterByKeywords(items, keywords, options = { ignoreCase: true }) {
  if (
    !Array.isArray(items) ||
    !Array.isArray(keywords) ||
    items.length === 0 ||
    keywords.length === 0
  ) {
    return [];
  }
  const ignoreCase = options.ignoreCase !== false;
  return items.filter((item) => {
    if (typeof item !== "string" || !item.trim()) return false;
    const target = ignoreCase ? item.toLowerCase() : item;
    return keywords.some((kw) => {
      if (typeof kw !== "string" || !kw.trim()) return false;
      const keyword = ignoreCase ? kw.toLowerCase() : kw;
      return target.includes(keyword);
    });
  });
}

/**
 * 按地区类型提取节点
 * @param {Array} proxies - 节点列表
 * @param {string} regionType - 地区类型 ('PRIMARY'|'OPTIONAL')
 * @returns {Array} 匹配的节点
 */
function extractRegionProxies(proxies, regionType) {
  if (!Array.isArray(proxies) || proxies.length === 0) return [];
  let keywords;
  if (regionType === "PRIMARY") {
    keywords = loadBalanceConfig.region.primary;
  } else if (regionType === "OPTIONAL") {
    keywords = loadBalanceConfig.region.optional;
  } else {
    console.warn(`未知的地区类型: ${regionType}`);
    return [];
  }
  return filterByKeywords(proxies, keywords, { ignoreCase: true });
}

/**
 * 创建负载均衡组配置
 * @param {Array} proxies - 节点列表
 * @returns {Object} 负载均衡组配置对象
 */

/**
 * 创建负载均衡组配置
 * @param {Array} proxies - 节点列表
 * @returns {Object} 负载均衡组配置对象
 */
function createLoadBalanceGroup(proxies) {
  const loadBalanceGroup = {
    name: loadBalanceConfig.base.groupName,
    type: "load-balance",
    strategy: loadBalanceConfig.base.strategy,
    proxies: proxies,
    url: loadBalanceConfig.base.healthCheckUrl,
    interval: loadBalanceConfig.base.healthCheckInterval,
    tolerance: loadBalanceConfig.base.tolerance,
    lazy: true,
  };

  return loadBalanceGroup;
}

/**
 * 记录节点提取结果
 * @param {string} groupName - 代理组名称
 * @param {number} primaryCount - 主要地区节点数量
 * @param {number} optionalCount - 可选地区节点数量
 * @param {number} totalCount - 总节点数量
 */
function logExtractionResults(
  groupName,
  primaryCount,
  optionalCount,
  totalCount
) {
  console.log(`正在处理代理组: ${groupName}`);
  console.log(`提取到 ${primaryCount} 个主要地区节点（香港、台湾、新加坡）`);

  if (optionalCount > 0) {
    console.log(`已添加 ${optionalCount} 个可选地区节点（日本、韩国）`);
  } else if (primaryCount >= loadBalanceConfig.base.minNodesThreshold) {
    console.log(
      `主要地区节点数量充足（${primaryCount} >= ${loadBalanceConfig.base.minNodesThreshold}），跳过添加可选地区节点`
    );
  } else {
    console.warn(
      `主要地区节点数量不足（${primaryCount} < ${loadBalanceConfig.base.minNodesThreshold}），但未添加可选地区节点`
    );
  }

  console.log(`总计提取到 ${totalCount} 个负载均衡节点`);
}

/**
 * 处理单个代理组，提取地区节点并创建负载均衡组
 * @param {Object} group - 代理组对象
 * @param {string} group.name - 代理组名称
 * @param {Array} group.proxies - 代理节点列表
 * @returns {Object} 处理结果 { modifiedGroup, loadBalanceGroup }
 */
const processProxyGroup = (group) => {
  if (!Array.isArray(group.proxies)) {
    console.warn(`代理组 ${group.name} 没有有效的 proxies 列表`);
    return { modifiedGroup: group, loadBalanceGroup: null };
  }

  // 提取主要地区节点
  const primaryProxies = extractRegionProxies(group.proxies, "PRIMARY");
  let targetGroupProxies = [...primaryProxies];
  let optionalCount = 0;

  // 如果主要地区节点不足，尝试添加可选地区节点
  if (primaryProxies.length < loadBalanceConfig.base.minNodesThreshold) {
    const optionalProxies = extractRegionProxies(group.proxies, "OPTIONAL");
    if (optionalProxies.length > 0) {
      targetGroupProxies.push(...optionalProxies);
      optionalCount = optionalProxies.length;
    }
  }

  // 记录提取结果
  logExtractionResults(
    group.name,
    primaryProxies.length,
    optionalCount,
    targetGroupProxies.length
  );

  // 如果没有找到目标地区节点，返回原组
  if (targetGroupProxies.length === 0) {
    console.warn(`代理组 ${group.name} 中未找到目标地区节点`);
    return { modifiedGroup: group, loadBalanceGroup: null };
  }

  // 构建更新后的代理列表
  const updatedProxies = [loadBalanceConfig.base.groupName, ...group.proxies];
  const loadBalanceGroup = createLoadBalanceGroup(targetGroupProxies);

  return {
    modifiedGroup: { ...group, proxies: updatedProxies },
    loadBalanceGroup,
  };
};

/**
 * 修改代理组配置
 * @param {Array} proxyGroups - 代理组列表
 * @returns {Array} 修改后的代理组列表
 */
const modifyProxyGroups = (proxyGroups) => {
  let loadBalanceGroup = null;

  const modifiedGroups = proxyGroups.map((group) => {
    if (group.name === PROXY_GROUP_NAME) {
      const result = processProxyGroup(group);
      if (result.loadBalanceGroup) {
        loadBalanceGroup = result.loadBalanceGroup;
        console.log(
          `创建负载均衡组，包含 ${result.loadBalanceGroup.proxies.length} 个节点`
        );
      }
      return result.modifiedGroup;
    }
    return group;
  });

  if (loadBalanceGroup) {
    modifiedGroups.push(loadBalanceGroup);
  } else {
    console.warn(
      `未在代理组 "${PROXY_GROUP_NAME}" 中找到目标地区节点，未创建负载均衡组`
    );
  }

  return modifiedGroups;
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
 * @returns {void}
 */
const processProxyGroupsConfig = (config) => {
  if (!Array.isArray(config["proxy-groups"])) {
    console.warn("配置中未找到 proxy-groups，跳过代理组修改");
    return;
  }

  const originalGroupCount = config["proxy-groups"].length;
  config["proxy-groups"] = modifyProxyGroups(config["proxy-groups"]);
  console.log(
    `代理组配置: ${originalGroupCount} -> ${config["proxy-groups"].length} 个组`
  );
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
  console.log("代理组: 已处理");
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
    };

    // 处理代理组
    processProxyGroupsConfig(config);

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
