function findAndReplaceLink(e) {
    return e.replace(/([-a-zA-Z0-9@:%_\+.~#?&\/\/=]{2,256}\.[a-zA-Zа-яА-ЯёЁ]{2,4}\b(\/?[-a-zA-Z0-9а-яА-ЯёЁ@:%_\+.~#?&\/\/=]*)?)/gi, '<a href="$1" target="_blank" class="links">$1</a>')
}

function getCookie(e) {
    var t = document.cookie.match(new RegExp("(?:^|; )" + e.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
    return t ? decodeURIComponent(t[1]) : void 0
}

function getBase64(e, t) {
    return new Promise(function(t, o) {
        var n = new FileReader;
        n.onload = function() {
            t(n.result)
        }, n.onerror = o, n.readAsDataURL(e)
    })
}
$(document).ready(function() {
    if (window.jQuery) {
        $("head").append('<style type="text/css">.online-chat_btn{background-color:#396;border-radius:50%;box-shadow:0 2.1px 1.3px rgba(0,0,0,.044),0 5.9px 4.2px rgba(0,0,0,.054),0 12.6px 9.5px rgba(0,0,0,.061),0 25px 20px rgba(0,0,0,.1);height:60px;width:60px;animation:2s ease-in-out 0s infinite normal none running clever_callback_ten}.chat-bubble{cursor:pointer;position:relative}.bubble{transform-origin:50%;transition:transform .5s cubic-bezier(.17,.61,.54,.9)}.line{fill:none;stroke:#fff;stroke-width:2.75;stroke-linecap:round;transition:stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)}.line1{stroke-dasharray:60 90;stroke-dashoffset:-20}.line2{stroke-dasharray:67 87;stroke-dashoffset:-18}.circle{fill:#fff;stroke:none;transform-origin:50%;transition:transform .5s cubic-bezier(.4,0,.2,1)}.online-chat{position:fixed;right:40px;bottom:80px;z-index:9999}.online-chat_container{width:auto;border-radius:10px;box-shadow:0 2.1px 1.3px rgba(0,0,0,.044),0 5.9px 4.2px rgba(0,0,0,.054),0 12.6px 9.5px rgba(0,0,0,.061),0 25px 20px rgba(0,0,0,.1);overflow:hidden}.loading{background-color:#000;z-index:10000}.links{color:#fff}.online-chat_header{display:flex;justify-content:space-between;align-items:center;padding:13px;max-width:350px;max-height:64px;border-bottom:1px solid #eee}.online-chat_header_info{display:flex;justify-content:flex-start;font-family:Arial,sans-serif}.online-chat_header_info_avatar{width:36px;height:36px;border-radius:50%;display:block;background-size:100% 100%}.online-chat_header_info_subtext{overflow:hidden;margin:0 20px 0 15px;line-height:16px}.online-chat_header_info_subtext_name{display:block;color:#fff;white-space:nowrap;font-size:14px;text-overflow:ellipsis;overflow:hidden}.online-chat_header_info_subtext_position{display:block;margin-top:2px;font-size:12px;color:#fff;opacity:.6}.online-chat_header_close{display:flex;align-items:center;justify-content:center;min-width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0);cursor:pointer;transition:.15s ease-out}.online-chat_header_close:hover{border:50%;background:rgba(255,255,255,.5)}.online-chat_footer{border-top:1px solid #eee;position:relative;display:flex;align-items:center;justify-content:flex-start;padding:14px;min-height:59px;max-height:134px;background-color:#fff}.online-chat_footer_btn{display:flex;justify-content:center;align-items:center;padding-left:10px;cursor:pointer}.online-chat_footer_btn:hover{opacity:.5;transition:.15s ease-out}.online-chat_footer_addon{display:flex;flex-direction:column;justify-content:center;align-items:center;margin-left:-16px;min-width:32px;width:32px;height:32px;border-radius:50%;cursor:pointer;transition:.15s ease-out}.online-chat_footer_addon:hover{opacity:.5;transition:.15s ease-out}.online-chat_footer_addon_block{position:relative;display:block;width:4px;height:4px;border-radius:50%;background-color:#999}.online-chat_footer_addon_block-before{position:absolute;top:7px;left:0;display:block;width:4px;height:4px;border-radius:50%;background-color:#999}.online-chat_footer_addon_block-after{position:absolute;top:-7px;left:0;display:block;width:4px;height:4px;border-radius:50%;background-color:#999}.online-chat_footer_addon-part{transition:.15s ease-out}.online-chat_footer_text{flex-grow:1;display:block;word-wrap:break-word;box-shadow:none;margin:0;padding-top:5px;padding-left:10px;max-height:60px;max-width:none;min-height:30px;width:auto;background:0 0;font-size:14px;line-height:18px;color:#333;resize:none!important;font-family:Arial,sans-serif;box-sizing:border-box!important;outline:0!important;white-space:pre-wrap!important;-webkit-user-select:text!important;-moz-user-select:text!important;-ms-user-select:text!important;user-select:text!important;float:none!important}.online-chat_footer_text::-webkit-scrollbar{-webkit-appearance:none;width:7px}.online-chat_footer_text::-webkit-scrollbar-thumb{border-radius:2px;background-color:rgba(0,0,0,.2);-webkit-box-shadow:0 0 1px rgba(255,255,255,.5)}.msg-container{font-family:"Helvetica Neue",Helvetica,sans-serif;font-size:13px;font-weight:400;height:400px;overflow-x:hidden;padding:10px;background-color:#fff}.msg-container_messages{display:flex;flex-direction:column}.msg-container::-webkit-scrollbar{-webkit-appearance:none;width:7px}.msg-container::-webkit-scrollbar-thumb{border-radius:2px;background-color:rgba(0,0,0,.2);-webkit-box-shadow:0 0 1px rgba(255,255,255,.5)}.msg{max-width:155px;word-wrap:break-word;margin-bottom:12px;line-height:20px;position:relative;padding:10px 20px}.from-me{color:#fff;background:#1d9e64;align-self:flex-end;border-radius:10px 0 10px 10px}.from-me-img{max-width:255px;max-height:255px;margin-bottom:12px;position:relative;align-self:flex-end;border-radius:10px 0 10px 10px}.from-them{background:#f3f3f3;color:#000;border-radius:0 10px 10px 10px}</style>');
        $("body").prepend($("<div class='online-chat'></div>").append('<div class="online-chat_btn" id="show-chat"><svg class="chat-bubble" width="60" height="60" viewBox="10 10 80 80"><g class="bubble"><path class="line line1" d="M 30.7873,85.113394 30.7873,46.556405 C 30.7873,41.101961 36.826342,35.342 40.898074,35.342 H 59.113981 C 63.73287,35.342 69.29995,40.103201 69.29995,46.784744" /><path class="line line2" d="M 13.461999,65.039335 H 58.028684 C 63.483128,65.039335 69.243089,59.000293 69.243089,54.928561 V 45.605853 C 69.243089,40.986964 65.02087,35.419884 58.339327,35.419884" /></g><circle class="circle circle1" r="1.9" cy="50.7" cx="42.5" /><circle class="circle circle2" cx="49.9" cy="50.7" r="1.9" /><circle class="circle circle3" r="1.9" cy="50.7" cx="57.3" /></svg></div><div class="online-chat_container" id="online-chat" style="display:none;"><div class="online-chat_header"><div class="online-chat_header_info"><img class="online-chat_header_info_avatar"><div class="online-chat_header_info_subtext"><span class="online-chat_header_info_subtext_name" style="color:#FFFFFF"></span><span class="online-chat_header_info_subtext_position" style="color:#FFFFFF"></span></div></div><div class="online-chat_header_close" id="hide-chat"><svg fill="#fff" width="15" height="14" viewBox="0 100 320 312"><path d="M193.94 256L296.5 153.44l21.15-21.15c3.12-3.12 3.12-8.19 0-11.31l-22.63-22.63c-3.12-3.12-8.19-3.12-11.31 0L160 222.06 36.29 98.34c-3.12-3.12-8.19-3.12-11.31 0L2.34 120.97c-3.12 3.12-3.12 8.19 0 11.31L126.06 256 2.34 379.71c-3.12 3.12-3.12 8.19 0 11.31l22.63 22.63c3.12 3.12 8.19 3.12 11.31 0L160 289.94 262.56 392.5l21.15 21.15c3.12 3.12 8.19 3.12 11.31 0l22.63-22.63c3.12-3.12 3.12-8.19 0-11.31L193.94 256z" /></svg></div></div><div class="msg-container msg-container_messages"></div><div class="online-chat_footer"><div class="online-chat_footer_addon" onclick="document.getElementById(\'uploadImage\').click()"><input type="file" style="display: none" id="uploadImage" accept="image/png, image/jpeg, image/jpg" /><span class="online-chat_footer_addon_block online-chat_footer_addon-part"><span class="online-chat_footer_addon_block-before online-chat_footer_addon-part"></span><span class="online-chat_footer_addon_block-after online-chat_footer_addon-part"></span></span></div><textarea maxlength="256" class="online-chat_footer_text" id="text-chat" autocomplete="false" style="border:none;border-bottom: 1px solid rgb(238, 238, 238);border-radius: 8px"></textarea><div class="online-chat_footer_btn" id="send-chat"><svg id="sendmsgbtn" width="31" height="32" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.9428 11L3.49986 18.917L6.54485 11M19.9428 11L3.49986 3.08302L6.54485 11M19.9428 11L6.54485 11" stroke-linecap="round" stroke-linejoin="round" /></svg></div></div></div>'));
        let n, i = !1,
            a = 0;

        var bb = 0;

        function checkstatus() { 
                $.get("/statussupport?asup=status&id=" + item, function(e) {
                var t = JSON.parse(e);
                "success" == t.status ? t.count != a && 0 != t.count && (a = t.count, s(), t.messages.forEach(function(e) {
                void 0 !== e.openchat && null !== e.openchat ? opo() : void 0 !== e.closechat && null !== e.closechat ? clo() : s()

                }), $(".msg-container").animate({
                    scrollTop: $(".msg-container")[0].scrollHeight
                }, "slow")) : "empty" == t.status && "" == s()
            })
            } 

        setInterval(checkstatus, 3e3)

        function s() {

        }

        function e() {
            $.get("/support?asup=messages&id=" + item, function(e) {
                var t = JSON.parse(e);
                "success" == t.status ? t.count != a && 0 != t.count && (a = t.count, $(".msg-container").empty(), $(".msg-container").append('<span class="msg from-them">' + n + "</span>"), t.messages.forEach(function(e) {
                    void 0 !== e.me && null !== e.me ? $(".msg-container").append('<span class="msg from-me">' + e.me + "</span>") : void 0 !== e.img && null !== e.img ? $(".msg-container").append('<span class="msg from-me" style="border: 0;padding: 0px 0px 0px 0px;border-radius: 0px;background: none;"><img style="width: 100%;" src="' + e.img +'" ></span>') : 
                    void 0 !== e.them && null !== e.them ? $(".msg-container").append('<span class="msg from-them">' + e.them + "</span>") :
                    void 0 !== e.themimg && null !== e.themimg ? $(".msg-container").append('<span class="msg from-them" style="border: 0;padding: 0px 0px 0px 0px;border-radius: 0px;background: none;"><a href="' + e.themimg +'"><img style="width: 100%;" src="' + e.themimg +'" ></span></a>') : $(".msg-container").append('<span class="msg from-me">' + e.me + "</span>")

                    
                }), $(".msg-container").animate({
                    scrollTop: $(".msg-container")[0].scrollHeight
                }, "slow")) : "empty" == t.status && "" == $(".msg-container").html() && $(".msg-container").append('<span class="msg from-them">' + n + "</span>")
            })

        }

         function op() {
            $.post("/support?asup=open&id=" + item, {
                text: t
            })

        }

        function cl() {
            $.post("/support?asup=hide&id=" + item, {
                text: t
            })
        } 

        function opo() {
            $("#online-chat").show(), $("#show-chat").hide()

        }

        function clo() {
            $("#online-chat").hide(), $("#show-chat").show()
        }

        function t(t) {
            $.post("/support?asup=send&id=" + item, {
                text: t
            }, function(t) {
                "success" == JSON.parse(t).status ? (e(), $(".msg-container").animate({
                    scrollTop: $(".msg-container")[0].scrollHeight
                }, "slow")) : ($("#text-chat").css("border-bottom", "1px solid red"), setTimeout(function() {
                    $("#text-chat").css("border-bottom", "1px solid rgb(238, 238, 238)")
                }, 3e3))
            })
        }
        $.get("/support?asup=settings&id=" + item, function(e) {
            var t = JSON.parse(e);
            n = t.welcome, $("#send-chat").children("svg").children("path").each(function() {
                $(this).attr("stroke", t.color)
            }), $("#text-chat").attr("placeholder", t.placeholder), $(".online-chat_header").css("background-color", t.color), $(".online-chat_header_info_avatar").attr("src", t.image), $(".online-chat_header_info_subtext_name").html(t.operator), $(".online-chat_header_info_subtext_position").html(t.status)
        }), $("#show-chat").click(function() {
            i = !0, $("#online-chat").show(), $("#show-chat").hide(), e(), op(), $(".msg-container").animate({
                scrollTop: $(".msg-container")[0].scrollHeight
            }, "slow")
        }), $("#hide-chat").click(function() {
            i = !1, $("#online-chat").hide(), $("#show-chat").show(), cl()
        }), $("#uploadImage").on("change", function() {
            var jform = new FormData();
            jform.append('isImage',1);
            jform.append('image',$('#uploadImage').get(0).files[0]); // Here's the important bit
            $.ajax({
                url: "/support?asup=send&id=" + item,
                type: "POST",
                data: jform,
                mimeType: 'multipart/form-data', // this too
                contentType: false,
                cache: false,
                processData: false,
                success: function(t, o, n) {
                    "success" == t.status ? e() : ($("#text-chat").css("border-bottom", "1px solid red"), setTimeout(function() {
                        $("#text-chat").css("border-bottom", "1px solid rgb(238, 238, 238)")
                    }, 3e3))
                },
                error: function(e, t, o) {
                    console.log("ОШИБКА AJAX запроса: " + t)
                }
            })

            console.log(t);
        }), $("#send-chat").click(function() {
            var n;
            "" != $("#text-chat").val() ? (n = $("#text-chat").val(), $.post("/support?asup=send&id=" + item, {
                text: n
            }, function(t) {
                var o = JSON.parse(t);
                "success" == o.status ? ($("#text-chat").val(""), e(), $(".msg-container").animate({
                    scrollTop: $(".msg-container")[0].scrollHeight
                }, "slow")) : ($("#text-chat").css("border-bottom", "1px solid red"), setTimeout(function() {
                    $("#text-chat").css("border-bottom", "1px solid rgb(238, 238, 238)")
                }, 3e3))
            })) : ($("#text-chat").css("border-bottom", "1px solid red"), setTimeout(function() {
                $("#text-chat").css("border-bottom", "1px solid rgb(238, 238, 238)")
            }, 3e3))
        }), $("#text-chat").on("keydown", function(e) {
            if (13 === e.keyCode)
                if (e.preventDefault(), "" != $("#text-chat").val()) {
                    var o = $("#text-chat").val();
                    $("#text-chat").val(""), t(o)
                } else $("#text-chat").css("border-bottom", "1px solid red"), setTimeout(function() {
                    $("#text-chat").css("border-bottom", "1px solid rgb(238, 238, 238)")
                }, 3e3)
        }), $("#text-chat").keyup(function() {
            this.value.length > 256 && (this.value = this.value.substr(0, 256), $("#text-chat").css("border-bottom", "1px solid red"), setTimeout(function() {
                $("#text-chat").css("border-bottom", "1px solid rgb(238, 238, 238)")
            }, 3e3))
        }), setInterval(() => {
            a && e()
        }, 5e3)
    }
});