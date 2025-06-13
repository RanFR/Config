// Define main function (script entry)

// Define rule provider for China, which can easily write yaml file to add rules
const ruleProviderName = "";
const ruleBaseUrl = "";
const ruleSelfUrl = "";
const ruleProviderCommon = {
  type: "http",
  format: "yaml",
  interval: 86400,
  behavior: "classical",
};
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

// Add self rules.
const selfRules = [
  "RULE-SET,Bing,DIRECT",
  "RULE-SET,China,DIRECT",
  "RULE-SET,Lan,DIRECT",
  "RULE-SET,SelfProxy," + ruleProviderName,
  "RULE-SET,Amazon," + ruleProviderName,
  "RULE-SET,Docker," + ruleProviderName,
  "RULE-SET,GitHub," + ruleProviderName,
  "RULE-SET,Google," + ruleProviderName,
  "RULE-SET,Microsoft," + ruleProviderName,
  "RULE-SET,Mozilla," + ruleProviderName,
  "RULE-SET,Nvidia," + ruleProviderName,
  "RULE-SET,OpenAI," + ruleProviderName,
  "RULE-SET,Python," + ruleProviderName,
  "RULE-SET,Scholar," + ruleProviderName,
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
