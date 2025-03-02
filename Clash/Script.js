// Define main function (script entry)

// Define rule provider for China, which can easily write yaml file to add rules
// Ruleset General Configuration
const ruleProviderCommon = {
  type: "http",
  format: "yaml",
  interval: 86400,
  behavior: "classical"
}
const ruleBaseUrl = "/release/rule/Clash/"
const selfRuleProviders = {
  "Bing": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Bing/Bing.yaml",
    path: "RuleProvider/Bing.yaml"
  },
  "China": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "China/China_Classical.yaml",
    path: "RuleProvider/China.yaml"
  },
  "Docker": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Docker/Docker.yaml",
    "path": "RuleProvider/Docker.yaml"
  },
  "GitHub": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "GitHub/GitHub.yaml",
    path: "RuleProvider/GitHub.yaml"
  },
  "Google": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Google/Google.yaml",
    path: "RuleProvider/Google.yaml"
  },
  "Microsoft": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Microsoft/Microsoft.yaml",
    path: "RuleProvider/Microsoft.yaml"
  },
  "Mozilla": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Mozilla/Mozilla.yaml",
    path: "RuleProvider/Mozilla.yaml"
  },
  "OpenAI": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "OpenAI/OpenAI.yaml",
    path: "RuleProvider/OpenAI.yaml"
  },
  "Scholar": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Scholar/Scholar.yaml",
    path: "RuleProvider/Scholar.yaml"
  },
  "YouTube": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "YouTube/YouTube.yaml",
    path: "RuleProvider/YouTube.yaml"
  },
};

// Add self rules.
const selfRules = [
  "RULE-SET,Bing,DIRECT",
  "RULE-SET,Docker,Proxy",
  "RULE-SET,GitHub,Proxy",
  "RULE-SET,Google,Proxy",
  "RULE-SET,Microsoft,Proxy",
  "RULE-SET,Mozilla,Proxy",
  "RULE-SET,OpenAI,Proxy",
  "RULE-SET,Scholar,Proxy",
  "RULE-SET,YouTube,Proxy",
  "RULE-SET,China,DIRECT"
]
const endRules = [
  "GEOIP,CN,DIRECT",
  "GEOIP,LAN,DIRECT",
  "MATCH,Proxy"
]

// DNS
const demosticNameservers = [
  "223.5.5.5", // Aliyun, main
  "223.6.6.6", // Aliyun, backup
  "119.29.29.29", // Tencent
  "101.226.4.6", // 360, none unicom
  "123.125.81.6" // 360, for unicom
]
const foreignNameservers = [
  "1.1.1.1", // Cloudflare, main
  "1.0.0.1", // Cloudflare, backup
  "8.8.8.8", // Google, main
  "8.8.4.4"  // Google, backup
]
const dnsConfig = {
  "enable": true,
  "ipv6": false,
  "listen": "0.0.0.0:1053",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "use-hosts": true,
  "default-nameserver": ["1.1.1.1", "1.0.0.1"],
  "nameserver": [...demosticNameservers, ...foreignNameservers],
  "fake-ip-filter": [
    "*.lan", // Local network/domain
    "*.local",
    "localhost.ptlogin2.qq.com", // QQ login check
    "dns.msftncsi.com", // Microsoft ncsi
    "*.srv.nintendo.net", // Nintendo
    "*.stun.playstation.net", // Playstation
    "xbox.*.microsoft.com", // Xbox
    "*.xboxlive.com" // Xbox
  ]
}

function main(config, profileName) {
  // Overwrite rules and rule providers
  config["rules"] = selfRules.concat(endRules);
  config["rule-providers"] = { ...selfRuleProviders }

  // Overwrite dns config
  config["dns"] = dnsConfig;

  return config;
}
