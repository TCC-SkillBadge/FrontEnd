import React, { useEffect, useState, useRef } from "react";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { io } from "socket.io-client";
import axios from "axios";
import "../styles/ChatBox.css";
import { InputText } from "primereact/inputtext";
import InputEmoji from "react-input-emoji";
import Loading from "./Loading";
import { animated, useTransition } from "react-spring";
import { jwtExpirationHandler } from "../utils/general-functions/JWTExpirationHandler";
import { ConfirmDialog } from "primereact/confirmdialog";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ChatBox.css";
import "../styles/GlobalStylings.css";

const chatServiceURL = process.env.REACT_APP_API_CHAT;
const commonUserURL = `${process.env.REACT_APP_API_COMUM}/api`;
const enterpriseUserURL = `${process.env.REACT_APP_API_ENTERPRISE}/api`;

const connectionCommonUser = axios.create({
  baseURL: commonUserURL,
});

const connectionEnterpriseUser = axios.create({
  baseURL: enterpriseUserURL,
});

const verifyImageValidity = (user, dimensions) => {
  if (user.profile_picture === null || user.profile_picture === "") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
          border: "1px solid white",
          width: `${dimensions}px`,
          height: `${dimensions}px`,
        }}
      >
        {user.type === "UE" ? (
          <i className="pi pi-building" />
        ) : (
          <i className="pi pi-user" />
        )}
      </div>
    );
  }
  return (
    <img
      style={{ borderRadius: "50%" }}
      src={user.profile_picture}
      width={dimensions}
      height={dimensions}
    />
  );
};

const ChatBox = () => {
  const [token, _setToken] = useState(sessionStorage.getItem("token"));
  const [userType, _setUserType] = useState(
    sessionStorage.getItem("tipoUsuario")
  );
  const [userInfo, _setUserInfo] = useState(
    JSON.parse(sessionStorage.getItem("userInfo"))
  );
  const [userEmail, _setUserEmail] = useState(
    userInfo.email ? userInfo.email : userInfo.email_comercial
  );
  const [userUsername, _setUserUsername] = useState(userInfo.username);

  const [contacts, setContacts] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [messagesDisplayed, setMessagesDisplayed] = useState(null);
  const [chosenContact, setChosenContact] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [inoperant, setInoperant] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(() =>
      io(chatServiceURL, {
        auth: { token, user: userEmail },
        transports: ["websocket"],
      })
    );

    return () => {
      socket?.disconnect();
    };
  }, []);

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("Connected to Chat Service");
      setLoading(() => true);
    });

    socket?.on("start chat application", async (data) => {
      console.log("Chat application started");
      console.log(data);

      const contactsAux = data.contacts;
      const contacts = [];
      for (let i = 0; i < contactsAux.length; i++) {
        const cont = await searchContatcs(contactsAux[i]);
        contacts.push(cont);
      }

      console.log("Contacts:", contacts);

      setContacts(() => contacts);
      setAllMessages(() => data.messageList);
      setLoading(() => false);
      setInoperant(() => false);
    });

    socket?.on("received message", async (data) => {
      console.log("Message received");
      console.log(data);

      let cont_e;
      let cont_u;
      let cont_t;
      if (data.sender_email === userEmail) {
        cont_e = data.receiver_email;
        cont_u = data.receiver_username;
        cont_t = data.receiver_user_type;
      } else {
        cont_e = data.sender_email;
        cont_u = data.sender_username;
        cont_t = data.sender_user_type;
      }

      let found = false;
      for (let i = 0; i < contacts.length; i++) {
        if (contacts[i].email === cont_e) {
          found = true;
          break;
        }
      }

      if (found) {
        console.log("Contact already exists");
        const newMessages = allMessages.map((contMSGs) => {
          if (contMSGs.contact_email === cont_e) {
            return {
              ...contMSGs,
              messages: [data, ...contMSGs.messages],
            };
          }
          return contMSGs;
        });
        setAllMessages(() => newMessages);
      } else {
        console.log("New contact");
        const newContact = await searchContatcs({
          email: cont_e,
          username: cont_u,
          user_type: cont_t,
        });

        setContacts((oldContacts) => [...oldContacts, newContact]);
        setAllMessages((oldMessages) => [
          ...oldMessages,
          {
            contact_email: cont_e,
            contact_username: cont_u,
            contact_type: cont_t,
            messages: [data],
          },
        ]);
        toast.info(`A new contact has been added: ${cont_u}`);
      }
    });

    socket?.on("error occurrence", (data) => {
      console.error("An error occurred");
      console.error(data);
      toast.error(data.error);
    });

    // Listen to connection error
    socket?.on("connect_error", (error) => {
      console.error("An error occurred while connecting to the chat service");
      console.error(error);

      if (error.message === "Token has expired") jwtExpirationHandler();

      setLoading(() => false);
      setInoperant(() => true);
    });

    return () => {
      socket?.off("connect");
      socket?.off("start chat application");
      socket?.off("received message");
      socket?.off("error occurrence");
      socket?.off("connect_error");
    };
  }, [socket, contacts, allMessages, messagesDisplayed]);

  useEffect(() => {
    console.log("All Messages Changed:", allMessages);
    if (messagesDisplayed) {
      for (let i = 0; i < allMessages.length; i++) {
        if (allMessages[i].contact_email === messagesDisplayed.contact_email) {
          setMessagesDisplayed((oldValues) => {
            return {
              contact_profile_picture: oldValues.contact_profile_picture,
              ...allMessages[i],
            };
          });
          break;
        }
      }
    }
  }, [allMessages]);

  const searchContatcs = async (contact) => {
    const cont = {
      email: contact.email,
      user_type: contact.user_type,
    };
    let data = null;
    try {
      if (contact.user_type === "UC") {
        const response = (
          await connectionCommonUser.get("/find-users", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              search: contact.email,
              researcher: userEmail,
            },
          })
        ).data;
        console.log("Response", response);
        data = response[0];
      } else {
        const response = (
          await connectionEnterpriseUser.get("/find-users", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              search: contact.email,
              researcher: userEmail,
            },
          })
        ).data;
        console.log("Response", response);
        data = response[0];
      }
    } catch (error) {
      // console.error('An error occurred while fetching users profile pictures');
      // console.error(error);
      handleRequestError(error);
    }

    if (data) {
      cont.profile_picture = data.imageUrl ? data.imageUrl : null;
      cont.username = data.username ? data.username : "Username";
    } else {
      cont.profile_picture = null;
      cont.username = "Username";
    }

    return cont;
  };

  const sendMessage = (msg) => {
    console.log("Sending message");
    console.log("Contacts:", contacts);
    const message = {
      sender_email: msg.sender_email,
      receiver_email: msg.receiver_email,
      sender_username: msg.sender_username,
      receiver_username: msg.receiver_username,
      sender_user_type: userType,
      receiver_user_type: msg.receiver_user_type,
      message: msg.message,
      sending_date: new Date(),
    };
    console.log("Message sent", message);
    socket.emit("send message", message);
  };

  const chooseContact = (contact) => {
    console.log("Choosing contact");
    console.log(contact);
    console.log(contacts);
    console.log(allMessages);

    for (let i = 0; i < allMessages.length; i++) {
      if (allMessages[i].contact_email === contact.email) {
        setMessagesDisplayed(() => {
          return {
            ...allMessages[i],
            contact_profile_picture: contact.profile_picture,
          };
        });
        setChosenContact(() => contact.username);
        break;
      }
    }
  };

  const handleRequestError = (error) => {
    console.error("Entering handleRequestError");
    let msg = "";
    if (error.response) {
      msg = error.response.data.message;
      if (error.response.data.name === "TokenExpiredError")
        jwtExpirationHandler();
    } else if (error.request) {
      msg = `Error while trying to access server: ${error.request}`;
    }
    console.log(msg);
  };

  return (
    <div id="chatbox-component" className="chat-box">
      {loading ? (
        <Loading show={loading} msg="Loading Chat Service" />
      ) : inoperant ? (
        <InoperantMessage />
      ) : (
        <div className="flex flex-row h-full">
          <Contacts
            contacts={contacts}
            setSearching={setSearching}
            chooseContact={chooseContact}
          />
          <MessagesD
            chosenContact={chosenContact}
            contactMessages={messagesDisplayed}
            userInfo={userInfo}
            userEmail={userEmail}
            userType={userType}
            userUsername={userUsername}
            sendMessage={sendMessage}
          />
        </div>
      )}
      <SearchBox
        searching={searching}
        setSearching={setSearching}
        token={token}
        userEmail={userEmail}
        userUsername={userUsername}
        contacts={contacts}
        sendMessage={sendMessage}
        handleRequestError={handleRequestError}
      />

      {/* Messages and confirmation parts */}

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
        theme="dark"
      />

      <ConfirmDialog />
    </div>
  );
};

const InoperantMessage = () => {
  return (
    <div className="inoperant-message">
      <img width="auto" height="50%" src="/images/error-icon-32.png" />
      <h1 style={{ fontSize: "calc(45px + 1vw)" }}>
        Chat Service is not available for now
      </h1>
      <h3 className="mt-4" style={{ fontSize: "calc(15px + 1vw)" }}>
        Please try again later
      </h3>
    </div>
  );
};

const Contacts = ({ contacts, setSearching, chooseContact }) => {
  useEffect(() => {
    console.log("Contacts mounted");
    console.log("Contacts:", contacts);
  }, []);

  const buildContacts = () => {
    return (
      <div>
        {contacts.map((contact) => {
          return (
            <div
              key={contact.email}
              className="flex flex-row align-items-center "
            >
              <button
                id={`contact-${contact.email}`}
                className="contact-button"
                onClick={() => chooseContact(contact)}
              >
                <div className="mr-3">
                  {verifyImageValidity(
                    {
                      type: contact.user_type,
                      profile_picture: contact.profile_picture,
                    },
                    "35"
                  )}
                </div>
                <nobr>{contact.username}</nobr>
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div id="contacts-component" className="contact-container">
      <h3 style={{ height: "5%" }}>Contacts</h3>
      <div style={{ height: "95%" }}>
        <div className="contact-box">{buildContacts()}</div>
        <div
          className="flex flex-row align-items-end"
          style={{ height: "10%" }}
        >
          <button
            id="add-contact-btn"
            className="dbuttons dbuttons-primary w-full"
            onClick={() => setSearching(() => true)}
          >
            <i className="pi pi-plus" /> New Chat
          </button>
        </div>
      </div>
    </div>
  );
};

const MessagesD = ({
  chosenContact,
  contactMessages,
  userEmail,
  userType,
  userInfo,
  userUsername,
  sendMessage,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const scrollabelRef = useRef(null);

  useEffect(() => {
    console.log("MessagesD mounted");
    console.log("Contact Messages:", contactMessages);
  }, []);

  useEffect(() => {
    console.log("MessagesD mounted");
    console.log("Contact Messages:", contactMessages);
    if (contactMessages) {
      setMessages(() => contactMessages.messages);
    }
  }, [contactMessages]);

  useEffect(() => {
    if (scrollabelRef.current) {
      scrollabelRef.current.scrollTop = scrollabelRef.current.scrollHeight;
    }
  }, [messages]);

  const buildMessages = () => {
    return (
      <div id="messages-showbox" ref={scrollabelRef}>
        {messages.map((message, index, messages) => {
          const isSenderTheUser = userEmail === message.sender_email;
          const differentiateDates = () => {
            if (index === messages.length - 1) return true;
            const previousDate = new Date(
              messages[index + 1].sending_date
            ).toLocaleDateString();
            const currentDate = new Date(
              message.sending_date
            ).toLocaleDateString();
            return previousDate !== currentDate;
          };
          return (
            <div key={index}>
              {differentiateDates() ? (
                <div className="date-box">
                  <div className="date-line">
                    {new Date(message.sending_date).toLocaleDateString()}
                  </div>
                </div>
              ) : null}
              <div
                className={
                  isSenderTheUser
                    ? "message-line-sender"
                    : "message-line-receiver"
                }
              >
                <div
                  className={
                    isSenderTheUser
                      ? "message-line-sender-box"
                      : "message-line-receiver-box"
                  }
                >
                  <div>
                    {isSenderTheUser ? (
                      <div className="flex flex-row justify-content-end mb-2">
                        <div className="flex flex-row align-items-center">
                          <div className="mr-2">
                            {verifyImageValidity(
                              {
                                type: userType,
                                profile_picture: userInfo.imageUrl,
                              },
                              "25"
                            )}
                          </div>
                          <b>You</b>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-row justify-content-start mb-2">
                        <div className="flex flex-row align-items-center">
                          <div className="mr-2">
                            {verifyImageValidity(
                              {
                                type: contactMessages.contact_type,
                                profile_picture:
                                  contactMessages.contact_profile_picture,
                              },
                              "25"
                            )}
                          </div>
                          <b>{chosenContact}</b>
                        </div>
                      </div>
                    )}
                  </div>
                  <p>{message.message}</p>
                  <div
                    className={
                      "flex flex-row " +
                      (isSenderTheUser
                        ? "justify-content-start"
                        : "justify-content-end")
                    }
                    style={{
                      color: "white",
                    }}
                  >
                    {new Date(message.sending_date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="message-container">
      <h3 style={{ height: "5%" }}>
        {chosenContact === "" ? "Messages" : chosenContact}
      </h3>
      <div style={{ height: "95%" }}>
        {messages.length !== 0 ? (
          <div style={{ height: "100%" }}>
            <div className="message-box">{buildMessages()}</div>
            <div
              className="flex flex-row align-items-center justify-content-center"
              style={{
                width: "100%",
                height: "20%",
              }}
            >
              <div style={{ width: "100%", maxWidth: "calc(500px + 10vw)" }}>
                <InputEmoji
                  id="message-input"
                  value={newMessage}
                  onChange={setNewMessage}
                  onEnter={() => {
                    sendMessage({
                      sender_email: userEmail,
                      receiver_email: contactMessages.contact_email,
                      sender_username: userUsername,
                      receiver_username: contactMessages.contact_username,
                      receiver_user_type: contactMessages.contact_type,
                      message: newMessage,
                    });
                  }}
                  placeholder="Type your message and press enter"
                  cleanOnEnter
                  shouldReturn
                  height={40}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-column justify-content-center align-items-center h-full">
            <img width="auto" height="50%" src="/images/chat-image.png" />
            <h1 style={{ fontSize: "calc(15px + 1.5vw)" }}>
              Start a conversation now
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

const SearchBox = ({
  token,
  userEmail,
  userUsername,
  searching,
  setSearching,
  contacts,
  sendMessage,
  handleRequestError,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);

  const searchUsers = async () => {
    setLoading(() => true);
    setNoResults(() => false);
    if (searchTerm === "") {
      setNoResults(() => true);
      setLoading(() => false);
      return;
    }
    const fetchUsers = async () => {
      let UEs = [];
      let UCs = [];

      try {
        UCs = (
          await connectionCommonUser.get("/find-users", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              search: searchTerm,
              researcher: userEmail,
            },
          })
        ).data;
        UEs = (
          await connectionEnterpriseUser.get("/find-users", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              search: searchTerm,
              researcher: userEmail,
            },
          })
        ).data;
      } catch (error) {
        console.error("An error occurred while fetching users");
        console.error(error);
        handleRequestError(error);
      }

      console.log("UCs:", UCs);
      console.log("UEs:", UEs);

      return { UCs, UEs };
    };

    const formatResponses = (UEs, UCs) => {
      const users = [];

      console.log("Contacts:", contacts);
      for (let i = 0; i < UEs.length; i++) {
        let alreadyInContacts = false;
        for (let j = 0; j < contacts.length; j++) {
          if (UEs[i].email_comercial === contacts[j].email) {
            alreadyInContacts = true;
            break;
          }
        }
        if (!alreadyInContacts) {
          users.push({
            username: UEs[i].username ? UEs[i].username : "Username",
            email: UEs[i].email_comercial,
            name: UEs[i].razao_social,
            profile_picture: UEs[i].imageUrl,
            type: "UE",
          });
        }
      }

      for (let i = 0; i < UCs.length; i++) {
        let alreadyInContacts = false;
        for (let j = 0; j < contacts.length; j++) {
          if (UCs[i].email === contacts[j].email) {
            alreadyInContacts = true;
            break;
          }
        }
        if (!alreadyInContacts) {
          users.push({
            username: UCs[i].username ? UCs[i].username : "Username",
            email: UCs[i].email,
            name: UCs[i].fullName,
            profile_picture: UCs[i].imageUrl,
            type: "UC",
          });
        }
      }

      return users;
    };

    const { UCs, UEs } = await fetchUsers();
    const users = formatResponses(UEs, UCs);

    console.log("Users", users);

    if (users.length === 0) {
      setNoResults(() => true);
    }

    setSearchResults(() => users);
    setLoading(() => false);
    setSearchTerm(() => "");
  };

  const resetSearch = () => {
    setSearchTerm(() => "");
    setSearchResults(() => []);
    setNoResults(() => false);
    setSearching(() => false);
  };

  return (
    <Dialog
      className="search-box"
      visible={searching}
      onHide={() => {
        if (!searching) return;

        resetSearch();
      }}
      closable={true}
      pt={{
        closeButton: { className: "search-box-close-btn" },
      }}
    >
      <h3>Search for Users</h3>
      <Divider />
      <div className="p-inputgroup">
        <span className="p-inputgroup-addon">
          <i className={loading ? "pi pi-spin pi-spinner" : "pi pi-search"} />
        </span>
        <InputText
          id="chat-search-users-input"
          value={searchTerm}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchUsers();
            }
          }}
          onChange={(e) => {
            setSearchTerm(() => e.target.value);
          }}
        />
        <Button
          id="chat-search-users-btn"
          className="dbuttons dbuttons-primary ml-3 pr-5 pl-4"
          label="Search"
          onClick={searchUsers}
        />
      </div>
      <div className="m-3">
        {noResults ? (
          <div className="flex flex-row justify-content-center mt-3">
            <h3>No results found</h3>
          </div>
        ) : null}
        {searchResults.length > 0 ? (
          <SearchResultsBox
            searchResults={searchResults}
            userEmail={userEmail}
            userUsername={userUsername}
            sendMessage={sendMessage}
            resetSearch={resetSearch}
          />
        ) : null}
      </div>
    </Dialog>
  );
};

const SearchResultsBox = ({
  userEmail,
  userUsername,
  searchResults,
  sendMessage,
  resetSearch,
}) => {
  useEffect(() => {
    console.log("SearchResults mounted");
    console.log("SearchResults:", searchResults);
  }, []);

  return (
    <div className="search-result-box">
      {searchResults.map((user) => {
        return (
          <SearchResults
            key={user.email}
            user={user}
            userEmail={userEmail}
            userUsername={userUsername}
            sendMessage={sendMessage}
            resetSearch={resetSearch}
          />
        );
      })}
    </div>
  );
};

const SearchResults = ({
  user,
  userEmail,
  userUsername,
  sendMessage,
  resetSearch,
}) => {
  const [sendFirstMessage, setSendFirstMessage] = useState(false);
  const [firstMessage, setFirstMessage] = useState("");
  const [erro, setErro] = useState(false);

  const mountFirstMessageButton = useTransition(sendFirstMessage, {
    from: { opacity: 0, transform: "scale(0)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0)" },
    config: { duration: 400 },
  });

  const send = () => {
    if (firstMessage === "") {
      setErro(() => true);
      return;
    }
    sendMessage({
      sender_email: userEmail,
      receiver_email: user.email,
      sender_username: userUsername,
      receiver_username: user.username,
      receiver_user_type: user.type,
      message: firstMessage,
    });
    resetSearch();
  };
  useEffect(() => {
    if (firstMessage !== "") {
      setErro(() => false);
    }
  }, [firstMessage]);
  return (
    <div key={user.email} className="search-results default-border-image">
      <div>
        <div className="flex flex-row align-items-center mb-2">
          <div className="mr-3">{verifyImageValidity(user, "50")}</div>
          <h1>
            <b>{user.username}</b>
          </h1>
        </div>
        <div className="mb-2">
          <b>E-mail:</b>
          <div>{user.email}</div>
        </div>
        <div className="mb-3">
          {user.type === "UE" ? <b>Corporate Name: </b> : <b>Full Name: </b>}
          <div>{user.name}</div>
        </div>
      </div>
      <div className="flex flex-row justify-content-center mb-2">
        {sendFirstMessage ? (
          <button
            id="cancel-first-message-btn"
            className="cancel-button"
            onClick={() => setSendFirstMessage(() => false)}
          >
            Cancel
          </button>
        ) : (
          <button
            id="iniciate-chat-btn"
            className="iniciate-chat-button"
            onClick={() => setSendFirstMessage(() => true)}
          >
            Start Chat
          </button>
        )}
      </div>
      {mountFirstMessageButton(
        (styles, item) =>
          item && (
            <animated.div id="first-message-component" style={styles}>
              <div className="first-message-box">
                <h3 className="text-center">Send your first Message</h3>
                <div className="flex flex-row justify-content-center">
                  <InputEmoji
                    id="first-message-input"
                    value={firstMessage}
                    onChange={(value) => {
                      setFirstMessage(value);
                      setErro(false);
                    }}
                    onEnter={() => send()}
                    placeholder="Enter your message"
                    shouldReturn
                    border={"5px"}
                    background="transparent"
                    color="white"
                    borderColor={erro ? "red" : "white"}
                  />
                </div>
                {erro && (
                  <div
                    className="flex justify-content-center "
                    style={{ color: "red" }}
                  >
                    Please enter a message
                  </div>
                )}
                <div className="flex flex-row justify-content-center">
                  <button
                    className="iniciate-chat-button mt-3"
                    onClick={() => send()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </animated.div>
          )
      )}
    </div>
  );
};

export default ChatBox;
