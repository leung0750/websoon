package service

import (
	"github.com/gin-gonic/gin"
)

func Router(e *gin.Engine) {
	e.GET("/", gateWay)

	e.GET("expire",expire)

	e.GET("service/userinfo", getUserInfo)

	e.GET("service/project/create/:name", createProject)

	e.GET("service/project/delete", deleteObject)

	e.GET("service/project/get", getProject)

	e.GET("projects/*name", showProjects)

	e.POST("projects/descript/get", getProjectDescript)

	e.POST("projects/descript/set", setProjectDescript)

	e.POST("projects/files/get", getProjectFiles)

	e.POST("projects/home/set", setHomePage)

	e.POST("projects/home/get", getHomePage)

	e.GET("code/show", showCode)

	e.GET("code/raw", rawCode)

	e.GET("download", downloadFiles)

	e.POST("projects/files/content", getFileContent)
	e.POST("projects/files/edit/commit", fileEditCommit)
	e.POST("projects/object/create", objectCreate)
	e.POST("projects/files/upload", filesUpload)

	e.GET("file/*file", loadFile)
	e.GET("share/website/*file",shareWebsite)


}
