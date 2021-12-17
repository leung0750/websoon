
var nowPath;
$(document).ready(() => {
    folderTitle(getQueryVariable("path"))
    $(".fileName").text(getQueryVariable("path").split("/").slice(-1)[0])
    getFileContent(getQueryVariable("path"))
    var suffix = getQueryVariable("path").split(".").slice(-1)[0]
    switch (suffix) {
        case "html":
            var JavaScriptMode = ace.require("ace/mode/html").Mode
            editor.session.setMode(new JavaScriptMode());
            return
        case "js":
            var JavaScriptMode = ace.require("ace/mode/javascript").Mode
            editor.session.setMode(new JavaScriptMode());
            return
        case "css":
            var JavaScriptMode = ace.require("ace/mode/css").Mode
            editor.session.setMode(new JavaScriptMode());
            return
    }

})

// 复制
$(".copy").click(() => {
    if (nowAllowShowCode_Bool) { return }
    $("#hide-codeArea").css("display", "block")
    document.getElementById("hide-codeArea").select()
    document.execCommand("copy")
    $("#hide-codeArea").css("display", "none")
    alert("info", "copy success")
})
// 打开raw
$(".rawCode").click(() => {
    if (nowAllowShowCode_Bool) { return }
    window.open("raw?path=" + getQueryVariable("path"))
})
// 下载
$(".download").click(() => {
    window.location = "../download?path=" + getQueryVariable("path")
    window.event.returnValue = false
})

$(".notAllowShowCode").click(() => {
    window.location = "../download?path=" + getQueryVariable("path")
    window.event.returnValue = false
})

// 删除
$(".delete").click(() => {
    DeleteFile(getQueryVariable("path").split("/").slice(-1)[0], false)
})

// confirmBox: yes button
$(".confirmBox .yes").click(function () {
    $(".confirmBox .confirm").css("top", "-70px")
    setTimeout(() => {
        $(".confirmBox").css("display", "none")
        $(".question").text("")
    }, 300);
    switch (confirmObject) {
        case "deleteFile":
            DeleteFile(getQueryVariable("path").split("/").slice(-1)[0], true)
    }
})

// 提交修改
$(".commit").click(() => {
    let content = editor.getSession().getValue()
    $.ajax({
        url: "../projects/files/edit/commit",
        type: "post",
        data: {
            content: content,
            path: getQueryVariable("path")
        },
        success: function (res) {
            if (res.status != "success") {
                alert("warm", "commit failed, err:" + res.err)
            } else {
                alert("info", "commit success")
            }
        },
        error: function () {
            login()
        }
    })
    $(".commit").css("display", "none")
    $(".edit").css("backgroundColor", "white")
    OnlyRead = true
    editor.setReadOnly(OnlyRead)
})

function DeleteFile(fileName, request) {
    if (!request) {
        confirm("Do you want to delete " + fileName + "?", "deleteFile")
        return
    }
    $.ajax({
        url: "../service/project/delete?path=" + getQueryVariable("path"),
        type: "get",
        success: () => {
            document.location.href = "../projects/" + getQueryVariable("path").split('/')[0] + "?path=" + getQueryVariable("path").split('/').slice(0, -1).join("/")
        },
        error: function (xhr, _, _) {
            alert("warm", "project delete failed, cause: " + xhr.responseJSON.err)
        }
    })
}

function folderTitle(path) {
    $(".folderTitle").html("")
    let dom = ""
    nowPath = path.split("/")
    for (let i in nowPath) {
        if (i == 0) {
            dom += "<div class='projectName' index=" + i + ">" + nowPath[i] + "</div> "
        } else {
            dom += "<div class='folderIndex' index=" + i + ">" + nowPath[i] + "</div> "
        }

        if (i != nowPath.length - 1) {
            dom += "< "
        }
    }
    $(".folderTitle").html(dom)
    $(".folderIndex,.projectName").click((e) => {
        let index = parseInt($(e.target).attr("index"))
        if (index != nowPath.length - 1) {
            document.location.href = "/projects/" + nowPath.slice(0, index + 1).join("/")
        }
    })
}

function getFileContent(path) {
    $.ajax({
        url: "../projects/files/content",
        type: "post",
        data: { path: path },
        success: function (res) {
            switch (res.status) {
                case "failed":
                    alert("warm", "get files failed, err:" + res.err)
                    break
                case "success":
                    $(".size").text(res.size)
                    editor.getSession().setValue(res.content + "\n\n\n\n\n")
                    $("#hide-codeArea").text(res.content)
                    break
                case "nas":
                    $(".size").text(res.size)
                    nowAllowShowCode()
                    break
            }
        },
        error: function () {
            login()
        }
    })
}

var nowAllowShowCode_Bool = false
function nowAllowShowCode() {
    nowAllowShowCode_Bool = true
    $("#codeArea").css("display", "none")
    $(".notAllowShowCode").css("display","block")
    $(".copy,.rawCode,.edit").css("cursor", "not-allowed")
}

var OnlyRead = true
var editor = ace.edit("codeArea");
editor.setFontSize(16)
editor.setShowPrintMargin(false);
editor.setReadOnly(OnlyRead)
editor.setOption("maxLines", 1000)

editor.getSession().setUseWrapMode(true);

ace.require("ace/ext/language_tools");
editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
});


// 点击Edit
$(".edit").click(() => {
    if (nowAllowShowCode_Bool) { return }
    OnlyRead = !OnlyRead
    editor.setReadOnly(OnlyRead)
    if (OnlyRead) {
        $(".edit").css("backgroundColor", "white")
        $(".commit").css("display", "none")
        $("#codeArea").css('pointer-events', 'none')
    } else {
        $(".edit").css("backgroundColor", "#F0F0F0")
        $(".commit").css("display", "block")
        $("#codeArea").css('pointer-events', 'auto')
    }
})



