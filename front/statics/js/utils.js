// 触发幕布
function OpenShade() {
    $(".shade").css("opacity", "0.6").css("z-index", 10)
}

// 获取cookie
function getCookie(key) {
    var arr1 = document.cookie.split("; ");//由于cookie是通过一个分号+空格的形式串联起来的，所以这里需要先按分号空格截断,变成[name=Jack,pwd=123456,age=22]数组类型；
    for (var i = 0; i < arr1.length; i++) {
        var arr2 = arr1[i].split("=");//通过=截断，把name=Jack截断成[name,Jack]数组；
        if (arr2[0] == key) {
            return decodeURI(arr2[1]);
        }
    }
}

function login(){
    // document.location.href = "/login"
}

// 右下角通知弹窗
var closeAlertId
function alert(level, content) {
    clearTimeout(closeAlertId)
    let color = ""
    switch (level) {
        case "info":
            color = "#34D372"
            break
        case "warm":
            color = "#FF7270"
            break
    }
    $(".alertContent").text(content)
    if ($(".alertContent").width() / $(".alertBox").width() >= 0.8) {
        $(".alertContent").css("width", "90%")
    }
    $(".alertBox").css("backgroundColor", color).css("bottom", "10px")
    closeAlertId = setTimeout(() => {
        $(".closeAlert").click()
    }, 5000);
}

// alertBox: expandAlert
var expand = false
$(".expandAlert").click(() => {
    if (!expand) {
        $(".alertBox").css("height", "120px")
        $(".alertContent").css("height", "80px").css("white-space", "normal")
        $(".expandAlert").html('<svg t="1635844277618" class="icon" viewBox="0 0 1812 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1589" width="20" height="20"><path d="M901.41708 1023.939767L1784.730777 140.204441c32.284769-32.224537 32.043838-84.32589-0.481862-116.309495a83.422398 83.422398 0 0 0-117.27322 0.481862L901.838709 789.87519 142.002208 24.617739A83.301933 83.301933 0 0 0 24.728989 23.714247a81.73588 81.73588 0 0 0-0.903492 116.309496l877.591583 883.916024z" fill="" p-id="1590"></path></svg>')
    } else {
        $(".alertBox").css("height", "60px")
        $(".alertContent").css("height", "40px").css("white-space", "nowrap").css("width", "90%")
        $(".expandAlert").html('<svg t="1635843808394" class="icon" viewBox="0 0 1806 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1589" width="20" height="20"><path d="M906.459256 0L24.012198 883.772235c-32.225882 32.225882-31.984941 84.329412 0.481882 116.314353 32.466824 31.984941 84.931765 31.744 117.157647-0.481882l764.385882-765.530353 759.085177 765.289412a83.245176 83.245176 0 0 0 117.157647 0.903529 81.859765 81.859765 0 0 0 0.903529-116.314353L906.459256 0z" fill="" p-id="1590"></path></svg>').css("display", "none")
        $(".closeAlert").css("display", "none")
    }
    expand = !expand
})
// alertBox: closeAlert
$(".closeAlert").click(() => {
    clearTimeout(closeAlertId)
    $(".alertBox").css("bottom", "-150px")
})

// alertBox:hover
$(".alertBox").hover(() => {
    clearTimeout(closeAlertId)
    $(".closeAlert").css("display", "block")
    if ($(".alertContent").width() / $(".alertBox").width() >= 0.8) {
        $(".expandAlert").css("display", "block")
        $(".alertContent").css("width", "80%")
    }
}, () => {
    if (!expand) {
        $(".closeAlert").css("display", "none")
        $(".expandAlert").css("display", "none")
        if ($(".alertContent").width() / $(".alertBox").width() >= 0.8) {
            $(".alertContent").css("width", "90%")
        }
    }
    closeAlertId = setTimeout(() => {
        $(".closeAlert").click()
    }, 5000);
})

var confirmObject;
function confirm(question,object){
    confirmObject = object
    $(".confirmBox").css("display","block")
    setTimeout(() => {
        $(".confirmBox .confirm").css("top","5px")
    }, 50);
    
    $(".question").text(question)
}

// confirmBox: no button
$(".confirmBox .no").click(function(){
    $(".confirmBox .confirm").css("top","-70px")
    setTimeout(() => {
        $(".confirmBox").css("display","none")
        $(".question").text("")
    }, 300);
})

// 点击退出按钮
$(".quitBtn").click(() => {
    document.location.href = "login"
})

// 点击头像
$(".titleBar .avatar").click(() => {
    $(".persion-menu").css("display", "block").css("opacity", "1").focus()
})

$(".persion-menu").blur(() => {
    $(".persion-menu").css("opacity", "0")
    setTimeout(() => {
        $(".persion-menu").css("display", "none")
    }, 200);
})

// 点击home返回首页
$(".home").click(()=>{
    document.location.href = "/"
})

// 获取url query
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return decodeURIComponent(pair[1]);}
       }
       return(false);
}

// 点击 `添加项目` 盒子的取消按钮
$(".addProjectBox .cancel").click(() => {
    $(".shade").click()
})

function setCookie(name,value)
{
var Days = 30;
var exp = new Date();
exp.setTime(exp.getTime() + Days*24*60*60*1000);
document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}

function aseEncrypt(msg, key,iv) {
    key = PaddingLeft(key, 16);//保证key的长度为16byte,进行'0'补位
    iv = PaddingLeft(iv,16)
    key = CryptoJS.enc.Utf8.parse(key);
    iv = CryptoJS.enc.Utf8.parse(iv)
    // 加密结果返回的是CipherParams object类型
    var encrypted = CryptoJS.AES.encrypt(msg, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,// CBC算法
        padding: CryptoJS.pad.Pkcs7 //使用pkcs7 进行padding 后端需要注意
    });
    // ciphertext是密文,toString()内传编码格式,比如Base64,这里用了16进制
    // 如果密文要放在 url的参数中 建议进行 base64-url-encoding 和 hex encoding, 不建议使用base64 encoding
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex)  //后端必须进行相反操作
}
// 确保key的长度,使用 0 字符来补位
// length 建议 16 24 32
function PaddingLeft(key, length) {
    let pkey = key.toString();
    let l = pkey.length;
    if (l < length) {
        pkey = new Array(length - l + 1).join('0') + pkey;
    } else if (l > length) {
        pkey = pkey.slice(length);
    }
    return pkey;
}