const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const service = require("../../commands/admin/service");
const { Service } = require("../../database");
const log = require("../../helpers/log");
const { Op } = require("sequelize");

const scene = new WizardScene(
  "admin_service_edit_domain",

  // Шаг 1 — запрос ввода
  async (ctx) => {
    try {
      await ctx.scene.reply("Введите домен", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });

      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch(() => {});
      return ctx.scene.leave();
    }
  },

  // Шаг 2 — обработка ввода
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      const inputDomain = ctx.message.text.trim().substr(0, 255);
      const currentService = await Service.findByPk(ctx.scene.state.id);

      // Ищем другой сервис с таким же доменом
      const existing = await Service.findOne({
        where: {
          domain: inputDomain,
          id: { [Op.ne]: currentService.id },
        },
      });

      let zone = null;

      if (existing?.zone) {
        zone = existing.zone;
      } else if (currentService.zone) {
        zone = null; // домен уникальный, сбрасываем старую зону
      } else {
        zone = currentService.id; // если нет зоны — создаём свою
      }

      await currentService.update({
        domain: inputDomain,
        zone: zone,
      });

      log(
        ctx,
        `изменил домен ${inputDomain} для сервиса ${currentService.title} (zone: ${zone})`
      );
      await ctx.reply("✅ Домен сервиса обновлён!").catch(() => {});
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Ошибка при обновлении домена").catch(() => {});
    }

    return ctx.scene.leave();
  }
);

scene.leave((ctx) => service(ctx, ctx.scene.state.id));

module.exports = scene;
