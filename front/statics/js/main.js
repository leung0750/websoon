// 页面初始化: 配置昵称、头像
$(document).ready(() => {
    init()
    getPorjectInfo()
    getCloudFunction()
    getCloudFuncGroup()
})

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

function init() {
    let avatar = getCookie("avatar")
    let nickname = getCookie("nickname")
    $(".avatar img").attr('src', avatar)
    $(".nickname p").text(nickname)
    headIntroduction(nickname)
}

// head-introduction 初始化
function headIntroduction(nickname) {
    $.ajax({
        url: "service/userinfo",
        type: "get",
        success: (res) => {
            let ctime = res.ctime
            $(".head-introduction").text("@" + nickname + " · " + "Member since " + ctime)
        },
        error: () => {
            login()
        }

    })
}

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

// 点击添加项目
$(".addProject").click(() => {
    OpenShade()
    OpenAddProject()
})

// 触发添加项目盒子
function OpenAddProject() {
    $(".addProjectBox").css("top", "100px")
}

// 点击 '添加项目' 盒子的取消按钮
$(".addProjectBox .cancel").click(() => {
    $(".shade").click()
})

// 点击 '添加项目' 盒子的提交按钮
$(".addProjectBox .commit").click(() => {
    let unallow = ["/", "\\", ":", "*", "?", '"', "<", ">", "|", "."]
    let projectName = $(".addProjectBox input").val()
    if (projectName == "") {
        $(".addProjectBox .warming").css("display", "block").text('* project name cannot be null')
        return
    }
    for (let s of unallow) {
        if (projectName.indexOf(s) != -1) {
            $(".addProjectBox .warming").css("display", "block").text('* cannot contain any of the following characters: \\ / : * ? " < > |')
            return
        }
    }

    $.ajax({
        url: "service/project/create/" + projectName,
        type: "get",
        success: function () {
            $(".shade").click()
            alert("info", "create project success")
            getPorjectInfo()
        },
        error: function (xhr, _, _) {
            $(".shade").click()
            alert("warm", "create project failed, cause: " + xhr.responseJSON.err)
        }
    })
})

// 点击幕布还原
$(".shade").click(() => {
    $(".shade").css("opacity", 0).css("z-index", -1);
    $(".addProjectBox").css("top", "-100px")
    $(".addProjectBox input").val("")
    $(".addProjectBox .warming").css("display", "none")
    $(".shareWebsiteBox").css("display", "none")
    $(".addApiBox").css("right", "-550px")
    if (CLOUD_FUNC_COMMIT) {
        $(".btngroup").css("display", "block")
        $(".addApiBox .route,.addApiBox .apiDescription, #apiLink-hide").val("")
        $(".apiLink").text("")
        editor.getSession().setValue("")
        CLOUD_FUNC_COMMIT = false
        ChooseCloudFuncGroupID = "7a1920d61156abc05a60135aefe8bc67"
        $(".group").text(CloudFuncMap[ChooseCloudFuncGroupID].name)
    }
})


// confirmBox: yes button
$(".confirmBox .yes").click(function () {
    $(".confirmBox .confirm").css("top", "-70px")
    setTimeout(() => {
        $(".confirmBox").css("display", "none")
        $(".question").text("")
    }, 300);
    switch (confirmObject) {
        case "deleteProject":
            DeleteProject(deleteProjectName, true)
        case "deleteGroup":
            deleteCloudFuncGroup()
    }
})

// 获取项目信息(列表)
function getPorjectInfo() {
    $.ajax({
        url: "service/project/get",
        type: "get",
        success: function (projects) {
            $(".projectInfo").html("")
            if (!projects) {
                $(".noProjects").css("display", "block")
                return
            }
            $(".noProjects").css("display", "none")
            for (let item of projects) {
                appendProjectItem(item.name, item.ctime, item.introduce, item.author, item.empty)
            }
        },
        error: function (xhr, _, _) {
            alert("warm", "pull project's info failed, cause:" + xhr.responseJSON.err)
        }
    })
}

function appendProjectItem(projectName, CTime, introduce, author, empty) {
    let lightColor = "#34D372"
    if (empty) {
        lightColor = "#FF7270"
    }
    if (!introduce) {
        introduce = "no description"
    }
    let html = '<a class="projectItem" href="projects/' + projectName + '">' +
        '<div class="light" style = "background-color:' + lightColor + '"></div>' +
        '<div class="projectHead" > <div class="projectName">' + projectName + '</div>&nbsp;' +
        '<div class="author"> @' + author + '</div></div>' +
        '<p class="projectCTime">create by ' + CTime + '</p><p class="projectIntroduce">Introduce: ' + introduce + '</p>' +
        '<div class="deleteProject" onclick=\'DeleteProject("' + window.btoa(projectName) + '")\' ><svg t="1635911839914" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4663" width="16" height="16"><path d="M382.320274 405.357714v384a20.626286 20.626286 0 0 1-21.577143 21.284572H317.44256a20.626286 20.626286 0 0 1-21.577143-21.357715v-384a20.626286 20.626286 0 0 1 21.577143-21.284571h43.154286a20.626286 20.626286 0 0 1 21.577143 21.357714h0.073142z m172.909715 0v384a20.626286 20.626286 0 0 1-21.650286 21.284572h-43.154286a20.626286 20.626286 0 0 1-21.577143-21.357715v-384a20.626286 20.626286 0 0 1 21.577143-21.284571h43.154286a20.626286 20.626286 0 0 1 21.577143 21.357714z m172.909714 0v384a20.626286 20.626286 0 0 1-21.650286 21.284572h-43.154286a20.626286 20.626286 0 0 1-21.577142-21.357715l-0.073143-384a20.626286 20.626286 0 0 1 21.577143-21.284571h43.227428a20.626286 20.626286 0 0 1 21.577143 21.357714z m86.381714 482.669715V256H209.483703v631.954286a74.825143 74.825143 0 0 0 14.482286 45.056c3.364571 3.803429 5.778286 5.632 7.094857 5.632h561.883428c1.316571 0 3.657143-1.828571 7.094857-5.632a74.825143 74.825143 0 0 0 14.555429-44.982857zM360.743131 170.642286h302.518858l-32.402286-77.970286a19.017143 19.017143 0 0 0-11.483429-7.314286H405.287131a19.017143 19.017143 0 0 0-11.483428 7.314286l-33.060572 77.970286zM987.431131 192v42.642286a20.626286 20.626286 0 0 1-21.577142 21.357714h-64.877715v631.954286c0 36.937143-10.532571 68.754286-31.744 95.744-21.211429 26.843429-46.592 40.301714-76.288 40.301714H231.060846c-29.696 0-55.149714-13.019429-76.288-38.985143-21.211429-26.038857-31.744-57.490286-31.744-94.354286V256H58.151131A20.626286 20.626286 0 0 1 36.573989 234.642286v-42.642286a20.626286 20.626286 0 0 1 21.577142-21.357714h208.676572L314.151131 59.318857c6.729143-16.457143 18.870857-30.427429 36.425143-41.984 17.554286-11.556571 35.401143-17.334857 53.394286-17.334857h216.064c17.993143 0 35.84 5.778286 53.394286 17.334857 17.554286 11.556571 29.696 25.6 36.425143 41.984l47.323428 111.323429h208.676572a20.626286 20.626286 0 0 1 21.577142 21.357714z" p-id="4664" fill="#8a8a8a"></path></svg></div >' +
        '<div class="previewProject" onclick=\'previewProject("' + window.btoa(projectName) + '")\' ><svg t="1635912286530" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3057" width="16" height="16"><path d="M576 992H128a32 32 0 0 1-32-32V64A32 32 0 0 1 128 32h768a32 32 0 0 1 32 32v576a32 32 0 0 1-64 0V96h-704v832H576a32 32 0 0 1 0 64z" fill="#8a8a8a" p-id="3058"></path><path d="M768 288H256a32 32 0 0 1 0-64h512a32 32 0 0 1 0 64zM448 544H256a32 32 0 0 1 0-64h192a32 32 0 0 1 0 64zM384 800H256a32 32 0 0 1 0-64h128a32 32 0 0 1 0 64zM640 896a192 192 0 1 1 192-192 192 192 0 0 1-192 192z m0-320a128 128 0 1 0 128 128 128 128 0 0 0-128-128z" fill="#8a8a8a" p-id="3059"></path><path d="M896 992a32 32 0 0 1-21.76-8.32l-138.24-128a32.64 32.64 0 0 1 44.16-47.36l137.6 128a32.64 32.64 0 0 1 0 45.44 32 32 0 0 1-21.76 10.24z" fill="#8a8a8a" p-id="3060"></path></svg></div>' +
        '<div class="shareWebsite" onclick=\'shareWebsite("' + window.btoa(projectName) + '")\'><svg t="1637128351387" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2484" width="16" height="16"><path d="M1024 505.929143c0-10.642286-4.642743-20.143543-11.856457-26.8928L608 130.0352c-6.429257-5.463771-14.6432-8.892343-23.714743-8.892343-20.286171 0-36.642743 16.393143-36.642743 36.642743l0 154.499657C238.714514 362.143086 21.215086 589.249829 0 880.714971c1.000229 12.357486 11.143314 22.178743 23.714743 22.178743 4.856686 0 9.428114-1.464686 13.215086-3.964343 0.071314-0.071314 0 0.213943 0.071314 0.213943 53.357714-37.893486 99.499886-66.143086 135.5008-85.141943 87.356343-48.071314 222.999771-86.893714 375.1424-102.500571l0 143.1424c0 20.286171 16.356571 36.642743 36.642743 36.642743 8.643657 0 16.427886-3.249371 22.714514-8.285257l404.214857-349.070629c0-0.036571-0.142629-0.071314-0.071314-0.107886C1019.000686 527.1424 1024 517.1072 1024 505.929143zM620.929829 774.178743l0-142.142171-39.356343 2.929371c-159.213714 11.856457-371.143314 58.177829-490.929371 143.892114 58.357029-214.571886 244.000914-368.107886 497.929143-398.357943l32.356571-3.856457 0-138.642286 310.357943 268.106971L620.929829 774.178743z" p-id="2485" fill="#8a8a8a"></path></svg></div>' +
        '</a>'
    $(".projectInfo").append(html)
    $(".deleteProject,.previewProject").click(function (e) {
        e.preventDefault();
    })
}

// 删除项目按键
var deleteProjectName;
function DeleteProject(projectName, request) {
    if (!request) {
        confirm("Do you want to delete " + window.atob(projectName) + "?", "deleteProject")
        deleteProjectName = projectName
        return
    }
    $.ajax({
        url: "service/project/delete?path=" + window.atob(projectName),
        type: "get",
        success: () => {
            alert("info", "project delete success")
            getPorjectInfo()
        },
        error: function (xhr, _, _) {
            alert("warm", "project delete failed, cause: " + xhr.responseJSON.err)
        }
    })
}

// 打开项目预览
function previewProject(projectName) {
    $.ajax({
        url: "/projects/home/get",
        type: "post",
        data: {
            projectName: window.atob(projectName)
        },
        success: function (res) {
            if (res.status == "success") {
                // setCookie("project", window.atob(projectName))
                window.open("/file/" + res.home)
            } else {
                alert("warm", "please setup home page first")
            }
        },
        error: () => {
            login()
        }
    })
}

// 分享页面
var shareWebSiteName
var shareWebSiteHome
function shareWebsite(projectName) {
    let e = window.event || arguments.callee.caller.arguments[0]
    e.preventDefault()
    OpenShade()
    $(".shareWebsiteBox").css("display", "block")
    $.ajax({
        url: "/projects/home/get",
        type: "post",
        async: false,
        data: {
            projectName: window.atob(projectName)
        },
        success: function (res) {
            if (res.status == "success") {
                let Day = parseInt($("#day").text())
                let Hour = parseInt($("#hour").text())
                let minute = parseInt($("#minute").text())
                let totalSecond = Day * 86400 + Hour * 3600 + minute * 60
                let date = Math.floor(new Date().getTime() / 1000) + totalSecond
                let ct = aseEncrypt(getCookie("id") + ":" + window.atob(projectName) + ":" + res.home, hex_md5(date.toString()).slice(0, 16), date.toString())
                let url = document.location.origin + "/share/website/" + res.home + "?_ts=" + date.toString() + "&_ct=" + ct
                $("#shareablelink,#hidelink").val(url)
                shareWebSiteName = window.atob(projectName)
                shareWebSiteHome = res.home
            } else {
                alert("warm", "please setup home page first")
            }
        },
        error: () => {
            login()
        }
    })
}

function buildlink() {
    let Day = parseInt($("#day").text())
    let Hour = parseInt($("#hour").text())
    let minute = parseInt($("#minute").text())
    let totalSecond = Day * 86400 + Hour * 3600 + minute * 60
    let date = Math.floor(new Date().getTime() / 1000) + totalSecond
    let ct = aseEncrypt(getCookie("id") + ":" + shareWebSiteName + ":" + shareWebSiteHome, hex_md5(date.toString()).slice(0, 16), date.toString())
    let url = document.location.origin + "/share/website/" + shareWebSiteHome + "?_ts=" + date.toString() + "&_ct=" + ct
    $("#shareablelink,#hidelink").val(url)
}


// 选择分享链接有效时间
$("#up-day").click(() => {
    if ($("#day").text() == 7) {
        $("#day").text(0)
    } else {
        $("#day").text(parseInt($("#day").text()) + 1)
    }
    buildlink()
})
$("#down-day").click(() => {
    if ($("#day").text() == 0) {
        $("#day").text(7)
    } else {
        $("#day").text(parseInt($("#day").text()) - 1)
    }
    buildlink()
})

$("#up-hour").click(() => {
    if ($("#hour").text() == 23) {
        $("#hour").text(0)
    } else {
        $("#hour").text(parseInt($("#hour").text()) + 1)
    }
    buildlink()
})
$("#down-hour").click(() => {
    if ($("#hour").text() == 0) {
        $("#hour").text(23)
    } else {
        $("#hour").text(parseInt($("#hour").text()) - 1)
    }
    buildlink()
})

$("#up-minute").click(() => {
    if ($("#minute").text() == 59) {
        $("#minute").text(0)
    } else {
        $("#minute").text(parseInt($("#minute").text()) + 1)
    }
    buildlink()
})
$("#down-minute").click(() => {
    if ($("#minute").text() == 0) {
        $("#minute").text(59)
    } else {
        $("#minute").text(parseInt($("#minute").text()) - 1)
    }
    buildlink()
})

// 点击复制链接
$(".copylink").click(() => {
    document.getElementById("hidelink").select()
    document.execCommand("copy")
    alert("info", "copy success")
})

// 点击关闭连接框
$(".shareWebsiteBox .cancel,.copylink").click(() => {
    $("#day").text(1)
    $("#hour").text(0)
    $("#minute").text(0)
    $(".shade").click()
})


// serverless 代码框
var editor = ace.edit("apiCode");
editor.setFontSize(16)
editor.setShowPrintMargin(false);
editor.setReadOnly(false)
editor.setOption("maxLines", 15)

editor.getSession().setUseWrapMode(true);

ace.require("ace/ext/language_tools");
editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
});
var JavaScriptMode = ace.require("ace/mode/python").Mode
editor.session.setMode(new JavaScriptMode());

$(".uploadCode").click(() => {
    $("#uploadCode").click()
})

// 选择cloud function group
var GroupArray = new Array()
var GroupInputTimeOutID
$(".group").click(() => {
    clearTimeout(GroupInputTimeOutID)
    $(".groupbox").css("height", GroupArray.length * 40 + 4 + "px")
    $(".groupselect").focus()
})
$(".groupselect").blur(() => {
    GroupInputTimeOutID = setTimeout(() => {
        $(".groupbox").css("height", "0")
    }, 100);
})

// 取消新建分组
var CommitNewGroup = false
$(".groupinput input").blur(() => {
    setTimeout(() => {
        if (CommitNewGroup) { return }
        $(".group").css("display", "block")
        $(".groupinput").css("display", "none")
        $(".groupinput input").val("")
    }, 100);
})

$(".add_cloudfunc_group").click(() => {
    CommitNewGroup = true
    createCloudFunctionGroup($(".groupinput input").val())
})
// 创建 cloud function group
function createCloudFunctionGroup(groupName) {
    $.ajax({
        url: "/api/cloudBase/group/add",
        type: "POST",
        data: {
            groupName: groupName
        },
        success: function (res) {
            if (res.status != "success") {
                alert('warm', 'add new group failed, err:', res.err)
                return
            }
            alert('info', 'add new group success')
            $(".groupinput").css("display", "none")
            $(".group").css("display", "block").text(groupName)
            ChooseCloudFuncGroupID = res.id
            $(".groupinput input").val('')
            CommitNewGroup = false
        },
        error: function () {
            alert("warm", "add new group failed")
        }
    })

}

var ChooseCloudFuncGroupID = "7a1920d61156abc05a60135aefe8bc67"
function getCloudFuncGroup(filter) {
    $.ajax({
        url: "/api/cloudBase/group/get",
        type: "GET",
        async: false,
        success: function (res) {
            GroupArray = res
        }
    })
    let dom = '<div class="groupitem create">-- New Group --</div>'
    for (let group of GroupArray) {
        for (var id in group) {
            if (filter == group[id]) {
                break
            }
            if (!filter && group[id] == "Default") {
                break
            }
            dom += '<div class="groupitem" id="' + id + '">' + group[id] + '</div>'
        }
    }
    $(".groupbox").html(dom)
    $(".groupitem").click((e) => {
        let groupName = $(e.target).text()
        if ($(e.target).attr("class") == "groupitem create") {
            return
        }
        $(".group").text(groupName)
        ChooseCloudFuncGroupID = $(e.target).attr("id")
        getCloudFuncGroup(groupName)
    })
    $(".create").click(() => {
        $(".group").css("display", "none")
        $(".groupinput").css("display", "block")
        $(".groupinput input").focus()
    })
}

// 删除 cloud function group
var deleteGroupID = ""
function deleteCloudFuncGroup() {
    $.ajax({
        url: "/api/cloudBase/group/del",
        type: "POST",
        data: {
            groupid: deleteGroupID
        },
        success: () => {
            $("#" + deleteGroupID).remove()
            $("#" + deleteGroupID).remove()
            $("#" + deleteGroupID + "-func").remove()
            alert("info", "delete group [" + CloudFuncMap[deleteGroupID].name + "] success")
        },
        error: () => {
            alert("warm", "delete group [" + CloudFuncMap[deleteGroupID].name + "] failed")
        }
    })

}



// 添加云函数
$(".addApi").click(() => {
    $(".group").text(CloudFuncMap[ChooseCloudFuncGroupID].name)
    editor.getSession().setValue('def main(event,context):\n    return "hello my friend"\n\n\n\n\n\n\n\n\n\n\n\n\n')
    $(".addApiBox").css("right", "-20px")
    OpenShade()
    switch (CLOUD_FUNC_METHOD) {
        case "GET":
            $(".get").css("backgroundColor", "#34D372")
            $(".post").css("backgroundColor", "white")
            return
        case "POST":
            $(".post").css("backgroundColor", "#34D372")
            $(".get").css("backgroundColor", "white")
            return
    }
})

var CLOUD_FUNC_METHOD = "GET"
// 设置云函数请求方式
$(".get").click(() => {
    $(".get").css("backgroundColor", "#34D372")
    $(".post").css("backgroundColor", "white")
    CLOUD_FUNC_METHOD = "GET"
})

$(".post").click(() => {
    $(".post").css("backgroundColor", "#34D372")
    $(".get").css("backgroundColor", "white")
    CLOUD_FUNC_METHOD = "POST"
})

// 加载云函数代码文件
$("#uploadCode").change(() => {
    let f = document.getElementById("uploadCode").files[0]
    if (f.name.split(".").slice(-1) != "py") {
        alert("warm", "only support python file")
        return
    }
    let reader = new FileReader()
    reader.readAsText(f, "UTF-8")
    reader.onload = function (e) {
        let content = e.target.result
        editor.getSession().setValue(content + "\n\n")
    }
})

// 生成云函数
var CLOUD_FUNC_COMMIT = false
$(".addApiBox .build").click(() => {
    let route = $(".addApiBox .route").val()
    if (route.indexOf("/") != 0) {
        alert("warm", '路径必须以 "/" 开头，且路径只能包含字母、数字、"."、下划线和连接符，限制50字符内！')
        return
    }
    let description = $(".addApiBox .apiDescription").val()
    let code = editor.getSession().getValue()
    $.ajax({
        url: "/api/cloudBase/coludFunc/add",
        type: "post",
        data: {
            route: route,
            description: description,
            code: code,
            method: CLOUD_FUNC_METHOD,
            groupid: ChooseCloudFuncGroupID
        },
        success: function (res) {
            let link = document.location.origin + res.link
            console.log(link)
            $("#apiLink-hide").val(link)
            $(".apiLink").text(link)
            $(".btngroup").css("display", "none")
            $(".title-5 .copyApiLink").css("display", "block")
            getCloudFunction()
            CLOUD_FUNC_COMMIT = true
            ChooseCloudFuncGroupID = "7a1920d61156abc05a60135aefe8bc67"
        }
    })
})



// 取消关闭ApiBox
$(".addApiBox .cancel").click(() => {
    $(".addApiBox .route,.addApiBox .apiDescription, #apiLink-hide").val("")
    $(".apiLink").text("")
    editor.getSession().setValue("")
    $(".shade").click()
    $(".btngroup").css("display", "block")
    CLOUD_FUNC_METHOD = "GET"
})

// 获取云函数列表
var CloudFuncMap
function getCloudFunction() {
    $(".cloudFunctionInfo").html("")
    $.ajax({
        url: "/api/cloudBase/coludFunc/get",
        type: "get",
        success: function (group) {
            CloudFuncMap = group
            if (group.length == 0) {
                $(".noApis").css("display", "block")
            } else {
                $(".noApis").css("display", "none")
            }
            let dom = "";
            for (let id in group) {
                dom += '<div class="cloudFuncGroup" id="' + id + '"> \
                            <div class="groupName" >'+ group[id].name + '</div> \
                            <div class="renameinput">\
                                <input type="text" maxlength="15">\
                                <div class="commmit_group_rename">Commit</div>\
                            </div>\
                            <svg t="1638347442275" class="more" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2307" width="24" height="24"><path d="M512 767.544889a73.386667 73.386667 0 1 1 0 146.659555 73.386667 73.386667 0 0 1 0-146.659555z m0-317.781333a73.386667 73.386667 0 1 1 0 146.659555 73.386667 73.386667 0 0 1 0-146.659555zM512 131.982222a73.386667 73.386667 0 1 1 0 146.659556A73.386667 73.386667 0 0 1 512 131.982222z" fill="#8a8a8a" p-id="2308"></path></svg>\
                            <div class="morebox">\
                                <div class="addAPI">Add API</div>\
                                <div class="renameGroup">Rename</div>'
                if (id != "7a1920d61156abc05a60135aefe8bc67") {
                    dom += '<div class="deleteGroup">Delete</div>'
                }
                dom += '</div>\
                        </div>'
                dom += '<div class="cloudFunc" id="' + id + '-func">'
                for (let fid in group[id]["cloud_func_map"]) {
                    let cf = group[id]["cloud_func_map"][fid]
                    dom += '<div class="cloudFuncItem" id="cf-' + id + '-' + cf.id + '">\
                        <div class="route">' + cf.route + '</div>' +
                        '<div class="method">' + cf.method + '</div>' +
                        '<div class="id">' + cf.id + '</div>\
                        <div class="description">Description: ' + cf.description + '</div>\
                        <div class="delete" onclick="deleteCloudFunc(\'' + id + '-' + cf.id + '\')">\
                            <svg t="1635911839914" class="icon" viewBox="0 0 1024 1024" version="1.1"                            xmlns="http://www.w3.org/2000/svg" p-id="4663" width="16" height="16"><path                                d="M382.320274 405.357714v384a20.626286 20.626286 0 0 1-21.577143 21.284572H317.44256a20.626286 20.626286 0 0 1-21.577143-21.357715v-384a20.626286 20.626286 0 0 1 21.577143-21.284571h43.154286a20.626286 20.626286 0 0 1 21.577143 21.357714h0.073142z m172.909715 0v384a20.626286 20.626286 0 0 1-21.650286 21.284572h-43.154286a20.626286 20.626286 0 0 1-21.577143-21.357715v-384a20.626286 20.626286 0 0 1 21.577143-21.284571h43.154286a20.626286 20.626286 0 0 1 21.577143 21.357714z m172.909714 0v384a20.626286 20.626286 0 0 1-21.650286 21.284572h-43.154286a20.626286 20.626286 0 0 1-21.577142-21.357715l-0.073143-384a20.626286 20.626286 0 0 1 21.577143-21.284571h43.227428a20.626286 20.626286 0 0 1 21.577143 21.357714z m86.381714 482.669715V256H209.483703v631.954286a74.825143 74.825143 0 0 0 14.482286 45.056c3.364571 3.803429 5.778286 5.632 7.094857 5.632h561.883428c1.316571 0 3.657143-1.828571 7.094857-5.632a74.825143 74.825143 0 0 0 14.555429-44.982857zM360.743131 170.642286h302.518858l-32.402286-77.970286a19.017143 19.017143 0 0 0-11.483429-7.314286H405.287131a19.017143 19.017143 0 0 0-11.483428 7.314286l-33.060572 77.970286zM987.431131 192v42.642286a20.626286 20.626286 0 0 1-21.577142 21.357714h-64.877715v631.954286c0 36.937143-10.532571 68.754286-31.744 95.744-21.211429 26.843429-46.592 40.301714-76.288 40.301714H231.060846c-29.696 0-55.149714-13.019429-76.288-38.985143-21.211429-26.038857-31.744-57.490286-31.744-94.354286V256H58.151131A20.626286 20.626286 0 0 1 36.573989 234.642286v-42.642286a20.626286 20.626286 0 0 1 21.577142-21.357714h208.676572L314.151131 59.318857c6.729143-16.457143 18.870857-30.427429 36.425143-41.984 17.554286-11.556571 35.401143-17.334857 53.394286-17.334857h216.064c17.993143 0 35.84 5.778286 53.394286 17.334857 17.554286 11.556571 29.696 25.6 36.425143 41.984l47.323428 111.323429h208.676572a20.626286 20.626286 0 0 1 21.577142 21.357714z"                                p-id="4664" fill="#8a8a8a"></path></svg></div><div class="copyapi" onclick="CopyApi(\'' + id + cf.id + '\')"><svg t="1636359635348" class="copyapi" viewBox="0 0 1024 1024" version="1.1"                            xmlns="http://www.w3.org/2000/svg" p-id="5312" width="16" height="16"><path                                d="M878.272 981.312H375.36a104.64 104.64 0 0 1-104.64-104.64V375.36c0-57.792 46.848-104.64 104.64-104.64h502.912c57.792 0 104.64 46.848 104.64 104.64v502.912c-1.6 56.192-48.448 103.04-104.64 103.04z m-502.912-616.96a10.688 10.688 0 0 0-10.944 11.008v502.912c0 6.208 4.672 10.88 10.88 10.88h502.976c6.208 0 10.88-4.672 10.88-10.88V375.36a10.688 10.688 0 0 0-10.88-10.944H375.36z"                                fill="#8a8a8a" p-id="5313"></path><path                                d="M192.64 753.28h-45.312a104.64 104.64 0 0 1-104.64-104.64V147.328c0-57.792 46.848-104.64 104.64-104.64h502.912c57.792 0 104.64 46.848 104.64 104.64v49.92a46.016 46.016 0 0 1-46.848 46.912 46.08 46.08 0 0 1-46.848-46.848v-49.984a10.688 10.688 0 0 0-10.944-10.944H147.328a10.688 10.688 0 0 0-10.944 10.88v502.976c0 6.208 4.672 10.88 10.88 10.88h45.312a46.08 46.08 0 0 1 46.848 46.912c0 26.496-21.824 45.248-46.848 45.248z"                                fill="#8a8a8a" p-id="5314"></path></svg></div>\
                        <textarea class="hide" id="api-' + id + cf.id + '">' + document.location.origin + cf.link + '</textarea></div>'
                }
                if (Object.keys(CloudFuncMap[id]["cloud_func_map"]).length == 0) {
                    dom += '<div class="nothing">nothing</div>'
                }
                dom += '</div>'
            }
            $(".cloudFunctionInfo").html(dom)
            // 主页展示接口列表
            $(".cloudFuncGroup").click((e) => {
                let groupid = ""
                if ($(e.target).attr("class") == "groupName") {
                    groupid = $(e.target).parent().attr("id")
                } else {
                    groupid = $(e.target).attr("id")
                }
                let obj = $("#" + groupid + "-func")
                if (obj.css("height") == "0px") {
                    if (Object.keys(CloudFuncMap[groupid]["cloud_func_map"]).length == 0) {
                        obj.css("height", "40px")
                    } else {
                        obj.css("height", Object.keys(CloudFuncMap[groupid]["cloud_func_map"]).length * 100 + "px")
                    }
                } else {
                    obj.css("height", "0px")
                }
            })
            // more
            var moreObject;
            $(".more").click((e) => {
                if (moreObject) {
                    moreObject.css("display", "none")
                }
                if ($(e.target)[0].tagName == "path") {
                    moreObject = $(e.target).parent().next()
                } else {
                    moreObject = $(e.target).next()
                }
                if (moreObject.css("display") == "none") {
                    $(".groupselect").focus()
                    moreObject.css("display", "block")
                } else {
                    moreObject.css("display", "none")
                }
            })
            $(".groupselect").blur(() => {

                let mo = moreObject
                moreObject = null
                setTimeout(() => {
                    try {
                        mo.css("display", "none")
                    } catch (error) {
                        
                    }
                    
                }, 100);
            })
            // deleteGroup
            $(".deleteGroup").click((e) => {
                let groupid = $(e.target).parent().parent().attr("id")
                let groupName = CloudFuncMap[groupid].name
                deleteGroupID = groupid
                confirm("Do you want to delete aips' group [" + groupName + "] ?", "deleteGroup")
            })
            // add cloud function in group
            $(".addAPI").click((e) => {
                ChooseCloudFuncGroupID = $(e.target).parent().parent().attr("id")
                let groupName = CloudFuncMap[ChooseCloudFuncGroupID].name
                $(".group").css("display", "block").text(groupName)
                $(".addApi").click()
            })
            // rename group
            $(".renameGroup").click((e) => {
                $(e.target).parent().siblings(".groupName").css("display", "none")
                $(e.target).parent().siblings(".renameinput").css("display", "block")
                $(e.target).parent().siblings(".renameinput").find("input").focus()
            })
            $(".renameinput input").blur((e) => {
                setTimeout(() => {
                    $(e.target).parent().siblings(".groupName").css("display", "block")
                    $(e.target).parent().css("display", "none")
                }, 200);
            })
            $(".commmit_group_rename").click((e)=>{
                let id = $(e.target).parent().parent().attr("id")
                let groupName = $(e.target).siblings("input").val()
                if (!groupName){
                    return
                }
                $.ajax({
                    url:"/api/cloudBase/group/rename",
                    type:"POST",
                    data:{
                        groupid:id,
                        groupName:groupName
                    },
                    success:()=>{
                        $(e.target).parent().siblings(".groupName").text(groupName)
                        alert("info","group rename ["+groupName+"] success")
                    },
                    error:()=>{
                        alert("warm","group rename failed")
                    }
                })
            })
            // edit cloud function
            $(".cloudFuncItem").click((e)=>{
                let obj = $(e.target)
                if (obj.attr("class") != "cloudFuncItem"){
                    obj = obj.parent()
                }
                let flag = $(obj).attr("id")
                if(!flag){
                    return
                }
                $.ajax({
                    url:"api/cloudBase/coludFunc/code/get",
                    type:"POST",
                    data:{
                        funcid:flag.split("-").slice(-1)[0]
                    },
                    success:(code)=>{
                        for (i=0;i<15-code.split("\n").length;i++){
                            code += "\n"
                        }
                        editor.getSession().setValue(code)
                        let f = CloudFuncMap[flag.split("-").slice(1)[0]]["cloud_func_map"][flag.split("-").slice(-1)[0]]
                        ChooseCloudFuncGroupID = flag.split("-").slice(1)[0]
                        $(".group").text(CloudFuncMap[flag.split("-").slice(1)[0]].name)
                        CLOUD_FUNC_METHOD = f.method
                        switch (CLOUD_FUNC_METHOD) {
                            case "GET":
                                $(".get").css("backgroundColor", "#34D372")
                                $(".post").css("backgroundColor", "white")
                                break
                            case "POST":
                                $(".post").css("backgroundColor", "#34D372")
                                $(".get").css("backgroundColor", "white")
                                break
                        }
                        $(".addApiBox .route").val(f.route)
                        $(".addApiBox .apiDescription").val(f.description)
                        $(".apiLink").text(document.location.origin +f.link)
                        $("#apiLink-hide").text(document.location.origin +f.link)
                        $(".title-5 .copyApiLink").css("display", "block")
                        OpenShade()
                        $(".addApiBox").css("right", "-20px")
                        CLOUD_FUNC_COMMIT = true // 借助特性 点击幕布清除内容
                    }
                })

            })
        }
    })
}

// 主页展示接口列表
$(".cloudFuncGroup").click((e) => {
    let groupid = ""
    if ($(e.target).attr("class") == "groupName") {
        groupid = $(e.target).parent().attr("id")
    } else {
        groupid = $(e.target).attr("id")
    }
    let obj = $("#" + groupid + "-func")
    if (obj.css("height") == "0px") {
        if (Object.keys(CloudFuncMap[groupid]["cloud_func_map"]).length == 0) {
            obj.css("height", "40px")
        } else {
            obj.css("height", Object.keys(CloudFuncMap[groupid]["cloud_func_map"]).length * 100 + "px")
        }
    } else {
        obj.css("height", "0px")
    }
})


// 复制云函数链接(右边框)
$(".copyApiLink").click(() => {
    document.getElementById("apiLink-hide").select()
    document.execCommand("copy")
    alert("info", "copy success")
    $(".btngroup").css("display", "block")
    $(".addApiBox .cancel").click()
    $(".title-5 .copyApiLink").css("display", "none")
})

// 复制云函数链接(列表)
function CopyApi(id) {
    document.getElementById("api-" + id).select()
    document.execCommand("copy")
    alert("info", "copy success")
}

// 删除云函数
function deleteCloudFunc(id) {
    groupid = id.split("-")[0]
    funcid = id.split("-")[1]
    $.ajax({
        url: "/api/cloudBase/coludFunc/remove",
        type: "post",
        data: {
            id: funcid,
            groupid: groupid
        },
        success: function () {
            $("#cf-" + id).remove()
            if (Object.keys(CloudFuncMap[groupid]["cloud_func_map"]).length == 0) {
                $("#" + groupid + "-func").html('<div class="nothing">nothing</div>')
            }
            delete CloudFuncMap[groupid]["cloud_func_map"][funcid]
            $("#" + groupid + "-func").css("height", Object.keys(CloudFuncMap[groupid]["cloud_func_map"]).length * 100 + "px")
            if ($(".cloudFuncItem").length == 0) {
                $(".noApis").css("display", "block")
            }
            alert("info", "delete success")
        }
    })
}


