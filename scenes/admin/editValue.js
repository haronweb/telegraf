const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const settings = require("../../commands/admin/settings");
const log = require("../../helpers/log");

const scene = new WizardScene(
  "admin_edit_value",
  async (ctx) => {
    try {
      await ctx.scene.reply("✍️ Введите новое значение", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      return ctx.wizard.next();
    } catch (err) {
      await ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      const { column } = ctx.scene.state;
      const input = ctx.message.text.trim();

      // Проверка на ссылку
      if (["allGroupLink", "payoutsChannelLink"].includes(column)) {
        try {
          new URL(input); // выбросит исключение если невалидно
        } catch {
          await ctx.reply("❌ Вы ввели невалидный URL").catch(() => {});
          return ctx.wizard.prevStep();
        }
      }

      // Проверка на число для процентов
      if (["payoutPercent", "referralPercent"].includes(column)) {
        const amount = parseFloat(input);
        if (isNaN(amount) || amount < 0 || amount > 100) {
          await ctx.reply("❌ Введите число от 0 до 100").catch(() => {});
          return ctx.wizard.prevStep();
        }
        ctx.message.text = amount.toFixed(2);
      }

      // Обновление значения
      await ctx.state.bot.update({
        [column]: ctx.message.text,
      });

      log(
        ctx,
        `изменил параметр <code>${column}</code> на <code>${escapeHTML(
          ctx.message.text
        )}</code>`
      );

      await ctx.scene.reply("✅ Значение успешно обновлено").catch(() => {});
    } catch (err) {
      console.error("Ошибка при обновлении параметра:", err);
      await ctx.reply("❌ Ошибка").catch(() => {});
    }

    return ctx.scene.leave();
  }
);

scene.leave(settings);

module.exports = scene;
