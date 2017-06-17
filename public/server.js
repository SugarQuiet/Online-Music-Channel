
//App restful api
var var_dump = require('var_dump');
//mongoDB
var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server('localhost', 27017, { auto_reconnect: true, poolSize: 10 });
var db = new mongodb.Db('MusicChannel', mongodbServer);

//Express
var express = require('express');

//解析器
var bodyParser = require('body-parser');
var url = require('url');
var path = require('path');
var querystring = require('querystring');

//解析秒數
var UrlPattern = require('url-pattern');

//server
var http = require('http');
var app = express();
var server = app.listen(1094, function () {
    console.log('Node server is running..');
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({	extended:true }));
//註冊資料
var Register_data = {
	'_id' : "",
	'password':"",
	'name' : "",
	'songlist' : {"videoId":[]}
};

app.get('/', function (req, res) {
    res.sendFile(__dirname+'/public/index.html');
});
app.get('/mysongs', function (req, res) {
    res.sendFile(__dirname+'/public/main.html');
});

app.post('/signup',function(req,res){
	console.log("Signup");	
	console.log(req.body);
	Register_data._id = req.body.id;
	Register_data.password = req.body.password;
	Register_data.name = req.body.name;
	console.log(Register_data);
		
	db.open(function(){		
			db.collection('Account', function(err, collection) {
			// Insert a data 
				collection.insert(Register_data, function(err, data) {
					if (data) {
						console.log('Account Successfully Insert\n');
					} else {
						console.log('Account Failed to Insert\n' + err);
					}
				});
			});		
		db.close();
	});
	res.writeHead(200, {
	  'Content-Type': 'application/text',
	  'X-Powered-By': 'bacon'
	});	
	res.end("true");
	console.log("Register Success");
});

app.post('/login',function(req,res){
	console.log("Login");	
	var account = db.collection('Account');
	var id = req.body.id;
	var password = req.body.password;
	console.log(id + ", " + password);
	if(password){
		db.open(function(){
			
			account.findOne({"_id":id},function(err,doc){		
				if(err)
					console.log(err);
				if(doc.password == password){
					console.log("Login Success");				
					res.writeHead(200, {
					  'Content-Type': 'application/text',
					  'X-Powered-By': 'bacon'
					});	
					res.end(JSON.stringify(doc.name));
				}
				else{
					console.log("Login Fails");
					res.writeHead(200, {
					  'Content-Type': 'application/text',
					  'X-Powered-By': 'bacon'
					});	
					res.end("false");

				}
			});
			db.close();
		});
	}
});

app.put('/update/id',function(req,res){
	
	console.log("update id" + req.body);
	
});

app.post("/save",function(req,res){	
	var account = db.collection('Account');
	console.log("Save");		
	console.log(req.body.id + ", " + JSON.stringify(req.body.SongList));
	db.open(function(){
		account.findOneAndUpdate({"_id":req.body.id},{
			"$set":{
				"songlist": req.body.SongList
			},
		},
		{
				returnOriginal:false,
				upsert:true
		},function(err){
			if(err){
				console.log("Failed");	
				console.log(err);
				res.writeHead(404, {
				  'Content-Type': 'application/text',
				  'X-Powered-By': 'bacon'
				});	
				res.end("false");
			}	
			else{
				console.log("Success");		
				res.writeHead(200, {
				  'Content-Type': 'application/text',
				  'X-Powered-By': 'bacon'
				});	
				res.end("true");
			}
		});	
		db.close();
	});
});

app.post("/load",function(req,res){
	console.log("Load");
	console.log(req.body);
	var account = db.collection("Account");
	if(req.body.id){
	db.open(function(){
			account.findOne({"_id":req.body.id},function(err,doc){
				if(err){
					console.log(err);
					res.writeHead(404, {
					  'Content-Type': 'application/text',
					  'X-Powered-By': 'bacon'
					});	
					res.end("false");
				}
				else{
					console.log(doc.songlist);
					res.writeHead(200, {
					  'Content-Type': 'application/text',
					  'X-Powered-By': 'bacon'
					});	
					res.end(JSON.stringify(doc.songlist));
				}
			});
			db.close();
		});
	}
});

app.post("/boardcast",function(req,res){
	console.log("Boardcast");
	console.log(req.body);
	var boardcast = db.collection("Boardcast");
	if(req.body.msg == "00481007isHandsome!"){
		db.open(function(){
			boardcast.findOne({"_id": "DJ"},function(err,doc){
				if(err){
					console.log(err);
					res.writeHead(404, {
					  'Content-Type': 'application/text',
					  'X-Powered-By': 'bacon'
					});	
					res.end("false");
				}
				else
				{
					console.log(doc.songlist);
					res.writeHead(200, {
					  'Content-Type': 'application/text',
					  'X-Powered-By': 'bacon'
					});
					res.end(JSON.stringify(doc.songlist));
				}
				});
				db.close();
		});
	}
});

app.post("/sr",function(req,res){
	console.log("SongRequest");
	console.log(req.body);
	var boardcast = db.collection("Boardcast");
	if(req.body.duration){
		db.open(function(){
			var duration = req.body.duration;
			console.log(duration);
			boardcast.update({"_id": "DJ"},{
				"$push":{
					"songlist.videoId": req.body.videoId,
					"songsduration": req.body.duration
				},
			},
			{
					returnOriginal:false,
					upsert:true
			},function(err,doc){
				if(err){
					console.log(err);
					res.writeHead(404, {
					  'Content-Type': 'application/text',
					  'X-Powered-By': 'bacon'
					});	
					res.end("false");
				}
				else
				{
					res.writeHead(200, {
					  'Content-Type': 'application/text',
					  'X-Powered-By': 'bacon'
					});
					res.end("true");
				}
			});
			db.close();
		});
		

	}
});

app.post("/now",function(req,res){
	console.log("Now");
	console.log(req.body);
	if(req.body.msg == "00481007isHandsome!"){
		console.log(nowPlaying);
		console.log(nowPlayingDuration - remaining);
		var result = {};
		result.videoId = nowPlaying;
		result.seconds = nowPlayingDuration - remaining
		res.writeHead(200, {
		  'Content-Type': 'application/text',
		  'X-Powered-By': 'bacon'
		});
		res.end(JSON.stringify(result));
	}
});

app.post("/mark",function(req,res){
	console.log("Mark");
	console.log(req.body);
	var account = db.collection("Account");
	db.open(function(){
		account.update({"_id": req.body.id},{
			"$push":{
				"songlist.videoId": req.body.videoId,
			},
		},
		{
				returnOriginal:false,
				upsert:true
		},function(err){
			if(err){
				console.log("Failed");	
				console.log(err);
				res.writeHead(404, {
				  'Content-Type': 'application/text',
				  'X-Powered-By': 'bacon'
				});	
				res.end("false");
			}	
			else{
				console.log("Success");		
				res.writeHead(200, {
				  'Content-Type': 'application/text',
				  'X-Powered-By': 'bacon'
				});	
				res.end("true");
			}
		});	
		db.close();
	});
});

//Timer
var nowPlaying = "";
var nowPlayingDuration = 0;
var remaining = 0;
var firstloading = true;
var boardcast = db.collection("Boardcast");
/*var timeout = setTimeout(function() {

}, 250);*/

var interval = setInterval(function() {
	//console.log("remaining : " + remaining + " seconds");
	if(remaining <= 0)
	{
		db.open(function(){
			if(firstloading){
				boardcast.findOne({"_id": "DJ"},function(err,doc){
					if(err){
						console.log(err);
					}
					else
					{
						if(doc.songlist.videoId[0]){
							console.log(doc.songlist.videoId[0]);
							console.log(doc.songsduration[0]);
							nowPlaying = doc.songlist.videoId[0];
							nowPlayingDuration = doc.songsduration[0];
							remaining = doc.songsduration[0];
						}
						else
						{
							remaining = 0;
						}
					}
				});
			}
			else
			{
				boardcast.update({"_id": "DJ"},{
					"$pop":{
						"songlist.videoId": -1,
						"songsduration": -1
					},
				},
				{
						returnOriginal:false,
						upsert:true
				},function(err,doc){
					if(err){
						console.log(err);
					}
					else
					{
						console.log(doc.songlist);
						//console.log(doc.songsduration);
					}
				});

				boardcast.findOne({"_id": "DJ"},function(err,doc){
					if(err){
						console.log(err);
					}
					else
					{
						if(doc.songlist.videoId[0]){
							console.log(doc.songlist.videoId[0]);
							console.log(doc.songsduration[0]);
							nowPlaying = doc.songlist.videoId[0];
							nowPlayingDuration = doc.songsduration[0];
							remaining = doc.songsduration[0];
						}
						else
						{
							remaining = 0;
						}
					}
				});

				if ( typeof nowPlaying !== 'undefined' && nowPlaying )
				{
					boardcast.update({"_id": "DJ"},{
					"$push":{
						"songlist.videoId": nowPlaying,
						"songsduration": nowPlayingDuration
					},
				},
				{
						returnOriginal:false,
						upsert:true
				},function(err,doc){
					if(err){
						console.log(err);
					}
					else
					{
						console.log(doc.songlist);
						//console.log(doc.songsduration);
					}
				});
				}
				
			}
			firstloading = false;
			db.close();
		});
	}
	remaining--;
}, 1000);