package main

import (
	"websoon/api/login"
	"websoon/api/service"
	"websoon/api/apis"
	conf "websoon/config"

	"github.com/gin-gonic/gin"
)

type Option func(*gin.Engine)

var options = []Option{}

func routerInclude(opts ...Option) {
	options = append(options, opts...)
}

func routerInit() *gin.Engine {
	r := gin.New()
	r.Static("/statics", "../front/statics")
	r.LoadHTMLGlob("../front/template/*")
	for _, opt := range options {
		opt(r)
	}
	return r
}

func init(){
	conf.ConfigInit()
	routerInclude(
		login.Router,
		service.Router,
		apis.Router,
	)
}