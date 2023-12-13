import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import { searchUsers } from "../utils/APIRoutes";
import axios from "axios";

export default function Contacts({ contacts, changeChat }) {

  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [searchedUser, setSearchedUser] = useState("");
  const [searchedContact,setSearchContact] = useState([]);

 useEffect( async ()=>{
 
  console.log("useState;serchedContact;", searchedContact);
 },[searchedContact]);

  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );

    console.log('dat;',data);
    setCurrentUserName(data.userDetails.username);
    setCurrentUserImage(data.userDetails.avatarImage);
  }, []);

   const searchResult = (e) => {

    e.preventDefault();
  
    contacts = contacts.filter((ele)=>{

      if(ele.email.includes(searchedUser) || ele.mobile.includes(searchedUser)){
   
       return ele;
     }
    });

    setSearchContact([...contacts]);

   };

   const callOnKeyPress = (event)=>{

    if(event.key == 'Enter'){
      console.log('pressed Enter');
      searchResult(event);
    }

   };

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };
  return (
    <>
      {currentUserImage && currentUserImage && (
        <Container>
          <div className="brand">
          
            {/* <img src={Logo} alt="logo" /> */}
            <h3>Realtime Chat</h3>
          </div>

          <div className="searchUser"> 
          <input id = "searchBar" placeholder = "find by email/mobile"
           onChange={(e)=> setSearchedUser(e.target.value) }  onKeyDown={callOnKeyPress} />
          <button id = "searchBtn"   onClick ={searchResult}> Search </button>
          </div>
          
          <div className="contacts">
 
            {(searchedContact.length>0 ? searchedContact : contacts).map((contact, index) => {
              return (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt=""
                    />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                </div>
              );
            
            })}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 10% 70% 10%;
  overflow: hidden;
  background-color: #080420;

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    heigth:20vh;
    background-color: rgb(42, 3, 48);
    justify-content: center;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }

  .searchUser {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
   
  }

   #searchBar{
    width: 80%;
    height: 60%;
    color: white;
    font-size: 20px;
  }

  #searchBtn{
    height: 60%;
    color: white;
    background-color: rgb(154, 134, 243);
    border-radius: 5px;
    font-size: 20px;
  }

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
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
    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;
