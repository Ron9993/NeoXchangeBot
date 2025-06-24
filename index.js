const { Telegraf, Markup } = require('telegraf');
const { v4: uuidv4 } = require('uuid');
const config = require('./config.json');

const bot = new Telegraf(config.BOT_TOKEN);
const userLang = {};
const userStage = {};
const userOrders = {};
let currentRates = { usdt: "4600", trx: "1300" };

const messages = {
  en: {
    welcome: "🌐 Welcome to NeoXchange!\nPlease choose your language:",
    language_set: "✅ Language set to English.",
    rates: "💱 *Buy Rates (MMK → Crypto)*\n\nUSDT: {usdt} MMK\nTRX: {trx} MMK",
    menu: "Please choose an option:",
    choose_crypto: "💰 Which crypto do you want to buy?",
    enter_usdt_amount: "💸 How many USDT do you want?",
    enter_trx_amount: "💸 How many TRX do you want?",
    result_usdt: (amt, rate) => `✅ You'll pay approximately ${(amt * rate).toLocaleString()} MMK`,
    result_trx: (amt, rate) => `✅ You'll pay approximately ${(amt * rate).toLocaleString()} MMK`,
    payment_details: "💳 Please transfer MMK to:\n\n🔹 KBZPay: Htun Sein 09777888283\n🔹 UABPay: Htun Sein 09666000106",
    ask_proof: "📤 Upload your payment screenshot:",
    thanks_proof: "✅ Proof received! Admin will verify shortly.",
    approved: "✅ Payment approved! Please send your TRC20 wallet address:",
    wallet_received: (w) => `✅ Wallet received: ${w}\nYour crypto will be sent soon.`,
    rejected: "❌ Payment rejected. Please contact support.",
    ask_track: "🔍 Enter Order ID to track:",
    track_result: (id, st, w) => `🆔 Order ID: ${id}\n📦 Status: ${st}\n🏦 Wallet: ${w || 'Not provided yet'}`,
    not_found: "❌ Order not found. Check the ID.",
  },
  my: {
    welcome: "🌐 NeoXchange မှကြိုဆိုပါတယ်။\nဘာသာစကားရွေးချယ်ပါ။",
    language_set: "✅ မြန်မာဘာသာပြောင်းပြီးပါပြီ။",
    rates: "💱 *ဝယ်နှုန်း (MMK → Crypto)*\n\nUSDT: {usdt} MMK\nTRX: {trx} MMK",
    menu: "ရွေးချယ်ပါ။",
    choose_crypto: "💰 မည်သည့် crypto နဲ့ဝယ်ချင်သလဲ။",
    enter_usdt_amount: "💸 ဘယ်နှစ် USDT ဝယ်မှာလဲ။",
    enter_trx_amount: "💸 ဘယ်နှစ် TRX ဝယ်မှာလဲ။",
    result_usdt: (amt, rate) => `✅ ခန့်မှန်းအလိုက် ${(amt * rate).toLocaleString()} MMK ပေးရမည်`,
    result_trx: (amt, rate) => `✅ ခန့်မှန်းအလိုက် ${(amt * rate).toLocaleString()} MMK ပေးရမည်`,
    payment_details: "💳 MMK ပို့ရန်:\n\n🔹 KBZPay: Htun Sein 09777888283\n🔹 UABPay: Htun Sein 09666000106",
    ask_proof: "📤 ငွေပေးစာထဲမှ screenshot upload လုပ်ပါ။",
    thanks_proof: "✅ ရရှိပြီးပါပြီ။ Admin အတည်ပြုမည်။",
    approved: "✅ အတည်ပြုပြီးပါပြီ။ TRC20 wallet လိပ်စာ ပေးပါ။",
    wallet_received: (w) => `✅ Wallet လိပ်စာ: ${w} လက်ခံပြီးပါပြီ။\nCrypto မကြာမီ ပို့ပါမည်။`,
    rejected: "❌ ငွေပေးချေမှု မအောင်မြင်ပါ။ Support ဆက်သွယ်ပါ။",
    ask_track: "🔍 Order ID ဖြင့် စစ်ဆေးပါ။",
    track_result: (id, st, w) => `🆔 ငွေပေးစာ: ${id}\n📦 အခြေအနေ: ${st}\n🏦 Wallet: ${w || 'မပေးရသေးပါ'}`,
    not_found: "❌ Order မတွေ့ပါ။ ID စစ်ပါ။",
  },
  zh: {
    welcome: "🌐 欢迎来到 NeoXchange！\n请选择语言：",
    language_set: "✅ 已切换为中文。",
    rates: "💱 *购买汇率 (MMK → Crypto)*\n\nUSDT: {usdt} MMK\nTRX: {trx} MMK",
    menu: "请选择操作：",
    choose_crypto: "💰 您想买哪种加密货币？",
    enter_usdt_amount: "💸 您要买多少 USDT？",
    enter_trx_amount: "💸 您要买多少 TRX？",
    result_usdt: (amt, rate) => `✅ 您需支付约 ${(amt * rate).toLocaleString()} MMK`,
    result_trx: (amt, rate) => `✅ 您需支付约 ${(amt * rate).toLocaleString()} MMK`,
    payment_details: "💳 汇款至：\n\n🔹 KBZPay: Htun Sein 09777888283\n🔹 UABPay: Htun Sein 09666000106",
    ask_proof: "📤 上传付款截图：",
    thanks_proof: "✅ 已收到！管理员会尽快审核。",
    approved: "✅ 付款已批准！请发送您的 TRC20 钱包地址：",
    wallet_received: (w) => `✅ 收到钱包：${w}\n您的加密货币即将发送。`,
    rejected: "❌ 付款被拒。请联系客服。",
    ask_track: "🔍 输入订单 ID 进行跟踪：",
    track_result: (id, st, w) => `🆔 订单号: ${id}\n📦 状态: ${st}\n🏦 钱包: ${w || '未提供'}`,
    not_found: "❌ 未找到订单，请检查 ID。",
  }
};

// MENU helper
function sendMenu(ctx, lang) {
  ctx.reply(messages[lang].menu, Markup.inlineKeyboard([
    [Markup.button.callback("💱 Buy Crypto", "choose_crypto")],
    [Markup.button.callback("📊 Rates", "check_rates")],
    [Markup.button.callback("📤 Upload Proof", "upload_proof")],
    [Markup.button.callback("🔍 Track Order", "track_order")],
    [Markup.button.url("💬 Talk to Support", "https://t.me/Mr305xie")]
  ]));
}

bot.start(ctx => {
  const id = ctx.from.id;
  userLang[id] = 'en';
  ctx.reply(messages['en'].welcome, Markup.inlineKeyboard([
    [Markup.button.callback("🇬🇧 English", "lang_en")]
  ]));
});

bot.command("language", ctx => {
  const id = ctx.from.id;
  ctx.reply(messages['en'].welcome, Markup.inlineKeyboard([
    [Markup.button.callback("🇬🇧 English", "lang_en")]
  ]));
});

bot.action(/lang_(.+)/, ctx => {
  const id = ctx.from.id;
  const lang = ctx.match[1];
  userLang[id] = lang;
  ctx.answerCbQuery();
  ctx.editMessageText(messages[lang].language_set);
  sendMenu(ctx, lang);
});

bot.action("check_rates", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  const msg = messages[lang].rates
    .replace("{usdt}", currentRates.usdt)
    .replace("{trx}", currentRates.trx);
  ctx.answerCbQuery();
  ctx.replyWithMarkdown(msg);
});

bot.action("choose_crypto", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  userStage[id] = null;
  ctx.answerCbQuery();
  ctx.reply(messages[lang].choose_crypto, Markup.inlineKeyboard([
    [Markup.button.callback("💵 USDT", "buy_usdt")],
    [Markup.button.callback("🪙 TRX", "buy_trx")]
  ]));
});

bot.action("buy_usdt", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  userStage[id] = "buy_usdt";
  ctx.answerCbQuery();
  ctx.reply(messages[lang].enter_usdt_amount);
});

bot.action("buy_trx", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  userStage[id] = "buy_trx";
  ctx.answerCbQuery();
  ctx.reply(messages[lang].enter_trx_amount);
});

bot.action("upload_proof", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  userStage[id] = "upload_proof";
  ctx.answerCbQuery();
  ctx.reply(messages[lang].ask_proof);
});

bot.action("track_order", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  userStage[id] = "track";
  ctx.answerCbQuery();
  ctx.reply(messages[lang].ask_track);
});

bot.on("photo", async ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  if(userStage[id] === "upload_proof") {
    const fileId = ctx.message.photo.slice(-1)[0].file_id;
    const orderId = uuidv4().split("-")[0].toUpperCase();
    userOrders[orderId] = {
      user_id: id,
      username: ctx.from.username || "User",
      lang,
      status: "Pending",
      file_id: fileId,
      wallet: null
    };
    await ctx.reply(messages[lang].thanks_proof);
    await bot.telegram.sendPhoto(config.ADMIN_ID, fileId, {
      caption: `📥 New Proof\n🆔 ${orderId}\n👤 @${ctx.from.username || "User"} (ID: ${id})`,
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Approve", callback_data: `approve_${orderId}` }],
          [{ text: "❌ Reject", callback_data: `reject_${orderId}` }]
        ]
      }
    });
    userStage[id] = null;
  }
});

bot.action(/approve_(.+)/, ctx => {
  const oid = ctx.match[1], o = userOrders[oid];
  if (!o) return;
  o.status = "Approved";
  userStage[o.user_id] = "wallet";
  const lang = o.lang;
  bot.telegram.sendMessage(o.user_id, messages[lang].approved);
  ctx.editMessageCaption(`✅ Approved\n🆔 ${oid}\n👤 @${o.username}`);
  bot.telegram.sendMessage(config.ADMIN_ID, `🛠 Set status for Order ID: ${oid}`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⚙️ Set Processing", callback_data: `status_processing_${oid}` }],
        [{ text: "✅ Set Sent", callback_data: `status_sent_${oid}` }]
      ]
    }
  });
});

bot.action(/reject_(.+)/, ctx => {
  const oid = ctx.match[1], o = userOrders[oid];
  if (!o) return;
  o.status = "Rejected";
  const lang = o.lang;
  bot.telegram.sendMessage(o.user_id, messages[lang].rejected);
  ctx.editMessageCaption(`❌ Rejected\n🆔 ${oid}\n👤 @${o.username}`);
});

bot.action(/status_(processing|sent)_(.+)/, ctx => {
  const status = ctx.match[1];
  const oid = ctx.match[2];
  const o = userOrders[oid];
  if (!o) return;
  o.status = status.charAt(0).toUpperCase() + status.slice(1);
  const lang = o.lang;
  bot.telegram.sendMessage(o.user_id, messages[lang].current_status(o.status), { parse_mode: "Markdown" });
  ctx.answerCbQuery(`Status set to ${o.status}`);
  ctx.editMessageText(`🛠 Status updated to: ${o.status}\n🆔 Order ID: ${oid}`);
});

bot.on("text", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  const stage = userStage[id];

  if (stage === "wallet") {
    const w = ctx.message.text.trim();
    const entry = Object.entries(userOrders).find(([_, o]) => o.user_id === id && o.status === "Approved" && !o.wallet);
    if (entry) {
      const [oid, o] = entry;
      o.wallet = w;
      ctx.reply(messages[lang].wallet_received(w));
      ctx.reply(`🆔 Your Order ID: ${oid}`);
      bot.telegram.sendMessage(config.ADMIN_ID, `📬 Wallet Received\n🆔 ${oid}\n👤 @${ctx.from.username || "User"}\n🏦 ${w}`);
    }
    userStage[id] = null;
  }

  else if (stage === "buy_usdt" || stage === "buy_trx") {
    const amt = parseFloat(ctx.message.text.replace(/[^0-9.]/g, ""));
    if (!isNaN(amt)) {
      const rate = stage === "buy_usdt" ? +currentRates.usdt : +currentRates.trx;
      const text = stage === "buy_usdt"
        ? messages[lang].result_usdt(amt, rate)
        : messages[lang].result_trx(amt, rate);
      ctx.reply(text);
      ctx.reply(messages[lang].payment_details, Markup.inlineKeyboard([
        [Markup.button.callback("📤 Upload Proof", "upload_proof")]
      ]));
    }
    userStage[id] = null;
  }

  else if (stage === "track") {
    const oid = ctx.message.text.trim().toUpperCase();
    const o = userOrders[oid];
    if (o) ctx.reply(messages[lang].track_result(oid, o.status, o.wallet));
    else ctx.reply(messages[lang].not_found);
    userStage[id] = null;
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
bot.launch();
console.log("✅ NeoXchange bot running with full features and status updates");