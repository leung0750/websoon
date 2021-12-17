package service

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
	"time"
	"websoon/api/apis"
	conf "websoon/config"

	"websoon/utils"
)

type userConfig struct {
	CTime    string `json:"ctime"`
	Id       string `json:"id"`
	Nickname string `json:"nickname"`
}

func CreateUser(id,nickname string) {
	if !utils.FileExist(conf.UserFolder) {
		os.Mkdir(conf.UserFolder, 0666)
	}
	if !utils.FileExist(conf.UserFolder + id) {
		os.Mkdir(conf.UserFolder+id, 0666)
		os.Mkdir(conf.UserFolder+id+"/project", 0666)
		dockerCompose,_ := ioutil.ReadFile(conf.DockerCompose)
		ioutil.WriteFile(conf.UserFolder+id+"/docker-compose.yml",[]byte(strings.ReplaceAll(string(dockerCompose),"[USERID]",id)),0666)		
		var cloudGroup = make(map[string]apis.CloudFuncGroup)
		cloudGroup[utils.Md5("Default")] = apis.CloudFuncGroup{
			Name: "Default",
			CreateTime: int(time.Now().Unix()),
			FuncMap: apis.CloudFuncMap{},
		}
		content,_ := json.Marshal(cloudGroup)
		ioutil.WriteFile(conf.UserFolder + id +conf.CloudFuncMap,content,0666)
		var config = userConfig{
			CTime: CTime(),
			Id:    id,
			Nickname: nickname,
		}
		content, _ = json.Marshal(&config)
		ioutil.WriteFile(conf.UserFolder+id+"/.config", content, 0666)
	}else{
		var config userConfig
		content,_ := ioutil.ReadFile(conf.UserFolder+id+"/.config")
		json.Unmarshal(content,&config)
		if config.Nickname != nickname{
			config.Nickname = nickname
			content,_ = json.Marshal(config)
			ioutil.WriteFile(conf.UserFolder+id+"/.config", content, 0666)
		}
	}
}

func GetUserProject(id string) ([]string, error) {
	if !utils.FileExist(conf.UserFolder + id) {
		return nil, fmt.Errorf("can't find the user")
	}
	filelist, err := ioutil.ReadDir(conf.UserFolder + id +"/project")
	if err != nil {
		return nil, err
	}
	var projectlist []string
	for _, f := range filelist {
		if f.IsDir() {
			projectlist = append(projectlist, f.Name())
		}
	}
	return projectlist, nil
}

func CTime() string {
	tt := time.Now()
	month := tt.Month().String()
	year := strconv.Itoa(tt.Year())
	day := strconv.Itoa(tt.Day())
	return month + " " + day + ", " + year
}
