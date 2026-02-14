# Fate214_worker
## 🚀 快速开始

### 1. 准备工作

* 创建一个 Telegram Bot 并获取 `BOT_TOKEN` (通过 [@BotFather](https://t.me/botfather))。
* (可选) 创建一个频道用于接收日志，并获取其 `LOG_CHANNEL_ID`。
* 拥有一个 Cloudflare 账号。

### 2. 部署步骤

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 创建一个新的 **Worker**。
3. 将 `index.js` 中的代码复制并粘贴到编辑器中。
4. 在 **Settings -> Variables** 中添加以下环境变量：
* `BOT_TOKEN`: 你的机器人 Token。
* `LOG_CHANNEL_ID`: (可选) 接收记录的频道 ID。


5. 点击 **Save and Deploy**。

### 3. 设置 Webhook

通过浏览器访问以下 URL（替换你的 Token 和 Worker 地址）：
`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>`

---

## 💬 交互指令

* `/start` - 开启你的情人节审判。
* `咱俩试试？` - 发送包含此关键词的消息进行单抽。
* `/10` - 进行极具仪式感的真随机十连抽。

---
