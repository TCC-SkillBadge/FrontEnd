import React, { useEffect, useState, useRef } from 'react';
import { DataScroller } from 'primereact/datascroller';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { io } from 'socket.io-client';
import axios from 'axios';
import '../styles/ChatBox.css';
import { InputText } from 'primereact/inputtext';
import InputEmoji from 'react-input-emoji';
import Loading from './Loading';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const chatServiceURL = 'http://localhost:8001';
const commonUserURL = 'http://localhost:7000/api';
const enterpriseUserURL = 'http://localhost:7003/api';

const connectionCommonUser = axios.create({
  baseURL: `${commonUserURL}/user`,	
});

const connectionEnterpriseUser = axios.create({
  baseURL: enterpriseUserURL,
});

const ChatBox = () => {
  const [token, _setToken] = useState(sessionStorage.getItem('token'));
  const [userType, _setUserType] = useState(sessionStorage.getItem('tipoUsuario'));
  const [userInfo, _setUserInfo] = useState(JSON.parse(sessionStorage.getItem('userInfo')));
  const [user, _setUser] = useState(userInfo.email ? userInfo.email : userInfo.email_comercial);

  const [contacts, setContacts] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [messagesDisplayed, setMessagesDisplayed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [socket, setSocket] = useState(null);


  useEffect(() => {
    console.log('ChatBox mounted');
    console.log('Token:', token);
    console.log('User Type:', userType);
    console.log('User Info:', userInfo);

    setSocket(() => io(chatServiceURL, { auth: { user } } ))
    
    return () => {
      socket?.disconnect();
    }
  }, []);

  useEffect(() => {
    socket?.on('connect', () => {
      console.log('Connected to Chat Service');
    });
  
    socket?.on('start chat application', (data) => {
      console.log('Chat application started');	
      console.log(data);
      setContacts(() => data.contacts);
      setAllMessages(() => data.messageList);
      setLoading(() => false);
    });

    socket?.on('received message', (data) => {
      console.log('Message received');
      console.log(data);
  
      const cont_e = user === data.sender_email ? data.receiver_email : data.sender_email;
      const cont_u = user === data.sender_email ? data.receiver_username : data.sender_username;

      let found = false;
      for(let i = 0; i < contacts.length; i++) {
        if(contacts[i].email === cont_e) {
          found = true;
          break;
        }
      };
  
      if(found) {
        console.log('Contact already exists');
        const newMessages = allMessages.map((contMSGs) => {
          if(contMSGs.contact_email === cont_e) {
            return {
              ...contMSGs,
              messages: [data, ...contMSGs.messages],
            };
          }
          return contMSGs;
        });
        setAllMessages(() => newMessages);
      }
      else{
        console.log('New contact');
        setContacts((oldContacts) => [...oldContacts, { email: cont_e, username: cont_u }]);
        setAllMessages((oldMessages) => [...oldMessages, { contact_email: cont_e, contact_username: cont_u, messages: [data] }]);
        toast.info(`A new contact has been added: ${cont_u}`);
      }
    });

    socket?.on('error occurrence', (data) => {
      console.error('An error occurred');
      console.error(data);
      toast.error(data.error);
    });

    return () => {
      socket?.off('connect');
      socket?.off('start chat application');
      socket?.off('received message');
      socket?.off('error occurrence');
    };
  }, [socket, contacts, allMessages, messagesDisplayed]);

  useEffect(() => {
    console.log('All Messages Changed:', allMessages);
    if(messagesDisplayed){
      for(let i = 0; i < allMessages.length; i++) {
        if(allMessages[i].contact_email === messagesDisplayed.contact_email) {
          setMessagesDisplayed(() => allMessages[i]);
          break;
        }
      }
    }
  }, [allMessages]);

  const sendMessage = (msg) => {
    console.log('Sending message');
    console.log('Contacts:', contacts);
    socket.emit('send message', {
      sender_email: msg.sender_email,
      receiver_email: msg.receiver_email,
      sender_username: msg.sender_username,
      receiver_username: msg.receiver_username,
      message: msg.message,
      sending_date: new Date(),
    });
  };

  const chooseContact = (contact) => {
    console.log('Choosing contact');
    console.log(contact);
    console.log(contacts);
    console.log(allMessages);

    for(let i = 0; i < allMessages.length; i++) {
      if(allMessages[i].contact_email === contact) {
        setMessagesDisplayed(() => allMessages[i]);
        break;
      }
    }
  };

  return (
    <div className='chatbox'>
      {
        loading ?
        <div className='flex flex-row justify-content-center align-items-center h-full'>
          <Loading msg='Loading Chat Service'/>
        </div> :
        <div className='flex flex-row h-full'> 
          <Contacts
          contacts={contacts}
          setSearching={setSearching}
          chooseContact={chooseContact}/>
          <Divider layout='vertical'/>
          <MessagesD
          contactMessages={messagesDisplayed}
          userInfo={userInfo}
          sendMessage={sendMessage}
          setMessagesDisplayed={setMessagesDisplayed}/>
        </div>
      }
      <SearchBox
      searching={searching}
      setSearching={setSearching}
      token={token}
      userType={userType}
      userInfo={userInfo}
      contacts={contacts}
      sendMessage={sendMessage}/>
      <ToastContainer
      position="top-center"
      autoClose={3000}
      hideProgressBar
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"/>
    </div>
  )
};

const Contacts = ({contacts, setSearching, chooseContact}) => {

  const buildContacts = () => {
    return (
      <div className='contact-box'>
        {
          contacts.map((contact) => {
            return (
              <div
              key={contact.email}
              className='flex flex-row align-items-center'>
                <button
                className='contact-button'
                onClick={() => chooseContact(contact.email)}>
                  <nobr>{contact.username}</nobr>
                </button>
              </div>
            )
          })
        }
      </div>
    )
  };

  return (
    <div className='relative'>
      <h3>Contacts</h3>
      <Divider/>
      <div>
        {buildContacts()}
      </div>
      <div className='flex flex-row mt-3 w-full absolute bottom-0'>
        <button
        className='btn btn-primary'
        onClick={() => setSearching(() => true)}>
          <i className='pi pi-plus'/> New Chat
        </button>
      </div>
    </div>
  )
};

const MessagesD = ({contactMessages, userInfo, sendMessage, setMessagesDisplayed}) => {
  const [userEmail, _setUserEmail] = useState(userInfo.email ? userInfo.email : userInfo.email_comercial);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const scrollabelRef = useRef(null);

  useEffect(() => {
    console.log('MessagesD mounted');
    console.log('Contact Messages:', contactMessages);
    if(contactMessages){
      setMessages(() => contactMessages.messages);
    }
  }, [contactMessages]);

  useEffect(() => {
    if(scrollabelRef.current){
      scrollabelRef.current.scrollTop = scrollabelRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMsg = (sender, receiver, sender_UN, receiver_UN, message) => {
    const msg = {
      sender_email: sender,
      receiver_email: receiver,
      sender_username: sender_UN,
      receiver_username: receiver_UN,
      message: message,
    };
    sendMessage(msg);
    setMessagesDisplayed((oldValues) => {
      console.log('Old Values:', oldValues);
      return {
        ...oldValues,
        messages: [msg, ...oldValues.messages],
      };
    });
  };

  const buildMessages = () => {
    return (
      <div ref={scrollabelRef} className='message-box'>
        {
          messages.map((message, index, messages) => {
            const isSenderTheUser = userEmail === message.sender_email;
            const differentiateDates = () => {
              if(index === messages.length - 1) return true;
              const previousDate = new Date(messages[index + 1].sending_date).toLocaleDateString();
              const currentDate = new Date(message.sending_date).toLocaleDateString();
              return previousDate !== currentDate;
            }
            return (
              <div key={index}>
                {
                  differentiateDates() ?
                  <div className='date-box'>
                    <div className='date-line'>
                      {new Date(message.sending_date).toLocaleDateString()}
                    </div>
                  </div> :
                  null
                }
                <div className={isSenderTheUser ? 'message-line-sender' : 'message-line-receiver'}>
                  <div className={isSenderTheUser ? 'message-line-sender-box' : 'message-line-receiver-box'}>
                    <div>
                      <h5><b>{isSenderTheUser ? 'You' : message.sender_username}</b></h5>
                    </div>
                      <p>{message.message}</p>
                      <div
                      className={'flex flex-row ' + (isSenderTheUser ? 'justify-content-start' : 'justify-content-end')}
                      style={{
                        color: 'lightgray',
                      }}>
                        {new Date(message.sending_date).toLocaleTimeString()}
                      </div>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    )
  };

  return(
    <div className='relative w-full'>
      <h3>Messages</h3>
      <Divider/>
      {
        messages.length !== 0 ?
        <div>
          <div>
           {buildMessages()}
          </div>
          <div className='flex flex-row absolute bottom-0 w-full'>
            <InputEmoji
            value={newMessage}
            onChange={setNewMessage}
            onEnter={() => { 
              sendMsg(
                userEmail,
                contactMessages.contact_email,
                userInfo.username,
                contactMessages.contact_username,
                newMessage)
            }}
            placeholder='Type your message and press enter'
            cleanOnEnter
            shouldReturn/>
          </div>
        </div> :
        <div className='flex flex-column justify-content-center align-items-center h-full'>
          <img width='auto' height='50%' src='/images/chat-image.png'/>
          <h1 style={{fontSize: 'calc(15px + 1.5vw)'}}>Start a conversation now</h1>
        </div>
      }
    </div>
  )
};

const SearchBox = ({token, userType, userInfo, searching, setSearching, contacts, sendMessage}) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    console.log('SearchBox mounted');
    console.log('Token:', token);
    console.log('User Type:', userType);
    console.log('User Info:',userInfo);
  }, []);

  const searchUsers = async () => {
    setLoading(() => true);
    setNoResults(() => false);

    console.log('Searching for users');
    console.log('Search:', searchTerm);
    console.log('Token:', token);
    console.log('User Type:', userType);

    const fetchUsers = async () => {
      let UEs = [];
      let UCs = [];

      try{
        UCs = (await connectionCommonUser.get('/find', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { 
            userType: userType,
            search: searchTerm 
          },
        })).data;
      }
      catch (error) {
        console.error(error);
      }

      try {
        UEs = (await connectionEnterpriseUser.get('/find-user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { 
            userType: userType,
            search: searchTerm 
          },
        })).data;
      }
      catch (error) {
        console.error(error);
      }

      console.log('UCs:', UCs);
      console.log('UEs:', UEs);

      return { UCs, UEs };
    };

    const formatResponses = (UEs, UCs) => {
      const users = [];

      for(let i = 0; i < UEs.length; i++) {
        let alreadyInContacts = false;
        for(let j = 0; j < contacts.length; j++) {
          if(UEs[i].email_comercial === contacts[j].email) {
            alreadyInContacts = true;
            break;
          }
          if(!alreadyInContacts){
            users.push({
              username: UEs[i].username ? UEs[i].username : 'Anonimous',
              email: UEs[i].email_comercial,
              name: UEs[i].razao_social,
              type: 'enterprise',
            });
          }
        }
      }
      
      for(let i = 0; i < UCs.length; i++) {
        let alreadyInContacts = false;
        for(let j = 0; j < contacts.length; j++) {
          if(UCs[i].email === contacts[j].email) {
            alreadyInContacts = true;
            break;
          }
        }
        if(!alreadyInContacts) {
          users.push({
            username: UCs[i].username ? UCs[i].username : 'Anonimous',
            email: UCs[i].email,
            name: UCs[i].fullName,
            type: 'common',
          });
        }
      }

      return users;
    }

    const { UCs, UEs } = await fetchUsers();
    const users = formatResponses(UEs, UCs);

    console.log('Users', users);

    if (users.length === 0) {
      setNoResults(() => true);
    }

    setSearchResults(() => users);
    setLoading(() => false);
    setSearchTerm(() => '');
  };

  return (
    <Dialog
    className='searchbox'
    visible={searching}
    onHide={() => {
      if (!searching) return;

      setSearchTerm(() => '');
      setSearchResults(() => []);
      setNoResults(() => false);
      setSearching(() => false);
    }}
    closable={true}>
      <div>
        <h3>Search for Users</h3>
        <Divider/>
        <div className='p-inputgroup'>
          <span className='p-inputgroup-addon'>
            <i className={loading ? 'pi pi-spin pi-spinner' : 'pi pi-search'}/>
          </span>
          <InputText
          value={searchTerm}
          onChange={(e) => {setSearchTerm(() => e.target.value)}}/>
          <Button
          className='p-button-primary'
          label='Search'
          onClick={searchUsers}/>
        </div>
        <div className='m-3'>
          {
            noResults ?
            <div className='flex flex-row justify-content-center'>
              <h3>No results found</h3>
            </div> : 
            null
          }
          <SearchResults searchResults={searchResults} userInfo={userInfo} sendMessage={sendMessage} setSearching={setSearching}/>
        </div>
      </div>
    </Dialog>
  )
};

const SearchResults = ({searchResults, userInfo, sendMessage, setSearching}) => {
  const [sendFirstMessage, setSendFirstMessage] = useState(false);
  const [firstMessage, setFirstMessage] = useState('');
  const [userEmail, _setUserEmail] = useState(userInfo.email ? userInfo.email : userInfo.email_comercial);
  const [userUsername, _setUserUsername] = useState(userInfo.username);

  return (
    <div className='search-result-box'>
      {
        searchResults.map((user) => {
          const icon = user.type === 'common' ? 'pi pi-user' : 'pi pi-building';

          return (
            <div
            key={user.email}
            className='search-results'>
              <div>
                <div className='flex flex-row align-items-center'>
                  <i className={'mr-3 ' + icon}/>
                  <h1><b>{user.username}</b></h1>
                </div>
                <div className='mb-2'>
                  <b>E-mail:</b>
                  <div>{user.email}</div>
                </div>
                <div className='mb-3'>
                  {
                    user.type === 'enterprise' ?
                    <b>Enterprise Name: </b> :
                    <b>Full Name: </b>
                  }
                  <div>{user.name}</div>
                </div>
              </div>
              <div className='flex flex-row justify-content-center'>
                <button
                className='iniciate-chat-button'
                onClick={() => setSendFirstMessage(() => !sendFirstMessage)}>
                  Start Chat
                </button>
              </div>
              {
                sendFirstMessage ?
                <div className='first-message-box'>
                  <h2>Send your first Message</h2>
                  <InputEmoji
                  value={firstMessage}
                  onChange={setFirstMessage}
                  onEnter={() => {
                    sendMessage({
                      sender_email: userEmail,
                      receiver_email: user.email,
                      sender_username: userUsername,
                      receiver_username: user.username,
                      message: firstMessage,
                    });
                    setSearching(() => false);
                  }}
                  placeholder={`Type your message and press enter to send it to ${user.username}`}
                  cleanOnEnter
                  shouldReturn/>
                </div> :
                null
              }
            </div>
          )
        })
      }
    </div>
  )
};

export default ChatBox;
