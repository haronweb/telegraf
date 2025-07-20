const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { User } = require("../database");

// Функция для определения сети по адресу
function detectNetwork(address) {
  if (address.startsWith("U") || address.startsWith("EQ")) {
    return "TON (The Open Network)";
  } else if (address.startsWith("T") && address.length === 34) {
    return "Tron (TRC-20)";
  } else if (address.startsWith("0x") && address.length === 42) {
    return "Ethereum (ERC-20) / BNB Smart Chain (BEP-20)";
  } else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return "Solana (SPL)";
  } else {
    return "Неизвестная сеть";
  }
}

const scene = new WizardScene(
  "change_trc",
  async (ctx) => {
    try {
      await ctx.answerCbQuery("Ожидаю кошелёк...").catch((err) => err);

      await ctx.replyOrEdit(`Введите ваш USDT-адрес`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "wallet_cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    // Обработка кнопки "Отменить"
    if (ctx.updateType === "callback_query" && ctx.update.callback_query.data === "wallet_cancel") {
      await ctx.answerCbQuery();
      await ctx.editMessageText("❌ Изменение кошелька отменено.");
      return ctx.scene.leave();
    }

    try {
      const address = ctx.message?.text?.trim();
      if (!address) {
        await ctx.reply("❌ Пожалуйста, введите корректный адрес.", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "wallet_cancel")],
          ]),
        });
        return ctx.wizard.selectStep(0);
      }

      const network = detectNetwork(address);

      if (network === "Неизвестная сеть") {
        await ctx.scene.reply("❌ Адрес не распознан. Пожалуйста, проверьте правильность USDT-адреса.", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "wallet_cancel")],
          ]),
        });
        return ctx.wizard.selectStep(0);
      }

      // Сохраняем в базу
      await User.update(
        {
          trc: address,
          wallet: true,
        },
        { where: { id: ctx.from.id } }
      );

      await ctx.scene.reply(
        `✅ Адрес успешно добавлен.\n\n🌐 Сеть: <b>${network}</b>`,
        {
          reply_to_message_id: ctx.message.message_id,
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("◀️ Назад", `change_trc`)],
          ]),
        }
      );
      return ctx.scene.leave();
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Ошибка при сохранении кошелька.").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);

module.exports = scene;
