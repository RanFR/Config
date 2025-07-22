/**
 * Clash Verge 配置脚本
 * 用于自动配置DNS、规则提供器和路由规则
 * @author RanFR
 * @version 1.4.0
 * @date 2025-07-22
 */

// ==================== 常量定义 ====================

/** 代理服务器组名称 - 设置要处理的代理组名称，例如 "Auto" 或 "PROXY" */
const PROXY_GROUP_NAME = "Auto";

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
  // 直连规则 (使用DIRECT) - 在代理规则前执行
  direct_priority: [
    { name: "Bing", source: "base" },
    { name: "SteamCN", source: "base" },
  ],

  // 直连规则 (使用DIRECT) - 在代理规则后执行
  direct_fallback: [{ name: "China", source: "self", path: "China.yaml" }],

  // 代理规则 (使用代理组)
  proxy: [
    { name: "Amazon", source: "base" },
    { name: "Claude", source: "self", path: "Claude.yaml" },
    { name: "Cloudflare", source: "base" },
    { name: "Developer", source: "base" },
    { name: "Docker", source: "base" },
    { name: "GitHub", source: "base" },
    { name: "Google", source: "base" },
    { name: "Intel", source: "self", path: "intel.yaml" },
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
    ...RULE_PROVIDERS_CONFIG.direct_priority,
    ...RULE_PROVIDERS_CONFIG.direct_fallback,
    ...RULE_PROVIDERS_CONFIG.proxy,
  ];

  // 生成每个规则提供器
  allRules.forEach((rule) => {
    providers[rule.name] = createRuleProvider(rule);
  });

  return providers;
}

/**
 * 生成路由规则列表
 * @returns {Array} 规则列表
 */
function createRoutingRules() {
  const rules = [];

  // 添加优先直连规则（在代理规则前）
  RULE_PROVIDERS_CONFIG.direct_priority.forEach((rule) => {
    rules.push(`RULE-SET,${rule.name},DIRECT`);
  });

  // 添加代理规则
  RULE_PROVIDERS_CONFIG.proxy.forEach((rule) => {
    rules.push(`RULE-SET,${rule.name},${PROXY_GROUP_NAME}`);
  });

  // 添加后备直连规则（在代理规则后）
  RULE_PROVIDERS_CONFIG.direct_fallback.forEach((rule) => {
    rules.push(`RULE-SET,${rule.name},DIRECT`);
  });

  // 添加 GEOIP 策略
  rules.push("GEOIP,CN,DIRECT");
  rules.push("GEOIP,LAN,DIRECT");

  // 添加默认规则
  rules.push("MATCH,DIRECT");

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
  if (!Array.isArray(proxies)) return [];

  return proxies.filter((proxy) => {
    if (typeof proxy !== "string") return false;

    const proxyLower = proxy.toLowerCase();
    return regions.some((region) => proxyLower.includes(region.toLowerCase()));
  });
}

/**
 * 修改代理组配置
 * @param {Array} proxyGroups - 代理组列表
 * @returns {Array} 修改后的代理组列表
 */
function modifyProxyGroups(proxyGroups) {
  if (!Array.isArray(proxyGroups)) {
    console.warn("代理组配置不是数组，跳过修改");
    return proxyGroups;
  }

  // 定义目标地区关键词
  const targetRegions = [
    "香港",
    "台湾",
    "新加坡",
    "Hong Kong",
    "Taiwan",
    "Singapore",
    "hk",
    "tw",
    "sg",
  ];

  let targetGroupProxies = [];
  let loadBalanceGroupCreated = false;

  const modifiedGroups = proxyGroups.map((group) => {
    // 查找名为 PROXY_GROUP_NAME 的代理组
    if (group.name === PROXY_GROUP_NAME && PROXY_GROUP_NAME !== "") {
      console.log(`正在处理代理组: ${PROXY_GROUP_NAME}`);

      // 提取目标地区的节点
      if (group.proxies && Array.isArray(group.proxies)) {
        const regionProxies = extractRegionProxies(
          group.proxies,
          targetRegions
        );
        targetGroupProxies = regionProxies;

        console.log(
          `从 ${PROXY_GROUP_NAME} 中提取到 ${regionProxies.length} 个目标地区节点`
        );

        // 从原代理组中移除这些节点
        const remainingProxies = group.proxies.filter(
          (proxy) => !regionProxies.includes(proxy)
        );

        return {
          ...group,
          proxies: remainingProxies,
        };
      }
    }

    return group;
  });

  // 如果提取到了目标节点，创建负载均衡组
  if (targetGroupProxies.length > 0) {
    const loadBalanceGroup = {
      name: "LoadBalance",
      type: "load-balance",
      strategy: "consistent-hashing",
      proxies: targetGroupProxies,
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50,
      lazy: true,
    };

    console.log(
      `创建负载均衡组 "LoadBalance"，包含 ${targetGroupProxies.length} 个节点`
    );

    // 将负载均衡组添加到代理组列表中
    modifiedGroups.push(loadBalanceGroup);
    loadBalanceGroupCreated = true;
  } else {
    console.warn(
      `未在 ${PROXY_GROUP_NAME || "指定的代理组"} 中找到目标地区节点`
    );
  }

  if (!loadBalanceGroupCreated && PROXY_GROUP_NAME === "") {
    console.warn("PROXY_GROUP_NAME 为空，请在常量定义中设置正确的代理组名称");
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
  try {
    // 验证输入参数
    if (!config || typeof config !== "object") {
      throw new Error("Invalid config object provided");
    }

    console.log(`正在处理配置文件: ${profileName || "Unknown"}`);

    // 生成DNS配置
    const dnsConfig = createDnsConfig();

    // 生成规则提供器
    const ruleProviders = createAllRuleProviders();

    // 生成路由规则
    const rules = createRoutingRules();

    // 修改代理组配置
    if (config["proxy-groups"]) {
      config["proxy-groups"] = modifyProxyGroups(config["proxy-groups"]);
    }

    // 应用配置到原始config对象
    config.dns = dnsConfig;
    config["rule-providers"] = ruleProviders;
    config.rules = rules;

    // 输出统计信息
    console.log(`已配置 ${Object.keys(ruleProviders).length} 个规则提供器`);
    console.log(`已配置 ${rules.length} 条路由规则`);
    console.log("DNS配置已更新");
    console.log("代理组配置已更新");

    return config;
  } catch (error) {
    console.error("配置处理失败:", error.message);
    // 返回原始配置以避免完全失败
    return config;
  }
}
