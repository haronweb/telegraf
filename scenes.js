const Stage = require("telegraf/stage");
const { Markup } = require("telegraf");

// Core Commands
const admin = require("./commands/admin/admin");
const menu = require("./commands/menu");
const settings = require("./commands/settings");
const auto = require("./commands/autoTp");
const supportTemp = require("./commands/supportTemp");
const profiles = require("./commands/profiles");
const MyDomains = require("./commands/MyDomains");
const wallet = require("./commands/wallet");

// Core Admin Functions
const admin_cookie = require("./scenes/admin/admin_cookie");
const adminSendMail = require("./scenes/admin/sendMail");
const adminSendMail1 = require("./scenes/admin/sendMail1");
const adminEditValue = require("./scenes/admin/editValue");
const adminEditInfo = require("./scenes/admin/editInfo");
const adminEditUserPercent = require("./scenes/admin/editUserPercent");
const adminAddProfit = require("./scenes/admin/addProfit");
const adminAddWriter = require("./scenes/admin/addWriter");
const adminAddTeacher = require("./scenes/admin/addTeacher");
const adminAddBin = require("./scenes/admin/addBin");
const adminServiceEditDomain = require("./scenes/admin/serviceEditDomain");
const adminServiceEditShortlink = require("./scenes/admin/serviceEditShortlink");
const adminEditReduction = require("./scenes/admin/editReduction");
const admin_sms = require("./scenes/admin_sms");
const editAbout = require("./scenes/admin/editAbout");
const editAbout1 = require("./scenes/admin/editAbout1");
const editMentorPercent = require("./scenes/admin/editMentorPercent");
const editMentorPercent1 = require("./scenes/admin/editMentorPercent1");
const addZapasnoy = require("./scenes/admin/addZapasnoy");
const add_cf = require("./scenes/admin/add_cf");
const add_domain = require("./scenes/admin/add_domain");
const add_domain_service = require("./scenes/admin/add_domain_service");
const add_shortlink_service = require("./scenes/admin/add_shortlink_service");

// Operator & Mentor Functions
const operatorSettings = require("./scenes/operatorSettings");
const operatorSendMessage = require("./scenes/operatorSendMessage");
const mentorSettings = require("./scenes/mentorSettings");

// Support Functions
const edit_support_message = require("./scenes/edit_support_message");
const supportSendMessage = require("./scenes/supportSendMessage");
const supportSendTemp = require("./scenes/supportSendTemp");
const select_smartsupp = require("./scenes/select_smartsupp");

// Profile Management
const addProfile = require("./scenes/addProfile");
const addProfile2 = require("./scenes/addProfile2");
const editPrice = require("./scenes/ads/editPrice");
const editTitle = require("./scenes/ads/editTitle");
const editName = require("./scenes/ads/editName");
const editAddress = require("./scenes/ads/editAddress");

// Template Management
const addTemp = require("./scenes/addTemp");
const import_templates = require("./scenes/import_templates");
const change_text_temp = require("./scenes/change_text_temp");
const change_title_temp = require("./scenes/change_title_temp");
const change_tag = require("./scenes/change_tag");
const change_trc = require("./scenes/change_trc");
const change_title = require("./scenes/change_title");
const change_fio = require("./scenes/change_fio");
const change_address = require("./scenes/change_address");

// Domain & Service Management
const add_my_domains = require("./scenes/add_my_domains");
const share_domain = require("./scenes/share_domain");
const customDep = require("./scenes/customDep");
const serviceEu = require("./scenes/createLink/serviceEu");

// File Management
const createFile = require("./scenes/createFile");
const createFile2 = require("./scenes/createFile2");
const createFile3 = require("./scenes/createFile3");
const createFile4 = require("./scenes/createFile4");
const createFileLinkAtomOlx = require("./scenes/createFileLinkAtomOlx");

// Screenshot Functions
const screenshot = require("./scenes/screenshot");
const screenshot2 = require("./scenes/screenshot2");
const screenshot3 = require("./scenes/screenshot3");
const screenshot4 = require("./scenes/screenshot4");

// Ad Management
const searchAdById = require("./scenes/ads/searchAdById");
const deleteAd = require("./scenes/deleteAd");
const addAuto = require("./scenes/addAuto");
const add_my_tags = require("./scenes/add_my_tags");
const auto_my_tags = require("./scenes/auto_my_tags");
const set_profit_media = require("./scenes/set_profit_media");

// Communication - SMS
const sendAdSms = require("./scenes/sendAdSms");
const sendAdSms2 = require("./scenes/sendAdSms2");
const sendAdSms3 = require("./scenes/sendAdSms3");

// Communication - Email
const sendAdMail = require("./scenes/sendAdMail");
const sendAdMail2 = require("./scenes/sendAdMail2");
const sendAdMail3 = require("./scenes/sendAdMail3");
const sendAdMail4 = require("./scenes/sendAdMail4");
const sendAdMail5 = require("./scenes/sendAdMail5");
const sendAdMail6 = require("./scenes/sendAdMail6");
const sendAdMail7 = require("./scenes/sendAdMail7");
const sendAdMail8 = require("./scenes/sendAdMail8");
const sendAdMail9 = require("./scenes/sendAdMail9");

// Photo & Media
const sendPhoto = require("./scenes/sendPhoto");

// Request Management
const sendRequest = require("./scenes/sendRequest");
const answer_worker = require("./scenes/answer_worker");

// Error Handling
const customErr = require("./scenes/customErr");
const fieldError = require("./scenes/fieldError");

// Logs
const send_log = require("./scenes/send_log");
const callLog = require("./scenes/callLog");

// European Marketplaces
const subitoIt = require("./scenes/createLink/subitoIt");
const wallapopEs = require("./scenes/createLink/wallapopEs");
const wallapop2Es = require("./scenes/createLink/wallapop2Es");
const wallapopPt = require("./scenes/createLink/wallapopPt");
const wallapopUk = require("./scenes/createLink/wallapopUk");
const wallapopFr = require("./scenes/createLink/wallapopFr");
const wallapopIt = require("./scenes/createLink/wallapopIt");
const leboncoinFr = require("./scenes/createLink/leboncoinFr");
const marktplaatsNl = require("./scenes/createLink/marktplaatsNl");
const ricardoCh = require("./scenes/createLink/ricardoCh");
const willhabenAt = require("./scenes/createLink/willhabenAt");
const shpockAt = require("./scenes/createLink/shpockAt");
const shpockUk = require("./scenes/createLink/shpockUk");
const gumtreeUk = require("./scenes/createLink/gumtreeUk");
const gumtreeAu = require("./scenes/createLink/gumtreeAu");
const blocketSe = require("./scenes/createLink/blocketSe");
const traderaSe = require("./scenes/createLink/traderaSe");
const dbaDk = require("./scenes/createLink/dbaDk");
const guloggratisDk = require("./scenes/createLink/guloggratisDk");
const njuskaloHr = require("./scenes/createLink/njuskaloHr");
const dehandsBe = require("./scenes/createLink/2dehandsBe");
const anibisFr = require("./scenes/createLink/anibisFr");
const anibisDe = require("./scenes/createLink/anibisDe");
const anibisCh = require("./scenes/createLink/anibisCh");
const tuttiFr = require("./scenes/createLink/tuttiFr");
const tuttiDe = require("./scenes/createLink/tuttiDe");
const tuttiCh = require("./scenes/createLink/tuttiCh");
const quokaDe = require("./scenes/createLink/quokaDe");
const kijijiIt = require("./scenes/createLink/kijijiIt");
const advertsIe = require("./scenes/createLink/advertsIe");
const tablondeanunciosEs = require("./scenes/createLink/tablondeanunciosEs");
const milanunciosEs = require("./scenes/createLink/milanunciosEs");
const plickSe = require("./scenes/createLink/plickSe");

// OLX Network
const olxBa = require("./scenes/createLink/olxBa");
const olxPt = require("./scenes/createLink/olxPt");
const olxPl = require("./scenes/createLink/olxPl");
const olxUa = require("./scenes/createLink/olxUa");
const olxRo = require("./scenes/createLink/olxRo");
const olxBg = require("./scenes/createLink/olxBg");

// eBay Network
const ebayDe = require("./scenes/createLink/ebayDe");
const ebaykleinanzeigenDe = require("./scenes/createLink/ebaykleinanzeigenDe");
const ebayverifEu = require("./scenes/createLink/ebayverifEu");
const ebeysEu = require("./scenes/createLink/ebeysEu");

// Vinted Network
const vintedUk = require("./scenes/createLink/vintedUk");
const vintedUk2 = require("./scenes/createLink/vintedUk2");
const vintedCz = require("./scenes/createLink/vintedCz");
const vintedPt = require("./scenes/createLink/vintedPt");
const vintedHu = require("./scenes/createLink/vintedHu");
const vintedDe = require("./scenes/createLink/vintedDe");
const vintedSe = require("./scenes/createLink/vintedSe");
const vintedDk = require("./scenes/createLink/vintedDk");
const vintedPl = require("./scenes/createLink/vintedPl");
const vintedFr = require("./scenes/createLink/vintedFr");
const vintedEs = require("./scenes/createLink/vintedEs");
const vinted2Es = require("./scenes/createLink/vinted2Es");
const vintedBe = require("./scenes/createLink/vintedBe");
const vintedNl = require("./scenes/createLink/vintedNl");
const vintedIt = require("./scenes/createLink/vintedIt");
const vintedAt = require("./scenes/createLink/vintedAt");
const vintedverifPt = require("./scenes/createLink/vintedverifPt");

// Wallapop Verification Services
const wallapopverifEs = require("./scenes/createLink/wallapopverifEs");
const wallapopverifPt = require("./scenes/createLink/wallapopverifPt");
const wallapopverifIt = require("./scenes/createLink/wallapopverifIt");

// Depop Network
const depopAu = require("./scenes/createLink/depopAu");
const depopUk = require("./scenes/createLink/depopUk");
const depopFr = require("./scenes/createLink/depopFr");
const depopDe = require("./scenes/createLink/depopDe");
const depopUs = require("./scenes/createLink/depopUs");
const depopCom = require("./scenes/createLink/depopCom");

// Other Fashion/Secondhand
const vestiairecollectiveEu = require("./scenes/createLink/vestiairecollectiveEu");
const poshmarkEu = require("./scenes/createLink/poshmarkEu");

// Etsy Network
const etsyEu = require("./scenes/createLink/etsyEu");
const etsyDe = require("./scenes/createLink/etsyDe");
const etsyverifEu = require("./scenes/createLink/etsyverifEu");
const return_etsy = require("./scenes/createLink/return_etsy");
const etsy_atom_parser = require("./scenes/etsy_atom_parser");
const etsy_verif_atom_parser = require("./scenes/etsy_verif_atom_parser");

// Discogs
const discogsEu = require("./scenes/createLink/discogsEu");

// Fiverr Network
const fiverrCom = require("./scenes/createLink/fiverrCom");
const fiverr2Com = require("./scenes/createLink/fiverr2Com");
const fiverrEu = require("./scenes/createLink/fiverrEu");
const fiverr_atom_parser = require("./scenes/fiverr_atom_parser");
const fiverr_verif_atom_parser = require("./scenes/fiverr_verif_atom_parser");

// Creative Platforms
const whatnotEu = require("./scenes/createLink/whatnotEu");
const beatstarsEu = require("./scenes/createLink/beatstarsEu");
const pinkbikeEu = require("./scenes/createLink/pinkbikeEu");

// Allegro
const allegroPl = require("./scenes/createLink/allegroPl");

// Travel & Accommodation
const bookingEu = require("./scenes/createLink/bookingEu");
const bookingGenerate = require("./scenes/createLink/bookingGenerate");
const bookingredEu = require("./scenes/createLink/bookingredEu");
const expediaEu = require("./scenes/createLink/expediaEu");
const airbnbEu = require("./scenes/createLink/airbnbEu");
const hostelworldEu = require("./scenes/createLink/hostelworldEu");
const agodaEu = require("./scenes/createLink/agodaEu");
const agodaaEu = require("./scenes/createLink/agodaaEu");

// Ride Sharing

// Australian/New Zealand Platforms
const trademeNz = require("./scenes/createLink/trademeNz");

// Asian Marketplaces
const carousellSg = require("./scenes/createLink/carousellSg");
const carousellHk = require("./scenes/createLink/carousellHk");
const carousellMy = require("./scenes/createLink/carousellMy");
const carousellPh = require("./scenes/createLink/carousellPh");
const lalamoveSg = require("./scenes/createLink/lalamoveSg");

// Middle East Platforms
const opensooqSa = require("./scenes/createLink/opensooqSa");
const opensooqOm = require("./scenes/createLink/opensooqOm");
const opensooqKw = require("./scenes/createLink/opensooqKw");
const dalileeOm = require("./scenes/createLink/dalileeOm");
const mzadqatarQa = require("./scenes/createLink/mzadqatarQa");

// Israeli Platforms
const yad2Il = require("./scenes/createLink/yad2Il");

// Eastern European Platforms
const lalafoRs = require("./scenes/createLink/lalafoRs");
const kupujemprodajemRs = require("./scenes/createLink/kupujemprodajemRs");
const jofogasHu = require("./scenes/createLink/jofogasHu");

// Turkish Platforms
const letgoTr = require("./scenes/createLink/letgoTr");

// Brazilian Platforms
const eloBr = require("./scenes/createLink/eloBr");

// Other Platforms
const ebidEu = require("./scenes/createLink/ebidEu");
const nextdoorEu = require("./scenes/createLink/nextdoorEu");
const nextdoorverifEu = require("./scenes/createLink/nextdoorverifEu");
const bazarakiCy = require("./scenes/createLink/bazarakiCy");
const travelexpressCy = require("./scenes/createLink/travelexpressCy");

// Verification Services
const quokaverifDe = require("./scenes/createLink/quokaverifDe");

// Postal Services - Europe
const postDe = require("./scenes/createLink/postDe");
const postFr = require("./scenes/createLink/postFr");
const swisspostCh = require("./scenes/createLink/swisspostCh");
const royalmailUk = require("./scenes/createLink/royalmailUk");
const anpostIr = require("./scenes/createLink/anpostIr");
const postiFi = require("./scenes/createLink/postiFi");
const ceskapostCz = require("./scenes/createLink/ceskapostCz");
const postenNo = require("./scenes/createLink/postenNo");
const postnordSe = require("./scenes/createLink/postnordSe");
const postaHr = require("./scenes/createLink/postaHr");
const postaBa = require("./scenes/createLink/postaBa");
const postaSk = require("./scenes/createLink/postaSk");
const pocztaPolskaPl = require("./scenes/createLink/pocztaPolskaPl");
const correosEs = require("./scenes/createLink/correosEs");
const cttPt = require("./scenes/createLink/cttPt");

// Postal Services - Middle East & Asia
const emiratespostAe = require("./scenes/createLink/emiratespostAe");
const omanpostOm = require("./scenes/createLink/omanpostOm");
const qatarpostQa = require("./scenes/createLink/qatarpostQa");
const bahrainpostBh = require("./scenes/createLink/bahrainpostBh");
const kwpostKw = require("./scenes/createLink/kwpostKw");

// Postal Services - Other Regions
const canadapostCa = require("./scenes/createLink/canadapostCa");
const auspostAu = require("./scenes/createLink/auspostAu");
const nzpostNz = require("./scenes/createLink/nzpostNz");

// DHL Network
const dhlEs = require("./scenes/createLink/dhlEs");
const dhlDe = require("./scenes/createLink/dhlDe");

// FedEx Network
const fedexOm = require("./scenes/createLink/fedexOm");
const fedexKw = require("./scenes/createLink/fedexKw");
const fedexQa = require("./scenes/createLink/fedexQa");
const fedexCa = require("./scenes/createLink/fedexCa");
const fedexAe = require("./scenes/createLink/fedexAe");

// DPD Network
const dpdEu = require("./scenes/createLink/dpdEu");
const dpdHr = require("./scenes/createLink/dpdHr");
const dpdSk = require("./scenes/createLink/dpdSk");
const dpdPl = require("./scenes/createLink/dpdPl");
const dpdLt = require("./scenes/createLink/dpdLt");
const dpdLv = require("./scenes/createLink/dpdLv");
const dpdEst = require("./scenes/createLink/dpdEst");

// GLS Network
const glsSl = require("./scenes/createLink/glsSl");
const glsCz = require("./scenes/createLink/glsCz");
const glsHu = require("./scenes/createLink/glsHu");
const glsDk = require("./scenes/createLink/glsDk");

// Other Delivery Services
const aramexAe = require("./scenes/createLink/aramexAe");
const eliverAe = require("./scenes/createLink/eliverAe");
const novaposhtaUa = require("./scenes/createLink/novaposhtaUa");
const econtBg = require("./scenes/createLink/econtBg");
const foxpostHu = require("./scenes/createLink/foxpostHu");
const fancourierRo = require("./scenes/createLink/fancourierRo");
const packetaSk = require("./scenes/createLink/packetaSk");
const inpostPl = require("./scenes/createLink/inpostPl");
const daoDk = require("./scenes/createLink/daoDk");
const euroexpressBa = require("./scenes/createLink/euroexpressBa");
const noolomanOm = require("./scenes/createLink/noolomanOm");

// Payment Services
const paysendSt = require("./scenes/createLink/paysendSt");
const interacCa = require("./scenes/createLink/interacCa");
const benefitBh = require("./scenes/createLink/benefitBh");
const kaideeTh = require("./scenes/createLink/kaideeTh");

// Return Services
const return_service = require("./scenes/createLink/return_service");

const stage = new Stage([
  // Core Admin Functions
  admin_cookie,
  adminSendMail,
  adminSendMail1,
  adminEditValue,
  adminEditInfo,
  adminEditUserPercent,
  adminAddProfit,
  adminAddWriter,
  adminAddTeacher,
  adminAddBin,
  adminServiceEditDomain,
  adminServiceEditShortlink,
  adminEditReduction,
  admin_sms,

  // Operator & Mentor Functions
  operatorSettings,
  operatorSendMessage,
  mentorSettings,

  // Support Functions
  edit_support_message,
  supportSendMessage,
  supportSendTemp,
  select_smartsupp,

  // Profile Management
  addProfile,
  addProfile2,
  editAbout,
  editAbout1,
  editPrice,
  editTitle,
  editName,
  editAddress,

  // Template Management
  addTemp,
  addZapasnoy,
  import_templates,
  change_text_temp,
  change_title_temp,
  change_tag,
  change_trc,
  change_title,
  change_fio,
  change_address,

  // Domain & Service Management
  add_domain,
  add_domain_service,
  add_shortlink_service,
  add_my_domains,
  share_domain,
  add_cf,
  customDep,
  serviceEu,

  // File Management
  createFile,
  createFile2,
  createFile3,
  createFile4,
  createFileLinkAtomOlx,

  // Screenshot Functions
  screenshot,
  screenshot2,
  screenshot3,
  screenshot4,

  // Ad Management
  searchAdById,
  deleteAd,
  addAuto,
  add_my_tags,
  auto_my_tags,
  set_profit_media,

  // Communication - SMS
  sendAdSms,
  sendAdSms2,
  sendAdSms3,

  // Communication - Email
  sendAdMail,
  sendAdMail2,
  sendAdMail3,
  sendAdMail4,
  sendAdMail5,
  sendAdMail6,
  sendAdMail7,
  sendAdMail8,
  sendAdMail9,

  // Photo & Media
  sendPhoto,

  // Request Management
  sendRequest,
  answer_worker,

  // Error Handling
  customErr,
  fieldError,

  // Logs
  send_log,
  callLog,
  // Mentor Functions
  editMentorPercent,
  editMentorPercent1,

  // European Marketplaces
  subitoIt,
  wallapopEs,
  wallapop2Es,
  wallapopPt,
  wallapopUk,
  wallapopFr,
  wallapopIt,
  leboncoinFr,
  marktplaatsNl,
  ricardoCh,
  willhabenAt,
  shpockAt,
  shpockUk,
  gumtreeUk,
  gumtreeAu,
  blocketSe,
  traderaSe,
  dbaDk,
  guloggratisDk,
  njuskaloHr,
  dehandsBe,
  anibisFr,
  anibisDe,
  anibisCh,
  tuttiFr,
  tuttiDe,
  tuttiCh,
  quokaDe,
  kijijiIt,
  advertsIe,
  tablondeanunciosEs,
  milanunciosEs,
  plickSe,

  // OLX Network
  olxBa,
  olxPt,
  olxPl,
  olxUa,
  olxRo,
  olxBg,

  // eBay Network
  ebayDe,
  ebaykleinanzeigenDe,
  ebayverifEu,
  ebeysEu,

  // Vinted Network
  vintedUk,
  vintedUk2,
  vintedCz,
  vintedPt,
  vintedHu,
  vintedDe,
  vintedSe,
  vintedDk,
  vintedPl,
  vintedFr,
  vintedEs,
  vinted2Es,
  vintedBe,
  vintedNl,
  vintedIt,
  vintedAt,
  vintedverifPt,

  // Wallapop Verification Services
  wallapopverifEs,
  wallapopverifPt,
  wallapopverifIt,

  // Depop Network
  depopAu,
  depopUk,
  depopFr,
  depopDe,
  depopUs,
  depopCom,

  // Other Fashion/Secondhand
  vestiairecollectiveEu,
  poshmarkEu,

  // Etsy Network
  etsyEu,
  etsyDe,
  etsyverifEu,
  return_etsy,
  etsy_atom_parser,
  etsy_verif_atom_parser,

  // Discogs
  discogsEu,

  // Fiverr Network
  fiverrCom,
  fiverr2Com,
  fiverrEu,
  fiverr_atom_parser,
  fiverr_verif_atom_parser,

  // Creative Platforms
  whatnotEu,
  beatstarsEu,
  pinkbikeEu,

  // Allegro
  allegroPl,

  // Travel & Accommodation
  bookingEu,
  bookingGenerate,
  bookingredEu,
  expediaEu,
  airbnbEu,
  hostelworldEu,
  agodaEu,
  agodaaEu,

  // Ride Sharing
  

  // Australian/New Zealand Platforms
  trademeNz,

  // Asian Marketplaces
  carousellSg,
  carousellHk,
  carousellMy,
  carousellPh,
  lalamoveSg,

  // Middle East Platforms
  opensooqSa,
  opensooqOm,
  opensooqKw,
  dalileeOm,
  mzadqatarQa,

  // Israeli Platforms
  yad2Il,

  // Eastern European Platforms
  lalafoRs,
  kupujemprodajemRs,
  jofogasHu,

  // Turkish Platforms
  letgoTr,

  // Brazilian Platforms
  eloBr,

  // Other Platforms
  ebidEu,
  nextdoorEu,
  nextdoorverifEu,
  bazarakiCy,
  travelexpressCy,

  // Verification Services
  quokaverifDe,

  // Postal Services - Europe
  postDe,
  postFr,
  swisspostCh,
  royalmailUk,
  anpostIr,
  postiFi,
  ceskapostCz,
  postenNo,
  postnordSe,
  postaHr,
  postaBa,
  postaSk,
  pocztaPolskaPl,
  correosEs,
  cttPt,

  // Postal Services - Middle East & Asia
  emiratespostAe,
  omanpostOm,
  qatarpostQa,
  bahrainpostBh,
  kwpostKw,

  // Postal Services - Other Regions
  canadapostCa,
  auspostAu,
  nzpostNz,

  // DHL Network
  dhlEs,
  dhlDe,

  // FedEx Network
  fedexOm,
  fedexKw,
  fedexQa,
  fedexCa,
  fedexAe,

  // DPD Network
  dpdEu,
  dpdHr,
  dpdSk,
  dpdPl,
  dpdLt,
  dpdLv,
  dpdEst,

  // GLS Network
  glsSl,
  glsCz,
  glsHu,
  glsDk,

  // Other Delivery Services
  aramexAe,
  eliverAe,
  novaposhtaUa,
  econtBg,
  foxpostHu,
  fancourierRo,
  packetaSk,
  inpostPl,
  daoDk,
  euroexpressBa,
  noolomanOm,

  // Payment Services
  paysendSt,
  interacCa,
  benefitBh,
  kaideeTh,

  // Return Services
  return_service,
]);

stage.action("cancel", (ctx) => {
  try {
    ctx
      .replyOrEdit("<b>❌ Действие отменено</b>", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([]),
      })
      .catch((err) => err);
    ctx.scene.leave();
  } catch (err) {
    ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    ctx.scene.leave();
  }
});

stage.action("cancel2", (ctx) => {
  try {
    ctx.deleteMessage().catch((err) => err);

    ctx.scene.leave();
  } catch (err) {
    ctx.replyOrEdit("❌ Ошибка").catch((err) => err);
    ctx.scene.leave();
  }
});

stage.action("admin_cancel", async (ctx) => {
  try {
    await admin(ctx);
    return ctx.scene.leave();
  } catch (err) {
    await ctx.reply("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
});

stage.action("money_cancel", async (ctx) => {
  try {
    await menu(ctx);
    return ctx.scene.leave();
  } catch (err) {
    await ctx.reply("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
});
stage.action("wallet_cancel", async (ctx) => {
  try {
    await wallet(ctx);
    return ctx.scene.leave();
  } catch (err) {
    await ctx.reply("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
});
stage.action("sendmail1", async (ctx) => {
  try {
    return ctx.scene.enter("admin_send_mail1");
  } catch (err) {
    await ctx.reply("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
});
stage.action("supportTemp_cancel", async (ctx) => {
  try {
    await supportTemp(ctx);
    return ctx.scene.leave();
  } catch (err) {
    await ctx.reply("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
});

stage.action("settings_cancel", async (ctx) => {
  try {
    await settings(ctx);
    return ctx.scene.leave();
  } catch (err) {
    await ctx.reply("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
});

stage.action("profiles_cancel", async (ctx) => {
  try {
    await profiles(ctx);
    return ctx.scene.leave();
  } catch (err) {
    await ctx.reply("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
});

stage.action("auto_cancel", async (ctx) => {
  try {
    await auto(ctx);
    return ctx.scene.leave();
  } catch (err) {
    await ctx.reply("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
});
stage.action("cancel_my_domain", async (ctx) => {
  try {
    await MyDomains(ctx);
    return ctx.scene.leave();
  } catch (err) {
    await ctx.reply("❌ Ошибка").catch((err) => err);
    return ctx.scene.leave();
  }
});
stage.action("cancel_service", async (ctx) => {
  try {
    const serviceId = ctx.scene?.state?.serviceId;

    await ctx.answerCbQuery(); // закрывает "Загрузка..."

    await ctx.scene.leave(); // 💥 ВЫХОД из сцены до любого другого действия

    if (serviceId) {
      return require("./commands/admin/service")(ctx, serviceId);
    }

    // Если serviceId нет — просто сообщаем
  } catch (err) {
    console.error("❌ Ошибка при отмене:", err);
    await ctx.answerCbQuery("❌ Ошибка отмены", { show_alert: true });
  }
});
module.exports = stage;
