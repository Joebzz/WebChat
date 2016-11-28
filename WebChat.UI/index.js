import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Pusher from "pusher-js";

const baseUrl = 'http://localhost:50811/';

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

const ChatImage = ({ imageUrl }) => (
    <img src={imageUrl} width='50' className='avatar' />
);

const ChatMessage = ({ message, username }) => (
    <li className='chat-message-li'>        
        <ChatImage imageUrl={'./img/profiles/'+ username +'.png'} /><strong>{username}: </strong> {message}
    </li>
);

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

const App = React.createClass({
    getInitialState() {
        return {
            Username: GetQueryString('uid'),
            messages: []
        }
    },

    componentDidMount() {
        axios
            .get(`${baseUrl}/api/messages`)
            .then(response => {
                this.setState({
                    messages: response.data
                });
                var pusher = new Pusher('44ecadbee9e7be8c5ffe', {
                    encrypted: true
                });
                var chatRoom = pusher.subscribe('messages');
                chatRoom.bind('new_message', message => {
                    this.setState({
                        messages: this.state.messages.concat(message)
                    });
                });
            });
    },

    sendMessage(messageText) {
        axios
            .post(`${baseUrl}/api/messages`, {
                text: messageText,
                Username: this.state.Username
            })
            .catch(() => alert('Something went wrong :('));
    },

    render() {
        // check if the username is set properly before displaying the chat list and send button, display error instead
        if (this.state.Username === null) {
            return <div className='error'>Error: No uid found in QueryString, add username by adding uid parameter e.g. ?uid=user1.</div>;
        } else {
            return <Chat messages={this.state.messages} onSubmit={this.sendMessage} userName={this.state.Username} />;
        }   
    }
});

ReactDOM.render(<App />, document.getElementById("app"));