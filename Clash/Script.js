/**
 * Clash Verge 配置脚本
 * 用于自动配置DNS、规则提供器和路由规则
 * @author RanFR
 * @version 1.0
 * @date 2025-07-08
 */

// ==================== 常量定义 ====================

/** 代理服务器组名称 */
const PROXY_GROUP_NAME = "";

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
    "https://dns.alidns.com/dns-query", // 阿里
    "https://doh.pub/dns-query", // 腾讯
    "https://cloudflare-dns.com/dns-query", // Cloudflare
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
    listen: "127.0.0.1:1053",
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
  // 自定义规则
  custom: [
    { name: "Misc", source: "self" },
    { name: "Zoom", source: "self" },
  ],
  // 直连规则 (使用DIRECT)
  direct: [
    { name: "Bing", source: "base" },
    { name: "China", source: "base", path: "China/China_Classical.yaml" },
    { name: "Lan", source: "base" },
  ],
  // 代理规则 (使用代理组)
  proxy: [
    { name: "Amazon", source: "base" },
    { name: "Cloudflare", source: "base" },
    { name: "Developer", source: "base" },
    { name: "Docker", source: "base" },
    { name: "GitHub", source: "base" },
    { name: "Google", source: "base" },
    { name: "Logitech", source: "base" },
    { name: "Microsoft", source: "base" },
    { name: "Mozilla", source: "base" },
    { name: "Nvidia", source: "base" },
    { name: "OpenAI", source: "base" },
    { name: "Python", source: "base" },
    { name: "Scholar", source: "base" },
    { name: "Ubuntu", source: "base" },
    { name: "Wikipedia", source: "base" },
    { name: "YouTube", source: "base" },
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
    ...RULE_PROVIDERS_CONFIG.custom,
    ...RULE_PROVIDERS_CONFIG.direct,
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

  // 添加直连规则
  RULE_PROVIDERS_CONFIG.direct.forEach((rule) => {
    rules.push(`RULE-SET,${rule.name},DIRECT`);
  });

  // 添加自定义和代理规则
  [...RULE_PROVIDERS_CONFIG.custom, ...RULE_PROVIDERS_CONFIG.proxy].forEach(
    (rule) => {
      rules.push(`RULE-SET,${rule.name},${PROXY_GROUP_NAME}`);
    }
  );

  // 添加默认规则
  rules.push("DOMAIN-SUFFIX,lunarg.com,SSRDOG");
  rules.push("MATCH,SSRDOG");

  return rules;
}

// ==================== 代理组配置 ====================

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

  return proxyGroups.map((group) => {
    // 查找名为 "Auto" 的代理组
    if (group.name === "Auto") {
      console.log("正在修改 Auto 代理组类型: fallback -> url-test");

      // 创建新的代理组配置
      const modifiedGroup = {
        ...group,
        type: "url-test",
        // 保持现有的 url 和 interval 属性
        // 移除 fallback 特有的属性（如果有的话）
      };

      // 如果没有 tolerance 属性，添加默认值
      if (!modifiedGroup.tolerance) {
        modifiedGroup.tolerance = 50;
      }

      return modifiedGroup;
    }

    // 其他代理组保持不变
    return group;
  });
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

// ==================== 工具函数 ====================

/**
 * 获取配置统计信息
 * @returns {Object} 统计信息对象
 */
function getConfigStats() {
  const ruleProviders = createAllRuleProviders();
  const rules = createRoutingRules();

  return {
    ruleProvidersCount: Object.keys(ruleProviders).length,
    rulesCount: rules.length,
    dnsServersCount:
      DNS_SERVERS.DOMESTIC.length +
      DNS_SERVERS.INTERNATIONAL.length +
      DNS_SERVERS.IPV6.length,
    proxyGroupName: PROXY_GROUP_NAME,
    updateInterval: RULE_UPDATE_INTERVAL,
  };
}

/**
 * 验证配置完整性
 * @param {Object} config - 要验证的配置对象
 * @returns {boolean} 验证结果
 */
function validateConfig(config) {
  const requiredFields = ["dns", "rule-providers", "rules"];
  return requiredFields.every((field) => config.hasOwnProperty(field));
}
