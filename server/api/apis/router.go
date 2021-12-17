package apis

import (
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os/exec"
	conf "websoon/config"
	"websoon/utils"

	"github.com/gin-gonic/gin"
)

type ApiRequest struct{
	Body interface{} `json:"Body"`
	Head interface{} `json:"Head"`
}

func Router(e *gin.Engine){
	e.GET("api/:ids/:gids/:fids/*route",func(c *gin.Context) {
		ids := c.Param("ids")
		gids := c.Param("gids")
		fids := c.Param("fids")
		idsb,err := hex.DecodeString(ids)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		gidsb,err := hex.DecodeString(gids)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		fidsb,err := hex.DecodeString(fids)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		id,err := utils.AesDecryptSimple(idsb,conf.EncryptKey,conf.EncryptVi)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		gid,err := utils.AesDecryptSimple(gidsb,conf.EncryptKey,conf.EncryptVi)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		fid,err := utils.AesDecryptSimple(fidsb,conf.EncryptKey,conf.EncryptVi)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		var cloudGroup = make(map[string]CloudFuncGroup)
		err = utils.FileUnmarshal(conf.UserFolder+string(id)+conf.CloudFuncMap, &cloudGroup)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		if cloudGroup[string(gid)].FuncMap[string(fid)].Method != "GET"{
			c.Status(http.StatusBadRequest)
			return
		}
		body,err := ioutil.ReadAll(c.Request.Body)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		var apiRequest = ApiRequest{
			Body: string(body),
			Head: c.Request.Header,
		}
		aq,_ := json.Marshal(apiRequest)
		result,err := exec.Command("/bin/sh","-c",fmt.Sprintf("docker exec websoon-%s python main.py %s %s %s %s",id,id,gid,fid,base64.StdEncoding.EncodeToString(aq))).Output()
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		c.JSON(http.StatusOK,string(result))
	})

	e.POST("api/:ids/:gids/:fids/*route",func(c *gin.Context) {
		ids := c.Param("ids")
		gids := c.Param("gids")
		fids := c.Param("fids")
		idsb,err := hex.DecodeString(ids)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		gidsb,err := hex.DecodeString(gids)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		fidsb,err := hex.DecodeString(fids)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		id,err := utils.AesDecryptSimple(idsb,conf.EncryptKey,conf.EncryptVi)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		gid,err := utils.AesDecryptSimple(gidsb,conf.EncryptKey,conf.EncryptVi)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		fid,err := utils.AesDecryptSimple(fidsb,conf.EncryptKey,conf.EncryptVi)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		var cloudGroup = make(map[string]CloudFuncGroup)
		err = utils.FileUnmarshal(conf.UserFolder+string(id)+conf.CloudFuncMap, &cloudGroup)
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		if cloudGroup[string(gid)].FuncMap[string(fid)].Method != "POST"{
			c.Status(http.StatusBadRequest)
			return
		}
		c.PostForm("")
		var body = make(map[string]string)
		for key, value := range c.Request.PostForm {
			body[key] = value[0]
		}
		var apiRequest = ApiRequest{
			Body: body,
			Head: c.Request.Header,
		}
		aq,_ := json.Marshal(apiRequest)
		result,err := exec.Command("/bin/sh","-c",fmt.Sprintf("docker exec websoon-%s python main.py %s %s %s %s",id,id,gid,fid,base64.StdEncoding.EncodeToString(aq))).Output()
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		c.JSON(http.StatusOK,string(result))
	})

	e.POST("api/cloudBase/coludFunc/add",addCloudFunc)

	e.GET("api/cloudBase/coludFunc/get",getCloudFunc)

	e.POST("api/cloudBase/coludFunc/code/get",getCloudFuncCode)

	e.POST("api/cloudBase/coludFunc/remove",removeCloudFunc)

	e.POST("api/cloudBase/group/add",addGroup)

	e.GET("api/cloudBase/group/get",getGroup)

	e.POST("api/cloudBase/group/del",delGroup)

	e.POST("api/cloudBase/group/rename",renameGroup)
}