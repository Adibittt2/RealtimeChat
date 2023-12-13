const express = require("express"); //module for express.js
const cors = require("cors");
const mongoose = require("mongoose"); //module for mongoDb.
const authRoutes = require("./packages/routes/userRouter");  
const messageRoutes = require("./packages/routes/messageRouter");
const app = express();
const socket = require("socket.io"); // module for real time chat
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // strictQuery: false
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log("errror:",err.message);
  });

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);


app.get('/', async(req,res)=>{

  res.send(`Hi you are in chat app`);
});

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);


const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  console.log('socket;',socket.id);
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.receiver);
    console.log('sendUserSocket;;;',sendUserSocket);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", data.message);
    }
  });
});
