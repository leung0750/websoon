package utils

import (
	"encoding/json"
	"io/ioutil"
	"os"
)

func FileExist(filepath string) bool {
	_, err := os.Stat(filepath)
	if err == nil {
		return true
	}
	if os.IsNotExist(err) {
		return false
	}
	return false
}



func FileUnmarshal(filename string,v interface{})(error){
	content,err := ioutil.ReadFile(filename)
	if err != nil {
		return err
	}
	err = json.Unmarshal(content,&v)
	if err != nil {
		return err
	}
	return nil
}

func FileMarshal(v interface{},filename string)(error){
	content,err := json.Marshal(v)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(filename,content,0666)
	if err != nil {
		return err
	}
	return nil
}