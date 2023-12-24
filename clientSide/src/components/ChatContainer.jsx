// ChatContainer.js
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  const localStorageUserDetails = JSON.parse(
    localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
  );

  const fetchMessages = async () => {
    const response = await axios.post(recieveMessageRoute, {
      sender: localStorageUserDetails.userDetails.email,
      receiver: currentChat.email,
    });
    setMessages(response.data);

   
  };

  useEffect(() => {
    // Fetch messages when the component mounts
    fetchMessages();
  }, [currentChat]); 
  

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        ).userDetails.email;
      }
    };
    getCurrentChat();
  }, [currentChat]);


  const handleSendMsg = async (msg) => {
    socket.current.emit("send-msg", {
      receiver: currentChat.email,
      sender: localStorageUserDetails.userDetails.email,
      message: msg,
    });

    let sentMsg = await axios.post(
      sendMessageRoute,
      {
        sender: localStorageUserDetails.userDetails.email,
        receiver: currentChat.email,
        message: msg,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorageUserDetails.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    setMessages((prevMessages) => [...prevMessages, sentMsg.data]);

  };


  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-receive", (msg) => {
        setArrivalMessage({ sender: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" , block: "end"});
  }, [messages]);

  return (
    
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
     
        {messages.map((message, index) => {
           
          
          const dateObject = new Date(message.createdAt);

          // Convert to IST
          dateObject.setHours(dateObject.getHours() + 5); // Add 5 hours
          dateObject.setMinutes(dateObject.getMinutes() + 30); // Add 30 minutes

          let date = dateObject.toISOString().slice(0,10);
         
           let time_hr = dateObject.toISOString().slice(11,13);
           let time_min = dateObject.toISOString().slice(14,16);
      
           let prev_date;
           if(index === 0){
             prev_date = date;
            
           }
           else{
          
            let timestamp = messages[index-1].createdAt;
            
            var prev_dateObject = new Date(timestamp);
            prev_dateObject.setHours(dateObject.getHours() + 5); // Add 5 hours
            prev_dateObject.setMinutes(dateObject.getMinutes() + 30); // Add 30 minutes

          
        if(date === prev_dateObject.toISOString().slice(0,10)){
          
          prev_date = "";
        }else{
        
         prev_date = date;
     
        }
      };

          return (
            <div ref={scrollRef} key={uuidv4()}>
           
             <div className = {`${prev_date ? "date_changed": "date_same" }`}>{prev_date}</div>
              <div
                className={`message ${
                  message.receiver === currentChat.email ? "recieved" : "sended"
                }`}
              >
                <div className="content ">
                <div className= "text-message">
                  <p>{message.message}</p>

                  </div>
                   <div className="text-message-date">   
                   <span>{time_hr}:{time_min}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        display:flex;
        flex-direction: column;
        justify-content: space-between;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
      .text-message{
      width:100%;
      align-self: flex-start;
      padding:1px 2px 15px 2px;
    }

    .text-message-date{
     font-size:12px;
     align-self:flex-end;
     display: flex;
    flex-direction: column;
    color:grey;
    }
    .text-message-date span {
  margin-top: auto; /* Push the span to the bottom */
}
    
    }

   
    .sended {
      justify-content: flex-start;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-end;

      .content {
        background-color: #9900ff20;
        min-width:30%;
      }
    }

    .date_changed{
    text-align: center;
    color:white;
  
  }

  .date_same{
    height: 0px;
    
  }

  }
`;
