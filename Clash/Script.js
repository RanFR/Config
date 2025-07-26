/**
 * Clash Verge 配置脚本
 * 用于自动配置DNS、规则提供器和路由规则
 * @author RanFR
 * @version 1.5.2
 * @date 2025-07-26
 */

// ==================== 常量定义 ====================

/** 代理服务器组名称 - 设置要处理的代理组名称，例如 "Auto" 或 "PROXY" */
const PROXY_GROUP_NAME = "";

/** 负载均衡配置选项 */
const LOAD_BALANCE_CONFIG = {
  /** 最小节点数量阈值 - 当主要地区节点少于此数量时，会添加可选地区节点 */
  MIN_NODES_THRESHOLD: 5,
  /** 是否允许添加可选地区节点（日本、韩国） */
  ALLOW_OPTIONAL_REGIONS: true,
  /** 负载均衡组名称 */
  GROUP_NAME: "LoadBalance",
  /** 负载均衡策略 */
  STRATEGY: "consistent-hashing",
  /** 健康检查URL */
  HEALTH_CHECK_URL: "http://www.gstatic.com/generate_204",
  /** 健康检查间隔（秒） */
  HEALTH_CHECK_INTERVAL: 300,
  /** 容错阈值（毫秒） */
  TOLERANCE: 50,
};

/** 地区节点配置 */
const REGION_CONFIG = {
  /** 主要地区关键词（香港、台湾、新加坡） */
  PRIMARY: [
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
  /** 可选地区关键词（日本、韩国） */
  OPTIONAL: ["日本", "韩国", "Japan", "South Korea", "jp", "kr"],
};

/** 规则更新间隔 (秒) */
const RULE_UPDATE_INTERVAL = 86400; // 24小时

/** 基础URL配置 */
const URLS = {
  BASE_RULE: "",
  SELF_RULE: "",
};

/** DNS服务器配置 */
const DNS_SERVERS = {
  // 国内DNS服务器
  DOMESTIC: [
    "223.5.5.5", // 阿里DNS
    "223.6.6.6", // 阿里DNS
    "119.29.29.29", // 腾讯DNS
    "182.254.116.116", // 腾讯DNS
  ],
  // 国外DNS服务器
  INTERNATIONAL: [
    "1.1.1.1", // Cloudflare
    "1.0.0.1", // Cloudflare
    "8.8.8.8", // Google
    "8.8.4.4", // Google
  ],
  // IPv6 DNS服务器
  IPV6: [
    "2400:3200::1", // 阿里DNS IPv6
    "2400:3200:baba::1", // 阿里DNS IPv6
    "2606:4700:4700::1111", // Cloudflare IPv6
    "2606:4700:4700::1001", // Cloudflare IPv6
    "2001:4860:4860::8888", // Google IPv6
    "2001:4860:4860::8844", // Google IPv6
  ],
  // DoH服务器
  DOH: [
    "https://dns.alidns.com/dns-query",
    "https://doh.pub/dns-query",
    "https://cloudflare-dns.com/dns-query",
  ],
};

/** Fake IP过滤列表 */
const FAKE_IP_FILTERS = [
  "*.lan",
  "*.local",
  "*.arpa",
  "time.*.com",
  "ntp.*.com",
  "*.msftncsi.com",
  "www.msftconnecttest.com",
];

/** 回退过滤器配置 */
const FALLBACK_FILTER = {
  geoip: true,
  "geoip-code": "CN",
  ipcidr: ["240.0.0.0/4", "0.0.0.0/32"],
  domain: ["+.google.com", "+.facebook.com", "+.youtube.com"],
};

// ==================== DNS配置 ====================

/**
 * 生成DNS配置
 * @returns {Object} DNS配置对象
 */
function createDnsConfig() {
  return {
    enable: true,
    listen: ":1053",
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter-mode": "blacklist",
    "prefer-h3": false,
    "respect-rules": false,
    "use-hosts": false,
    "use-system-hosts": false,
    ipv6: true,
    "fake-ip-filter": FAKE_IP_FILTERS,
    "default-nameserver": DNS_SERVERS.DOMESTIC,
    nameserver: [
      ...DNS_SERVERS.DOMESTIC,
      ...DNS_SERVERS.INTERNATIONAL,
      ...DNS_SERVERS.IPV6,
    ],
    "direct-nameserver-follow-policy": false,
    "fallback-filter": FALLBACK_FILTER,
    "proxy-server-nameserver": DNS_SERVERS.DOH,
  };
}

// ==================== 规则提供器配置 ====================

/** 规则提供器通用属性 */
const RULE_PROVIDER_COMMON = {
  type: "http",
  format: "yaml",
  interval: RULE_UPDATE_INTERVAL,
  behavior: "classical",
};

/** 规则提供器定义 */
const RULE_PROVIDERS_CONFIG = {
  // 直连规则(使用DIRECT)
  direct: [
    { name: "Bing", source: "base" },
    { name: "SteamCN", source: "base" },
  ],

  // 代理规则 (使用代理组)
  proxy: [
    { name: "Amazon", source: "base" },
    { name: "Claude", source: "self", path: "Claude.yaml" },
    { name: "Cloudflare", source: "base" },
    { name: "Developer", source: "base" },
    { name: "Docker", source: "base" },
    { name: "GitHub", source: "base" },
    { name: "Google", source: "base" },
    { name: "Intel", source: "self", path: "Intel.yaml" },
    { name: "Logitech", source: "base" },
    { name: "Microsoft", source: "base" },
    { name: "Misc", source: "self", path: "Misc.yaml" },
    { name: "Mozilla", source: "base" },
    { name: "Nvidia", source: "base" },
    { name: "OpenAI", source: "base" },
    { name: "Overleaf", source: "self", path: "Overleaf.yaml" },
    { name: "Python", source: "base" },
    { name: "Ruby", source: "self", path: "Ruby.yaml" },
    { name: "Scholar", source: "base" },
    { name: "SourceForge", source: "base" },
    { name: "Steam", source: "base" },
    { name: "Ubuntu", source: "base" },
    { name: "Wikipedia", source: "base" },
    { name: "YouTube", source: "base" },
    { name: "Zoom", source: "self", path: "Zoom.yaml" },
  ],
};

/**
 * 生成规则提供器URL
 * @param {string} name - 规则名称
 * @param {string} source - 来源类型 (base/self)
 * @param {string} customPath - 自定义路径
 * @returns {string} 完整的URL
 */
function createRuleUrl(name, source, customPath = null) {
  const baseUrl = source === "self" ? URLS.SELF_RULE : URLS.BASE_RULE;
  const path = customPath || `${name}/${name}.yaml`;
  return `${baseUrl}${path}`;
}

/**
 * 生成单个规则提供器配置
 * @param {Object} rule - 规则配置
 * @returns {Object} 规则提供器对象
 */
function createRuleProvider(rule) {
  return {
    ...RULE_PROVIDER_COMMON,
    url: createRuleUrl(rule.name, rule.source, rule.path),
    path: `RuleProvider/${rule.name}.yaml`,
  };
}

/**
 * 生成所有规则提供器
 * @returns {Object} 所有规则提供器配置
 */
function createAllRuleProviders() {
  const providers = {};

  // 合并所有规则配置
  const allRules = [
    ...RULE_PROVIDERS_CONFIG.direct,
    ...RULE_PROVIDERS_CONFIG.proxy,
  ];

  console.log(`正在生成 ${allRules.length} 个规则提供器`);

  // 生成每个规则提供器
  allRules.forEach((rule) => {
    const provider = createRuleProvider(rule);
    providers[rule.name] = provider;
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
  console.log(`添加 ${RULE_PROVIDERS_CONFIG.direct.length} 个直连规则`);
  RULE_PROVIDERS_CONFIG.direct.forEach((rule) => {
    const ruleStr = `RULE-SET,${rule.name},DIRECT`;
    rules.push(ruleStr);
  });

  // 添加代理规则
  console.log(`添加 ${RULE_PROVIDERS_CONFIG.proxy.length} 个代理规则`);
  RULE_PROVIDERS_CONFIG.proxy.forEach((rule) => {
    const ruleStr = `RULE-SET,${rule.name},${PROXY_GROUP_NAME}`;
    rules.push(ruleStr);
  });

  // 添加 GEOIP 策略
  rules.push("GEOIP,CN,DIRECT");
  rules.push("GEOIP,LAN,DIRECT");

  // 添加默认规则
  rules.push("MATCH,DIRECT");

  console.log(`总共生成了 ${rules.length} 条路由规则`);
  return rules;
}

// ==================== 代理组配置 ====================

/**
 * 提取指定地区的节点
 * @param {Array} proxies - 节点列表
 * @param {Array} regions - 地区关键词列表
 * @returns {Array} 匹配的节点列表
 */
function extractRegionProxies(proxies, regions) {
  // 参数验证
  if (!Array.isArray(proxies) || !Array.isArray(regions)) {
    console.warn("extractRegionProxies: 无效的参数类型");
    return [];
  }

  if (proxies.length === 0 || regions.length === 0) {
    return [];
  }

  // 预处理地区关键词为小写，提高匹配性能
  const lowerRegions = regions
    .map((region) => (typeof region === "string" ? region.toLowerCase() : ""))
    .filter(Boolean);

  return proxies.filter((proxy) => {
    if (typeof proxy !== "string" || proxy.trim() === "") {
      return false;
    }

    const proxyLower = proxy.toLowerCase();
    return lowerRegions.some((region) => proxyLower.includes(region));
  });
}

/**
 * 创建负载均衡组配置
 * @param {Array} proxies - 节点列表
 * @returns {Object} 负载均衡组配置对象
 */
function createLoadBalanceGroup(proxies) {
  return {
    name: LOAD_BALANCE_CONFIG.GROUP_NAME,
    type: "load-balance",
    strategy: LOAD_BALANCE_CONFIG.STRATEGY,
    proxies: [...proxies], // 创建副本避免引用问题
    url: LOAD_BALANCE_CONFIG.HEALTH_CHECK_URL,
    interval: LOAD_BALANCE_CONFIG.HEALTH_CHECK_INTERVAL,
    tolerance: LOAD_BALANCE_CONFIG.TOLERANCE,
    lazy: true,
  };
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
  } else if (primaryCount >= LOAD_BALANCE_CONFIG.MIN_NODES_THRESHOLD) {
    console.log(
      `主要地区节点数量充足（${primaryCount} >= ${LOAD_BALANCE_CONFIG.MIN_NODES_THRESHOLD}），跳过添加可选地区节点`
    );
  } else if (!LOAD_BALANCE_CONFIG.ALLOW_OPTIONAL_REGIONS) {
    console.log("可选地区节点功能已禁用，跳过添加日本和韩国节点");
  }

  console.log(`总计提取到 ${totalCount} 个负载均衡节点`);
}

/**
 * 处理单个代理组，提取地区节点并创建负载均衡组
 * @param {Object} group - 代理组对象
 * @returns {Object} 处理结果 { modifiedGroup, loadBalanceGroup }
 */
function processProxyGroup(group) {
  if (!group.proxies || !Array.isArray(group.proxies)) {
    console.warn(`代理组 ${group.name} 没有有效的 proxies 列表`);
    return { modifiedGroup: group, loadBalanceGroup: null };
  }

  // 提取主要地区节点
  const primaryProxies = extractRegionProxies(
    group.proxies,
    REGION_CONFIG.PRIMARY
  );
  let targetGroupProxies = [...primaryProxies];

  // 检查是否需要添加可选地区节点
  let optionalCount = 0;
  if (
    LOAD_BALANCE_CONFIG.ALLOW_OPTIONAL_REGIONS &&
    primaryProxies.length < LOAD_BALANCE_CONFIG.MIN_NODES_THRESHOLD
  ) {
    const optionalProxies = extractRegionProxies(
      group.proxies,
      REGION_CONFIG.OPTIONAL
    );
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

  // 如果没有提取到任何节点，返回原组
  if (targetGroupProxies.length === 0) {
    console.warn(`代理组 ${group.name} 中未找到目标地区节点`);
    return { modifiedGroup: group, loadBalanceGroup: null };
  }

  // 从原代理组中移除已提取的节点
  const allTargetRegions = [
    ...REGION_CONFIG.PRIMARY,
    ...REGION_CONFIG.OPTIONAL,
  ];
  const regionProxies = extractRegionProxies(group.proxies, allTargetRegions);
  const remainingProxies = group.proxies.filter(
    (proxy) => !regionProxies.includes(proxy)
  );

  // 将LoadBalance组添加到代理组的proxies列表开头
  const updatedProxies = [LOAD_BALANCE_CONFIG.GROUP_NAME, ...remainingProxies];

  // 创建负载均衡组
  const loadBalanceGroup = createLoadBalanceGroup(targetGroupProxies);

  return {
    modifiedGroup: { ...group, proxies: updatedProxies },
    loadBalanceGroup,
  };
}

/**
 * 修改代理组配置
 * @param {Array} proxyGroups - 代理组列表
 * @returns {Array} 修改后的代理组列表
 */
function modifyProxyGroups(proxyGroups) {
  // 参数验证
  if (!Array.isArray(proxyGroups)) {
    console.warn("代理组配置不是数组，跳过修改");
    return proxyGroups;
  }

  if (!PROXY_GROUP_NAME || PROXY_GROUP_NAME.trim() === "") {
    console.warn("PROXY_GROUP_NAME 为空，请在常量定义中设置正确的代理组名称");
    return proxyGroups;
  }

  let loadBalanceGroup = null;
  const modifiedGroups = [];

  // 处理每个代理组
  for (const group of proxyGroups) {
    if (group.name === PROXY_GROUP_NAME) {
      const result = processProxyGroup(group);
      modifiedGroups.push(result.modifiedGroup);

      if (result.loadBalanceGroup) {
        loadBalanceGroup = result.loadBalanceGroup;
        console.log(
          `创建负载均衡组 "${LOAD_BALANCE_CONFIG.GROUP_NAME}"，包含 ${result.loadBalanceGroup.proxies.length} 个节点`
        );
      }
    } else {
      modifiedGroups.push(group);
    }
  }

  // 添加负载均衡组到列表末尾
  if (loadBalanceGroup) {
    modifiedGroups.push(loadBalanceGroup);
  } else {
    console.warn(
      `未在代理组 "${PROXY_GROUP_NAME}" 中找到目标地区节点，未创建负载均衡组`
    );
  }

  return modifiedGroups;
}

// ==================== 主函数 ====================

/**
 * 主配置函数 - Clash Verge 脚本入口点
 * @param {Object} config - 原始Clash配置对象
 * @param {string} profileName - 配置文件名称
 * @returns {Object} 修改后的配置对象
 */
function main(config, profileName) {
  const startTime = Date.now();

  try {
    // 验证输入参数
    if (!config || typeof config !== "object") {
      throw new Error("Invalid config object provided");
    }

    console.log(`开始处理配置文件: ${profileName || "Unknown"}`);

    // 生成各个配置组件
    const configurations = {
      dns: createDnsConfig(),
      "rule-providers": createAllRuleProviders(),
      rules: createRoutingRules(),
    };

    // 修改代理组配置
    if (config["proxy-groups"]) {
      const originalGroupCount = config["proxy-groups"].length;
      config["proxy-groups"] = modifyProxyGroups(config["proxy-groups"]);
      console.log(
        `代理组配置: ${originalGroupCount} -> ${config["proxy-groups"].length} 个组`
      );
    } else {
      console.warn("配置中未找到 proxy-groups，跳过代理组修改");
    }

    // 应用配置到原始config对象
    Object.assign(config, configurations);

    // 输出统计信息
    const executionTime = Date.now() - startTime;
    console.log("=".repeat(50));
    console.log("配置处理完成:");
    console.log(`- DNS配置: 已更新`);
    console.log(
      `- 规则提供器: ${Object.keys(configurations["rule-providers"]).length} 个`
    );
    console.log(`- 路由规则: ${configurations["rules"].length} 条`);
    console.log(`- 代理组: 已处理`);
    console.log(`- 执行时间: ${executionTime}ms`);
    console.log("=".repeat(50));

    return config;
  } catch (error) {
    console.error(`配置处理失败: ${error.message}`);
    console.error(`错误堆栈: ${error.stack}`);

    // 返回原始配置以避免完全失败
    console.warn("返回原始配置以确保Clash正常运行");
    return config;
  }
}
