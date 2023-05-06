const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const session = require("express-session");
const {v4:uuidv4} = require("uuid"); 
const router=require("./router");
const nocache = require("nocache");


const app = express()

const port = process.env.PORT || 8000

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:false}))



//initialize engine
app.set('view engine','ejs')

//load static assets
app.use('/static',express.static(path.join(__dirname,'public')))
app.use('/assets',express.static(path.join(__dirname,'public/assets')))

app.use(session({
    secret:uuidv4(), 
    resave:false,
    saveUninitialized:true
}))


app.set('etag', false)
app.use(nocache());

//home route
app.get('/',(req,res)=>{
    res.redirect('/dashboard');
    
})

const goToHomeIfLoggedIn = (req, res, next) => {
    if(req.session.user) {
        res.redirect('/dashboard');
    } else {
        next();
    }
}

//register route
app.get('/register', goToHomeIfLoggedIn, (req,res)=>{
    res.render('register',{title:"Register"})
})


app.use('/',router)

app.listen(port,()=>console.log(`server started at http://localhost:${port}`))