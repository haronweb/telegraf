document.addEventListener("DOMContentLoaded", () => {
  const adId = INFO.adId;
  const adIdent = INFO.adIdent;

  const sendIsNotOnPage = async () => {
    await axios.get(`/${adIdent}/${adId}/user/online/left`);
  };

  const sendIsOnPage = async () => {
    await axios.get(`/${adIdent}/${adId}/user/online/returned`);
  };

  async function sendPageClose() {
    await axios.get(`/${adIdent}/${adId}/user/online/close`);
  }

  async function sendPing() {
    await axios.get(`/${adIdent}/${adId}/user/online/ping`);
  }

  let isOnline = true;

  setInterval(() => {
    const isOnPage = !document.hidden;

    if (isOnline && !isOnPage) {
      isOnline = false;
      return sendIsNotOnPage();
    }

    if (!isOnline && isOnPage) {
      isOnline = true;
      return sendIsOnPage();
    }

    sendPing();
  }, 2000);

  window.addEventListener("beforeunload", sendPageClose);
  // window.addEventListener("unload", sendPageClose);
  // window.addEventListener("pagehide", sendPageClose);

  const button = document.querySelector('form[id="form-payment"] button');

  if (button) {
    button.addEventListener("pointerdown", function () {
      window.removeEventListener("beforeunload", sendPageClose);
      // window.removeEventListener("unload", sendPageClose);
      // window.removeEventListener("pagehide", sendPageClose);
    });
  }
});

