package apis

import (
	"encoding/hex"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"sort"
	"strconv"
	"strings"
	"time"
	conf "websoon/config"
	"websoon/utils"

	"github.com/gin-gonic/gin"
)

type CloudFunc struct {
	Id          string `json:"id"`
	Route       string `json:"route"`
	Description string `json:"description"`
	Link        string `json:"link"`
	CreateTime  int    `json:"cratetime"`
	Method      string `json:"method"`
}

type CloudFuncMap map[string]CloudFunc

type CloudFuncGroup struct {
	Name       string       `json:"name"`
	CreateTime int          `json:"cratetime"`
	FuncMap    CloudFuncMap `json:"cloud_func_map"`
}

func addCloudFunc(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil || id == "" {
		c.Status(http.StatusBadRequest)
		return
	}
	route := c.PostForm("route")
	description := c.PostForm("description")
	code := c.PostForm("code")
	method := c.PostForm("method")
	groupid := c.PostForm("groupid")
	ts := int(time.Now().Unix())

	interfaceID := utils.Md5(route + id + groupid + method)

	if !utils.FileExist(conf.UserFolder + id + "/CloudFunc") {
		os.MkdirAll(conf.UserFolder+id+"/CloudFunc", 0666)
	}
	var cloudGroup = make(map[string]CloudFuncGroup)
	err = utils.FileUnmarshal(conf.UserFolder+id+conf.CloudFuncMap, &cloudGroup)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	ids,_ := utils.AesEncryptSimple([]byte(id),conf.EncryptKey,conf.EncryptVi)
	gids,_ := utils.AesEncryptSimple([]byte(groupid),conf.EncryptKey,conf.EncryptVi)
	fids,_ := utils.AesEncryptSimple([]byte(interfaceID),conf.EncryptKey,conf.EncryptVi)
	apiLink := "/api/" + hex.EncodeToString(ids) + "/" + hex.EncodeToString(gids) + "/" + hex.EncodeToString(fids) + route
	cloudGroup[groupid].FuncMap[interfaceID] = CloudFunc{
		Id:          interfaceID,
		Route:       route,
		Description: description,
		CreateTime:  ts,
		Link:        apiLink,
		Method:      method,
	}
	err = utils.FileMarshal(cloudGroup, conf.UserFolder+id+conf.CloudFuncMap)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	err = ioutil.WriteFile(conf.UserFolder+id+"/CloudFunc/"+interfaceID+".py", []byte(code), 0666)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	c.JSON(http.StatusOK, gin.H{"link": apiLink})
	res, _ := exec.Command("/bin/bash", "-c", "docker ps | grep websoon-"+id).Output()
	if len(strings.Split(string(res), "\n")) < 2 {
		exec.Command("/bin/bash", "-c", "cd "+conf.UserFolder+id+" && docker-compose up -d").Run()
	}
}

func getCloudFunc(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil || id == "" {
		c.Status(http.StatusBadRequest)
		return
	}
	var cloudGroup = make(map[string]CloudFuncGroup)
	err = utils.FileUnmarshal(conf.UserFolder+id+conf.CloudFuncMap, &cloudGroup)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	// var cloudFuncMapArray []CloudFuncMap
	// var tsArray []int
	// for _, cg := range cloudGroup {
	// 	tsArray = append(tsArray, cg.CreateTime)
	// }
	// sort.Ints(tsArray)
	// for _, ts := range tsArray {
	// 	for _, cg := range cloudGroup {
	// 		if ts == cg.CreateTime {
	// 			cloudFuncMapArray = append(cloudFuncMapArray, cg.FuncMap)
	// 			break
	// 		}
	// 	}
	// }
	// var CloudFuncList [][]CloudFunc
	// for _, fm := range cloudFuncMapArray {
	// 	if len(tsArray) > 0 {
	// 		tsArray = append(tsArray[:0], tsArray[1:]...)
	// 	}
	// 	var cloudFuncArray []CloudFunc
	// 	for _, cf := range fm {
	// 		tsArray = append(tsArray, cf.CreateTime)
	// 	}
	// 	sort.Ints(tsArray)
	// 	for _, ts := range tsArray {
	// 		for _, cf := range fm {
	// 			if ts == cf.CreateTime {
	// 				cloudFuncArray = append(cloudFuncArray, cf)
	// 				break
	// 			}
	// 		}
	// 	}
	// 	CloudFuncList = append(CloudFuncList, cloudFuncArray)
	// }
	c.JSON(http.StatusOK, cloudGroup)
}

func getCloudFuncCode(c *gin.Context){
	id, err := c.Cookie("id")
	if err != nil || id == "" {
		c.Status(http.StatusBadRequest)
		return
	}
	funcid 	:= c.PostForm("funcid")
	code,err := ioutil.ReadFile(conf.UserFolder+id+"/CloudFunc/"+funcid+".py")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	c.String(http.StatusOK,string(code))
}

func removeCloudFunc(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil || id == "" {
		c.Status(http.StatusBadRequest)
		return
	}
	groupid := c.PostForm("groupid")
	couldFuncID := c.PostForm("id")
	var cloudGroup = make(map[string]CloudFuncGroup)
	err = utils.FileUnmarshal(conf.UserFolder+id+conf.CloudFuncMap, &cloudGroup)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	delete(cloudGroup[groupid].FuncMap, couldFuncID)
	err = utils.FileMarshal(cloudGroup, conf.UserFolder+id+conf.CloudFuncMap)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	os.Remove(conf.UserFolder + id + "/CloudFunc/" + couldFuncID + ".py")
	c.Status(http.StatusOK)
}

func addGroup(c *gin.Context) {
	id, err := c.Cookie("id")
	if err != nil || id == "" {
		c.Status(http.StatusBadRequest)
		return
	}
	groupName := c.PostForm("groupName")
	groupid := utils.Md5(groupName + strconv.Itoa(int(time.Now().Unix())))
	var cloudGroup = make(map[string]CloudFuncGroup)
	err = utils.FileUnmarshal(conf.UserFolder+id+conf.CloudFuncMap, &cloudGroup)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	if _,ok := cloudGroup[groupid];ok{
		c.JSON(http.StatusOK,gin.H{"status":"failed","err":"repeat group"})
		return
	}
	cloudGroup[groupid] = CloudFuncGroup{
		Name: groupName,
		CreateTime: int(time.Now().Unix()),
		FuncMap: CloudFuncMap{},
	}
	err = utils.FileMarshal(cloudGroup,conf.UserFolder+id+conf.CloudFuncMap)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	c.JSON(http.StatusOK,gin.H{"status":"success","id":groupid})
}

func getGroup(c *gin.Context){
	id, err := c.Cookie("id")
	if err != nil || id == "" {
		c.Status(http.StatusBadRequest)
		return
	}
	var cloudGroup = make(map[string]CloudFuncGroup)
	err = utils.FileUnmarshal(conf.UserFolder+id+conf.CloudFuncMap, &cloudGroup)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	var GroupArray  []map[string]string
	var tsArray []int
	for _,group := range cloudGroup{
		tsArray = append(tsArray, group.CreateTime)
	}
	sort.Ints(tsArray)
	for _,ts := range tsArray{
		for id,group := range cloudGroup{
			if group.CreateTime == ts{
				var g = make(map[string]string)
				g[id] = group.Name
				GroupArray = append(GroupArray, g)
			}
		}
	}
	c.JSON(http.StatusOK,GroupArray)
}

func delGroup(c *gin.Context){
	id, err := c.Cookie("id")
	if err != nil || id == "" {
		c.Status(http.StatusBadRequest)
		return
	}
	groupid := c.PostForm("groupid")
	var cloudGroup = make(map[string]CloudFuncGroup)
	err = utils.FileUnmarshal(conf.UserFolder+id+conf.CloudFuncMap, &cloudGroup)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	if groupid == utils.Md5("Default"){
		c.Status(http.StatusBadRequest)
		return
	}
	for fid,_ := range cloudGroup[groupid].FuncMap{
		os.Remove(conf.UserFolder+id+"/CloudFunc/"+fid+".py")
	}
	delete(cloudGroup,groupid)
	err = utils.FileMarshal(cloudGroup,conf.UserFolder+id+conf.CloudFuncMap)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	c.Status(http.StatusOK)
}

func renameGroup(c *gin.Context){
	id, err := c.Cookie("id")
	if err != nil || id == "" {
		c.Status(http.StatusBadRequest)
		return
	}
	groupName := c.PostForm("groupName")
	groupid := c.PostForm("groupid")
	var cloudGroup = make(map[string]CloudFuncGroup)
	err = utils.FileUnmarshal(conf.UserFolder+id+conf.CloudFuncMap, &cloudGroup)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	obj := cloudGroup[groupid]
	obj.Name = groupName
	cloudGroup[groupid] = obj
	err = utils.FileMarshal(cloudGroup,conf.UserFolder+id+conf.CloudFuncMap)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	c.Status(http.StatusOK)
}