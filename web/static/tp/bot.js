<div class="
   chatra--webkit
   chatra--style-round
   chatra--side-bottom
   chatra--pos-right
   chatra--visible
   chatra--expanded
   chatra--fast-toggle
 " id="chatra" data-turbolinks-permanent="" style="
   width: 380px;
   height: 600px;
   transform: none;
   z-index: 2147483647;
   display: none;
 ">
    <div id="chatra__iframe-wrapper">
      <iframe frameborder="0" id="chatra__iframe" allowtransparency="true" title="Chatra live chat" allow="autoplay"
        src="/supportChatFrame/<%=ad.id%>" style="width: 380px; height: 600px; position: absolute"></iframe>
    </div>
  </div>
  <div class="support-circle"
    onclick="document.querySelector('#chatra').style.display = 'block';this.style.display = 'none'"></div>