const { addMessage, getMessages } = require("../services/messageService");
const router = require("express").Router();
const authentication = require("./userRouter")

router.post("/addmsg/",authentication, addMessage);
router.post("/getmsg/", authentication, getMessages);

module.exports = router;
