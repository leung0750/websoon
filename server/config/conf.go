package conf

import (
	"log"

	"gopkg.in/ini.v1"
)

type ServerDefault struct {
	DeafultParams `ini:"Defalut"`
}

type DeafultParams struct {
	Port         string `ini:"Port"`
	Host         string `ini:"Host"`
	QrcodeSecret string `ini:"QrcodeSecret"`
}

var Parmas = new(ServerDefault)

func ConfigInit() {
	err := ini.MapTo(Parmas, "params.ini")
	if err != nil {
		log.Panicln(err)
	}
}


const (
	UserFolder = "../user/"
	DockerCompose = "../docker/docker-compose.yml"
	CloudFuncMap = "/.cfm"
	DownloadPath = "./download"
	EncryptKey = "M7j37XX5ZJ9TRQix"      
	EncryptVi  = "PZZbSBzkkr1pvXQk"
)