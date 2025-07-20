const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const service = require("../../commands/admin/service");
const { Service } = require("../../database");
const log = require("../../helpers/log");
const { Op } = require("sequelize");

const scene = new WizardScene(
  "admin_service_edit_shortlink",

  // Шаг 1 — Ввод
  async (ctx) => {
    try {
      await ctx.scene.reply("Введите домен сокращалки", {
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

  // Шаг 2 — Обработка
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      const inputShortlink = ctx.message.text.trim().substr(0, 255);
      const currentService = await Service.findByPk(ctx.scene.state.id);

      // Проверяем, используется ли такая сокращалка где-то ещё
      const existing = await Service.findOne({
        where: {
          shortlink: inputShortlink,
          id: { [Op.ne]: currentService.id },
        },
      });

      let zone = null;

      if (existing?.shortlinkZone) {
        zone = existing.shortlinkZone;
      } else if (currentService.shortlinkZone) {
        // Если введённая сокращалка нигде не найдена, но у сервиса уже была зона — обнуляем
        zone = null;
      } else {
        // У сервиса нет зоны — назначаем текущий id как зону
        zone = currentService.id;
      }

      await currentService.update({
        shortlink: inputShortlink,
        shortlinkZone: zone,
      });

      log(
        ctx,
        `изменил сокращалку ${inputShortlink} для сервиса ${currentService.title} (zone: ${zone})`
      );
      await ctx.reply("✅ Сокращалка обновлена!").catch(() => {});
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Ошибка при обновлении").catch(() => {});
    }

    return ctx.scene.leave();
  }
);

scene.leave((ctx) => service(ctx, ctx.scene.state.id));

module.exports = scene;
