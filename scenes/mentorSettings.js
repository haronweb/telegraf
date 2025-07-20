const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Nastavniki, Operators } = require("../database");

module.exports = new WizardScene(
  "mentor_settings",

  // Шаг 1 — Запрос ввода
  async (ctx) => {
    try {
      const who = ctx.match[1];
      const status = ctx.match[2];

      const message =
        status === "percent"
          ? "Введите новый процент"
          : "Введите новое описание анкеты:";

      await ctx.replyOrEdit(message, {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "money_cancel")],
        ]),
      });

      ctx.scene.state.data = status;
      ctx.scene.state.who = who;

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
      const who = ctx.scene.state.who;

      if (status === "percent") {
        const input = ctx.message.text.trim();

        // Проверка на число от 1 до 100
        const percent = parseInt(input);
        if (isNaN(percent) || percent < 1 || percent > 100) {
          await ctx.scene.reply("⚠️ Введите корректное число",{
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "money_cancel")],
            ]),
          });
                    return;
        }

        if (who === "mentor") {
          await Nastavniki.update({ percent }, { where: { id: ctx.from.id } });
        } else {
          await Operators.update({ percent }, { where: { userId: ctx.from.id } });
        }
      } else {
        const aboutText = ctx.message.text.trim();

        if (who === "mentor") {
          await Nastavniki.update({ about: aboutText }, { where: { id: ctx.from.id } });
        } else {
          await Operators.update({ about: aboutText }, { where: { userId: ctx.from.id } });
        }
      }

      await ctx.scene.reply("✅ Изменения успешно сохранены", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("◀️ Назад", "menu_mentor")],
        ]),
      });

      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      await ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  }
);
