/*

//拆分2值
var Y = 0.299*r + 0.587*g + 0.114*b;
黑白 0，255 2种颜色

//不拆分2值
当前颜色和附近的颜色是否差异化确定（尝试从 当前行的 1,1 位置取色作为基准值）

//编辑
1.默认合并
2.默认不合并，手动合并（邻近区域合并,合并成一个div内）
3.根据颜色拆分出来的部分，更改颜色重新划分
    
生成的图片和原始图片对比，得到矩形半径

图片处理 文字识别  百度ai-OCR
http://ai.baidu.com/tech/ocr/general

*/

function getPath(e) {
    var width = document.documentElement.clientWidth || document.body.clientWidth;
    return {
        x: e.clientX - (width - 740) / 2,
        y: e.clientY + document.body.scrollTop
    }
}

var imgObj = {};

function getImgs(key, src, call) {
    var img = new Image();
    img.onload = function() {
        imgObj[key] = this;
        if (call) {
            call();
        }
    }
    img.src = src;
}
window.onload = function() {
    window.onloads();
    /*
	getImgs("div","img/ic1.png",function(){
		getImgs("img","img/ic2.png",function(){
			getImgs("text","img/ic3.png",function(){
				window.onloads();
			});
		});
	});
    */
}

window.onloads = function() {
    auto.canvas = document.getElementById("cvs");
    auto.cvs = auto.canvas.getContext("2d");

    auto.canvas1 = document.getElementById("cvs1");
    auto.cvs1 = auto.canvas1.getContext("2d");

    //    auto.canvas.addEventListener("mousedown", function (e) {
    //        var path = getPath(e);
    //        var x = path.x,
    //            y = path.y;
    //        auto.pointObj.w = 0;
    //        auto.pointObj.h = 0;
    //        auto.pointObj.x = x, auto.pointObj.y = y, auto.pointObj.isStart = true;
    //        //auto.getIndex(x,y,true);
    //    }, false);
    //    auto.canvas.addEventListener("mousemove", function (e) {
    //        if (auto.pointObj.isStart) {
    //            var path = getPath(e);
    //            var x = path.x,
    //                y = path.y;
    //            auto.pointObj.w = x - auto.pointObj.x;
    //            auto.pointObj.h = y - auto.pointObj.y;
    //        }
    //    }, false);
    //    // 根据选取的尺寸，合并
    //    var overup = function (x, y) {
    //        if (this.pointObj.isStart) {
    //            this.pointObj.w = x - this.pointObj.x;
    //            this.pointObj.h = y - this.pointObj.y;
    //            this.pointObj.isStart = false;
    //            if (currEditType == 1) {
    //                //合并  合并成1个矩形
    //                this.hebing();
    //            } else if (currEditType == 2) {
    //                //包容  被包含在一个div里面,坐标基准值偏移
    //                this.baorong();
    //            }
    //        }
    //    }
    //    auto.canvas.addEventListener("mouseup", function (e) {
    //        var path = getPath(e);
    //        var x = path.x,
    //            y = path.y;
    //        overup.call(auto, x, y);
    //    }, false);
    //    auto.canvas.addEventListener("mouseout", function (e) {
    //        var path = getPath(e);
    //        var x = path.x,
    //            y = path.y;
    //        overup.call(auto, x, y);
    //    }, false);
    //缩放图片
    toChangeImg(auto.src);
}
var scaless = 1;

function toChangeImg(src) {
    var img = new Image();
    img.onload = function() {
        var tempCanvas = document.createElement("canvas");
        var wsw = parseInt(this.width / scaless),
            wsh = parseInt(this.height / scaless);
        auto.canvas.width = wsw;
        auto.canvas.height = wsh;

        auto.canvas.style.width = wsw + "px";
        auto.canvas.style.height = wsh + "px";

        auto.canvas1.width = wsw;
        auto.canvas1.height = wsh;

        auto.canvas1.style.width = wsw + "px";
        auto.canvas1.style.height = wsh + "px";

        tempCanvas.width = wsw;
        tempCanvas.height = wsh;
        var tempCvs = tempCanvas.getContext("2d");
        tempCvs.drawImage(this, 0, 0, wsw, wsh);
        var src = tempCanvas.toDataURL("image/png");
        auto.img = new Image();
        auto.img.onload = function() {
            imgStart();
        }
        auto.img.src = src;

    }
    img.src = src;
}


var orcCall = {
    callObj: {},
    callback: function(e) {
        //console.log(e);
        this.callObj[e.key](e);
    }
}

var ocrTextObj = [];
var ocrObj = {};

function getScript(key, url) {
    orcCall.callObj[key] = function(e) {
        //if (e.key == "currimg") {
        if (e.data.words_result) {
            ocrObj = e;
            ocrTextObj = e.data.words_result;
        }
        //}
        exportsCall();
        auto.draw();
    }

    var form = new FormData();
    form.append("img", auto.file);
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            //console.log(req.responseText);
            var data = JSON.parse(req.responseText);
            orcCall.callObj["currimg"](data);
            console.log(data);
        }

    }
    req.open("post", "/uploadPhoto", false);
    req.send(form);

}

var hasRgb = false;

function getRGB(x, y, sizex, sizey, hasone) {
    if (!hasRgb) {
        var canvas = document.createElement("canvas");
        canvas.width = auto.img.width;
        canvas.height = auto.img.height;
        var cvs = canvas.getContext("2d");
        cvs.drawImage(auto.img, 0, 0);
        hasRgb = cvs;
    }
    var obj = hasRgb.getImageData(x, y, sizex, sizey);
    var keyRgb = {};
    var data = obj.data;
    if (hasone) {
        var r = data[0];
        var g = data[1];
        var b = data[2];
        var a = data[3];
        var key = r + "_" + g + "_" + b;
        return key;
    }
    for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var a = data[i + 3];
        var key = r + "_" + g + "_" + b;
        if (a == 0) {
            continue;
        }
        if (!keyRgb[key]) {
            keyRgb[key] = {
                val: "rgba(" + r + "," + g + "," + b + "," + a + ")",
                key: key,
                num: 0
            }
        }
        keyRgb[key].num++;
    }
    var max = -1,
        keys = -1;

    var arr = [];
    for (var i in keyRgb) {
        arr.push(keyRgb[i]);
    }
    arr.sort(function(a, b) {
        return a.num > b.num ? -1 : 1;
    });

    var colorKey = getRGB(3, y, 1, 1, true);
    var lastColor = "",
        lastNum = 0;
    for (var i = 0; i < arr.length; i++) {
        var color1 = colorKey.split("_");
        var color2 = arr[i].key.split("_");

        if (colorKey != arr[i].key) {
            if (Math.abs(parseInt(color1[0]) - parseInt(color2[0])) <= 4 && Math.abs(parseInt(color1[1]) - parseInt(color2[1])) <= 4 && Math.abs(parseInt(color1[2]) - parseInt(color2[2])) <= 4) {

            } else {
                //这个颜色
                lastColor = arr[i];
                if (lastNum >= 0) {
                    return lastColor;
                }
                lastNum++;
            }

        }
    }
    if (lastColor != "") {
        return lastColor;
    }
    return arr[0];
}

function exports() {
    //var e = mockdata();
    // if (e.key == "currimg") {
    //     if (e.data.words_result != undefined) {
    //         ocrObj = e;
    //         ocrTextObj = e.data.words_result;
    //         //{"location":{"width":105,"top":88,"height":31,"left":1038},"words":"\u767e\u5ea6ocr"}
    //     }
    // }

    //exportsCall();
    //auto.draw();
    getScript("currimg", auto.src);


}

function exportsCall() {

    var arr = auto.getJSON();
    var wxml = "";
    var text = "",
        isParent = false;

    var parentScale = 1;
    for (var i = 0; i < arr.length; i++) {
        var d = arr[i];
        //父容器
        if (d.type == 1) {
            isParent = true;
            var w = d.w * scaless;
            var h = d.h * scaless;
            var l = (d.x - 1) * scaless;
            var t = (d.y - 1) * scaless;
            var color = d.color;
            text += '<div style="position:relative;width:' + Math.ceil(w) + 'px;height:' + Math.ceil(h) + 'px;left:0px;right:0px;margin:0px auto;top:' + Math.ceil(t) + 'px;background-color:' + color + ';">';
            var bilv = 750 / w;
            parentScale = bilv;
            w = 750;
            h = bilv * h;
            l = bilv * l;
            t = bilv * t;

            wxml += '<view style="position:relative;width:' + Math.ceil(w) + 'rpx;height:' + Math.ceil(h) + 'rpx;left:0px;right:0px;margin:0px auto;top:' + Math.ceil(t) + 'rpx;background-color:' + color + ';">';
            break;
        }
    }

    var bgImg = ocrObj.img;

    function getGroup(chars, allobj) {
        //得到文字分组
        var arr = {};
        var valNum = 0,
            valHeight = 0,
            index = 0;

        //最小文字宽度
        var minSize = chars[0].location.width;
        for (var t = 0; t < chars.length; t++) {
            var one = chars[t];
            var char = one.char; //文字
            var location = one.location; //位置
            if (minSize > location.width) {
                minSize = location.width;
            }
        }
        //        console.log("minSize:", minSize);

        for (var t = 0; t < chars.length; t++) {
            var one = chars[t];
            var char = one.char; //文字
            var location = one.location; //位置
            var currLeft = location.left + location.width;

            if (valNum != 0) {
                //后面文字
                //间隙>一个文字的距离
                if (location.left - valNum >= minSize || location.height - valHeight >= 6) {
                    //分组
                    index++;
                    valNum = 0;
                } else {
                    valNum = currLeft;
                    valHeight = location.height;
                }
            } else {
                //第一个文字
                valNum = currLeft;
                valHeight = location.height;
            }
            if (!arr[index]) {
                arr[index] = [];
            }

            arr[index].push({
                char: char,
                location: {
                    left: location.left,
                    top: location.top,
                    width: location.width,
                    height: location.height
                }
            });
        }

        var concatArr = [];
        //得到新的对象
        for (var i in arr) {
            var one = arr[i];
            var newArr = {
                words: "",
                location: {
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0
                }
            };
            //合并
            var widths = 0;
            var topObj = {}; //看看那个高度出现频率最高
            var minHeight = one[0].location.height;
            for (var t = 0; t < one.length; t++) {
                newArr.words += one[t].char;
                if (t == 0) {
                    newArr.location.left = one[t].location.left;
                    //                    newArr.location.top = one[t].location.top;
                }
                //看看那个高度出现频率最高
                if (!topObj[one[t].location.top]) {
                    topObj[one[t].location.top] = {
                        num: 0,
                        top: one[t].location.top
                    }
                }
                topObj[one[t].location.top].num++;
                //当前文字行 使用最大的文字高度
                if (minHeight > one[t].location.height) {
                    minHeight = one[t].location.height;
                }
                widths += one[t].location.width;
            }

            var topsArr = [];
            for (var i in topObj) {
                topsArr.push(topObj[i]);
            }
            topsArr.sort(function(a, b) {
                return a > b ? -1 : 1;
            });
            newArr.location.top = topsArr[0].top;

            newArr.location.height = minHeight;
            newArr.location.width = widths;
            newArr.text = newArr.words;
            concatArr.push(newArr);
        }
        console.log(concatArr);
        return concatArr;
    }

    var concats = [];
    //文字拆出来
    for (var i = 0; i < ocrTextObj.length; i++) {
        var obj = ocrTextObj[i];
        var location = obj.location;
        concats = concats.concat(getGroup(obj.chars, obj));
    }
    ocrTextObj = concats;
    console.log("all:", concats);


    var off = 0;
    var offy = 4;
    for (var i = 0; i < ocrTextObj.length; i++) {
        var obj = ocrTextObj[i];
        var location = obj.location;
        location.color = getRGB(location.left - 1, location.top - 1, location.width, location.height).val;
        if (location.width < 6 && location.height < 6) {
            obj.hide = true;
        }
    }

    //文字和背景 合并
    function checkText(x, y, w, h) {
        var sizes = auto.heSize;
        var sizesY = 12;
        for (var i = 0; i < ocrTextObj.length; i++) {
            var obj = ocrTextObj[i];
            if (obj.hide) {
                continue;
            }
            var location = obj.location;
            //被包含关系
            if (w < auto.img.width * 0.9 && location.left > x && location.left + location.width <= x + w && location.top > y && location.top + location.height <= y + h) {

                var raba = 0.4 + Math.random() * 0.6;
                var color = "rgba(" + parseInt(Math.random() * 255) +
                    "," + parseInt(Math.random() * 255) + "," +
                    parseInt(Math.random() * 255) + "," + raba + ")";

                location.bgcolor = color;
                location.center = true; //文字居中
                location.size = location.height; //文字居中
                location.left = x;
                location.top = y;
                location.width = w;
                location.height = h;

                return true;
            }

            //包含关系 div包含文字
            if (w < auto.img.width * 0.9 && location.left > x && location.left + location.width > x && location.left + location.width <= x + w && Math.abs(y - location.top) <= sizesY) {
                location.left = x;
                location.top = y;
                location.height = h;
                location.width = w;
                return true;
            }


            //左侧相交
            if (w < auto.img.width * 0.9 && location.left < x && location.left + location.width > x && (location.left + location.width <= x + w || location.left + location.width >= x + w) && Math.abs(y - location.top) <= sizesY) {

                return true;
            }
            //右侧相交
            if (w < auto.img.width * 0.9 && location.left > x && location.left < x + w && location.left + location.width >= x + w && Math.abs(y - location.top) <= sizesY) {

                return true;
            }

            //尺寸相近
            if (w < auto.img.width * 0.9 && Math.abs(x - location.left) <= sizes && Math.abs(y - location.top) <= sizesY) {
                location.left = x;
                location.top = y;

                location.height = h;

                if (w > location.width) {
                    location.width = w;

                }
                location.color = getRGB(location.left - 1, location.top - 1, location.width, location.height).val;
                return true;
            }

        }
        return false;
    }

    var buildArr = [];

    arr.forEach(function(d) {
        if (d.type == 1) {
            return;
        }
        var w = d.w * scaless;
        var h = d.h * scaless;
        var l = (d.x - 1) * scaless;
        var t = (d.y - 1) * scaless;
        var raba = 0.4 + Math.random() * 0.6;
        var color = "rgba(" + parseInt(Math.random() * 255) +
            "," + parseInt(Math.random() * 255) + "," +
            parseInt(Math.random() * 255) + "," + raba + ")";
        if (d.color) {
            color = d.color;
        }
        if (h == 1 && w >= auto.img.width * 0.7) {
            //取色
            var colorKey = getRGB(l + w / 2, t, 1, 1, true).split("_");
            color = "rgb(" + colorKey[0] + "," + colorKey[1] + "," + colorKey[2] + ")";
            // console.error(colorKey, color);
        }

        var bgsizew = auto.img.width;
        var bgsizeh = auto.img.height;
        var bgx = 0,
            bgy = 0;
        bgx = -l;
        bgy = -t;

        //检测 如果 和文字位置一样，则合并，删除自己保留文字
        if (checkText(Math.ceil(l), Math.ceil(t), Math.ceil(w), Math.ceil(h))) {

        } else {
            buildArr.push({
                type: "div",
                x: Math.ceil(l),
                y: Math.ceil(t),
                w: Math.ceil(w),
                h: Math.ceil(h),
                bgcolor: color
            });
            //background-size:' + bgsizew + 'px ' + bgsizeh + 'px;background-image:url('+bgImg+');background-position:' + bgx + 'px ' + bgy + 'px;
            text += '<div style="position:absolute;width:' + Math.ceil(w) + 'px;height:' + Math.ceil(h) + 'px;left:' + Math.ceil(l) + 'px;top:' + Math.ceil(t) + 'px;background-color:' + color + ';"></div>';

            var bilv = parentScale;
            w = bilv * w;
            h = bilv * h;
            l = bilv * l;
            t = bilv * t;
            wxml += '<view style="position:absolute;width:' + Math.ceil(w) + 'rpx;height:' + Math.ceil(h) + 'rpx;left:' + Math.ceil(l) + 'rpx;top:' + Math.ceil(t) + 'rpx;background-color:' + color + ';"></view>';
        }


    });

    //文字
    for (var i = 0; i < ocrTextObj.length; i++) {
        var obj = ocrTextObj[i];
        if (obj.hide) {
            continue;
        }
        var location = obj.location;
        var oneBuild = {
            type: "text",
            x: location.left,
            y: location.top,
            w: location.width,
            h: location.height,
            size: location.height,
            color: location.color,
            text: obj.text
        };

        if (location.center) {
            oneBuild.type = "textcenter";
            oneBuild.bgcolor = location.bgcolor;
            oneBuild.size = location.size;

            //居中
            text += '<div style="word-break:keep-all;white-space:nowrap;position:absolute;width:' + location.width + 'px;height:' + location.height + 'px;line-height:' + location.height + 'px;left:' + (location.left) + 'px;top:' + location.top + 'px;background-color:' + location.bgcolor + '; color:' + location.color + ';font-size:' + location.size + 'px;z-index:2;text-align:center;">' + obj.text + '</div>';
        } else {
            text += '<div style="word-break:keep-all;white-space:nowrap;position:absolute;width:' + location.width + 'px;height:' + location.height + 'px;line-height:' + location.height + 'px;left:' + (location.left) + 'px;top:' + location.top + 'px;color:' + location.color + ';font-size:' + location.height + 'px;z-index:2;text-align:left;">' + obj.text + '</div>';
        }
        buildArr.push(oneBuild);

        var bilv = parentScale;
        w = bilv * location.width;
        h = bilv * location.height;
        l = bilv * location.left;
        t = bilv * location.top;

        if (location.center) {
            wxml += '<view style="word-break:keep-all;white-space:nowrap;position:absolute;width:' + Math.ceil(w) + 'rpx;height:' + Math.ceil(h) + 'rpx;line-height:' + Math.ceil(h) + 'rpx;left:' + Math.ceil(l) + 'rpx;top:' + Math.ceil(t) + 'rpx;background-color:' + location.bgcolor + ';color:' + location.color + ';font-size:' + Math.ceil(location.size * bilv) + 'rpx;z-index:2;text-align:center;">' + obj.text + '</view>';
        } else {
            wxml += '<view style="word-break:keep-all;white-space:nowrap;position:absolute;width:' + Math.ceil(w) + 'rpx;height:' + Math.ceil(h) + 'rpx;line-height:' + Math.ceil(h) + 'rpx;left:' + Math.ceil(l) + 'rpx;top:' + Math.ceil(t) + 'rpx;color:' + location.color + ';font-size:' + Math.ceil(h) + 'rpx;z-index:2;text-align:left;">' + obj.text + '</view>';
        }

    }

    if (isParent) {
        text += "</div>";
        wxml += "</view>";
    }
    //    document.getElementById("textarea").value = JSON.stringify(arr);
    //    downloadFile(Date.now() + ".html", text);
    //    sessionStorage.setItem("html", text);
    //    console.log(JSON.stringify(arr) + "\n", "\n\n" + wxml);



    var obj = {
        w: auto.img.width,
        h: auto.img.height,
        arr: buildArr
    }
    sessionStorage.setItem("export", JSON.stringify(obj));
    console.log(JSON.stringify(obj));
    seehtml();
}

function seehtml() {
    window.open("page.html");
    //location.href="zhen.html";
}

function imgStart() {
    //auto.getBg();
    //return;
    ocrObj = {};
    hasRgb = false;
    ocrTextObj = [];
    var scalex = 1,
        scaley = 1;
    //    if (auto.img.width > 640) {
    //    scalex = 640 / auto.img.width;
    //    }
    if (auto.img.height > 1136) {
        //        scaley = 1136 / auto.img.height;
    }
    auto.scale = Math.min(scalex, scaley);
    auto.w = parseInt(auto.scale * auto.img.width);
    auto.h = parseInt(auto.scale * auto.img.height);
    console.log("scale:", auto.scale, auto.w, auto.h);

    //模板
    auto.tempCanvas = document.createElement("canvas");
    auto.tempCvs = auto.tempCanvas.getContext("2d");
    auto.tempCanvas.width = auto.w;
    auto.tempCanvas.height = auto.h;
    auto.tempCvs.drawImage(auto.img, 0, 0, auto.w, auto.h);
    /*
    //吧当前像素模糊
    var srcs=auto.tempCanvas.toDataURL("image/jpeg",1);
    var imgs=new Image();
    imgs.src=srcs;
    auto.tempCvs.clearRect(0,0,auto.w,auto.h);
    auto.tempCvs.drawImage(imgs,0,0,auto.w,auto.h);
    */
    var imageData = auto.tempCvs.getImageData(0, 0, auto.w, auto.h);
    auto.imageData = auto.changeImg(imageData);
    auto.isOver = false;
    auto.run();

    auto.loop();
}

function changeImg(files) {
    var file = files[0];
    auto.file = file;
    console.log(file);
    var reader = new FileReader();
    //将文件以Data URL形式读入页面  
    reader.readAsDataURL(file);
    reader.onload = function(e) {
        auto.src = this.result;
        toChangeImg(auto.src);
        document.getElementById("files").value = "";
    }
}

function updateSize(setscaless) {
    //最小间距
    auto.heSize = parseInt(document.getElementById("sizes").value);
    auto.heSizeY = parseInt(document.getElementById("sizesY").value);
    //缩放值
    //    scaless = parseInt(document.getElementById("mohusizes").value);
    scaless = 1;
    console.log("heSize:", auto.heSize, auto.heSizeY);
    toChangeImg(auto.src);
}

var auto = {
    //src: "./images/demo.png", //图片
    src: "", //图片
    heSize: 4, //合并的颗粒x
    heSizeY: 4, //合并的颗粒y
    w: 640,
    h: 1136,
    canvas: null,
    cvs: null,
    tempCanvas: null,
    tempCvs: null,
    imageData: null,
    img: null,
    file: null,
    pointObj: {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    },
    getBg: function(src, jsonObj) {
        //获得当前拖作为的基准值
        var baseColor = this.baseRgb[jsonObj.y - 1];
        var parent = this;
        var img = new Image();
        img.onload = function() {
            var w = this.width,
                h = this.height;
            if (w <= 6 || h <= 6) {
                return;
            }
            var newCanvas = document.createElement("canvas");
            newCanvas.width = w;
            newCanvas.height = h;
            var newCvs = newCanvas.getContext("2d");
            //parent.cvs.clearRect(50,50,parent.w,parent.h);
            //parent.cvs.drawImage(img,50,50);
            //var imageData=parent.cvs.getImageData(50,50,w,h);
            newCvs.drawImage(img, 0, 0);
            var imageData = newCvs.getImageData(0, 0, w, h);
            var baseRgb = {},
                baseRgbY = {};
            var data = imageData.data;
            for (var x = 1; x <= w; x++) {
                var index = ((x - 1)) * 4; //每列的第一个坐标
                var r = data[index],
                    g = data[index + 1],
                    b = data[index + 2],
                    a = data[index + 3];
                var key = r + "_" + g + "_" + b + "_" + a;

                var index1 = ((x - 1) + w * 5) * 4; //每列的第一个坐标
                var r1 = data[index1],
                    g1 = data[index1 + 1],
                    b1 = data[index1 + 2],
                    a1 = data[index1 + 3];
                var key1 = r1 + "_" + g1 + "_" + b1 + "_" + a1;
                if (!baseRgb[key]) {
                    baseRgb[key] = {
                        num: 0,
                        key1: key1,
                        colorRgb: [r, g, b, a],
                        rgb: [r1, g1, b1, a1]
                    };
                }
                baseRgb[key].num++;
            }
            for (var y = 1; y <= h; y++) {
                var index = ((y - 1) * w) * 4; //每列的第一个坐标
                var r = data[index],
                    g = data[index + 1],
                    b = data[index + 2],
                    a = data[index + 3];
                var key = r + "_" + g + "_" + b + "_" + a;

                var index1 = ((y - 1) * w + 5) * 4; //每列的第一个坐标
                var r1 = data[index1],
                    g1 = data[index1 + 1],
                    b1 = data[index1 + 2],
                    a1 = data[index1 + 3];
                var key2 = r1 + "_" + g1 + "_" + b1 + "_" + a1;
                if (!baseRgbY[key]) {
                    baseRgbY[key] = {
                        num: 0,
                        key2: key2,
                        colorRgb: [r, g, b, a],
                        rgb: [r1, g1, b1, a1]
                    };
                }
                baseRgbY[key].num++;
            }
            var colorX = "",
                colorY = "",
                colorRgb = [],
                key1 = "",
                keyRgb1 = [],
                key2 = "",
                keyRgb2 = [];
            var maxY = 0,
                maxX = 0;
            for (var i in baseRgb) {
                if (maxX < baseRgb[i].num) {
                    maxX = baseRgb[i].num;
                    key1 = baseRgb[i].key1;
                    keyRgb1 = baseRgb[i].rgb;
                    colorRgb = baseRgb[i].colorRgb;
                    colorX = i;
                }
            }
            for (var i in baseRgbY) {
                if (maxY < baseRgbY[i].num) {
                    maxY = baseRgbY[i].num;
                    key2 = baseRgbY[i].key2;
                    keyRgb2 = baseRgbY[i].rgb;
                    colorY = i;
                }
            }
            var maxX = parseInt((w - maxX) / 2);
            var maxY = parseInt((h - maxY) / 2);
            var isTag = false;
            if (maxX == maxY && colorX != undefined && key1 != undefined && key2 != undefined) {
                //边框颜色  colorX 
                //背景颜色  key1,key2
                //边框半径  radius
                var rgba255 = colorRgb[0] + "-" + colorRgb[1] + "-" + colorRgb[2] + "-" + colorRgb[3];
                if (keyRgb1[0] != baseColor[0] &&
                    keyRgb1[1] != baseColor[1] &&
                    keyRgb1[2] != baseColor[2]) {
                    if (colorX == key1 && colorX == key2 && rgba255 != "255-255-255-255") {
                        isTag = true;
                        //console.log(baseColor);
                        //没有边框
                        console.log("纯色背景", colorRgb, "radius:", maxX);
                        window.open(src);
                    } else if (key2 == key1) {
                        isTag = true;
                        //console.log(baseColor);
                        console.log("有边框:", colorRgb, "背景颜色:", keyRgb1, "radius:", maxX);
                        window.open(src);
                    }
                    if (!isTag) {
                        //window.open(src);
                        //console.log("div");
                    }
                } else {
                    //window.open(src);
                }

                //console.log("radius:",maxX,"--",w,h);
            } else {
                //console.log("不是div",maxX+":"+maxY);
            }


        }
        img.src = src;
    },
    hebing: function() {
        //坐标偏移好
        this.pointObj.x -= 50;
        this.pointObj.y -= 50;

        var d = this.pointObj;
        if (d.w == 0 || d.h == 0) {
            return;
        }
        if (d.w < 0) {
            var w = d.w,
                x = d.x;
            d.x = x + w;
            d.w = Math.abs(w);
        }
        if (d.h < 0) {
            var h = d.h,
                y = d.y;
            d.y = y + h;
            d.h = Math.abs(h);
        }
        console.log("start:", this.arr.length);

        var HeArr = [];
        for (var i = 0; i < this.arr.length; i++) {
            var arrs = this.arr[i];
            if (arrs.y <= (d.y + d.h) && arrs.y >= d.y || d.y <= (arrs.y + arrs.h) && d.y >= arrs.y) {
                if (arrs.x <= (d.x + d.w) && arrs.x >= d.x || d.x <= (arrs.x + arrs.w) && d.x >= arrs.x) {
                    arrs.isHe = true;
                    HeArr.push(arrs);
                }
            }
        }

        if (HeArr.length == 0) {
            return;
        }

        var heObj = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        }
        for (var i = 0; i < HeArr.length; i++) {
            var he = HeArr[i];
            if (i == 0) {
                heObj.x = he.x;
                heObj.y = he.y;
                heObj.w = he.w;
                heObj.h = he.h;
            } else {
                var x1 = Math.min(heObj.x, he.x);
                var y1 = Math.min(heObj.y, he.y);
                var w1 = Math.max(heObj.x + heObj.w, he.x + he.w) - x1;
                var h1 = Math.max(heObj.y + heObj.h, he.y + he.h) - y1;
                heObj.x = x1;
                heObj.y = y1;
                heObj.w = w1;
                heObj.h = h1;
            }
        }

        var d = heObj;
        HeArr = [];
        for (var i = 0; i < this.arr.length; i++) {
            var arrs = this.arr[i];
            if (arrs.y <= (d.y + d.h) && arrs.y >= d.y || d.y <= (arrs.y + arrs.h) && d.y >= arrs.y) {
                if (arrs.x <= (d.x + d.w) && arrs.x >= d.x || d.x <= (arrs.x + arrs.w) && d.x >= arrs.x) {
                    arrs.isHe = true;
                    HeArr.push(arrs);
                }
            }
        }
        while (true) {
            var start = this.arr.length;
            for (var i = 0; i < this.arr.length; i++) {
                if (this.arr[i].isHe) {
                    this.arr.splice(i, 1);
                }
            }
            var end = this.arr.length;
            if (start == end) {
                break;
            }
        }
        this.arr.push(heObj);
        this.drawArr();
        console.log(heObj, "he:", this.arr.length);
    },
    currBaoRongObj: {},
    baorong: function() {
        //坐标偏移好
        this.pointObj.x -= 50;
        this.pointObj.y -= 50;

        var d = this.pointObj;
        if (d.w == 0 || d.h == 0) {
            return;
        }
        if (d.w < 0) {
            var w = d.w,
                x = d.x;
            d.x = x + w;
            d.w = Math.abs(w);
        }
        if (d.h < 0) {
            var h = d.h,
                y = d.y;
            d.y = y + h;
            d.h = Math.abs(h);
        }
        console.log("start:", this.arr.length);

        var HeArr = [];
        for (var i = 0; i < this.arr.length; i++) {
            var arrs = this.arr[i];
            if (arrs.y <= (d.y + d.h) && arrs.y >= d.y || d.y <= (arrs.y + arrs.h) && d.y >= arrs.y) {
                if (arrs.x <= (d.x + d.w) && arrs.x >= d.x || d.x <= (arrs.x + arrs.w) && d.x >= arrs.x) {
                    arrs.isRong = true;
                    HeArr.push(arrs);
                }
            }
        }

        if (HeArr.length == 0) {
            return;
        }

        var heObj = {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            isRongBase: true,
            rongId: Date.now()
        }
        if (d.x < 0) {
            heObj.x = 0;
        } else {
            heObj.x = d.x;
        }
        if (d.y < 0) {
            heObj.y = 0;
        } else {
            heObj.y = d.y;
        }
        if (d.w > 640) {
            heObj.w = 640;
        } else {
            heObj.w = d.w;
        }

        if (d.y + d.h > 1136) {
            heObj.h = 1136 - d.y;
        } else {
            heObj.h = d.h;
        }
        this.currBaoRongObj[heObj.rongId] = {
            x: heObj.x,
            y: heObj.y
        };
        for (var i = 0; i < this.arr.length; i++) {
            if (this.arr[i].isRongBase && this.arr[i].isRong) {
                var rongId = this.arr[i].rongId;
                //恢复所有
                var lastBase = this.currBaoRongObj[rongId];
                this.arr.forEach(function(ats) {
                    if (ats.rongId == rongId && !ats.isRongBase) {
                        ats.x += lastBase.x;
                        ats.y += lastBase.y;
                        ats.rongId = false;
                    }
                });
                //取消
                delete this.currBaoRongObj[rongId];
                this.arr.splice(i, 1);
            }
        }
        for (var i = 0; i < this.arr.length; i++) {
            if (this.arr[i].isRong) {
                this.arr[i].x -= heObj.x;
                this.arr[i].y -= heObj.y;
                this.arr[i].rongId = heObj.rongId;
                this.arr[i].isRong = false;
            }
        }
        this.arr.push(heObj);
        this.drawArr();
        console.log(heObj, "he:", this.arr.length);
    },
    changeImg: function(imageData) {
        //变换颜色
        var color = 240,
            color1 = 255,
            color2 = 0,
            colorCha = 26;
        var copyImageData = {
            data: []
        };
        for (var i = 0; i < imageData.data.length; i += 4) {
            var r = imageData.data[i];
            var g = imageData.data[i + 1];
            var b = imageData.data[i + 2];
            var a = imageData.data[i + 3];
            var Y = 0.299 * r + 0.587 * g + 0.114 * b;
            //根据i的值，获取当前所在行的基准值
            var val = Y > color ? color1 : color2;
            copyImageData.data[i] = val;
            copyImageData.data[i + 1] = val;
            copyImageData.data[i + 2] = val;
            copyImageData.data[i + 3] = 255;
        }
        this.copyImageData = copyImageData;

        var baseRgb = [];
        var data = imageData.data;
        for (var y = 1; y <= this.h; y++) {
            var index = ((y - 1) * this.w) * 4; //每列的第一个坐标
            var r = data[index],
                g = data[index + 1],
                b = data[index + 2],
                a = data[index + 3];
            //不考虑透明
            baseRgb.push([r, g, b, a, index]);
        }
        this.baseRgb = baseRgb;

        var copyData = this.cvs.createImageData(this.w, this.h);

        for (var i = 0; i < imageData.data.length; i += 4) {
            var r = imageData.data[i];
            var g = imageData.data[i + 1];
            var b = imageData.data[i + 2];
            var a = imageData.data[i + 3];

            //根据i的值，获取当前所在行的基准值
            var indexs = parseInt(i / (this.w * 4));
            var baseVal = baseRgb[indexs];
            var baseR = baseVal[0],
                baseG = baseVal[1],
                baseB = baseVal[2],
                baseA = baseVal[3];
            //对比当前点与 本行初始点是否一样
            if (Math.abs(baseR - r) <= colorCha && Math.abs(baseG - g) <= colorCha &&
                Math.abs(baseB - b) <= colorCha && Math.abs(baseA - a) <= 0) {
                imageData.data[i] = 255;
                imageData.data[i + 1] = 255;
                imageData.data[i + 2] = 255;
                imageData.data[i + 3] = 0;

                copyData.data[i] = 255;
                copyData.data[i + 1] = 255;
                copyData.data[i + 2] = 255;
                copyData.data[i + 3] = 0;
            } else if (a != 0) {
                //var Y = 0.299*r + 0.587*g + 0.114*b;//灰白
                var Y = 0;
                imageData.data[i] = Y;
                imageData.data[i + 1] = Y;
                imageData.data[i + 2] = Y;
                imageData.data[i + 3] = 255;

                copyData.data[i] = Y;
                copyData.data[i + 1] = Y;
                copyData.data[i + 2] = Y;
                copyData.data[i + 3] = 255;
            }
        }
        this.copyData = copyData;
        return imageData;
    },
    draw: function() {
        this.tempCvs.clearRect(0, 0, this.w, this.h);
        this.cvs.clearRect(0, 0, this.w, this.h);

        this.cvs.save();
        //        this.cvs.translate(50, 50);
        //        this.cvs.scale(scaless, scaless);
        if (this.isOver) {
            /*
            this.cvs.save();
            for(var y=0;y<this.baseRgb.length;y++){
            	var ys=this.baseRgb[y];
            	this.cvs.fillStyle="rgba("+ys[0]+","+ys[1]+","+ys[2]+","+ys[3]+")";
            	this.cvs.fillRect(0,y,this.w,1);
            }
            this.cvs.restore();
            */
            var arr = this.getJSON();
            this.cvs.save();

            for (var i = 0; i < arr.length; i++) {
                var ars = arr[i];
                var raba = 0.4 + Math.random() * 0.6;
                var color = "rgba(" + parseInt(Math.random() * 255) +
                    "," + parseInt(Math.random() * 255) + "," +
                    parseInt(Math.random() * 255) + "," + raba + ")";
                if (ars.color) {
                    color = ars.color;
                }

                this.cvs.save();
                this.cvs.fillStyle = color;
                this.cvs.translate(ars.x - 1, ars.y - 1);
                if (ars.rongId && !ars.isRongBase) {
                    var tranBase = this.currBaoRongObj[ars.rongId];
                    this.cvs.translate(tranBase.x - 1, tranBase.y - 1);
                }
                this.cvs.fillRect(0, 0, ars.w, ars.h);
                if (ars.w >= 5 && ars.h >= 5) {
                    //var randoms=["div","img","text"][parseInt(Math.random()*3)];
                    //this.cvs.drawImage(imgObj[randoms],0,0,12,12);
                }
                this.cvs.restore();
            }

            //显示文字
            for (var i = 0; i < ocrTextObj.length; i++) {
                var obj = ocrTextObj[i];
                if (obj.hide) {
                    continue;
                }
                var location = obj.location;
                this.cvs.save();
                this.cvs.textBaseline = "middle";
                this.cvs.textAlign = "left";
                this.cvs.fillStyle = location.color;
                var hs = parseInt(location.height * auto.scale);
                this.cvs.font = "14px sans-serif";
                this.cvs.fillText(obj.text, location.left * auto.scale, location.top * auto.scale + hs / 2);
                this.cvs.restore();
                //                console.log(location.left, location.top, i);
            }

            this.cvs.restore();
        } else {
            var tempCanvas = document.createElement("canvas");
            var tempCvs = tempCanvas.getContext("2d");
            tempCanvas.width = auto.w;
            tempCanvas.height = auto.h
            tempCvs.putImageData(this.imageData, 0, 0);

            this.cvs.drawImage(tempCanvas, 0, 0);
            this.cvs.save();
            this.cvs.globalAlpha = 0.5;
            //this.cvs.drawImage(this.img,0,0,this.w,this.h);
            this.cvs.restore();
        }
        this.cvs.restore();
    },
    drawCopy: function() {
        this.cvs.clearRect(0, 0, this.w, this.h);
        this.cvs.putImageData(this.copyData, 0, 0);
    },
    loop: function() {
        var parent = this;
        setTimeout(function() {
            parent.loop();
        }, 1000 / 30);
        this.cvs1.clearRect(0, 0, this.w, this.h);
        if (auto.pointObj.isStart) {
            this.cvs1.fillRect(auto.pointObj.x, auto.pointObj.y, auto.pointObj.w, auto.pointObj.h);
        }
    },
    updateNums: 0,
    run: function() {
        this.draw();
        var parent = this;
        this.updateNums = 0;
        setTimeout(function() {
            parent.run1();
            console.log("计算次数：" + parent.updateNums);
            document.querySelector("#others").innerHTML = parent.updateNums + "次";
        }, 0);
    },
    randomId: 0,
    arr: [],
    upObj: {},
    bigObj: [],
    run1: function() {
        this.currBaoRongObj = {};
        this.arr = [];
        this.randomId = 0;
        this.bigObj = [];
        var maxSize = 0.9;

        var datasbegin = Date.now();

        var bigId = 0;
        //第一步，抽掉 大的区域
        for (var row = 1; row <= this.h; row++) {
            for (var col = 1; col <= this.w; col++) {
                this.updateNums++;
                var isTag = this.getIndex(col, row, false, this.copyImageData);
                if (isTag) {
                    var sizeW = 1,
                        sizeH = 1;
                    for (var i = 1; i <= this.w; i++) {
                        if (this.getIndex(col + i, row, false, this.copyImageData)) {
                            sizeW = i;
                        } else {
                            break;
                        }
                    }
                    for (var i = 1; i <= this.h; i++) {
                        if (this.getIndex(col, row + i, false, this.copyImageData)) {
                            sizeH = i;
                        } else {
                            break;
                        }
                    }
                    var objArr = {
                        x: col,
                        y: row,
                        w: sizeW,
                        h: sizeH,
                        id: bigId
                    }
                    if (objArr.w >= this.w * maxSize || objArr.h >= this.h * maxSize) {
                        if (!this.hasBigArr(objArr)) {
                            this.bigObj.push(objArr);
                            col += sizeW - 1;
                            bigId++;
                        }
                    }
                }
            }
        }

        //移除高度>4的
        while (true) {
            var start = this.bigObj.length;
            for (var i = 0; i < this.bigObj.length; i++) {
                this.updateNums++;
                if (this.bigObj[i].h >= 4) {
                    this.bigObj.splice(i, 1);
                }
            }
            var end = this.bigObj.length;
            if (start == end) {
                break;
            }
        }

        for (var i = 0; i < this.bigObj.length; i++) {
            var ars = this.bigObj[i];
            for (var s = 0; s < this.bigObj.length; s++) {
                this.updateNums++;
                var arss = this.bigObj[s];
                if (ars.id != arss.id && Math.abs(ars.y - arss.y) <= 10) {
                    arss.isRemove = true;
                    ars.isRemove = true;
                }
            }
        }

        while (true) {
            var start = this.bigObj.length;
            //移除需要移除的
            for (var i = 0; i < this.bigObj.length; i++) {
                var ars = this.bigObj[i];
                this.updateNums++;
                if (ars.isRemove) {
                    this.bigObj.splice(i, 1);
                }
            }
            var end = this.bigObj.length;
            if (start == end) {
                break;
            }
        }
        console.log("bigObj:", this.bigObj.length);
        //擦掉比较大的部分
        for (var i = 0; i < this.bigObj.length; i++) {
            var ars = this.bigObj[i];
            for (var row = 0; row < ars.h; row++) {
                for (var col = 0; col < ars.w; col++) {
                    this.updateNums++;
                    this.clearIndex(col + ars.x, row + ars.y);
                }
            }
        }

        //最后在合并进去
        for (var t = 0; t < 1; t++) {
            var isUpdate = false;
            for (var row = 1; row <= this.h; row++) {
                for (var col = 1; col <= this.w; col++) {
                    var tag = this.getIndex(col, row);

                    if (!tag) {
                        var eachArr = [
                            ["left", "top", "bottom"], //左侧存在
                            ["right", "top", "bottom"], //左侧存在
                            ["top", "left", "right"], //右侧存在
                            ["bottom", "left", "right"] //下侧存在
                        ]
                        for (var as = 0; as < eachArr.length; as++) {
                            var asObj = eachArr[as];
                            this.updateNums++;
                            var val1 = asObj[0],
                                val2 = asObj[1],
                                val3 = asObj[2];
                            this.eachStage(col, row, val1, val2, true);
                            this.eachStage(col, row, val1, val3, true);
                        }
                    } else {
                        this.updateNums++;
                    }
                }
            }
        }

        //this.draw();
        //循环每一个像素，如果相邻的像素点存在值，则合并
        for (var row = 1; row <= this.h; row++) {
            for (var col = 1; col <= this.w; col++) {
                var isTag = this.getIndex(col, row);
                if (isTag) {
                    this.updateNums++;
                    var sizeW = 1,
                        sizeH = 1;
                    for (var i = 1; i <= this.w; i++) {
                        this.updateNums++;
                        if (this.getIndex(col + i, row)) {
                            sizeW = i;
                        } else {
                            break;
                        }
                    }
                    for (var i = 1; i <= this.h; i++) {
                        this.updateNums++;
                        if (this.getIndex(col, row + i)) {
                            sizeH = i;
                        } else {
                            break;
                        }
                    }
                    var objArr = {
                        id: this.randomId,
                        x: col,
                        y: row,
                        w: sizeW,
                        h: sizeH
                    }
                    if (!this.hasArr(objArr)) {
                        this.randomId++;
                        this.arr.push(objArr);
                        col += sizeW - 1;
                    }
                }
            }
        }
        //console.log("arr:",this.arr.length);
        while (true) {
            var start = this.arr.length;
            for (var i = 0; i < this.arr.length; i++) {
                var arrs = this.arr[i];
                this.updateNums++;
                this.xiangjiao(arrs);
            }
            var end = this.arr.length;
            if (end == start) {
                break;
            }
        }

        while (true) {
            var start = this.arr.length;
            for (var i = 0; i < this.arr.length; i++) {
                var arrs = this.arr[i];
                this.updateNums++;
                if (arrs.w == 1 && arrs.h == 1) {
                    this.arr.splice(i, 1);
                }
            }
            var end = this.arr.length;
            if (end == start) {
                break;
            }
        }
        console.log("hou:", this.arr.length);
        this.isOver = true;

        console.log(Date.now() - datasbegin, "ms");

        this.drawArr();
    },
    drawArr: function() {
        /*
        //吧合并后的数组进行绘制
        this.tempCvs.clearRect(0,0,this.w,this.h);
        
        this.tempCvs.save();
        this.tempCvs.fillStyle="gray";
        for(var i=0;i<this.bigObj.length;i++){
            var ars=this.bigObj[i];
            this.tempCvs.fillRect(ars.x,ars.y,ars.w,ars.h);
        }
        this.tempCvs.restore();
        
        //显示最新的数组
        for(var i=0;i<this.arr.length;i++){
            var ars=this.arr[i];
            var raba=0.2+Math.random()*0.8;
            this.tempCvs.fillStyle="rgba("+parseInt(Math.random()*255)
                +","+parseInt(Math.random()*255)+","
                +parseInt(Math.random()*255)+","+raba+")";
            this.tempCvs.fillRect(ars.x,ars.y,ars.w,ars.h);
        }
	
        this.imageData=this.tempCvs.getImageData(0,0,this.w,this.h);
		*/
        this.draw();
        //bigObj
    },
    hasArr: function(arr) {
        for (var i = 0; i < this.arr.length; i++) {
            var currArr = this.arr[i];
            if (arr.x >= currArr.x && (arr.x + arr.w) <= (currArr.x + currArr.w)) {
                if (arr.y >= currArr.y && (arr.y + arr.h) <= (currArr.y + currArr.h)) {
                    return true;
                }
            }
        }
    },
    hasBigArr: function(arr) {
        for (var i = 0; i < this.bigObj.length; i++) {
            var currArr = this.bigObj[i];
            if (arr.x >= currArr.x && (arr.x + arr.w) <= (currArr.x + currArr.w)) {
                if (arr.y >= currArr.y && (arr.y + arr.h) <= (currArr.y + currArr.h)) {
                    this.updateNums++;
                    return true;
                }
            }
        }
    },
    xiangjiao: function(arrs) {
        var isTag = false;
        for (var i = 0; i < this.arr.length; i++) {
            var d = this.arr[i];
            if (arrs.id == d.id) {
                continue;
            }
            var isHe = false;
            var heSize = this.heSize;
            var heSizeY = this.heSizeY;
            if (Math.abs(arrs.x + arrs.w - d.x) <= heSize && Math.abs(arrs.y + arrs.h - d.y) <= heSizeY) {
                isHe = true;
            } else if (Math.abs(arrs.x + arrs.w - d.x) <= heSize && Math.abs(arrs.y - d.y) <= heSizeY) {
                isHe = true;
            } else if (arrs.x <= (d.x + d.w) && arrs.x >= d.x || d.x <= (arrs.x + arrs.w) && d.x >= arrs.x) {
                if (arrs.y <= (d.y + d.h) && arrs.y >= d.y || d.y <= (arrs.y + arrs.h) && d.y >= arrs.y) {
                    isHe = true;
                }
            } else if (Math.abs(arrs.x + arrs.w - d.x) <= heSize && arrs.y >= d.y && arrs.y + arrs.h <= d.y + d.h) {
                isHe = true;
            }

            if (isHe) {
                var maxsw = Math.max(arrs.w, d.w);
                var minsw = Math.min(arrs.w, d.w);
                var maxsh = Math.max(arrs.h, d.h);
                var minsh = Math.min(arrs.h, d.h);
                if (maxsw >= this.w / 3) {
                    // isHe=false;
                }
            }
            if (isHe) {
                var x1 = Math.min(arrs.x, d.x);
                var y1 = Math.min(arrs.y, d.y);
                var w1 = Math.max(arrs.x + arrs.w, d.x + d.w) - x1;
                var h1 = Math.max(arrs.y + arrs.h, d.y + d.h) - y1;
                arrs.x = x1;
                arrs.y = y1;
                arrs.w = w1;
                arrs.h = h1;
                this.arr.splice(i, 1);
                isTag = true;
            }
        }
        return isTag;
    },
    getIndex: function(x, y, isShow, isData) {
        if (x > this.w || y > this.h) {
            return false;
        }
        if (x <= 0 || y <= 0) {
            return false;
        }
        var data = this.imageData.data;
        if (isData) {
            data = isData.data;
        }
        var index = ((y - 1) * this.w + x - 1) * 4;
        var r = data[index],
            g = data[index + 1],
            b = data[index + 2],
            a = data[index + 3];
        if (isShow) {
            console.log(r, b, g, a);
        }
        if (r == 0 && g == 0 && b == 0 && a != 0) {
            return true;
        }
    },


    clearIndex: function(x, y) {
        if (x > this.w || y > this.h) {
            return;
        }
        if (x < 0 || y < 0) {
            return;
        }
        var data = this.imageData.data;
        var i = ((y - 1) * this.w + x - 1) * 4;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
        return this;
    },
    setIndex: function(x, y) {
        if (x > this.w || y > this.h) {
            return;
        }
        if (x < 0 || y < 0) {
            return;
        }
        var data = this.imageData.data;
        var i = ((y - 1) * this.w + x - 1) * 4;
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
        return this;
    },
    states: false,
    eachStage: function(col, row, state1, state2, isFan) {
        var currX = col,
            currY = row;
        var isUpdate = false;
        while (true) {
            var currObj = {
                "left": this.getIndex(currX - 1, currY),
                "right": this.getIndex(currX + 1, currY),
                "top": this.getIndex(currX, currY - 1),
                "bottom": this.getIndex(currX, currY + 1)
            }
            var tags = currObj[state1];
            if (!isFan) {
                if (state1 == "left") {
                    currObj["left_top"] = this.getIndex(currX - 1, currY - 1);
                    currObj["left_bottom"] = this.getIndex(currX - 1, currY + 1);
                } else if (state1 == "right") {
                    currObj["right_top"] = this.getIndex(currX + 1, currY - 1);
                    currObj["right_bottom"] = this.getIndex(currX + 1, currY + 1);
                } else if (state1 == "top") {
                    currObj["top_left"] = this.getIndex(currX - 1, currY - 1);
                    currObj["top_right"] = this.getIndex(currX + 1, currY - 1);
                } else if (state1 == "bottom") {
                    currObj["bottom_left"] = this.getIndex(currX - 1, currY + 1);
                    currObj["bottom_right"] = this.getIndex(currX + 1, currY + 1);
                }
                tags = !currObj[state1];
            }

            if (tags && currObj[state2]) {
                this.setIndex(currX, currY);
                if (!isFan) {
                    if (state1 == "top") {
                        currY--;
                    } else if (state1 == "bottom") {
                        currY++;
                    } else if (state1 == "left") {
                        currX--;
                    } else if (state1 == "right") {
                        currX++;
                    }
                } else {
                    if (state1 == "top") {
                        currY++;
                    } else if (state1 == "bottom") {
                        currY--;
                    } else if (state1 == "left") {
                        currX++;
                    } else if (state1 == "right") {
                        currX--;
                    }
                }
                this.states = true;
                isUpdate = true;
            } else {
                this.states = false;
                break;
            }
        }
        return isUpdate;
    },
    getJSON: function() {
        var bgArr = [],
            bgObjs = {};
        var currRgb = false,
            startY = 1,
            heightNum = 0;
        for (var y = 0; y < this.baseRgb.length; y++) {
            var ys = this.baseRgb[y];
            if (!currRgb) {
                currRgb = [ys[0], ys[1], ys[2], ys[3]];
            }
            var keys = currRgb[0] + "," + currRgb[1] + "," + currRgb[2] + "," + currRgb[3];
            if (Math.abs(currRgb[0] - ys[0]) <= 3 &&
                Math.abs(currRgb[1] - ys[1]) <= 3 &&
                Math.abs(currRgb[2] - ys[2]) <= 3 &&
                Math.abs(currRgb[3] - ys[3]) <= 3) {
                heightNum++;
                //最后一个
                if (y >= this.baseRgb.length - 1) {
                    if (!bgObjs[keys]) {
                        bgObjs[keys] = 0;
                    }
                    bgObjs[keys] += heightNum;
                    bgArr.push({
                        color: "rgba(" + keys + ")",
                        x: 1,
                        y: startY,
                        w: this.w,
                        h: heightNum
                    });
                }
            } else {
                if (!bgObjs[keys]) {
                    bgObjs[keys] = 0;
                }
                bgObjs[keys] += heightNum;
                bgArr.push({
                    color: "rgba(" + keys + ")",
                    x: 1,
                    y: startY,
                    w: this.w,
                    h: heightNum
                });
                startY = y + 1;
                currRgb = [ys[0], ys[1], ys[2], ys[3]];
                heightNum = 1;
            }
        }
        var max = 0,
            maxColorKey = "";
        for (var i in bgObjs) {
            if (max < bgObjs[i]) {
                max = bgObjs[i];
                maxColorKey = i;
            }
        }

        //type 1表示父容器
        var myJSON = [{
            x: 1,
            y: 1,
            w: auto.w,
            h: auto.h,
            color: "rgba(" + maxColorKey + ")",
            type: 1
        }];
        for (var i = 0; i < bgArr.length; i++) {
            var bgArri = bgArr[i];
            if (bgArri.color == "rgba(" + maxColorKey + ")") {
                bgArr.splice(i, 1);
            }
        }
        myJSON = myJSON.concat(bgArr);
        for (var i = 0; i < this.bigObj.length; i++) {
            var data = this.bigObj[i];
            myJSON.push({
                x: data.x,
                y: data.y,
                w: data.w,
                h: data.h
            });
        }
        for (var i = 0; i < this.arr.length; i++) {
            var data = this.arr[i];
            if (!data.rongId) {
                myJSON.push({
                    x: data.x,
                    y: data.y,
                    w: data.w,
                    h: data.h
                });
            }
        }
        for (var i = 0; i < this.arr.length; i++) {
            var data = this.arr[i];
            if (data.isRongBase && data.rongId) {
                myJSON.push({
                    rongId: data.rongId,
                    isRongBase: true,
                    x: data.x,
                    y: data.y,
                    w: data.w,
                    h: data.h
                });
            }
        }
        for (var i = 0; i < this.arr.length; i++) {
            var data = this.arr[i];
            if (data.rongId && !data.isRongBase) {
                myJSON.push({
                    rongId: data.rongId,
                    x: data.x,
                    y: data.y,
                    w: data.w,
                    h: data.h
                });
            }
        }
        return myJSON;
    },
    toJSON: function() {
        var myJSON = [];
        for (var i = 0; i < this.bigObj.length; i++) {
            var data = this.bigObj[i];
            myJSON.push({
                x: data.x,
                y: data.y,
                w: data.w,
                h: data.h
            });
        }
        for (var i = 0; i < this.arr.length; i++) {
            var data = this.arr[i];
            myJSON.push({
                x: data.x,
                y: data.y,
                w: data.w,
                h: data.h
            });
        }

        var imgArr = [];
        //创建一个大的虚拟canvas
        var newCanvas = document.createElement("canvas");
        newCanvas.width = this.w;
        newCanvas.height = this.h;
        var newCvs = newCanvas.getContext("2d");
        //newCvs.putImageData(this.copyData,0,0);
        newCvs.drawImage(this.img, 0, 0, this.w, this.h);
        //循环各个部分，裁剪出
        for (var i = 0; i < myJSON.length; i++) {
            var jsonObj = myJSON[i];
            var newCanvas1 = document.createElement("canvas");
            newCanvas1.width = jsonObj.w;
            newCanvas1.height = jsonObj.h;
            var newCvs1 = newCanvas1.getContext("2d");
            var copyData = newCvs.getImageData(jsonObj.x - 1, jsonObj.y - 1, jsonObj.w, jsonObj.h);
            newCvs1.putImageData(copyData, 0, 0);
            var src = newCanvas1.toDataURL("image/png");
            this.getBg(src, jsonObj);
            //  imgArr.push(src);
        }
        //console.log("len:",myJSON.length,myJSON);
        return imgArr;
    }
}



function downloadFile(fileName, content) {
    var aLink = document.createElement('a');
    var text = '<!DOCTYPE HTML>\r';
    text += '<html>\r';
    text += '<head>\r\t';
    text += '<title>ai-page</title>\r\t';
    text += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">\r\t';
    text += '<meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"/>\r\t';
    text += '<!--\r\t';
    text += '<meta name="apple-mobile-web-app-capable" content="yes">\r\t';
    text += '<meta name="x5-page-mode" content="app"/>\r\t';
    text += '<meta name="x5-fullscreen" content="true"/>\r\t';
    text += '<meta name="x5-orientation" content="portrait"/>\r\t';
    text += '<meta name="360-fullscreen" content="true">\r\t';
    text += '<meta name="full-screen" content="yes">\r\t';
    text += '<meta name="screen-orientation" content="portrait">\r\t';
    text += '<meta name="apple-mobile-web-app-title" content="ai-page" id="apptitle">\r\t';
    text += '<meta http-equiv="Pragma" content="no-cache">\r\t';
    text += '<meta http-equiv="Cache-Control" content="no-cache">\r\t';
    text += '<meta http-equiv="Expires" content="0">\r\t';
    text += '<link rel="shortcut icon" id="icon_1" href="icon.png">\r\t';
    text += '<link rel="apple-touch-icon" id="icon_2" href="icon.png"/>\r\t';
    text += '<link rel="stylesheet" href="css/all.min.css">\r\t';
    text += '-->\r';
    text += '<style>body,*{margin:0px;padding:0px;}</style>\r';
    text += '</head>\r';
    text += '<body>\r';
    text += content;
    text += '\r</body>\r';
    text += '</html>';
    var blob = new Blob([text]);
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", false, false); //initEvent 不加后两个参数在FF下会报错
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.dispatchEvent(evt);
}

//设置编辑图片 是否合并或者 包容
var currEditType = 1;

function setEdit(type) {
    currEditType = type;
}