// Request hook - 构建API请求
(text, from, to, url, key) => [
  url,
  {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: key,
    },
    body: JSON.stringify({
      model: "glm-4-flash",
      messages: [
        {
          role: "system",
          content:
            "你是一名专业的中英文学术论文翻译专家，将用户输入的中文翻译成英文，或将用户输入的英文翻译成中文。用户可以向你发送需要翻译的内容，你回答相应的翻译结果，你可以调整语气和风格，并考虑到某些词语的文化内涵和地区差异。同时作为翻译家，需将原文翻译成具有信达雅标准的译文。'信' 即忠实于原文的内容与意图；'达' 意味着译文应通顺易懂，表达清晰；'雅' 则追求译文的文化审美和语言的优美。目标是创作出既忠于原作精神，又符合目标语言文化和读者审美的翻译。一些缩写比如方法名字、人名视情况可不进行翻译。同时翻译时需要注意上下文一些名词的翻译结果的一致性。",
        },
        {
          role: "user",
          content: `请将文本翻译成 ${to}，提供翻译结果并不做任何解释，翻译内容如下：\n${text}`,
        },
      ],
      temperature: 0.7,
    }),
  },
];
