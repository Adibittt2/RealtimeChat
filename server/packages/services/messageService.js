const Messages = require("../models/messageModel");
const User = require('../models/userModel');


module.exports.addMessage = async (req, res, next) => {
  try {
    const { sender, receiver, message } = req.body;

    const userDetails = User.findOne({email: receiver});

    if(userDetails){
      const date = new Date();

      // Convert to IST
      const istDateOptions = {
        timeZone: 'Asia/Kolkata',
        hour12: true, // Use 24-hour format
      };
      
      const istDate = date.toLocaleString('en-US', istDateOptions);
      
      console.log('IST Date and Time:', istDate);
      
    let data = await Messages.create({message: message, sender: sender, receiver: receiver,createdAt:istDate});
    console.log("addMesagezzz;",data);
    res.send(data);
    }else{
      return res.send({error: "receiver email not available"});
    }
  } catch (ex) {
    next(ex);
  }
};



module.exports.getMessages = async (req, res) => {
  console.log('get Messages');
  try {
     const { sender, receiver } = req.body;

    const messages = await Messages.aggregate([
      {$match: {$or:[{sender:sender, receiver:receiver}, {sender:receiver, receiver:sender}]}},
     
      {
        $sort:{createdAt:1}
      }
    ]);

    res.send(messages);
  
  } catch (msg) {
    res.send({error: msg});
  }
};




