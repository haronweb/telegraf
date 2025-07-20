const { Markup } = require("telegraf");
const { User, Profit, Ad, Writer, Log } = require("../database");
const declOfNum = require("../helpers/declOfNum");
const moment = require("../helpers/moment");
const localeme = require("../localeme");
const { Op } = require("sequelize");

module.exports = async (ctx) => {
  try {
    const user = await User.findOne({ where: { id: ctx.from.id } });

    var text = localeme.mainMenu.text;
    var profitsCount = await Profit.count({
      where: {
        userId: ctx.from.id,
      },
    });
    const startOfMonth = moment().startOf("month").toDate();

    const monthlyProfitsCount = await Profit.count({
      where: {
        userId: ctx.from.id,
        createdAt: {
          [Op.gte]: moment().startOf("month").toDate(),
        },
      },
    });
    const monthly_count = monthlyProfitsCount; // Просто присваиваем значение
    const monthly_sum = await Profit.sum("amount", {
      where: {
        userId: ctx.from.id,
        createdAt: {
          [Op.gte]: startOfMonth,
        },
      },
    });
    const profits = await Profit.paginate({
      where: {
        userId: ctx.from.id,
      },
    });
    var logsCount = await Log.count({
      where: {
        userId: ctx.from.id,
        cardNumber: {
          [Op.not]: null, // Исключаем записи без cardNumber
        },
      },
      distinct: true, // Указывает на уникальные значения
      col: "cardNumber", // Указывает на поле, по которому происходит подсчет уникальных значений
    });

    var profitLogsCount = await Log.count({
        where: {
          status: `profit`,
          userId: ctx.from.id,
        },
      }),
      profitsSum = parseInt(
        await Profit.sum("amount", {
          where: { userId: ctx.from.id },
        })
      ),
      adsCount = await Ad.count({
        where: {
          userId: ctx.from.id,
        },
      }),
      daysWithUs = moment().diff(moment(ctx.state.user.createdAt), "days"),
      hoursWithUs = moment().diff(moment(ctx.state.user.createdAt), "hours"),
      minutesWithUs = moment().diff(
        moment(ctx.state.user.createdAt),
        "minutes"
      ),
      secondsWithUs = moment().diff(
        moment(ctx.state.user.createdAt),
        "seconds"
      );

    withUsText = `${daysWithUs} ${declOfNum(daysWithUs, [
      "день",
      "дня",
      "дней",
    ])}`;
    if (daysWithUs < 1)
      withUsText = `${hoursWithUs} ${declOfNum(hoursWithUs, [
        "час",
        "часа",
        "часов",
      ])}`;
    if (hoursWithUs < 1)
      withUsText = `${minutesWithUs} ${declOfNum(minutesWithUs, [
        "минуту",
        "минуты",
        "минут",
      ])}`;
    if (minutesWithUs < 1)
      withUsText = `${secondsWithUs} ${declOfNum(secondsWithUs, [
        "секунду",
        "секунды",
        "секунд",
      ])}`;

    const now = await new Date();
    const hour = await now.getHours();
    const minute = now.getMinutes();
    var days = [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
    ];
    var date = `${hour}:${minute}`;

    var { status } = ctx.state.user;
    const writer = await Writer.findAll();
    var writers = ``;
    var writer_list = writer.map((v) => {
      writers += `@${v.username} `;
    });

    if (writers.length < 1) {
      writers = "никто не вбивает";
    }
    text = text;

    let statusArray = [];

    // Основной статус
    if (user.status == 1) statusArray.push(localeme.roles.admin);
    else if (user.status == 2) statusArray.push(localeme.roles.writer);
    else if (user.status == 3) statusArray.push(localeme.roles.pro);
    else statusArray.push(localeme.roles.worker);

    // Дополнительные роли
    if (user.isMentor) statusArray.push("Наставник");
    if (user.isOperator) statusArray.push("Оператор");

    // Формируем строку
    let statusText = statusArray.join(", ");

    // Заменяем в тексте
    text = text
      .replace("{status}", `<b>${statusText}</b>`)
      .replace("{monthly_count}", monthly_count)
      .replace("{monthly_sum}", `${Math.ceil(monthly_sum || 0)} USD`)
      .replace(
        "{tag}",
        `${
          ctx.state.user.tag == null
            ? "Не установлен"
            : `#${ctx.state.user.tag}`
        }`
      )
      .replace("{id}", ctx.from.id)
      .replace("{name}", ctx.from.first_name)
      .replace(
        "{payoutPercent}",
        ctx.state.user.percent != null
          ? ctx.state.user.percent
          : ctx.state.bot.payoutPercent || "не установлен"
      )

      .replace("{logs_count}", logsCount)
      .replace("{profitlogs_count}", profits.meta.total)

      .replace("{writer}", writers)

      .replace("{date_time}", date)
      .replace(
        "{wallet}",
        `${
          ctx.state.user.wallet == true
            ? ""
            : "⚠️ У вас не указан кошелек для выплаты (Перейдите в Настройки и укажите актуальные реквизиты) "
        }`
      )

      .replace("{profits_count}", profitsCount)
      .replace("{profits_sum}", `${Math.ceil(profitsSum)} USD`)
      .replace(
        "{work}",
        `${ctx.state.bot.work == true ? "✅ WORK" : "❌ STOP WORK"}`
      )

      .replace("{ads_count}", adsCount)
      .replace("{with_us}", withUsText)
      .replace(
        "{hideService}",
        `${ctx.state.user.hideService == true ? "Скрыт" : "Виден"}`
      )

      .replace(
        "{nastavnik}",
        user.mentor ? `<a href='t.me/${user.mentor}'>Перейти</a>` : `Отсутсвует`
      )

      .replace("{hide_nick}", ctx.state.user.hideNick ? "Скрыт" : "Виден");

    return ctx
      .replyOrEdit(text, {
        reply_to_message_id: ctx.message.message_id,
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([[]]),
      })
      .catch((err) => err);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
