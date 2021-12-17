package login

import "github.com/gin-gonic/gin"

func Router(e *gin.Engine){
	e.GET("login",loginPage)

	e.GET("login/qrcode",loginQrcode)

	e.POST("login/callback",loginCallback)

	e.GET("login/islogin",isLogin)
}