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
        {messages.map((message) => {
          {/* console.log("messageszzz;", message,currentChat.email); */}
          return (
            <div ref={scrollRef} key={uuidv4()}>
            <div className="message sended"><p>this is trial</p></div>
              <div
                className={`message ${
                  message.receiver === currentChat.email ? "recieved" : "sended"
                }`}
              >
                <div className="content ">
                  <p>{message.message}</p>
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
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
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
      }
    }
  }
`;
