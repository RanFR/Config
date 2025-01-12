// Define main function (script entry)

// Define rule provider for China, which can easily write yaml file to add rules
// Ruleset General Configuration
const ruleProviderCommon = {
  type: "http",
  format: "yaml",
  interval: 86400
}
const selfRuleProviders = {
  "Bing": {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://proxy-rule-provider/Bing/Bing.yaml",
    path: "RuleProvider/Bing.yaml"
  },
  "China": {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://proxy-rule-provider/China/China_Classical.yaml",
    path: "RuleProvider/China.yaml"
  },
  "Custom": {
    type: "file",
    behavior: "classical",
    path: "Custom/Custom.yaml"
  },
  "Docker": {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://proxy-rule-provider/Docker/Docker.yaml",
    "path": "RuleProvider/Docker.yaml"
  },
  "GitHub": {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://proxy-rule-provider/GitHub/GitHub.yaml",
    path: "RuleProvider/GitHub.yaml"
  },
  "Google": {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://proxy-rule-provider/Google/Google.yaml",
    path: "RuleProvider/Google.yaml"
  },
  "Microsoft": {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://proxy-rule-provider/Microsoft/Microsoft.yaml",
    path: "RuleProvider/Microsoft.yaml"
  },
  "Mozilla": {
    ...ruleProviderCommon,
    "behavior": "classical",
    url: "https://proxy-rule-provider/Mozilla/Mozilla.yaml",
    path: "RuleProvider/Mozilla.yaml"
  },
  "OpenAI": {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://proxy-rule-provider/OpenAI/OpenAI.yaml",
    path: "RuleProvider/OpenAI.yaml"
  },
  "Scholar": {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://proxy-rule-provider/Scholar/Scholar.yaml",
    path: "RuleProvider/Scholar.yaml"
  },
  "YouTube": {
    ...ruleProviderCommon,
    behavior: "classical",
    url: "https://proxy-rule-provider/YouTube/YouTube.yaml",
    path: "RuleProvider/YouTube.yaml"
  },
};

// Add self rules.
const selfRules = [
  "RULE-SET,Bing,DIRECT",
  "RULE-SET,Custom,proxy",
  "RULE-SET,Docker,proxy",
  "RULE-SET,GitHub,proxy",
  "RULE-SET,Google,proxy",
  "RULE-SET,Microsoft,proxy",
  "RULE-SET,Mozilla,proxy",
  "RULE-SET,OpenAI,proxy",
  "RULE-SET,Scholar,proxy",
  "RULE-SET,YouTube,proxy",
  "RULE-SET,China,DIRECT"
]
const endRules = [
  "GEOIP,CN,DIRECT",
  "GEOIP,LAN,DIRECT",
  "MATCH,proxy"
]

// Rules and rule providers to remove.
const stringsToRemove = ["Bing", "Microsoft", "GEOIP,CN", "GEOIP,LAN", "MATCH"]

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
  "8.8.8.8" // Google
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
    "*.lan", // local network/domain
    "*.local",
    "localhost.ptlogin2.qq.com", // qq login check
    "dns.msftncsi.com", // microsoft ncsi
    "*.srv.nintendo.net", // nintendo
    "*.stun.playstation.net", // playstation
    "xbox.*.microsoft.com", // xbox
    "*.xboxlive.com" // xbox
  ]
}

function main(config, profileName) {
  // Get old rules and rule providers
  let oldRules = config["rules"] || [];
  let oldRuleProviders = config["rule-providers"] || [];

  // Delete obsolete rules and rule providers.
  // Rules.
  oldRules = oldRules.filter(rule => !stringsToRemove.some(str => rule.includes(str)));
  // Rule providers.
  stringsToRemove.forEach(provider => {
    delete oldRuleProviders[provider];
  });

  // Merge rules and rule providers.
  config["rules"] = selfRules.concat(oldRules.concat(endRules));
  config["rule-providers"] = { ...selfRuleProviders, ...oldRuleProviders }

  // overwrite dns config
  config["dns"] = dnsConfig;

  return config;
}

