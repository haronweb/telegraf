const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { google } = require('googleapis');
const { spawn } = require('child_process');

require('dotenv').config();

// === Настройки из .env ===
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const BOT_USERNAME = process.env.BOT_USERNAME;

// === Пути ===
const ROOT_PATH = path.resolve(__dirname);
const BACKUP_FOLDER = path.join(ROOT_PATH, 'backup');
if (!fs.existsSync(BACKUP_FOLDER)) {
    fs.mkdirSync(BACKUP_FOLDER);
}
const DATE = new Date().toISOString().replace(/[:.]/g, '-');
const SQL_DUMP_NAME = `dump_${BOT_USERNAME}_${DATE}.sql`;
const SQL_DUMP_PATH = path.join(ROOT_PATH, SQL_DUMP_NAME);
const ARCHIVE_NAME = `backup_${BOT_USERNAME}.tar.gz`; // Постоянное имя для архива
const ARCHIVE_PATH = path.join(BACKUP_FOLDER, ARCHIVE_NAME);

async function sendErrorToTelegram(errorText) {
    try {
        const messageText = `❌ <b>Ошибка при резервном копировании:</b>\n\n<code>${errorText}</code>`;
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: messageText,
            parse_mode: 'HTML',
        });
        console.log('🚨 Error notification sent to Telegram!');
    } catch (err) {
        console.error('❌ Failed to send error notification to Telegram:', err.response?.data || err.message);
    }
}


// === 1. Очистка старых локальных архивов ===
function cleanOldArchives() {
    const files = fs.readdirSync(BACKUP_FOLDER);
    files.forEach(file => {
        if (file.endsWith('.tar.gz') && file !== ARCHIVE_NAME) {
            fs.unlinkSync(path.join(BACKUP_FOLDER, file));
            console.log(`🗑️  Deleted old local archive: ${file}`);
        }
    });
}

// === 2. Дамп базы MySQL ===
function dumpDatabase() {
    return new Promise((resolve, reject) => {
        const dumpCommand = `mysqldump -u ${DB_USER} -p${DB_PASS} ${DB_NAME} > ${SQL_DUMP_PATH}`;
        exec(dumpCommand, (error, stdout, stderr) => {
            if (error) return reject(`Dump Error: ${stderr}`);
            resolve();
        });
    });
}

// === 3. Архивация всей папки (исключая backup) ===

function createArchive() {
    return new Promise((resolve, reject) => {
        cleanOldArchives();

        const tarArgs = [
            '--exclude=./backup',
            '-czf',
            ARCHIVE_PATH,
            '-C',
            ROOT_PATH,
            '.'
        ];

        console.log(`📦 Запускаем архивацию (spawn tar)...`);

        const tar = spawn('tar', tarArgs);

        tar.stdout.on('data', (data) => {
            // Можно логировать при желании:
            // console.log(`stdout: ${data}`);
        });

        tar.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        tar.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Архив успешно создан!');
                resolve();
            } else {
                reject(`Tar process exited with code ${code}`);
            }
        });

        tar.on('error', (err) => {
            reject(`Tar spawn error: ${err.message}`);
        });
    });
}

// === 4. Удаление старого архива с Google Drive (если есть) ===
async function deleteExistingBackup(drive) {
    const res = await drive.files.list({
        q: `name = '${ARCHIVE_NAME}'`,  // ищем архив с постоянным именем
        fields: 'files(id, name)',
        spaces: 'drive'
    });

    if (res.data.files.length) {
        const file = res.data.files[0];
        await drive.files.delete({ fileId: file.id });
        console.log(`🗑️  Deleted old backup on Google Drive: ${file.name}`);
    }
}

// === 5. Загрузка архива в Google Drive (Приватно) ===
async function uploadToDrive(filePath) {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.join(__dirname, 'credentials.json'),
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    await deleteExistingBackup(drive);  // Удаляем старый архив перед загрузкой

    const fileMetadata = { name: ARCHIVE_NAME }; // Используем постоянное имя архива
    const media = { mimeType: 'application/gzip', body: fs.createReadStream(filePath) };

    const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
    });

    console.log(`✅ Uploaded to Google Drive (PRIVATE), fileId: ${file.data.id}`);

    // Сохраняем fileId в файл для дальнейшего использования
    fs.writeFileSync(path.join(__dirname, 'lastFileId.json'), JSON.stringify({ fileId: file.data.id }));

    return file.data.id;
}

// === 6. Отправка fileId в Telegram ===

async function sendFileIdToTelegram(fileId) {
    try {
        const messageText = `
<b>📄 Новый File ID получен:</b>

<span class="tg-spoiler">${fileId}</span>`;

        const replyMarkup = {
            inline_keyboard: [
                [{ text: '❌ Скрыть', callback_data: 'delete' }]
            ]
        };

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: messageText,
            parse_mode: 'HTML',
            reply_markup: replyMarkup
        });

        console.log('✅ File ID sent to Telegram!');
    } catch (err) {
        console.error('❌ Telegram Error:', err.response?.data || err.message);
    }
}



// === 7. Очистка локальных временных файлов ===
function cleanup() {
    if (fs.existsSync(SQL_DUMP_PATH)) {
        fs.unlinkSync(SQL_DUMP_PATH);
        console.log(`🗑️  Deleted SQL dump: ${SQL_DUMP_NAME}`);
    }
    if (fs.existsSync(ARCHIVE_PATH)) {
        fs.unlinkSync(ARCHIVE_PATH);
        console.log(`🗑️  Deleted archive: ${ARCHIVE_NAME}`);
    }
}

// === 8. Полный процесс ===
async function backupProcess() {
    try {
        console.log('📦 Starting MySQL dump...');
        await dumpDatabase();
        console.log('🗄️  Creating archive...');
        await createArchive();
        console.log('☁️ Uploading to Google Drive...');
        const fileId = await uploadToDrive(ARCHIVE_PATH);
        console.log('📤 Sending fileId to Telegram...');
        await sendFileIdToTelegram(fileId);
        cleanup();
        console.log('✅ Full backup process completed!');
    } catch (err) {
        await sendErrorToTelegram(err.toString().slice(0, 4000));

        console.error('❌ Backup Error:', err);
    }
}


// backupProcess();

module.exports = { backupProcess };
