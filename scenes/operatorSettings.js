const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Operators } = require("../database");

module.exports = new WizardScene(
  "operator_settings",

  // Шаг 1 — Запрос на ввод
  async (ctx) => {
    try {
      const status = ctx.match[2];

      const promptText =
        status === "percent"
          ? "Введите новый процент"
          : "Введите новое описание анкеты:";

      await ctx.scene.reply(promptText, {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "money_cancel")],
        ]),
      });

      ctx.scene.state.data = status;
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  },

  // Шаг 2 — Обработка ввода
  async (ctx) => {
    try {
      const status = ctx.scene.state.data;

      if (status === "percent") {
        const input = ctx.message.text.trim();
        const percent = parseInt(input);

        // Проверка на корректное число
        if (isNaN(percent) || percent < 1 || percent > 100) {
          await ctx.scene.reply("⚠️ Введите корректное число",{
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "money_cancel")],
            ]),
          });
          return;
        }

        await Operators.update(
          { percent },
          { where: { userId: ctx.from.id } }
        );
      } else {
        const aboutText = ctx.message.text.trim();
        await Operators.update(
          { about: aboutText },
          { where: { userId: ctx.from.id } }
        );
      }

      await ctx.scene.reply("✅ Изменения успешно сохранены", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("◀️ Назад", "menu_operator")],
        ]),
      });

      return ctx.scene.leave();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  }
);
