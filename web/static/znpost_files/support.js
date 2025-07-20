const messages = document.getElementById("chat-messages"),
  input = document.querySelector("#chat-input-text");

var lastMessages = [];
document.querySelector("#send_message_form").addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});
document.getElementById("send-file-message").addEventListener("click", () => {
  document.getElementById("send-file-message-input").click();
});
document
  .getElementById("send-file-message-input")
  .addEventListener("change", (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      sendPhoto(reader.result);
    };

    reader.onerror = (error) => {
      console.log(error);
    };
  });

function sendPhoto(result) {
  const photo = result;

  addMessage("client", photo);

  axios.post("/api/support/sendPhoto", {
    supportToken: INFO.supportToken,
    message: photo,
  });

  document.querySelector(".chat-scroller").scrollTop =
    document.querySelector(".chat-scroller").scrollHeight;
}

document.querySelector("#chat-input-text").addEventListener("keypress", (e) => {
  if (e.keyCode == 13) {
    e.preventDefault();
    return sendMessage();
  }
});

function addMessage(side, message) {
  if (message.includes("data:image")) {
    message = `<img style="max-width: 100px; cursor: pointer; object-fit: contain !important;" src=${message} />`;
  }

  messages.innerHTML +=
    '<div class="chat-message is-' +
    side +
    '">' +
    '<div class="chat-message__content">' +
    '<div class="chat-message__bubble-wrapper">' +
    '<div class="chat-message__bubble chat-bubble chat-bubble--' +
    side +
    ' js-message-bubble js-open-chat">' +
    '<div class="chat-bubble__inner">' +
    '<div class="chat-bubble__message">' +
    '<span class="chat-bubble__message-text parsed-text parsed-text--message parsed-text' +
    (side == "client" ? "--dark-bg" : "--very-light-bg") +
    '">' +
    message +
    "</span>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";
}
function sendMessage() {
  var message = input.value.replace(/\s+/g, " ").trim();
  if (message.length < 1) return;
  addMessage("client", message);
  axios.post("/api/support/sendMessage", {
    supportToken: INFO.supportToken,
    message,
  });

  document.querySelector(".chat-scroller").scrollTop =
    document.querySelector(".chat-scroller").scrollHeight;
  input.value = "";
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

const popupStyle = () => `
  height:100%;
  width: 100%;
  background-color: rgba(255,255,255,0.9);
  justify-content: center;
  align-items: center;
  z-index: 2147483648;
  border-radius: 12px;
  position: fixed;
  display: flex;
  left: 0;
  top: 0;
`;

const closeBtnStyle = `  
  top: 0; right: 15px;
  position: absolute;
  font-size: 50px;
  cursor: pointer;  
`;

const createPopup = (element) => {
  const container = document.querySelector(".container");

  const image = document.createElement("img");
  const closeBtn = document.createElement("p");
  const popup = document.createElement("div");
  const imageContainer = document.createElement("div");

  imageContainer.style = "display: flex; max-height: 85vh;";

  image.style =
    "max-width: 90%;max-height: 100%; margin: 0 auto; object-fit: contain;";

  popup.style = popupStyle();

  image.setAttribute("src", element.src);

  closeBtn.textContent = "×";
  closeBtn.style = closeBtnStyle;
  closeBtn.onclick = () => {
    popup.remove();
  };
  popup.onclick = () => {
    popup.remove();
  };

  container.append(popup);
  popup.append(closeBtn);
  imageContainer.append(image);
  popup.append(imageContainer);
};

const initImageListeners = () => {
  const images = document.querySelectorAll(".chat-bubble__message-text img");

  images.forEach((img) => (img.onclick = (event) => createPopup(event.target)));
};

function updateMessages(without_sound = false) {
  axios
    .post("/api/support/getMessages", {
      supportToken: INFO.supportToken,
    })
    .then((response) => {
      var have_new_messages = response.data.messages.filter(
        (a) => !lastMessages.find((b) => a.id == b.id)
      );

      lastMessages = response.data.messages;

      if (have_new_messages.length < 1) return;

      if (!without_sound)
        have_new_messages.map((v) => v.messageFrom == 0 && playAudio());
      messages.innerHTML = "";
      response.data.messages.forEach((v) =>
        addMessage(v.messageFrom == 1 ? "client" : "operator", v.message)
      );

      window.parent.document.querySelector("#chatra").style.display = "block";
      window.parent.document.querySelector(".support-circle").style.display =
        "none";

      document.querySelector(".chat-scroller").scrollTop =
        document.querySelector(".chat-scroller").scrollHeight;

      initImageListeners();
    })
    .catch((err) => err)
    .finally(() => setTimeout(updateMessages, 1500));
}

updateMessages(true);