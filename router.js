var express = require("express");
var router = express.Router();
var bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;
const users = new Map();

const goToHomeIfLoggedIn = (req, res, next) => {
    if(req.session.user) {
        res.redirect('/route/dashboard');
    } else {
        next();
    } 
}
const goToRegisterIfNoVlaue = (req,res,next) => {
    if(req.body.email==""&&req.body.password==''){
        res.redirect('/register')
    }else{
        next();
    }
}


router.post("/register", goToHomeIfLoggedIn, goToRegisterIfNoVlaue, async (req, res) => {
    
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    users.set(req.body.email, {
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      hashedPassword: hashedPassword,
    });
    console.log(users);
    res.redirect("/");
  } catch (e) {
    console.log(e);
    res.redirect("/register");
  }

});

//user login

router.get('/login', goToHomeIfLoggedIn, (req, res) => {
    res.render('login')
})


router.post("/login", goToHomeIfLoggedIn, async (req, res) => {
  const user = users.get(req.body.email);
  if (!user) {
    res.render("login", {
      title: "invalid",
      invalid: "invalid user",
    });
    return;
  }
  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.hashedPassword
  );
  if (!isPasswordMatch) {
    res.render("login", {
      title: "invalid",
      invalid: "invalid username and password",
    });
    return;
  }
  req.session.user = user;
  req.session.name=user.name;
  res.redirect("/route/dashboard");
});


const goToLoginIfNotLoggedIn = (req, res, next) => {
    if(!req.session.user) {
        res.redirect('/route/login');
    } else {
        next();
    }
};

//route for dashboard
router.get("/dashboard", goToLoginIfNotLoggedIn, (req, res) => {
    res.render("dashboard", {name: req.session.name});
});

// route for logout
router.get("/logout", goToLoginIfNotLoggedIn, (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
      res.send("Error");
    } else {
      res.render("login", {
        title: "Express",
        logout: "logout successfully..!!",
      });
    }
  });
});

router.get("*", (req, res) => {
  res.send("<h1>Error 404</h1>");
});

module.exports = router;
