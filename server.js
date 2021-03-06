 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';

var fs = require('fs');
var express = require('express');
var mongo = require('mongodb').MongoClient;
var app = express();

var url = process.env.MONGOLAB_URI;
const originUrl = require('url');


if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });

app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

// Generate random alphanumeric string
function getRandomAlphaNumeric(randomNumLength) {
  var alphaNum = ''; 
  var seed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i=0; i < randomNumLength; i++) { 
    alphaNum += seed.charAt(Math.floor(Math.random()*seed.length)); 
  }
	return alphaNum;
};

// Generate random int number between range
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

// Validate url fornat against regex
function ValidURL(str) {
  var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  if(!regex .test(str)) {
    return false;
  } else {
    return true;
  }
}

// Insert document in db collection
function insertDocDb(document, col, callback){
  mongo.connect(url, function(err, client) {
      if (err) throw err;
      var db = client.db(process.env.DBNAME);
      var collection = db.collection(col);
  
      collection.insert(document
      , function(err, data) {
          if (err) callback(err, ''); 
          callback('', data);
          client.close();
      })
  })
}

// Find document in db collection
function findDocDb(query, collection, callback) {
  mongo.connect(url, function(err, client) {
    if (err) console.log(err);
    var db = client.db(process.env.DBNAME);
    var coll = db.collection(collection);
    
    coll.find(query)
    .toArray(function(err, documents) {
        if (err) callback(err, '');
        callback('', documents);
        client.close();
    })
  })
}

// Process short url and redirect to original, if not found give error message
app.route('/*')
    .get(function(req, res,next) {
  
      // Input url parameter
      var urlStr = req.url;
      var parameterStr= urlStr.substring(0,4);
  
      // If input parameter has the '/new' url keyword, pass to next route, otherwise check if exists in db
      if (parameterStr === '/new') {
        next();
      } else {
          // Construct input url to query db - protocol, host and parameters
          parameterStr= urlStr.substring(1);
          var protoHeaders = req.headers["x-forwarded-proto"];
          var protoHeadersArr = protoHeaders.split(',');
          var proto = protoHeadersArr[0];  
          var hostHeaders = req.headers["x-forwarded-host"];
          var hostHeadersArr = hostHeaders.split(',');
          var host = hostHeadersArr[0];
          var inputUrl = proto + '://' + host + '/' + parameterStr
          
          // Find short url parameter in db and redirect to original url, if not print error message
          var collection = 'urls';
          var query = { shortUrl: inputUrl };
          findDocDb(query, collection, function (err, data) {
            if (err) throw err;
            if (data != '') {
              res.redirect(data[0].originalUrl);
            } else {
              res.send({"error":"This url is not found in the database."})
            }
          })
      }
});

// Route for generating new short url
app.route('/new/*')
    .get(function(req, res,next) {
      
      // Input url parameter
      var urlStr = req.url;
      var parameterUrl = urlStr.substring(5);
  
      // Check if input paramenter is a valid url, if not give error message
      var isValidUrl = ValidURL(parameterUrl);
      if (!isValidUrl) {
        res.send({error:'Wrong url format, pass a valid protocol and site.'});
      }else {  
        // Construct short url - protocol, host and random int number into range
        // Construct short url - protocol, host and random alphanumeric string
        var protoHeaders = req.headers["x-forwarded-proto"];
        var protoHeadersArr = protoHeaders.split(',');
        var proto = protoHeadersArr[0];  
        var hostHeaders = req.headers["x-forwarded-host"];
        var hostHeadersArr = hostHeaders.split(',');
        var host = hostHeadersArr[0];
        getRandomAlphaNumeric
        var shortUrl = proto + '://' + host + '/' + getRandomAlphaNumeric(process.env.RLENGTH);
        //var shortUrl = proto + '://' + host + '/' + getRandomIntInclusive(process.env.RMININT, process.env.RMAXINT);
      
        // Insert document with original and short url in db
        var collection = 'urls';
        var document = { originalUrl: parameterUrl, shortUrl: shortUrl }
        insertDocDb(document, collection, function (err, data) {
          if (err) throw err;
          if (data.result.ok == 1) {
            res.send('{"original_url":"' + data.ops[0].originalUrl + '",' +'"short_url":"' + data.ops[0].shortUrl + '"}');
          }
        }); 
      }
    });

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

