var express = require('express');
var router = express.Router();
var fs = require("fs");
var formidable = require('formidable');

/* GET home page. */
router.route("/uploadPhoto").get(function(req, res) {
    res.render("uploadPhoto", { title: 'OCR Test', message: "" });
}).post(function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");

    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.uploadDir = '/Users/llb/Documents/code/HTML/assets/OCR/'
    form.parse(req, function(err, fileds, files) {
        if (err) { return console.log(err) }

        let imgPath = files.img.path;
        let imgName = "/Users/llb/Documents/code/HTML/assets/OCR/test." + files.img.type.split("/")[1];
        let data = fs.readFileSync(imgPath);

        fs.writeFile(imgName, data, function(err) {
            if (err) { return console.log(err) }

            fs.unlink(imgPath, function() {});
            //res.json({code:1})
            global.nodeServer.getResult(res, imgName);
        })
    });
});
module.exports = router;