# ✍️ chatCall

chatCall is a full-stack application that allows you to send and/ receive instant
message, audio and video calls.

## 💻⚛️🏗️🛠️ Tech-stacks used

- [Node.js](https://nodejs.org/en)
- [EJS](https://ejs.co/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.io](https://socket.io/)
- [Bootstrap5](https://getbootstrap.com/)
- No third-party packages used for audio and video call, but a browser navigator.

## Main Features

- Register and login/logout
- Settings
- One to one or group chat/call
- Create group and add members to it
- search for contacts
- Contact list
- Remove contacts
- Send files (Audio, video, image)
- View online users
- Read and unread new messages from users
- pages Authentication
- Dark and light mode support
- Browser notifications with sound for new message
- On/Off notification sound
- Send, copy, forward, and delete Message
- Search for messages or chats
- clear chats
- Take pictures through webcam
- Update personal profile including profile picture
- Send Emojis
- Authentication using google ReCaptcha
- Resopnsive on all devices

## Getting Started & Installation

### prerequisite

Your hosting server:

1. Must support Node.js and have SSH access.
2. SSL (Secure Sockets Layer) must be installed.

## Installation

1. Install [Node](https://nodejs.org/en/) and npm
2. Fork the project
3. open the project in your favorite code editor
4. Navigate to the `chatCall` directory, then run the following command to install dependencies👇:

   ```bash
   npm install
   ```

5. Configure your MongoDB database. after configuring you will find a mongo URI just put that on your `. env` file MONGO_URI variable.
6. Add your `CAPTCHA_SECRET`, `CAPTCHA_SITEKEY`,`JWT_SECRET`, and other additional variables you want to your `.env` file.
7. Once you successfully connect with MongoDB and configure **.env**, then run `npm start`, it will run the **chatCall** app on local server on http://localhost:2000, if you use 2000 as your port No.

## [Visit the App](https://chatcall.onrender.com/)

<br>

<a href="https://full-stack-chatCall.vercel.app/" target="_blank"><img src="https://i.imgur.com/dHk35tJ.png" alt="chatCall app home page"> </a>

## Issues

If you find any issues while installing or using the app, kindly open an [issue](https://github.com/Aklilu-Mandefro/chatCall/issues) with the tag "enhancement".

**Note:** Make sure you browse through the existing issues to check if the issue already exists.<br>

## How to use chatCall

1. To use chatCall, you have to create an account first. Then, to send a message to or chat with someone, the person(s) you would like to communicate over the chatCall app must have a chatCall acount too.
2. Once you are done with step one, then navigate to `Contacts` from the left center of the app and search for the person you want to chat or call.

## Contribution

Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this app better, please fork the repo and
create a pull request. You can also simply open a [discussions](https://github.com/Aklilu-Mandefro/chatCall/discussions/) or an [issue](https://github.com/Aklilu-Mandefro/chatCall/issues) with the tag "enhancement".

#### Please give this repo a ⭐ if you found it helpful and share it with your friends.
