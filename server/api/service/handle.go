package service

import (
	"encoding/hex"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
	conf "websoon/config"
	"websoon/utils"

	"github.com/gin-gonic/gin"
)

func gateWay(c *gin.Context) {
	_, err := c.Cookie("id")
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "../login")
		return
	}
	c.HTML(http.StatusOK, "main.html", nil)
}

func getUserInfo(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	content, err := ioutil.ReadFile(conf.UserFolder + id + "/.config")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	var info userConfig
	json.Unmarshal(content, &info)
	c.JSON(http.StatusOK, info)
}

type ProjectMeta struct {
	Id        int    `json:"id"`
	CTime     string `json:"ctime"`
	Introduce string `json:"introduce"`
	Empty     bool   `json:"empty"`
	Name      string `json:"name"`
	Author    string `json:"author"`
	Home      string `json:"home"`
}

func createProject(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	if !utils.FileExist(conf.UserFolder + id + "/project") {
		c.JSON(http.StatusBadRequest, gin.H{"err": "cannot find the user"})
		return
	}
	projectName := c.Param("name")
	if projectName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"err": "the project's name cannot be null"})
		return
	}
	if utils.FileExist(conf.UserFolder + id + "/project/" + projectName) {
		c.JSON(http.StatusBadRequest, gin.H{"err": "do not create the same project repeatedly"})
		return
	}

	unallowStr := []string{"/", "\\", ":", "*", "?", `"`, "<", ">", "|", "."}
	for _, s := range unallowStr {
		if strings.Contains(projectName, s) {
			c.JSON(http.StatusBadRequest, gin.H{"err": "unallow string"})
			return
		}
	}
	os.Mkdir(conf.UserFolder+id+"/project/"+projectName, 0666)
	var metaContent, _ = json.Marshal(ProjectMeta{
		Id:        int(time.Now().Unix()), // 可能会产生数据相冲
		CTime:     CTime(),
		Introduce: "The author makes no introduction",
		Empty:     true,
		Name:      projectName,
		Author:    id,
		Home:      "",
	})
	ioutil.WriteFile(conf.UserFolder+id+"/project/"+projectName+"/.meta", metaContent, 0666)
	c.JSON(http.StatusOK, "success")
}

func getProject(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	ProjectNameList, err := GetUserProject(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"err": err.Error()})
		return
	}
	var projectIdMap = make(map[int]ProjectMeta)
	var projectIdVect []int
	var projectMeta ProjectMeta
	var projectVect []ProjectMeta
	for _, fname := range ProjectNameList {
		meta, _ := ioutil.ReadFile(conf.UserFolder + id + "/project/" + fname + "/.meta")
		json.Unmarshal(meta, &projectMeta)
		dir, _ := ioutil.ReadDir(conf.UserFolder + id + "/project/" + fname)
		if len(dir) > 1 && projectMeta.Empty {
			projectMeta.Empty = false
			content, _ := json.Marshal(projectMeta)
			ioutil.WriteFile(conf.UserFolder+id+"/project/"+fname+"/.meta", content, 0666)
		}
		if len(dir) <= 1 && !projectMeta.Empty {
			projectMeta.Empty = true
			content, _ := json.Marshal(projectMeta)
			ioutil.WriteFile(conf.UserFolder+id+"/project/"+fname+"/.meta", content, 0666)
		}
		uid := projectMeta.Author
		content, _ := ioutil.ReadFile(conf.UserFolder + uid + "/.config")
		var conf userConfig
		json.Unmarshal(content, &conf)
		projectMeta.Author = conf.Nickname
		projectIdMap[projectMeta.Id] = projectMeta
		projectIdVect = append(projectIdVect, projectMeta.Id)
	}
	sort.Ints(projectIdVect)

	for _, id := range projectIdVect {
		projectVect = append(projectVect, projectIdMap[id])
	}

	c.JSON(http.StatusOK, projectVect)
}

func deleteObject(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	path := c.Query("path")
	if !utils.FileExist(conf.UserFolder + id + "/project/" + path) {
		c.JSON(http.StatusBadRequest, gin.H{"err": "cannot find the project"})
		return
	}
	os.RemoveAll(conf.UserFolder + id + "/project/" + path)
	c.Status(http.StatusOK)
}

func showProjects(c *gin.Context) {
	c.HTML(http.StatusOK, "project.html", nil)
}

func showCode(c *gin.Context) {
	c.HTML(http.StatusOK, "code.html", nil)
}

func rawCode(c *gin.Context) {
	c.HTML(http.StatusOK, "rawCode.html", nil)
}

func getProjectDescript(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	projectName := c.PostForm("name")
	content, err := ioutil.ReadFile(conf.UserFolder + id + "/project/" + projectName + "/.meta")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	var meta ProjectMeta
	err = json.Unmarshal(content, &meta)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "description": meta.Introduce})
}

func setProjectDescript(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	projectName := c.PostForm("name")
	introduce := c.PostForm("descript")
	content, err := ioutil.ReadFile(conf.UserFolder + id + "/project/" + projectName + "/.meta")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	var meta ProjectMeta
	err = json.Unmarshal(content, &meta)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	meta.Introduce = introduce
	content, err = json.Marshal(meta)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	err = ioutil.WriteFile(conf.UserFolder+id+"/project/"+projectName+"/.meta", content, 0666)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func getProjectFiles(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	path := c.PostForm("path")
	fs, err := os.ReadDir(conf.UserFolder + id + "/project/" + path)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	var folderArray []string
	var fileArray []string
	for _, f := range fs {
		if f.Name() == ".meta" {
			continue
		}
		if f.IsDir() {
			folderArray = append(folderArray, f.Name())
		} else {
			fileArray = append(fileArray, f.Name())
		}
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "folders": folderArray, "files": fileArray})
}

func getFileContent(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	path := c.PostForm("path")
	suffix := strings.Split(path,".")[len(strings.Split(path,"."))-1]
	allowSuffix := []string{"txt","py","go","js","css","html","yml","bat","ini","md","conf"}
	var allowShowCode = false
	for _,suf := range allowSuffix{
		if suf == suffix {
			allowShowCode = true
			break
		}
	}
	f,_ := os.Stat(conf.UserFolder + id + "/project/" + path)
	size := utils.FormatFileSize(f.Size())
	if f.Size() > 1000*1024*1000 || !allowShowCode{
		c.JSON(http.StatusOK,gin.H{"status":"nas","size":size})
		return
	}
	content, err := os.ReadFile(conf.UserFolder + id + "/project/" + path)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "content": string(content),"size":size})
}

func fileEditCommit(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	content := c.PostForm("content")
	path := c.PostForm("path")
	meta, err := ioutil.ReadFile(conf.UserFolder + id + "/project/" + strings.Split(path, "/")[0] + "/.meta")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	var Meta ProjectMeta
	json.Unmarshal(meta, &Meta)
	meta, err = json.Marshal(Meta)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	err = ioutil.WriteFile(conf.UserFolder+id+"/project/"+strings.Split(path, "/")[0]+"/.meta", meta, 0666)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	err = ioutil.WriteFile(conf.UserFolder+id+"/project/"+path, []byte(content), 0666)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func objectCreate(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	path := c.PostForm("path")
	name := c.PostForm("name")
	type_ := c.PostForm("type")
	switch type_ {
	case "file":
		if _, err := os.Create(conf.UserFolder + id + "/project/" + path + "/" + name); err != nil {
			c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
			return
		}
	case "folder":
		if err := os.Mkdir(conf.UserFolder+id+"/project/"+path+"/"+name, 0666); err != nil {
			c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func filesUpload(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	root := c.PostForm("root")
	files := form.File["file"]
	paths := c.PostFormArray("path")
	for i, f := range files {
		if f.Filename == ".meta"{
			continue
		}
		if f.Size > 100*1024*1024 {
			continue
		}
		path := paths[i]
		dir := strings.Join(strings.Split(path, "/")[:len(strings.Split(path, "/"))-1], "/")
		if !utils.FileExist(conf.UserFolder + id + "/project/" + root + dir) {
			os.MkdirAll(conf.UserFolder+id+"/project/"+root+dir, os.ModePerm)
		}
		c.SaveUploadedFile(f, conf.UserFolder+id+"/project/"+root+path)
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func downloadFiles(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	path := c.Query("path")
	path = conf.UserFolder + id + "/project/" + path
	if !utils.FileExist(path) {
		c.Status(http.StatusNotFound)
		return
	}
	c.Header("Content-Type", "application/octet-stream")
	
	c.Header("Content-Transfer-Encoding", "binary")
	f, _ := os.Stat(path)
	if f.IsDir() {
		if !utils.FileExist(conf.DownloadPath) {
			os.Mkdir(conf.DownloadPath, 0666)
		}
		src_dir := path
		zip_file_name := utils.Md5(strconv.Itoa(int(time.Now().Unix()))+path) + ".zip"
		utils.Zip(src_dir, zip_file_name)
		c.Header("Content-Disposition", "attachment; filename="+strings.Split(path, "/")[len(strings.Split(path, "/"))-1]+".zip")
		c.File(conf.DownloadPath + "/" + zip_file_name)
		os.Remove(conf.DownloadPath + "/" + zip_file_name)
	}else{
		c.Header("Content-Disposition", "attachment; filename="+strings.Split(path, "/")[len(strings.Split(path, "/"))-1])
		c.File(path)
	}
}

func setHomePage(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	homepage := c.PostForm("homepage")
	projectName := strings.Split(homepage, "/")[0]
	content, err := ioutil.ReadFile(conf.UserFolder + id + "/project/" + projectName + "/.meta")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	var meta ProjectMeta
	err = json.Unmarshal(content, &meta)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	meta.Home = homepage
	content, err = json.Marshal(meta)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	err = ioutil.WriteFile(conf.UserFolder+id+"/project/"+projectName+"/.meta", content, 0666)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func getHomePage(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	projectName := c.PostForm("projectName")
	content, err := ioutil.ReadFile(conf.UserFolder + id + "/project/" + projectName + "/.meta")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	var meta ProjectMeta
	err = json.Unmarshal(content, &meta)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": err.Error()})
		return
	}
	if !utils.FileExist(conf.UserFolder+id+"/project/"+meta.Home) || meta.Home == "" {
		c.JSON(http.StatusOK, gin.H{"status": "failed", "err": "home faile is not exist"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "home": meta.Home})
}

func loadFile(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil {
		c.Status(http.StatusNotFound)
		return
	}
	file := c.Param("file")
	c.File(conf.UserFolder + id + "/project/" + file)
}

func shareWebsite(c *gin.Context) {
	var path string
	var filePath string
	var id string
	ts := c.Query("_ts")
	if ts != "" {
		ts_, _ := strconv.Atoi(ts)
		if ts_ < int(time.Now().Unix()) {
			c.Redirect(http.StatusPermanentRedirect, "https://"+conf.Parmas.Host+"/expire")
			// c.HTML(http.StatusOK,"expire.html",nil)
			return
		}
		ct := c.Query("_ct")
		key := utils.Md5(ts)[:16]
		cbytes, _ := hex.DecodeString(ct)
		content, err := utils.AesDecryptSimple(cbytes, key, "000000"+ts)
		if err != nil {
			c.Status(http.StatusNotFound)
			return
		}
		id = strings.Split(string(content), ":")[0]
		project := strings.Split(string(content), ":")[1]
		path = strings.Split(string(content), ":")[2]
		sidByte, err := utils.AesEncryptSimple([]byte(id), utils.Md5(project)[:16], "000000"+ts)
		if err != nil {
			c.Status(http.StatusNotFound)
			return
		}
		c.SetCookie("project", project, 36000*24, "/", conf.Parmas.Host, false, true)
		c.SetCookie("ts", ts, 36000*24, "/", conf.Parmas.Host, false, true)
		c.SetCookie("sid", hex.EncodeToString(sidByte), 36000*24, "/", conf.Parmas.Host, false, true)
		filePath = conf.UserFolder + id + "/project/" + path
		_, err = ioutil.ReadDir(filePath)
		if err == nil {
			c.Status(http.StatusNotFound)
			return
		}
		c.File(filePath)
	} else {
		// 静态文件加载
		ts, err := c.Cookie("ts")
		if err != nil {
			c.Status(http.StatusNotFound)
			return
		}
		ts_, _ := strconv.Atoi(ts)
		if ts_ < int(time.Now().Unix()) {
			c.Redirect(http.StatusPermanentRedirect, "https://"+conf.Parmas.Host+"/expire")
			// c.HTML(http.StatusOK,"expire.html",nil)
			return
		}
		project, err := c.Cookie("project")
		if err != nil {
			c.Status(http.StatusNotFound)
			return
		}
		sid, err := c.Cookie("sid")
		if err != nil {
			c.Status(http.StatusNotFound)
			return
		}
		ctsid, _ := hex.DecodeString(sid)
		idbyte, err := utils.AesDecryptSimple(ctsid, utils.Md5(project)[:16], "000000"+ts)
		if err != nil {
			c.Status(http.StatusNotFound)
			return
		}
		id = string(idbyte)
		path = c.Param("file")
		if path == "" {
			c.Status(http.StatusNotFound)
			return
		}
		filePath = conf.UserFolder + id + "/project" + path
		_, err = ioutil.ReadDir(filePath)
		if err == nil {
			c.Status(http.StatusNotFound)
			return
		}
		c.File(filePath)
	}
}

// func shareStaticFile(c *gin.Context) {
// 	ts, err := c.Cookie("ts")
// 	if err != nil {
// 		c.Status(http.StatusNotFound)
// 		return
// 	}
// 	ts_, _ := strconv.Atoi(ts)
// 	if ts_ < int(time.Now().Unix()) {
// 		c.Redirect(http.StatusPermanentRedirect,"expire")
// 		return
// 	}
// 	project, err := c.Cookie("project")
// 	if err != nil {
// 		c.Status(http.StatusNotFound)
// 		return
// 	}
// 	sid, err := c.Cookie("sid")
// 	if err != nil {
// 		c.Status(http.StatusNotFound)
// 		return
// 	}
// 	ctsid, _ := hex.DecodeString(sid)
// 	id, err := utils.AesDecryptSimple(ctsid, utils.Md5(project)[:16], "000000"+ts)
// 	if err != nil {
// 		c.Status(http.StatusNotFound)
// 		return
// 	}
// 	file := c.Param("file")
// 	c.File(conf.UserFolder + string(id) + "/" + project + "/static" + file)
// }

func expire(c *gin.Context) {
	c.HTML(http.StatusOK, "expire.html", nil)
}
