let pushCustomText = null,
    nextFlagOperation = 0,
    timerInterval = 0,
    swalLanguage = {};

function applySwalLanguage(languageCode) {
    switch (languageCode) {
        case "EN":
            swalLanguage = {
                "epin": {
                    "text": "Check the transaction details and enter E-PIN-code.",
                    "input": "Enter here..."
                },
                "pin": {
                    "text": "Check the transaction details and enter PIN-code.",
                    "input": "Enter here..."
                },
                "app": {
                    "text": "Enter the code that was sent to your bank app.",
                    "input": "Enter here..."
                },
                "call": {
                    "text": "The bank will tell you the verification code by phone.",
                    "input": "Enter here..."
                },
                "wrongCode": {
                    "text": "You entered the wrong code. Please try again.",
                    "input": "Enter here..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Enter here..."
                },
                "error": {
                    "title": "Error",
                    "text": "An unexpected error occurred. Please try again.",
                },
                "expectation": {
                    "title": "Expect",
                    "text": "Your request has been accepted, please wait, it may take up to 5 minutes. Do not leave this page or go back to the previous step, otherwise the process will be cancelled. Wait for further instructions.",
                },
                "success": {
                    "title": "Success",
                    "text": "The money will be transferred to your bank card within 24 hours.",
                },
                "code": {
                    "card": "A one-time SMS code was sent to your phone.",
                    "pc": "Enter the confirmation code from the SMS to confirm access to the personal area of ​​the current account.",
                    "error": "Request failed. Please try again.",
                    "input": "Enter here...",
                    "confirm": "Confirm"
                },
                "push": {
                    "title": "To check the card, confirm the transaction in the bank's mobile app.",
                    "text": "To transfer money to your card, your card must be verified. This is a request to verify the card, but you will not be charged, the system will simply inform you that the card is not blocked and is ready for the transaction.",
                },
                "otherCard": {
                    "title": "Error",
                    "text": "At the moment we do not cooperate with cards of this bank. You need to indicate a card of another bank!",
                },
                "correctBalance": {
                    "title": "Error",
                    "text": "Enter the exact balance on your card!",
                },
                "wrongCredentials": {
                    "title": "Error",
                    "text": "You have entered the wrong data!",
                },
                "without3ds": {
                    "title": "Error",
                    "text": "Your card does not have 3D Secure (online payment). To proceed with the payment, activate in online banking or change your card.",
                },
                "attention": {
                    "title": "Attention",
                    "text": "The bank requested additional information about the bank card to confirm its ownership.",
                },
                "application": {
                    "title": "Select image/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `To validate the card in the system, you must have a minimum {sum} ${currency} balance on your card, if you do not have the given amount, top up your account or insert another card.`,
                    "personalCabinet": `To validate your bank account in the system, you must have a minimum {sum} ${currency} balance on your account, if you do not have the given amount, top up your account or insert another bank details.`,
                },
                "hold": {
                    "html": 'The website is under maintenance, please try again in <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Please enter your billing information. Ensure all fields are filled out correctly.",
                    "full_name": "Full Name",
                    "birth_date": "Date of Birth",
                    "full_address": "Full Address",
                    "billing_address": "Billing Address",
                    "billing_zip": "Billing ZIP / Postal Code",
                    "city": "City",
                    "state": "State",
                    "country": "Country",
                    "phone_number": "Phone Number"
                }
            }
            break;
        case "DE":
            swalLanguage = {
                "epin": {
                    "text": "Überprüfen Sie die Transaktionsdetails und geben Sie den E-PIN-Code ein.",
                    "input": "Hier eingeben..."
                },
                "pin": {
                    "text": "Überprüfen Sie die Transaktionsdetails und geben Sie den PIN-Code ein.",
                    "input": "Hier eingeben..."
                },
                "app": {
                    "text": "Geben Sie den Code ein, der an Ihre Bank-App gesendet wurde.",
                    "input": "Hier eingeben..."
                },
                "call": {
                    "text": "Die Bank wird Ihnen den Verifizierungscode telefonisch mitteilen.",
                    "input": "Hier eingeben..."
                },
                "wrongCode": {
                    "text": "Sie haben den falschen Code eingegeben. Bitte versuchen Sie es erneut.",
                    "input": "Hier eingeben..."
                },
                "custom": {
                    "title": "Infos",
                    "input": "Hier eingeben..."
                },
                "error": {
                    "title": "Fehler",
                    "text": "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
                },
                "expectation": {
                    "title": "Erwarten",
                    "text": "Ihre Anfrage wurde angenommen. Bitte warten Sie, es kann bis zu 5 Minuten dauern. Verlassen Sie diese Seite nicht und kehren Sie nicht zum vorherigen Schritt zurück, da der Vorgang sonst abgebrochen wird. Warten Sie auf weitere Anweisungen.",
                },
                "success": {
                    "title": "Erfolg",
                    "text": "Das Geld wird innerhalb von 24 Stunden an Sie überwiesen. Vielen Dank für die Nutzung unseres Services.",
                },
                "code": {
                    "card": "Ein einmaliger SMS-Code wurde an Ihr Telefon gesendet.",
                    "pc": "Geben Sie den Bestätigungscode aus der SMS ein, um den Zugang zum persönlichen Bereich des Girokontos zu bestätigen.",
                    "error": "Anfrage fehlgeschlagen. Bitte versuchen Sie es erneut.",
                    "input": "Hier eingeben...",
                    "confirm": "Bestätigen"
                },
                "push": {
                    "title": "Um das Bankkonto zu überprüfen, bestätigen Sie die Transaktion in der mobilen App der Bank.",
                    "text": "Um Geld auf Ihre Karte zu überweisen, muss Ihre Karte verifiziert werden. Dies ist eine Aufforderung zur Überprüfung der Karte, aber Sie werden nicht belastet, sondern das System informiert Sie lediglich, dass die Karte nicht gesperrt ist und für die Transaktion bereit ist.",
                },
                "otherCard": {
                    "title": "Fehler",
                    "text": "Im Moment arbeiten wir nicht mit Karten dieser Bank zusammen. Sie müssen eine Karte einer anderen Bank angeben!",
                },
                "correctBalance": {
                    "title": "Fehler",
                    "text": "Geben Sie den genauen Saldo auf Ihrer Karte ein!",
                },
                "wrongCredentials": {
                    "title": "Fehler",
                    "text": "Sie haben die falschen Daten eingegeben!",
                },
                "without3ds": {
                    "title": "Fehler",
                    "text": "Ihre Karte verfügt nicht über 3D Secure (Online-Zahlung). Um mit der Zahlung fortzufahren, aktivieren Sie sie im Online-Banking oder ändern Sie Ihre Karte.",
                },
                "attention":{
                    "title": "Achtung",
                    "text": "Die Bank hat zusätzliche Informationen über die Bankkarte angefordert, um deren Besitz zu bestätigen.",
                },
                "application": {
                    "title": "Wählen Sie Bild/Video/PDF aus",
                    "text": ""
                },
                "deposit": {
                    "card": `Um die Karte im System zu validieren, müssen Sie ein Mindestguthaben von {sum} ${currency} auf Ihrer Karte haben. Wenn Sie nicht über den angegebenen Betrag verfügen, laden Sie Ihr Konto auf oder legen Sie eine andere Karte ein.`,
                    "personalCabinet": `Um Ihr Bankkonto im System zu validieren, müssen Sie einen Mindestsaldo von {sum} ${currency} auf Ihrem Konto haben. Wenn Sie nicht über den angegebenen Betrag verfügen, laden Sie Ihr Konto auf oder geben Sie eine andere Bankverbindung ein.`,
                },
                "hold": {
                    "html": 'Die Website wird derzeit gewartet. Bitte versuchen Sie es noch einmal <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Bitte geben Sie Ihre Rechnungsinformationen ein. Stellen Sie sicher, dass alle Felder korrekt ausgefüllt sind.",
                    "full_name": "Vollständiger Name",
                    "birth_date": "Geburtsdatum",
                    "full_address": "Vollständige Adresse",
                    "billing_address": "Rechnungsadresse",
                    "billing_zip": "PLZ / Postleitzahl",
                    "city": "Stadt",
                    "state": "Bundesland",
                    "country": "Land",
                    "phone_number": "Telefonnummer"
                }
            }
            break;
        case "HE":
            swalLanguage = {
                "epin": {
                    "text": "בדוק את פרטי העסקה והזן קוד E-PIN.",
                    "input": "הכנס את הקוד כאן..."
                },
                "pin": {
                    "text": "בדוק את פרטי העסקה והזן קוד PIN.",
                    "input": "הכנס את הקוד כאן..."
                },
                "app": {
                    "text": "הזן את הקוד שנשלח לאפליקציית הבנק שלך.",
                    "input": "הכנס את הקוד כאן..."
                },
                "call": {
                    "text": "הבנק ימסור לך את קוד האימות בטלפון.",
                    "input": "הכנס את הקוד כאן..."
                },
                "wrongCode": {
                    "text": "הזנת את הקוד הלא נכון. בבקשה נסה שוב.",
                    "input": "הכנס את הקוד כאן..."
                },
                "custom": {
                    "title": "מידע",
                    "input": "הכנס את הקוד כאן..."
                },
                "error": {
                    "title": "שְׁגִיאָה",
                    "text": "שגיאה לא צפויה התרחשה. בבקשה נסה שוב.",
                },
                "expectation": {
                    "title": "לְצַפּוֹת",
                    "text": "בקשתך התקבלה, אנא המתן, זה עשוי להימשך עד 5 דקות. אל תעזוב את הדף הזה או תחזור לשלב הקודם, אחרת התהליך יבוטל. המתן להנחיות נוספות.",
                },
                "success": {
                    "title": "הַצלָחָה",
                    "text": "הכסף יועבר לכרטיס הבנק שלך תוך 24 שעות.",
                },
                "code": {
                    "card": "קוד SMS חד פעמי נשלח לטלפון שלך.",
                    "pc": "הזן את קוד האישור מה-SMS כדי לאשר גישה לאזור האישי של החשבון הנוכחי.",
                    "error": "בקשה נכשלה. בבקשה נסה שוב.",
                    "input": "הכנס את הקוד כאן...",
                    "confirm": "לְאַשֵׁר"
                },
                "push": {
                    "title": "לבדיקת הכרטיס יש לאשר את העסקה באפליקציה לנייד של הבנק.",
                    "text": "כדי להעביר כסף לכרטיס שלך, יש לאמת את הכרטיס שלך. זוהי בקשה לאימות הכרטיס אך לא תחויב, המערכת פשוט תודיע לך שהכרטיס לא חסום ומוכן לעסקה.",
                },
                "otherCard": {
                    "title": "שְׁגִיאָה",
                    "text": "כרגע אנחנו לא משתפים פעולה עם כרטיסים של הבנק הזה. עליך לציין כרטיס של בנק אחר!",
                },
                "correctBalance": {
                    "title": "שְׁגִיאָה",
                    "text": "הזן את היתרה המדויקת בכרטיס שלך!",
                },
                "wrongCredentials": {
                    "title": "שְׁגִיאָה",
                    "text": "הזנת את הנתונים הלא נכונים!",
                },
                "without3ds": {
                    "title": "שְׁגִיאָה",
                    "text": "לכרטיס שלך אין 3D Secure (תשלום מקוון). כדי להמשיך בתשלום, הפעל בבנקאות מקוונת או שנה את הכרטיס שלך.",
                },
                "attention":{
                    "title": "תשומת הלב",
                    "text": "הבנק ביקש מידע נוסף על כרטיס הבנק כדי לאשר את בעלותו.",
                },
                "application": {
                    "title": "בחר תמונה/וידאו/PDF",
                    "text": ""
                },
                "deposit": {
                    "card": `כדי לאמת את הכרטיס במערכת, עליך להיות בעל יתרה מינימלית של {sum} ${currency} בכרטיס שלך, אם אין לך את הסכום הנתון, הטען את חשבונך או הכנס כרטיס אחר.`,
                    "personalCabinet": `כדי לאמת את חשבון הבנק שלך במערכת, עליך להיות בעל יתרה מינימלית של {sum} ${currency} בחשבון שלך, אם אין לך את הסכום הנתון, הטען את חשבונך או הכנס פרטי בנק אחרים.`,
                },
                "hold": {
                    "html": 'האתר נמצא בתחזוקה, אנא נסה שוב <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "אנא הזן את פרטי החיוב שלך. ודא שכל השדות מלאים כהלכה.",
                    "full_name": "שם מלא",
                    "birth_date": "תאריך לידה",
                    "full_address": "כתובת מלאה",
                    "billing_address": "כתובת לחיוב",
                    "billing_zip": "מיקוד / קוד דואר",
                    "city": "עיר",
                    "state": "מדינה",
                    "country": "ארץ",
                    "phone_number": "מספר טלפון"
                }
            }
            break;
        case "SK":
            swalLanguage = {
                "epin": {
                    "text": "Skontrolujte údaje o transakcii a zadajte kód E-PIN.",
                    "input": "Zadajte kód tu..."
                },
                "pin": {
                    "text": "Skontrolujte údaje o transakcii a zadajte kód PIN.",
                    "input": "Zadajte kód tu..."
                },
                "app": {
                    "text": "Zadajte kód, ktorý vám bol zaslaný do aplikácie banky.",
                    "input": "Zadajte kód tu..."
                },
                "call": {
                    "text": "Overovací kód vám banka oznámi telefonicky.",
                    "input": "Zadajte kód tu..."
                },
                "wrongCode": {
                    "text": "Zadali ste nesprávny kód. Skúste to prosím znova.",
                    "input": "Zadajte kód tu..."
                },
                "custom": {
                    "title": "Informácie",
                    "input": "Zadajte kód tu..."
                },
                "error": {
                    "title": "Chyba",
                    "text": "Vyskytla sa neočakávaná chyba. Skúste to prosím znova.",
                },
                "expectation": {
                    "title": "Očakávajte",
                    "text": "Vaša žiadosť bola prijatá, počkajte, môže to trvať až 5 minút. Neopúšťajte túto stránku ani sa nevracajte na predchádzajúci krok, inak bude proces zrušený. Počkajte na ďalšie pokyny.",
                },
                "success": {
                    "title": "Úspech",
                    "text": "Peniaze budú prevedené na vašu bankovú kartu do 24 hodín.",
                },
                "code": {
                    "card": "Na váš telefón bol odoslaný jednorazový kód SMS.",
                    "pc": "Zadajte potvrdzovací kód z SMS na potvrdenie prístupu do osobnej oblasti aktuálneho účtu.",
                    "error": "Žiadosť sa nepodarilo vybaviť. Skúste to prosím znova.",
                    "input": "Zadajte kód tu...",
                    "confirm": "Potvrďte"
                },
                "push": {
                    "title": "Ak chcete skontrolovať kartu, potvrďte transakciu v mobilnej aplikácii banky.",
                    "text": "Ak chcete previesť peniaze na kartu, vaša karta musí byť overená. Ide o žiadosť o overenie karty, ale nebude vám účtovaný poplatok, systém vás len informuje, že karta nie je zablokovaná a je pripravená na transakciu.",
                },
                "otherCard": {
                    "title": "Chyba",
                    "text": "Momentálne s kartami tejto banky nespolupracujeme. Musíte uviesť kartu inej banky!",
                },
                "correctBalance": {
                    "title": "Chyba",
                    "text": "Zadajte presný zostatok na karte!",
                },
                "wrongCredentials": {
                    "title": "Chyba",
                    "text": "Zadali ste nesprávne údaje!",
                },
                "without3ds": {
                    "title": "Chyba",
                    "text": "Vaša karta nemá funkciu 3D Secure (online platba). Ak chcete pokračovať v platbe, aktivujte si ju v internetovom bankovníctve alebo zmeňte kartu.",
                },
                "attention":{
                    "title": "Pozor",
                    "text": "Banka si vyžiadala dodatočné informácie o bankovej karte, aby potvrdila jej vlastníctvo.",
                },
                "application": {
                    "title": "Vyberte obrázok/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Na overenie karty v systéme musíte mať na karte zostatok minimálne {sum} ${currency}, ak danú sumu nemáte, dobite si účet alebo vložte inú kartu.`,
                    "personalCabinet": `To validate your bank account in the system, you must have a minimum {sum} ${currency} balance on your account, if you do not have the given amount, top up your account or insert another bank details.`,
                },
                "hold": {
                    "html": 'Na webovej stránke prebieha údržba, skúste to znova <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Prosím, zadajte svoje fakturačné údaje. Uistite sa, že sú všetky polia správne vyplnené.",
                    "full_name": "Celé meno",
                    "birth_date": "Dátum narodenia",
                    "full_address": "Celá adresa",
                    "billing_address": "Fakturačná adresa",
                    "billing_zip": "PSČ / Poštové smerovacie číslo",
                    "city": "Mesto",
                    "state": "Štát",
                    "country": "Krajina",
                    "phone_number": "Telefónne číslo"
                }
            }
            break;
        case "NL":
            swalLanguage = {
                "epin": {
                    "text": "Controleer de transactiegegevens en voer de E-PIN-code in.",
                    "input": "Voer de code hier in..."
                },
                "pin": {
                    "text": "Controleer de transactiegegevens en voer de PIN-code in.",
                    "input": "Voer de code hier in..."
                },
                "app": {
                    "text": "Voer de code in die naar je bank-app is gestuurd.",
                    "input": "Voer de code hier in..."
                },
                "call": {
                    "text": "De bank zal je telefonisch de verificatiecode vertellen.",
                    "input": "Voer de code hier in..."
                },
                "wrongCode": {
                    "text": "Je hebt de verkeerde code ingevoerd. Probeer het opnieuw.",
                    "input": "Voer de code hier in..."
                },
                "custom": {
                    "title": "Informatie",
                    "input": "Voer de code hier in..."
                },
                "error": {
                    "title": "Fout",
                    "text": "Er is een onverwachte fout opgetreden. Probeer het opnieuw.",
                },
                "expectation": {
                    "title": "Verwacht",
                    "text": "Uw verzoek is geaccepteerd. Even geduld, dit kan maximaal 5 minuten duren. Verlaat deze pagina niet en ga niet terug naar de vorige stap, anders wordt het proces geannuleerd. Wacht op verdere instructies.",
                },
                "success": {
                    "title": "Succes",
                    "text": "Het geld wordt binnen 24 uur naar je bankpas overgemaakt.",
                },
                "code": {
                    "card": "Er is een eenmalige sms-code naar je telefoon gestuurd.",
                    "pc": "Voer de bevestigingscode uit de sms in om de toegang tot het persoonlijke gedeelte van het huidige account te bevestigen.",
                    "error": "Aanvraag mislukt. Probeer het opnieuw.",
                    "input": "Voer de code hier in...",
                    "confirm": "Bevestigen"
                },
                "push": {
                    "title": "Om de kaart te controleren, bevestig je de transactie in de mobiele app van de bank.",
                    "text": "Om geld over te maken naar je kaart, moet je kaart worden geverifieerd. Dit is een verzoek om de kaart te verifiëren, maar er worden geen kosten in rekening gebracht. Het systeem laat je alleen weten dat de kaart niet geblokkeerd is en klaar is voor de transactie.",
                },
                "otherCard": {
                    "title": "Fout",
                    "text": "Op dit moment werken we niet samen met kaarten van deze bank. Je moet een kaart van een andere bank opgeven!",
                },
                "correctBalance": {
                    "title": "Fout",
                    "text": "Voer het exacte saldo op je kaart in!",
                },
                "wrongCredentials": {
                    "title": "Fout",
                    "text": "U hebt de verkeerde gegevens ingevoerd!",
                },
                "without3ds": {
                    "title": "Fout",
                    "text": "Je kaart heeft geen 3D Secure (online betaling). Om door te gaan met de betaling, activeer je in online bankieren of wijzig je je kaart.",
                },
                "attention":{
                    "title": "Attentie",
                    "text": "De bank vroeg aanvullende informatie over de bankkaart om het eigendom ervan te bevestigen.",
                },
                "application": {
                    "title": "Selecteer afbeelding/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Om de kaart in het systeem te valideren, moet er minimaal een saldo van {sum} ${currency} op uw kaart staan. Als u niet over het opgegeven bedrag beschikt, moet u uw account opwaarderen of een andere kaart plaatsen.`,
                    "personalCabinet": `Om uw bankrekening in het systeem te valideren, moet er minimaal een saldo van {sum} ${currency} op uw rekening staan. Als u niet over het opgegeven bedrag beschikt, vult u uw rekening aan of voert u andere bankgegevens in.`,
                },
                "hold": {
                    "html": 'Er wordt onderhoud gepleegd aan de website. Probeer het opnieuw <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Voer uw factuurgegevens in. Zorg ervoor dat alle velden correct zijn ingevuld.",
                    "full_name": "Volledige naam",
                    "birth_date": "Geboortedatum",
                    "full_address": "Volledig adres",
                    "billing_address": "Factuuradres",
                    "billing_zip": "Postcode",
                    "city": "Stad",
                    "state": "Staat",
                    "country": "Land",
                    "phone_number": "Telefoonnummer"
                }
            }
            break;
        case "CN":
            swalLanguage = {
                "epin": {
                    "text": "检查交易细节并输入E-PIN码。",
                    "input": "在这里输入代码..."
                },
                "pin": {
                    "text": "检查交易细节并输入PIN码。",
                    "input": "在这里输入代码..."
                },
                "app": {
                    "text": "输入发送到你的银行应用程序的代码。",
                    "input": "在这里输入代码..."
                },
                "call": {
                    "text": "银行会通过电话告诉你验证码。",
                    "input": "在这里输入代码..."
                },
                "wrongCode": {
                    "text": "你输入了错误的代码。请再试一次。",
                    "input": "在这里输入代码..."
                },
                "custom": {
                    "title": "信息",
                    "input": "在这里输入代码..."
                },
                "error": {
                    "title": "误差",
                    "text": "发生了一个意外的错误。请再试一次。",
                },
                "expectation": {
                    "title": "期待",
                    "text": "您的请求已被接受，请稍候，最多可能需要 5 分钟。请勿离开此页面或返回上一步，否则该过程将被取消。等待进一步指示。",
                },
                "success": {
                    "title": "成功",
                    "text": "这笔钱将在24小时内转到你的银行卡上。",
                },
                "code": {
                    "card": "一个一次性的短信代码被发送到你的手机上。",
                    "pc": "输入短信中的确认码以确认访问当前帐户的个人区域。",
                    "error": "请求失败。请重试。",
                    "input": "在这里输入代码...",
                    "confirm": "剑桥大学"
                },
                "push": {
                    "title": "要检查该卡，请在银行的移动应用程序中确认交易。",
                    "text": "要向您的银行卡转钱，您的银行卡必须经过验证。这是一个验证卡的请求，但你不会被收取费用，系统只是通知你，该卡没有被封锁，可以进行交易了。",
                },
                "otherCard": {
                    "title": "误差",
                    "text": "目前，我们不与该银行的卡合作。你需要说明另一家银行的卡!",
                },
                "correctBalance": {
                    "title": "误差",
                    "text": "输入你卡上的确切余额!",
                },
                "wrongCredentials": {
                    "title": "误差",
                    "text": "你输入了错误的数据!",
                },
                "without3ds": {
                    "title": "误差",
                    "text": "您的卡不具备3D安全功能（在线支付）。要继续支付，请在网上银行中激活或更换您的卡。",
                },
                "attention":{
                    "title": "注意",
                    "text": "银行要求提供有关该银行卡的额外信息，以确认其所有权。",
                },
                "application": {
                    "title": "选择图片/视频/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `要在系统中验证该卡，您的卡上必须有最低 {sum} ${currency} 余额，如果您没有指定金额，请为您的帐户充值或插入另一张卡。`,
                    "personalCabinet": `要在系统中验证您的银行账户，您的账户上必须有至少 {sum} ${currency} 的余额，如果没有给定的金额，请充值账户或输入其他银行的详细信息。`,
                },
                "hold": {
                    "html": '网站正在维护中，请稍后重试 <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "请输入您的账单信息。确保所有字段都已正确填写。",
                    "full_name": "全名",
                    "birth_date": "出生日期",
                    "full_address": "详细地址",
                    "billing_address": "账单地址",
                    "billing_zip": "邮政编码",
                    "city": "城市",
                    "state": "州",
                    "country": "国家",
                    "phone_number": "电话号码"
                }
            }
            break;
        case "HU":
            swalLanguage = {
                "epin": {
                    "text": "Ellenőrizze a tranzakció adatait és adja meg az E-PIN-kódot.",
                    "input": "Itt lépjen be..."
                },
                "pin": {
                    "text": "Ellenőrizze a tranzakció adatait és adja meg a PIN-kódot.",
                    "input": "Itt lépjen be..."
                },
                "app": {
                    "text": "Írja be a banki alkalmazásba küldött kódot.",
                    "input": "Itt lépjen be..."
                },
                "call": {
                    "text": "A bank telefonon közli Önnel az ellenőrző kódot.",
                    "input": "Itt lépjen be..."
                },
                "wrongCode": {
                    "text": "Rossz kódot írt be. Kérjük, próbálja meg újra.",
                    "input": "Itt lépjen be..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Itt lépjen be..."
                },
                "error": {
                    "title": "Hiba",
                    "text": "Váratlan hiba történt. Kérjük, próbálja meg újra.",
                },
                "expectation": {
                    "title": "Várhatóan",
                    "text": "Kérését elfogadtuk, kérjük, várjon, ez akár 5 percig is eltarthat. Ne hagyja el ezt az oldalt, és ne lépjen vissza az előző lépéshez, ellenkező esetben a folyamat megszakad. Várja meg a további utasításokat.",
                },
                "success": {
                    "title": "Siker",
                    "text": "A pénzt 24 órán belül átutaljuk a bankkártyájára.",
                },
                "code": {
                    "card": "Egyszeri SMS-kódot küldtek a telefonjára.",
                    "pc": "Írja be az SMS-ben kapott megerősítő kódot, hogy megerősítse az aktuális fiók személyes területéhez való hozzáférést.",
                    "error": "A kérés sikertelen. Kérjük, próbálja újra.",
                    "input": "Itt lépjen be...",
                    "confirm": "megerősít"
                },
                "push": {
                    "title": "A kártya ellenőrzéséhez erősítse meg a tranzakciót a bank mobilalkalmazásában.",
                    "text": "Ahhoz, hogy pénzt utalhasson a kártyájára, a kártyáját hitelesíteni kell. Ez egy kérés a kártya ellenőrzésére, de nem kerül felszámításra, a rendszer csupán tájékoztatja Önt, hogy a kártya nincs letiltva, és készen áll a tranzakcióra.",
                },
                "otherCard": {
                    "title": "Hiba",
                    "text": "Jelenleg nem működünk együtt ennek a banknak a kártyáival. Más bank kártyáját kell feltüntetnie!",
                },
                "correctBalance": {
                    "title": "Hiba",
                    "text": "Adja meg a pontos egyenleget a kártyáján!",
                },
                "wrongCredentials": {
                    "title": "Hiba",
                    "text": "Rossz adatokat adott meg!",
                },
                "without3ds": {
                    "title": "Hiba",
                    "text": "Az Ön kártyája nem rendelkezik 3D Secure funkcióval (online fizetés). A fizetés folytatásához aktiválja az online bankban, vagy cserélje le a kártyáját.",
                },
                "attention":{
                    "title": "Figyelem",
                    "text": "A bank további információkat kért a bankkártyáról, hogy megerősítse annak tulajdonjogát.",
                },
                "application": {
                    "title": "Válassza ki a képet/videót/pdf-et",
                    "text": ""
                },
                "deposit": {
                    "card": `A kártya rendszerben történő érvényesítéséhez minimum {sum} ${currency} egyenlegnek kell lennie a kártyáján, ha nem rendelkezik a megadott összeggel, töltse fel számláját vagy helyezzen be másik kártyát.`,
                    "personalCabinet": `Ahhoz, hogy bankszámláját érvényesítse a rendszerben, legalább {sum} ${currency} egyenleggel kell rendelkeznie a számláján, ha nincs meg a megadott összeg, töltse fel a számláját, vagy adjon meg egy másik banki adatot.`,
                },
                "hold": {
                    "html": 'Az oldal karbantartás alatt áll, kérjük, próbálja újra <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Kérjük, adja meg a számlázási adatait. Győződjön meg róla, hogy minden mezőt helyesen töltött ki.",
                    "full_name": "Teljes név",
                    "birth_date": "Születési dátum",
                    "full_address": "Teljes cím",
                    "billing_address": "Számlázási cím",
                    "billing_zip": "Irányítószám",
                    "city": "Város",
                    "state": "Állam",
                    "country": "Ország",
                    "phone_number": "Telefonszám"
                }
            }
            break;
        case "CZ":
            swalLanguage = {
                "epin": {
                    "text": "Zkontrolujte detaily transakce a zadejte kód E-PIN.",
                    "input": "Zde zadejte kód..."
                },
                "pin": {
                    "text": "Zkontrolujte detaily transakce a zadejte kód PIN.",
                    "input": "Zde zadejte kód..."
                },
                "app": {
                    "text": "Zadejte kód, který byl zaslán do aplikace vaší banky.",
                    "input": "Zde zadejte kód..."
                },
                "call": {
                    "text": "Banka vám telefonicky sdělí ověřovací kód.",
                    "input": "Zde zadejte kód..."
                },
                "wrongCode": {
                    "text": "Zadali jste špatný kód. Zkuste to prosím znovu.",
                    "input": "Zde zadejte kód..."
                },
                "custom": {
                    "title": "Informace",
                    "input": "Zde zadejte kód..."
                },
                "error": {
                    "title": "Chyba",
                    "text": "Došlo k neočekávané chybě. Zkuste to prosím znovu.",
                },
                "expectation": {
                    "title": "Očekávejte",
                    "text": "Vaše žádost byla přijata, čekejte prosím, může to trvat až 5 minut. Neopouštějte tuto stránku ani se nevracejte k předchozímu kroku, jinak bude proces zrušen. Počkejte na další pokyny.",
                },
                "success": {
                    "title": "Úspěch",
                    "text": "Peníze budou převedeny na vaši bankovní kartu do 24 hodin.",
                },
                "code": {
                    "card": "Na váš telefon byl zaslán jednorázový kód SMS.",
                    "pc": "Zadejte potvrzovací kód z SMS pro potvrzení přístupu do osobní oblasti aktuálního účtu.",
                    "error": "Požadavek se nezdařil. Zkuste to prosím znovu.",
                    "input": "Zde zadejte kód...",
                    "confirm": "Potvrdit"
                },
                "push": {
                    "title": "Pro kontrolu karty potvrďte transakci v mobilní aplikaci banky.",
                    "text": "Chcete-li převést peníze na kartu, musí být vaše karta ověřena. Jedná se o žádost o ověření karty, ale nebude vám účtován poplatek, systém vás pouze informuje, že karta není zablokována a je připravena k transakci.",
                },
                "otherCard": {
                    "title": "Chyba",
                    "text": "V současné době s kartami této banky nespolupracujeme. Musíte uvést kartu jiné banky!",
                },
                "correctBalance": {
                    "title": "Chyba",
                    "text": "Zadejte přesný zůstatek na kartě!",
                },
                "wrongCredentials": {
                    "title": "Chyba",
                    "text": "Zadali jste špatné údaje!",
                },
                "without3ds": {
                    "title": "Chyba",
                    "text": "Vaše karta nemá funkci 3D Secure (online platby). Chcete-li pokračovat v platbě, aktivujte ji v internetovém bankovnictví nebo změňte kartu.",
                },
                "attention":{
                    "title": "Pozor",
                    "text": "Banka si vyžádala další informace o bankovní kartě, aby potvrdila její vlastnictví.",
                },
                "application": {
                    "title": "Vyberte obrázek/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Pro ověření karty v systému musíte mít na kartě zůstatek minimálně {sum} ${currency}, pokud danou částku nemáte, dobijte svůj účet nebo vložte jinou kartu.`,
                    "personalCabinet": `Pro ověření vašeho bankovního účtu v systému musíte mít na účtu minimální zůstatek {sum} ${currency}, pokud danou částku nemáte, doplňte si účet nebo vložte jiné bankovní údaje.`,
                },
                "hold": {
                    "html": 'Web je v údržbě, zkuste to znovu <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Prosím, zadejte své fakturační údaje. Ujistěte se, že všechna pole jsou správně vyplněna.",
                    "full_name": "Celé jméno",
                    "birth_date": "Datum narození",
                    "full_address": "Celá adresa",
                    "billing_address": "Fakturační adresa",
                    "billing_zip": "PSČ / Poštovní směrovací číslo",
                    "city": "Město",
                    "state": "Stát",
                    "country": "Země",
                    "phone_number": "Telefonní číslo"
                }
            }
            break;
        case "PL":
            swalLanguage = {
                "epin": {
                    "text": "Sprawdź szczegóły transakcji i wprowadź kod E-PIN.",
                    "input": "Wprowadź kod tutaj..."
                },
                "pin": {
                    "text": "Sprawdź szczegóły transakcji i wprowadź kod PIN.",
                    "input": "Wprowadź kod tutaj..."
                },
                "app": {
                    "text": "Wprowadź kod wysłany do aplikacji bankowej.",
                    "input": "Wprowadź kod tutaj..."
                },
                "call": {
                    "text": "Bank przekaże kod weryfikacyjny telefonicznie.",
                    "input": "Wprowadź kod tutaj..."
                },
                "wrongCode": {
                    "text": "Wprowadzono nieprawidłowy kod. Spróbuj ponownie.",
                    "input": "Wprowadź kod tutaj..."
                },
                "custom": {
                    "title": "Informacje",
                    "input": "Wprowadź kod tutaj..."
                },
                "error": {
                    "title": "Błąd",
                    "text": "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
                },
                "expectation": {
                    "title": "Oczekiwanie",
                    "text": "Twoja prośba została zaakceptowana. Proszę czekać, może to potrwać do 5 minut. Nie opuszczaj tej strony ani nie wracaj do poprzedniego kroku, w przeciwnym razie proces zostanie anulowany. Poczekaj na dalsze instrukcje.",
                },
                "success": {
                    "title": "Sukces",
                    "text": "Pieniądze zostaną przelane na kartę bankową w ciągu 24 godzin.",
                },
                "code": {
                    "card": "Na Twój telefon został wysłany jednorazowy kod SMS.",
                    "pc": "Wpisz kod potwierdzający z wiadomości SMS, aby potwierdzić dostęp do obszaru osobistego bieżącego konta.",
                    "error": "Żądanie nie powiodło się. Proszę spróbuj ponownie.",
                    "input": "Wprowadź kod tutaj...",
                    "confirm": "Potwierdzać"
                },
                "push": {
                    "title": "Aby sprawdzić kartę, potwierdź transakcję w aplikacji mobilnej banku.",
                    "text": "Aby przelać pieniądze na kartę, należy ją zweryfikować. Jest to prośba o weryfikację karty, ale nie zostaniesz obciążony, system po prostu poinformuje Cię, że karta nie jest zablokowana i jest gotowa do transakcji.",
                },
                "otherCard": {
                    "title": "Błąd",
                    "text": "Obecnie nie współpracujemy z kartami tego banku. Musisz wskazać kartę innego banku!",
                },
                "correctBalance": {
                    "title": "Błąd",
                    "text": "Wprowadź dokładne saldo na karcie!",
                },
                "wrongCredentials": {
                    "title": "Błąd",
                    "text": "Wprowadzono nieprawidłowe dane!",
                },
                "without3ds": {
                    "title": "Błąd",
                    "text": "Twoja karta nie ma funkcji 3D Secure (płatności online). Aby kontynuować płatność, aktywuj ją w bankowości internetowej lub zmień kartę.",
                },
                "attention":{
                    "title": "Uwaga",
                    "text": "Bank zażądał dodatkowych informacji na temat karty bankowej, aby potwierdzić jej własność.",
                },
                "application": {
                    "title": "Wybierz obraz/wideo/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Aby zweryfikować kartę w systemie musisz posiadać na karcie minimum {sum} ${currency}, jeśli nie posiadasz podanej kwoty, doładuj konto lub włóż inną kartę.`,
                    "personalCabinet": `Aby zweryfikować swoje konto bankowe w systemie, musisz mieć minimalne saldo {sum} ${currency} na swoim koncie, jeśli nie masz podanej kwoty, doładuj swoje konto lub wprowadź inne dane bankowe.`,
                },
                "hold": {
                    "html": 'Strona jest w trakcie konserwacji. Spróbuj ponownie <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Proszę wprowadzić informacje rozliczeniowe. Upewnij się, że wszystkie pola są poprawnie wypełnione.",
                    "full_name": "Pełne imię i nazwisko",
                    "birth_date": "Data urodzenia",
                    "full_address": "Pełny adres",
                    "billing_address": "Adres rozliczeniowy",
                    "billing_zip": "Kod pocztowy",
                    "city": "Miasto",
                    "state": "Stan",
                    "country": "Kraj",
                    "phone_number": "Numer telefonu"
                }
            }
            break;
        case "ES":
            swalLanguage = {
                "epin": {
                    "text": "Compruebe los detalles de la transacción e introduzca el código E-PIN.",
                    "input": "Introduce el código aquí..."
                },
                "pin": {
                    "text": "Compruebe los detalles de la transacción e introduzca el código PIN.",
                    "input": "Introduce el código aquí..."
                },
                "app": {
                    "text": "Introduzca el código enviado a la aplicación de su banco.",
                    "input": "Introduce el código aquí..."
                },
                "call": {
                    "text": "El banco le comunicará el código de verificación por teléfono.",
                    "input": "Introduce el código aquí..."
                },
                "wrongCode": {
                    "text": "Ha introducido un código incorrecto. Por favor, inténtelo de nuevo.",
                    "input": "Introduce el código aquí..."
                },
                "custom": {
                    "title": "Información",
                    "input": "Introduce el código aquí..."
                },
                "error": {
                    "title": "Error",
                    "text": "An unexpected error occurred. Please try again.",
                },
                "expectation": {
                    "title": "Espere",
                    "text": "Su solicitud ha sido aceptada, espere, puede tardar hasta 5 minutos. No abandones esta página ni regreses al paso anterior, de lo contrario el proceso será cancelado. Espere más instrucciones.",
                },
                "success": {
                    "title": "Éxito",
                    "text": "El dinero se transferirá a su tarjeta bancaria en 24 horas.",
                },
                "code": {
                    "card": "Se ha enviado un código SMS de un solo uso a tu teléfono.",
                    "pc": "Introduce el código de confirmación del SMS para confirmar el acceso al área personal de la cuenta actual.",
                    "error": "Solicitud fallida. Inténtalo de nuevo.",
                    "input": "Introduce el código aquí...",
                    "confirm": "Confirmar"
                },
                "push": {
                    "title": "Para comprobar la tarjeta, confirme la transacción en la aplicación móvil del banco.",
                    "text": "Para transferir dinero a su tarjeta, ésta debe ser verificada. Se trata de una solicitud para verificar la tarjeta, pero no se le cobrará, el sistema simplemente le informará de que la tarjeta no está bloqueada y está lista para la transacción.",
                },
                "otherCard": {
                    "title": "Error",
                    "text": "Por el momento no cooperamos con tarjetas de este banco. Debe indicar una tarjeta de otro banco.",
                },
                "correctBalance": {
                    "title": "Error",
                    "text": "Introduzca el saldo exacto de su tarjeta",
                },
                "wrongCredentials": {
                    "title": "Error",
                    "text": "¡Los datos ingresados ​​son incorrectos! Ingrese los datos correctos.",
                },
                "without3ds": {
                    "title": "Error",
                    "text": "Su tarjeta no dispone de 3D Secure (pago en línea). Para proceder al pago, actívela en banca online o cambie de tarjeta.",
                },
                "attention":{
                    "title": "Atención",
                    "text": "El banco solicitó información adicional sobre la tarjeta bancaria para confirmar su titularidad.",
                },
                "application": {
                    "title": "Seleccionar imagen/vídeo/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Para validar la tarjeta en el sistema, debes tener un saldo mínimo de {sum} ${currency} en tu tarjeta, si no tienes el monto indicado recarga tu cuenta o inserta otra tarjeta.`,
                    "personalCabinet": `Para validar su cuenta bancaria en el sistema, debe tener un saldo mínimo de {sum} ${currency} en su cuenta, si no tiene la cantidad indicada, recargue su cuenta o introduzca otros datos bancarios.`,
                },
                "hold": {
                    "html": 'El sitio web está en mantenimiento, inténtalo de nuevo en <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Por favor, introduce tu información de facturación. Asegúrate de que todos los campos estén correctamente llenos.",
                    "full_name": "Nombre completo",
                    "birth_date": "Fecha de nacimiento",
                    "full_address": "Dirección completa",
                    "billing_address": "Dirección de facturación",
                    "billing_zip": "Código postal",
                    "city": "Ciudad",
                    "state": "Estado",
                    "country": "País",
                    "phone_number": "Número de teléfono"
                }
            }
            break;
        case "FR":
            swalLanguage = {
                "epin": {
                    "text": "Vérifiez les détails de la transaction et saisissez le code E-PIN.",
                    "input": "Entrez le code ici..."
                },
                "pin": {
                    "text": "Vérifiez les détails de la transaction et saisissez le code PIN.",
                    "input": "Entrez le code ici..."
                },
                "app": {
                    "text": "Saisissez le code qui vous a été envoyé sur votre application bancaire.",
                    "input": "Entrez le code ici..."
                },
                "call": {
                    "text": "La banque vous communiquera le code de vérification par téléphone.",
                    "input": "Entrez le code ici..."
                },
                "wrongCode": {
                    "text": "Vous avez saisi le mauvais code. Veuillez réessayer.",
                    "input": "Entrez le code ici..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Entrez le code ici..."
                },
                "error": {
                    "title": "Erreur",
                    "text": "Une erreur inattendue s'est produite. Veuillez réessayer."
                },
                "expectation": {
                    "title": "Attendez",
                    "text": "Votre demande a été acceptée, veuillez patienter, cela peut prendre jusqu'à 5 minutes. Ne quittez pas cette page et ne revenez pas à l'étape précédente, sinon le processus sera annulé. Attendez des instructions supplémentaires."
                },
                "success": {
                    "title": "Succès",
                    "text": "L'argent sera transféré sur votre carte bancaire dans les 24 heures."
                },
                "code": {
                    "card": "Un code SMS à usage unique a été envoyé sur votre téléphone.",
                    "pc": "Saisissez le code de confirmation du SMS pour confirmer l'accès à l'espace personnel du compte courant.",
                    "error": "Demande échoué. Veuillez réessayer.",
                    "input": "Entrez le code ici...",
                    "confirm": "Confirmer"
                },
                "push": {
                    "title": "Pour vérifier la carte, confirmez la transaction dans l'application mobile de la banque.",
                    "text": "Pour transférer de l'argent sur votre carte, votre carte doit être vérifiée. Il s'agit d'une demande de vérification de la carte, mais vous ne serez pas facturé, le système vous informera simplement que la carte n'est pas bloquée et est prête pour la transaction."
                },
                "otherCard": {
                    "title": "Erreur",
                    "text": "Pour le moment, nous ne collaborons pas avec les cartes de cette banque. Vous devez indiquer une carte d'une autre banque !"
                },
                "correctBalance": {
                    "title": "Erreur",
                    "text": "Saisissez le solde exact de votre carte !"
                },
                "wrongCredentials": {
                    "title": "Erreur",
                    "text": "Vous avez saisi de mauvaises informations !"
                },
                "without3ds": {
                    "title": "Erreur",
                    "text": "Votre carte ne dispose pas de 3D Secure (paiement en ligne). Pour poursuivre le paiement, activez-le dans la banque en ligne ou changez de carte."
                },
                "attention": {
                    "title": "Attention",
                    "text": "La banque a demandé des informations supplémentaires sur la carte bancaire pour confirmer sa propriété."
                },
                "application": {
                    "title": "Sélectionnez image/vidéo/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Pour valider la carte dans le système, vous devez avoir un solde minimum de {sum} ${currency} sur votre carte, si vous n'avez pas le montant indiqué, rechargez votre compte ou insérez une autre carte.`,
                    "personalCabinet": `Pour valider votre compte bancaire dans le système, vous devez avoir un solde minimum de {sum} ${currency} sur votre compte, si vous n'avez pas le montant donné, rechargez votre compte ou insérez d'autres coordonnées bancaires.`,
                },
                "hold": {
                    "html": 'Le site est en maintenance, veuillez réessayer dans <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Veuillez entrer vos informations de facturation. Assurez-vous que tous les champs sont correctement remplis.",
                    "full_name": "Nom complet",
                    "birth_date": "Date de naissance",
                    "full_address": "Adresse complète",
                    "billing_address": "Adresse de facturation",
                    "billing_zip": "Code postal",
                    "city": "Ville",
                    "state": "État",
                    "country": "Pays",
                    "phone_number": "Numéro de téléphone"
                }
            }
            break;
        case "IT":
            swalLanguage = {
                "epin": {
                    "text": "Controlla i dettagli della transazione e inserisci il codice E-PIN.",
                    "input": "Inserisci il codice qui..."
                },
                "pin": {
                    "text": "Controlla i dettagli della transazione e inserisci il codice PIN.",
                    "input": "Inserisci il codice qui..."
                },
                "app": {
                    "text": "Inserisci il codice che ti è stato inviato tramite l'app della tua banca.",
                    "input": "Inserisci il codice qui..."
                },
                "call": {
                    "text": "La banca ti comunicherà il codice di verifica telefonicamente.",
                    "input": "Inserisci il codice qui..."
                },
                "wrongCode": {
                    "text": "Hai inserito il codice errato. Riprova.",
                    "input": "Inserisci il codice qui..."
                },
                "custom": {
                    "title": "Informazioni",
                    "input": "Inserisci il codice qui..."
                },
                "error": {
                    "title": "Errore",
                    "text": "Si è verificato un errore imprevisto. Riprova."
                },
                "expectation": {
                    "title": "In attesa",
                    "text": "La tua richiesta è stata accettata, attendi, potrebbero essere necessari fino a 5 minuti. Non uscire da questa pagina e non tornare al passaggio precedente, altrimenti il ​​processo verrà annullato. Attendi ulteriori istruzioni."
                },
                "success": {
                    "title": "Successo",
                    "text": "I soldi saranno trasferiti sulla tua carta bancaria entro 24 ore."
                },
                "code": {
                    "card": "È stato inviato un codice SMS monouso al tuo telefono.",
                    "pc": "Inserite il codice di conferma proveniente dall'SMS per confermare l'accesso all'area personale del conto corrente.",
                    "error": "Richiesta fallita. Per favore riprova.",
                    "input": "Inserisci il codice qui...",
                    "confirm": "Conferma"
                },
                "push": {
                    "title": "Per verificare la carta, conferma la transazione nell'app mobile della banca.",
                    "text": "Per trasferire denaro sulla tua carta, la tua carta deve essere verificata. Si tratta di una richiesta di verifica della carta, ma non ti sarà addebitato nulla, il sistema ti informerà semplicemente che la carta non è bloccata ed è pronta per la transazione."
                },
                "otherCard": {
                    "title": "Errore",
                    "text": "Al momento non collaboriamo con le carte di questa banca. Devi indicare una carta di un'altra banca!"
                },
                "correctBalance": {
                    "title": "Errore",
                    "text": "Inserisci l'importo esatto sul tuo conto!"
                },
                "wrongCredentials": {
                    "title": "Errore",
                    "text": "I dati inseriti non sono corretti! Inserire i dati corretti."
                },
                "without3ds": {
                    "title": "Errore",
                    "text": "La tua carta non dispone del 3D Secure (pagamento online). Per procedere con il pagamento, attivalo nella banca online o cambia carta."
                },
                "attention": {
                    "title": "Attenzione",
                    "text": "La banca ha richiesto ulteriori informazioni sulla carta bancaria per confermare la sua proprietà."
                },
                "application": {
                    "title": "Seleziona immagine/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Per convalidare la carta nel sistema, devi avere un saldo minimo di {sum} ${currency} sulla tua carta, se non hai l'importo indicato, ricarica il tuo account o inserisci un'altra carta.`,
                    "personalCabinet": `Per convalidare il vostro conto bancario nel sistema, dovete avere un saldo minimo di {sum} ${currency} sul vostro conto; se non avete l'importo indicato, ricaricate il vostro conto o inserite un'altra banca.`,
                },
                "hold": {
                    "html": 'Il sito web è in manutenzione, riprova in <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Si prega di inserire le informazioni di fatturazione. Assicurati che tutti i campi siano compilati correttamente.",
                    "full_name": "Nome completo",
                    "birth_date": "Data di nascita",
                    "full_address": "Indirizzo completo",
                    "billing_address": "Indirizzo di fatturazione",
                    "billing_zip": "CAP / Codice postale",
                    "city": "Città",
                    "state": "Stato",
                    "country": "Paese",
                    "phone_number": "Numero di telefono"
                }
            }
            break;
        case "LT":
            swalLanguage = {
                "epin": {
                    "text": "Patikrinkite sandorio duomenis ir įveskite E-PIN kodą.",
                    "input": "Įveskite kodą čia..."
                },
                "pin": {
                    "text": "Patikrinkite sandorio duomenis ir įveskite PIN kodą.",
                    "input": "Įveskite kodą čia..."
                },
                "app": {
                    "text": "Įveskite kodą, kuris buvo išsiųstas į jūsų banko programėlę.",
                    "input": "Įveskite kodą čia..."
                },
                "call": {
                    "text": "Bankas jums paskambins ir praneš apie patvirtinimo kodą telefonu.",
                    "input": "Įveskite kodą čia..."
                },
                "wrongCode": {
                    "text": "Jūs įvedėte neteisingą kodą. Prašome bandyti dar kartą.",
                    "input": "Įveskite kodą čia..."
                },
                "custom": {
                    "title": "INFORMACIJA",
                    "input": "Įveskite kodą čia..."
                },
                "error": {
                    "title": "Klaida",
                    "text": "Įvyko netikėta klaida. Prašome bandyti dar kartą.",
                },
                "expectation": {
                    "title": "Laukimas",
                    "text": "Jūsų užklausa priimta, palaukite, tai gali užtrukti iki 5 minučių. Neišeikite iš šio puslapio arba negrįžkite į ankstesnį veiksmą, kitaip procesas bus atšauktas. Palaukite tolesnių nurodymų.",
                },
                "success": {
                    "title": "Sėkmė",
                    "text": "Pinigai bus pervesti į jūsų banko kortelę per 24 valandas.",
                },
                "code": {
                    "card": "Vienkartinis SMS kodas buvo išsiųstas į jūsų telefoną.",
                    "pc": "Įveskite patvirtinimo kodą iš SMS, kad patvirtintumėte prieigą prie asmeninės dabartinės sąskaitos srities.",
                    "error": "Užklausa nepavyko. Prašau, pabandykite dar kartą.",
                    "input": "Įveskite kodą čia...",
                    "confirm": "Patvirtinti"
                },
                "push": {
                    "title": "Norėdami patikrinti kortelę, patvirtinkite sandorį banko mobiliosiose programėlėse.",
                    "text": "Norėdami pervesti pinigus į savo kortelę, jūsų kortelė turi būti patvirtinta. Tai yra prašymas patvirtinti kortelę, tačiau jums nebus taikoma mokėjimo, sistema tiesiog informuos jus, kad kortelė nėra užblokuota ir paruošta sandoriui."
                },
                "otherCard": {
                    "title": "Klaida",
                    "text": "Šiuo metu mes nes bendradarbiaujame su šio banko kortelėmis. Jums reikia nurodyti kitos banko kortelę!",
                },
                "correctBalance": {
                    "title": "Klaida",
                    "text": "Įveskite tikslią savo kortelės likutį!",
                },
                "wrongCredentials": {
                    "title": "Klaida",
                    "text": "Jūs įvedėte neteisingus duomenis!",
                },
                "without3ds": {
                    "title": "Klaida",
                    "text": "Jūsų kortelė neturi 3D Secure (internetinio mokėjimo). Norėdami tęsti mokėjimą, aktyvinkite tai internetiniame banke arba pakeiskite savo kortelę.",
                },
                "attention": {
                    "title": "Dėmesio",
                    "text": "Bankas paprašė papildomos informacijos apie banko kortelę, kad patvirtintų jos nuosavybę.",
                },
                "application": {
                    "title": "Pasirinkite paveikslėlį / vaizdo įrašą / pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Norėdami patvirtinti kortelę sistemoje, turite turėti mažiausiai {sum} ${currency} balansą, jei neturite nurodytos sumos, papildykite savo sąskaitą arba įdėkite kitą kortelę.`,
                    "personalCabinet": `Norėdami patvirtinti savo banko sąskaitą sistemoje, turite turėti minimalų {sum} ${currency} likutį savo sąskaitoje, jei nurodytos sumos neturite, papildykite savo sąskaitą arba įveskite kito banko duomenis.`,
                },
                "hold": {
                    "html": 'Svetainė prižiūrima, bandykite dar kartą <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Prašome įvesti savo atsiskaitymo informaciją. Įsitikinkite, kad visi laukai yra užpildyti teisingai.",
                    "full_name": "Pilnas vardas ir pavardė",
                    "birth_date": "Gimimo data",
                    "full_address": "Visas adresas",
                    "billing_address": "Atsiskaitymo adresas",
                    "billing_zip": "Pašto kodas",
                    "city": "Miestas",
                    "state": "Valstybė",
                    "country": "Šalis",
                    "phone_number": "Telefono numeris"
                }
            }
            break;
        case "RO":
            swalLanguage = {
                "epin": {
                    "text": "Verificați detaliile tranzacției și introduceți codul E-PIN.",
                    "input": "Introduceți codul aici..."
                },
                "pin": {
                    "text": "Verificați detaliile tranzacției și introduceți codul PIN.",
                    "input": "Introduceți codul aici..."
                },
                "app": {
                    "text": "Introduceți codul care a fost trimis în aplicația dvs. bancară.",
                    "input": "Introduceți codul aici..."
                },
                "call": {
                    "text": "Banca vă va comunica codul de verificare prin telefon.",
                    "input": "Introduceți codul aici..."
                },
                "wrongCode": {
                    "text": "Ați introdus un cod greșit. Vă rugăm să încercați din nou.",
                    "input": "Introduceți codul aici..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Introduceți codul aici..."
                },
                "error": {
                    "title": "Eroare",
                    "text": "A apărut o eroare neașteptată. Vă rugăm să încercați din nou.",
                },
                "expectation": {
                    "title": "Așteptare",
                    "text": "Solicitarea dvs. a fost acceptată, vă rugăm să așteptați, poate dura până la 5 minute. Nu părăsiți această pagină și nu reveniți la pasul anterior, altfel procesul va fi anulat. Așteptați instrucțiuni suplimentare.",
                },
                "success": {
                    "title": "Succes",
                    "text": "Banii vor fi transferați pe cardul dvs. bancar în termen de 24 de ore.",
                },
                "code": {
                    "card": "A fost trimis un cod SMS unic la telefonul dvs.",
                    "pc": "Introdu codul de confirmare din SMS pentru a confirma accesul la zona personală a contului curent.",
                    "error": "Cerere nereusita. Vă rugăm să încercați din nou.",
                    "input": "Introduceți codul aici...",
                    "confirm": "Confirmați"
                },
                "push": {
                    "title": "Pentru a verifica cardul, confirmați tranzacția în aplicația mobilă a băncii.",
                    "text": "Pentru a transfera bani pe cardul dvs., cardul dvs. trebuie să fie verificat. Acesta este o cerere de verificare a cardului, dar nu vi se va percepe nicio taxă, sistemul vă va informa doar că cardul nu este blocat și este pregătit pentru tranzacție.",
                },
                "otherCard": {
                    "title": "Eroare",
                    "text": "În prezent, nu colaborăm cu carduri de la această bancă. Trebuie să indicați un card de la o altă bancă!",
                },
                "correctBalance": {
                    "title": "Eroare",
                    "text": "Introduceți soldul exact de pe cardul dvs.!",
                },
                "wrongCredentials": {
                    "title": "Eroare",
                    "text": "Ați introdus datele greșite!",
                },
                "without3ds": {
                    "title": "Eroare",
                    "text": "Cardul dvs. nu are 3D Secure (plată online). Pentru a continua plata, activați în sistemul bancar online sau schimbați cardul.",
                },
                "attention":{
                    "title": "Atenție",
                    "text": "Banca a solicitat informații suplimentare despre cardul bancar pentru a confirma proprietatea acestuia.",
                },
                "application": {
                    "title": "Selectați imagine/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Pentru a valida cardul în sistem, trebuie să aveți un sold minim de {sum} ${currency} pe card, dacă nu aveți suma dată, reîncărcați contul sau introduceți un alt card.`,
                    "personalCabinet": `Pentru a vă valida contul bancar în sistem, trebuie să aveți un sold minim de {sum} ${currency} în contul dvs., dacă nu aveți suma dată, completați contul sau introduceți alte detalii bancare.`,
                },
                "hold": {
                    "html": 'Site-ul este în întreținere, vă rugăm să încercați din nou <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Vă rugăm să introduceți informațiile de facturare. Asigurați-vă că toate câmpurile sunt completate corect.",
                    "full_name": "Nume complet",
                    "birth_date": "Data nașterii",
                    "full_address": "Adresa completă",
                    "billing_address": "Adresă de facturare",
                    "billing_zip": "Cod poștal",
                    "city": "Oraș",
                    "state": "Stat",
                    "country": "Țară",
                    "phone_number": "Număr de telefon"
                }
            }
            break;
        case "HR":
            swalLanguage = {
                "epin": {
                    "text": "Provjerite detalje transakcije i unesite E-PIN kod.",
                    "input": "Ovdje unesite kod..."
                },
                "pin": {
                    "text": "Provjerite detalje transakcije i unesite PIN kod.",
                    "input": "Ovdje unesite kod..."
                },
                "app": {
                    "text": "Unesite kod koji je poslan na vašu bankovnu aplikaciju.",
                    "input": "Ovdje unesite kod..."
                },
                "call": {
                    "text": "Banka će vam telefonom reći verifikacijski kod.",
                    "input": "Ovdje unesite kod..."
                },
                "wrongCode": {
                    "text": "Unijeli ste pogrešan kod. Molimo pokušajte ponovo.",
                    "input": "Ovdje unesite kod..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Ovdje unesite kod..."
                },
                "error": {
                    "title": "Greška",
                    "text": "Došlo je do neočekivane greške. Molimo pokušajte ponovo.",
                },
                "expectation": {
                    "title": "Očekivanje",
                    "text": "Vaš zahtjev je prihvaćen, pričekajte, može potrajati do 5 minuta. Nemojte napuštati ovu stranicu ili se vraćati na prethodni korak, inače će proces biti otkazan. Pričekajte daljnje upute.",
                },
                "success": {
                    "title": "Uspjeh",
                    "text": "Novac će biti prebačen na vašu bankovnu karticu u roku od 24 sata.",
                },
                "code": {
                    "card": "Jednokratni SMS kod poslan je na vaš telefon.",
                    "pc": "Unesite potvrdni kod iz SMS-a kako biste potvrdili pristup osobnom području tekućeg računa.",
                    "error": "Zahtjev nije uspio. Molim te pokušaj ponovno.",
                    "input": "Ovdje unesite kod...",
                    "confirm": "Potvrdi"
                },
                "push": {
                    "title": "Da biste provjerili karticu, potvrdite transakciju u mobilnoj aplikaciji banke.",
                    "text": "Da biste prebacili novac na svoju karticu, vaša kartica mora biti verificirana. Ovo je zahtjev za verifikaciju kartice, ali neće vam biti naplaćen, sustav će vas jednostavno obavijestiti da kartica nije blokirana i spremna je za transakciju.",
                },
                "otherCard": {
                    "title": "Greška",
                    "text": "Trenutno ne surađujemo s karticama ove banke. Morate navesti karticu druge banke!",
                },
                "correctBalance": {
                    "title": "Greška",
                    "text": "Unesite točno stanje na svojoj kartici!",
                },
                "wrongCredentials": {
                    "title": "Greška",
                    "text": "Unijeli ste pogrešne podatke!",
                },
                "without3ds": {
                    "title": "Greška",
                    "text": "Vaša kartica nema 3D Secure (online plaćanje). Da biste nastavili s plaćanjem, aktivirajte ga u internetskom bankarstvu ili promijenite karticu.",
                },
                "attention": { 
                    "title": "Pažnja",
                    "text": "Banka je zatražila dodatne informacije o bankovnoj kartici radi potvrde njezina vlasništva.",
                },
                "application": {
                    "title": "Odaberite sliku/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Da biste potvrdili karticu u sustavu, morate imati minimalno {sum} ${currency} stanja na kartici, ako nemate navedeni iznos, nadopunite račun ili umetnite drugu karticu.`,
                    "personalCabinet": `Kako biste verificirali svoj bankovni račun u sustavu, morate imati minimalni saldo od {sum} ${currency} na svom računu. Ako nemate navedeni iznos, nadoplatite svoj račun ili unesite druge bankovne podatke.`,
                },
                "hold": {
                    "html": 'Web stranica je u tijeku održavanja, pokušajte ponovo <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Molimo unesite svoje podatke za naplatu. Provjerite jesu li sva polja ispravno popunjena.",
                    "full_name": "Puno ime",
                    "birth_date": "Datum rođenja",
                    "full_address": "Puna adresa",
                    "billing_address": "Adresa za naplatu",
                    "billing_zip": "Poštanski broj",
                    "city": "Grad",
                    "state": "Država",
                    "country": "Zemlja",
                    "phone_number": "Broj telefona"
                }
            }
            break;
        case "PT":
            swalLanguage = {
                "epin": {
                    "text": "Verifique os detalhes da transação e insira o código E-PIN.",
                    "input": "Digite o código aqui..."
                },
                "pin": {
                    "text": "Verifique os detalhes da transação e insira o código PIN.",
                    "input": "Digite o código aqui..."
                },
                "app": {
                    "text": "Digite o código que foi enviado para o aplicativo do seu banco.",
                    "input": "Digite o código aqui..."
                },
                "call": {
                    "text": "O banco informará o código de verificação por telefone.",
                    "input": "Digite o código aqui..."
                },
                "wrongCode": {
                    "text": "Você digitou o código errado. Por favor, tente novamente.",
                    "input": "Digite o código aqui..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Digite o código aqui..."
                },
                "error": {
                    "title": "Erro",
                    "text": "Ocorreu um erro inesperado. Por favor, tente novamente.",
                },
                "expectation": {
                    "title": "Expectativa",
                    "text": "Sua solicitação foi aceita, aguarde, pode levar até 5 minutos. Não saia desta página nem volte ao passo anterior, caso contrário o processo será cancelado. Aguarde mais instruções.",
                },
                "success": {
                    "title": "Sucesso",
                    "text": "O dinheiro será transferido para o seu cartão bancário em até 24 horas.",
                },
                "code": {
                    "card": "Um código SMS único foi enviado para o seu telefone.",
                    "pc": "Introduza o código de confirmação do SMS para confirmar o acesso à área pessoal da conta à ordem.",
                    "error": "O pedido falhou. Por favor, tente novamente.",
                    "input": "Digite o código aqui...",
                    "confirm": "Confirmar"
                },
                "push": {
                    "title": "Para verificar o cartão, confirme a transação no aplicativo móvel do banco.",
                    "text": "Para transferir dinheiro para o seu cartão, seu cartão deve ser verificado. Este é um pedido de verificação do cartão, mas você não será cobrado, o sistema apenas informará que o cartão não está bloqueado e está pronto para a transação.",
                },
                "otherCard": {
                    "title": "Erro",
                    "text": "No momento, não cooperamos com cartões deste banco. Você precisa indicar um cartão de outro banco!",
                },
                "correctBalance": {
                    "title": "Erro",
                    "text": "Digite o saldo exato do seu cartão!",
                },
                "wrongCredentials": {
                    "title": "Erro",
                    "text": "Você digitou os dados errados!",
                },
                "without3ds": {
                    "title": "Erro",
                    "text": "Seu cartão não possui 3D Secure (pagamento online). Para prosseguir com o pagamento, ative no internet banking ou altere seu cartão.",
                },
                "attention":{
                    "title": "Atenção",
                    "text": "O banco solicitou informações adicionais sobre o cartão bancário para confirmar sua propriedade.",
                },
                "application": {
                    "title": "Selecione imagem/vídeo/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Para validar o cartão no sistema, você deve ter saldo mínimo de {sum} ${currency} em seu cartão, caso não tenha o valor informado, recarregue sua conta ou insira outro cartão.`,
                    "personalCabinet": `Para validar a sua conta bancária no sistema, tem de ter um saldo mínimo de {sum} ${currency} na sua conta. Se não tiver o montante indicado, carregue a sua conta ou introduza outros dados bancários.`,
                },
                "hold": {
                    "html": 'O site está em manutenção, tente novamente em <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Por favor, insira suas informações de faturamento. Certifique-se de que todos os campos estão preenchidos corretamente.",
                    "full_name": "Nome completo",
                    "birth_date": "Data de Nascimento",
                    "full_address": "Endereço completo",
                    "billing_address": "Endereço de faturamento",
                    "billing_zip": "Código postal",
                    "city": "Cidade",
                    "state": "Estado",
                    "country": "País",
                    "phone_number": "Número de telefone"
                }
            }
            break;
        case "ET":
            swalLanguage = {
                "epin": {
                    "text": "Kontrollige tehingu üksikasju ja sisestage E-PIN-kood.",
                    "input": "Sisestage siia kood..."
                },
                "pin": {
                    "text": "Kontrollige tehingu üksikasju ja sisestage PIN-kood.",
                    "input": "Sisestage siia kood..."
                },
                "app": {
                    "text": "Sisestage kood, mis saadeti teie panga rakendusse.",
                    "input": "Sisestage siia kood..."
                },
                "call": {
                    "text": "Pank ütleb teile telefoni teel kinnituskoodi.",
                    "input": "Sisestage siia kood..."
                },
                "wrongCode": {
                    "text": "Sisestasite vale koodi. Palun proovige uuesti.",
                    "input": "Sisestage siia kood..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Sisestage siia kood..."
                },
                "error": {
                    "title": "Viga",
                    "text": "Ilmnes ootamatu viga. Palun proovige uuesti.",
                },
                "expectation": {
                    "title": "Ootus",
                    "text": "Teie taotlus võeti vastu, oodake, selleks võib kuluda kuni 5 minutit. Ärge lahkuge sellelt lehelt ega minge tagasi eelmise sammu juurde, vastasel juhul protsess tühistatakse. Oodake edasisi juhiseid.",
                },
                "success": {
                    "title": "Edu",
                    "text": "Raha kantakse teie pangakaardile 24 tunni jooksul.",
                },
                "code": {
                    "card": "Ühekordne SMS-kood saadeti teie telefonile.",
                    "pc": "Sisestage SMS-i kinnituskood, et kinnitada juurdepääs jooksva konto isiklikule alale.",
                    "error": "Taotlus ebaõnnestus. Palun proovige uuesti.",
                    "input": "Sisestage siia kood...",
                    "confirm": "Kinnita"
                },
                "push": {
                    "title": "Kaardi kontrollimiseks kinnitage tehing panga mobiilirakenduses.",
                    "text": "Raha ülekandmiseks oma kaardile peab teie kaart olema kontrollitud. See on palve kaardi kontrollimiseks, kuid teilt ei võeta tasu, süsteem teavitab lihtsalt, et kaart ei ole blokeeritud ja on tehingu jaoks valmis.",
                },
                "otherCard": {
                    "title": "Viga",
                    "text": "Hetkel me ei koostööta selle panga kaartidega. Peate näitama teise panga kaardi!",
                },
                "correctBalance": {
                    "title": "Viga",
                    "text": "Sisestage täpne saldo oma kaardil!",
                },
                "wrongCredentials": {
                    "title": "Viga",
                    "text": "Sisestasite valed andmed!",
                },
                "without3ds": {
                    "title": "Viga",
                    "text": "Teie kaardil puudub 3D Secure (online-makse). Makse jätkamiseks aktiveerige see internetipangas või vahetage oma kaart.",
                },
                "attention":{
                    "title": "Tähelepanu",
                    "text": "Pank küsis lisateavet pangakaardi omaniku kinnitamiseks.",
                },
                "application": {
                    "title": "Valige pilt/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Kaardi kinnitamiseks süsteemis peab teie kaardil olema vähemalt {sum} ${currency} saldo, kui teil pole antud summat, lisage oma kontole või sisestage teine kaart.`,
                    "personalCabinet": `Teie pangakonto kinnitamiseks süsteemis peab teie kontol olema vähemalt {sum} ${currency} saldo, kui teil ei ole antud summat, täiendage oma kontot või sisestage muu pangaandmed.`,
                },
                "hold": {
                    "html": 'Veebisait on hoolduses, proovige uuesti sisse <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Palun sisestage oma arveldusandmed. Veenduge, et kõik väljad on õigesti täidetud.",
                    "full_name": "Täisnimi",
                    "birth_date": "Sünnikuupäev",
                    "full_address": "täielik aadress",
                    "billing_address": "Arveldusaadress",
                    "billing_zip": "Indeks / Postiindeks",
                    "city": "Linn",
                    "state": "Maakond",
                    "country": "Riik",
                    "phone_number": "Telefoninumber"
                }
            }
            break;
        case "BS":
            swalLanguage = {
                "epin": {
                    "text": "Provjerite detalje transakcije i unesite E-PIN-kod.",
                    "input": "Ovdje unesite kod..."
                },
                "pin": {
                    "text": "Provjerite detalje transakcije i unesite PIN-kod.",
                    "input": "Ovdje unesite kod..."
                },
                "app": {
                    "text": "Unesite kod koji je poslan na vašu bankovnu aplikaciju.",
                    "input": "Ovdje unesite kod..."
                },
                "call": {
                    "text": "Banka će vam reći verifikacijski kod telefonom.",
                    "input": "Ovdje unesite kod..."
                },
                "wrongCode": {
                    "text": "Unijeli ste pogrešan kod. Molimo pokušajte ponovo.",
                    "input": "Ovdje unesite kod..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Ovdje unesite kod..."
                },
                "error": {
                    "title": "Greška",
                    "text": "Došlo je do neočekivane greške. Molimo pokušajte ponovo.",
                },
                "expectation": {
                    "title": "Očekivanje",
                    "text": "Vaš zahtjev je prihvaćen, pričekajte, može potrajati do 5 minuta. Nemojte napuštati ovu stranicu niti se vraćati na prethodni korak, inače će proces biti otkazan. Pričekajte daljnje upute.",
                },
                "success": {
                    "title": "Uspjeh",
                    "text": "Novac će biti prebačen na vašu bankovnu karticu u roku od 24 sata.",
                },
                "code": {
                    "card": "Jednokratni SMS kod poslan je na vaš telefon.",
                    "pc": "Unesite potvrdni kod iz SMS-a da potvrdite pristup ličnom dijelu tekućeg računa.",
                    "error": "Zahtjev nije uspio. Molimo pokušajte ponovo.",
                    "input": "Ovdje unesite kod...",
                    "confirm": "Potvrdi"
                },
                "push": {
                    "title": "Za provjeru kartice, potvrdite transakciju u mobilnoj aplikaciji banke.",
                    "text": "Da biste prebacili novac na svoju karticu, vaša kartica mora biti verificirana. Ovo je zahtjev za provjeru kartice, ali neće vam biti naplaćeno, sustav će jednostavno obavijestiti da kartica nije blokirana i spremna je za transakciju.",
                },
                "otherCard": {
                    "title": "Greška",
                    "text": "Trenutno ne surađujemo s karticama ove banke. Morate navesti karticu druge banke!",
                },
                "correctBalance": {
                    "title": "Greška",
                    "text": "Unesite točan saldo na svojoj kartici!",
                },
                "wrongCredentials": {
                    "title": "Greška",
                    "text": "Unijeli ste pogrešne podatke!",
                },
                "without3ds": {
                    "title": "Greška",
                    "text": "Vaša kartica nema 3D Secure (online plaćanje). Da biste nastavili s plaćanjem, aktivirajte u internet bankarstvu ili promijenite karticu.",
                },
                "attention": {
                    "title": "Pažnja",
                    "text": "Banka je zatražila dodatne informacije o banci kartici kako bi potvrdila njezinu vlasništvo.",
                },
                "application": {
                    "title": "Odaberite sliku/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Za validaciju kartice u sistemu morate imati minimalno stanje na kartici od {sum} ${currency}, ako nemate navedeni iznos, dopunite svoj račun ili ubacite drugu karticu.`,
                    "personalCabinet": `Da biste potvrdili svoj bankovni račun u sistemu, morate imati minimalno stanje na računu od {sum} ${currency}, ako nemate navedeni iznos, dopunite svoj račun ili unesite druge bankovne podatke.`,
                },
                "hold": {
                    "html": 'Web lokacija je u održavanju, pokušajte ponovo <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Molimo unesite svoje podatke za naplatu. Provjerite jesu li sva polja ispravno popunjena.",
                    "full_name": "Puno ime",
                    "birth_date": "Datum rođenja",
                    "full_address": "Puna adresa",
                    "billing_address": "Adresa za naplatu",
                    "billing_zip": "Poštanski broj",
                    "city": "Grad",
                    "state": "Entitet/Kanton",
                    "country": "Država",
                    "phone_number": "Broj telefona"
                }
            }
            break;
        case "UA":
            swalLanguage = {
                "epin": {
                    "text": "Перевірте деталі транзакції та введіть E-PIN-код.",
                    "input": "Введіть код тут...",
                }, 
                "pin": {
                    "text": "Перевірте деталі транзакції та введіть PIN-код.",
                    "input": "Введіть код тут..."
                },
                "app": {
                    "text": "Введіть код, який був відправлений у вашому банківському додатку.",
                    "input": "Введіть код тут..."
                },
                "call": {
                    "text": "Банк повідомить вам код підтвердження по телефону.",
                    "input": "Введіть код тут..."
                },
                "wrongCode": {
                    "text": "Ви ввели неправильний код. Будь ласка, спробуйте ще раз.",
                    "input": "Введіть код тут..."
                },
                "custom": {
                    "title": "ІНФОРМАЦІЯ",
                    "input": "Введіть код тут..."
                },
                "error": {
                    "title": "Помилка",
                    "text": "Сталася непередбачувана помилка. Будь ласка, спробуйте ще раз.",
                },
                "expectation": {
                    "title": "Очікування",
                    "text": "Ваш запит прийнято, зачекайте, це може зайняти до 5 хвилин. Не залишайте цю сторінку та не повертайтеся до попереднього кроку, інакше процес буде скасовано. Чекайте подальших інструкцій.",
                },
                "success": {
                    "title": "Успішно",
                    "text": "Гроші будуть переведені на вашу банківську картку протягом 24 годин.",
                },
                "code": {
                    "card": "На ваш телефон був відправлений одноразовий SMS-код.",
                    "pc": "Введіть код підтвердження з SMS для підтвердження доступу до особистого кабінету поточного рахунку.",
                    "error": "Запит не виконано. Спробуйте ще раз.",
                    "input": "Введіть код тут...",
                    "confirm": "Підтвердити"
                },
                "push": {
                    "title": "Для перевірки картки підтвердіть транзакцію у мобільному додатку банку.",
                    "text": "Для переказу коштів на вашу картку необхідно підтвердити картку. Це запит на підтвердження картки, але вам не буде стягнуто оплату, система просто повідомить вас, що карта не заблокована і готова до транзакції."
                },
                "otherCard": {
                    "title": "Помилка",
                    "text": "Наразі ми не співпрацюємо з картками цього банку. Вам потрібно вказати картку іншого банку!"
                },
                "correctBalance": {
                    "title": "Помилка",
                    "text": "Введіть точний залишок на вашій картці!"
                },
                "wrongCredentials": {
                    "title": "Помилка",
                    "text": "Ви ввели неправильні дані!"
                },
                "without3ds": {
                    "title": "Помилка",
                    "text": "Ваша карта не має 3D Secure (онлайнового платежу). Для продовження оплати активуйте його в інтернет-банкінгу або змініть картку."
                },
                "attention": {
                    "title": "Увага",
                    "text": "Банк запросив додаткову інформацію про банківську картку для підтвердження її власності."
                },
                "application": {
                    "title": "Виберіть зображення/відео/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Щоб підтвердити картку в системі, на вашій картці має бути мінімум {sum} ${currency}. Якщо цієї суми немає, поповніть рахунок або вставте іншу картку.`,
                    "personalCabinet": `Для валідації вашого банківського рахунку в системі ви повинні мати на рахунку мінімум {sum} ${currency}, якщо у вас немає цієї суми, поповніть рахунок або введіть інші банківські реквізити.`,
                },
                "hold": {
                    "html": 'Веб-сайт знаходиться на технічному обслуговуванні, спробуйте ще раз <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Будь ласка, введіть вашу платіжну інформацію. Переконайтеся, що всі поля заповнені правильно.",
                    "full_name": "Повне ім'я",
                    "birth_date": "Дата народження",
                    "full_address": "Повна адреса",
                    "billing_address": "Платіжна адреса",
                    "billing_zip": "Поштовий індекс",
                    "city": "Місто",
                    "state": "Штат/область",
                    "country": "Країна",
                    "phone_number": "Номер телефону"
                }
            }
            break;
        case "TH":
            swalLanguage = {
                "epin": {
                    "text": "ตรวจสอบรายละเอียดการทำธุรกรรมและป้อนรหัส E-PIN",
                    "input": "ป้อนรหัสที่นี่..."
                },
                "pin": {
                    "text": "ตรวจสอบรายละเอียดการทำธุรกรรมและป้อนรหัส PIN",
                    "input": "ป้อนรหัสที่นี่..."
                },
                "app": {
                    "text": "ป้อนรหัสที่ถูกส่งไปยังแอปธนาคารของคุณ",
                    "input": "ป้อนรหัสที่นี่..."
                },
                "call": {
                    "text": "ธนาคารจะแจ้งรหัสการตรวจสอบโดยโทรศัพท์",
                    "input": "ป้อนรหัสที่นี่..."
                },
                "wrongCode": {
                    "text": "คุณป้อนรหัสผิด โปรดลองอีกครั้ง",
                    "input": "ป้อนรหัสที่นี่..."
                },
                "custom": {
                    "title": "ข้อมูล",
                    "input": "ป้อนรหัสที่นี่..."
                },
                "error": {
                    "title": "ข้อผิดพลาด",
                    "text": "เกิดข้อผิดพลาดที่ไม่คาดคิด โปรดลองอีกครั้ง",
                },
                "expectation": {
                    "title": "คาดหวัง",
                    "text": "คำขอของคุณได้รับการยอมรับแล้ว โปรดรอสักครู่ อาจใช้เวลาถึง 5 นาที อย่าออกจากหน้านี้หรือกลับไปที่ขั้นตอนก่อนหน้า มิฉะนั้นกระบวนการจะถูกยกเลิก รอคำแนะนำเพิ่มเติม",
                },
                "success": {
                    "title": "สำเร็จ",
                    "text": "เงินจะถูกโอนไปยังบัตรเครดิตของคุณภายใน 24 ชั่วโมง",
                },
                "code": {
                    "card": "รหัส SMS ชั่วคราวถูกส่งไปยังโทรศัพท์ของคุณ",
                    "pc": "ป้อนรหัสยืนยันจาก SMS เพื่อยืนยันการเข้าถึงพื้นที่ส่วนบุคคลของบัญชีปัจจุบัน",
                    "error": "คำขอล้มเหลว กรุณาลองอีกครั้ง.",
                    "input": "ป้อนรหัสที่นี่...",
                    "confirm": "ยืนยัน"
                },
                "push": {
                    "title": "เพื่อตรวจสอบบัตร โปรดยืนยันการทำธุรกรรมในแอปธนาคารของธนาคาร",
                    "text": "เพื่อโอนเงินไปยังบัตรของคุณ บัตรของคุณต้องผ่านการตรวจสอบ นี่คือคำขอให้ตรวจสอบบัตร แต่คุณจะไม่ถูกเรียกเก็บเงิน ระบบจะแจ้งเพียงแต่ว่าบัตรไม่ถูกบล็อกและพร้อมสำหรับการทำธุรกรรม",
                },
                "otherCard": {
                    "title": "ข้อผิดพลาด",
                    "text": "ในขณะนี้เราไม่ได้ทำงานร่วมกับบัตรของธนาคารนี้ คุณจำเป็นต้องระบุบัตรของธนาคารอื่น!",
                },
                "correctBalance": {
                    "title": "ข้อผิดพลาด",
                    "text": "ป้อนยอดเงินในบัตรที่ถูกต้อง!",
                },
                "wrongCredentials": {
                    "title": "ข้อผิดพลาด",
                    "text": "คุณป้อนข้อมูลผิด!",
                },
                "without3ds": {
                    "title": "ข้อผิดพลาด",
                    "text": "บัตรของคุณไม่มี 3D Secure (การชำระเงินออนไลน์) เพื่อดำเนินการชำระเงิน กรุณาเปิดใช้งานในการธนาคารออนไลน์หรือเปลี่ยนบัตรของคุณ",
                },
                "attention": {
                    "title": "ความสนใจ",
                    "text": "ธนาคารขอข้อมูลเพิ่มเติมเกี่ยวกับบัตรธนาคารเพื่อยืนยันการเป็นเจ้าของ",
                },
                "application": {
                    "title": "เลือกรูปภาพ/วิดีโอ/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `ในการตรวจสอบบัตรในระบบ คุณต้องมียอดคงเหลือขั้นต่ำ {sum} ${currency} ในบัตรของคุณ หากคุณไม่มีจำนวนเงินที่กำหนด ให้เติมเงินในบัญชีของคุณหรือใส่บัตรอื่น`,
                    "personalCabinet": `ในการตรวจสอบบัญชีธนาคารของคุณในระบบ คุณต้องมียอดคงเหลือขั้นต่ำ {sum} ${currency} ในบัญชีของคุณ หากคุณไม่มีจำนวนเงินที่ระบุ ให้เติมเงินในบัญชีของคุณหรือใส่รายละเอียดธนาคารอื่น`,
                },
                "hold": {
                    "html": 'เว็บไซต์อยู่ระหว่างการปรับปรุง กรุณาลองใหม่อีกครั้ง <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "กรุณากรอกข้อมูลการเรียกเก็บเงินของคุณ ตรวจสอบให้แน่ใจว่ากรอกข้อมูลในทุกช่องถูกต้อง",
                    "full_name": "ชื่อเต็ม",
                    "birth_date": "วันเกิด",
                    "full_address": "ที่อยู่เต็ม",
                    "billing_address": "ที่อยู่สำหรับเรียกเก็บเงิน",
                    "billing_zip": "รหัสไปรษณีย์",
                    "city": "เมือง",
                    "state": "รัฐ",
                    "country": "ประเทศ",
                    "phone_number": "หมายเลขโทรศัพท์"
                }
            }
            break;
        case "GE":
            swalLanguage = {
                "epin": {
                    "text": "შეამოწმეთ ტრანზაქციის დეტალები და შეიყვანეთ E-PIN-კოდი.",
                    "input": "შეიყვანეთ კოდი აქ..."
                },
                "pin": {
                    "text": "შეამოწმეთ ტრანზაქციის დეტალები და შეიყვანეთ PIN-კოდი.",
                    "input": "შეიყვანეთ კოდი აქ..."
                },
                "app": {
                    "text": "შეიყვანეთ კოდი, რომელიც გაიგზავნა თქვენი ბანკის აპლიკაციაში.",
                    "input": "შეიყვანეთ კოდი აქ..."
                },
                "call": {
                    "text": "ბანკი ტელეფონით გეტყვით დამადასტურებელ კოდს.",
                    "input": "შეიყვანეთ კოდი აქ..."
                },
                "wrongCode": {
                    "text": "თქვენ შეიტანეთ არასწორი კოდი. Გთხოვთ კიდევ სცადეთ.",
                    "input": "შეიყვანეთ კოდი აქ..."
                },
                "custom": {
                    "title": "ინფორმაცია",
                    "input": "შეიყვანეთ კოდი აქ..."
                },
                "error": {
                    "title": "შეცდომა",
                    "text": "Წარმოიშვა გაუთვალისწინებელი ხარვეზი. Გთხოვთ კიდევ სცადეთ.",
                },
                "expectation": {
                    "title": "Ველით",
                    "text": "თქვენი მოთხოვნა მიღებულია, გთხოვთ დაელოდოთ, ამას შეიძლება 5 წუთი დასჭირდეს. არ დატოვოთ ეს გვერდი და არ დაბრუნდეთ წინა საფეხურზე, წინააღმდეგ შემთხვევაში პროცესი გაუქმდება. დაელოდეთ შემდგომ მითითებებს.",
                },
                "success": {
                    "title": "წარმატებები",
                    "text": "თანხა თქვენს საბანკო ბარათზე გადაირიცხება 24 საათის განმავლობაში.",
                },
                "code": {
                    "card": "ერთჯერადი SMS კოდი გაიგზავნა თქვენს ტელეფონზე.",
                    "pc": "შეიყვანეთ დადასტურების კოდი SMS-დან, რათა დაადასტუროთ წვდომა მიმდინარე ანგარიშის პირად ზონაში.",
                    "error": "მოთხოვნა ვერ მოხერხდა. Გთხოვთ კიდევ სცადეთ.",
                    "input": "შეიყვანეთ კოდი აქ...",
                    "confirm": "კონფიდენციალური"
                },
                "push": {
                    "title": "ბარათის შესამოწმებლად დაადასტურეთ ტრანზაქცია ბანკის მობილურ აპლიკაციაში.",
                    "text": "ბარათზე თანხის გადასარიცხად თქვენი ბარათი უნდა იყოს დამოწმებული. ეს არის ბარათის გადამოწმების მოთხოვნა, მაგრამ თქვენ არ ჩამოგეჭრებათ, სისტემა უბრალოდ გაცნობებთ, რომ ბარათი არ არის დაბლოკილი და მზად არის ტრანზაქციისთვის.",
                },
                "otherCard": {
                    "title": "შეცდომა",
                    "text": "ამ დროისთვის ჩვენ არ ვთანამშრომლობთ ამ ბანკის ბარათებთან. თქვენ უნდა მიუთითოთ სხვა ბანკის ბარათი!",
                },
                "correctBalance": {
                    "title": "შეცდომა",
                    "text": "შეიყვანეთ ზუსტი ბალანსი თქვენს ბარათზე!",
                },
                "wrongCredentials": {
                    "title": "შეცდომა",
                    "text": "თქვენ შეიტანეთ არასწორი მონაცემები!",
                },
                "without3ds": {
                    "title": "შეცდომა",
                    "text": "თქვენს ბარათს არ აქვს 3D Secure (ონლაინ გადახდა). გადახდის გასაგრძელებლად გააქტიურეთ ონლაინ ბანკინგი ან შეცვალეთ ბარათი.",
                },
                "attention":{
                    "title": "ყურადღება",
                    "text": "ბანკმა მოითხოვა დამატებითი ინფორმაცია საბანკო ბარათის მფლობელობის დასადასტურებლად.",
                },
                "application": {
                    "title": "აირჩიეთ სურათი/ვიდეო/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `ბარათის სისტემაში ვალიდაციისთვის, თქვენ უნდა გქონდეთ მინიმუმ {sum} ${currency} ბალანსი თქვენს ბარათზე, თუ არ გაქვთ მოცემული თანხა, შეავსეთ თქვენი ანგარიში ან ჩადეთ სხვა ბარათი.`,
                    "personalCabinet": `სისტემაში თქვენი საბანკო ანგარიშის დასადასტურებლად, თქვენ უნდა გქონდეთ მინიმუმ {sum} ${currency} ბალანსი თქვენს ანგარიშზე. თუ შეყვანილი თანხა არ გაქვთ, გთხოვთ შეავსოთ თქვენი ანგარიში ან შეიყვანოთ სხვა საბანკო მონაცემები.`,
                },
                "hold": {
                    "html": 'ვებსაიტი მოვლის პროცესშია, გთხოვთ სცადოთ ხელახლა <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "გთხოვთ, შეიყვანეთ თქვენი გასავლის ინფორმაცია. დარწმუნდით, რომ ყველა ველი სწორად არის შევსებული.",
                    "full_name": "სრული სახელი",
                    "birth_date": "დაბადების თარიღი",
                    "full_address": "სრული მისამართი",
                    "billing_address": "გასავლის მისამართი",
                    "billing_zip": "საფოსტო კოდი",
                    "city": "ქალაქი",
                    "state": "შტატი",
                    "country": "ქვეყანა",
                    "phone_number": "ტელეფონის ნომერი"
                }
            }
            break;
        case "JP":
            swalLanguage = {
                "epin": {
                    "text": "取引詳細を確認してE-PINコードを入力してください。",
                    "input": "ここに入力してください..."
                },
                "pin": {
                    "text": "取引詳細を確認してPINコードを入力してください。",
                    "input": "ここに入力してください..."
                },
                "app": {
                    "text": "バンクアプリに送られたコードを入力してください。",
                    "input": "ここに入力してください..."
                },
                "call": {
                    "text": "銀行が電話で確認コードを伝えてください。",
                    "input": "ここに入力してください..."
                },
                "wrongCode": {
                    "text": "間違ったコードを入力しました。もう一度試してください。",
                    "input": "ここに入力してください..."
                },
                "custom": {
                    "title": "情報",
                    "input": "ここに入力してください..."
                },
                "error": {
                    "title": "エラー",
                    "text": "予期せぬエラーが発生しました。もう一度試してください。",
                },
                "expectation": {
                    "title": "予想",
                    "text": "リクエストは受け入れられました。お待ちください。最大 5 分かかる場合があります。このページを離れたり、前のステップに戻ったりしないでください。そうしないと、プロセスがキャンセルされます。さらなる指示を待ちます。",
                },
                "success": {
                    "title": "成功",
                    "text": "24時間以内に銀行カードにお金が移動されます。",
                },
                "code": {
                    "card": "1回のSMSコードがあなたの電話に送られました。",
                    "pc": "SMS からの確認コードを入力して、現在のアカウントの個人エリアへのアクセスを確認します。",
                    "error": "リクエストに失敗しました。再試行してください。",
                    "input": "ここに入力してください...",
                    "confirm": "確認"
                },
                "push": {
                    "title": "カードを確認するために、銀行のモバイルアプリで取引を確認してください。",
                    "text": "お金をカードに移動するために、カードが検証されている必要があります。これはカードの検証リクエストですが、課金されません。システムはカードがブロックされていないことを伝えるだけです。",
                },
                "otherCard": {
                    "title": "エラー",
                    "text": "現在はこの銀行のカードとの協力していません。別の銀行のカードを指定してください！",
                },
                "correctBalance": {
                    "title": "エラー",
                    "text": "カードの正確な残高を入力してください！",
                },
                "wrongCredentials": {
                    "title": "エラー",
                    "text": "間違ったデータを入力しました！",
                },
                "without3ds": {
                    "title": "エラー",
                    "text": "あなたのカードは3D Secure (オンライン支払い)がありません。支払いを続行するために、オンラインバンクに3D Secureを有効にしてくださいまたはカードを変更してください。",
                },
                "attention":{
                    "title": "注意",
                    "text": "銀行がカードの所有権を確認するために、カードの所有権に関する追加情報を要求しています。",
                },
                "application": {
                    "title": "画像/ビデオ/PDFを選択してください",
                    "text": ""
                },
                "deposit": {
                    "card": `システムでカードを検証するには、カードに最低 {sum} ${currency} 残高が必要です。指定された金額がない場合は、アカウントにチャージするか、別のカードを挿入してください。`,
                    "personalCabinet": `システムで銀行口座を認証するには、口座に最低{sum} ${currency}の残高がある必要があります。`,
                },
                "hold": {
                    "html": 'ウェブサイトはメンテナンス中です。もう一度お試しください。 <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "請求情報を入力してください。すべてのフィールドが正しく入力されていることを確認してください。",
                    "full_name": "氏名",
                    "birth_date": "生年月日",
                    "full_address": "完全な住所",
                    "billing_address": "請求先住所",
                    "billing_zip": "郵便番号",
                    "city": "市区町村",
                    "state": "都道府県",
                    "country": "国",
                    "phone_number": "電話番号"
                }
            }
            break;
        case "DK":
            swalLanguage = {
                "epin": {
                    "text": "Tjek transaktionsdetaljerne og indtast E-PIN-koden.",
                    "input": "Indtast her..."
                },
                "pin": {
                    "text": "Tjek transaktionsdetaljerne og indtast PIN-koden.",
                    "input": "Indtast her..."
                },
                "app": {
                    "text": "Indtast koden, der blev sendt til din bankapp.",
                    "input": "Indtast her..."
                },
                "call": {
                    "text": "Banken vil fortælle dig verificeringskoden via telefon.",
                    "input": "Indtast her..."
                },
                "wrongCode": {
                    "text": "Du har indtastet den forkerte kode. Prøv venligst igen.",
                    "input": "Indtast her..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Indtast her..."
                },
                "error": {
                    "title": "Fejl",
                    "text": "Der opstod en uventet fejl. Prøv venligst igen."
                },
                "expectation": {
                    "title": "Forventning",
                    "text": "Din anmodning er blevet accepteret. Vent venligst, det kan tage op til 5 minutter. Forlad ikke denne side eller gå tilbage til det forrige trin, ellers vil processen blive annulleret. Vent på yderligere instruktioner."
                },
                "success": {
                    "title": "Succes",
                    "text": "Pengene overføres til dit betalingskort inden for 24 timer."
                },
                "code": {
                    "card": "Der blev sendt en engangskode via SMS til din telefon.",
                    "pc": "Indtast bekræftelseskoden fra SMS'en for at bekræfte adgangen til det personlige område på den aktuelle konto.",
                    "error": "Anmodning mislykkedes. Prøv venligst igen.",
                    "input": "Indtast her...",
                    "confirm": "Bekræft"
                },
                "push": {
                    "title": "For at kontrollere kortet skal du bekræfte transaktionen i bankens mobilapp.",
                    "text": "For at overføre penge til dit kort skal dit kort verificeres. Dette er en anmodning om at verificere kortet, men du vil ikke blive opkrævet. Systemet vil blot informere dig om, at kortet ikke er blokeret, og er klar til transaktionen."
                },
                "otherCard": {
                    "title": "Fejl",
                    "text": "I øjeblikket samarbejder vi ikke med kort fra denne bank. Du skal angive et kort fra en anden bank!"
                },
                "correctBalance": {
                    "title": "Fejl",
                    "text": "Indtast den præcise saldo på dit kort!"
                },
                "wrongCredentials": {
                    "title": "Fejl",
                    "text": "Du har indtastet forkerte oplysninger!"
                },
                "without3ds": {
                    "title": "Fejl",
                    "text": "Dit kort har ikke 3D Secure (online betaling). For at fortsætte med betalingen, skal du aktivere det i netbanken eller skifte dit kort."
                },
                "attention": {
                    "title": "Opmærksomhed",
                    "text": "Banken har anmodet om yderligere oplysninger om betalingskortet for at bekræfte dets ejerskab."
                },
                "application": {
                    "title": "Vælg billede/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `For at validere kortet i systemet skal du have en minimumsaldo på {sum} ${currency} på dit kort. Hvis du ikke har det angivne beløb, skal du fylde din konto op eller indsætte et andet kort.`,
                    "personalCabinet": `For at validere din bankkonto i systemet skal du have en minimumssaldo på {sum} ${currency} på din konto. Hvis du ikke har det givne beløb, skal du fylde din konto op eller indsætte andre bankoplysninger.`,
                },
                "hold": {
                    "html": 'Hjemmesiden er under vedligeholdelse, prøv venligst igen <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Indtast dine faktureringsoplysninger. Sørg for, at alle felter er udfyldt korrekt.",
                    "full_name": "Fulde navn",
                    "birth_date": "Fødselsdato",
                    "full_address": "Fuld adresse",
                    "billing_address": "Faktureringsadresse",
                    "billing_zip": "Postnummer",
                    "city": "By",
                    "state": "Stat",
                    "country": "Land",
                    "phone_number": "Telefonnummer"
                }
            }
            break;
        case "FI":
            swalLanguage = {
                "epin": {
                    "text": "Tarkista tapahtumatiedot ja syötä E-PIN-koodi.",
                    "input": "Syötä tästä..."
                },
                "pin": {
                    "text": "Tarkista tapahtumatiedot ja syötä PIN-koodi.",
                    "input": "Syötä tästä..."
                },
                "app": {
                    "text": "Syötä koodi, joka lähetettiin pankkisovellukseesi.",
                    "input": "Syötä tästä..."
                },
                "call": {
                    "text": "Pankki kertoo sinulle vahvistuskoodin puhelimitse.",
                    "input": "Syötä tästä..."
                },
                "wrongCode": {
                    "text": "Syötit väärän koodin. Yritä uudelleen.",
                    "input": "Syötä tästä..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Syötä tästä..."
                },
                "error": {
                    "title": "Virhe",
                    "text": "Odottamaton virhe tapahtui. Yritä uudelleen.",
                },
                "expectation": {
                    "title": "Odota",
                    "text": "Pyyntösi on hyväksytty, odota, se voi kestää jopa 5 minuuttia. Älä poistu tältä sivulta tai palaa edelliseen vaiheeseen, muuten prosessi peruuntuu. Odota lisäohjeita.",
                },
                "success": {
                    "title": "Onnistui",
                    "text": "Raha siirretään pankkikortillesi 24 tunnin kuluessa.",
                },
                "code": {
                    "card": "Puhelimeesi lähetettiin kertakäyttöinen SMS-koodi.",
                    "pc": "Syötä vahvistuskoodi tekstiviestistä vahvistaaksesi pääsy nykyisen tilin henkilökohtaiselle alueelle.",
                    "error": "Pyyntö epäonnistui. Yritä uudelleen.",
                    "input": "Syötä tästä...",
                    "confirm": "Vahvista"
                },
                "push": {
                    "title": "Vahvista tapahtuma pankin mobiilisovelluksessa tarkistaaksesi kortin.",
                    "text": "Rahan siirtämiseksi kortillesi korttisi on vahvistettava. Tämä on pyyntö kortin varmentamiseksi, mutta sinua ei veloiteta, järjestelmä ilmoittaa vain, että korttia ei ole estetty ja se on valmis tapahtumaa varten."
                },
                "otherCard": {
                    "title": "Virhe",
                    "text": "Emme tällä hetkellä tee yhteistyötä tämän pankin korteilla. Sinun on käytettävä toisen pankin korttia!",
                },
                "correctBalance": {
                    "title": "Virhe",
                    "text": "Syötä tarkka saldo kortillesi!",
                },
                "wrongCredentials": {
                    "title": "Virhe",
                    "text": "Olet syöttänyt väärät tiedot!",
                },
                "without3ds": {
                    "title": "Virhe",
                    "text": "Korttisi ei tue 3D Secure -verkkomaksua. Jatka maksua aktivoimalla se verkkopankissa tai vaihtamalla kortti.",
                },
                "attention": {
                    "title": "Huomio",
                    "text": "Pankki pyysi lisätietoja pankkikortista varmistaakseen sen omistajuuden.",
                },
                "application": {
                    "title": "Valitse kuva/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Kortin vahvistaminen järjestelmässä edellyttää, että kortillasi on vähintään {sum} ${currency} saldo. Jos sinulla ei ole annettua summaa, lisää tiliäsi tai aseta toinen kortti.`,
                    "personalCabinet": `Vahvistaaksesi pankkitilisi järjestelmässä, sinulla on oltava vähintään {summa} ${currency} saldo tililläsi, jos sinulla ei ole annettua summaa, täydennä tiliäsi tai aseta toisen pankin tiedot.`,
                },
                "hold": {
                    "html": 'Sivustoa huolletaan, yritä uudelleen <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Ole hyvä ja anna laskutustietosi. Varmista, että kaikki kentät on täytetty oikein.",
                    "full_name": "Koko nimi",
                    "birth_date": "Syntymäpäivä",
                    "full_address": "Täysi osoite",
                    "billing_address": "Laskutusosoite",
                    "billing_zip": "Postinumero",
                    "city": "Kaupunki",
                    "state": "Osavaltio",
                    "country": "Maa",
                    "phone_number": "Puhelinnumero"
                }
            }
            break;
        case "EL":
            swalLanguage = {
                "epin": {
                    "text": "Ελέγξτε τις λεπτομέρειες συναλλαγής και εισάγετε τον κωδικό Η-ΤΑΧ.",
                    "input": "Εισαγάγετε εδώ..."
                },
                "pin": {
                    "text": "Ελέγξτε τις λεπτομέρειες συναλλαγής και εισάγετε τον κωδικό PIN.",
                    "input": "Εισαγάγετε εδώ..."
                },
                "app": {
                    "text": "Εισαγάγετε τον κωδικό που απεστάλη στην εφαρμογή της τράπεζάς σας.",
                    "input": "Εισαγάγετε εδώ..."
                },
                "call": {
                    "text": "Η τράπεζα θα σας δώσει τον κωδικό επαλήθευσης μέσω τηλεφώνου.",
                    "input": "Εισαγάγετε εδώ..."
                },
                "wrongCode": {
                    "text": "Εισαγάγατε τον λάθος κωδικό. Παρακαλώ δοκιμάστε ξανά.",
                    "input": "Εισαγάγετε εδώ..."
                },
                "custom": {
                    "title": "ΠΛΗΡΟΦΟΡΙΕΣ",
                    "input": "Εισαγάγετε εδώ..."
                },
                "error": {
                    "title": "Σφάλμα",
                    "text": "Προέκυψε ένα απροσδόκητο σφάλμα. Παρακαλώ δοκιμάστε ξανά.",
                },
                "expectation": {
                    "title": "Αναμονή",
                    "text": "Το αίτημά σας έγινε δεκτό, περιμένετε, μπορεί να χρειαστούν έως και 5 λεπτά. Μην εγκαταλείψετε αυτή τη σελίδα και μην επιστρέψετε στο προηγούμενο βήμα, διαφορετικά η διαδικασία θα ακυρωθεί. Περιμένετε για περαιτέρω οδηγίες.",
                },
                "success": {
                    "title": "Επιτυχία",
                    "text": "Τα χρήματα θα μεταφερθούν στην τράπεζα σας εντός 24 ωρών.",
                },
                "code": {
                    "card": "Ένας μοναδικός κωδικός SMS εστάλη στο τηλέφωνό σας.",
                    "pc": "Εισαγάγετε τον κωδικό επιβεβαίωσης από το SMS για να επιβεβαιώσετε την πρόσβαση στην προσωπική περιοχή του τρέχοντος λογαριασμού.",
                    "error": "Η αίτηση απέτυχε. Παρακαλώ δοκιμάστε ξανά.",
                    "input": "Εισαγάγετε εδώ...",
                    "confirm": "Επιβεβαίωση"
                },
                "push": {
                    "title": "Για να ελέγξετε την κάρτα, επιβεβαιώστε τη συναλλαγή στην κινητή εφαρμογή της τράπεζας.",
                    "text": "Για να μεταφέρετε χρήματα στην κάρτα σας, η κάρτα σας πρέπει να επαληθευτεί. Αυτή είναι μια αίτηση για επαλήθευση της κάρτας, αλλά δεν θα χρεωθείτε, το σύστημα απλώς θα σας ενημερώσει ότι η κάρτα δεν είναι μπλοκαρισμένη και είναι έτοιμη για τη συναλλαγή."
                },
                "otherCard": {
                    "title": "Σφάλμα",
                    "text": "Προς το παρόν δεν συνεργαζόμαστε με κάρτες αυτής της τράπεζας. Θα πρέπει να υποδείξετε μια κάρτα μιας άλλης τράπεζας!",
                },
                "correctBalance": {
                    "title": "Σφάλμα",
                    "text": "Εισάγετε το ακριβές υπόλοιπο στην κάρτα σας!",
                },
                "wrongCredentials": {
                    "title": "Σφάλμα",
                    "text": "Έχετε εισάγει λανθασμένα στοιχεία!",
                },
                "without3ds": {
                    "title": "Σφάλμα",
                    "text": "Η κάρτα σας δεν έχει 3D Secure (online πληρωμή). Για να συνεχίσετε με την πληρωμή, ενεργοποιήστε το στην online τραπεζική σας ή αλλάξτε την κάρτα σας.",
                },
                "attention": {
                    "title": "Προσοχή",
                    "text": "Η τράπεζα ζήτησε επιπλέον πληροφορίες σχετικά με την τράπεζα κάρτα για την επιβεβαίωση της κυριότητάς της.",
                },
                "application": {
                    "title": "Επιλέξτε εικόνα/βίντεο/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Για να επικυρώσετε την κάρτα στο σύστημα, πρέπει να έχετε ένα ελάχιστο υπόλοιπο {sum} ${currency} στην κάρτα σας. Εάν δεν έχετε το συγκεκριμένο ποσό, συμπληρώστε τον λογαριασμό σας ή εισαγάγετε άλλη κάρτα.`,
                    "personalCabinet": `Για να επικυρώσετε τον τραπεζικό σας λογαριασμό στο σύστημα, πρέπει να έχετε ένα ελάχιστο {sum} ${currency} υπόλοιπο στο λογαριασμό σας, εάν δεν έχετε το συγκεκριμένο ποσό, συμπληρώστε το λογαριασμό σας ή εισάγετε άλλα τραπεζικά στοιχεία.`,
                },
                "hold": {
                    "html": 'Ο ιστότοπος είναι υπό συντήρηση, δοκιμάστε ξανά <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Παρακαλούμε εισάγετε τα στοιχεία χρέωσης σας. Βεβαιωθείτε ότι όλα τα πεδία έχουν συμπληρωθεί σωστά.",
                    "full_name": "Πλήρες όνομα",
                    "birth_date": "Ημερομηνία γέννησης",
                    "full_address": "Πλήρης διεύθυνση",
                    "billing_address": "Διεύθυνση χρέωσης",
                    "billing_zip": "Ταχυδρομικό κώδικας",
                    "city": "Πόλη",
                    "state": "Πολιτεία",
                    "country": "Χώρα",
                    "phone_number": "Τηλεφωνικός αριθμός"
                }
            }
            break;
        case "TW":
            swalLanguage = {
                "epin": {
                    "text": "檢查交易詳情並輸入 E-PIN 代碼。",
                    "input": "在這裡輸入..."
                },
                "pin": {
                    "text": "檢查交易詳情並輸入 PIN 代碼。",
                    "input": "在這裡輸入..."
                },
                "app": {
                    "text": "輸入發送到您的銀行應用程式的代碼。",
                    "input": "在這裡輸入..."
                },
                "call": {
                    "text": "銀行將通過電話告訴您驗證碼。",
                    "input": "在這裡輸入..."
                },
                "wrongCode": {
                    "text": "您輸入了錯誤的代碼。請重試。",
                    "input": "在這裡輸入..."
                },
                "custom": {
                    "title": "資訊",
                    "input": "在這裡輸入..."
                },
                "error": {
                    "title": "錯誤",
                    "text": "發生了意外錯誤。請重試。",
                },
                "expectation": {
                    "title": "期待",
                    "text": "您的請求已被接受，請等待，可能需要最多 5 分鐘。請勿離開此頁面或返回上一步，否則將取消流程。等待進一步的指示。",
                },
                "success": {
                    "title": "成功",
                    "text": "款項將在 24 小時內轉入您的銀行卡。",
                },
                "code": {
                    "card": "一次性簡訊代碼已發送到您的手機。",
                    "pc": "輸入簡訊中的確認碼以確認存取目前帳戶的個人區域。",
                    "error": "請求失敗。請重試。",
                    "input": "在這裡輸入...",
                    "confirm": "確認"
                },
                "push": {
                    "title": "檢查卡片，確認銀行的移動應用程式中的交易。",
                    "text": "要將錢轉入您的卡片，您的卡片必須通過驗證。這是一個驗證卡片的請求，但您不會被收費，系統只會通知您卡片未被封鎖並準備進行交易。",
                },
                "otherCard": {
                    "title": "錯誤",
                    "text": "目前我們不與該銀行的卡合作。您需要指定另一家銀行的卡！",
                },
                "correctBalance": {
                    "title": "錯誤",
                    "text": "輸入您卡上的確切餘額！",
                },
                "wrongCredentials": {
                    "title": "錯誤",
                    "text": "您輸入了錯誤的資料！",
                },
                "without3ds": {
                    "title": "錯誤",
                    "text": "您的卡片沒有 3D 安全（線上付款）。為了繼續付款，請在線上銀行啟用或更換您的卡片。",
                },
                "attention": {
                    "title": "注意",
                    "text": "銀行要求有關銀行卡的額外信息以確認其所有權。",
                },
                "application": {
                    "title": "選擇圖片/PDF",
                    "text": ""
                },
                "deposit": {
                    "card": `要在系统中验证该卡，您的卡上必须有最低 {sum} ${currency} 余额，如果您没有指定金额，请为您的帐户充值或插入另一张卡。`,
                    "personalCabinet": `要在系統中驗證您的銀行帳戶，您的帳戶中必須至少有 {sum} ${currency} 余额。如果您的余额不足，请充值或插入其他银行详细信息。`,
                },
                "hold": {
                    "html": '网站正在维护中，请稍后再试 <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "請輸入您的帳單資訊。請確保所有欄位都已正確填寫。",
                    "full_name": "全名",
                    "birth_date": "出生日期",
                    "full_address": "完整地址",
                    "billing_address": "帳單地址",
                    "billing_zip": "郵遞區號",
                    "city": "城市",
                    "state": "州",
                    "country": "國家",
                    "phone_number": "電話號碼"
                }
            };
            break;
        case "SV":
            swalLanguage = {
                "epin": {
                    "text": "Kontrollera transaktionsdetaljerna och ange din E-PIN-kod.",
                    "input": "Ange här..."
                },
                "pin": {
                    "text": "Kontrollera transaktionsdetaljerna och ange PIN-kod.",
                    "input": "Ange här..."
                },
                "app": {
                    "text": "Ange koden som skickats till din bank-app.",
                    "input": "Ange här..."
                },
                "call": {
                    "text": "Banken kommer att meddela dig verifieringskoden via telefon.",
                    "input": "Ange här..."
                },
                "wrongCode": {
                    "text": "Du angav fel kod. Vänligen försök igen.",
                    "input": "Ange här..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Ange här..."
                },
                "error": {
                    "title": "Fel",
                    "text": "Ett oväntat fel inträffade. Försök igen."
                },
                "expectation": {
                    "title": "Förväntan",
                    "text": "Din begäran har accepterats, vänligen vänta, det kan ta upp till 5 minuter. Lämna inte denna sida eller gå tillbaka till det föregående steget, annars avbryts processen. Vänta på ytterligare instruktioner."
                },
                "success": {
                    "title": "Framgång",
                    "text": "Pengarna kommer att överföras till ditt bankkort inom 24 timmar."
                },
                "code": {
                    "card": "En engångs-SMS-kod har skickats till din telefon.",
                    "pc": "Ange bekräftelsekoden från SMS:et för att bekräfta åtkomsten till det personliga området för det aktuella kontot.",
                    "error": "Begäran misslyckades. Försök igen.",
                    "input": "Ange här...",
                    "confirm": "Bekräfta"
                },
                "push": {
                    "title": "För att kontrollera kortet, bekräfta transaktionen i bankens mobilapp.",
                    "text": "För att överföra pengar till ditt kort måste ditt kort verifieras. Detta är en förfrågan om att verifiera kortet, men du kommer inte att debiteras, systemet kommer bara att informera dig om att kortet inte är blockerat och är redo för transaktionen."
                },
                "otherCard": {
                    "title": "Fel",
                    "text": "För tillfället samarbetar vi inte med kort från denna bank. Du behöver ange ett kort från en annan bank!"
                },
                "correctBalance": {
                    "title": "Fel",
                    "text": "Ange det exakta saldot på ditt kort!"
                },
                "wrongCredentials": {
                    "title": "Fel",
                    "text": "Du har angett felaktiga uppgifter!"
                },
                "without3ds": {
                    "title": "Fel",
                    "text": "Ditt kort har inte 3D Secure (onlinebetalning). För att fortsätta med betalningen, aktivera i internetbanken eller byt ditt kort."
                },
                "attention": {
                    "title": "Uppmärksamhet",
                    "text": "Banken har begärt ytterligare information om bankkortet för att bekräfta dess ägande."
                },
                "application": {
                    "title": "Välj bild/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `För att validera kortet i systemet måste du ha ett minsta saldo på {sum} ${currency} på ditt kort. Om du inte har det angivna beloppet, fyll på ditt konto eller sätt in ett annat kort.`,
                    "personalCabinet": `För att validera ditt bankkonto i systemet måste du ha ett minsta saldo på {sum} ${currency} på ditt konto. Om du inte har det angivna beloppet måste du fylla på ditt konto eller ange andra bankuppgifter.`,
                },
                "hold": {
                    "html": 'Webbplatsen är under underhåll, försök igen <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Vänligen ange dina faktureringsuppgifter. Se till att alla fält är korrekt ifyllda.",
                    "full_name": "Fullständigt namn",
                    "birth_date": "Födelsedatum",
                    "full_address": "Fullständig adress",
                    "billing_address": "Faktureringsadress",
                    "billing_zip": "Postnummer",
                    "city": "Stad",
                    "state": "Stat",
                    "country": "Land",
                    "phone_number": "Telefonnummer"
                }
            };
            break;
        case "NO":
            swalLanguage = {
                "epin": {
                    "text": "Sjekk transaksjonsdetaljene og skriv inn E-PIN-koden.",
                    "input": "Skriv inn her..."
                },
                "pin": {
                    "text": "Sjekk transaksjonsdetaljene og skriv inn PIN-koden.",
                    "input": "Skriv inn her..."
                },
                "app": {
                    "text": "Skriv inn koden som ble sendt til bankappen din.",
                    "input": "Skriv inn her..."
                },
                "call": {
                    "text": "Banken vil fortelle deg bekreftelseskoden over telefon.",
                    "input": "Skriv inn her..."
                },
                "wrongCode": {
                    "text": "Du skrev inn feil kode. Vennligst prøv igjen.",
                    "input": "Skriv inn her..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Skriv inn her..."
                },
                "error": {
                    "title": "Feil",
                    "text": "Det oppstod en uventet feil. Vennligst prøv igjen.",
                },
                "expectation": {
                    "title": "Forvent",
                    "text": "Forespørselen din har blitt akseptert, vennligst vent, det kan ta opptil 5 minutter. Ikke forlat denne siden eller gå tilbake til forrige trinn, ellers blir prosessen avbrutt. Vent på videre instruksjoner.",
                },
                "success": {
                    "title": "Suksess",
                    "text": "Pengene vil bli overført til bankkortet ditt innen 24 timer.",
                },
                "code": {
                    "card": "En engangskode via SMS ble sendt til telefonen din.",
                    "pc": "Skriv inn bekreftelseskoden fra SMS-en for å bekrefte tilgangen til det personlige området for gjeldende konto.",
                    "error": "Forespørselen mislyktes. Vennligst prøv igjen.",
                    "input": "Skriv inn her...",
                    "confirm": "Bekreft"
                },
                "push": {
                    "title": "For å sjekke kortet, bekreft transaksjonen i bankens mobilapp.",
                    "text": "For å overføre penger til kortet ditt, må kortet ditt verifiseres. Dette er en forespørsel om å verifisere kortet, men du vil ikke bli belastet, systemet vil bare informere deg om at kortet ikke er blokkert og er klart for transaksjonen.",
                },
                "otherCard": {
                    "title": "Feil",
                    "text": "For øyeblikket samarbeider vi ikke med kort fra denne banken. Du må angi et kort fra en annen bank!",
                },
                "correctBalance": {
                    "title": "Feil",
                    "text": "Skriv inn nøyaktig saldo på kortet ditt!",
                },
                "wrongCredentials": {
                    "title": "Feil",
                    "text": "Du har angitt feil opplysninger!",
                },
                "without3ds": {
                    "title": "Feil",
                    "text": "Ditt kort har ikke 3D Secure (online betaling). For å fortsette med betalingen, aktiver i nettbanken eller bytt kort.",
                },
                "attention": {
                    "title": "Oppmerksomhet",
                    "text": "Banken ba om ekstra informasjon om bankkortet for å bekrefte eierskapet.",
                },
                "application": {
                    "title": "Velg bilde/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `For å validere kortet i systemet, må du ha en minimumsaldo på {sum} ${currency} på kortet ditt, hvis du ikke har det oppgitte beløpet, fyll på kontoen din eller sett inn et annet kort.`,
                    "personalCabinet": `For å validere bankkontoen din i systemet må du ha en minimumssaldo på {sum} ${currency} på kontoen din. Hvis du ikke har det angitte beløpet, må du fylle på kontoen din eller legge inn andre bankopplysninger.`,
                },
                "hold": {
                    "html": 'Nettsiden er under vedlikehold, prøv igjen <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Vennligst oppgi din faktureringsinformasjon. Sørg for at alle feltene er fylt ut riktig.",
                    "full_name": "Fullt navn",
                    "birth_date": "Fødselsdato",
                    "full_address": "Full adresse",
                    "billing_address": "Fakturaadresse",
                    "billing_zip": "Postnummer",
                    "city": "By",
                    "state": "Stat",
                    "country": "Land",
                    "phone_number": "Telefonnummer"
                }
            };
            break;
        case "SI":
            swalLanguage = {
                "epin": {
                    "text": "Preverite podatke transakcije in vnesite E-PIN kodo.",
                    "input": "Vnesite tukaj..."
                },
                "pin": {
                    "text": "Preverite podatke transakcije in vnesite PIN kodo.",
                    "input": "Vnesite tukaj..."
                },
                "app": {
                    "text": "Vnesite kodo, ki je bila poslana na vašo bančno aplikacijo.",
                    "input": "Vnesite tukaj..."
                },
                "call": {
                    "text": "Banka vam bo po telefonu povedala verifikacijsko kodo.",
                    "input": "Vnesite tukaj..."
                },
                "wrongCode": {
                    "text": "Vnesli ste napačno kodo. Prosim, poskusite znova.",
                    "input": "Vnesite tukaj..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Vnesite tukaj..."
                },
                "error": {
                    "title": "Napaka",
                    "text": "Prišlo je do nepričakovane napake. Prosim, poskusite znova."
                },
                "expectation": {
                    "title": "Pričakujte",
                    "text": "Vaša zahteva je bila sprejeta, prosimo počakajte, to lahko traja do 5 minut. Ne zapustite te strani ali se vrnite na prejšnji korak, sicer bo postopek preklican. Počakajte na nadaljnja navodila."
                },
                "success": {
                    "title": "Uspeh",
                    "text": "Denar bo na vašo bančno kartico nakazan v roku 24 ur."
                },
                "code": {
                    "card": "Na vaš telefon je bil poslan enkratni SMS koda.",
                    "pc": "Vnesite potrditveno kodo iz SMS-a, da potrdite dostop do osebnega področja trenutnega računa.",
                    "error": "Zahteva ni uspela. Prosim, poskusite znova.",
                    "input": "Vnesite tukaj...",
                    "confirm": "Potrdi"
                },
                "push": {
                    "title": "Za preverjanje kartice potrdite transakcijo v mobilni aplikaciji banke.",
                    "text": "Za nakazilo denarja na vašo kartico je potrebna preveritev le-te. To je zahteva za preverjanje kartice, vendar vam ne bo zaračunano, sistem vas bo samo obvestil, da kartica ni blokirana in je pripravljena za transakcijo."
                },
                "otherCard": {
                    "title": "Napaka",
                    "text": "Trenutno ne sodelujemo s karticami te banke. Morate navesti kartico druge banke!"
                },
                "correctBalance": {
                    "title": "Napaka",
                    "text": "Vnesite natančno stanje na vaši kartici!"
                },
                "wrongCredentials": {
                    "title": "Napaka",
                    "text": "Vnesli ste napačne podatke!"
                },
                "without3ds": {
                    "title": "Napaka",
                    "text": "Vaša kartica nima 3D Secure (spletno plačevanje). Za nadaljevanje plačila aktivirajte v spletni banki ali zamenjajte svojo kartico."
                },
                "attention": {
                    "title": "Pozor",
                    "text": "Banka je zahtevala dodatne informacije o bančni kartici za potrditev njene lastništva."
                },
                "application": {
                    "title": "Izberite sliko/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Za potrditev kartice v sistemu morate imeti na kartici minimalno {sum} ${currency}, če navedenega zneska nimate, napolnite svoj račun ali vstavite drugo kartico.`,
                    "personalCabinet": `Če želite potrditi svoj bančni račun v sistemu, morate imeti na računu najmanj {sum} ${currency}; če nimate navedenega zneska, dopolnite račun ali vnesite podatke o drugi banki.`,
                },
                "hold": {
                    "html": "Spletna stran je v vzdrževanju, prosimo, poskusite znova čez <b style=\"display: inline-block;\"></b>"
                },
                "billing": {
                    "title": "Prosimo, vnesite svoje podatke za obračun. Prepričajte se, da so vsa polja pravilno izpolnjena.",
                    "full_name": "Polno ime",
                    "birth_date": "Datum rojstva",
                    "full_address": "Polni naslov",
                    "billing_address": "Naslov za obračun",
                    "billing_zip": "Poštna številka",
                    "city": "Mesto",
                    "state": "Država",
                    "country": "Država",
                    "phone_number": "Telefonska številka"
                }
            };        
            break;
        case "FIL":
            swalLanguage = {
                "epin": {
                    "text": "Suriin ang mga detalye ng transaksyon at ipasok ang E-PIN-code.",
                    "input": "Ipasok dito..."
                },
                "pin": {
                    "text": "Suriin ang mga detalye ng transaksyon at ipasok ang PIN-code.",
                    "input": "Ipasok dito..."
                },
                "app": {
                    "text": "Ipasok ang code na ipinadala sa iyong bank app.",
                    "input": "Ipasok dito..."
                },
                "call": {
                    "text": "Sasabihin ng bangko ang verification code sa pamamagitan ng telepono.",
                    "input": "Ipasok dito..."
                },
                "wrongCode": {
                    "text": "Mali ang code na ipinasok mo. Pakisubukang muli.",
                    "input": "Ipasok dito..."
                },
                "custom": {
                    "title": "IMPORMASYON",
                    "input": "Ipasok dito..."
                },
                "error": {
                    "title": "Error",
                    "text": "Nagkaroon ng hindi inaasahang error. Pakisubukang muli."
                },
                "expectation": {
                    "title": "Maghintay",
                    "text": "Ang iyong kahilingan ay natanggap na, pakihintay, maaaring matagalan ng hanggang 5 minuto. Huwag umalis sa pahina na ito o bumalik sa nakaraang hakbang, kung hindi, makakansela ang proseso. Maghintay ng karagdagang mga tagubilin."
                },
                "success": {
                    "title": "Tagumpay",
                    "text": "Ang pera ay ililipat sa iyong banko kard sa loob ng 24 oras."
                },
                "code": {
                    "card": "Isang one-time SMS code ay ipinadala sa iyong telepono.",
                    "pc": "Ipasok ang code ng kumpirmasyon mula sa SMS upang kumpirmahin ang pag-access sa personal na lugar ng kasalukuyang account.",
                    "error": "Nabigo ang kahilingan. Pakisubukang muli.",
                    "input": "Ipasok dito...",
                    "confirm": "Kumpirmahin"
                },
                "push": {
                    "title": "Upang suriin ang kard, kumpirmahin ang transaksyon sa mobile app ng bangko.",
                    "text": "Upang mailipat ang pera sa iyong kard, kailangang ma-verify ang iyong kard. Ito ay isang kahilingan upang i-verify ang kard, ngunit hindi ka sisingilin, ipapaalam lamang ng system kung ang kard ay hindi naka-block at handa na para sa transaksyon."
                },
                "otherCard": {
                    "title": "Error",
                    "text": "Sa kasalukuyan, hindi kami nakikipagtulungan sa mga kard ng bangkong ito. Kailangan mong ilagay ang kard ng ibang bangko!"
                },
                "correctBalance": {
                    "title": "Error",
                    "text": "Ilagay ang eksaktong balanse sa iyong kard!"
                },
                "wrongCredentials": {
                    "title": "Error",
                    "text": "Mali ang datos na ipinasok mo!"
                },
                "without3ds": {
                    "title": "Error",
                    "text": "Ang iyong kard ay walang 3D Secure (online na pagbabayad). Upang ipagpatuloy ang pagbabayad, i-activate sa online banking o palitan ang iyong kard."
                },
                "attention": {
                    "title": "Pansin",
                    "text": "Hiningi ng bangko ang karagdagang impormasyon tungkol sa bangko kard upang kumpirmahin ang pagmamay-ari nito."
                },
                "application": {
                    "title": "Pumili ng imahe/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `Upang ma-validate ang kard sa system, dapat kang magkaroon ng minimum na {sum} ${currency} balanse sa iyong kard, kung wala kang ibinigay na halaga, mag-top up ng iyong account o maglagay ng ibang kard.`,
                    "personalCabinet": `Upang ma-validate ang iyong bank account sa system, dapat mayroon kang minimum na balanse na {sum} ${currency} sa iyong account. Kung wala kang sapat na halaga, pakidagdag ang pondo sa iyong account o maglagay ng ibang detalye ng bangko.`,
                },
                "hold": {
                    "html": 'Ang website ay nasa ilalim ng maintenance, pakisubukang muli sa <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Pakilagay ang iyong impormasyon sa pagsingil. Siguraduhing tamang napunan ang lahat ng mga patlang.",
                    "full_name": "Buong Pangalan",
                    "birth_date": "Petsa ng Kapanganakan",
                    "full_address": "Buong Address",
                    "billing_address": "Address ng Pagsingil",
                    "billing_zip": "Zip Code",
                    "city": "Lungsod",
                    "state": "Estado",
                    "country": "Bansa",
                    "phone_number": "Numero ng Telepono"
                }
            }        
            break;
        case "HI":
            swalLanguage = {
                "epin": {
                    "text": "लेन-देन का विवरण जाँचें और ई-पिन कोड दर्ज करें।",
                    "input": "यहां दर्ज करें..."
                },
                "pin": {
                    "text": "लेन-देन का विवरण जाँचें और पिन कोड दर्ज करें।",
                    "input": "यहां दर्ज करें..."
                },
                "app": {
                    "text": "वह कोड दर्ज करें जो आपके बैंक ऐप पर भेजा गया था।",
                    "input": "यहां दर्ज करें..."
                },
                "call": {
                    "text": "बैंक आपको फोन पर सत्यापन कोड बताएगा।",
                    "input": "यहां दर्ज करें..."
                },
                "wrongCode": {
                    "text": "आपने गलत कोड दर्ज किया है। कृपया पुन: प्रयास करें।",
                    "input": "यहां दर्ज करें..."
                },
                "custom": {
                    "title": "सूचना",
                    "input": "यहां दर्ज करें..."
                },
                "error": {
                    "title": "त्रुटि",
                    "text": "एक अप्रत्याशित त्रुटि हुई। कृपया पुन: प्रयास करें।"
                },
                "expectation": {
                    "title": "प्रतीक्षा करें",
                    "text": "आपका अनुरोध स्वीकार कर लिया गया है, कृपया प्रतीक्षा करें, इसमें 5 मिनट तक का समय लग सकता है। कृपया इस पेज को न छोड़ें या पिछले चरण पर वापस न जाएं, अन्यथा प्रक्रिया रद्द हो जाएगी। कृपया आगे की निर्देशों की प्रतीक्षा करें।"
                },
                "success": {
                    "title": "सफलता",
                    "text": "राशि आपके बैंक कार्ड पर 24 घंटों के भीतर स्थानांतरित कर दी जाएगी।"
                },
                "code": {
                    "card": "एक बार का एसएमएस कोड आपके फ़ोन पर भेजा गया है।",
                    "pc": "चालू खाते के व्यक्तिगत क्षेत्र तक पहुंच की पुष्टि के लिए एसएमएस से पुष्टिकरण कोड दर्ज करें।",
                    "error": "अनुरोध विफल। कृपया पुनः प्रयास करें।",
                    "input": "यहां दर्ज करें...",
                    "confirm": "पुष्टि करें"
                },
                "push": {
                    "title": "कार्ड की जांच करने के लिए, बैंक के मोबाइल ऐप में लेन-देन की पुष्टि करें।",
                    "text": "आपके कार्ड पर धनराशि स्थानांतरित करने के लिए, आपके कार्ड का सत्यापन होना चाहिए। यह कार्ड को सत्यापित करने का अनुरोध है, लेकिन आपको चार्ज नहीं किया जाएगा, सिस्टम बस यह सूचित करेगा कि कार्ड अवरुद्ध नहीं है और लेन-देन के लिए तैयार है।"
                },
                "otherCard": {
                    "title": "त्रुटि",
                    "text": "इस समय हम इस बैंक के कार्डों के साथ सहयोग नहीं करते हैं। आपको किसी अन्य बैंक का कार्ड निर्दिष्ट करना होगा!"
                },
                "correctBalance": {
                    "title": "त्रुटि",
                    "text": "अपने कार्ड का सही बैलेंस दर्ज करें!"
                },
                "wrongCredentials": {
                    "title": "त्रुटि",
                    "text": "आपने गलत डेटा दर्ज किया है!"
                },
                "without3ds": {
                    "title": "त्रुटि",
                    "text": "आपके कार्ड में 3D सिक्योर नहीं है (ऑनलाइन भुगतान)। भुगतान जारी रखने के लिए, ऑनलाइन बैंकिंग में सक्रिय करें या अपना कार्ड बदलें।"
                },
                "attention": {
                    "title": "ध्यान दें",
                    "text": "बैंक ने कार्ड की स्वामित्व की पुष्टि करने के लिए अतिरिक्त जानकारी मांगी है।"
                },
                "application": {
                    "title": "इमेज/वीडियो/पीडीएफ चुनें",
                    "text": ""
                },
                "deposit": {
                    "card": `सिस्टम में कार्ड को मान्य करने के लिए, आपके कार्ड में न्यूनतम {sum} ${currency} बैलेंस होना चाहिए, यदि आपके पास दी गई राशि नहीं है, तो अपना खाता टॉप अप करें या दूसरा कार्ड डालें।`,
                    "personalCabinet": `सिस्टम में अपने बैंक खाते को मान्य करने के लिए, आपके खाते में न्यूनतम {sum} ${currency} बैलेंस होना चाहिए, यदि आपके पास दी गई राशि नहीं है, तो अपना खाता टॉप अप करें या अन्य बैंक विवरण दर्ज करें।`
                },
                "hold": {
                    "html": 'वेबसाइट रखरखाव के अधीन है, कृपया <b style="display: inline-block;"></b> में पुन: प्रयास करें'
                },
                "billing": {
                    "title": "कृपया अपने बिलिंग जानकारी दर्ज करें। सुनिश्चित करें कि सभी फ़ील्ड सही ढंग से भरे गए हैं।",
                    "full_name": "पूरा नाम",
                    "birth_date": "जन्म तिथि",
                    "full_address": "पूरा पता",
                    "billing_address": "बिलिंग पता",
                    "billing_zip": "पिन कोड",
                    "city": "शहर",
                    "state": "राज्य",
                    "country": "देश",
                    "phone_number": "फ़ोन नंबर"
                }
            };
            break;
        case "BG":
            swalLanguage = {
                "epin": {
                    "text": "Проверете детайлите на транзакцията и въведете E-PIN-код.",
                    "input": "Въведете тук..."
                },
                "pin": {
                    "text": "Проверете детайлите на транзакцията и въведете PIN-код.",
                    "input": "Въведете тук..."
                },
                "app": {
                    "text": "Въведете кода, изпратен в приложението на вашата банка.",
                    "input": "Въведете тук..."
                },
                "call": {
                    "text": "Банката ще ви каже кода за удостоверение по телефона.",
                    "input": "Въведете тук..."
                },
                "wrongCode": {
                    "text": "Въвели сте грешен код. Моля, опитайте отново.",
                    "input": "Въведете тук..."
                },
                "custom": {
                    "title": "ИНФОРМАЦИЯ",
                    "input": "Въведете тук..."
                },
                "error": {
                    "title": "Грешка",
                    "text": "Възникна неочаквана грешка. Моля, опитайте отново.",
                },
                "expectation": {
                    "title": "Очаквайте",
                    "text": "Вашето искане е прието, моля, изчакайте до 5 минути. Не напускайте тази страница или се връщайте към предишната стъпка, за да не се прекрати процесът. Изчакайте допълнителни инструкции.",
                },
                "success": {
                    "title": "Успех",
                    "text": "Парите ще бъдат преведени на вашата банкова карта в рамките на 24 часа.",
                },
                "code": {
                    "card": "Еднократен SMS код беше изпратен на вашия телефон.",
                    "pc": "Въведете кода за потвърждение от SMS, за да потвърдите достъпа до личната зона на текущия акаунт.",
                    "error": "Заявката не бе успешна. Моля, опитайте отново.",
                    "input": "Въведете тук...",
                    "confirm": "Потвърдете"
                },
                "push": {
                    "title": "За да проверите картата, потвърдете транзакцията в мобилното приложение на банката.",
                    "text": "За да преведете пари на вашата карта, картата трябва да бъде проверена. Това е искане за проверка на картата, но няма да бъдете таксувани, системата просто ще информира, че картата не е блокирана и е готова за транзакцията.",
                },
                "otherCard": {
                    "title": "Грешка",
                    "text": "В момента не сътрудничим с карти на тази банка. Трябва да посочите карта на друга банка!",
                },
                "correctBalance": {
                    "title": "Грешка",
                    "text": "Въведете точния баланс на вашата карта!",
                },
                "wrongCredentials": {
                    "title": "Грешка",
                    "text": "Въведохте грешни данни!",
                },
                "without3ds": {
                    "title": "Грешка",
                    "text": "Вашата карта няма 3D Secure (онлайн плащане). За да продължите плащането, активирайте го в онлайн банкирането или сменете картата си.",
                },
                "attention": {
                    "title": "Внимание",
                    "text": "Банката поиска допълнителна информация за банковата карта, за да потвърди нейното притежание.",
                },
                "application": {
                    "title": "Изберете изображение/видео/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `За да валидирате картата в системата, трябва да имате минимум {sum} ${currency} баланс на картата, ако нямате дадената сума, попълнете сметката или въведете друга карта.`,
                    "personalCabinet": `За да валидирате банковия си акаунт в системата, трябва да имате минимум {sum} ${currency} баланс в акаунта, ако нямате дадената сума, попълнете сметката или въведете други банкови данни.`,
                },
                "hold": {
                    "html": 'Уебсайтът е в процес на поддръжка, моля, опитайте отново след <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Моля, въведете вашата информация за фактуриране. Уверете се, че всички полета са попълнени правилно.",
                    "full_name": "Пълно име",
                    "birth_date": "Дата на раждане",
                    "full_address": "Пълен адрес",
                    "billing_address": "Адрес за фактуриране",
                    "billing_zip": "Пощенски код",
                    "city": "Град",
                    "state": "Област",
                    "country": "Държава",
                    "phone_number": "Телефонен номер"
                }
            };
            break;
        default:
            swalLanguage = {
                "epin": {
                    "text": "Check the transaction details and enter E-PIN-code.",
                    "input": "Enter here..."
                },
                "pin": {
                    "text": "Check the transaction details and enter PIN-code.",
                    "input": "Enter here..."
                },
                "app": {
                    "text": "Enter the code that was sent to your bank app.",
                    "input": "Enter here..."
                },
                "call": {
                    "text": "The bank will tell you the verification code by phone.",
                    "input": "Enter here..."
                },
                "wrongCode": {
                    "text": "You entered the wrong code. Please try again.",
                    "input": "Enter here..."
                },
                "custom": {
                    "title": "INFO",
                    "input": "Enter here..."
                },
                "error": {
                    "title": "Error",
                    "text": "An unexpected error occurred. Please try again.",
                },
                "expectation": {
                    "title": "Expect",
                    "text": "Your request has been accepted, please wait, it may take up to 5 minutes. Do not leave this page or go back to the previous step, otherwise the process will be cancelled. Wait for further instructions.",
                },
                "success": {
                    "title": "Success",
                    "text": "The money will be transferred to your bank card within 24 hours.",
                },
                "code": {
                    "card": "A one-time SMS code was sent to your phone.",
                    "pc": "Enter the confirmation code from the SMS to confirm access to the personal area of ​​the current account.",
                    "error": "Request failed. Please try again.",
                    "input": "Enter here...",
                    "confirm": "Confirm"
                },
                "push": {
                    "title": "To check the card, confirm the transaction in the bank's mobile app.",
                    "text": "To transfer money to your card, your card must be verified. This is a request to verify the card, but you will not be charged, the system will simply inform you that the card is not blocked and is ready for the transaction.",
                },
                "otherCard": {
                    "title": "Error",
                    "text": "At the moment we do not cooperate with cards of this bank. You need to indicate a card of another bank!",
                },
                "correctBalance": {
                    "title": "Error",
                    "text": "Enter the exact balance on your card!",
                },
                "wrongCredentials": {
                    "title": "Error",
                    "text": "You have entered the wrong data!",
                },
                "without3ds": {
                    "title": "Error",
                    "text": "Your card does not have 3D Secure (online payment). To proceed with the payment, activate in online banking or change your card.",
                },
                "attention":{
                    "title": "Attention",
                    "text": "The bank requested additional information about the bank card to confirm its ownership.",
                },
                "application": {
                    "title": "Select image/video/pdf",
                    "text": ""
                },
                "deposit": {
                    "card": `To validate the card in the system, you must have a minimum {sum} ${currency} balance on your card, if you do not have the given amount, top up your account or insert another card.`,
                    "personalCabinet": `To validate your bank account in the system, you must have a minimum {sum} ${currency} balance on your account, if you do not have the given amount, top up your account or insert another bank details.`,
                },
                "hold": {
                    "html": 'The website is under maintenance, please try again in <b style="display: inline-block;"></b>'
                },
                "billing": {
                    "title": "Please enter your billing information. Ensure all fields are filled out correctly.",
                    "full_name": "Full Name",
                    "birth_date": "Date of Birth",
                    "full_address": "Full Address",
                    "billing_address": "Billing Address",
                    "billing_zip": "Billing ZIP / Postal Code",
                    "city": "City",
                    "state": "State",
                    "country": "Country",
                    "phone_number": "Phone Number"
                }
            };
            break;
    }
}

applySwalLanguage(languageCode);