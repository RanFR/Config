// Define main function (script entry)

// Define rule provider for China, which can easily write yaml file to add rules
const selfRuleProviders = {
  "Bing": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/Bing.yaml"
  },
  "China": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/China.yaml"
  },
  "Docker": {
    type: "file",
    behavior: "classical",
    "path": "ios_rule_scripts/Docker.yaml"
  },
  "GitHub": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/GitHub.yaml"
  },
  "Google": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/Google.yaml"
  },
  "Microsoft": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/Microsoft.yaml"
  },
  "Mozilla": {
    type: "file",
    "behavior": "classical",
    path: "ios_rule_scripts/Mozilla.yaml"
  },
  "OpenAI": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/OpenAI.yaml"
  },
  "Scholar": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/Scholar.yaml"
  },
  "YouTube": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/YouTube.yaml"
  },
};

// Add self rules.
const selfRules = [
  "RULE-SET,Bing,DIRECT",
  "RULE-SET,Docker,PROXY-Provider",
  "RULE-SET,GitHub,PROXY-Provider",
  "RULE-SET,Google,PROXY-Provider",
  "RULE-SET,Microsoft,PROXY-Provider",
  "RULE-SET,Mozilla,PROXY-Provider",
  "RULE-SET,OpenAI,PROXY-Provider",
  "RULE-SET,Scholar,PROXY-Provider",
  "RULE-SET,YouTube,PROXY-Provider",
  "RULE-SET,China,DIRECT"
]
const endRules = [
  "GEOIP,CN,DIRECT",
  "GEOIP,LAN,DIRECT",
  "MATCH,PROXY-Provider"
]

// Rules and rule providers to remove.
const stringsToRemove = ["Bing", "GEOIP,CN", "GEOIP,LAN", "MATCH"]

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
