// Response hook - 处理API响应
(res, text, from, to) => {
  // 检查响应是否成功
  if (!res.choices || !res.choices[0] || !res.choices[0].message) {
    throw new Error("API响应格式错误");
  }

  // 获取翻译结果
  const translatedText = res.choices[0].message.content.trim();

  // 简单判断是否翻译了文本（如果翻译结果与原文相同，可能表示没有翻译）
  const isTranslated = translatedText !== text;

  return [translatedText, isTranslated];
};
