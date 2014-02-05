var mysql = require('mysql');
var express = require('express');
var fs = require('fs');
var app = express();

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
app.use(express.session({secret: '1234567890QWERTY'}));
});


app.use('/public', express.static(__dirname + '/public')); 

app.all('*', function(req, res, next){//to execute before all routing
    res.locals.loginStat=false;
    if(req.session.userEmail){
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

app.get('/login',function (req,res){
    if(req.session.userEmail){
        res.writeHead(301,{Location: '/dashboard'});
        res.end();
    }else{
          res.render('login.ejs',{"data":{"":""}}); 
    }
})

app.post('/login',function (req, res){
    if (req.session.userEmail) {
        res.writeHead(301, {Location: '/dahboard'});
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

                    if (err != null) {
                        console.log('no data found')
                    } else {                      //set user session
                        Fname = rows[0].Fname;
                        Fname = rows[0].Email;
                        console.log(Fname);

                        req.session.uid = Fname;
                        req.session.email = Email;
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

app.listen(3000);
console.log('app is listening at localhost:3000');