package login

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	service "websoon/api/service"
	conf "websoon/config"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func loginPage(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", nil)
}



var WebsocketMap = make(map[string]*websocket.Conn)

func loginCallback(c *gin.Context) {
	// 回调给m码上登录
	userId := c.PostForm("userId")
	nickname := c.PostForm("nickname")
	avatar := c.PostForm("avatar")
	tempUserId := c.PostForm("tempUserId")
	c.JSON(http.StatusOK, gin.H{"errcode": 0, "message": "success"})
	// 回调给前端
	send(tempUserId, userId, nickname, avatar)	
	service.CreateUser(userId,nickname)
}

var upGrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func isLogin(c *gin.Context) {
	ws, err := upGrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer ws.Close()
	_, tempUserId, _ := ws.ReadMessage()
	var CloseChan = make(chan interface{})
	WebsocketMap[string(tempUserId)] = ws
	go accept(ws, CloseChan, string(tempUserId))
	<-CloseChan
}

func accept(ws *websocket.Conn, CloseChan chan interface{}, tempUserId string) {
	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			CloseChan <- 0
			delete(WebsocketMap, tempUserId)
			return
		}
	}
}

type UserInfo struct{
	Id string `json:"id"`
	Nickname string `json:"nickname"`
	Avatar string `json:"avatar"`
}

func send(tempUserId string, id, nickname, avatar string) {
	if ws, ok := WebsocketMap[tempUserId]; ok {
		var userinfo = UserInfo{
			Id: id,
			Nickname: nickname,
			Avatar: avatar,
		}
		content,_ := json.Marshal(userinfo)
		err := ws.WriteMessage(1, content)
		if err != nil {
			log.Println(err)
		}
	}

}

func loginQrcode(c *gin.Context) {
	resp, err := http.Get("https://server01.vicy.cn/8lXdSX7FSMykbl9nFDWESdc6zfouSAEz/wxLogin/tempUserId?secretKey=" + conf.Parmas.QrcodeSecret)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	defer resp.Body.Close()
	resbyte, _ := ioutil.ReadAll(resp.Body)
	c.String(http.StatusOK, string(resbyte))
}
