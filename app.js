var util = require('util');

    fs = require('fs');
    mysql = require('mysql');
    random = require("node-random");
    im = require('imagemagick');
    express = require('express');
    expressValidator = require('express-validator'),

    app = express();

var connection = mysql.createConnection({
    host: 'localhost',
    database: 'node',
    user: 'root',
    password: ''
});


app.configure(function () {
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.cookieParser());
  
  app.use(express.bodyParser());
  app.use(expressValidator()); 
app.use(express.session({secret: '1234567890QWERTY'}));
});


app.use('/public', express.static(__dirname + '/public')); 

app.all('*', function(req, res, next){//to execute before all routing
    res.locals.loginStat=false;
    if(req.session.email){
        //console.log(req.session.email);
        res.locals.loginStat=true;
    }
    next();
});

app.get('/', function(req, res){
  res.render('index.ejs',{data:{"loginStat":res.locals.loginStat}});  
});

app.get('/dashboard', function(req, res){
  if(req.session.userEmail){
        res.send('dashboard page');
    }else{
        res.writeHead(301,{Location: '/'});
        res.end();
    }
});


app.get('/logout',function (req,res){
    if(req.session.email && req.session.email!=null){
        delete req.session.email;
//        console.log('logout clicked');
        res.writeHead(301,{Location: '/'});
        res.end();
    }else{
        res.writeHead(301,{Location: '/'});
        res.end();
    }
})

app.post('/upload', function(req, res) {

	fs.readFile(req.files.image.path, function (err, data) {

		var imageName = req.files.image.name

		/// If there's an error
		if(!imageName){

			console.log("There was an error")
			res.redirect("/");
			res.end();

		} else {

		   var newPath = __dirname + "/uploads/fullsize/" + imageName;

		  var thumbPath = __dirname + "/uploads/thumbs/" + imageName;


		  /// write file to uploads/fullsize folder
		  fs.writeFile(newPath, data, function (err) {

		  	/// write file to uploads/thumbs folder
//			  im.resize({
//				  srcPath: newPath,
//				  dstPath: thumbPath,
//				  width:   200
//				}, function(err, stdout, stderr){
//				  if (err) throw err;
//				  console.log('resized image to fit within 200x200px');
//				});

                      var args = [
                                newPath,
                                "-crop",
                                "120x80+30+15",
//                                  "-draw",
//                                  "+0+0+25+35+45+39+52+59",
                                thumbPath
                                ];  
                      im.convert(args, function(err) {
                        if (err) {
                        throw err;
                         }
                            
                            res.redirect("/uploads/thumbs/" + imageName);
                            res.end("Image crop complete");
                        });

//                gm(newPath)
//                        .drawPolygon([160, 10], [163, 13], [165, 13], [167, 15], [165, 17], [163, 19])
//                        .write(thumbPath, function(err) {
//                            if (err)
//                                return console.dir(arguments)
//                            console.log(this.outname + ' created  :: ' + arguments[3])
//
//                        })
                      
//			   res.redirect("/uploads/fullsize/" + imageName);

		  });
		}
	});
});

fs.readFile('./index.html', function (err, html) {
    if (err) {
        throw err; 
    }
    form=html;
    })

app.get('/resize', function (req, res){
	res.writeHead(200, {'Content-Type': 'text/html' });
//        res.writeHead(200, {'Content-Type': 'image/jpeg' });
	res.end(form);	
});

app.post('/resize', function(req, res) {
//console.log(req.param('viewPortW'));
//console.log(util.inspect(req.param('viewPortW')));
//console.log(util.inspect(req.body));// get all req contents
//console.log(req.body);
//console.log(req.xhr);

if(req.xhr){
//    req.body.selectorX,    req.body.selectorY,    req.body.selectorW,    req.body.selectorH
        var connection = mysql.createConnection({
            host: 'localhost',
            database: 'node',
            user: 'root',
            password: ''
        });
    
        var imageName='';
        var email = req.session.uid;
        var sql = "SELECT ImageName FROM ?? WHERE ?? = ?";
        var inserts = ['user', 'id', email];
        sql = mysql.format(sql, inserts);
        
        if(req.session.uid)
        {       
        connection.query(sql, function(err, rows) {
            imageName=rows[0].ImageName;       
       
    
    var newPath = __dirname + "/uploads/fullsize/" + imageName;
    var thumbPath = __dirname + "/uploads/thumbs/" + imageName;
    
    fs.readFile(newPath,  function (err,data) {
        fs.writeFile(newPath, data, function (err) {    
        var args = [
                newPath,
                "-crop",
                req.body.selectorW+"x"+req.body.selectorH+"+"+req.body.selectorX+"+"+req.body.selectorY,//  "120x80+30+15",
                thumbPath
            ];
            im.convert(args, function(err) {
                if (err) {
                    throw err;
                }
                
                res.send(url.resolve('http://localhost:8888/','/uploads/thumbs/'+imageName));
//                res.end("Image crop complete");
            });
        })
    })
     });

        }else{
            res.send('Please login <a href="#" >Here</a>');
        }
}
	
});

app.get('/login',function (req,res){
    if(req.session.email){
        res.writeHead(301,{Location: '/dashboard'});
        res.end();
    }else{     
          res.render('login.ejs',{"data":{"":""}}); 
    }
})

app.get('/sign-up',function (req,res){
    if(req.session.email){
        res.writeHead(301,{Location: '/dashboard'});
        res.end();
    }else{     
          res.render('signup.ejs',{"data":{"":""}}); 
    }
})



var form = "<!DOCTYPE HTML><html><body>" +
"<form method='post' action='/upload' enctype='multipart/form-data'>" +
"<input type='file' name='image'/>" +
"<input type='submit' /></form>" +
"</body></html>";

app.get('/upload', function (req, res){
	res.writeHead(200, {'Content-Type': 'text/html' });
//        res.writeHead(200, {'Content-Type': 'image/jpeg' });
	res.end(form);	
});

app.post('/login',function (req, res){
    if (req.session.email) {
        res.writeHead(301, {Location: '/dashboard'});
        res.end();
    } else {
        if (req.body.submit) {
            email = req.body.username;
            password = req.body.password;
            
            if(email && password){
                var Fname = '';
                var sql = "SELECT Fname,Email FROM ?? WHERE ?? = ? AND ?? = ?";
                var inserts = ['user', 'email', email, 'password', password];
                sql = mysql.format(sql, inserts);
//        console.log(sql);
                connection.query(sql, function(err, rows) {

                    if (err != null ) {
                       console.log('no data found')
                    }else if(typeof  rows[0]==='undefined') {
                       res.render('login.ejs',{"data":{"errors":{"Login Error":"Login credential Mismatch"}}});
                    } else {                      //set user session                        
                        var Fname = rows[0].Fname;
                        var Email = rows[0].Email; 

                        req.session.uid = Fname;
                        req.session.email = Email;
                        res.writeHead(301, {Location: '/dashboard'});
                        res.end();
                    }
                })
            }else{
                
            res.render('login.ejs',{"data":{"errors":{'username':'required','password':'required'}}});
        }
           
        }else{
            console.log('error');
            res.render('login.ejs',{"data":{"errors":"errors"}});
        }
    }
})


app.post('/sign-up',function (req, res){
    if (req.session.email) {
        res.writeHead(301, {Location: '/dashboard'});
        res.end();
    } else {
        if (req.body.submit) {
//            req.assert('name', 'Name is required').notEmpty(); 
            req.checkBody('firstName', 'First Name Required').notEmpty()
            req.checkBody('firstName').isAlpha();
            req.checkBody('lastName', 'Last Name Required').notEmpty()
            req.checkBody('lastName').isAlpha();
            req.checkBody('useremail', 'Email Required').notEmpty()
            req.checkBody('useremail', 'Invalid Email').isEmail()
            req.checkBody('password', 'Please provide password').notEmpty()
//            req.checkBody('confPassword', 'Please Provide confirm password').notEmpty()
            req.assert('password', '6 to 20 characters required').len(6, 20);
            
//            image = req.body.conf-password;
            
            errors = req.validationErrors();
            //validation
            
            //validation
            
            if (errors) {

                res.render('signup.ejs', {"data": {"errors": errors}});
            } else {
                random.numbers({
                    "number": 1,
                    "minimum": 300,
                    "maximum": 9999,
                }, function(error, data) {
                    if (error)
                        throw error;
                    data.forEach(function(random) {
//                        console.log( 'the number is '+d );
                        
                        var sql = "INSERT INTO user1 set `id`=?,`email`=?, `Password`=?, `Status`=? ";
                        var inserts = [random, req.body.useremail, req.body.password, "1"];
                        sql = mysql.format(sql, inserts);
//                        console.log(sql);
                        connection.query(sql, function(err, rows) {

                            if (err != null) {
                                console.log('something wrong in database operation')
                                console.log(err);
                            } else {                      //set user session                        
                           
                                res.writeHead(301, {Location: '/login'});
                                res.end();
                            }
                        })
                    });
                });

                
//                console.log('Validation successful');
               
            }
           
        }else{
            console.log('error');
            res.render('login.ejs',{"data":{"errors":"errors"}});
        }
    }
})
app.listen(3000);
console.log('app is listening at localhost:3000');