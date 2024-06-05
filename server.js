import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
const saltRounds = 10;
const port = process.env.PORT || 20072
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://ecommerce-imta.onrender.com');
    res.header('Access-Control-Allow-Headers', 
               'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials: true')
    next();
    });
  
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    key: "userId",
    secret: "subscriber",
    resave:false,
    saveUninitialized: false ,
    cookie: {
        expires: 60 * 60 * 24
    },
})
);


const db = mysql.createConnection({
    host: "bfnwurlpig5e68hclczy-mysql.services.clever-cloud.com",
    user:"uy8jydz3g4ijvtyq",
    password:"b4p6tD5LRgkEVOHLxIp",
    database: 'bfnwurlpig5e68hclczy'
})

 const verifyUser = (req,res,next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({Error: "You are not authorized"});
   } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if(err){
                return res.json({Error: "Authorization Error"});
           } else {
                req.name = decoded.name;
                next();
            }
        })
  }

 }
  app.get('/', verifyUser, (req, res) =>{ 
      res.set('Access-Control-Allow-Origin', '*');
    return res.json({Status:"Success", name: req.name});

  })
app.get("/", (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.session.user){
        console.log(req.session.user);
                const name = data[0].firstName;
        res.send({loggedIn: true, user: req.session.user})
    } else {
        res.send({loggedIn:false})
    }

    
})
app.post('/signup', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    const password = req.body.password
    const sql = "INSERT INTO `login`(`firstName`, `lastName`, `birthDate`, `address`, `email`, `password`) VALUES (?)";
    bcrypt.hash(password.toString(), saltRounds, (err, hash) => {
        if (err) {
            return res.json({Error: "Error for password" });
        }
        const values = [
            req.body.firstName,
            req.body.lastName,
            req.body.birthDate,
            req.body.address,
            req.body.email,
            hash
        ]
            db.query(sql, [values], (err, result) => {
                if(err) return res.json({Error: "Inserting data error in server"});
                return res.json({Status: "Success"});
            })

    })
    })
   
app.post('/login', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    const sql ="SELECT * FROM `login` WHERE `email` = ?" ;
    db.query(sql, [req.body.email ], (err, data) => {
        if (err) {
            return res.json({Error: "Error"});
        }
        if (data.length > 0) {
           bcrypt.compare(req.body.password.toString(), data[0].password, (err,response) => {
            if (err){
                return res.json({Error:"Error"});
            }
            if(response) {
                req.session.user = data ;
                console.log(req.session.user);
                const name = data[0].firstName;
                const token = jwt.sign({name}, "jwt-secret-key", {expiresIn: '1d'});
                res.cookie('token', token);
                return res.json({Status: "Success"});
                } else{
                    return res.json({Error: 'Failed'}); 
                }
            })
        } 
        
})
})

app.listen(port, ()=> {
    console.log(`listening on ${port}`)
})
