const { Faker } = require('@faker-js/faker');

const locales = {
  ru: require('@faker-js/faker/locale/ru').faker.definitions,
  en_US: require('@faker-js/faker/locale/en_US').faker.definitions,
  en_GB: require('@faker-js/faker/locale/en_GB').faker.definitions,
  uk: require('@faker-js/faker/locale/uk').faker.definitions,
  de: require('@faker-js/faker/locale/de').faker.definitions,
  fr: require('@faker-js/faker/locale/fr').faker.definitions,
  it: require('@faker-js/faker/locale/it').faker.definitions,
  es: require('@faker-js/faker/locale/es').faker.definitions,
  tr: require('@faker-js/faker/locale/tr').faker.definitions,
  pl: require('@faker-js/faker/locale/pl').faker.definitions,
  nl: require('@faker-js/faker/locale/nl').faker.definitions,
  ro: require('@faker-js/faker/locale/ro').faker.definitions,
  hu: require('@faker-js/faker/locale/hu').faker.definitions,
  pt_PT: require('@faker-js/faker/locale/pt_PT').faker.definitions,
  ja: require('@faker-js/faker/locale/ja').faker.definitions,
  zh_CN: require('@faker-js/faker/locale/zh_CN').faker.definitions,
  ko: require('@faker-js/faker/locale/ko').faker.definitions,
};

const supportedCountries = {
  us: { emoji: '🇺🇸', name: 'США', definitions: locales.en_US },
  uk: { emoji: '🇬🇧', name: 'Великобритания', definitions: locales.en_GB },
  // ua: { emoji: '🇺🇦', name: 'Украина', definitions: locales.uk },
  // ru: { emoji: '🇷🇺', name: 'Россия', definitions: locales.ru },
  de: { emoji: '🇩🇪', name: 'Германия', definitions: locales.de },
  fr: { emoji: '🇫🇷', name: 'Франция', definitions: locales.fr },
  it: { emoji: '🇮🇹', name: 'Италия', definitions: locales.it_IT },
  es: { emoji: '🇪🇸', name: 'Испания', definitions: locales.es },
  tr: { emoji: '🇹🇷', name: 'Турция', definitions: locales.tr },
  pl: { emoji: '🇵🇱', name: 'Польша', definitions: locales.pl },
  nl: { emoji: '🇳🇱', name: 'Нидерланды', definitions: locales.nl },
  ro: { emoji: '🇷🇴', name: 'Румыния', definitions: locales.ro },
  hu: { emoji: '🇭🇺', name: 'Венгрия', definitions: locales.hu },
  pt: { emoji: '🇵🇹', name: 'Португалия', definitions: locales.pt },
  ja: { emoji: '🇯🇵', name: 'Япония', definitions: locales.ja },
  // zh: { emoji: '🇨🇳', name: 'Китай', definitions: locales.zh_CN },
  kr: { emoji: '🇰🇷', name: 'Южная Корея', definitions: locales.ko },
};

function generateFakeProfile(code = 'us') {
  const country = supportedCountries[code];
  if (!country) throw new Error(`Unsupported country code: ${code}`);

  const faker = new Faker({
    locale: [country.definitions, locales.en_US, locales.en_GB],
  });

  // Избегаем проблемных полей явно
  const name = `${faker.person.firstName()} ${faker.person.lastName()}`;
  const address = [
    faker.location.streetAddress({ useFullAddress: true }),
    faker.location.city(),
    faker.location.country(),
  ].filter(Boolean).join(', ');

  return {
    title: `${country.emoji} ${name.split(' ')[0]} (${country.name})`,
    name,
    address,
  };
}

module.exports = {
  generateFakeProfile,
  supportedCountries,
};
