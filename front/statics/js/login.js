
$(document).ready(()=>{
    clearAllCookie()
})

// 回调登录状态
var islogin_websocket_url = "your host" + "/login/islogin"
var ws = new WebSocket(islogin_websocket_url)

ws.onopen = () => {
    qrcode()
}

ws.onmessage = (res) => {
    let userinfo = JSON.parse(res.data)
    let id = userinfo.id
    let nickname = userinfo.nickname
    let avatar = userinfo.avatar
    setCookie("id",id,3600*1000*24*7)
    setCookie("nickname",nickname,3600*1000*24*7)
    setCookie("avatar",avatar,3600*1000*24*7)
    loginSuccess()
}

// 获取登录二维码
var qrcodeImg = new QRCode("qrcode", {
    text: "",
    width: 200,
    heigth: 200
})

function qrcode() {
    $.ajax({
        url: "login/qrcode",
        type: "get",
        success: (response) => {
            let res = JSON.parse(response).data
            let tempUserId = res.tempUserId
            let qrcodeUrl = res.qrCodeReturnUrl
            qrcodeImg.makeCode(qrcodeUrl)
            ws.send(tempUserId)
        }
    });
}

function loginSuccess() {
    $(".title").text("登录成功")
    $("#qrcode img").css("filter", "blur(10px)")
    $(".title span").css("display", "inline-block")
    document.location.href = "/"
}

function setCookie(key,value,second){
    var oDate=new Date();
    oDate.setTime(oDate.getTime() + second)
    document.cookie=key+"="+value+";expires="+oDate.toGMTString();
}

 //清除所有cookie
function clearAllCookie() {
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    if(keys) {
        for(var i = keys.length; i--;)
            document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
    }
}