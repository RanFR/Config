// 请求Hook函数，request hook
async (args) => {
  // ===== 兼容性说明（重要）=====
  // 本 Hook 运行在 KISS Translator 内置的 sval 沙盒解释器中。
  // 在 Firefox 里，沙盒全局对象是从 content script 的 window 逐属性拷贝出来的，
  // 而 Firefox 的 Xray 包装会剥离函数的静态方法与普通全局函数，
  // 导致沙盒内以下 API 不可用（TypeError: xxx is not a function）：
  //   String.fromCharCode / String.fromCodePoint
  //   encodeURIComponent / decodeURIComponent / parseInt / parseFloat
  //   Math.floor / Math.random 等 Math 静态方法
  // 沙盒内可正常使用的：Date.now、new Date、JSON、Object/Array 静态方法、
  //   Array.isArray、String()/Number()/Boolean() 调用、字符串与数组实例方法。
  // 因此本文件刻意只依赖上述可用能力：
  //   1. md5 基于 UTF-8 字节数组实现，不使用 String.fromCharCode；
  //   2. 用自写的 percentEncode 代替 encodeURIComponent。

  // ===== UTF-8 编码：返回字节数组（number[]），纯算术实现 =====
  const pushUtf8Bytes = (code, bytes) => {
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 63));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 63),
        0x80 | ((code >> 6) & 63),
        0x80 | (code & 63),
      );
    }
  };

  // codePointAt 可正确处理增补平面字符（如 emoji），避免代理项被拆成非法 UTF-8
  const toUtf8Bytes = (str) => {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.codePointAt(i);
      if (code > 0xffff) i++; // 跳过低代理项
      pushUtf8Bytes(code, bytes);
    }
    return bytes;
  };

  // ===== 代替 encodeURIComponent（RFC 3986：仅不转义保留字符，百分比编码用大写十六进制）=====
  const UNRESERVED =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~!*'()";
  const percentEncode = (str) => {
    let out = "";
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (UNRESERVED.indexOf(ch) >= 0) {
        out += ch;
        continue;
      }
      const code = str.codePointAt(i);
      if (code > 0xffff) i++;
      const bytes = [];
      pushUtf8Bytes(code, bytes);
      for (let k = 0; k < bytes.length; k++) {
        const b = bytes[k];
        out += "%" + (b < 16 ? "0" : "") + b.toString(16).toUpperCase();
      }
    }
    return out;
  };

  // ===== MD5 实现（输入为 UTF-8 字节数组）=====
  const md5Bytes = (bytes) => {
    const rotateLeft = (lValue, iShiftBits) =>
      (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));

    const addUnsigned = (lX, lY) => {
      const lX8 = lX & 0x80000000;
      const lY8 = lY & 0x80000000;
      const lX4 = lX & 0x40000000;
      const lY4 = lY & 0x40000000;
      const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
      if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
      if (lX4 | lY4) {
        return lResult & 0x40000000
          ? lResult ^ 0xc0000000 ^ lX8 ^ lY8
          : lResult ^ 0x40000000 ^ lX8 ^ lY8;
      }
      return lResult ^ lX8 ^ lY8;
    };

    const F = (x, y, z) => (x & y) | (~x & z);
    const G = (x, y, z) => (x & z) | (y & ~z);
    const H = (x, y, z) => x ^ y ^ z;
    const I = (x, y, z) => y ^ (x | ~z);

    const FF = (a, b, c, d, x, s, ac) =>
      addUnsigned(
        rotateLeft(
          addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac)),
          s,
        ),
        b,
      );
    const GG = (a, b, c, d, x, s, ac) =>
      addUnsigned(
        rotateLeft(
          addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac)),
          s,
        ),
        b,
      );
    const HH = (a, b, c, d, x, s, ac) =>
      addUnsigned(
        rotateLeft(
          addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac)),
          s,
        ),
        b,
      );
    const II = (a, b, c, d, x, s, ac) =>
      addUnsigned(
        rotateLeft(
          addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac)),
          s,
        ),
        b,
      );

    const convertToWordArray = (byteArray) => {
      const lMessageLength = byteArray.length;
      const temp1 = lMessageLength + 8;
      const temp2 = (temp1 - (temp1 % 64)) / 64;
      const lNumberOfWords = (temp2 + 1) * 16;
      const lWordArray = Array(lNumberOfWords - 1);
      let lByteCount = 0;
      while (lByteCount < lMessageLength) {
        const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        const lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] =
          (lWordArray[lWordCount] || 0) | (byteArray[lByteCount] << lBytePosition);
        lByteCount++;
      }
      const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      const lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] =
        (lWordArray[lWordCount] || 0) | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    };

    const wordToHex = (lValue) => {
      let result = "";
      for (let lCount = 0; lCount <= 3; lCount++) {
        const lByte = (lValue >>> (lCount * 8)) & 255;
        result += ("0" + lByte.toString(16)).slice(-2);
      }
      return result;
    };

    const x = convertToWordArray(bytes);

    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    for (let k = 0; k < x.length; k += 16) {
      const AA = a, BB = b, CC = c, DD = d;
      a = FF(a, b, c, d, x[k + 0], 7, 0xd76aa478);
      d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
      c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
      b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
      a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
      d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
      c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613);
      b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
      a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8);
      d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
      c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
      b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
      a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122);
      d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
      c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e);
      b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);

      a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562);
      d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
      c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51);
      b = GG(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
      a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d);
      d = GG(d, a, b, c, x[k + 10], 9, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
      b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
      a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
      d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
      c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
      b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
      a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
      d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
      c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9);
      b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);

      a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942);
      d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
      c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
      b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
      a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44);
      d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
      c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
      b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
      a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
      d = HH(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
      c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
      b = HH(b, c, d, a, x[k + 6], 23, 0x4881d05);
      a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
      d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
      c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
      b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);

      a = II(a, b, c, d, x[k + 0], 6, 0xf4292244);
      d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
      c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7);
      b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
      a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3);
      d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
      c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d);
      b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
      a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
      d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
      c = II(c, d, a, b, x[k + 6], 15, 0xa3014314);
      b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
      a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82);
      d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
      c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
      b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);

      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }

    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
  };

  const md5 = (input) => md5Bytes(toUtf8Bytes(input));

  // ===== 请求构造 =====
  const url = args.url;
  const [appId, appKey] = String(args.key ?? "").split("#");

  const LANG_MAP = {
    English: "en",
    Chinese: "zh",
    "Simplified Chinese": "zh",
    "Traditional Chinese": "cht",
    Japanese: "jp",
    Korean: "kor",
    French: "fra",
    Spanish: "spa",
    German: "de",
    Russian: "ru",
    Italian: "it",
    Portuguese: "pt",
    Arabic: "ara",
    Thai: "th",
    Vietnamese: "vie",
  };

  const fromLang =
    args.from === "AutoDetect" ? "auto" : LANG_MAP[args.from] || "auto";
  const toLang = LANG_MAP[args.to] || "zh";
  const salt = Date.now();

  const q = Array.isArray(args.texts)
    ? args.texts.join("\n")
    : String(args.texts ?? "");

  // 生成签名（对原始 q 计算，与百度规范一致）
  const sign = md5(appId + q + salt + appKey);

  const queryStr =
    "q=" +
    percentEncode(q) +
    "&appid=" +
    percentEncode(appId) +
    "&salt=" +
    salt +
    "&from=" +
    fromLang +
    "&to=" +
    toLang +
    "&sign=" +
    sign;
  const finalUrl = url + (url.indexOf("?") >= 0 ? "&" : "?") + queryStr;

  return { url: finalUrl, body: null, headers: {}, method: "GET" };
};

// 响应Hook函数，response hook
async ({ res }) => {
  // 1. 统一转成对象，并防御非 JSON / 空响应
  let data;
  if (typeof res === "string") {
    try {
      data = res.trim() ? JSON.parse(res) : {};
    } catch {
      throw new Error(`响应解析失败（非 JSON）: ${res.slice(0, 200)}`);
    }
  } else {
    data = res ?? {};
  }

  // 2. 兼容 res 被包了一层 { data: ... } 的情况
  if (!data.trans_result && !data.error_code && data.data) {
    data = data.data;
  }

  // 3. 网络层错误
  if (data.error && !data.error_code) {
    throw new Error(`网络错误: ${data.error}`);
  }

  // 4. 百度业务错误：直接抛出，让插件显示真实原因（避免被吞成 unexpected result）
  const ERROR_HINTS = {
    52001: "（请求超时，检查 query 长度或语种是否支持）",
    52003: "（未授权用户，请检查 appid 或是否已开通服务）",
    54001: "（请检查 appid / appkey / sign 计算，且 q 必须与请求体完全一致）",
    54003: "（访问频率受限，请稍后再试）",
    54004: "（账户余额不足）",
    54005: "（请求过长，请减少文本量）",
    58000: "（客户端 IP 非法，请检查百度后台 IP 白名单）",
    58001: "（不支持的语言对）",
    58002: "（服务已关闭，请检查 appid 状态）",
    58003: "（此 IP 已被封禁，请勿将 APPID 填到第三方软件）",
  };

  if (data.error_code) {
    const hint = ERROR_HINTS[data.error_code] ?? "";
    throw new Error(
      `百度翻译失败 [${data.error_code}] ${data.error_msg ?? ""}${hint}`,
    );
  }

  // 5. 解析翻译结果
  const resultList = Array.isArray(data.trans_result)
    ? data.trans_result
    : Array.isArray(res?.trans_result)
      ? res.trans_result
      : [];

  const translations = resultList
    .map((item) => [item.dst ?? item.text, data.to ?? res.to])
    .filter(([text]) => text != null);

  if (translations.length === 0) {
    throw new Error(
      `响应中未找到翻译结果，原始响应: ${JSON.stringify(data).slice(0, 300)}`,
    );
  }

  return { translations, modelMsg: "" };
};
