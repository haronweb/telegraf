const { Markup } = require("telegraf");
const { Profiles, Country } = require("../database");
const chunk = require("chunk");

module.exports = async (ctx, page = 1) => {
  try {
    const currentPage = parseInt(page);
    
    // Получаем все профили пользователя
    const profilesRaw = await Profiles.findAll({ 
      where: { userId: ctx.from.id },
      order: [['createdAt', 'DESC']]
    });

    // Получаем данные о странах для всех профилей
    const profilesWithCountries = await Promise.all(
      profilesRaw.map(async (profile) => {
        let countryTitle = "Не указана";
        let flag = "";
        
        if (profile.country) {
          const country = await Country.findOne({ where: { id: profile.country } });
          if (country?.title) {
            countryTitle = country.title;
            const match = country.title.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{So})+/u);
            flag = match ? match[0] : "";
          }
        }
        
        return {
          ...profile.dataValues,
          countryTitle: countryTitle,
          flag: flag
        };
      })
    );

    // Группируем по странам
    const grouped = {};
    profilesWithCountries.forEach(item => {
      const countryName = item.countryTitle;
      if (!grouped[countryName]) {
        grouped[countryName] = [];
      }
      grouped[countryName].push(item);
    });

    // Сортируем страны по алфавиту и объединяем профили
    const profiles = [];
    Object.keys(grouped)
      .sort((a, b) => {
        // "Не указана" всегда в конце
        if (a === "Не указана") return 1;
        if (b === "Не указана") return -1;
        return a.localeCompare(b);
      })
      .forEach(country => {
        profiles.push(...grouped[country]);
      });

    const itemsPerPage = 5;
    const paginated = chunk(profiles, itemsPerPage);
    const totalPages = paginated.length;
    const currentItems = paginated[currentPage - 1] || [];

    let buttons = [];

    // Создаем кнопки для профилей текущей страницы (по 1 в ряд)
    for (const profile of currentItems) {
      const star = profile.isFavorite ? "⭐" : "";
      const label = `${profile.flag} ${profile.title} ${star}`.trim();

      buttons.push([
        Markup.callbackButton(label, `profile_${profile.id}`),
      ]);
    }

    // Добавляем кнопки пагинации, если страниц больше одной
    const pageNavButtons = totalPages > 1
      ? chunk(
          Array.from({ length: totalPages }, (_, i) =>
            Markup.callbackButton(
              i + 1 === currentPage ? `· ${i + 1} ·` : `${i + 1}`,
              `profiles_page_${i + 1}`
            )
          ),
          5 // показываем максимум 5 кнопок страниц в ряду
        )
      : [];

    // Объединяем все кнопки
    const allButtons = buttons.length > 0 
      ? [...buttons] 
      : [[Markup.callbackButton("Список пуст", "none")]];

    // Добавляем основные кнопки управления
    allButtons.push(
      [Markup.callbackButton("➕ Добавить профиль", "add_profile")],
      [Markup.callbackButton("🎲 Сгенерировать профиль", "generate_profile")],
      [Markup.callbackButton("❌ Удалить все профили", "delete_all_my_profiles")]
    );

    // Добавляем кнопки пагинации перед кнопкой "Назад"
    if (pageNavButtons.length > 0) {
      allButtons.push(...pageNavButtons);
    }

    // Добавляем кнопку "Назад" в самый низ
    allButtons.push([Markup.callbackButton("◀️ Назад", "settings")]);

    await ctx.answerCbQuery("Получаю профили!").catch((err) => err);


    return ctx
      .replyOrEdit(
        `👥 Управление профилями (Всего: ${profiles.length})`,
        {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard(allButtons),
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};