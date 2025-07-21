const { Op } = require("sequelize");
const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const user = require("../../commands/admin/user");
const profit = require("../../commands/admin/profit");

const {
  User,
  Profit,
  Currency,
  Nastavniki,
  Operators,
  Ad,
  Referral,
} = require("../../database");
const log = require("../../helpers/log");
const locale = require("../../locale");

async function calc(ctx, amount, curr, ment, op, userId) {
  try {
    const user = await User.findOne({
      where: { id: userId },
    });

    const data = {
      amount: amount,
      mentor: ment,
      operator: op,
      amounts: {
        worker: null,
        mentor: null,
        operator: null,
        referrer: null,
        services: null,
      },
      convertedAmounts: {
        amount: null,
        worker: null,
        mentor: null,
        operator: null,
        referrer: null,
        services: null,
      },
      effectiveWorkerPercent: null,
    };

    const currency = await Currency.findOne({
      where: { code: "USD" },
    });

    let totalDeductionPercent = 0;

    // Собираем проценты для всех активных услуг
    const servicePercentages = [];

    const screenUsed = ctx.scene.state.screen3 || ctx.scene.state.screen4;
    if (screenUsed) {
      servicePercentages.push(3); // Добавляем 3%, если хотя бы один из скринов использовался
    }
    if (ctx.scene.state.mailer) servicePercentages.push(5);
    if (ctx.scene.state.mailer2) servicePercentages.push(7);
    if (ctx.scene.state.mailer3) servicePercentages.push(5);
    if (ctx.scene.state.mailer4) servicePercentages.push(4);
    if (ctx.scene.state.mailer5) servicePercentages.push(5);
    if (ctx.scene.state.mailer6) servicePercentages.push(7);
    if (ctx.scene.state.mailer7) servicePercentages.push(5);
    if (ctx.scene.state.mailer8) servicePercentages.push(5);
    if (ctx.scene.state.mailer9) servicePercentages.push(4);

    if (ctx.scene.state.sms) servicePercentages.push(7);
    if (ctx.scene.state.sms2) servicePercentages.push(0);
    if (ctx.scene.state.sms3) servicePercentages.push(0);

    if (ctx.scene.state.screen) servicePercentages.push(5);
    if (ctx.scene.state.screen2) servicePercentages.push(2);
    if (ctx.scene.state.call) servicePercentages.push(15);

    const serviceTotal = servicePercentages.reduce((sum, val) => sum + val, 0);
    totalDeductionPercent += serviceTotal;

    // Вычисляем сумму всех сервисов
    const servicesAmount = ((amount * serviceTotal) / 100).toFixed(2);
    data.amounts.services = servicesAmount;

    // Получаем проценты для ментора и оператора, если они есть
    const mentor = ment
      ? await Nastavniki.findOne({ where: { id: ment } })
      : null;
    const operator = op
      ? await Operators.findOne({ where: { userId: op } })
      : null;

    if (mentor) {
      data.amounts.mentor = ((amount * mentor.percent) / 100).toFixed(2);
      totalDeductionPercent += mentor.percent;
    }
    if (operator) {
      data.amounts.operator = ((amount * operator.percent) / 100).toFixed(2);
      totalDeductionPercent += operator.percent;
    }
    // Реферал
    const referrer = await Referral.findOne({ where: { userId } });
    let referrerAmount = 0;
    const referralPercent = parseFloat(ctx.state.bot.referralPercent || 0);

    if (referrer) {
      referrerAmount = amount * referralPercent / 100;
      totalDeductionPercent += referralPercent;
    }
    data.amounts.referrer = referrerAmount.toFixed(2);

    // Общий процент выплат для воркера
    const payoutPercent = user.percent || ctx.state.bot.payoutPercent;

    // Итоговый процент для воркера с учетом всех вычетов
    const effectiveWorkerPercent = payoutPercent - totalDeductionPercent;

    // Вычисляем сумму для воркера
    const workerAmount = ((amount * effectiveWorkerPercent) / 100).toFixed(2);
    data.amounts.worker = workerAmount;

    // Конвертация сумм в рубли
    data.convertedAmounts.worker = (workerAmount * currency.rub).toFixed(2);
    data.convertedAmounts.amount = (amount * currency.rub).toFixed(2);
    data.convertedAmounts.referrer = (
      data.amounts.referrer * currency.rub
    ).toFixed(2);
    data.convertedAmounts.services = (
      data.amounts.services * currency.rub
    ).toFixed(2);
    if (data.amounts.mentor)
      data.convertedAmounts.mentor = (
        data.amounts.mentor * currency.rub
      ).toFixed(2);
    if (data.amounts.operator)
      data.convertedAmounts.operator = (
        data.amounts.operator * currency.rub
      ).toFixed(2);

    data.effectiveWorkerPercent = effectiveWorkerPercent;

    return data;
  } catch (e) {
    console.log(e);
    return "Не удалось сконвертировать сумму";
  }
}

const scene = new WizardScene(
  "admin_add_profit",
  async (ctx) => {
    try {
      await ctx.scene.reply("Введите username или ID вбивера", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });
      ctx.scene.state.data = {};

      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();
      ctx.message.text = ctx.message.text.replace("@", "");
      const user = await User.findOne({
        where: {
          [Op.or]: [
            {
              username: ctx.message.text,
            },
            {
              id: ctx.message.text,
            },
          ],
        },
      });
      if (!user) {
        ctx.reply("❌ Пользователь не найден").catch((err) => err);
        return ctx.wizard.prevStep();
      }

      ctx.scene.state.data.writer = user.id;

      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },

  async (ctx) => {
    try {
      await ctx.scene.reply(`Введите сумму залета (только число, в USD)`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
      });

      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      var amount = parseFloat(ctx.message?.text);
      if (isNaN(amount)) return ctx.wizard.prevStep();
      amount = amount.toFixed(2);

      const currency = await Currency.findOne({
        where: {
          code: "USD",
        },
      });

      const user = await User.findOne({
        where: {
          id: ctx.scene.state.userId,
        },
      });

      const res = await calc(
        ctx,
        amount,
        "USD",
        user.mentor,
        user.operator,
        ctx.scene.state.userId
      );

  

      const profit = await Profit.create({
        userId: ctx.scene.state.userId,
        amount: res.amount,
        convertedAmount: res.convertedAmounts.amount,
        currency: String(currency.code).toUpperCase(),
        serviceTitle: ctx.scene.state.serviceTitle,
        writerId: ctx.scene.state.data.writer,
        bin: ctx.scene.state.bin,
        adId: ctx.scene.state.adId,
      });

      await profit.update({
        workerAmount: res.amounts.worker,
      });

      const profitUser = await profit.getUser(),
        profitWriter = await profit.getWriter();
      const referrer = await Referral.findOne({
        where: { userId: profitUser.id },
      });

      try {
        const referralRecord = await Referral.findOne({
          where: { userId: profitUser.id },
        });

        if (referralRecord) {
          const currentProfitAmount =
            parseFloat(referralRecord.profitAmount) || 0;
          const newProfitAmount =
            currentProfitAmount + parseFloat(res.amounts.referrer);

          // Обновляем запись в базе
          await Referral.update(
            { profitAmount: newProfitAmount },
            { where: { userId: profitUser.id } }
          );

          // Проверяем, есть ли у этого юзера referrerId
          if (referralRecord.referrerId) {
            try {
              await ctx.telegram.sendMessage(
                referralRecord.referrerId,
                `🎉 Вам засчитан профит от вашего реферала @${profitUser.username}. Вы получили ${ctx.state.bot.referralPercent}% от их профита, что составляет ${res.amounts.referrer} USD.`,
                { parse_mode: "HTML" }
              );
            } catch (error) {
              console.error(
                `❌ Не удалось отправить сообщение рефереру ID ${referralRecord.referrerId}:`,
                error.description
              );
              if (error.code === 403) {
                console.log(
                  `⛔️ Пользователь ${referralRecord.referrerId} заблокировал бота.`
                );
                // Здесь можно обновить статус в БД, например, поставить "isBlocked: true"
              } else {
                console.error(
                  `Другая ошибка при отправке сообщения рефереру:`,
                  error
                );
              }
            }
          } else {
            console.log(
              `ℹ️ У пользователя с ID ${profitUser.id} нет реферера.`
            );
          }
        } else {
          console.log(
            `ℹ️ Реферальная запись для пользователя с ID ${profitUser.id} не найдена.`
          );
        }
      } catch (err) {
        console.error(`🚫 Ошибка при обработке реферальной логики:`, err);
      }



      var text = locale.newProfit.channel;

      var mentorUsername = "";
      let mentorPercent = 5;
      var mentorId = "";
      var mentorTag = "";

      var operatorUsername = "";
      let operatorPercent = 5;
      var operatorId = "";
      var operatorTag = "";

      const writer = await User.findOne({
        where: {
          id: ctx.scene.state.data.writer,
        },
      });
      try {
        const operator = await Operators.findOne({
          where: {
            userId: user.operator,
          },
        });

        if (operator) {
          const operator2 = await User.findOne({
            where: {
              id: operator.userId,
            },
          });

          operatorId = operator.userId;
          operatorUsername = operator.username;
          operatorPercent = operator.percent;
          operatorTag = operator2?.tag || "-";

          if (profitUser.operator && operator.username) {
            await ctx.telegram.sendMessage(
              operator.userId,
              `<b>🎉 Вам засчитан профит от воркера @${profitUser.username}</b>

💰 Ваш процент: <b>${res.amounts.operator} USD</b>
👨‍💻 Вбивер → <b><a href="tg://user?id=${profitWriter.id}">${profitWriter.username}</a></b>`,
              {
                parse_mode: "HTML",
                reply_markup: Markup.inlineKeyboard([
                  [Markup.callbackButton("❌ Скрыть", "delete")],
                ]),
              }
            );
          }
        }

        const mentor = await Nastavniki.findOne({
          where: { id: user.mentor },
        });

        if (mentor) {
          const mentor2 = await User.findOne({
            where: { id: mentor.id },
          });

          mentorUsername = mentor.username;
          mentorPercent = mentor.percent;
          mentorId = mentor.id;
          mentorTag = mentor2?.username || mentor2?.tag || "-";
          await ctx.telegram.sendMessage(
            mentor.id,
            `<b>🎉 Вам засчитан профит от ученикa @${profitUser.username}</b>

💰 Ваш процент: <b>${res.amounts.mentor} USD</b>
👨‍💻 Вбивер → <b><a href="tg://user?id=${profitWriter.id}">${profitWriter.username}</a></b>`,
            {
              parse_mode: "HTML",
              reply_markup: Markup.inlineKeyboard([
                [Markup.callbackButton("❌ Скрыть", "delete")],
              ]),
            }
          );
        }
      } catch (err) {
        console.error("Ошибка при отправке сообщения:", err);
      }

      text = text

        .replace(
          "{serviceTitle}",
          `${profitUser.hideService == true
            ? `<b>🏴</b>`
            : `${ctx.scene.state.serviceTitle}`
          }`
        )

        .replace("{amount}", ` ${amount.replace(".00", "")} USD`)
        .replace(`{workerAmount}`, `${res.amounts.worker} USD`)
        .replace(
          "{mentor}",
          mentorTag
            ? `\n🎓 Наставник: <b>#${mentorTag} (${mentorPercent}%)</b>`
            : ""
        )

        .replace(
          "{operator}",
          `${profitUser.operator == null
            ? ""
            : `\n👨🏼‍💻 Оператор: <b>#${operatorTag} (${operatorPercent}%)</b>`
          }`
        )


        .replace(
          "{bin}",
          `${profit.bin == null
            ? `\n\n🏦 Банк: <b>не определено</b>
🌏 Страна: <b>не определено</b>`
            : `\n${profit.bin}`
          }`
        )
        .replace(
          "{wallet_profit}",
          `${ctx.state.user.wallet == true
            ? ""
            : "ℹ️ Советуем установить кошелек для выплаты (Настройки - мой кошелек) "
          }`
        )

        .replace(
          "{mailer}",
          `${ctx.scene.state.mailer == 1
            ? "\n\n✉️ Gosu Mail (5%)"
            : ctx.scene.state.mailer == 1
              ? "\n\n✉️ Gosu Mail (5%)"
              : ""
          }`
        )

        .replace(
          "{mailer2}",
          `${ctx.scene.state.mailer2 == 1
            ? "\n\n✉️ Anafema Mail (7%)"
            : ctx.scene.state.mailer2 == 1
              ? "\n\n✉️ Anafema Mail (7%)"
              : ""
          }`
        )
        .replace(
          "{mailer3}",
          `${ctx.scene.state.mailer3 == 1
            ? "\n\n✉️ Your Mail (5%)"
            : ctx.scene.state.mailer3 == 1
              ? "\n\n✉️ Your Mail (5%)"
              : ""
          }`
        )
        .replace(
          "{mailer4}",
          `${ctx.scene.state.mailer4 == 1
            ? "\n\n✉️ Inbox Mail (4%)"
            : ctx.scene.state.mailer4 == 1
              ? "\n\n✉️ Inbox Mail (4%)"
              : ""
          }`
        )

        .replace(
          "{mailer5}",
          `${ctx.scene.state.mailer5 == 1
            ? "\n\n✉️ Hype Mail (5%)"
            : ctx.scene.state.mailer5 == 1
              ? "\n\n✉️ Hype Mail (5%)"
              : ""
          }`
        )

        .replace(
          "{mailer6}",
          `${ctx.scene.state.mailer6 == 1
            ? "\n\n✉️ CatchMe Mail (7%)"
            : ctx.scene.state.mailer6 == 1
              ? "\n\n✉️ CatchMe Mail (7%)"
              : ""
          }`
        ).replace(
          "{mailer7}",
          `${ctx.scene.state.mailer7 == 1
            ? "\n\n✉️ Mori Mail (5%)"
            : ctx.scene.state.mailer7 == 1
              ? "\n\n✉️ Mori Mail (5%)"
              : ""
          }`
        ).replace(
          "{mailer8}",
          `${ctx.scene.state.mailer8 == 1
            ? "\n\n✉️ Just Mail (5%)"
            : ctx.scene.state.mailer8 == 1
              ? "\n\n✉️ Just Mail (5%)"
              : ""
          }`
        )
        .replace(
          "{mailer9}",
          `${ctx.scene.state.mailer9 == 1
            ? "\n\n✉️ Meow Mail (4%)"
            : ctx.scene.state.mailer9 == 1
              ? "\n\n✉️ Meow Mail (4%)"
              : ""
          }`
        )



        .replace(
          "{sms}",
          `${ctx.scene.state.sms == true
            ? "\n\n💬 Moonheim SMS (7%)"
            : ctx.scene.state.sms == true
              ? "\n\n💬 Moonheim SMS (7%)"
              : ""
          }`
        )

        .replace(
          "{sms2}",
          `${ctx.scene.state.sms2 == true
            ? "\n\n💬 Depa SMS (0%)"
            : ctx.scene.state.sms2 == true
              ? "\n\n💬 Depa SMS (0%)"
              : ""
          }`
        )
        .replace(
          "{sms3}",
          `${ctx.scene.state.sms3 == true
            ? "\n\n💬 Cosmic SMS (0%)"
            : ctx.scene.state.sms3 == true
              ? "\n\n💬 Cosmic SMS (0%)"
              : ""
          }`
        )
        .replace(
          "{screen}",
          `${ctx.scene.state.screen == true
            ? "\n\n📱 Goat QR (5%)"
            : ctx.scene.state.screen == true
              ? "\n\n📱 Goat QR (5%)"
              : ""
          }`
        )

        .replace(
          "{screen2}",
          `${ctx.scene.state.screen2 == true
            ? "\n\n📄 Отрисовка: <b>@Kvaller2 (2%)</b>"
            : ctx.scene.state.screen2 == true
              ? "\n\n📄 Отрисовка: <b>@Kvaller2 (2%)</b>"
              : ""
          }`
        )
        .replace(
          "{screen3}",
          `${ctx.scene.state.screen3 == true
            ? "\n\n📱 Gosu Screen (3%)"
            : ctx.scene.state.screen3 == true
              ? "\n\n📱 Gosu Screen (3%)"
              : ""
          }`
        )

        .replace(
          "{screen4}",
          `${ctx.scene.state.screen4 == true
            ? "\n\n📱 Gosu QR (3%)"
            : ctx.scene.state.screen4 == true
              ? "\n\n📱 Gosu QR (3%)"
              : ""
          }`
        )
   .replace(
          "{call}",
          `${ctx.scene.state.call == true
            ? "\n\n📞 Прозвон: <b>@Exvilllllll (15%)</b>"
            : ctx.scene.state.call == true
              ? "\n\n📞 Прозвон: <b>@Exvilllllll (15%)</b>"
              : ""
          }`
        )
        .replace(
          "{team}",
          `<a href="https://t.me/vanguardteambot">⚔️ Vanguard Team ⚔️</a>`
        )
        .replace(
          "{worker}",
          profitUser.hideNick
            ? "Скрыт"
            : `#${user.tag}`
        )
        .replace("{writer}", writer.tag ? `#${writer.tag}` : "неизвестно")

        .replace("{profitId}", profit.id);

      // Получаем фото профита
   // ✅ Подставим дефолтное фото и тип, если не указано
const profitMedia = profitUser.media || "https://i.imgur.com/uR6Hq04.png";
const profitType = profitUser.media_type || "photo";

      const payoutsMarkup = Markup.inlineKeyboard([
        [Markup.callbackButton(locale.newProfit.wait, "none")],
      ]);

      let payoutsMsg;
      let publicMsg;

      // ===== 1. Отправка в канал выплат =====
      if (profitType === "photo" && profitMedia) {
        payoutsMsg = await ctx.telegram
          .sendPhoto(ctx.state.bot.payoutsChannelId, profitMedia, {
            caption: text,
            parse_mode: "HTML",
            reply_markup: payoutsMarkup,
          })
          .catch((err) => err);
      } else if (profitType === "video" && profitMedia) {
        payoutsMsg = await ctx.telegram
          .sendVideo(ctx.state.bot.payoutsChannelId, profitMedia, {
            caption: text,
            parse_mode: "HTML",
            reply_markup: payoutsMarkup,
          })
          .catch((err) => err);
      } else if (profitType === "animation" && profitMedia) {
        payoutsMsg = await ctx.telegram
          .sendAnimation(ctx.state.bot.payoutsChannelId, profitMedia, {
            caption: text,
            parse_mode: "HTML",
            reply_markup: payoutsMarkup,
          })
          .catch((err) => err);
      } else {
        payoutsMsg = await ctx.telegram
          .sendMessage(ctx.state.bot.payoutsChannelId, text, {
            parse_mode: "HTML",
            reply_markup: payoutsMarkup,
          })
          .catch((err) => err);
      }

      // ===== 2. Отправка в общий канал =====
      if (profitType === "photo" && profitMedia) {
        publicMsg = await ctx.telegram
          .sendPhoto(ctx.state.bot.allGroupId, profitMedia, {
            caption: text,
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([]),
          })
          .catch((err) => err);
      } else if (profitType === "video" && profitMedia) {
        publicMsg = await ctx.telegram
          .sendVideo(ctx.state.bot.allGroupId, profitMedia, {
            caption: text,
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([]),
          })
          .catch((err) => err);
      } else if (profitType === "animation" && profitMedia) {
        publicMsg = await ctx.telegram
          .sendAnimation(ctx.state.bot.allGroupId, profitMedia, {
            caption: text,
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([]),
          })
          .catch((err) => err);
      } else {
        publicMsg = await ctx.telegram
          .sendMessage(ctx.state.bot.allGroupId, text, {
            parse_mode: "HTML",
            reply_markup: Markup.inlineKeyboard([]),
          })
          .catch((err) => err);
      }

      // ===== 3. Сохраняем message_id в базу =====
      await profit.update({
        channelMessageId: payoutsMsg?.message_id || null,
        chatMessageId: publicMsg?.message_id || null,
      });

      if (profitUser.mentor == null) {
      } else {
        profit.update({
          mentor: profitUser.mentor,
          mentorAmount: res.amounts.mentor,
          mentorConvAmount: parseInt(res.amounts.mentor * currency.rub),
        });
      }
      if (profitUser.operator == null) {
      } else {
        profit.update({
          operator: profitUser.operator,
          operatorAmount: res.amounts.operator,
          operatorConvAmount: parseInt(res.amounts.operator * currency.rub),
        });
      }

      await ctx.telegram
        .sendMessage(
          profitUser.id,
          locale.newProfit.worker
            .replace("{profitId}", profit.id)
            .replace("{amount}", `${profit.amount} USD`)
            .replace(
              `{workerAmount}`,
              `${res.amounts.worker} ${profit.currency} / ${res.convertedAmounts.worker} RUB`
            )
            .replace(
              "{wallet_profit}",
              `${ctx.state.user.wallet == true
                ? ""
                : "ℹ️ Советуем установить кошелек для выплаты (Настройки - мой кошелек) "
              }`
            )

            .replace(
              "{writer}",
              `<a href="tg://user?id=${profitWriter.id}">${profitWriter.username}</a>`
            ),
          {
            parse_mode: "HTML",
          }
        )
        .catch((err) => err);

      const coderPercent = 6; // Процент доли кодера
      const coderAmountUSD = (profit.amount * coderPercent) / 100;
      const coderAmountRUB = (res.convertedAmounts.total * coderPercent) / 100;

      const additionalServicesText =
        [
          ctx.scene.state.mailer
            ? `✉️ Gosu Mail (5% - ${((profit.amount * 5) / 100).toFixed(
              2
            )} USD)`
            : "",
          ctx.scene.state.mailer2
            ? `✉️ Anafema Mail (7% - ${((profit.amount * 7) / 100).toFixed(
              2
            )} USD)`
            : "",
          ctx.scene.state.mailer3
            ? `✉️ Your Mail (5% - ${((profit.amount * 5) / 100).toFixed(
              2
            )} USD)`
            : "",
          ctx.scene.state.mailer4
            ? `✉️ Inbox Mail (4% - ${((profit.amount * 4) / 100).toFixed(
              2
            )} USD)`
            : "",
          ctx.scene.state.mailer5
            ? `✉️ Hype Mail (5% - ${((profit.amount * 5) / 100).toFixed(
              2
            )} USD)`
            : "",
          ctx.scene.state.mailer6
            ? `✉️ CatchMe Mail (7% - ${((profit.amount * 7) / 100).toFixed(
              2
            )} USD)`
            : "",

          ctx.scene.state.mailer7
            ? `✉️ Mori Mail (5% - ${((profit.amount * 5) / 100).toFixed(
              2
            )} USD)`
            : "",
          ctx.scene.state.mailer8
            ? `✉️ Just Mail (5% - ${((profit.amount * 5) / 100).toFixed(
              2
            )} USD)`
            : "",
          ctx.scene.state.mailer9
            ? `✉️ Meow Mail (4% - ${((profit.amount * 4) / 100).toFixed(
              2
            )} USD)`
            : "",
          ctx.scene.state.sms
            ? `💬 Moonheim SMS (7% - ${((profit.amount * 7) / 100).toFixed(
              2
            )} USD)`
            : "",
          ctx.scene.state.screen
            ? `📱 GOAT QR (5% - ${((profit.amount * 5) / 100).toFixed(2)} USD)`
            : "",
          ctx.scene.state.screen2
            ? `📄 Отрисовка (2% - ${((profit.amount * 2) / 100).toFixed(
              2
            )} USD)`
            : "",
          ctx.scene.state.screen3
            ? `📱 Gosu Screen (3% - ${((profit.amount * 3) / 100).toFixed(
              2
            )} USD)`
            : "",
          ctx.scene.state.screen4
            ? `📱 Gosu QR (3% - ${((profit.amount * 3) / 100).toFixed(2)} USD)`
            : "",
          ctx.scene.state.data.callConfirmed
            ? `☎️ -20% Прозвон (20% - ${((profit.amount * 20) / 100).toFixed(
              2
            )} USD)`
            : "",
               ctx.scene.state.call
            ? `📞 Прозвон @Exvilllllll (15% - ${((profit.amount * 15) / 100).toFixed(2)} USD)`
            : "",
        ]
          .filter((service) => service)
          .join("\n") || "<i>Нет использованных услуг</i>";

      let profitMessage = `<b>✅ Профит ${ctx.scene.state.serviceTitle}</b>

💸 Сумма: <b><code>${profit.amount} USD</code></b>
💵 Процент воркера: <b>${res.amounts.worker} ${profit.currency} / ${res.convertedAmounts.worker
        } RUB</b>
💳 Кошелек: <b><code>${profitUser.trc || "Не указан"}</code></b>
👤 Воркер: <b>@${profitUser.username}</b>
✍️ Вбивер: <b>@${profitWriter.username}</b>`;

      // Наставник
      if (profitUser.mentor) {
        profitMessage += `\n🎓 Наставник: <b>@${mentorUsername} (${mentorPercent}% - ${parseFloat(
          res.amounts.mentor
        ).toFixed(2)} USD / ${parseFloat(res.convertedAmounts.mentor).toFixed(
          2
        )} RUB)</b>`;
      }

      // Оператор
      if (profitUser.operator) {
        profitMessage += `\n👨🏼‍💻 Оператор: <b>@${operatorUsername} (${operatorPercent}% - ${parseFloat(
          res.amounts.operator
        ).toFixed(2)} USD / ${parseFloat(res.convertedAmounts.operator).toFixed(
          2
        )} RUB)</b>`;
      }
      // Реферал
      if (res.amounts.referrer > 0) {
        try {
          const referrer = await Referral.findOne({
            where: { userId: profitUser.id },
          });

          if (referrer && referrer.referrerId) {
            const referrerUser = await User.findOne({
              where: { id: referrer.referrerId },
            });

            let referrerUsername = referrerUser?.username
              ? `@${referrerUser.username}`
              : `ID:${referrer.referrerId}`;


            profitMessage += `\n👥 Реферал: <b>${referrerUsername} (${ctx.state.bot.referralPercent}% - ${parseFloat(
              res.amounts.referrer
            ).toFixed(2)} USD / ${parseFloat(res.convertedAmounts.referrer).toFixed(2)} RUB)</b>`;
          }
        } catch (error) {
          console.log(`Ошибка при получении реферала: ${error}`);
        }
      }

      // Доля кодера
      profitMessage += `\n💻 Доля кодера: <b>@haron (6% - ${coderAmountUSD.toFixed(
        2
      )} USD / ${isNaN(coderAmountRUB) ? "0.00" : coderAmountRUB.toFixed(2)
        } RUB)</b>`;

      // Дополнительные услуги
      profitMessage += `\n\n📤 Дополнительные услуги:\n<b>${additionalServicesText}</b>`;

      // ID объявления
      if (profit.adId) {
        profitMessage += `\n\n🔍 <b>#id${profit.adId}</b>`;
      }
      // Отправляем сообщение
      await ctx.telegram.sendMessage(
        ctx.state.bot.accountingChannelId,
        profitMessage,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "👤 Профиль воркера",
                `admin_user_${profit.userId}`
              ),
              Markup.callbackButton(
                "✍️ Профиль вбивера",
                `admin_user_${profit.writerId}`
              ),
            ],
            [
              Markup.callbackButton(
                locale.newProfit.payed,
                `profitAdmin_${profit.userId ? `user_${profit.userId}_` : ""
                }profit_${profit.id}_set_status_payed`
              ),
              Markup.callbackButton(
                locale.newProfit.lok,
                `profitAdmin_${profit.userId ? `user_${profit.userId}_` : ""
                }profit_${profit.id}_set_status_lok`
              ),
            ],
            [
              Markup.callbackButton(
                locale.newProfit.razvitie,
                `profitAdmin_${profit.userId ? `user_${profit.userId}_` : ""
                }profit_${profit.id}_set_status_razvitie`
              ),
              Markup.callbackButton(
                locale.newProfit.wait,
                `profitAdmin_${profit.userId ? `user_${profit.userId}_` : ""
                }profit_${profit.id}_set_status_wait`
              ),
            ],
            [
              Markup.callbackButton(
                "❌ Удалить профит",
                `admin_${profit.userId ? `user_${profit.userId}_` : ""}profit_${profit.id
                }_delete`
              ),
            ],
          ]),
        }
      );
      // Separate messages for specific services if enabled
      const serviceMessages = [
        {
          enabled: ctx.scene.state.screen3,
          name: "GOSU SCREEN",
          percent: 3,
          channel: -1002674622723,
        },
        {
          enabled: ctx.scene.state.screen4,
          name: "GOSU QR",
          percent: 3,
          channel: -1002674622723,
        },

        {
          enabled: ctx.scene.state.mailer,
          channel: -1002796577010,
          name: "Gosu Mail",
          percent: 5,
        },
        {
          enabled: ctx.scene.state.mailer2,
          channel: -1002410717355,
          name: "Anafema Mail",
          percent: 7,
        },
        {
          enabled: ctx.scene.state.mailer3,
          channel: -1002801311156,
          name: "Your Mailer",
          percent: 5,
        },
        {
          enabled: ctx.scene.state.mailer4,
          channel: -1002352069433,
          name: "Inbox Mail",
          percent: 4,
        },
        {
          enabled: ctx.scene.state.mailer5,
          channel: -1002419252067,
          name: "Hype Mail",
          percent: 5,
        },
        {
          enabled: ctx.scene.state.mailer6,
          channel: -1002445804474,
          name: "CatchMe Mail",
          percent: 7,
        },
        {
          enabled: ctx.scene.state.mailer7,
          channel: -4752389580,
          name: "Mori Mail",
          percent: 5,
        },
        {
          enabled: ctx.scene.state.mailer8,
          channel: -1002706684537,
          name: "Just Mail",
          percent: 5,
        },
        {
          enabled: ctx.scene.state.mailer9,
          channel: -1002728045637,
          name: "Meow Mail",
          percent: 4,
        },
        {
          enabled: ctx.scene.state.sms,
          channel: -1002635994116,
          name: "Moonheim SMS",
          percent: 7,
        },
        {
          enabled: ctx.scene.state.screen,
          channel: -1002352049090,
          name: "GOAT QR",
          percent: 5,
        },
        {
          enabled: ctx.scene.state.screen2,
          channel: -1002255162886,
          name: "Отрисовка: @Kvaller2 ",
          percent: 2,
        },
           {
          enabled: ctx.scene.state.call,
          channel: -1002733827297,
          name: "прозвона",
          percent: 15,
        },
      ];

      // Приводим `profit.amount` к числу
      const profitAmount =
        parseFloat(String(profit.amount).replace(/[^\d.-]/g, "")) || 0;
      // console.log("profitAmount после обработки:", profitAmount);

      if (profitAmount === 0) {
        console.log("Ошибка: profit.amount равен нулю или некорректен.");
        await ctx.reply("❌ Ошибка: сумма профита равна нулю или некорректна.");
        return;
      }

      // Отбираем сервисы GOSU
      const gosuServices = serviceMessages.filter(({ name }) =>
        ["GOSU SCREEN", "GOSU QR"].includes(name)
      );

      // Отбираем остальные сервисы
      const otherServices = serviceMessages.filter(
        ({ name }) => !["GOSU SCREEN", "GOSU QR"].includes(name)
      );

      // Если активен хотя бы один сервис GOSU
      if (gosuServices.some(({ enabled }) => enabled)) {
        // Процент фиксированный: 3%, если один или оба сервиса активны
        const gosuPercent = 3;

        // Общая сумма для сервисов GOSU
        const gosuAmount = parseFloat(
          (profitAmount * (gosuPercent / 100)).toFixed(2)
        );
        // console.log("GOSU Amount:", gosuAmount);

        await ctx.telegram.sendMessage(
          -1002674622723,
          `<b>🎉 Новый профит с использованием сервисов GOSU</b>

👤 Воркер: <b><code>${profit.userId}</code> | @${profitUser.username}</b>
📦 Сервис: <b>${ctx.scene.state.serviceTitle}</b>
💰 Сумма: <b>${profitAmount} USD</b>
🛠️ Используемые сервисы: <b>${gosuServices
            .filter(({ enabled }) => enabled)
            .map(({ name }) => name)
            .join(", ")}</b>
    
🤝 Доля сервисов GOSU: <b>${gosuAmount} USD</b>

`,
          { parse_mode: "HTML" }
        );
      }

      // Сообщения для остальных сервисов
      for (const { enabled, name, percent, channel } of otherServices) {
        if (enabled) {
          const serviceAmount = parseFloat(
            (profitAmount * (percent / 100)).toFixed(2)
          );
          console.log(
            `Service: ${name}, Percent: ${percent}, Amount: ${serviceAmount}, Chat ID: ${channel}`
          );

          await ctx.telegram.sendMessage(
            channel, // Используем уникальный чат ID
            `<b>🎉 Новый профит с использованием ${name}</b>

👤 Воркер: <b><code>${profit.userId}</code> | @${profitUser.username}</b>
📦 Сервис: <b>${ctx.scene.state.serviceTitle}</b>
💰 Сумма: <b>${profitAmount} USD</b>

🤝 Доля ${name}: <b>${serviceAmount} USD</b>
`,
            { parse_mode: "HTML" }
          );
        }
      }

      log(
        ctx,
        `добавил новый профит #${profit.id} суммой ${profit.amount} ${profit.currency} для пользователя <b><a href="tg://user?id=${profitUser.id}">${profitUser.username}</a></b>`
      );
      await ctx.reply("✅ Профит добавлен!").catch((err) => err);
    } catch (err) {
      console.log(err);
      ctx.reply("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

scene.leave((ctx) => user(ctx, ctx.scene.state.userId));

module.exports = scene;
