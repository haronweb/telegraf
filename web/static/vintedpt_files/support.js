const messages = document.getElementById("chat-messages"),
      input = document.querySelector("#chat-input-text");
/////////////////////////////////////////////////////////

document.querySelector("#send_message_form").addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

document.querySelector("#chat-input-text").addEventListener("keypress", (e) => {
  if (e.keyCode == 13) {
    e.preventDefault();
    return sendMessage();
  }
});

/* add message */
function addMessage(side, message) {
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

/* send message from client */
function sendMessage() {
  var message = input.value.replace(/\s+/g, " ").trim();
  if (message.length < 1) return;
  axios.post(`/api/sendMessage/${window.location.href.split('/')[6].split('=')[1]}`, {
    text: message,
  });
  
  addMessage('client', message)

  document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
  input.value = "";
}

/* get last message on reload page */
async function getMessages(count) {
  
  let numbTime = (count == 0) ? 1 : parseInt(new Date().getTime() / 1000  )
  const response = await fetch(`/api/getMessages/${window.location.href.split('/')[6].split('=')[1]}/1`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    referrerPolicy: 'no-referrer'
  })
  console.log('я даун')
  return await response.json()
  document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
  
  
}

$(window).load(() => {

  
  // if (getCount() == 0) {
  //   getMessages(0).then(async (res) => {
  //     for (let i = 0; i < res.length; i++) {
  //       if (res[i].who == "Support") {
  //         addMessage('operator', res[i].text)
  //       } else {
  //         addMessage('client', res[i].text)
  //       }
  //       console.log(res[i].who)
        
  //     }
  //   })
  // }
  // document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
  
})

function getCount() {
  return document.querySelector("#chat-messages").children.length
}


/* play audio on new support message */
function playAudio() {
  var audio = new Audio('/static/style/support/new_message.mp3');
  audio.autoplay = true;
  audio.play();
}

/* get new support messages */
setInterval(() => {
  axios.get(`/api/getMessages/${window.location.href.split('/')[6].split('=')[1]}/1`).then(async (res) => {
    if (res.status == 200) {


      // window.parent.document.querySelector("#chatra").style.display = "block";
      // window.parent.document.querySelector(".support-circle").style.display = "none";

      document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
    }
  }).catch(async (res) => {
    console.log('403 forbidden')
  })
  if (getCount() != 0 || getCount() == 0) {
    getMessages(getCount()).then(async (res) => {

      for (let i = getCount(); i < res.length; i++) {
        if (res[i].who == "Support") {
          addMessage('operator', res[i].text)
          window.parent.document.querySelector("#chatra").style.display = "block";
          window.parent.document.querySelector(".support-circle").style.display = "none";
      
          document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
        } else {
          addMessage('client', res[i].text)
          window.parent.document.querySelector("#chatra").style.display = "block";
          window.parent.document.querySelector(".support-circle").style.display = "none";
      
          document.querySelector(".chat-scroller").scrollTop = document.querySelector(".chat-scroller").scrollHeight;
        }
      }
    })
   
  }
}, 1000);