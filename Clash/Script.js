// Define main function (script entry)

// Define rule provider for China, which can easily write yaml file to add rules
const selfRuleProviders = {
  "Bing": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/Bing.yaml"
  },
  "ChinaMax": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/ChinaMax.yaml"
  },
  "Github": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/Github.yaml"
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
  "YouTube": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/YouTube.yaml"
  },
  "OpenAI": {
    type: "file",
    behavior: "classical",
    path: "ios_rule_scripts/OpenAI.yaml"
  }
};

// Add self rules.
const selfRules = [
  "RULE-SET,Bing,DIRECT",
  "RULE-SET,Github,SSRDOG",
  "RULE-SET,Google,Google",
  "RULE-SET,YouTube,Google",
  "RULE-SET,Microsoft,Microsoft",
  "RULE-SET,OpenAI,OpenAI",
  "RULE-SET,ChinaMax,DIRECT"
]
const endRules = [
  "GEOIP,CN,DIRECT",
  "GEOIP,LAN,DIRECT",
  "MATCH,SSRDOG"
]

// Rules and rule providers to remove.
const stringsToRemove = ["Bing", "Github", "Google", "YouTube", "Microsoft", "OpenAI", "ChinaMax", "GEOIP,CN", "GEOIP,LAN", "MATCH"]

// DNS
const demosticNameservers = [
  "https://223.5.5.5", // Aliyun, main
  "https://223.6.6.6", // Aliyun, backup
  "https://119.29.29.29", // Tencent
  "https://101.226.4.6", // 360, none unicom
  "https://123.125.81.6" // 360, for unicom
]
const foreignNameservers = [
  "https://1.1.1.1", // Cloudflare, main
  "https://1.0.0.1", // Cloudflare, backup
  "https://8.8.8.8" // Google
]
const dnsConfig = {
  "enable": true,
  "ipv6": false,
  "listen": "0.0.0.0:1053",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "use-hosts": true,
  "default-nameserver": ["223.5.5.5", "1.1.1.1"],
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
