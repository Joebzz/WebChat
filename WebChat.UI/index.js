import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Pusher from "pusher-js";

// baseUrl is the URL of the API this needs to be changed when moving to production server
// It would be better to move this into a configuration file for easier future changes
const baseUrl = 'http://localhost:50811/';

// Setup the react input form for submitting the message to the chat
// Passes in the function to run onSubmit
const ChatInputForm = ({ onSubmit }) => {
    let messageInput;
    return (
        <form onSubmit = { e => {
            e.preventDefault();
            onSubmit(messageInput.value);
            messageInput.value = "";
        }}>
            <input type = "text" placeholder = "message" ref = { node => {
                messageInput = node; 
            }}/>
            <input type = "submit" value = "Send" / >
        </form>
    );
};


// Create the react chat image element the URL will be passed in and set as the src
const ChatImage = ({ imageUrl }) => (
    <img src={imageUrl} width='50' className='avatar' />
);

// Create the single chat element in the list
// This will also create the image element with the specified <username>.png file from the profiles folder
const ChatMessage = ({ message, username }) => (
    <li className='chat-message-li'>        
        <ChatImage imageUrl={'./img/profiles/'+ username +'.png'} /><strong>{username}: </strong> {message}
    </li>
);

// Creates the list of all the messages returned by the API
const ChatMessageList = ({ messages }) => (
    <ul className='msg-list'>
        {messages.map((message, index) => 
            <ChatMessage 
                key={index} 
                message={message.Text} 
                username={message.Username} /> 
        )}
    </ul>
);

// Creates the Chat panel, this will show a welcome message to the user with there username and include all messages and the input form
const Chat = ({ onSubmit, messages, userName }) => (
    <div>
        <div className='welcome'>Welcome to the chat {userName}!</div>
        <ChatMessageList messages={messages} />
        <ChatInputForm onSubmit={onSubmit}/>
    </div>
);

/// <summary>Returns the query string parameter</summary>
/// <param name="key" type="String">The query string element to search for</param>
function GetQueryString(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

// Create the APP class
const App = React.createClass({
    // The initial state will get the username from the uid parameter passed in via the querystring
    // It will also create empty messages
    getInitialState() {
        return {
            Username: GetQueryString('uid'),
            messages: []
        }
    },

    // This will run automatically when a component is being created and inserted into the DOM
    componentDidMount() {
        // Use axios get funciton to gather the messages from the API
        axios
            .get(`${baseUrl}/api/messages`)
            .then(response => {
                this.setState({
                    messages: response.data //store the response to state.messages
                });
                // Create the pusher object with the key from the pusher app
                var pusher = new Pusher('44ecadbee9e7be8c5ffe', {
                    encrypted: true
                });
                // Subscribe to the messages channel (this will be the same channel as set in the API)
                var chatRoom = pusher.subscribe('messages');
                // Watch the pusher channel for a new_message event (this is the same event name as set on the API)
                chatRoom.bind('new_message', message => {
                    this.setState({
                        messages: this.state.messages.concat(message) // Add the message to the state.messages
                    });
                });
            });
    },

    // This function will run when the submit button is pressed
    // It will post the message input to the API
    sendMessage(messageText) {
        axios
            .post(`${baseUrl}/api/messages`, {
                text: messageText,
                Username: this.state.Username
            })
            .catch(() => alert('Something went wrong :(')); //If either the messageText or state.Username are not set correctly return a generic error
    },

    // render() will create our application for us, it will initially check if our Username is set on the state and warn the user if it is not
    // If the username is set correctly it will creat the list of messages as defined above
    render() {
        // check if the username is set properly before displaying the chat list and send button, display error instead
        if (this.state.Username === null) {
            return <div className='error'>Error: No uid found in QueryString, add username by adding uid parameter e.g. ?uid=user1.</div>;
        } else {
            return <Chat messages={this.state.messages} onSubmit={this.sendMessage} userName={this.state.Username} />;
        }   
    }
});
// Will render the App to the dive with the app id as defined in the index.html file
ReactDOM.render(<App />, document.getElementById("app"));