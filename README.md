![header.png](https://gimg2.baidu.com/image_search/src=http%3A%2F%2F5b0988e595225.cdn.sohucs.com%2Fimages%2F20180428%2F2d434d7362c24fbaaf6d5f1289d90e93.jpeg&refer=http%3A%2F%2F5b0988e595225.cdn.sohucs.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1648201173&t=9163089a1a38fff5b557ec5499e96ec1)

# 【WEBSOON】基于serverless理念的前端项目管理及接口部署平台🚀

# 简介
1. 该项目基于serverless概念设计并开发，主要作用是解决前端初学者需部署后端服务的痛点，辅助前端开发初学者专注前端技术学习。
2. 项目分为两个大模块，一个是项目管理模块，另一个是云函数管理模块； 
3. 项目管理模块类似文件管理，可以增删下载文件、项目之余，实现代码线上编辑。该模块的亮点在于，只需用户上传完整项目，即可在线预览效果，并使用设定时限的公网地址将网页分享给第三方； 
4. 云函数管理模块采用了的现有供应商serverless思路，用户只需上传或编辑接口代码，后端服务接收请求为其分配虚拟服务，然后生成专属公网api接口;
5. 该模块亮点在于只需些许时间成本学习接口开发，就能绕开后端服务部署来使用满足用户需求的接口，专 注于前端开发；
6. 该项目整体设计及完成度如上，未来后期还会更新需求，例如文件搜索、项目分享等。

# 安装和使用

1. 服务器安装docker；
2. 填写params相应内容（QrcodeSecret为扫码登录使用的秘钥，具体操作见http://login.vicy.cn/， 感谢 码上登录 技术支持！）；
3. front/js/login.js 中的 islogin_websocket_url 为服务部署好的websocket服务地址，例如 wss://xx.xxx.com/login/islogin；
4. 部署好域名，nginx代理（假若你有域名）；
5. 编译(前提有golang环境，否则直接下载二进制文件（websoon）启动就好)；


>⚠️本项目最终为了方便上线小项目，例如简单的物联网应用，以及帮助前端新手跳过部署服务器难关，请勿在生产环境中使用 ~~


![home_page.png](https://bimg.bemfa.com/234296e355adfcd4b3909cd632cd9d48-dfa181dbd6de558b08b918c44c1ec1ff-1645610400.jpg)