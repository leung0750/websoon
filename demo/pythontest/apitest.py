import requests

data = {
    "name":"edsion",
    "age":18,
    "job":"worker"
}
res = requests.post("https://wb.deallate.site/api/d2312a53a71e6d5aa047fcc726bac21f43a54ac38c0dc76ef52697cac23452cd8b57d58ca7d9c7558a543d91c8515f0d/c8e6db78aa158000b638875000063405f9f2cd27214b07045e3aa8e0faf7fa03fc10ea92520059c97d33f4ca12cf32ec/f2406042916a2398d03f212e729ec90e289dcf03dceaf822ecef5309aad78c21d9af4cf1bd44eb7d2cc06b4112e2738d/a",data=data)
print(res.text)