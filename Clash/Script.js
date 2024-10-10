// Define main function (script entry)

// define self rule provider for China, which can easily write yaml file to add rules
const self_rule_provider = {
  "China": {
    type: "file",
    behavior: "classical",
    path: "/home/ranfr/Documents/ClashRuleSets/China.yaml"
  }
};

// add self rules, consist of rule-set of china
const self_rules = [
  "RULE-SET,China,DIRECT"
]

// DNS
const demostic_nameservers = [
  "https://223.5.5.5", // aliyun, main
  "https://223.6.6.6", // aliyun, backup
  "https://119.29.29.29", // tencent
  "https://101.226.4.6", // 360, none unicom
  "https://123.125.81.6" // 360, for unicom
]
const foreign_nameservers = [
  "https://1.1.1.1", // cloudflare, main
  "https://1.0.0.1", // cloudflare, backup
  "https://8.8.8.8" // google
]
const dns_config = {
  "enable": true,
  "ipv6": false,
  "listen": "0.0.0.0:1053",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "use-hosts": true,
  "default-nameserver": ["223.5.5.5", "1.1.1.1"],
  "nameserver": [...demostic_nameservers, ...foreign_nameservers],
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
  // get old rules and rule providers
  let old_rules = config["rules"] || [];
  let old_rule_providers = config["rule-providers"] || [];

  // merge rules and rule providers
  config["rules"] = self_rules.concat(old_rules);
  config["rule-providers"] = { ...self_rule_provider, ...old_rule_providers }

  // overwrite dns config
  config["dns"] = dns_config;

  return config;
}
