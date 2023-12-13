// Chat.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  // console.log('entered in chat page');
  
  
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  // const [currentUser, setCurrentUser] = useState((JSON.parse(
  //   localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
  // ).userDetails));


  useEffect(async () => {
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/login");
    } else {
      setCurrentUser(
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        ).userDetails
      );
    }
  }, []);

 
  // console.log("currrrrrrrrrent User;", currentUser);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser.email);
    }
  }, [currentUser]);

  useEffect(async () => {
    // console.log("user;;1");
    // console.log("currrrrrrrrrent User;11111", currentUser);
    // if (currentUser?.isAvatarImageSet) {////////// it doesn't work
     if (currentUser.isAvatarImageSet) {
      // console.log("user;;2--2");
      try {
        const response = await axios.get(`${allUsersRoute}`, {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)).token}`,
            'Content-Type': 'application/json',
          },
        });
        // console.log("user;;3--3", response);
        const filteredContacts = response.data.filter((user) => user.email !== currentUser.email);
        setContacts(filteredContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error.message);
      }
    } else {
      navigate("/setAvatar");
    }
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  
  return (
    <Container>
       <div className="container">
        <Contacts contacts={contacts} changeChat={handleChatChange} />
        {currentChat === undefined ? (
          <Welcome />
        ) : (
        
          <ChatContainer currentChat={currentChat} socket={socket} />
        )}
      </div>
    </Container>
  );
}


const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
