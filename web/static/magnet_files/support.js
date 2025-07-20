const messages = document.getElementById("chat-messages"),
  input = document.querySelector("#chat-input-text");

var lastMessages = [];
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

document.querySelector("#send_message_form").addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

document.querySelector('#file_upload_input').addEventListener('click', (e) => {
  this.value = "";
});

document.querySelector('#file_upload_input').addEventListener('change', (e) => {
  sendMessage();
});

// function addMessage(side, message) {
//   messages.innerHTML +=
//     '<div class="chat-message is-' +
//     side +
//     '">' +
//     '<div class="chat-message__content">' +
//     '<div class="chat-message__bubble-wrapper">' +
//     '<div class="chat-message__bubble chat-bubble chat-bubble--' +
//     side +
//     ' js-message-bubble js-open-chat">' +
//     '<div class="chat-bubble__inner">' +
//     '<div class="chat-bubble__message">' +
//     '<span class="chat-bubble__message-text parsed-text parsed-text--message parsed-text' +
//     (side == "client" ? "--dark-bg" : "--very-light-bg") +
//     '">' +
//     message +
//     "</span>" +
//     "</div>" +
//     "</div>" +
//     "</div>" +
//     "</div>" +
//     "</div>" +
//     "</div>";
// }





function addMessage(side, message) {
  const vm = JSON.parse(message)

  //let text = vm.photo !== "undefined" ? '<img src="/' + vm.photo + '" /> ' + (vm.text !== "undefined" ? vm.text : "") : vm.text

  console.log(vm)

  // html = `<a class="attachment-image" style="width: 300px;" target="_blank" rel="nofollow noopener" href="/${vm.photo}">
  //     <div class="attachment-image__inner" style="padding-bottom: 56.264066016504124%;">
  //       <div class="attachment-image__thumb-holder">
  //         <div class="attachment-image__thumb-holder-table">
  //             <div class="attachment-image__thumb-holder-row">
  //                 <div class="attachment-image__thumb-holder-cell">
  //                 <img class="attachment-image__thumb" src="/${vm.photo}" alt="macos-big-sur-5120x2880-mountains-apple-october-2020-event-5k-23121.jpg">  
  //                 </div>
  //             </div>
  //         </div>
  //       </div>
  //     </div>
  //   </a>`;

  let html = "";
  if(vm.photo) {
    html = `<a class="attachment-image" id="img" style="width: 300px;" target="_blank" rel="nofollow noopener" src="/${vm.photo}">
    <div class="attachment-image__inner" style="padding-bottom: 105%;">
        <div class="attachment-image__thumb-holder">
            <div class="attachment-image__thumb-holder-table">
                <div class="attachment-image__thumb-holder-row">
                    <div class="attachment-image__thumb-holder-cell">
                        
                            <img class="attachment-image__thumb" src="/${vm.photo}" alt="wzjgq1xkzjbs6swcrt1a.jpg">
                        
                    </div>
                </div>
            </div>
        </div>

        
    </div>
</a>`;
  } else {
    html = vm.text;
  }

  console.log(html);

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
    html +
    "</span>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";
}

function sendMessage() {
  if(file_upload_input?.files[0]) {
    let formData = new FormData();           
    formData.append("file", file_upload_input.files[0] ?? null);
    formData.append("supportToken", INFO.supportToken)
    formData.append("message", message)


    axios.post("/api/support/sendMessage", formData);

    document.querySelector('input[type=file]').value = '';

    document.querySelector(".chat-scroller").scrollTop =
    document.querySelector(".chat-scroller").scrollHeight;
    input.value = "";

    return;
  }


  var message = input.value.replace(/\s+/g, " ").trim();
  if (message.length < 1) return;
  addMessage("client", JSON.stringify({
    text: message
  }));


  let formData = new FormData();           
  formData.append("supportToken", INFO.supportToken)
  formData.append("message", message)

  axios.post("/api/support/sendMessage", formData);

  document.querySelector('input[type=file]').value = '';

  document.querySelector(".chat-scroller").scrollTop =
    document.querySelector(".chat-scroller").scrollHeight;
  input.value = "";
}

function playAudio(){
    const audio = new Audio();
    audio.src = "/audio/new_message.mp3";
    audio.autoplay = true;
    audio.play();
    audio.onended = function (){
        audio.pause();
        delete audio;
    }
}

function updateMessages(without_sound=false) {
  axios
    .post("/api/support/getMessages", {
      supportToken: INFO.supportToken,
    })
    .then((response) => {

      var have_new_messages = response.data.messages.filter(a => !lastMessages.find(b => a.id == b.id))
  
      lastMessages = response.data.messages;
      
      if (have_new_messages.length < 1) return;

      if ( !without_sound ) have_new_messages.map(v => v.messageFrom == 0 && playAudio());
      messages.innerHTML = "";
      response.data.messages.forEach((v) =>
        addMessage(v.messageFrom == 1 ? "client" : "operator", v.message)
      );

      window.parent.document.querySelector("#chatra").style.display = "block";
      window.parent.document.querySelector(".support-circle").style.display = "none";

      
      document.querySelector(".chat-scroller").scrollTop =
        document.querySelector(".chat-scroller").scrollHeight;
      
    }).catch(err=>err).finally(() => setTimeout(updateMessages, 1500))
}

updateMessages(true);