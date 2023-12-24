const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const brevo = require('@getbrevo/brevo');



module.exports.login = async (req, res,next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    console.log('asfds',user);
    if (!user){
      return res.send({ msg: "Incorrect Username or Password"});
    }
   
    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('asfds22',isPasswordValid);
   
    if (!isPasswordValid){
      return res.send({ msg: "Incorrect Password"});
    }

    const token = jwt.sign({email}, process.env.SECRET_KEY, {expiresIn: '1d'});

    return res.send({token: token, userDetails: user});
   
  } catch (ex) {
    next(ex);
    console.log("safdsf",ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password,mobile } = req.body;
   
    const emailCheck = await User.findOne({ email });
    if (emailCheck){
      return res.json({ msg: "Email already used", status: false });
    }
    const mobileCheck = await User.findOne({ mobile });
    if (mobileCheck){
      return res.json({ msg: "Mobile already used", status: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = String(Math.floor(1000 + Math.random() * 9000)); 
  
    console.log("otp;",otp, typeof(otp));
    
    const otp_token = await bcrypt.hash(otp,10);

    const user = await User.create({
      email: email,
      mobile: mobile,
      username: username,
      password: hashedPassword,
      token: otp_token,
    });


   
    await this.email(email,1,`${username}, you got OTP for RealTime Chat Verfication`, {username: username, otp: otp});

    delete user.password;

    const token = jwt.sign({email}, process.env.SECRET_KEY, {expiresIn: '1d'});

    return res.send({status: true, token: token, userDetails: user});
  } catch (ex) {
    next(ex);
  }
};

module.exports.emailVerification = async (req,res)=>{

  const {email,otp} = req.body;
  console.log("otpVerentry",email,otp);
    let user = await User.aggregate([{
      $match: {email:email}
    }]);

    console.log("otpVerentry222", user);
    if(user){
  
      let isOtpVerified = await bcrypt.compare(otp,user[0].token);
       
      if(isOtpVerified){
        console.log("otpVerentry333", user);
        let userUpdate = await User.findOneAndUpdate({email:email},{$set:{isEmailVerified:true}});
        
        return res.send(userUpdate);
      }else{
        res.send(`Sorry, OTP is not correct!`);
      }
    }

}

module.exports.getAllUsers = async (req, res, next) => {
 
  try {
     const users = await User.find().select([
      "email",
      "username",
      "avatarImage",
      "mobile",
      "_id",
    ]);
   
    return res.json(users);
  } catch (ex) { 
    console.log('entrylll;',ex);

    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {

 
  try {
    // const email = req.body.email;
    // const avatarImage = req.body.image;


    const{email,image} = req.body;

  // console.log("email;",email,image);

    console.log('req.body;',req.body,req.params);
    const userData = await User.updateOne(
      { email: email }, // Match the document with the provided email
      {
        $set: {
          isAvatarImageSet: true,
          avatarImage: image,
        },
      }      
    );

    console.log("userData;",userData);

    let user = await User.aggregate([
      {$match: {email: email}}
    ]);

    console.log("user;",user);

    console.log('userData',userData,user);
    return res.json(
      // isSet: userData.isAvatarImageSet,
      // image: userData.avatarImage,
      {userDetails:user}
    );
  } catch (ex) {
    next(ex);
  }
};

module.exports.logout = (req, res, next) => {
  try {
    if (!req.params.id){ 
      return res.send({ msg: "User id is required " });
  }
   
    const token = jwt.sign(req.body, process.env.SECRET_KEY, {expiresIn: '0s'});
console.log('token;;',token);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};

module.exports.email = async (email, templateId, subject, params) =>{
 

  const apiKey = process.env.SENDINBLUE_APIKEY;

  console.log("apikey;",apiKey);
  SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey;

  let api = new SibApiV3Sdk.TransactionalEmailsApi();
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail = {
      sender: {
          email: process.env.EMAIL_FROM,
          name: 'Realtime Chat',
      },
      // to: email.map((email) => ({ email })),
      to: [{
          email: email,
        }],
      replyTo: {
          email: process.env.EMAIL_FROM,
      },
      subject: subject,
      templateId: templateId,
      params: params
    
    };

  api.sendTransacEmail(sendSmtpEmail).then(function (data) {
      console.log(`Email sent: ${JSON.stringify(data)}`);
  }, function (error) {
      console.log(`Error sending email: ${JSON.stringify(error)}`);
  });
};

module.exports.searchUsersList = async(req,res)=>{

  const {keywords} = req.body;

  let usersList = await User.aggregate([

    { $match: 
      {$or: [
        {email: {$regex: new RegExp(keywords, 'i') }},
      {mobile: {$regex: new RegExp(keywords, 'i') }}
    ]
      }
    }
  ]);

  return res.send(usersList);

}