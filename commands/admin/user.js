// Импорт необходимых модулей
const { Op } = require("sequelize");
const { Markup } = require("telegraf");
const { User, Profit, Ad, Referral } = require("../../database");
const locale = require("../../locale");

// Функция для отображения профиля пользователя
const user = async (ctx, id) => {
  try {
  
    const user = await User.findOne({
      where: {
        [Op.or]: [{ id }, { username: id }],
      },
      include: [{ association: "request" }],
    });

    if (!user) {
      return ctx.replyOrEdit("❌ Пользователь не найден", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton(locale.go_back, "admin")],
        ]),
      }).catch((err) => err);
    }

    const stats = {
      profits: await Profit.count({ where: { userId: user.id } }),
      profits_sum: parseFloat(
        await Profit.sum("amount", { where: { userId: user.id } })
      ).toFixed(2),
      ads: await Ad.count({ where: { userId: user.id } }),
      referrer_share: parseFloat(
        await Referral.sum("profitAmount", { where: { referrerId: user.id } })
      ).toFixed(2),
    };

    const userProfitsSum = await Profit.sum("workerAmount", { 
      where: { userId: user.id, status: 0 }
    }) || 0;
    
   
    const totalSum = (userProfitsSum).toFixed(2);

    const request_btn = user.request
      ? [[
          Markup.callbackButton(
            "📝 Перейти к заявке",
            `admin_user_${user.id}_request_${user.request.id}`
          ),
        ]]
      : [];
      const operator = user.operator
      ? await User.findOne({ where: { id: user.operator } })
      : null;
    
    const mentor = user.mentor
      ? await User.findOne({ where: { id: user.mentor } })
      : null;
    
    const operator_btn = operator
      ? [[
          Markup.callbackButton(
            `👨🏼‍💻 Оператор: @${operator.username}`,
            `admin_user_${operator.id}_profile`
          ),
        ]]
      : [];
    
    const mentor_btn = mentor
      ? [[
          Markup.callbackButton(
            `🎓 Наставник: @${mentor.username}`,
            `admin_user_${mentor.id}_profile`
          ),
        ]]
      : [];
       const hasReferralShare = parseFloat(stats.referrer_share) > 0;

  let statusArray = [];

  // Основной статус
  if (user.status === 1) statusArray.push(locale.roles.admin);
  else if (user.status === 2) statusArray.push(locale.roles.writer);
  else if (user.status === 3) statusArray.push(locale.roles.pro);
  else statusArray.push(locale.roles.worker);
  
  // Доп. роли
  if (user.isMentor || user.status === 5) statusArray.push("Наставник");
  if (user.isOperator || user.status === 6) statusArray.push("Оператор");
  
  // Склеиваем строку
  const statusText = statusArray.join(", ");
    

    if (ctx.state.user.status === 1 || ctx.state.user.status === 2) {
      return ctx.replyOrEdit(
  `👤 <b><a href="tg://user?id=${user.id}">${user.username}</a></b> ${user.banned ? "🚫 <i>(Заблокирован)</i>" : ""}
ID: <code>${user.id}</code>
TAG: <b>${user.tag ? `#${user.tag}` : "не установлен"}</b>
Статус(ы): <b>${statusText}</b>

💰 Профитов: <b>${stats.profits}</b> | На сумму: <b>${stats.profits_sum} USD</b>
📦 Объявлений: <b>${stats.ads}</b>
🤝 Реф. доля: <b>${stats.referrer_share} USD</b>
⚖️ Процент: <b>${user.percent || "не установлен"}</b>

🔒 Никнейм: <b>${user.hideNick ? "скрыт" : "открыт"}</b> | Сервис: <b>${ctx.state.user.hideService ? "скрыт" : "открыт"}</b>
📅 Первый вход: <b>${user.createdAt ? user.createdAt.toLocaleString() : "неизвестно"}</b>
💸 Невыплачено: <b>${userProfitsSum.toFixed(2)} USD</b> | Итого: <b>${totalSum} USD</b>

💳 Кошелек: <code>${user.dataValues.trc || "не указан"}</code>`,
  {
    parse_mode: "HTML",
    reply_markup: Markup.inlineKeyboard([
      // 1 РЯД (две кнопки)
      [
        Markup.callbackButton("💰 Профиты", `admin_user_${user.id}_profits_1`),
        Markup.callbackButton("📦 Объявления", `admin_user_${user.id}_ads_1`),
      ],
      // 2 РЯД
      [
        Markup.callbackButton(
          user.banned ? "✅ Разблокировать" : "🚫 Заблокировать",
          `admin_user_${user.id}_${user.banned ? "un" : ""}ban`
        ),
        Markup.callbackButton("🚦 Статус", `admin_user_${user.id}_edit_status`),
      ],
      // 3 РЯД
      [
        Markup.callbackButton("⚖️ Процент", `admin_user_${user.id}_edit_percent_allProfits`),
        ...(user.percent
          ? [
              Markup.callbackButton(
                "❌ Убрать %", 
                `admin_user_${user.id}_edit_percent_default`
              ),
            ]
          : []),
      ],
      // 4 РЯД
      ...request_btn,
      ...operator_btn,
      ...mentor_btn,
      // 5 РЯД (оператор и наставник)
      [
        Markup.callbackButton(
          user.operator ? "🔄 Изм. оператора" : "🆕 Добавить оператора",
          `admin_user_${user.id}_select_operator`
        ),
        Markup.callbackButton(
          user.mentor ? "🔄 Изм. наставника" : "🆕 Добавить наставника",
          `admin_user_${user.id}_select_mentor`
        ),
      ],
       // 7 РЯД — сброс доли реферала (если есть)
              ...(hasReferralShare
                ? [
                    [
                      Markup.callbackButton(
                        "🚮 Обнулить реф. долю",
                        `admin_user_${user.id}_reset_refshare`
                      ),
                    ],
                  ]
                : []),
              ...(user.requestOperator
                ? [
                    [
                      Markup.callbackButton(
                        "🚮 Обнулить заявку оператора",
                        `delete_request_user_operator_${user.id}`
                      ),
                    ],
                  ]
                : []),
              ...(user.requestMentor
                ? [
                    [
                      Markup.callbackButton(
                        "🚮 Обнулить заявку наставника",
                        `delete_request_user_teachers_${user.id}`
                      ),
                    ],
                  ]
                : []),
              ...(user.operator
                ? [
                    [
                      Markup.callbackButton(
                        "❌ Удалить оператора",
                        `delete_user_operator_${user.id}`
                      ),
                    ],
                  ]
                : []),
              ...(user.mentor
                ? [
                    [
                      Markup.callbackButton(
                        "❌ Удалить наставника",
                        `delete_user_teachers_${user.id}`
                      ),
                    ],
                  ]
                : []),

              [Markup.callbackButton(locale.go_back, "admin_users_1")],
            ]),
          }
        )
        .catch((err) => err);
    }
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};

// Подключение команды для отображения профиля

module.exports = user;
