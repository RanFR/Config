// Define main function (script entry)

// Define rule provider for China, which can easily write yaml file to add rules
const ruleProviderName = "";
const ruleBaseUrl = "";
const ruleProviderCommon = {
  type: "http",
  format: "yaml",
  interval: 86400,
  behavior: "classical"
};
const selfRuleProviders = {
  "Bing": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Bing/Binc.yaml",
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
    path: "RuleProvider/Docker.yaml"
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
  "Lan": {
    ...ruleProviderCommon,
    url: ruleBaseUrl + "Lan/Lan.yaml",
    path: "RuleProvider/Lan.yaml"
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
  }
};

// Add self rules.
const selfRules = [
  "RULE-SET,Bing,DIRECT",
  "RULE-SET,China,DIRECT",
  "RULE-SET,Lan,DIRECT",
  "RULE-SET,Microsoft,DIRECT",
  "RULE-SET,Docker," + ruleProviderName,
  "RULE-SET,GitHub," + ruleProviderName,
  "RULE-SET,Google," + ruleProviderName,
  "RULE-SET,Mozilla," + ruleProviderName,
  "RULE-SET,OpenAI," + ruleProviderName,
  "RULE-SET,Scholar," + ruleProviderName,
  "RULE-SET,YouTube," + ruleProviderName,
  "MATCH,DIRECT"
];

function main(config, profileName) {
  // Overwrite rules and rule providers
  config["rules"] = selfRules;
  config["rule-providers"] = selfRuleProviders;

  return config;
}
