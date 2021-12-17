var projectName
var homePage
var homePageId
var nowPath
var createObjectType
var uploadObjectType
// 页面初始化: 路径显示
$(document).ready(() => {
    nowPath = decodeURIComponent(document.location.href).split("/").slice(4)
    projectName = nowPath[0]
    getHomePage()
    if (nowPath.length > 1) {
        folderTitle(nowPath.join("/"))
        getProjectFiles(nowPath.join("/"))
        getDescript(nowPath[0])
    } else {
        folderTitle(projectName)
        getProjectFiles(projectName)
        getDescript(projectName)
    }
})

// 获取首页地址
function getHomePage() {
    $.ajax({
        url: "/projects/home/get",
        type: "post",
        data: {
            projectName: projectName
        },
        success: function (res) {
            if (res.status == "success") {
                homePage = res.home
            } else {
                // alert("warm","get home page failed, err:"+res.err)
            }
        },
        error: () => {
            login()
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

        if (i <= nowPath.length - 1) {
            dom += "< "
        }
    }
    dom += '<div class=\'addObject\'>\
                <svg t="1636531443264" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3466" width="32" height="32"><path d="M188.8 135.7c-29.7 0-53.8 24.1-53.8 53.7v644.7c0 29.7 24.1 53.7 53.8 53.7h645.4c29.7 0 53.8-24.1 53.8-53.7V189.4c0-29.7-24.1-53.7-53.8-53.7H188.8z m-13-71.1h671.5c61.8 0 111.9 50.1 111.9 111.8v670.8c0 61.7-50.1 111.8-111.9 111.8H175.8C114 959 63.9 909 63.9 847.2V176.4c0-61.8 50.1-111.8 111.9-111.8z m0 0" p-id="3467" fill="#8a8a8a"></path><path d="M673 548H351c-19.8 0-36-16.2-36-36s16.2-36 36-36h322c19.8 0 36 16.2 36 36s-16.2 36-36 36z" p-id="3468" fill="#8a8a8a"></path><path d="M476 673V351c0-19.8 16.2-36 36-36s36 16.2 36 36v322c0 19.8-16.2 36-36 36s-36-16.2-36-36z" p-id="3469" fill="#8a8a8a"></path></svg>\
                <div class=\'menu clearfix\'>\
                    <div class=\'addFile\'>New file</div>\
                    <div class=\'uploadFile\'>Upload file</div>\
                    <div class=\'addFolder\'>New directory</div>\
                    <div class=\'uploadFolder\'>Upload directory</div>\
                    <input>\
                </div>\
            </div>'
    $(".folderTitle").html(dom)
    $(".folderIndex,.projectName").click((e) => {
        let index = parseInt($(e.target).attr("index"))
        if (index != nowPath.length - 1) {
            folderTitle(nowPath.slice(0, index + 1).join("/"))
        }
        getProjectFiles(nowPath.slice(0, index + 1).join("/"))
        // window.history.pushState(null,null,document.location.origin+"/projects/"+nowPath.slice(0, index + 1).join("/"))
    })
    $(".addObject,.menu").click(() => {
        $(".addObject .menu").css("display", "block")
        $(".addObject>.menu>input").focus()
    })
    $(".addObject>.menu>input").blur(() => {
        setTimeout(() => {
            $(".addObject .menu").css("display", "none")
        }, 100);
    })

    $(".addFile, .addFolder").click(() => {
        OpenShade()
        $(".addProjectBox").css("top", "100px")
    })
    $(".addFile").click(() => {
        createObjectType = "file"
    })
    $(".addFolder").click(() => {
        createObjectType = "folder"
    })
    // 点击上传文件
    $(".uploadFile").click(() => {
        $(".uploadBox .head").text("Upload New File")
        $("#uploadFile").removeAttr("webkitdirectory")
        OpenShade()
        $(".uploadBox").css("display", "block")
        uploadObjectType = "file"
    })
    $(".uploadFolder").click(() => {
        $(".uploadBox .head").text("Upload New Directory")
        $("#uploadFile").attr("webkitdirectory", true)
        OpenShade()
        $(".uploadBox").css("display", "block")
        uploadObjectType = "folder"
    })
    // 下载文件选择框
    if (nowPath.length == 1){
        $(".selectbox .directory").css("cursor","not-allowed")
    }else{
        $(".selectbox .directory").css("cursor","pointer")
    }
}

// 点击 `添加项目` 盒子的提交按钮
$(".addProjectBox .commit").click(() => {
    let unallow = ["/", "\\", ":", "*", "?", '"', "<", ">", "|"]
    let objectName = $(".addProjectBox input").val()
    if (objectName == "") {
        $(".addProjectBox .warming").css("display", "block").text('* project name can`t be null')
        return
    }
    for (let s of unallow) {
        if (objectName.indexOf(s) != -1) {
            $(".addProjectBox .warming").css("display", "block").text('* project name can`t contain any of the following characters: \\ / : * ? " < > |')
            return
        }
    }

    $.ajax({
        url: "/projects/object/create",
        type: "post",
        data: {
            path: nowPath.join("/"),
            name: objectName,
            type: createObjectType
        },
        success: function (res) {
            $(".shade").click()
            if (res.status != "success") {
                alert("warm", "create failed, err:" + res.err)
            } else {
                alert("info", "create success")
                folderTitle(nowPath.join("/"))
                getProjectFiles(nowPath.join("/"))
            }
        },
        error: function () {
            $(".shade").click()
            login()
        }
    })
})

$(".shade").click(() => {
    $(".shade").css("opacity", 0).css("z-index", -1);
    $(".addProjectBox").css("top", "-100px")
    $(".addProjectBox input").val("")
    $(".addProjectBox .warming").css("display", "none")
    $(".descriptEditor").css("top", "-160px")
    $(".descriptEditor input").val("")
    $(".descriptEditor .warming").css("display", "none")
    $(".uploadBox").css("display", "none")
})

// 点击 'click to upload'
$("#clickup").click(() => {
    $("#uploadFile").click()
})
var fileList = new Array()
function removeFile(obj) {
    let name = $(obj).prev().text()
    // let files = document.getElementById("uploadFile").files
    for (let index in fileList) {
        let file = fileList[index]
        if (file.name == name) {
            // document.getElementById("uploadFile").files.splice(index, 1)
            fileList.splice(index, 1)
            fullPathList.splice(index, 1)
            break
        }
    }
    $($(obj).parent()[0]).remove()
    showNoFiles()
}

$("#uploadFile").change(() => {
    // if (uploadObjectType == "folder") {
    //     fileList = new Array()
    //     $(".fileArea .uploadfiles").html("")
    // }

    for (let file of document.getElementById("uploadFile").files) {
        let found = false
        for (let f of fileList) {
            if (f.name == file.name) {
                found = true
                break
            }
        }
        if (found) { continue }
        fileList.push(file)
        let path = file.webkitRelativePath
        if (file.webkitRelativePath == "") {
            path = file.name
        }
        fullPathList.push("/" + path)
        $(".fileArea .uploadfiles").append('<div class="file"><div class="name">' + file.name + '</div><a href="javascript:void(0)" onclick="removeFile(this)">Remove file</a></div>')
    }
    showNoFiles()
})

$(".uploadBox .closebtn").click(() => {
    $(".shade").click()
})
$(".uploadBox .cancel").click(() => {
    window.location.href = document.location.origin + "/projects/" + nowPath.join("/")
})
$(".uploadBox .commit").click(() => {
    let formData = new FormData();
    for (let f of fileList) {
        formData.append("file", f);
    }
    formData.append("root", nowPath.join("/"))
    for (let path of fullPathList) {
        formData.append("path", path)
    }
    $.ajax({
        url: "/projects/files/upload",
        type: "post",
        data: formData,
        processData: false,//不去处理发送的数据
        contentType: false,//不去设置Content-Type请求头
        xhr: function () {
            let xhr = new XMLHttpRequest
            xhr.upload.addEventListener("progress", function (e) {
                let progressRate = (e.loaded / e.total) * 100 + "%"
                $(".rate").css("width", progressRate)
            })
            return xhr
        },
        success: function (res) {
            if (res.status == "success") {
                window.location.href = document.location.origin + "/projects/" + nowPath.join("/")
            } else {
                alert("warm", "upload failed, err:" + res.err)
                $(".uploadBox .cancel").click()
            }
        },
        finally: function () {
            $(".rate").css("width", 0)
            showNoFiles()
        }
    })

})

// 获取项目描述
function getDescript(projectName) {
    $.ajax({
        url: "/projects/descript/get",
        type: "post",
        data: { name: projectName },
        success: function (res) {
            if (res.status != "success") {
                alert("warm", "get descript failed, err:" + res.err)
            } else {
                setDescript(res.description)
            }
        },
        error: function () {
            login()
        }
    })
}

// 获取目录文件
function getProjectFiles(path) {
    if (deleteStatus) {
        return
    }
    if (path.indexOf("download?path=")!=-1){
        return
    }
    console.log(path)
    window.history.pushState(null, null, document.location.origin + "/projects/" + path)
    $.ajax({
        url: "/projects/files/get",
        type: "post",
        data: { path: decodeURIComponent(path) },
        success: function (res) {
            if (res.status != "success") {
                alert("warm", "get files failed, err:" + res.err)
            } else {
                folderTitle(path)
                $(".files").html("<tr><th>Name</th></tr>")
                if (path.split("/").length > 1) {
                    $(".files").append('<tr onclick="returnLastPage()"><td><span>..</span></td></tr>')
                }

                if (res.folders) {
                    for (let folder of res.folders) {
                        $(".files").append('<tr id="' + hex_md5(path + "/" + folder) + '" onclick="getProjectFiles(\'' + path + "/" + folder + '\')"><td><svg t="1636078834469" class="icon" viewBox="0 0 1024 1024" version="1.1"                    xmlns="http://www.w3.org/2000/svg" p-id="5588" width="16" height="16"><path                        d="M970.666667 213.333333H546.586667a10.573333 10.573333 0 0 1-7.54-3.126666L429.793333 100.953333A52.986667 52.986667 0 0 0 392.08 85.333333H96a53.393333 53.393333 0 0 0-53.333333 53.333334v704a53.393333 53.393333 0 0 0 53.333333 53.333333h874.666667a53.393333 53.393333 0 0 0 53.333333-53.333333V266.666667a53.393333 53.393333 0 0 0-53.333333-53.333334z"                        fill="#2c2c2c" p-id="5589"></path></svg><span>' + folder + '</span><div class="delete" onclick=deleteProject(\'' + path + "/" + folder + '\')>delete</div></td></tr>')
                    }
                }
                if (res.files) {
                    for (let file of res.files) {
                        let homeBtn = ''
                        let homeflag = ''
                        if (file.split(".").slice(-1) == "html" && nowPath.join("/") + "/" + file != homePage) {
                            homeBtn = '<div class="home" onclick="setHomePage(\'' + nowPath.join("/") + "/" + file + '\')">home</div>'
                        } else if (nowPath.join("/") + "/" + file == homePage) {
                            homeflag = '<div class="homeflag">Home</div>'
                            homePageId = hex_md5(path + "/" + file)
                        }
                        $(".files").append('<tr id="' + hex_md5(path + "/" + file) + '" onclick="returnCodePage(\'' + path + "/" + file + '\')"><td><svg t="1636100034263" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13588" width="16" height="16"><path d="M842.666667 981.333333H181.333333a53.393333 53.393333 0 0 1-53.333333-53.333333V96a53.393333 53.393333 0 0 1 53.333333-53.333333h466.746667a52.986667 52.986667 0 0 1 37.713333 15.62l194.586667 194.586666a52.986667 52.986667 0 0 1 15.62 37.713334V928a53.393333 53.393333 0 0 1-53.333333 53.333333zM181.333333 85.333333a10.666667 10.666667 0 0 0-10.666666 10.666667v832a10.666667 10.666667 0 0 0 10.666666 10.666667h661.333334a10.666667 10.666667 0 0 0 10.666666-10.666667V298.666667h-160a53.393333 53.393333 0 0 1-53.333333-53.333334V85.333333z m501.333334 30.166667V245.333333a10.666667 10.666667 0 0 0 10.666666 10.666667h129.833334z m21.333333 652.5H320a21.333333 21.333333 0 0 1 0-42.666667h384a21.333333 21.333333 0 0 1 0 42.666667z m0-213.333333H320a21.333333 21.333333 0 0 1 0-42.666667h384a21.333333 21.333333 0 0 1 0 42.666667zM490.666667 298.666667H320a21.333333 21.333333 0 0 1 0-42.666667h170.666667a21.333333 21.333333 0 0 1 0 42.666667z" fill="#2c2c2c" p-id="13589"></path></svg><span>' + file + '</span>' + homeflag + '<div class="delete" onclick=deleteProject(\'' + encodeURI(path + "/" + file) + '\')>delete</div>' + homeBtn + '</td></tr>')
                    }
                }
            }
        },
        error: function () {
            login()
        }
    })
}

function setHomePage(newhomepage) {
    let e = window.event || arguments.callee.caller.arguments[0]
    e.stopPropagation()
    $.ajax({
        url: "/projects/home/set",
        type: "post",
        data: {
            homepage: newhomepage
        },
        success: function (res) {
            if (res.status == "success") {
                // document.location.reload()
                $(e.target).parent().append('<div class="homeflag">Home</div>')
                $(e.target).remove()
                $("#" + homePageId + " .homeflag").remove()
                $("#" + homePageId + " td").append('<div class="home" onclick="setHomePage(\'' + homePage + '\')">home</div>')
                homePageId = hex_md5(newhomepage)
                homePage = newhomepage
            } else {
                login()
            }
        },
    })
}

// 返回上一层目录
function returnLastPage() {
    let path = nowPath.slice(0, -1).join("/")
    folderTitle(path)
    getProjectFiles(path)
}

// 跳转到代码编辑器页面
function returnCodePage(path) {
    if (deleteStatus) {
        return
    }
    document.location.href = "/code/show?path=" + decodeURIComponent(path)
}


// 下载目录
var DOWNLOAD_TIMEOUT_ID;
$(".download").click(() => {
    $(".download .select").focus()
    $(".selectbox").css("display", "block")
    clearTimeout(DOWNLOAD_TIMEOUT_ID)
})

$(".download .select").blur(() => {
    DOWNLOAD_TIMEOUT_ID = setTimeout(() => {
        $(".selectbox").css("display", "none")
    }, 200);
})

$(".selectbox .source").click(() => {
    window.location="/download?path="+projectName
    window.event.returnValue=false
})

$(".selectbox .directory").click(() => {
    if (nowPath.length == 1) {
        $(".download .select").focus()
        $(".selectbox").css("display", "block")
        clearTimeout(DOWNLOAD_TIMEOUT_ID)
        return
    }
    window.location="/download?path="+nowPath.join("/")
    window.event.returnValue=false
})


// 设置描述
function setDescript(descript) {
    if (descript == "") {
        $(".descript .content").html("no description")
    } else {
        $(".descript .content").html(descript)

    }
}

// 监听描述内容输入
$("#descriptContent").on("input propertychange", function () {
    $(".stringCount p").text($("#descriptContent").val().length)
})

// 点击描述编辑
$(".descript .edit").click(() => {
    OpenShade()
    $(".descriptEditor").css("top", "100px")
})

// 确认描述提交
$(".descriptEditor .commit").click(() => {
    $.ajax({
        url: "/projects/descript/set",
        type: "post",
        data: { name: projectName, descript: $("#descriptContent").val() },
        success: function (res) {
            if (res.status != "success") {
                alert("warm", "set descript failed, err:" + res.err)
            } else {
                setDescript($("#descriptContent").val())
                alert("info", "set descript success")
            }
            $(".descriptEditor .cancel").click()

        },
        error: function () {
            login()
        }
    })
})

// 取消描述提交
$(".descriptEditor .cancel").click(() => {
    $("#descriptContent").val("")
    $(".shade").click()
})

var deleteStatus = false
function deleteProject(path) {
    deleteStatus = true
    DeleteFile(decodeURI(path), false)
}

var deletePorjectPath;
$(".confirmBox .yes").click(function () {
    deleteStatus = false
    $(".confirmBox .confirm").css("top", "-70px")
    setTimeout(() => {
        $(".confirmBox").css("display", "none")
        $(".question").text("")
    }, 300);
    switch (confirmObject) {
        case "deleteFile":
            DeleteFile(deletePorjectPath, true)
    }
})

$(".confirmBox .no").click(() => {
    deleteStatus = false
})

// 删除文件 + 回调
function DeleteFile(path, request) {
    if (!request) {
        confirm("Do you want to delete " + path.split("/").slice(-1)[0] + "?", "deleteFile")
        deletePorjectPath = path
        return
    }
    $.ajax({
        url: "/service/project/delete?path=" + path,
        type: "get",
        success: () => {
            $("#" + hex_md5(path)).remove()
        },
        error: function (xhr, _, _) {
            alert("warm", "project delete failed, cause: " + xhr.responseJSON.err)
        }
    })
}

function eventTime(ts) {
    let t1 = new Date()
    let t2 = new Date(ts * 1000)
    if (t1.getFullYear() - t2.getFullYear() > 0) {
        var result = t1.getFullYear() - t2.getFullYear();
        return result + " years ago"
    }
    if (t1.getMonth() - t2.getMonth() > 0) {
        return result + " mounths ago"
    }
    if (t1.getDate() - t2.getDate() > 0) {
        var result = t1.getDate() - t2.getDate();
        return result + " days ago"
    }
    if (t1.getHours() - t2.getHours() > 0) {
        var result = t1.getHours() - t2.getHours();
        return result + " hours ago"
    }
    if (t1.getMinutes() - t2.getMinutes() > 0) {
        var result = t1.getMinutes() - t2.getMinutes();
        return result + " minutes ago"
    }
    return "just now"
}


// 拖拽上传
$(function () {
    //阻止浏览器默认行为。 
    $(document).on({
        dragleave: function (e) {    //拖离 
            e.preventDefault();
        },
        drop: function (e) {  //拖后放 
            e.preventDefault();
        },
        dragenter: function (e) {    //拖进 
            e.preventDefault();
        },
        dragover: function (e) {    //拖来拖去 
            e.preventDefault();
        }
    });
    let box = document.getElementById('dropbox'); //拖拽区域 
    box.addEventListener("drop", function (e) {
        e.preventDefault(); //取消默认浏览器拖拽效果 
        // 拖拽文件夹及文件
        let items = e.dataTransfer.items;
        for (let i = 0; i < items.length; i++) {
            // file 对象（按实例拖拽的内容）转换成 FileSystemFileEntry 对象 或 FileSystemDirectoryEntry 对象
            let item = items[i].webkitGetAsEntry();
            if (item) {
                // 读取文件
                scanFiles(item);
            }
        }
        // console.log(items.length)
        //检测是否是拖拽文件到页面的操作 
        // if (e.dataTransfer.files.length == 0) {
        //     return false;
        // }
        // for (let file of e.dataTransfer.files) {
        //     let found = false
        //     for (let f of fileList) {
        //         if (f.name == file.name) {
        //             found = true
        //             break
        //         }
        //     }
        //     if (found) { continue }
        //     fileList.push(file)
        //     $(".fileArea .uploadfiles").append('<div class="file"><div class="name">' + file.name + '</div><a href="javascript:void(0)" onclick="removeFile(this)">Remove file</a></div>')
        // }
    }, false);
});


var fullPathList = new Array();
function scanFiles(item) {
    // let elem       = document.createElement("li");
    // elem.innerHTML = file.name;
    // container.appendChild(elem);
    if (item.isFile) {
        for (let f of fileList) {
            if (f.name == item.name) {
                found = true
                return
            }
        }
        $(".fileArea .uploadfiles").append('<div class="file"><div class="name">' + item.name + '</div><a href="javascript:void(0)" onclick="removeFile(this)">Remove file</a></div>')
        fullPathList.push(item.fullPath)
        new Promise((resolve, reject) => item.file(resolve, reject)).then(file => {
            fileList.push(file)
            showNoFiles()
        });
    }
    // 如果是目录，则递归读取
    if (item.isDirectory) {
        // 使用目录实体来创建 FileSystemDirectoryReader 实例
        let directoryReader = item.createReader();
        // let directoryContainer = document.createElement("ul");
        // container.appendChild(directoryContainer);

        // 上面只是创建了 reader 实例，现在使用 reader 实例来读取 目录实体（读取目录内容）
        directoryReader.readEntries(function (entries) {
            // 循环目录内容
            entries.forEach(function (entry) {
                // 处理内容（递归）
                scanFiles(entry);
            });
        });
    }
}

function showNoFiles() {
    if (fileList.length < 1) {
        $(".noFiles").css('display', 'block')
    } else {
        $(".noFiles").css('display', 'none')
    }
}