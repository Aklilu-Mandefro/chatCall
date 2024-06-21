const mongoose = require("mongoose");
const express = require('express');
const fileUpload = require('express-fileupload');
const dotenv = require("dotenv");
const app = require("./auth");
const Msg = require("./models/messagesModel");
const Contact = require('./models/contactModel');
const Groups = require('./models/groupModel');
const groupMsg = require('./models/groupMessageModel');
const GroupUsers = require('./models/groupUserModel');
var fs = require('fs');
var bodyParser = require('body-parser');
var request = require('request');
const users = {};
const path = require('path');
const {
  UserEmailMatch,
  contactEmail,
  contactListByUserId,
  contactList,
  searchContactData,
  lastMsg,
  contactDelete,
  allMessageDelete,
  allSenderMessageDelete,
  messageSearchData,
  receiverData,
  sendUnreadMsg,
  receiverMessage,
  messageUpdate,
  EditlastMsg,
  userJoin,
  userMessage,
  updateUnreadMsg,
  groupById,
  groupContactsList,
  groupData,
  messageDelete,
  searchGroupData,
  groupSearchData,
  unreadGroupUser,
  updateUnreadGroupUser,
  groupsMessage,
  groupMessageUpdate,
  contactListByUser,
  updateUnreadGroupMessage,
  updateAllUnreadGroupMessage,
  groupFileDelete,
  groupDelete,
  groupMemberDelete,
  groupMsgDelete,
  groupDeleteMember,
  deleteGroupUser,
  allGroupMessageDelete,
  singleGroupMessageDelete,
  groupSenderMessage,
  currentUser,
  userNameUpdate,
  receiverNameUpdate,
  groupNameUpdate,
  notificationUpdate,
  notificationMutedUpdate,
  profileUpdate,
  userLeave
} = require('./utils/users');
const { log } = require("console");
dotenv.config({ path: "./config.env" });

/* ---------for Local database connection---------- */
//const DB = process.env.DATABASE_LOCAL;

/*--------for Atlas database connection----------*/
const DB = process.env.DATABASE.replace(
"<password>",
process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true
  })
  .then((con) => console.log("DB connection Succeful!"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Socket
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use(express.static(__dirname + "/public"));

const activeUsers = new Set();

// **************** * / video call functionality ************************
let vausers = [];
function findUser(username) {
  for (let i = 0; i < vausers.length; i++) {
    if (vausers[i].username == username)
      return vausers[i]
  }
}
// **************** * / video call functionality ************************

io.on("connection", (socket) => {
  console.log("new user Connected...");

  //**************** */ video call functionality ************************
  socket.on('isbusy', (rid) => {
    for (const key in users) {
      if (rid == users[key]) {
        io.to(key).emit("itbusy");
      }
    }
  })

  socket.on('cutphone', (uid) => {
    for (const key in users) {
      if (uid == users[key]) {
        io.to(key).emit("cutphoness");
      }
    }
  })

  socket.on('cutanswerd', (rsid) => {
    for (const key in users) {
      if (rsid == users[key]) {
        io.to(key).emit("cutpeeranswer");
      }
    }
  })

  socket.on('answerd', (rspid, ctype) => {
    for (const key in users) {
      if (rspid == users[key]) {
        io.to(key).emit("answered", rspid, ctype);
      }
    }
  })

  socket.on('ringcall', (uid, scid, name, image, ctype) => {
    for (const key in users) {
      if (uid == users[key]) {
        io.to(key).emit("ringcalling", uid, scid, name, image, ctype)
      }
    }

  })

  socket.on('vccallmsg', (message) => {
    const data = JSON.parse(message)
    const user = findUser(data.username)

    switch (data.type) {
      case "store_user":
        if (user != null) {
          return
        }
        const newUser = {
          conn: socket.id,
          username: data.username
        }
        vausers.push(newUser)
        break
      case "store_offer":
        if (user == null)
          return
        user.offer = data.offer
        break
      case "store_candidate":
        if (user == null) {
          return
        }
        if (user.candidates == null)
          user.candidates = []
        user.candidates.push(data.candidate)
        break
      case "send_answer":
        if (user == null) {
          return
        }
        sendData({
          type: "answer",
          answer: data.answer
        }, user.conn)
        break
      case "send_candidate":
        if (user == null) {
          return
        }

        sendData({
          type: "candidate",
          candidate: data.candidate
        }, user.conn)
        break
      case "join_call":
        if (user == null) {
          return
        }

        sendData({
          type: "offer",
          offer: user.offer
        }, socket.id)
        user.candidates.forEach(candidate => {
          sendData({
            type: "candidate",
            candidate: candidate
          }, socket.id)
        })
        break
    }
  })

  socket.on('closevc', (sameid) => {
    for (const key in users) {
      if (sameid == users[key]) {
        io.to(key).emit("cutvc");
      }
    }
    vausers.forEach(user => {
      if (user.conn == socket.id) {
        vausers.splice(vausers.indexOf(user), 1)
        return
      }
    })
  })

  function sendData(data, conn) {
    io.to(conn).emit('getingonmsgs', JSON.stringify(data))
  }

  //**************** */ video call functionality ************************
  /* Contacts */
  // Contacts List
  socket.on('editandupdate', function (userid) {
    contactList(userid).then((contacts) => {
      contacts.forEach(contact => {
        for (const key in users) {
          if (contact.created_by == users[key]) {
            io.to(key).emit('contactsLists', { contacts: contacts });
          }
        }
      });
    });
  });

  socket.on("contactList", function ({ name, email, userEmail, created_by, username }) {
    UserEmailMatch(email, created_by).then((emailData) => {
      if (emailData != null) {
        if (emailData.email != userEmail) {
          contactEmail(email, created_by).then((contactData) => {
            if (contactData == null) {
              var user_id = emailData._id;
              let contact_list = [{ 'name': name, 'email': email, 'user_id': user_id, 'created_by': created_by }, { 'name': username, 'email': userEmail, 'user_id': created_by, 'created_by': user_id }];
              io.to(socket.id).emit("Success", { 'msg': 'Contact added successfully' });
              contact_list.forEach(async element => {
                const contact = new Contact(element);
                contact.save({ validateBeforeSave: false }).then(() => {
                  contactList(contact.created_by).then((contacts) => {
                    contacts.forEach(contact => {
                      for (const key in users) {
                        if (contact.created_by == users[key]) {
                          io.to(key).emit('contactsLists', { contacts: contacts });
                        }
                      }
                    });
                  });

                  userJoin(contact.created_by).then((res) => {
                    for (const key in users) {
                      if (contact.created_by == users[key]) {
                        io.to(key).emit('roomUsers', { users: res });
                      }
                    }
                  });
                  setTimeout(() => {
                    contactList(contact.created_by).then((contacts) => {
                      contacts.forEach(contact => {
                        for (const key in users) {
                          if (contact.created_by == users[key]) {
                            io.to(key).emit('contactsLists', { contacts: contacts });
                          }
                        }
                        lastMsg(contact.created_by, element.user_id).then((res) => {
                          for (const key in users) {
                            if (contact.created_by == users[key]) {
                              io.to(key).emit('isMessage', { messages: res });
                            }
                          }
                        });
                      });
                    });
                  }, 100);

                });

                if (contact.created_by == created_by) {
                  var receiver_id = contact.user_id;
                  var sender_id = contact.created_by;
                }
                else {
                  var receiver_id = contact.user_id;
                  var sender_id = contact.created_by;
                }

                const message = 'Hii';
                const file_upload = '';
                const msg = new Msg({ message, sender_id, receiver_id, file_upload });
                msg.save({ ValidityState: false }).then(() => { });
              });
            }
            else {
              io.to(socket.id).emit("contactsError", { 'msg': 'email allredy exists' });
            }
          });
        }
        else {
          io.to(socket.id).emit("contactsError", { 'msg': 'Please use valid email' });
        }
      }
      else {
        io.to(socket.id).emit("contactsError", { 'msg': 'Email not matched' });
      }
    });
  });

  // Con tact List search
  socket.on('searchContactValue', ({ searchVal, userId }) => {
    searchContactData(searchVal, userId).then((contacts) => {
      io.to(socket.id).emit('contactsLists', {
        contacts: contacts
      });
    });
  });

  // User Id Wise Contact Get
  socket.on("userContact", function ({ userId }) { });

  // Delete Contact
  socket.on('contact_delete', ({ contact_id, receiverId, userId }) => {
    contactDelete(receiverId, userId).then((message) => { });
    allMessageDelete(receiverId).then((message) => { });
    allSenderMessageDelete(receiverId).then((message) => { });
    for (const key in users) {
      if (receiverId == users[key]) {
        io.to(key).emit("contact_delete", ({ contact_id, receiverId, userId }))
      }
    }
  });

  // All Message Delete
  socket.on('all_Message_delete', ({ receiverId, userId }) => {
    allMessageDelete(receiverId, userId).then((message) => { });
    for (const key in users) {
      if (receiverId == users[key]) {
        io.to(key).emit("all_Message_delete", ({ receiverId, userId }))
      }
    }
  });

  /**
   * Single Chat
   */
  // Single Message Search
  socket.on('messageSearchValue', ({ searchVal, userId, receiverId }) => {
    messageSearchData(searchVal, userId, receiverId).then((message) => {
      io.to(socket.id).emit('userMessage', {
        users: message
      });
    });
  });

  // Message Create
  socket.on("chat message", function ({ message, sender_id, receiver_id, file_upload, flag }) {
    const single_message = new Msg({ message, sender_id, receiver_id, file_upload, flag });
    single_message.save().then(() => {
      createdAt = single_message.createdAt;
      id = single_message._id;
      receiverData(sender_id).then((receiverData) => {
        const receiverName = receiverData.name;
        const receiverImage = receiverData.image;
        let myid;
        for (const key in users) {
          if (receiver_id == users[key]) {
            myid = sender_id;
            io.to(key).emit("chat message", ({ id, message, sender_id, receiver_id, file_upload, createdAt, receiverName, receiverImage, myid, flag }));
          }
          if (sender_id == users[key]) {
            myid = receiver_id;
            io.to(key).emit("chat message", ({ id, message, sender_id, receiver_id, file_upload, createdAt, receiverName, receiverImage, myid, flag }));
          }
        }
      });

      Contact.findOneAndUpdate({ "user_id": sender_id }, { "last_msg_date": createdAt }, { new: true }).then((res) => {
        return res;
      });
      Contact.findOneAndUpdate({ "user_id": receiver_id }, { "last_msg_date": createdAt }, { new: true }).then((res) => {
        return res;
      });

      receiverMessage(receiver_id).then((message) => {
        io.to(socket.id).emit('receiverMessageInfo', { users: message });
      });
    });

  });

  // Message Update
  socket.on("message_update", ({ messageId, message, receiverId, userId, flag }) => {
    messageUpdate(messageId, message, flag).then((message) => {
    });
    for (const key in users) {
      if (receiverId == users[key]) {
        io.to(key).emit("message_update", ({ messageId, message, receiverId, userId, flag }))
      }
    }

    EditlastMsg(userId, receiverId).then((res) => {
      io.to(socket.id).emit('isMessage', { messages: res });
      for (const key in users) {
        if (receiverId == users[key]) {
          io.to(key).emit('isMessage', { messages: res });
        }
      }
    });

  });

  // Receiver id wise data get
  socket.on("receiverId", function ({ receiver_id }) {
    receiverData(receiver_id).then((message) => {
      io.emit('receiver_data', {
        users: message
      });
    });
  });

  // Contact id wise User get
  socket.on("contactByUser", function ({ id, userId }) {
    contactListByUserId(id, userId).then((contacts) => {
      io.to(socket.id).emit('contactInfo', {
        contacts: contacts
      });
    });
  });

  // User Id Wise contact Get
  socket.on('userData', ({ userId }) => {
    userJoin(userId).then((res) => {
      io.to(socket.id).emit('roomUsers', {
        users: res
      });
    });
    contactList(userId).then((contacts) => {
      io.to(socket.id).emit('contactsLists', {
        contacts: contacts
      });
      contacts.forEach(element => {
        lastMsg(userId, element.user_id).then((res) => {
          io.to(socket.id).emit('isMessage', {
            messages: res
          });
        });
      });
    });
  });

  // contact list to topbar
  socket.on("chat_online", function ({ id }) {
    var online = 0;
    for (const key in users) {
      if (id == users[key]) {
        online = 1;
      }
    }
    io.to(socket.id).emit("onlineUser", ({ online }));
  });

  // contact wise sender and receiver message
  socket.on('userClick', async ({ id, userId, receiverId, startm }) => {
    let cnt = await Msg.find({ $or: [{ sender_id: id }, { receiver_id: id }] }).count();
    if (startm == 0) {
      userMessage(id, userId, receiverId, startm, cnt).then((message) => {
        io.to(socket.id).emit('userMessage', {
          msgno: cnt,
          users: message
        });
      });

      var unread = 1;
      updateUnreadMsg(id, unread).then((message) => {
      });

      receiverMessage(id).then((message) => {
        io.to(socket.id).emit('receiverMessageInfo', {
          users: message
        });
      });
    } else {
      userMessage(id, userId, receiverId, startm, cnt).then((message) => {
        io.to(socket.id).emit('chat-pg', {
          users: message
        });
      });
    }
  });

  //-------------------- Unread Msg Update -----------------------//
  socket.on('unreadMsgUpdate', async ({ receiver_Id, unread }) => {
    updateUnreadMsg(receiver_Id, unread).then((message) => { });
  })

  // Single Message Typing Set
  socket.on("typing", function (data) {
    for (const key in users) {
      if (data.receiverId == users[key]) {
        io.to(key).emit("typing", data);
      }
    }
    groupById(data.receiverId).then((group) => {
      group.forEach(gu => {
        for (const key in users) {
          if (gu.contact_id == users[key]) {
            if (key != socket.id) { io.to(key).emit("typing", data); }
          }
        }
      });
    });
  });

  // Group Typing Set
  socket.on("group_typing", function (data) {
    for (const key in users) {
      if (data.receiverId == users[key]) {
        io.to(key).emit("group_typing", data);
      }
    }
    groupById(data.receiverId).then((group) => {
      group.forEach(gu => {
        for (const key in users) {
          if (gu.contact_id == users[key]) {
            if (key != socket.id) { io.to(key).emit("group_typing", data); }
          }
        }
      });
    });
  });

  // Single Message Delete
  socket.on('message_delete', ({ message_id, receiverId, userId, flag }) => {
    messageDelete(message_id, flag).then((message) => { });
    for (const key in users) {
      if (receiverId == users[key]) {
        io.to(key).emit("message_delete", ({ message_id, receiverId, userId }))
      }
    }
    contactList(userId).then((contacts) => {
      io.to(socket.id).emit('contactsLists', {
        contacts: contacts
      });
      contacts.forEach(element => {
        lastMsg(userId, element.user_id).then((res) => {
          io.to(socket.id).emit('isMessage', { messages: res });
          for (const key in users) {
            if (receiverId == users[key]) {
              io.to(key).emit('isMessage', { messages: res });
            }
          }
        });
      });
    });
  });

  /**
   * Group Message
   */
  // Group Search
  socket.on('searchGroupValue', ({ searchVal, userId }) => {
    searchGroupData(searchVal, userId).then((contacts) => {
      io.to(socket.id).emit('groupLists', {
        groups: contacts
      });
    });
  });

  // Single Group Message Search
  socket.on('groupSearchValue', ({ searchVal, receiverId }) => {
    groupSearchData(searchVal, receiverId).then((message) => {
      io.to(socket.id).emit('groupMessage', {
        groups: message
      });
    });
  });

  // Group Create
  socket.on("createGroups", function ({ name, description, contact_list, userId }) {
    const groups = new Groups({ name, description, userId });
    groups.save().then(() => {
    });

    let grp_id = groups._id;
    contact_list.forEach(con => {
      for (const key in users) {
        if (con == users[key]) {
          io.to(key).emit("group-add", ({ grp_id, name, description, userId, contact_list }));
        }
      }
    });
    io.to(socket.id).emit("group-add", ({ grp_id, name, description, userId, contact_list }));
    var group_id = groups._id;
    contact_list.forEach(contact_id => {
      const groupUsers = new GroupUsers({ contact_id, group_id });
      groupUsers.save().then(() => { });
    });
    var contact_id = userId;
    var is_admin = 1;
    const groupUsers1 = new GroupUsers({ contact_id, group_id, is_admin });
    groupUsers1.save().then(() => {
    });
  });

  // Group Message Create
  socket.on("group message", function ({ message, sender_id, group_id, file_upload }) {
    const groupMessage = new groupMsg({ message, sender_id, group_id, file_upload });
    groupMessage.save().then(() => {
      id = groupMessage._id;
      createdAt = groupMessage.createdAt;
      receiverData(sender_id).then((receiverData) => {
        const receiverName = receiverData.name;
        const receiverImage = receiverData.image;
        groupById(group_id).then((group) => {
          group.forEach(gu => {
            for (const key in users) {
              if (gu.contact_id == users[key]) {
                io.to(key).emit("group message", ({ id, message, sender_id, group_id, receiverName, receiverImage, file_upload, createdAt }))
              }
            }
          });
        });
      });
    });

    unreadGroupUser(group_id).then((receiverData) => {
      var info = [];
      for (i = 0; i < receiverData.length; i++) {
        if (receiverData[i]['contact_id'] != sender_id) {
          info[i] = receiverData[i]
        }
      }
      info.forEach(receiver => {
        var unread = receiver.unread + 1;
        updateUnreadGroupUser(receiver.group_id, receiver.contact_id, unread).then((receiverData) => {
        });
      });
    });

    groupsMessage(group_id).then((message) => {
      io.to(socket.id).emit('groupMessage', {
        groups: message
      });
    });
  });

  //-------------------- Unread Group Msg Update -----------------------//
  socket.on('unreadGroupMsgUpdate', async ({ groupId, userId, unread }) => {
    updateUnreadGroupMessage(groupId, userId, unread).then((message) => { });
  })

  // Contact add in group
  socket.on("addGroupContacts", function ({ contact_list, groupId, userId }) {
    contact_list.forEach(contact_id => {
      var group_id = groupId;
      const groupUsers = new GroupUsers({ contact_id, group_id });
      groupUsers.save().then(() => {
        groupById(group_id).then((group) => {
          groupData(group_id).then((groups) => {
            for (const key in users) {
              if (contact_id == users[key]) {
                io.to(key).emit("addGroup", ({ groups }));
              }
            }
          });

          group.forEach(gu => {
            for (const key in users) {
              if (gu.contact_id == users[key]) {
                groupContactsList(group_id, userId).then((groupes) => {
                  io.to(key).emit("groupDetail", ({ groupUsers: groupes, groupId }));
                });
              }
            }
          });
        });
      });
    });
  });

  // group message Update
  socket.on("groupMessage_update", ({ messageId, message, groupId }) => {
    groupMessageUpdate(messageId, message).then((message) => { });
    groupById(groupId).then((group) => {
      group.forEach(gu => {
        for (const key in users) {
          if (gu.contact_id == users[key]) {
            io.to(key).emit("groupMessage_update", ({ messageId, message, groupId }));
          }
        }
      });
    });
  });

  // Get Contact List
  socket.on('contactIdByUser', (userId) => {
    contactListByUser(userId).then((contacts) => {
      io.to(socket.id).emit('groupLists', {
        groups: contacts
      });
    });
  });

  // Group Data Append Topbar
  socket.on('contactsDetail', (groupsId, userId) => {
    groupData(groupsId).then((group) => {
      io.to(socket.id).emit('groupInfo', { group: group });
    });

    let i = 0;
    groupContactsList(groupsId, userId).then((group) => {
      io.to(socket.id).emit('groupDetail', {
        groupUsers: group, groupId: groupsId
      });
      var unread = 0;
      updateUnreadGroupMessage(groupsId, userId, unread).then((group_message) => { });
    });

    groupById(groupsId).then((group) => {
      var online = [];
      group.forEach(gu => {
        for (const key in users) {
          if (gu.contact_id == users[key]) {
            online[i] = gu.contact_id;
            i++;
          }
        }
      });
      io.to(socket.id).emit("onlineContact", ({ online }));
    });
  });

  // Contact Message Get
  socket.on('groupClick', async ({ groupId, userId, startm }) => {

    // Group Info get
    groupById(groupId).then((group) => {
      group.forEach(gu => {
        for (const key in users) {
          if (gu.user_id == users[key]) {
            groupContactsList(groupId, userId).then((groups) => {
              io.to(socket.id).emit("groupDetail", ({ groupUsers: groups, groupId: groupId }));
            });
          }
        }
      });
    });

    if (startm == 0) {
      let cnt = await groupMsg.find({ group_id: groupId }).count();
      groupsMessage(groupId, startm).then((message) => {
        io.to(socket.id).emit('groupMessage', {
          groups: message,
          msgno: cnt
        });
      });
    }
    else {
      groupsMessage(groupId, startm).then((message) => {
        io.to(socket.id).emit('gchat-pg', {
          groups: message,
        });
      });
    }
  });

  // Online User Get
  socket.on("online_user", function (data) {
    groupById(data.groupId).then((group) => {
      group.forEach(gu => {
        for (const key in users) {
          if (gu.contact_id == users[key]) {
            io.to(key).emit("online_user", data);
          }
        }
      });
    });
  });

  // Group Message Delete
  socket.on('group_msg_delete', ({ message_id, groupId }) => {
    groupFileDelete(message_id).then((message) => { });
    groupById(groupId).then((group) => {
      group.forEach(gu => {
        for (const key in users) {
          if (gu.contact_id == users[key]) {
            io.to(key).emit("group_msg_delete", ({ message_id, groupId }));
          }
        }
      });
    });
  });

  // Delete Group
  socket.on('group_delete', ({ id }) => {
    groupDelete(id).then((message) => { });
    groupMemberDelete(id).then((message) => { });
    groupMsgDelete(id).then((message) => { });
    groupById(id).then((group) => {
      group.forEach(gu => {
        for (const key in users) {
          if (gu.contact_id == users[key]) {
            io.to(key).emit("group_delete", ({ id }));
          }
        }
      });
    });
  });

  // Delete Group Member
  socket.on('group_delete_member', ({ id, group_id }) => {
    groupDeleteMember(id, group_id).then((message) => { });
    groupById(group_id).then((group) => {
      group.forEach(gu => {
        for (const key in users) {
          if (gu.contact_id == users[key]) {
            io.to(key).emit("group_delete_member", ({ id, group_id }));
          }
        }
      });
    });
  });

  // Group User Delete
  socket.on('deleteGroupUser', ({ id, group_id }) => {
    groupById(group_id).then((group) => {
      group.forEach(gu => {
        for (const key in users) {
          if (gu.contact_id == users[key]) {
            io.to(key).emit("deleteGroupUser", ({ id, group_id }));
          }
        }
      });
    });
    deleteGroupUser(id, group_id).then((groupUser) => { });
  });

  // All Group Message Delete
  socket.on('all_Group_Message_delete', ({ receiverId }) => {
    allGroupMessageDelete(receiverId).then((message) => { });
    groupById(receiverId).then((group) => {
      var unread = 0;
      updateAllUnreadGroupMessage(receiverId, unread).then((group_message) => { });
      group.forEach(gu => {
        for (const key in users) {
          if (gu.contact_id == users[key]) {
            io.to(key).emit("all_Group_Message_delete", ({ receiverId }));
          }
        }
      });
    });
  });

  // Group Sender Message Delete
  socket.on('single_Group_Message_delete', ({ receiverId, userId }) => {
    groupSenderMessage(receiverId, userId).then((groupSenderMsg) => {
      groupById(receiverId).then((group) => {
        group.forEach(gu => {
          for (const key in users) {
            if (gu.contact_id == users[key]) {
              io.to(key).emit('groupSenderMessage', {
                groupMsgs: groupSenderMsg
              });
            }
          }
        });
      });
    });
    singleGroupMessageDelete(receiverId, userId).then((message) => { });
  });


  /**
   * Setting
   */
  // Current User data
  socket.on("currentUser", function ({ userId }) {
    currentUser(userId).then((userInfo) => {
      io.to(socket.id).emit("currentUser", ({ userInfo }));
    });
  });

  // current user name edit
  socket.on("updateUserName", function ({ userId, name }) {
    userNameUpdate(userId, name).then((userInfo) => {
      io.emit("updateUserName", ({ userInfo }));
    });
  });

  // receiver name edit
  socket.on("updateReceiverName", function ({ userId, receiverId, name }) {
    receiverNameUpdate(userId, receiverId, name).then((userInfo) => { });
  });

  // Group name edit
  socket.on("updateGroupName", function ({ groupId, name }) {
    groupNameUpdate(groupId, name).then((userInfo) => {
      groupById(groupId).then((group) => {
        group.forEach(gu => {
          for (const key in users) {
            if (gu.contact_id == users[key]) {
              io.to(key).emit('updateGroupName', { groupId, name });
            }
          }
        });
      });
    });
  });

  // notification security
  socket.on("userNotification", ({ user_id, notification }) => {
    notificationUpdate(user_id, notification).then((message) => {
    });
  });

  // notification muted security
  socket.on("userMutedNotification", ({ user_id, is_muted }) => {
    notificationMutedUpdate(user_id, is_muted).then((message) => { });
  });

  // Messag Image Upload
  app.post('/fileUploads', (req, res) => {
    if (req.files) {
      const targetFile = req.files.file;
      let uploadDir = path.join(__dirname, '/public/assets/images/image', req.body.fname);
      targetFile.mv(uploadDir, (err) => {
        if (err)
          return res.status(500).send(err);
        res.send('File uploaded!');
      });
    }
  });
  
  app.post('/filedelete', (req, res) => {
    if (req.body.fn) {
      fs.unlinkSync(path.join(__dirname, '/public/assets/images/image', req.body.fn));
    }
  });

  // Profile Upload
  app.post('/profileUpdate', (req, res) => {
    if (req.files) {
      const targetFile = req.files.file;
      profileUpdate(req.body.user_id, targetFile.name).then((message) => { });
      const userid = req.body.user_id;
      const image = targetFile.name;
      io.emit("message_update1", ({ userid, image }));
      let uploadDir = path.join(__dirname, '/public/assets/images/users', targetFile.name);
      targetFile.mv(uploadDir, (err) => {
        if (err)
          return res.status(500).send(err);
        res.send('File uploaded!');
      });
    }
  });

  // User Joined
  socket.on('new-user-joined', (userId, username) => {
    users[socket.id] = userId;
    socket.broadcast.emit('user-connected', userId, username);
    io.emit('user-list', users);
  });

  // User Disconnect
  socket.on("disconnect", () => {
    socket.broadcast.emit('user-disconnected', user = users[socket.id]);
    io.emit("user-list", users[socket.id]);
    userLeave({ id: users[socket.id] })
    delete users[socket.id];
  });

  app.all('*', (req, res, next) => {
    res.status(404).render('404');
  });

});

