// Define main function (script entry)

// Rule Provider Name
const ruleProviderName = "";
// Base rule url
const ruleBaseUrl = "";
// Self rule url
const ruleSelfUrl = "";
// Rule provider common properties (type, format, interval, behavior)
const ruleProviderCommon = {
  type: "http",
  format: "yaml",
  interval: 86400,
  behavior: "classical",
};
// Define self rule providers
const selfRuleProviders = {
  SelfProxy: {
    ...ruleProviderCommon,
    url: ruleSelfUrl + "SelfProxy.yaml",
    path: "RuleProvider/SelfProxy.yaml",
  },
  Amazon: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Amazon/Amazon.yaml",
    path: "RuleProvider/Amazon.yaml",
  },
  Bing: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Bing/Bing.yaml",
    path: "RuleProvider/Bing.yaml",
  },
  China: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "China/China_Classical.yaml",
    path: "RuleProvider/China.yaml",
  },
  Developer: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Developer/Developer.yaml",
    path: "RuleProvider/Developer.yaml",
  },
  Docker: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Docker/Docker.yaml",
    path: "RuleProvider/Docker.yaml",
  },
  GitHub: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "GitHub/GitHub.yaml",
    path: "RuleProvider/GitHub.yaml",
  },
  Google: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Google/Google.yaml",
    path: "RuleProvider/Google.yaml",
  },
  Lan: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Lan/Lan.yaml",
    path: "RuleProvider/Lan.yaml",
  },
  Logitech: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Logitech/Logitech.yaml",
    path: "RuleProvider/Logitech.yaml",
  },
  Microsoft: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Microsoft/Microsoft.yaml",
    path: "RuleProvider/Microsoft.yaml",
  },
  Mozilla: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Mozilla/Mozilla.yaml",
    path: "RuleProvider/Mozilla.yaml",
  },
  Nvidia: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Nvidia/Nvidia.yaml",
    path: "RuleProvider/Nvidia.yaml",
  },
  OpenAI: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "OpenAI/OpenAI.yaml",
    path: "RuleProvider/OpenAI.yaml",
  },
  Python: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Python/Python.yaml",
    path: "RuleProvider/Python.yaml",
  },
  Scholar: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Scholar/Scholar.yaml",
    path: "RuleProvider/Scholar.yaml",
  },
  Ubuntu: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Ubuntu/Ubuntu.yaml",
    path: "RuleProvider/Ubuntu.yaml",
  },
  Wikipedia: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Wikipedia/Wikipedia.yaml",
    path: "RuleProvider/Wikipedia.yaml",
  },
  YouTube: {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "YouTube/YouTube.yaml",
    path: "RuleProvider/YouTube.yaml",
  },
};
// Add self rules
const selfRules = [
  "RULE-SET,Bing,DIRECT",
  "RULE-SET,China,DIRECT",
  "RULE-SET,Lan,DIRECT",
  "RULE-SET,SelfProxy," + ruleProviderName,
  "RULE-SET,Amazon," + ruleProviderName,
  "RULE-SET,Developer," + ruleProviderName,
  "RULE-SET,Docker," + ruleProviderName,
  "RULE-SET,GitHub," + ruleProviderName,
  "RULE-SET,Google," + ruleProviderName,
  "RULE-SET,Logitech," + ruleProviderName,
  "RULE-SET,Microsoft," + ruleProviderName,
  "RULE-SET,Mozilla," + ruleProviderName,
  "RULE-SET,Nvidia," + ruleProviderName,
  "RULE-SET,OpenAI," + ruleProviderName,
  "RULE-SET,Python," + ruleProviderName,
  "RULE-SET,Scholar," + ruleProviderName,
  "RULE-SET,Ubuntu," + ruleProviderName,
  "RULE-SET,Wikipedia," + ruleProviderName,
  "RULE-SET,YouTube," + ruleProviderName,
  "MATCH,DIRECT",
];

function main(config, profileName) {
  // Overwrite rules and rule providers
  config["rules"] = selfRules;
  config["rule-providers"] = selfRuleProviders;

  return config;
}
