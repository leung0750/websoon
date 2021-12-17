package main

import (
	conf "websoon/config"
)

func main() {
	Http := routerInit()
	if err := Http.Run(":" + conf.Parmas.Port); err != nil {
		return
	}
}