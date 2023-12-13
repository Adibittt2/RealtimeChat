 

 const {
  login,
  register,
  getAllUsers,
  setAvatar,
  logout,
  searchUsersList,
  emailVerification
} = require("../services/userService");

const jwt = require('jsonwebtoken');

const router = require("express").Router();

router.get('/', async(req,res)=>{

  res.send(`Hi you are in chat app auth router.`);
})


  const authentication = (req,res,next)=>{

  let token = req.headers['authorization'];

  let filter_token = token.split(" ");
  // console.log('req.header;',req.headers);
  // console.log('req.header;',filter_token[1]);

  if(!token){
      return res.status(401).json({error: 'Unauthorized'});
  }

  jwt.verify(filter_token[1],process.env.SECRET_KEY, (err,user)=>{
      if(err){
          return res.status(403).json({error: 'Forbidden'});
      }

      
      req.user = user;
     
  next();
  console.log("////////////////authentication done///////////////");
  
  });
 
}

router.post("/login", login);
router.post("/register", register);
router.post("/emailVerification", emailVerification);
router.get("/getAllUsers", authentication, getAllUsers);
router.post("/setavatar",authentication, setAvatar);
router.get("/logout", authentication, logout);
router.get("/searchUsers", authentication, searchUsersList)

module.exports = router;


