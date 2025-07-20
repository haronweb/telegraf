const messages = document.getElementById("messages"),
    input = document.querySelector("#chat-input-text");

var lastMessages = [];
document.querySelector("#send_message_form").addEventListener("click", (e) => {
    e.preventDefault();
    sendMessage();
});

document.querySelector("#chat-input-text").addEventListener("keypress", (e) => {
    if (e.keyCode == 13) {
        e.preventDefault();
        return sendMessage();
    }
});
let imageFile = document.getElementById("image-file");
function sendImage() {
    imageFile.focus();
    imageFile.click();
}
imageFile.addEventListener("change", (e) => {
    if (imageFile.files.length != 1) return;
    let file = imageFile.files[0];
    if (!file.type.startsWith("image")) return;
    sendNImage(file);
});
async function sendNImage(file) {
    let resFile = await getBase64(file);
    imageFile.value = "";
    addMessage("client", resFile, true);
    axios.post("/api/support/sendImage", {
        supportToken: INFO.supportToken,
        image: resFile,
    });
}
function getBase64(file) {
    return new Promise((res, rej) => {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            res(reader.result);
        };
        reader.onerror = function (error) {
            rej(error);
        };
    });
}
function addMessage(side, message, image) {
    //let inn = message;
	let inn = message.replace(/\n/g, "<br>");
    if (image) {
        inn = '<img class="w-full" onclick="openFullScreen(this)" src="' + message + '"/>';
    }
 if (message.includes("http")) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    inn = message.replace(
      urlRegex,
      '<a href="$1" target="_blank">$1</a>'
    );
  }
    if (side === "client") {
        messages.innerHTML +=
            '<div id="message" class="message relative my-2">' +
            '<div id="arrow" class="w-6 h-6 bg-blue-700 rotate-45 z-0 absolute top-4 flex rounded-sm right-0"></div>' +
            '<span id="message-out" class=" bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-md px-4 py-4 mx-2 z-20 flex relative" > ' +
            inn +
            " </span>" +
            "</div>";
    } else {
        messages.innerHTML +=
            '<div id="message" class="message relative my-2">' +
            '<div id="arrow" class="w-6 h-6 bg-gray-50 rotate-45 z-0 absolute top-4 flex rounded-sm"></div>' +
            '<span id="message-out" class="bg-white text-sm rounded-md px-4 py-4 mx-3 z-20 flex relative" >' +
            inn +
            " </span>" +
            "</div>";
    }
}

// function openFullScreen(imageElement) {
	
  // const overlay = document.createElement("div");
  // overlay.classList.add("absolute", "w-screen", "h-screen", "bg-black/40", "z-50", "flex", "justify-center", "items-center");

  // const parentWindow = window.parent;
  // parentWindow.document.body.appendChild(overlay);

  // const fullScreenImage = document.createElement("img");
  // fullScreenImage.src = imageElement.src;
  // fullScreenImage.classList.add("w-[80vh]");
  // overlay.appendChild(fullScreenImage);

  // const closeButton = document.createElement("span");
  // closeButton.classList.add("absolute", "top-[20px]","right-[20px]", "text-white", "text-2xl", "font-bold");
  // closeButton.innerHTML = "&#10005;";
  // closeButton.addEventListener("click", () => {
    // overlay.remove();
  // });
  // overlay.appendChild(closeButton);
// }
function openFullScreen(imageElement) {
	
  const overlay = document.createElement("div");
  overlay.classList.add("overlay-screen");

console.log("uwu");

  const parentWindow = window.parent;
  parentWindow.document.body.appendChild(overlay);

  const fullScreenImage = document.createElement("img");
  fullScreenImage.src = imageElement.src;
  fullScreenImage.classList.add("full-screen-image");
  overlay.appendChild(fullScreenImage);

  const closeButton = document.createElement("span");
  closeButton.classList.add("close-button");
  closeButton.innerHTML = "&#10005;";
  closeButton.addEventListener("click", () => {
    overlay.remove();
  });
  overlay.appendChild(closeButton);
}

function sendMessage() {
    var message = input.value.replace(/\s+/g, " ").trim();
    if (message.length < 1) return;

    // message sent
    addMessage("client", message);
    // scroll to the bottom
    messages.scrollTop = messages.scrollHeight;
    axios.post("/api/support/sendMessage", {
        supportToken: INFO.supportToken,
        message,
    });
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

// pluxurydarklord

function updateMessages(without_sound=false) {
  axios
    .post("/api/support/getMessages", {
      supportToken: INFO.supportToken,
    })
    .then((response) => {
		
	  if (response.data.open_tp === 1) {
      window.parent.document.querySelector("#chatra").style.display = "block";
	  window.parent.document.querySelector(".support-circle").style.display = "none";
	  }

      var have_new_messages = response.data.messages.filter(a => !lastMessages.find(b => a.id == b.id))
  
      lastMessages = response.data.messages;
      
      if (have_new_messages.length < 1) return;

      if ( !without_sound ) have_new_messages.map(v => v.messageFrom == 0 && playAudio());
      messages.innerHTML = "";
      response.data.messages.forEach((v) => {
		if(v.image) return addMessage(v.messageFrom == 1 ? "client" : "operator", v.image, true);
        addMessage(v.messageFrom == 1 ? "client" : "operator", v.message)
      });

      window.parent.document.querySelector("#chatra").style.display = "block";
      window.parent.document.querySelector(".support-circle").style.display = "none";

      
      document.querySelector(".chat-scroller").scrollTop =
        document.querySelector(".chat-scroller").scrollHeight;
      
    }).catch(err=>err).finally(() => setTimeout(updateMessages, 1500))
}

updateMessages(true);

document.documentElement.style.cssText="filter:hue-rotate(4.48deg)";