var AipOcrClient = require("baidu-aip-sdk").ocr;

// 设置APPID/AK/SK
// var APP_ID = "10643899";
// var API_KEY = "Pj3mgnFIUjjQFRBSzp0dWPdN";
// var SECRET_KEY = "ihnw9zf01kem2Mjq3cLSqyNR9TTNmYwI";

// 设置APPID/AK/SK
var APP_ID = "10658111";
var API_KEY = "9c0N81MAe5WmaMQBdnB7vK86";
var SECRET_KEY = "qrFWIx7K00bPSjTUqYf4hGo2QwE9PMOQ";

var client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);

var fs = require('fs');

module.exports = {
    getResult: function(res, imgName) {
        var image = fs.readFileSync(imgName);
        var base64Img = new Buffer(image).toString('base64');
        var options = {
            recognize_granularity: 'small'
        }
        client.general(base64Img, options).then(function(result) {
            var resp = {
                img: 'images/demo.png',
                key: 'key',
                data: result
            }
            console.log(JSON.stringify(resp));
            res.json(resp);
        }).catch(function(err) {
            // 如果发生网络错误
            console.log(err);
        });
    }
}