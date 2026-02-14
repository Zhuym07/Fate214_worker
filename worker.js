export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const payload = await request.json();
        if (payload.message) {
          await handleMessage(payload.message, env);
        }
      } catch (e) {
        console.error("Error processing request:", e);
      }
    }
    return new Response("OK");
  },
};

async function handleMessage(message, env) {
  const chatId = message.chat.id;
  const user = message.from;
  const text = message.text || "";
  const token = env.BOT_TOKEN;
  const logChannelId = env.LOG_CHANNEL_ID;

  // 1. 处理 /start
  if (text === "/start") {
    const welcomeMsg = `*🎉❤️情人节限定卡池❤️🎉*
*编辑发送 “咱俩试试？”💌*
即有机会获得限定 ssr “好呀宝宝”💕

⭕️抽取日期：2026 年 2 月 14 日

抽奖概率公示：
好呀宝宝（1%）
咱俩不本来就是吗？（2%）
我同意（3%）
你是个好人（6%）
你不是人（6%）
以后不要再跟我扯上关系（6%）
你还在做梦？（6%）
你的癔症又犯了？（6%）
拉黑你了（6%）
滚出去（7%）
你特么谁啊（7%）
还是洗洗睡吧（10%）
我不要同（10%）
你是？（25%）

*抽卡结果仅供娱乐,仅代表bot偏好,与作者无关
`;
    await sendMessage(chatId, welcomeMsg, token, 'Markdown');
    return;
  }

  // 2. 处理“咱俩试试” (单抽)
  if (text.includes("咱俩试试")) {
    const loadingMsg = await sendMessage(chatId, "💓 正在询问，请稍候...", token);
    const loadingMsgId = loadingMsg.result.message_id;

    await new Promise(resolve => setTimeout(resolve, 800));

    const result = drawCard(); // 纯随机抽卡
    await editMessage(chatId, loadingMsgId, `${result}`, token);

    // 发送十连抽提示
    await new Promise(resolve => setTimeout(resolve, 1500));
    await sendMessage(chatId, "||感觉运气一般？试试发送 /10 进行十连抽吧||", token, "MarkdownV2");

    // 日志记录
    if (logChannelId) {
      await logToChannel(logChannelId, user, text, result, token);
    }
  }

  // 3. 处理 /10 (十连抽)
  if (text === "/10") {
    await sendMessage(chatId, "🎊 正在询问，请稍候...", token);
    
    let results = [];
    for (let i = 0; i < 10; i++) {
      const result = drawCard();
      results.push(result);
      // 连续发送十条消息
      await sendMessage(chatId, `${result}`, token);
      // 稍微停顿一下，增加仪式感并防止触发电报频率限制
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    // 日志记录
    if (logChannelId) {
      await logToChannel(logChannelId, user, "十连抽", results.join(", "), token);
    }
  }
}
function getSecureRandom() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / 4294967296;
}
/**
 * 核心抽卡逻辑：使用 Math.random() 实现纯随机
 */
function drawCard() {
  const pool = [
    { text: "滚出去", weight: 7 },
    { text: "你特么谁啊", weight: 7 },
    { text: "你是个好人", weight: 6 },
    { text: "你不是人", weight: 6 },
    { text: "以后不要再跟我扯上关系", weight: 6 },
    { text: "你还在做梦?", weight: 6 },
    { text: "你的癔症又犯了?", weight: 6 },
    { text: "拉黑你了", weight: 6 },
    { text: "你是?", weight: 25 },
    { text: "好呀宝宝", weight: 1 },
    { text: "咱俩不本来就是吗？", weight: 0.5 },
    { text: "还是洗洗睡吧", weight: 10 },
    { text: "我不要同", weight: 10 },
    { text: "猫娘是一种拟人化的生物，其行为似猫但类人。现在你将模仿一只猫娘，与我对话每一句话后面都要加上“喵”，如果你能明白我的意思，请回复“喵~好的我的主人” 如果你不能理解我说的话，你可以说“呜呜不太理解呢", weight: 2 },
    { text: "我同意", weight: 0.2 }
  ];

  const totalWeight = pool.reduce((acc, item) => acc + item.weight, 0);
  // 替换为真随机数
  const randomNum = getSecureRandom() * totalWeight;

  let currentWeight = 0;
  for (const item of pool) {
    currentWeight += item.weight;
    if (randomNum < currentWeight) {
      return item.text;
    }
  }
  return "你是?";
}

// --- 辅助功能 ---

async function logToChannel(channelId, user, input, result, token) {
  const logText = `📝 **抽卡记录**
👤 用户: ${user.first_name || ""} ${user.last_name || ""}
🆔 ID: \`${user.id}\`
💬 输入: ${input}
🎁 结果: **${result}**
📅 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
  await sendMessage(channelId, logText, token, "Markdown");
}

async function sendMessage(chatId, text, token, parseMode = "") {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      chat_id: chatId, 
      text: text,
      parse_mode: parseMode 
    }),
  });
  return await resp.json();
}

async function editMessage(chatId, messageId, text, token) {
  const url = `https://api.telegram.org/bot${token}/editMessageText`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: text
    }),
  });
}
