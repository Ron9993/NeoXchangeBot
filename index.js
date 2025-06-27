const { Telegraf, Markup } = require('telegraf');
const { v4: uuidv4 } = require('uuid');
const config = require('./config.json');

const bot = new Telegraf(config.BOT_TOKEN);
const userLang = {};
const userStage = {};
const userOrders = {};
let currentRates = { usdt: "4620", trx: "1340" };

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
    current_status: (st) => `🔔 Your order status is now: *${st}*`,
    txid_received: (txid) => `🔗 *Transaction ID:* \`${txid}\`\n\n✅ Your crypto has been sent! You can track this transaction on the blockchain using the above ID.`,
    order_approved: (oid, crypto, amount, total) => `✅ Your order has been approved!\n🆔 Order ID: ${oid}\n💎 ${crypto}: ${amount}\n💵 Total: ${total.toLocaleString()} MMK`,
    order_denied: (oid, crypto, amount) => `❌ Your order has been denied.\n🆔 Order ID: ${oid}\n💎 ${crypto}: ${amount}\n\n💬 Please contact support for more information.`,
    purchase_request: (crypto, amt, base, fee, total, oid) => `✅ ${crypto} Purchase Request:\n💰 Amount: ${amt} ${crypto}\n💵 Base Cost: ${base.toLocaleString()} MMK\n📊 Service Fee (3% - includes transaction fees): ${fee.toLocaleString()} MMK\n💳 Total: ${total.toLocaleString()} MMK\n\n⏳ Your order has been submitted for admin approval.\n🆔 Order ID: ${oid}`
  },
  zh: {
    welcome: "🌐 欢迎来到 NeoXchange！\n请选择您的语言：",
    language_set: "✅ 语言已设置为中文。",
    rates: "💱 *购买汇率 (MMK → 加密货币)*\n\nUSDT: {usdt} MMK\nTRX: {trx} MMK",
    menu: "请选择一个选项：",
    choose_crypto: "💰 您想购买哪种加密货币？",
    enter_usdt_amount: "💸 您想要多少 USDT？",
    enter_trx_amount: "💸 您想要多少 TRX？",
    result_usdt: (amt, rate) => `✅ 您需要支付大约 ${(amt * rate).toLocaleString()} MMK`,
    result_trx: (amt, rate) => `✅ 您需要支付大约 ${(amt * rate).toLocaleString()} MMK`,
    payment_details: "💳 请转账 MMK 至：\n\n🔹 KBZPay: Htun Sein 09777888283\n🔹 UABPay: Htun Sein 09666000106",
    ask_proof: "📤 上传您的付款截图：",
    thanks_proof: "✅ 收到付款凭证！管理员将很快验证。",
    approved: "✅ 付款已批准！请发送您的 TRC20 钱包地址：",
    wallet_received: (w) => `✅ 钱包地址已收到：${w}\n您的加密货币将很快发送。`,
    rejected: "❌ 付款被拒绝。请联系客服。",
    ask_track: "🔍 输入订单 ID 进行跟踪：",
    track_result: (id, st, w) => `🆔 订单 ID: ${id}\n📦 状态: ${st}\n🏦 钱包: ${w || '尚未提供'}`,
    not_found: "❌ 未找到订单。请检查 ID。",
    current_status: (st) => `🔔 您的订单状态现在是：*${st}*`,
    txid_received: (txid) => `🔗 *交易 ID:* \`${txid}\`\n\n✅ 您的加密货币已发送！您可以使用上述 ID 在区块链上跟踪此交易。`,
    order_approved: (oid, crypto, amount, total) => `✅ 您的订单已获批准！\n🆔 订单 ID: ${oid}\n💎 ${crypto}: ${amount}\n💵 总计: ${total.toLocaleString()} MMK`,
    order_denied: (oid, crypto, amount) => `❌ 您的订单已被拒绝。\n🆔 订单 ID: ${oid}\n💎 ${crypto}: ${amount}\n\n💬 请联系客服了解更多信息。`,
    purchase_request: (crypto, amt, base, fee, total, oid) => `✅ ${crypto} 购买申请:\n💰 数量: ${amt} ${crypto}\n💵 基础费用: ${base.toLocaleString()} MMK\n📊 服务费 (3% - 包含交易费): ${fee.toLocaleString()} MMK\n💳 总计: ${total.toLocaleString()} MMK\n\n⏳ 您的订单已提交待管理员批准。\n🆔 订单 ID: ${oid}`
  },
  my: {
    welcome: "🌐 NeoXchange မှ ကြိုဆိုပါတယ်!\nကျေးဇူးပြု၍ သင်၏ဘာသာစကားကို ရွေးချယ်ပါ:",
    language_set: "✅ ဘာသာစကားကို မြန်မာအဖြစ် သတ်မှတ်ပြီးပါပြီ။",
    rates: "💱 *ဝယ်ယူရေး နှုန်းထား (MMK → Crypto)*\n\nUSDT: {usdt} MMK\nTRX: {trx} MMK",
    menu: "ကျေးဇူးပြု၍ ရွေးချယ်မှုတစ်ခု ရွေးပါ:",
    choose_crypto: "💰 မည်သည့် crypto ကို ဝယ်ချင်ပါသလဲ?",
    enter_usdt_amount: "💸 USDT ဘယ်လောက် လိုအပ်ပါသလဲ?",
    enter_trx_amount: "💸 TRX ဘယ်လောက် လိုအပ်ပါသလဲ?",
    result_usdt: (amt, rate) => `✅ သင်သည် ခန့်မှန်းခြေ ${(amt * rate).toLocaleString()} MMK ပေးရမည်`,
    result_trx: (amt, rate) => `✅ သင်သည် ခန့်မှန်းခြေ ${(amt * rate).toLocaleString()} MMK ပေးရမည်`,
    payment_details: "💳 ကျေးဇူးပြု၍ MMK ကို လွှဲပါ:\n\n🔹 KBZPay: Htun Sein 09777888283\n🔹 UABPay: Htun Sein 09666000106",
    ask_proof: "📤 သင်၏ ငွေပေးချေမှု ဓာတ်ပုံကို upload လုပ်ပါ:",
    thanks_proof: "✅ သက်သေထောက်ခံချက် ရရှိပါပြီ! Admin မှ မကြာမီ စစ်ဆေးပါမည်။",
    approved: "✅ ငွေပေးချေမှု အတည်ပြုပါပြီ! သင်၏ TRC20 wallet လိပ်စာကို ပို့ပါ:",
    wallet_received: (w) => `✅ Wallet လိပ်စာ ရရှိပါပြီ: ${w}\nသင်၏ crypto ကို မကြာမီ ပို့ပေးပါမည်။`,
    rejected: "❌ ငွေပေးချေမှု ငြင်းပယ်ခံရပါပြီ။ ကျေးဇူးပြု၍ အကူအညီကို ဆက်သွယ်ပါ။",
    ask_track: "🔍 စစ်ဆေးရန် Order ID ကို ရိုက်ထည့်ပါ:",
    track_result: (id, st, w) => `🆔 Order ID: ${id}\n📦 အခြေအနေ: ${st}\n🏦 Wallet: ${w || 'မသတ်မှတ်ရသေး'}`,
    not_found: "❌ မှာယူမှု မတွေ့ရှိပါ။ ID ကို စစ်ဆေးပါ။",
    current_status: (st) => `🔔 သင်၏ မှာယူမှု အခြေအနေသည် ယခု: *${st}*`,
    txid_received: (txid) => `🔗 *Transaction ID:* \`${txid}\`\n\n✅ သင်၏ crypto ကို ပို့ပြီးပါပြီ! အထက်ပါ ID ကို အသုံးပြု၍ blockchain တွင် ဤ transaction ကို ခြေရာခံနိုင်ပါသည်။`,
    order_approved: (oid, crypto, amount, total) => `✅ သင်၏ မှာယူမှု ခွင့်ပြုပါပြီ!\n🆔 Order ID: ${oid}\n💎 ${crypto}: ${amount}\n💵 စုစုပေါင်း: ${total.toLocaleString()} MMK`,
    order_denied: (oid, crypto, amount) => `❌ သင်၏ မှာယူမှု ငြင်းပယ်ခံရပါပြီ။\n🆔 Order ID: ${oid}\n💎 ${crypto}: ${amount}\n\n💬 ပိုမိုသိရှိရန် အကူအညီကို ဆက်သွယ်ပါ။`,
    purchase_request: (crypto, amt, base, fee, total, oid) => `✅ ${crypto} ဝယ်ယူမှု တောင်းဆိုမှု:\n💰 ပမာဏ: ${amt} ${crypto}\n💵 အခြေခံ ကုန်ကျစရိတ်: ${base.toLocaleString()} MMK\n📊 ဝန်ဆောင်မှု ကြေး (3% - လွှဲငွေ ကုန်ကျစရိတ် ပါဝင်): ${fee.toLocaleString()} MMK\n💳 စုစုပေါင်း: ${total.toLocaleString()} MMK\n\n⏳ သင်၏ မှာယူမှုကို admin ခွင့်ပြုမှုအတွက် တင်ပြပြီးပါပြီ။\n🆔 Order ID: ${oid}`
  }
};

function sendMenu(ctx, lang) {
  const menuButtons = {
    en: {
      buy: "💱 Buy Crypto",
      rates: "📊 Rates", 
      upload: "📤 Upload Proof",
      track: "🔍 Track Order",
      support: "💬 Talk to Support"
    },
    zh: {
      buy: "💱 购买加密货币",
      rates: "📊 汇率",
      upload: "📤 上传凭证", 
      track: "🔍 跟踪订单",
      support: "💬 联系客服"
    },
    my: {
      buy: "💱 Crypto ဝယ်ယူရန်",
      rates: "📊 နှုန်းထားများ",
      upload: "📤 သက်သေ Upload လုပ်ရန်",
      track: "🔍 Order စစ်ဆေးရန်", 
      support: "💬 အကူအညီ ဆက်သွယ်ရန်"
    }
  };
  
  const buttons = menuButtons[lang] || menuButtons.en;
  
  ctx.reply(messages[lang].menu, Markup.inlineKeyboard([
    [Markup.button.callback(buttons.buy, "choose_crypto")],
    [Markup.button.callback(buttons.rates, "check_rates")],
    [Markup.button.callback(buttons.upload, "upload_proof")],
    [Markup.button.callback(buttons.track, "track_order")],
    [Markup.button.url(buttons.support, "https://t.me/Mr305xie")]
  ]));
}

bot.start(ctx => {
  const id = ctx.from.id;
  userLang[id] = 'en';
  ctx.reply(messages['en'].welcome, Markup.inlineKeyboard([
    [Markup.button.callback("🇬🇧 English", "lang_en")],
    [Markup.button.callback("🇨🇳 中文", "lang_zh")],
    [Markup.button.callback("🇲🇲 မြန်မာ", "lang_my")]
  ]));
});

bot.command("language", ctx => {
  const id = ctx.from.id;
  const currentLang = userLang[id] || 'en';
  ctx.reply(messages[currentLang].welcome, Markup.inlineKeyboard([
    [Markup.button.callback("🇬🇧 English", "lang_en")],
    [Markup.button.callback("🇨🇳 中文", "lang_zh")],
    [Markup.button.callback("🇲🇲 မြန်မာ", "lang_my")]
  ]));
});

bot.command("menu", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  sendMenu(ctx, lang);
});

bot.command("rates", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  const msg = messages[lang].rates
    .replace("{usdt}", currentRates.usdt)
    .replace("{trx}", currentRates.trx);
  ctx.replyWithMarkdown(msg);
});

bot.command("buy", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  userStage[id] = null;
  ctx.reply(messages[lang].choose_crypto, Markup.inlineKeyboard([
    [Markup.button.callback("💵 USDT", "buy_usdt")],
    [Markup.button.callback("🪙 TRX", "buy_trx")]
  ]));
});

bot.command("upload", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  userStage[id] = "upload_proof";
  ctx.reply(messages[lang].ask_proof);
});

bot.command("track", ctx => {
  const id = ctx.from.id;
  const lang = userLang[id] || 'en';
  userStage[id] = "track";
  ctx.reply(messages[lang].ask_track);
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
  const stage = userStage[id];
  
  if(stage === "upload_proof") {
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
  
  // Handle admin transaction screenshot upload
  else if (stage && stage.startsWith("tx_screenshot_") && id == config.ADMIN_ID) {
    const oid = stage.split("_")[2];
    const o = userOrders[oid];
    if (o) {
      const fileId = ctx.message.photo.slice(-1)[0].file_id;
      o.tx_screenshot = fileId;
      const lang = o.lang;
      
      // Send transaction screenshot to customer
      const cryptoInfo = o.crypto && o.amount ? `\n💎 ${o.crypto}: ${o.amount}` : '';
      const txidInfo = o.txid ? `\n🔗 Transaction ID: ${o.txid}` : '';
      
      await bot.telegram.sendPhoto(o.user_id, fileId, {
        caption: `📸 Transaction Screenshot\n🆔 Order ID: ${oid}${cryptoInfo}${txidInfo}\n\n✅ Your crypto has been sent! Please check your wallet.\n\n💰 Amount: ${o.amount || 'N/A'} ${o.crypto || 'Crypto'}`
      });
      
      // Confirm to admin
      ctx.reply(`✅ Transaction screenshot sent to customer!\n🆔 Order: ${oid}`);
      
      // Mark order as completed
      o.status = "Completed";
    }
    userStage[id] = null;
  }
});

bot.action(/approve_order_(.+)/, ctx => {
  const oid = ctx.match[1];
  const o = userOrders[oid];
  if (!o) return;

  o.status = "Order Approved";
  const lang = o.lang;

  // Answer the callback query first to stop loading
  ctx.answerCbQuery("Order approved!");

  // Send payment details to user
  bot.telegram.sendMessage(o.user_id, 
    `${messages[lang].order_approved(oid, o.crypto, o.amount, o.total_mmk)}\n\n${messages[lang].payment_details}`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📤 Upload Payment Proof", callback_data: "upload_proof" }]
      ]
    }
  });

  ctx.editMessageText(`✅ Order Approved\n🆔 ${oid}\n👤 @${o.username}\n💎 ${o.crypto}: ${o.amount}`);
});

bot.action(/deny_order_(.+)/, ctx => {
  const oid = ctx.match[1];
  const o = userOrders[oid];
  if (!o) return;

  o.status = "Order Denied";
  const lang = o.lang;

  ctx.answerCbQuery("Order denied!");

  // Notify user
  bot.telegram.sendMessage(o.user_id, messages[lang].order_denied(oid, o.crypto, o.amount));

  ctx.editMessageText(`❌ Order Denied\n🆔 ${oid}\n👤 @${o.username}\n💎 ${o.crypto}: ${o.amount}`);
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
        [{ text: "⚙️ Set Processing", callback_data: `status_processing_${oid}` }]
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

  if (status === "processing") {
    // After setting to Processing, show Sent button
    ctx.editMessageText(`🛠 Status updated to: Processing\n🆔 Order ID: ${oid}`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Set Sent", callback_data: `status_sent_${oid}` }]
        ]
      }
    });
  } else if (status === "sent") {
    // After setting to Sent, ask for transaction ID and screenshot
    ctx.editMessageText(`✅ Order Status: Sent\n🆔 Order ID: ${oid}\n\n📝 Please reply with the crypto transaction ID:`);
    userStage[config.ADMIN_ID] = `txid_${oid}`;
  }
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
      const crypto = stage === "buy_usdt" ? "USDT" : "TRX";
      const baseAmount = amt * rate;
      const fee = baseAmount * 0.03; // 3% fee
      const totalAmount = baseAmount + fee;
      
      // Create order for admin approval
      const orderId = uuidv4().split("-")[0].toUpperCase();
      userOrders[orderId] = {
        user_id: id,
        username: ctx.from.username || "User",
        lang,
        crypto,
        amount: amt,
        base_mmk: baseAmount,
        fee_mmk: fee,
        total_mmk: totalAmount,
        status: "Pending Approval",
        file_id: null,
        wallet: null
      };

      const text = messages[lang].purchase_request(crypto, amt, baseAmount, fee, totalAmount, orderId);
      
      ctx.reply(text);

      // Send to admin for approval
      bot.telegram.sendMessage(config.ADMIN_ID, 
        `📋 New Order Request\n🆔 Order ID: ${orderId}\n👤 @${ctx.from.username || "User"} (ID: ${id})\n💎 ${crypto}: ${amt}\n💵 Total: ${totalAmount.toLocaleString()} MMK`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Approve Order", callback_data: `approve_order_${orderId}` }],
            [{ text: "❌ Deny Order", callback_data: `deny_order_${orderId}` }]
          ]
        }
      });
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

  else if (stage && stage.startsWith("txid_")) {
    const oid = stage.split("_")[1];
    const txid = ctx.message.text.trim();
    const o = userOrders[oid];
    if (o) {
      o.txid = txid;
      const lang = o.lang;
      
      // Send transaction ID to customer
      bot.telegram.sendMessage(o.user_id, messages[lang].txid_received(txid), { parse_mode: "Markdown" });
      
      // Ask admin for transaction screenshot
      ctx.reply(`✅ Transaction ID sent to customer!\n🔗 TXID: ${txid}\n🆔 Order: ${oid}\n\n📸 Now please upload a screenshot of the transaction:`);
      userStage[id] = `tx_screenshot_${oid}`;
    } else {
      userStage[id] = null;
    }
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
// Set up persistent menu commands
bot.telegram.setMyCommands([
  { command: 'menu', description: '📋 Main Menu' },
  { command: 'rates', description: '💱 Current Rates' },
  { command: 'buy', description: '💰 Buy Crypto' },
  { command: 'upload', description: '📤 Upload Payment Proof' },
  { command: 'track', description: '🔍 Track Order' },
  { command: 'language', description: '🌐 Change Language' }
]);

bot.launch();
console.log("✅ NeoXchange bot running with full features and status updates");