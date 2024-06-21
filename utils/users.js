const users = [];
const User = require("./../models/userModel");
const Message = require("../models/messagesModel");
const Contact = require("./../models/contactModel");
const Groups = require("./../models/groupModel");
const groupMsg = require("./../models/groupMessageModel");
const GroupUsers = require("./../models/groupUserModel");
const mongoose = require("mongoose");

// Email Match
async function UserEmailMatch(email, created_by) {
  const contact = await User.findOne({ email: email });
  return contact;
}

/**
 * Contact List
 */
// Contact Match
async function contactEmail(email, created_by) {
  const contact = await Contact.findOne({ email: email, created_by: created_by });
  return contact;
}

// Get All Contact User wise
async function contactList(userId) {
  const users = await Contact.aggregate([
    {
      $lookup: {
        from: "users",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$sender_id", "$$userId"] },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 1 },
        ],
        as: "message",
      },
    },
    { $sort: { name: 1 } },
    { $match: { created_by: userId } },
    {
      $project: {
        name: "$name",
        email: "$email",
        user_id: "$user_id",
        created_by: "$created_by",
        userImg: "$user.image",
        createdAt: "$user.createdAt",
        location: "$user.location",
        message: "$message.message",
        file_upload: "$message.file_upload",
        created_at: "$message.createdAt",
      },
    },
  ]);
  return users;
}

// Contact List search
async function searchContactData(name, userId) {
  const users = await Contact.aggregate([
    {
      $lookup: {
        from: "users",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$sender_id", "$$userId"] },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 1 },
        ],
        as: "message",
      },
    },
    { $sort: { name: 1 } },
    { $match: { name: { $regex: name, $options: 'i' }} },
    { $match: { created_by: userId } },
    {
      $project: {
        name: "$name",
        email: "$email",
        user_id: "$user_id",
        created_by: "$created_by",
        userImg: "$user.image",
        createdAt: "$user.createdAt",
        location: "$user.location",
        message: "$message.message",
        file_upload: "$message.file_upload",
        created_at: "$message.createdAt",
      },
    },
  ]);
  return users;
}

// Last Message 
async function lastMsg(userId, receiverId) {
  const contactList = await Message.findOne({ $or: [{ "sender_id": userId, "receiver_id": receiverId }, { "sender_id": receiverId, "receiver_id": userId }] }).sort({ _id: -1 }).limit(1);
  return contactList;
}
// Edit Last Message
async function EditlastMsg(userId, receiverId) {
  const contactList = await Message.findOne({ $or: [{ "sender_id": userId, "receiver_id": receiverId }, { "sender_id": receiverId, "receiver_id": userId }] }).sort({ _id: -1 }).limit(1);
  return contactList;
}

/**
 * Single Chat
 */
// Single Message Search
async function messageSearchData(name, user_id, receiverId) {
  const message = await Message.aggregate([
    {
      $lookup: {
        from: "users",
        let: { senderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
            },
          },
        ],
        as: "matches",
      },
    },
    {
      $match: {
        $and: [{ $or: [{ receiver_id: user_id }, { sender_id: user_id }] }],
      },
    },
    {
      $match: {
        $and: [
          { $or: [{ receiver_id: receiverId }, { sender_id: receiverId }] },
        ],
      },
    },
    { $match:  {message: { $regex: name, $options: 'i' } } },
    { $sort: { _id: -1 } },
    { $limit: 10 },
    {
      $project: {
        message: "$message",
        sender_id: "$sender_id",
        receiver_id: "$receiver_id",
        file_upload: "$file_upload",
        createdAt: "$createdAt",
        user_id: "$matches._id",
        name: "$matches.name",
        image: "$matches.image",
      },
    },
  ]);
  return message;
}

// Receiver Data Get
async function receiverData(id) {
  const receiverData = await User.findById(id);
  return receiverData;
}

// Unread Message Get
async function sendUnreadMsg(receiver_id) {
  const message = await Message.find({ receiver_id: receiver_id, unread: "0" });
  return message;
}

// Receiver Message Get
async function receiverMessage(id) {
  // return message;
  const message = await Message.aggregate([
    {
      $lookup: {
        from: "users",
        let: { senderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
            },
          },
        ],
        as: "matches",
      },
    },
    {
      $match: {
        $and: [{ $or: [{ receiver_id: id }, { sender_id: id }] }],
      },
    },
    {
      $project: {
        message: "$message",
        sender_id: "$sender_id",
        receiver_id: "$receiver_id",
        file_upload: "$file_upload",
        createdAt: "$createdAt",
        user_id: "$matches._id",
        name: "$matches.name",
        image: "$matches.image",
      },
    },
  ]);
  return message;
}

// Message Update
async function messageUpdate(id, message, flag) {
  const message_update = await Message.findByIdAndUpdate(id, { message, flag });
  return message_update;
}

// User Id Wise contact Get
async function userJoin(userId) {
  const users = await Contact.aggregate([
    {
      $lookup: {
        from: "users",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$unread", "0"] },
            },
            $match: {
              $expr: { $eq: ["$sender_id", "$$userId"] },
            },
          },
        ],
        as: "msg",
      },
    },
    { $sort: { msg: -1 } },
    { $match: { created_by: userId } },
    {
      $project: {
        name: "$name",
        email: "$email",
        user_id: "$user_id",
        created_by: "$created_by",
        userImg: "$user.image",
        createdAt: "$user.createdAt",
        location: "$user.location",
        unreadMsg: "$msg.unread",
        last_msg_date: "$last_msg_date"
      }
    },
  ]);
  return users;
}

// contact wise sender and receiver message
async function userMessage(id, user_id, receiverId, startm) {
  const message = await Message.aggregate([
    {
      $lookup: {
        from: "users",
        let: { senderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
            },
          },
        ],
        as: "matches",
      },
    },
    {
      $lookup: {
        from: "contacts",
        let: { nsenderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$user_id", "$$nsenderId"] },
            },
          },
          { $limit: 1 },
        ],
        as: "nmatches",
      },
    },
    {
      $match: {
        $and: [{ $or: [{ receiver_id: id }, { sender_id: id }] }],
      },
    },
    { $sort: { _id: -1 } },
    { $skip: startm },
    { $limit: 10 },
    {
      $project: {
        message: "$message",
        flag: "$flag",
        sender_id: "$sender_id",
        receiver_id: "$receiver_id",
        file_upload: "$file_upload",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        user_id: "$matches._id",
        name: "$nmatches.name",
        image: "$matches.image",
      },
    },
  ]);
  return message;
}

// Update Unread Message
async function updateUnreadMsg(receiver_Id, unread) {
  const message_update = await Message.updateMany(
    { sender_id: receiver_Id },
    { unread }
  );
  return message_update;
}

// Message Update
async function groupData(id) {
  const group_data = await Groups.findById(id);
  return group_data;
}

// Single Message Typing Set
async function groupById(groupsId) {
  const contactList = await GroupUsers.aggregate([
    {
      $lookup: {
        from: "users",
        let: { id: "$contact_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
            },
          },
        ],
        as: "user",
      },
    },
    { $match: { group_id: groupsId } },
    {
      $project: {
        unread: "$unread",
        is_admin: "$is_admin",
        contact_id: "$contact_id",
        group_id: "$group_id",
        name: "$user.name",
        user_id: "$user._id",
      },
    },
  ]);
  return contactList;
}

// Single Message Typing Set
async function groupContactsList(groupsId, userId) {
  const contactList = await GroupUsers.aggregate([
    {
      $lookup: {
        from: "users",
        let: { id: "$contact_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "contacts",
        let: { id: "$contact_id" },
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: ["$user_id", "$$id"] }, { $eq: ["$created_by", userId] }] },
            },
          },
        ],
        as: "contacts",
      },
    },
    { $match: { group_id: groupsId } },
    {
      $project: {
        unread: "$unread",
        is_admin: "$is_admin",
        contact_id: "$contact_id",
        group_id: "$group_id",
        name: "$user.name",
        user_id: "$user._id",
        contactName: "$contacts.name"
      },
    },
  ]);
  return contactList;
}

// Single Message Delete
async function messageDelete(id,flag) {
  // const message_delete = await Message.findByIdAndDelete(id);
  const message_delete = await Message.findByIdAndUpdate(id, { flag });
  return message_delete;
}

/**
 * Group Message
 */
// Group Search
async function searchGroupData(name, userId) {
  const contactList = await GroupUsers.aggregate([
    {
      $lookup: {
        from: "groups",
        let: { id: "$group_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
            },
          },
        ],
        as: "group",
      },
    },
    { $match: { "group.name": { $regex: name, $options: 'i' }} },
    { $match: { contact_id: userId } },
    {
      $project: {
        userId: "$user_id",
        name: "$group.name",
        description: "$group.description",
        userId: "$group.userId",
        group_id: "$group._id",
        unread: "$unread",
        contact_id: "$contact_id",
      },
    },
  ]);
  return contactList;
}

// Single Group Message Search
async function groupSearchData(name, id) {
  const groupMessage = await groupMsg.aggregate([
    {
      $lookup: {
        from: "users",
        let: { senderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
            },
          },
        ],
        as: "matches",
      },
    },
    { $match: { group_id: id } },
    { $match: { message: { $regex: name, $options: 'i' }} },
    { $sort: { _id: -1 } },
    { $limit: 10 },
    {
      $project: {
        message: "$message",
        sender_id: "$sender_id",
        group_id: "$group_id",
        name: "$matches.name",
        image: "$matches.image",
        file_upload: "$file_upload",
        createdAt: "$createdAt",
      },
    },
  ]);
  return groupMessage;
}

// Unread Group User Get
async function unreadGroupUser(groupsId) {
  const unread_user = await GroupUsers.find({ group_id: groupsId });
  return unread_user;
}

// Update Unread Message
async function updateUnreadGroupUser(groupsId, contactId, unread) {
  const message_update = await GroupUsers.updateMany(
    { group_id: groupsId, contact_id: contactId },
    { unread }
  );
  return message_update;
}

// Group Message Get
async function groupsMessage(id, startm = 0) {
  const groupMessage = await groupMsg.aggregate([
    {
      $lookup: {
        from: "users",
        let: { senderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
            },
          },
        ],
        as: "matches",
      },
    },
    { $match: { group_id: id } },
    { $sort: { _id: -1 } },
    { $skip: startm },
    { $limit: 10 },
    {
      $project: {
        message: "$message",
        sender_id: "$sender_id",
        group_id: "$group_id",
        createdAt: "$createdAt",
        name: "$matches.name",
        image: "$matches.image",
        file_upload: "$file_upload",
      },
    },
  ]);
  return groupMessage;
}

// group message Update
async function groupMessageUpdate(id, message) {
  const message_update = await groupMsg.findByIdAndUpdate(id, { message });
  return message_update;
}

// Contact Detail get By User Id
async function contactListByUser(userId) {
  const contactList = await GroupUsers.aggregate([
    {
      $lookup: {
        from: "groups",
        let: { id: "$group_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
            },
          },
        ],
        as: "group",
      },
    },
    { $match: { contact_id: userId } },
    {
      $project: {
        userId: "$user_id",
        name: "$group.name",
        description: "$group.description",
        userId: "$group.userId",
        group_id: "$group._id",
        unread: "$unread",
        contact_id: "$contact_id",
      },
    },
  ]);
  return contactList;
}

// Update All Unread Message Update
async function updateUnreadGroupMessage(groupsId, userId, unread) {
  const message_update = await GroupUsers.updateMany(
    { group_id: groupsId, contact_id: userId },
    { unread }
  );
  return message_update;
}

// Update All Unread Message Update
async function updateAllUnreadGroupMessage(groupsId, unread) {
  const message_update = await GroupUsers.updateMany(
    { group_id: groupsId},
    { unread }
  );
  return message_update;
}

// Remove Group Attached file
async function groupFileDelete(id) {
  const message_delete = await groupMsg.findByIdAndDelete(id);
  return message_delete;
}

// Delete Group Member
async function groupDeleteMember(id, group_id) {
  const group_delete = await GroupUsers.deleteOne({ contact_id: id, group_id: group_id });
  return group_delete;
}

// Delete Group All Member
async function groupMemberDelete(id) {
  const group_delete = await GroupUsers.deleteMany({ group_id: id });
  return group_delete;
}

// Delete Group All Message
async function groupMsgDelete(id) {
  const group_delete = await groupMsg.deleteMany({ group_id: id });
  return group_delete;
}

// Delete Group
async function groupDelete(id) {
  const group_delete = await Groups.findByIdAndDelete(id);
  return group_delete;
}

// Group User Delete
async function deleteGroupUser(id, group_id) {
  const group_user_delete = await GroupUsers.deleteOne({
    contact_id: id,
    group_id: group_id,
  });
  return group_user_delete;
}

// All Group Message Delete
async function allGroupMessageDelete(id) {
  const group_delete = await groupMsg.deleteMany({ group_id: id });
  return group_delete;
}

// Single All Message Delete
async function singleGroupMessageDelete(contactId, groupId) {
  const group_delete = await groupMsg.deleteMany({
    group_id: contactId,
    sender_id: groupId,
  });
  return group_delete;
}

// Single All Message Delete
async function groupSenderMessage(contactId, groupId) {
  const group_msg = await groupMsg.find({ group_id: contactId, sender_id: groupId });
  return group_msg;
}

/**
 * Setting 
 */
// Current User Info
async function currentUser(id) {
  const userInfo = await User.findById(id);
  return userInfo;
}

// current user name edit
async function userNameUpdate(id, name) {
  const message_update = await User.findByIdAndUpdate(id, { name });
  return message_update;
}

// current user name edit
async function receiverNameUpdate(userId, receiverId, name) {
  const message_update = await Contact.updateOne({ "created_by": userId, "user_id": receiverId }, { name });
  return message_update;
}

// Group name Update
async function groupNameUpdate(id, name) {
  const message_update = await Groups.findByIdAndUpdate(id, { name });
  return message_update;
}

// notification security 
async function notificationUpdate(id, notification) {
  const message_update = await User.findByIdAndUpdate(id, { notification });
  return message_update;
}

// notification muted security 
async function notificationMutedUpdate(id, is_muted) {
  const message_update = await User.findByIdAndUpdate(id, { is_muted });
  return message_update;
}

// Profile Upload
async function profileUpdate(id, image) {
  const message_update = await User.findByIdAndUpdate(id, { image });
  return message_update;
}

async function contactListByUserId(userId, created_by) {
  const users = await Contact.aggregate([
    {
      $lookup: {
        from: "users",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
            },
          },
        ],
        as: "user",
      },
    },
    { $match: { user_id: userId } },
    { $match: { created_by: created_by } },
    {
      $project: {
        name: "$name",
        email: "$email",
        user_id: "$user_id",
        created_by: "$created_by",
        userImg: "$user.image",
        createdAt: "$user.createdAt",
        location: "$user.location"
      },
    },
  ]);
  return users;
}

async function lastMessageShow(userId) {
  const messages = await Message.aggregate([
    {
      "$match": {
        "$and": [
          {
            "$or": [
              { receiver_id: userId },
              { sender_id: userId }
            ]
          }
        ]
      }

    },
    {
      $sort: {
        created: -1,
      },
    },
    {
      $group: {
        _id: "$receiver_id",
        message: {
          $last: "$message",
        },
        created: {
          $last: "$createdAt",
        },
      },
    },
    {
      $project: {
        _id: 0,
        from: "$_id",
        message: 1,
        created: 1,
      },
    },
  ]);
  return messages;
}

async function lastMessageShow(userId) {
  const messages = await Message.aggregate([
    {
      $match: {
        $and: [{ $or: [{ receiver_id: userId }, { sender_id: userId }] }],
      },
    },
    {
      $sort: {
        created: -1,
      },
    },
    {
      $group: {
        _id: "$receiver_id",
        message: {
          $last: "$message",
        },
        created: {
          $last: "$createdAt",
        },
      },
    },
    {
      $project: {
        _id: 0,
        from: "$_id",
        message: 1,
        created: 1,
      },
    },
  ]);
  return messages;
}

async function searchData(name, userId) {
  const users = await Contact.aggregate([
    {
      $lookup: {
        from: "users",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$sender_id", "$$userId"] },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 1 },
        ],
        as: "message",
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$unread", "0"] },
            },
            $match: {
              $expr: { $eq: ["$sender_id", "$$userId"] },
            },
          },
        ],
        as: "msg",
      },
    },
    { $sort: { message: -1 } },
    { $match: { name: new RegExp(name) } },
    { $match: { created_by: userId } },
    {
      $project: {
        name: "$name",
        email: "$email",
        user_id: "$user_id",
        created_by: "$created_by",
        userImg: "$user.image",
        createdAt: "$user.createdAt",
        location: "$user.location",
        message: "$message.message",
        file_upload: "$message.file_upload",
        unreadMsg: "$msg.unread",
        created_at: "$message.createdAt",
      },
    },
  ]);
  return users;
}

// Delete Contact
async function contactDelete(receiverId, userId) {
  const contact_delete = await Contact.deleteMany({ "user_id": { $in: [receiverId, userId] }, "created_by": { $in: [userId, receiverId] } });
  return contact_delete;
}

// All Message Delete
async function allMessageDelete(id, uid) {
  const message_delete = await Message.deleteMany({ $or: [{ $and: [{ receiver_id: id }, { sender_id: uid }] }, { $and: [{ sender_id: id }, { receiver_id: uid }] }] });
  return message_delete;
}

// All Sender Message Delete
async function allSenderMessageDelete(id) {
  const message_delete = await Message.deleteMany({ sender_id: id });
  return message_delete;
}

/**
 * Group List
 */
async function groupContactById(contactId) {
  const groupdetail = await User.find({ _id: contactId });
  return groupdetail;
}

async function unreadGroupMessage(groupsId) {
  const group_message = await groupMsg.find({ group_id: groupsId, unread: 0 });
  return group_message;
}

/**
 * Remove Single Message
 */
async function groupMessageDelete(id) {
  const message_delete = await groupMsg.findByIdAndDelete(id);
  return message_delete;
}

async function groupByGroupUser(groupsIds, contacts) {
  const groups1 = await GroupUsers.aggregate([
    { $match: { $expr: { $in: ["$group_id", contacts[0].groupId] } } },
    { $match: { $expr: { $in: ["$contact_id", contacts[0].contactId] } } },
    {
      $project: {
        userId: contacts[0].userId,
        contactId: "$contact_id",
        groupId: "$group_id",
      },
    },
  ]);
  return groups1;
}

async function groupsList(contactId, unread) {
  const group_user = await Groups.aggregate([
    { $match: { $expr: { $eq: ["$_id", { $toObjectId: contactId }] } } },
    {
      $project: {
        name: "$name",
        description: "$description",
      },
    },
  ]);
  return group_user;
}

// Current User Group
async function currentUsergroupList(userId) {
  const group_user = await Groups.find({ userId: userId });
  return group_user;
}

/**
 * Update Notification
 */
// User leaves chat
async function userLeave({ id }) {
  const user = await User.updateOne({ _id: id }, { $set: { "active": 'false' } })
  return user;
}

module.exports = {
  UserEmailMatch,
  contactEmail,
  contactListByUserId,
  contactList,
  searchContactData,
  lastMsg,
  EditlastMsg,
  contactDelete,
  allMessageDelete,
  allSenderMessageDelete,
  messageSearchData,
  receiverData,
  sendUnreadMsg,
  receiverMessage,
  messageUpdate,
  userJoin,
  userMessage,
  updateUnreadMsg,
  groupData,
  groupById,
  groupContactsList,
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
  groupDeleteMember,
  groupDelete,
  groupMemberDelete,
  groupMsgDelete,
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
};
