$(".title").click(()=>{
    document.location.href = "../tp2/m2.html"
})

$(".bingo").click(()=>{
    document.location.href = "right.html"
})

$(document).ready(()=>{
    $.ajax({
        url:"https://wb.deallate.site/api/d2312a53a71e6d5aa047fcc726bac21f43a54ac38c0dc76ef52697cac23452cd8b57d58ca7d9c7558a543d91c8515f0d/c8e6db78aa158000b638875000063405f9f2cd27214b07045e3aa8e0faf7fa03fc10ea92520059c97d33f4ca12cf32ec/d049eee99cd30ab3a32ab3b195262c2260b983cefe0ad304a0ec5a7167860e12d99cb8b1faa508aab9de8c9db9623bc5/return/name",
        type:"POST",
        data:{
            name:"Edsion"
        },
        success:(res)=>{
            let result = JSON.parse(res).result
            $(".bingo").text(result[0].Body.name)
            // console.log(result)
        }
    })
    
    $.ajax({
        url:"https://wb.deallate.site/api/d2312a53a71e6d5aa047fcc726bac21f43a54ac38c0dc76ef52697cac23452cd8b57d58ca7d9c7558a543d91c8515f0d/c8e6db78aa158000b638875000063405f9f2cd27214b07045e3aa8e0faf7fa03fc10ea92520059c97d33f4ca12cf32ec/16d5fc737235252f09b45e2f4f452d015a61e1c7c2585637e436814c931598cbe19706934ba9d1b81554433e4dfcad24/coba",
        type:"GET",
        success:(res)=>{
            let result = JSON.parse(res).result
            console.log(JSON.parse(result))
        }
    })
})