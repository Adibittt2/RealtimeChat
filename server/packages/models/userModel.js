const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    min: 3,
    max: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  isAvatarImageSet: {
    type: Boolean,
    default: false,
  },
  avatarImage: {
    type: String,
    default: "",
  },
  mobile: {
    type: String,
    // required: true,
    unique:true,
    min:10,
    max:10
  },
  isEmailVerified: {
    type:Boolean,
    default: false
  },
  token:{
    type:String
  }
});

module.exports = mongoose.model("Users", userSchema);
