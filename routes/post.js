const express = require('express');
const router = express.Router();
const fs = require('fs');
const multiparty = require('multiparty');

router.post('/uploadpost.do',function(req,res){
    var randomIdx = Math.round(Math.random() * (1000 - 0) + 0);
    var postIdx = req.reqTime.getTime()+"_"+randomIdx;

    fs.readFile(`./data/post.json`, 'utf8', function(err, content){
        var postList;
        if(!content){
            postList = [];
        }else{
            postList = JSON.parse(content);
        }
        
        fs.writeFile(`./data/post.json`, JSON.stringify(postList), 'utf8', function(err){
            if(!err){
                res.send({code:'SUCC'});
            }else{
                res.send({code:'ERR'});
            }

            req.body.postIdx = postIdx;
            req.body.regDtm = req.reqTime.format("yyyyMMdd_hhmmss");
            req.body.updDtm = req.reqTime.format("yyyyMMdd_hhmmss");
            postList.push(req.body);

            fs.writeFile(`./data/post.json`, JSON.stringify(postList), 'utf8', function(err){
                if(!err){
                    res.send({code:'SUCC'});
                }else{
                    res.send({code:'ERR'});
                }
            });
        });
    });
});

router.post('/getpostlist.do',function(req,res){
    fs.readFile(`./data/post.json`, 'utf8', function(err, content){
        var postList;
        if(!content){
            postList = [];
        }else{
            postList = JSON.parse(content);
        }
        res.send(postList);
    });
});

router.post('/test.do',function(req,res){
    console.log(req.body);

    var form = new multiparty.Form();
    // get field name & value
    form.on('field',function(name,value){
        console.log('normal field / name = '+name+' , value = '+value);
    }); 
  
   // file upload handling
//    form.on('part',function(part){
//         var filename,size;
//         if (part.filename) {
//               filename = part.filename;
//               size = part.byteCount;
//         }else{
//               part.resume();
//         }    

//         console.log("Write Streaming file :"+filename);

//         var writeStream = fs.createWriteStream('/tmp/'+filename);
//         writeStream.filename = filename;
//         part.pipe(writeStream);

//         part.on('data',function(chunk){
//               console.log(filename+' read '+chunk.length + 'bytes');
//         });
//         part.on('end',function(){
//               console.log(filename+' Part read complete');
//               writeStream.end();
//         });

//    });

//    // all uploads are completed
//    form.on('close',function(){
//         res.status(200).send('Upload complete');
//    });

//    // track progress
//    form.on('progress',function(byteRead,byteExpected){
//         console.log(' Reading total  '+byteRead+'/'+byteExpected);
//    });
//    form.parse(req);
    res.send(req.body);
});

module.exports = router;