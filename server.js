import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
const saltRounds = 10;
const port = process.env.PORT || 8080
const app = express();
app.use(express.json());

app.use(cors({origin: ["https://ecommerce-imta.onrender.com",
                      "https://ecommercedb-q0qz.onrender.com"],
 methods: ["POST", "GET"],
  credentials:true}));

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
    host: "customers.cdgcqw4k6oi6.us-east-1.rds.amazonaws.com",
    user: "admin",
    pasword: "admin123",
    database: "login"
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
    return res.json({Status:"Success", name: req.name});
      

  })
app.get("/", (req, res) => {
    if (req.session.user){
        console.log(req.session.user);
                const name = data[0].firstName;
        res.send({loggedIn: true, user: req.session.user})
    } else {
        res.send({loggedIn:false})
    }

    
})
app.post('/signup', (req, res) => {
    const password = req.body.password
    const sql = "INSERT INTO `login.login_info`(`firstName`, `lastName`, `birthDate`, `address`, `email`, `password`) VALUES (?)";
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
    const sql ="SELECT * FROM `login.login_info` WHERE `email` = ?" ;
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
