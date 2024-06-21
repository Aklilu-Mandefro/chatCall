const socket = io();

// Login User Detail
let record = JSON.parse(localStorage.getItem("currentUser"));
if (!record) {
  logout();
}

let image;
userId = record.data.user._id;
let globalusername = record.data.user.name;
userEmail = record.data.user.email;
image = record.data.user.image != undefined ? record.data.user.image : 'default_image.jpg';
var globalimage = record.data.user.image != undefined ? record.data.user.image : 'default_image.jpg';
userNotification = record.data.user.notification;
document.querySelector('.openincomingclass').setAttribute("id", `openincoming_${userId}`);
document.getElementById('varecusername-input').value = userId;
let webcam, copy_text;
let username = record.data.user.name;
document.getElementById('setting_user_name').innerHTML = username;
let receiver_Id;
let groupcallContact = [];
function setimg(im) {
  image = im;
}

let mcontact_list;
function setcontact(c) {
  mcontact_list = c;
}

let msgtno, startm, scrolli

let flag = "0";

function fileValidation() {
  var fileInput = document.getElementById('upload_input');
  let file = document.getElementById("upload_input").files[0];
  var filePath = fileInput.value;
  // Allowing file type
  var allowedExtensions = /(\.jpg|\.mp3|\.mp4|\.jpeg|\.png|\.gif)$/i;
  var fileSize = file.size;
  if (!allowedExtensions.exec(filePath)) {
    toastr.error(`Please select only valid audio,video or image file.`, "Error");
    fileInput.value = '';
  }
  else {
    // Image preview
    if (fileInput.files && fileInput.files[0]) {
      if (fileSize > 2097152) {
        toastr.error(`pless select file less than 2MB`, "Error");
        fileInput.value = '';
      }
    }
  }
}
function hidechat() {
  $(".user-chat").removeClass("user-chat-show");
}
setTimeout(function () {
  username = document.getElementById('setting_user_name').innerHTML;
}, 500);

// Group Chat Message Insert
document.getElementById("pills-groups-tab").addEventListener("click", function () {
  document.querySelector('.user-chats1').style.display = 'block';
  document.querySelector('.user-chats2').style.display = 'none';

  document.querySelector(".ContactList").classList.remove('d-none');
  document.querySelector(".chat-input-section form").classList.add("group_form");
  document.querySelector(".chat-input-section form").classList.remove("message_form");
  document.getElementsByClassName("chat-welcome-section")[0].style.display = "flex";
  document.getElementsByClassName("chat-conversation")[0].style.display = "none";
  document.getElementsByClassName("chat-input-section")[0].style.display = "none";
  document.getElementById("userProfileBar").style.display = "none";
  document.querySelector('.user-profile-sidebar').style.display = "none";
  document.querySelector("#chat_add").reset();
});

document.getElementById("pills-chat-tab").addEventListener("click", function () {

  document.querySelector('.user-chats1').style.display = 'block';
  document.querySelector('.user-chats2').style.display = 'none';

  document.querySelector(".ContactList").classList.add('d-none');
  document.querySelector(".chat-input-section form").classList.add("message_form");
  document.querySelector(".chat-input-section form").classList.remove("group_form");
  document.getElementsByClassName("chat-welcome-section")[0].style.display = "flex";
  document.getElementsByClassName("chat-conversation")[0].style.display = "none";
  document.getElementsByClassName("chat-input-section")[0].style.display = "none";
  document.getElementById("userProfileBar").style.display = "none";
  document.querySelector('.user-profile-sidebar').style.display = "none";
  document.querySelector("#chat_add").reset();
});

document.getElementById("pills-contacts-tab").addEventListener("click", function () {
  document.querySelector('.user-chats1').style.display = 'block';
  document.querySelector('.user-chats2').style.display = 'none';

  document.querySelector(".ContactList").classList.add('d-none');
  document.querySelector(".chat-input-section form").classList.add("message_form");
  document.querySelector(".chat-input-section form").classList.remove("group_form");
  document.getElementsByClassName("chat-welcome-section")[0].style.display = "flex";
  document.getElementsByClassName("chat-conversation")[0].style.display = "none";
  document.getElementsByClassName("chat-input-section")[0].style.display = "none";
  document.getElementById("userProfileBar").style.display = "none";
  document.querySelector('.user-profile-sidebar').style.display = "none";
  document.querySelector("#chat_add").reset();
});

document.getElementById("pills-setting-tab").addEventListener("click", function () {
  document.querySelector(".ContactList").classList.add('d-none');
  document.querySelector(".chat-input-section form").classList.add("message_form");
  document.querySelector(".chat-input-section form").classList.remove("group_form");
  document.getElementsByClassName("chat-welcome-section")[0].style.display = "flex";
  document.getElementsByClassName("chat-conversation")[0].style.display = "none";
  document.getElementsByClassName("chat-input-section")[0].style.display = "none";
  document.getElementById("userProfileBar").style.display = "none";
  document.querySelector('.user-profile-sidebar').style.display = "none";
  document.querySelector("#chat_add").reset();
});

/**
 * Contacts
 */
const contactForm = document.querySelector(".contact_form");
const contactName = document.getElementById("contact_name");
const contactEmail = document.getElementById("contact_email");
const contactLists = document.querySelector(".contactList");
const contactGroup = document.querySelectorAll(".contactGroup");
const contactListGroup = document.querySelector(".contactListGroup");
var contactSearch = document.getElementById("contact_search");

// create contact
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  var name = contactName.value;
  var email = contactEmail.value;

  if (name == '') {
    toastr.error('Contact Name is required!', 'Error');
  }
  created_by = userId;
  socket.emit('contactList', { name, email, userEmail, created_by, username });
  document.querySelector(".contact_form").reset();
});

// Toastr Error Message
socket.on('contactsError', ({ msg }) => {
  toastr.error(msg, 'Error');
});

// Toastr Success Message
socket.on('Success', ({ msg }) => {
  toastr.success(msg, 'Success');
  value = document.getElementById("hide_modal")
  value.click();
});

// Contact List search
contactSearch.addEventListener("keyup", function () {
  var searchVal = contactSearch.value.toUpperCase();
  socket.emit("searchContactValue", { searchVal, userId });
  document.querySelector('.sort-contact').innerHTML = '';
});

// Contact Data Get And Append
socket.on('contactsLists', ({ contacts }) => {
  setcontact(contacts);
  document.querySelector('.sort-contact').innerHTML = '';
  contactListGroup.innerHTML = '';
  Array.from(contactGroup).forEach((element, index) => {
    element.innerHTML = '';
  });
  var i = 1;
  var isSortAlphabets = [];
  contacts.forEach((contact) => {
    const userBox = `
        <li id="contact_${contact.user_id}">
          <div class="d-flex align-items-center" onclick="singleChat('${contact.user_id}')">
            <div class="flex-grow-1">
              <h5 class="font-size-14 m-0">${contact.name}</h5>
            </div>
            <div class="dropdown">
              <a href="javascript:void(0);" class="text-muted dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true"
                aria-expanded="false">
                <i class="ri-more-2-fill"></i>
              </a>
              <div class="dropdown-menu dropdown-menu-end">
                <a class="dropdown-item delete-contact" href="javascript:void(0);" onclick="deleteContact('${contact._id}', '${contact.user_id}')">Remove <i
                    class="ri-delete-bin-line float-end text-muted"></i></a>
              </div>
            </div>
          </div>
        </li>
      `;

    const isSortContact = `<div class="px-3 font-weight-bold text-primary" id="contact-of-${contact.name.charAt(0)}">
            <div class="contact-of-${contact.name.charAt(0)}">${contact.name.charAt(0).toUpperCase()}</div>
      
      <ul id="contact-sort-${contact.name.charAt(0)}" class="list-unstyled contact-list">
      </ul>
      </div>`
    if (!isSortAlphabets.includes(contact.name.charAt(0) + "")) {
      isSortAlphabets.push(contact.name.charAt(0));
      document.getElementsByClassName("sort-contact")[0].innerHTML += isSortContact;
    }
    document.getElementById(`contact-sort-${contact.name.charAt(0)}`).innerHTML += userBox;
    // Contact List Append
    // Forward Msg CheckBox Contact List
    const contactList = `
        <li>
          <div class="form-check">
            <input type="checkbox" class="form-check-input" id="contactCheck${i}" name="single_contact_list" value="${contact.user_id}">
            <label class="form-check-label" for="contactCheck${i}">${contact.name}</label>
          </div>
        </li>
        `;
    contactListGroup.innerHTML += contactList;
    const contactBox = `
    <li class="member_${contact.user_id}">
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="memberCheck${i}" name="contact_list" value="${contact.user_id}">
        <label class="form-check-label" for="memberCheck${i}">${contact.name}</label>
      </div>
    </li>
    `;
    Array.from(contactGroup).forEach((element, index) => {
      element.innerHTML += contactBox;
    });
    i++;
  });
});

/** onclick functionality **/
// Delete Contact
function deleteContact(contact_id, receiverId) {
  socket.emit("contact_delete", { contact_id, receiverId, userId });
  var form_class = document.getElementById("chat_add").getAttribute("class");
  if (form_class == "message_form") {
    socket.emit("all_Message_delete", { receiverId });
  } else {
    socket.emit("all_Group_Message_delete", { receiverId });
  }

  var we = document.getElementById("contact_" + receiverId).children[0].children[0].children[0].innerHTML[0];
  document.getElementById("contact_" + receiverId).remove();
  document.getElementById(receiverId).remove();
  document.getElementById("s_chat_" + receiverId) ? document.getElementById("s_chat_" + receiverId).innerHTML = "" : '';

  const cntctlength = document.getElementById("contact-sort-" + we).getElementsByTagName('li').length;
  if (cntctlength <= 0) {
    document.getElementById('contact-of-' + we).remove();
  }

  var form_class = document.getElementById("chat_add").getAttribute("class");
  document.querySelector(".chat-conversation").style.display = "none";
  document.getElementsByClassName("chat-input-section")[0].style.display = "none";
  document.getElementById("userProfileBar").style.display = "none";
  document.getElementsByClassName("chat-welcome-section")[0].style.display = "flex";

}
socket.on("contact_delete", function ({ receiverId, userId }) {
  document.getElementById(userId) ? document.getElementById(userId).remove() : '';
  var we = document.getElementById("contact_" + userId).children[0].children[0].children[0].innerHTML[0];
  document.getElementById("contact_" + userId).remove();
  if (document.getElementById("s_chat_" + userId) != null) {
    document.querySelector(".user-profile-sidebar").style.display = "none";
    messageBox.innerHTML = "";

    document.getElementById("contact_" + receiverId) ? document.getElementById("contact_" + receiverId).remove() : '';
    document.getElementById(receiverId) ? document.getElementById(receiverId).remove() : '';
    const cntctlength = document.getElementById("contact-sort-" + we).getElementsByTagName('li').length;
    if (cntctlength <= 0) {
      document.getElementById('contact-of-' + we).remove();
    }
    document.getElementsByClassName("chat-conversation")[0].style.display = "none";
    document.getElementsByClassName("chat-input-section")[0].style.display = "none";
    document.getElementById("userProfileBar").style.display = "none";
    document.getElementsByClassName("chat-welcome-section")[0].style.display = "flex";
  }
});

/**
 * Single Chat
 */
const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const callback = document.querySelector(".callback");
const userList = document.getElementById("users");
const userChat = document.querySelector(".user_detail");
const messageArea = document.querySelector(".chat-conversation");
const userProfile = document.querySelector(".userProfile");
var search = document.getElementById("search");
var messageSearch = document.getElementById("message_search");
var searchGroup = document.getElementById("search_group");
/**
 * Submit Functionlity
 */
search.addEventListener("keyup", function () {
  var searchVal = search.value;
  filter = searchVal.toUpperCase();
  li = users.getElementsByTagName("li");
  for (i = 0; i < li.length; i++) {
    if (li[i].getElementsByTagName("a").length > 0) {
      a = li[i].getElementsByTagName("a")[0].querySelector(".text-truncate");
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }
});

// Single Message Search
messageSearch.addEventListener("keyup", function () {
  var receiverId = document.querySelector(".user_detail h6").innerHTML;
  var searchVal = messageSearch.value;
  var form_class = document.getElementById("chat_add").getAttribute("class");
  if (form_class == "message_form") {
    socket.emit("messageSearchValue", { searchVal, userId, receiverId });
  }
  if (form_class == "group_form") {
    socket.emit("groupSearchValue", { searchVal, receiverId });
  }
});

// Create Single Message 
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let file = document.getElementById("upload_input").files[0];
  if (webcam) {
    file = webcam
    webcam = null;
  }
  var filessname = Math.floor(Math.random() * (1234 - 29999 + 1) + 29999);
  if (file) {
    var filesname = file.name;
    var extName = filesname.split(".").pop();
    var filename = filessname + '.' + extName;
    var imgList = ["png", "jpg", "jpeg", "gif", "mp4"];
  }
  let formData = new FormData();
  formData.append("file", file);
  formData.append("fname", filename);

  var receiverId = document.querySelector(".user_detail h6").innerHTML;
  var messageId = document.querySelector('.message_id').value;
  var msg = inputField.value ? inputField.value : "";
  var message = msg.trim();
  if (messageId) {
    var editMessage = flag == '1' ? "(edited)":flag == '3'? "(Forwarded)":"";

    if (message != '') {
      socket.emit("message_update", { messageId, message, receiverId, userId, flag });
      document.querySelector(".msg_" + messageId + " .single_message").innerHTML = message ;
      document.querySelector(".msg_" + messageId + " .edit-flag").innerHTML = editMessage;
      document.querySelector(".remove_value button") ? document.querySelector(".remove_value button").remove() : "";
      document.querySelector(".message_id").setAttribute("value", '');
    }
    else {
      document.querySelector(".remove_value") ? document.querySelector(".remove_value").remove() : "";
      document.querySelector(".message_id").setAttribute("value", '');
    }

  } else {
    if (file != undefined) {
      socket.emit("chat message", {
        message: message,
        sender_id: userId,
        receiver_id: receiverId,
        file_upload: filename,
        flag:flag
      });
      document.querySelector(".file_Upload .image_pre").remove();
      fetch("/fileUploads", { method: "POST", body: formData });
    } else {

      if (message != '') {
        socket.emit("chat message", {
          message: message,
          sender_id: userId,
          receiver_id: receiverId,
          file_upload: "",
          flag:flag
        });
      }
    }
    let menu = document.getElementById('users');
    let li = document.getElementById('appendcontact');
    li = document.getElementById(receiverId);
    menu.insertBefore(li, menu.firstElementChild.nextElementSibling);
  }
  inputField.value = "";
  document.getElementById("upload_input").value = "";
});

// Current sender and receiver Message Append
socket.on("chat message", function ({ id, message, sender_id, receiver_id, file_upload, createdAt, receiverName, receiverImage, myid, flag}) {
  console.log('msg',flag);
  if (flag == '3') {
    setTimeout(() => {
      document.querySelector(".msg_" + id + " .edit-flag").innerHTML = "(Forwarded)";
    }, 500);
  }

  const time = new Date(createdAt);
  var last_date = time.getDate() + "-" + (time.getMonth() + 1) + "-" + time.getFullYear();
  const date = new Date();
  var currentDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
  if (currentDate == last_date) {
    var created_at = time.getHours() + ":" + time.getMinutes();
  }
  else if (time.getDate() == date.getDate() - 1) {
    var created_at = "Yesterday";
  }
  else {
    var created_at = time.getDate() + "-" + (time.getMonth() + 1) + "-" + time.getFullYear();
  }
  document.getElementById(myid).querySelector('.message_time').innerHTML = created_at;
  document.getElementById(myid).querySelector('.chat-user-message').innerHTML = message ? message : file_upload ? `<i class='ri-image-fill align-middle me-1 ms-0'></i>` + file_upload : '';

  if (sender_id === userId) {
    let menu = document.getElementById('users');
    let li = document.getElementById('appendcontact');
    li = document.getElementById(receiver_id);
    menu.insertBefore(li, menu.firstElementChild.nextElementSibling);
  }
  else {
    let menu = document.getElementById('users');
    let li = document.getElementById('appendcontact');
    li = document.getElementById(sender_id);
    menu.insertBefore(li, menu.firstElementChild.nextElementSibling);
  }

  if (document.getElementById('s_chat_' + myid) != null) {
    if (receiver_Id == sender_id) {
      if ((userId == sender_id && receiver_Id == receiver_id) || receiver_Id == sender_id) {
        var unread = 1;
        socket.emit("unreadMsgUpdate", { receiver_Id, unread });
      }
    }
    addNewMessage({ id, message: message, sender_id, receiver_id, file_upload, createdAt, receiverName, receiverImage, image });
  }
  else {
    if (document.getElementById(sender_id) != null) {
      var unread_msg = parseInt(document.getElementById(sender_id).querySelector('.unread_msg').getAttribute("data-msg")) + 1;
      document.getElementById(sender_id).querySelector('.unread_msg').setAttribute("data-msg", unread_msg);
      document.getElementById(sender_id).querySelector('.unread_msg').innerHTML = unread_msg;
    }

    if (document.getElementById('security-notificationswitch').checked == true) {

      if (document.getElementById('notification_muted_switch').checked == true) {
        var audio = new Audio('assets/notification/notification.mp3');
        audio.play();
      }
      if (message) {
        var message = message;
      }
      else {
        var message = file_upload;
      }
      const receiver_Image = receiverImage ? `assets/images/users/${receiverImage}` : `assets/images/users/default_image.jpg`;
      requestNotificationPermissions();
      var instance = new Notification(
        receiverName, {
        body: message,
        icon: receiver_Image
      });
    }
  }

  scrollToBottom();
});

function requestNotificationPermissions() {
  if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) { });
  }
}

const addNewMessage = ({
  id,
  message,
  sender_id,
  receiver_id,
  file_upload,
  createdAt,
  receiverName,
  receiverImage,
  image,
}) => {
  const time = new Date(createdAt);
  const created_at =
    time.getDate() +
    "-" +
    (time.getMonth() + 1) +
    "-" +
    time.getFullYear() +
    " " +
    time.getHours() +
    ":" +
    time.getMinutes();
  socket.emit("receiverId", { receiver_id });
  socket.on("receiver_data", function ({ users }) {
    receiverName = users.name;
  });

  var receiver_image = receiverImage
    ? `<img src="assets/images/users/${receiverImage}" alt="">`
    : `<div class="avatar-xs"><span class="avatar-title rounded-circle bg-soft-primary text-primary">${receiverName[0]}</span></div>`;
  var sender_image = image
    ? `<img src="assets/images/users/${image}" alt="" class="user-profile-image">`
    : `<div class="avatar-xs"><span class="avatar-title rounded-circle bg-soft-primary text-primary">${username[0]}</span></div>`;
  var none = file_upload == "" ? "none" : "block";
  var none_editBtn = file_upload != "" ? "none" : "block";

  var extName = file_upload.split(".").pop();
  var attachedList = ["gif", "mp4", "mp3"];
  var imgList = ["jpg", "jpeg", "png"];
  var MP4 = ["mp4"];
  
  if (imgList.includes(extName)) {
    var image = `<ul class="list-inline message-img  mb-0">
                  <li class="list-inline-item message-img-list me-2 ms-0">
                      <div>
                            <a class="popup-img d-inline-block m-1" href="assets/images/image/${file_upload}" target="blank" title="${file_upload}">
                              <img src='assets/images/image/${file_upload}' alt="${file_upload}" class="rounded border" /> 
                            </a>
                      </div>
                      <div class="message-img-link">
                          <ul class="list-inline mb-0">
                              <li class="list-inline-item">
                                  <a href="assets/images/image/${file_upload}" download="" class="text-muted">
                                      <i class="ri-download-2-line"></i>
                                  </a>
                              </li>
                          </ul>
                      </div>
                  </li>
              </ul>`;
    var group_image = `<div class="avatar-sm me-3 ms-0">
              <div class="avatar-title bg-soft-primary text-primary rounded font-size-20">
                <i class="ri-image-fill"></i>
              </div>
            </div>`;
  } 
  else if (attachedList.includes(extName)) {
    if ("mp4".includes(extName)) {
      var icon = `<i class="ri-video-line"></i>`;
    }
  
    if ("mp3".includes(extName)) {
      var icon = `<i class="ri-music-line"></i>`;
    }
  
    if ("gif".includes(extName)) {
      var icon = `<i class="ri-file-text-fill"></i>`;
    }

    var image = `<div class="card p-2 mb-2">
                <div class="d-flex align-items-center attached-file">
                    <div class="avatar-sm me-3 ms-0">
                        <div class="avatar-title bg-soft-primary text-primary rounded font-size-20">
                            ${icon}
                        </div>
                    </div>
                    <div class="flex-grow-1">
                        <div class="text-start">
                            <h5 class="font-size-14 mb-1">${file_upload}</h5>
                        </div>
                    </div>
                    <div class="ms-4 me-0">
                        <ul class="list-inline mb-0 font-size-20">
                            <li class="list-inline-item me-2 ms-0">
                                <a href="assets/images/image/${file_upload}" class="text-muted" download="">
                                    <i class="ri-download-2-line"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>`;

    var group_image = `<div class="avatar-sm me-3 ms-0">
            <div class="avatar-title bg-soft-primary text-primary rounded font-size-20">
              <i class="ri-music-line"></i>
            </div>
          </div>`;
  }
  else{
    var image = `<p class="mb-0 single_message text-break">${message}</p>`
  }

  if (document.getElementById("receiver_name")) {
    receiverName = document.getElementById("receiver_name").textContent;
  }
  username = document.getElementById('setting_user_name').innerHTML
  var receivedMsg = `
  <li class="msg_${id}">
          <div class="conversation-list">
            <div class="chat-avatar">
              ${receiver_image}
            </div>
            <div class="user-chat-content">
              <div class="ctext-wrap">
                <div class="ctext-wrap-content">
                <small class='text-white edit-flag'></small>
                  ${image != undefined?image:''}
                  <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i> <span
                      class="align-middle">${created_at}</span></p>
                </div>
                <div class="dropdown align-self-start">
                  <a class="dropdown-toggle" href="javascript:void(0);" role="button" data-bs-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <i class="ri-more-2-fill"></i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item" href="javascript:void(0);" id="${id}" onclick="singleMessageCopy(this)" style="display:${none_editBtn}">Copy <i class="ri-file-copy-line float-end text-muted"></i></a>
                    <a class="dropdown-item" href="javascript:void(0);" onclick="singleForwordMessage(this)" id="${id}" type="single" data-bs-toggle="modal" data-bs-target="#forwardContact-Modal">Forward<i class="ri-chat-forward-line float-end text-muted"></i></a>
                  </div>
                </div>
              </div>
              <div class="conversation-name receiver_name">${receiverName}</div>
            </div>
          </div>
        </li>
  `;

  var myMsg = `
  <li class="right msg_${id}">
          <div class="conversation-list">
            <div class="chat-avatar">
              ${sender_image}
            </div>
            <div class="user-chat-content">
              <div class="ctext-wrap">
                <div class="ctext-wrap-content">
                <small class='text-secondary edit-flag'></small>
                ${image != undefined?image:''}
                  <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i> <span
                      class="align-middle">${created_at}</span>
                  </p>
                </div>
                <div class="dropdown align-self-start">
                  <a class="dropdown-toggle" href="javascript:void(0);" role="button" data-bs-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <i class="ri-more-2-fill"></i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item" href="javascript:void(0);" id="${id}" onclick="singleMessageCopy(this)" style="display:${none_editBtn}">Copy <i class="ri-file-copy-line float-end text-muted"></i></a>
                        <a class="dropdown-item" href="javascript:void(0);" id="${id}" onclick="singleMessageUpdate(this)" style="display:${none_editBtn}">Edit <i class="ri-save-line float-end text-muted"></i></a>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="singleForwordMessage(this)" id="${id}" type="single" data-bs-toggle="modal" data-bs-target="#forwardContact-Modal">Forward <i class="ri-chat-forward-line float-end text-muted"></i></a>
                    <a class="dropdown-item" href="javascript:void(0);" id="${id}" onclick="singleMessageDelete(this)">Delete <i
                        class="ri-delete-bin-line float-end text-muted"></i></a>
                  </div>
                </div>
              </div>
              <div class="conversation-name user_name">${username}</div>
            </div>
          </div>
        </li>
      `;
  messageBox.innerHTML += sender_id === userId ? myMsg : receivedMsg;

  if (file_upload) {
    const receiverMessage = `
        <div class="card p-2 border mb-2 msg_${id}">
        <div class="d-flex align-items-center">
          ${group_image}
          <div class="flex-grow-1 overflow-hidden">
            <div class="text-start">
              <h5 class="font-size-14 text-truncate mb-1">${file_upload}</h5>
            </div>
          </div>
          <div class="ms-4 me-0">
            <ul class="list-inline mb-0 font-size-18">
              <li class="list-inline-item">
                <a href="assets/images/image/${file_upload}" download="" class="text-muted px-1">
                  <i class="ri-download-2-line"></i>
                </a>
              </li>
              <li class="list-inline-item dropdown">
                <a class="dropdown-toggle text-muted px-1" href="javascript:void(0);" role="button"
                  data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="ri-more-fill"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-end">
                  <a class="dropdown-item" href="javascript:void(0);" id="${id}" onclick="singleMessageDelete(this)">Delete</a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
        `;
    document.querySelector(".receiver_messageData").innerHTML += receiverMessage;
  }

  const typingAppend = `<li class="left chat_typing_${receiver_Id}""></li>`;
  messageBox.innerHTML += typingAppend;

};

/**
 * Onload data get
 */
// User Id Wise contact Get
var isMessages;
var listUsers;
socket.emit("userData", { userId });

socket.on("roomUsers", ({ users }) => {
  listUsers = users;
  setTimeout(() => { outputUsers(users) }, 1000);
  if (users.length > 0) {
    document.getElementById("messageBody").style.display = "none";
    document.getElementsByClassName("chat-conversation")[0].style.display = "none";
    document.getElementsByClassName("chat-input-section")[0].style.display = "none";
    document.getElementById("userProfileBar").style.display = "none";
  } else {
    document.getElementsByClassName("chat-conversation")[0].style.display = "none";
    document.getElementsByClassName("chat-input-section")[0].style.display = "none";
    document.getElementById("userProfileBar").style.display = "none";
  }
});

// Single Contact List Append
function outputUsers(users) {
  users.sort((a, b) => new Date(b.last_msg_date) - new Date(a.last_msg_date));
  userList.innerHTML = '<li id="appendcontact"></li>';
  users.forEach((user) => {
    var unreadMsgCount = user.unreadMsg.slice(-1)[0] == 0 ? getOccurrence(user.unreadMsg, '0') : '';
    var unreadCount = unreadMsgCount;
    const lastDate = user.created_at == '' ? '' : user.created_at;
    const time = new Date(lastDate);
    var last_date = time.getDate() + "-" + (time.getMonth() + 1) + "-" + time.getFullYear();
    const date = new Date();
    var currentDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    if (currentDate == last_date) {
      var createdAt = time.getHours() + ":" + time.getMinutes();
    }
    else if (time.getDate() == date.getDate() - 1) {
      var createdAt = "Yesterday";
    }
    else {
      var createdAt = time.getDate() ? time.getDate() : '' + "-" + (time.getMonth() + 1 ? time.getMonth() + 1 : '') + "-" + time.getFullYear() ? time.getFullYear() : '';
    }
    const user_img = user.userImg[0] != undefined ? `<img src="assets/images/users/${user.userImg[0]}" class="rounded-circle avatar-xs" alt="">` : `<div class="avatar-xs"><span class="avatar-title rounded-circle bg-soft-primary text-primary onchangeimg">${user.name[0]}</span></div>`;

    const userBox = `
        <li id="${user.user_id}">
            <a href="javascript:void(0);" onclick="singleChat('${user.user_id}')">
                <div class="d-flex">                            
                    <div class="chat-user-img align-self-center me-3 ms-0">
                        ${user_img}
                        <span class="user-status"></span>
                    </div>
                    <div class="flex-grow-1 overflow-hidden">
                        <h5 class="text-truncate font-size-15 mb-1">${user.name}</h5>
                        <p class="text-truncate mb-0 lh-sm"><span class="chat-user-message"></span><span class="typing"></span></p>
                    </div>
                    <div class="font-size-11 message_time">${createdAt ? createdAt : ''}</div>
                    <div class="unread-message">
                        <span data-msg='${unreadCount ? unreadCount : 0}' class="badge badge-soft-danger rounded-pill unread_msg">${unreadCount != '' ? unreadCount : ""}</span>
                    </div>
                </div>
            </a>
        </li>
      `;
    userList.innerHTML += userBox;

  });
}

/**
 * Single User Messge Set
 */
function getOccurrence(array, value) {
  return array.filter((v) => (v === value)).length;
}

// Last Message Get and Set
socket.on("isMessage", ({ messages }) => {
  setTimeout(() => {
    if (messages) {
      const time = new Date(messages.createdAt);
      var last_date = time.getDate() + "-" + (time.getMonth() + 1) + "-" + time.getFullYear();
      const date = new Date();
      var currentDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

      if (currentDate == last_date) {
        var createdAt = time.getHours() + ":" + time.getMinutes();
      }
      else if (time.getDate() == date.getDate() - 1) {
        var createdAt = "Yesterday";
      }
      else {
        var createdAt = time.getDate() + "-" + (time.getMonth() + 1) + "-" + time.getFullYear();
      }

      if (messages.sender_id != userId) {
        document.getElementById(messages.sender_id).querySelector('.chat-user-message').innerHTML = messages.message ? messages.message : messages.file_upload ? `<i class='ri-image-fill align-middle me-1 ms-0'></i>` + messages.file_upload : '';
        document.getElementById(messages.sender_id).querySelector('.font-size-11').innerHTML = createdAt;
      }
      else {
        document.getElementById(messages.receiver_id).querySelector('.chat-user-message').innerHTML = messages.message ? messages.message : messages.file_upload ? `<i class='ri-image-fill align-middle me-1 ms-0'></i>` + messages.file_upload : '';
        document.getElementById(messages.receiver_id).querySelector('.font-size-11').innerHTML = createdAt;
      }
    }
    isMessages = messages;
  }, 1000)
});

/**
 * Onclick Wise data get
 */
function singleChat(id) {
  if (document.getElementById(id)) {
    document.getElementsByClassName("chat-welcome-section")[0].style.display = "none";
    document.getElementsByClassName("chat-loader-section")[0].style.display = "block";
    setTimeout(function () {
      document.getElementsByClassName("chat-loader-section")[0].style.display = "none";
    }, 700)
    socket.emit('contactByUser', { id, userId });
    socket.emit('chat_online', { id });
    document.getElementsByClassName("chat-conversation")[0].style.display = "block";
    document.getElementsByClassName("chat-input-section")[0].style.display = "block";
    document.getElementById("userProfileBar").style.display = "flex";
    document.getElementById(id).querySelector(".unread_msg").setAttribute("data-msg", "0");
    document.getElementById(id).querySelector('.unread_msg').innerHTML = '';
  }
  scrollToBottom();
}

socket.on('contactInfo', ({ contacts }) => {
  contacts.forEach(contact => {
    receiver_Id = contact.user_id;
    document.querySelector('.messages__history').setAttribute('id', 's_chat_' + contact.user_id);
    const user_img = contact.userImg[0] ? `<img src="assets/images/users/${contact.userImg[0]}" class="rounded-circle avatar-xs" alt="">` : `<div class="avatar-xs mx-auto"><span class="avatar-title rounded-circle bg-soft-primary text-primary contact_img">${contact.name[0]}</span></div>`;
    const user_rimg = contact.userImg[0] ? `<img src="assets/images/users/${contact.userImg[0]}" class="rounded-circle avatar-md" alt="">` : `<div class="avatar-md mx-auto"><span class="avatar-title rounded-circle bg-soft-primary text-primary contact_img">${contact.name[0]}</span></div>`;
    const time = new Date(contact.createdAt);
    const created_at =
      time.getDate() +
      "-" +
      (time.getMonth() + 1) +
      "-" +
      time.getFullYear() +
      "&ensp;" +
      time.getHours() +
      ":" +
      time.getMinutes();

    const userBox = `
    <div class="d-block d-lg-none me-2 ms-0">
      <a href="javascript: void(0);" class="user-chat-remove text-muted font-size-16 p-2"><i
          class="ri-arrow-left-s-line"></i></a>
    </div>
    <div class="me-3 ms-0">
      ${user_img}
    </div>
    <div class="flex-grow-1 overflow-hidden">
      <h5 class="font-size-14 mb-0 text-truncate message_typing"><a href="javascript: void(0);" class="text-reset user-profile-show receiver_name" onclick="profile_show(this.id)">${contact.name}</a><i class="ri-record-circle-fill font-size-10 d-inline-block ms-1 user_status"></i>
      </h5>
      <span class="chat_typing_${contact.user_id}"></span>
      <h6 style="display:none">${contact.user_id}</h6>
    </div>
  `;
    userChat.innerHTML = userBox;

    const user_img1 = contact.userImg[0] ? `<img src="assets/images/users/${contact.userImg[0]}" class="rounded-circle avatar-lg" alt="">` : `<div class="avatar-lg mx-auto"><span class="avatar-title rounded-circle bg-soft-primary text-primary contact_img">${contact.name[0]}</span></div>`;
    const user_img2 = contact.userImg[0] ? `<img src="assets/images/users/${contact.userImg[0]}" alt="" style="width: 500px; border-radius: 50%;">` : `<div class="mx-auto" style="width:500px; height:500px"><span class="avatar-title rounded-circle bg-soft-primary text-primary contact_img">${contact.name[0]}</span></div>`;

    document.getElementById('callimg').innerHTML = user_img2;
    document.getElementById('vcimg').innerHTML = user_img1;
    const np = document.querySelectorAll('.vcname');
    Array.from(np).forEach((element) => {
      element.innerHTML = contact.name;
    });
    document.getElementById('headerimg').setAttribute('src', `assets/images/users/default_image.jpg`);
    document.getElementById('acimg').innerHTML = user_img1;
    document.getElementById('sameid').innerHTML = contact.user_id;
    document.getElementById('vausername-input').value = contact.user_id;
    document.getElementById('type').innerHTML = 'single';
    document.querySelector(".videocallicon").removeAttribute('style');
    document.querySelector(".audiocallicon").removeAttribute('style');
    // Receiver Data Set
    const receiverData = `
        <div class="float-end">
          <button type="button" class="btn btn-light btn-sm" id="receiver_edit" onclick="edit_receiverName(this)"><i class="ri-edit-fill me-1 ms-0 align-middle"></i> Edit</button>
        </div>
        <div>
          <p class="text-muted mb-1">Name</p>
          <h5 class="font-size-14 receiver_name" id="receiver_name">${contact.name}</h5>
          <div id="edit-receiver-name" class="visually-hidden d-flex justify-content-between">
            <input type="text" name="name" id="receivername" value=""
              class="form-control bg-soft-light border-light" maxlength="20"/>
            <div class="float-right">
              <button type="submit" id="receiverSave" onclick="cnameChange(this)"
                class="btn btn-primary btn-block waves-effect waves-light" style="display: block;">
                Save</button>
            </div>
          </div>
        </div>
        <div class="mt-4">
            <p class="text-muted mb-1">Email</p>
            <h5 class="font-size-14">${contact.email}</h5>
        </div>
        <div class="mt-4">
            <p class="text-muted mb-1">Time</p>
            <h5 class="font-size-14">${created_at}</h5>
        </div>
        <div class="mt-4">
          <p class="text-muted mb-1">Location</p>
          <h5 class="font-size-14 mb-0">${contact.location}</h5>
        </div>
    `;
    document.querySelector('.group_receiverData').innerHTML = receiverData;

    $(".user-chat-remove").click(function () {
      $(".user-chat").removeClass("user-chat-show");
    });

    document.getElementById("receivername").addEventListener('keydown', function (e) {
      if (this.value.length === 0 && e.which === 32) e.preventDefault();
    });

    document.querySelector('.receiver_img').innerHTML = user_rimg;
    var receiverName = document.querySelectorAll('.receiver_name');
    Array.from(receiverName).forEach((element, index) => {
      element.innerHTML = contact.name;
    });

    // Active Class Add
    if (document.querySelector('#users li')) {
      if (document.querySelector('#users li.active'))
        document.querySelector('#users li.active').classList.remove('active');
        document.getElementById(contact.user_id) ? document.getElementById(contact.user_id).classList.add('active') : '';
        document.querySelector(".user-chat") ? document.querySelector('.user-chat').classList.add('user-chat-show') : '';
    }
    userhtml = CharacterData(contact.user_id, contact.name);
    document.getElementById('message_search').value = '';
  });
});
socket.on('onlineUser', ({ online }) => {
  setTimeout(function () {
    if (document.querySelector('.user_status')) {
      online == 1 ? document.querySelector('.user_status').classList.add('text-success') : '';
    }
    var receiver_status = online == 1 ? `<i class="ri-record-circle-fill font-size-10 text-success d-inline-block ms-1"></i> Online` : '<i class="ri-record-circle-fill font-size-10 text-secondary d-inline-block ms-1"></i> Offline';
    document.querySelector('.receiver_status').innerHTML = receiver_status;
  }, 550);
});

socket.on("chat-pg", ({ users, msgno }) => {
  scrolli = $(".messages__history").height()
  adduchat(users, document.querySelector(".receiver_name").innerHTML)
  $('#messageBody .simplebar-content-wrapper').scrollTop($(".messages__history").height() - scrolli);
});

//contact wise sender and receiver message
function CharacterData(id, name) {
  startm = 0
  var receiverId = document.querySelector(".user_detail h6").innerHTML;
  var receiverName = document.querySelector(".receiver_name").innerHTML;
  socket.emit("userClick", { id, userId, startm });

  socket.on("userMessage", ({ users, msgno }) => {
    msgtno = msgno
    messageBox.innerHTML = "";
    $('.messages__history').html('')
    adduchat(users, receiverName)
    startm = 10
  });

}

let adduchat = (users, receiverName) => {
  var rfirst = 1;
  var sfirst = 1;
  document.querySelector(".receiver_messageData").innerHTML = "";
  users.forEach((user, index) => {
    const time = new Date(user.createdAt);
    const createdAt =
      time.getDate() +
      "-" +
      (time.getMonth() + 1) +
      "-" +
      time.getFullYear() +
      " " +
      time.getHours() +
      ":" +
      time.getMinutes();
      var editMessage = user.flag == '1' ? "(edited)":user.flag == '3'? "(Forwarded)":"";

    var none = user.file_upload == "" ? "none" : "block";
    var none_editBtn = user.file_upload != "" ? "none" : "block";
    var receiver_image = user.image[0]
      ? `<a href="javascript:document.getElementById('pills-user-tab').click()"><img src="assets/images/users/${user.image[0]}" alt="" class="user-profile-image user-profile-image"></a>`
      : `<div class="avatar-xs"><span class="avatar-title rounded-circle bg-soft-primary text-primary">${user.name[0][0]}</span></div>`;
    var extName = user.file_upload != undefined ? user.file_upload.split(".").pop():'';
    var attachedList = ["gif", "mp4", "mp3"];
    var imgList = ["jpg", "jpeg", "png"];
    if (imgList.includes(extName)) {
      var image = `<ul class="list-inline message-img  mb-0">
                        <li class="list-inline-item message-img-list me-2 ms-0">
                            <div>
                                <a class="popup-img d-inline-block m-1" href="assets/images/image/${user.file_upload}" target="blank" title="${user.file_upload}">
                                <img src='assets/images/image/${user.file_upload}' alt="${user.file_upload}" class="rounded border" /></a>
                            </div>
                            <div class="message-img-link">
                                <ul class="list-inline mb-0">
                                    <li class="list-inline-item">
                                        <a href="assets/images/image/${user.file_upload}" download="" class="text-muted">
                                            <i class="ri-download-2-line"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>`;
    } 
    else if(attachedList.includes(extName)) {
      if ("mp4".includes(extName)) {
        var icon = `<i class="ri-video-line"></i>`;
      }
  
      if ("mp3".includes(extName)) {
        var icon = `<i class="ri-music-line"></i>`;
      }
  
      if ("gif".includes(extName)) {
        var icon = `<i class="ri-file-text-fill"></i>`;
      }
      var attachedFile = `<div class="card p-2 mb-2">
                        <div class="d-flex align-items-center attached-file">
                            <div class="avatar-sm me-3 ms-0">
                                <div class="avatar-title bg-soft-primary text-primary rounded font-size-20">
                                   ${icon}
                                </div>
                            </div>
                            <div class="flex-grow-1">
                                <div class="text-start">
                                    <h5 class="font-size-14 mb-1">${user.file_upload}</h5>
                                </div>
                            </div>
                            <div class="ms-4 me-0">
                                <ul class="list-inline mb-0 font-size-20">
                                    <li class="list-inline-item me-2 ms-0">
                                        <a href="assets/images/image/${user.file_upload}" class="text-muted" download="">
                                            <i class="ri-download-2-line"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>`;
    }
    else{
      var message = `<p class="mb-0 single_message text-break">${user.flag == '2' ? "Delete Message":user.message}</p>`;
    }

    if (user.receiver_id == userId) {

      $('.messages__history').prepend(`
          <li class="left msg_${user._id}">
            <div class="conversation-list">
            <div class="chat-avatar">${receiver_image}</div>
              <div class="user-chat-content">
                <div class="ctext-wrap">
                <div class="ctext-wrap-content ${user.flag == '2' ? 'disable':''}">
                    <small class='text-white edit-flag'>${editMessage}</small>
                    ${image != undefined ? image:''}
                    ${attachedFile != undefined ? attachedFile:''}
                    ${message != undefined ? message:''}
                    <p class="chat-time mb-0">
                    ${user.flag == '2' ? '':'<i class="ri-time-line align-middle"></i> <span class="align-middle">'+createdAt+'</span>'}
                    </p>
                  </div>
                  ${user.flag != '2' ? 
                  `<div class="dropdown align-self-start">
                    <a class="dropdown-toggle" href="javascript:void(0);" role="button" data-bs-toggle="dropdown" aria-haspopup="true"
                      aria-expanded="false">
                      <i class="ri-more-2-fill"></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end">
                      <a class="dropdown-item" href="javascript:void(0);" id="${user._id}" onclick="singleMessageCopy(this)" style="display:${none_editBtn}">Copy <i
                          class="ri-file-copy-line float-end text-muted"></i></a>
                          <a class="dropdown-item" href="javascript:void(0);" onclick="singleForwordMessage(this)" id="${user._id}" type="single" data-bs-toggle="modal" data-bs-target="#forwardContact-Modal">Forward<i class="ri-chat-forward-line float-end text-muted"></i></a>
                    </div>
                  </div>`:''}
                </div>
                <div class="conversation-name receiver_name">${receiverName}</div>
              </div>
            </div>
          </li>
    `);
    }

    if (user.sender_id == userId) {
      $('.messages__history').prepend(`
      <li class="right msg_${user._id}">
          <div class="conversation-list">
            <div class="chat-avatar">${receiver_image}</div>
            <div class="user-chat-content">
              <div class="ctext-wrap">
                <div class="ctext-wrap-content">
                  <small class='text-secondary edit-flag'>${editMessage}</small>
                  ${image != undefined ? image:''}
                  ${attachedFile != undefined ? attachedFile:''}
                  ${message != undefined ? message:''}
                  
                  <p class="chat-time mb-0">
                  ${user.flag == '2' ? '':'<i class="ri-time-line align-middle"></i> <span class="align-middle">'+createdAt+'</span>'}
                  </p>
                </div>
                ${user.flag != '2' ? 
                `<div class="dropdown align-self-start">
                  <a class="dropdown-toggle" href="javascript:void(0);" role="button" data-bs-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <i class="ri-more-2-fill"></i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item" href="javascript:void(0)" id="${user._id}" onclick="singleMessageCopy(this)" style="display:${none_editBtn}">Copy <i class="ri-file-copy-line float-end text-muted"></i></a>
                    <a class="dropdown-item" href="javascript:void(0);" id="${user._id}" onclick="singleMessageUpdate(this)" style="display:${none_editBtn}">Edit <i class="ri-save-line float-end text-muted"></i></a>
                    <a class="dropdown-item" href="javascript:void(0);" onclick="singleForwordMessage(this)" id="${user._id}" type="single" data-bs-toggle="modal" data-bs-target="#forwardContact-Modal">Forward<i class="ri-chat-forward-line float-end text-muted"></i></a>
                    <a class="dropdown-item" href="javascript:void(0);" id="${user._id}" onclick="singleMessageDelete(this)">Delete <i
                        class="ri-delete-bin-line float-end text-muted"></i></a>
                  </div>
                </div>`:''}
              </div>
              <div class="conversation-name user_name">${username}</div>
            </div>
          </div>
        </li>
      `);
    }  

    if ("png,jpg,jpeg".includes(extName)) {
      var icon = `<i class="ri-image-fill"></i>`;
    }
    if ('mp4'.includes(extName)) {
      var icon = `<i class="ri-video-line"></i>`;
    }
    if ('mp3'.includes(extName)) {
      var icon = `<i class="ri-music-line"></i>`;
    }
    if ('gif'.includes(extName)) {
      var icon = `<i class="ri-file-text-fill"></i>`;
    }

    var image1 = `<div class="avatar-sm me-3 ms-0">
                         <div class="avatar-title bg-soft-primary text-primary rounded font-size-20">
                           ${icon}
                         </div>
                       </div>`;

    if (user.file_upload) {
      const receiverMessage = `
      <div class="card p-2 border mb-2 msg_${user._id}">
      <div class="d-flex align-items-center">
        ${image1}
        <div class="flex-grow-1 overflow-hidden">
          <div class="text-start">
            <h5 class="font-size-14 text-truncate mb-1">${user.file_upload}</h5>
          </div>
        </div>

        <div class="ms-4 me-0">
          <ul class="list-inline mb-0 font-size-18">
            <li class="list-inline-item">
              <a href="assets/images/image/${user.file_upload}" download="" class="text-muted px-1">
                <i class="ri-download-2-line"></i>
              </a>
            </li>
            <li class="list-inline-item dropdown">
              <a class="dropdown-toggle text-muted px-1" href="javascript:void(0);" role="button"
                data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="ri-more-fill"></i>
              </a>
              <div class="dropdown-menu dropdown-menu-end">
                <a class="dropdown-item" href="javascript:void(0);" id="${user._id}" onclick="singleMessageDelete(this)">Delete</a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
      `;
      document.querySelector(".receiver_messageData").innerHTML += receiverMessage;
    }
  });

  const myMsg = `<li class="left chat_typing_${receiver_Id}""></li>`;
  messageBox.innerHTML += myMsg;
  scrollToBottom();
}

// Single Message Typing Set
inputField.addEventListener("keyup", () => {
  var receiverId = document.querySelector(".user_detail h6").innerHTML;
  var form_class = document.getElementById("chat_add").getAttribute("class");

  // Single chat Typing
  if (form_class == "message_form") {
    socket.emit("typing", {
      isTyping: inputField.value.length > 0,
      nick: username,
      Image: image,
      receiverId: receiverId,
      senderId: userId,
    });
  }

  // Group Typing
  if (form_class == "group_form") {
    socket.emit("group_typing", {
      isTyping: inputField.value.length > 0,
      nick: username,
      Image: image,
      receiverId: receiverId,
      senderId: userId,
    });
  }

});
socket.on("typing", function (data) {
  const { isTyping, nick, Image } = data;
  var sender_image = Image ? `<img src="assets/images/users/${Image}" alt="">` : `<div class="avatar-xs"><span class="avatar-title rounded-circle bg-soft-primary text-primary">${nick[0]}</span></div>`;
  if (document.querySelector('.callback') != null) {
    const callback_remove = document.querySelectorAll('.callback');
    Array.from(callback_remove).forEach((element, index) => {
      element.remove();
    });

  }
  let div = document.createElement("span");
  div.classList.add('callback');
  div.classList.add('text-success');
  let content = `Typing
                    <span class="animate-typing">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </span>
                   `;
  div.innerHTML = content;

  let chat_div = document.createElement("span");
  chat_div.classList.add('callback');
  chat_div.classList.add('text-success');
  let chat_content = `
  <div class="conversation-list">
    <div class="chat-avatar">
      ${sender_image}
    </div>
    <div class="user-chat-content">
      <div class="ctext-wrap">
        <div class="ctext-wrap-content">
          <p class="mb-0">typing
            <span class="animate-typing">
              <span class="dot ms-1 bg-white"></span>
              <span class="dot ms-1 bg-white"></span>
              <span class="dot ms-1 bg-white"></span>
            </span>
          </p>
        </div>
      </div>
      <div class="conversation-name">${nick}</div>
    </div>
  </div>`;

  chat_div.innerHTML = chat_content;
  document.getElementById(data.senderId).querySelector('.chat-user-message').style.display = "none";
  document.getElementById(data.senderId).querySelector('.typing').appendChild(div);
  const ty = document.querySelectorAll('.chat_typing_' + data.senderId);
  Array.from(ty).forEach((element, index) => {
    element.appendChild(chat_div);
  });

  setTimeout(function () {
    if (document.querySelector('.callback') != null) {
      var typing_remove = document.querySelectorAll('.callback');
      Array.from(typing_remove).forEach((element, index) => {
        element.remove();
      });

      var lastMsg = document.querySelectorAll('.chat-user-message');
      Array.from(lastMsg).forEach((element, index) => {
        element.style.display = "block";
      });

    }
  }, 1500);

});


socket.on("group_typing", function (data) {
  const { isTyping, nick, Image } = data;
  var sender_image = Image ? `<img src="assets/images/users/${Image}" alt="">` : `<div class="avatar-xs"><span class="avatar-title rounded-circle bg-soft-primary text-primary">${nick[0]}</span></div>`;
  if (document.getElementById('g_chat_' + data.receiverId) != null) {
    if (document.querySelector('.callback') != null) {
      document.querySelector('.callback').remove();
    }
    let div = document.createElement("span");
    div.classList.add('callback');
    div.classList.add('text-success');
    let content1 = `${nick}
                    typing
                    <span class="animate-typing">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </span>
                   `;
    div.innerHTML = content1;
    document.querySelector('.typing_' + data.receiverId).appendChild(div);
    setTimeout(function () {
      if (document.querySelector('.callback') != null) {
        var typing_remove = document.querySelectorAll('.callback');
        Array.from(typing_remove).forEach((element, index) => {
          element.remove();
        });
      }
    }, 1500);
  };
});


/** 
 * Onclick Functions 
 */
// Single Message Copy
function singleMessageCopy(message) {
  const copy_text = document.querySelector(
    ".msg_" + message.id + " .single_message"
  ).innerText;
  navigator.clipboard.writeText(copy_text);
}

// Single Message Delete
function singleMessageDelete(message) {
  const message_id = message.id;
  var receiverId = document.querySelector(".user_detail h6").innerHTML;
  flag = '2';
  socket.emit("message_delete", { message_id, receiverId, userId, flag });
  var remove_msg = document.querySelectorAll(".msg_" + message_id);
  Array.from(remove_msg).forEach((element, index) => {
    if (element.querySelector(".popup-img") != null) {
      let fn = element.querySelector(".popup-img").title;
      let formData = new FormData();
      formData.append("fn", fn);
      fetch("/filedelete", { method: "POST", body: formData });
      fn = null;
      formData = null;
    }
    element.querySelector('.ctext-wrap-content').innerHTML = 'Delete Message';
    element.querySelector(".dropdown ").style.display = "none";
    // element.remove();
  });
}
socket.on("message_delete", function ({ message_id, receiverId, userId }) {
  if (document.getElementById("s_chat_" + userId) != null) {
    var remove_msg = document.querySelectorAll(".msg_" + message_id);
    Array.from(remove_msg).forEach((element, index) => {
      // element.remove();
      element.querySelector('.ctext-wrap-content').innerHTML = 'Delete Message';
      element.querySelector(".dropdown ").style.display = "none";
    });
  }
});

// Single Message Update
function singleMessageUpdate(messages) {
  flag = 1;
  const message_id = messages.id;
  const copy_text = document.querySelector(
    ".msg_" + message_id + " .single_message"
  ).innerHTML;
  document.querySelector(".message_form__input").value = copy_text;
  const remove_btn = `<button type="button" class="btn btn-link text-decoration-none font-size-16 btn-lg waves-effect"><i class="ri-close-line text-danger" onclick="removeEditMsg(this)"></i></div></button>`
  document.querySelector(".col-auto .list-inline li .remove_value").innerHTML = remove_btn;
  document.querySelector(".message_id").setAttribute("value", message_id);
}
socket.on(
  "message_update",
  function ({ messageId, message, receiverId, userId, flag }) {
    if (document.getElementById("s_chat_" + userId) != null) {
      document.querySelector(".msg_" + messageId + " .single_message").innerHTML = message;
      document.querySelector(".msg_" + messageId + " .edit-flag").innerHTML = "(edited)";
    }
  }
);

// Single All Message Delete
function deleteAllMessage(message) {
  var receiverId = document.querySelector(".user_detail h6").innerHTML;
  var form_class = document.getElementById("chat_add").getAttribute("class");
  if (form_class == "message_form") {
    socket.emit("all_Message_delete", { receiverId, userId });
    messageBox.innerHTML = "";
    document.getElementById(receiverId).querySelector('.chat-user-message').innerHTML = '';
    document.getElementById(receiverId).querySelector('.message_time').innerHTML = '';
    document.getElementById(receiverId).querySelector('.unread-message .rounded-pill').innerHTML = '';
    document.querySelector('.receiver_messageData').innerHTML = '';
  } else {
    if (message.id == userId) {
      socket.emit("all_Group_Message_delete", { receiverId });
    } else {
      socket.emit("single_Group_Message_delete", { receiverId, userId });
    };
  }
}

// Group Single Message Delete
socket.on("groupSenderMessage", ({ groupMsgs }) => {
  if (document.getElementById("g_chat_" + groupMsgs[0].group_id) != null) {
    groupMsgs.forEach(msg => {
      document.querySelector(".group_msg_" + msg._id).remove();
    });
  };
});

socket.on("all_Message_delete", function ({ receiverId, userId }) {
  document.getElementById(userId) ? document.getElementById(userId).querySelector('.chat-user-message').innerHTML = '' : '';
  document.getElementById(userId) ? document.getElementById(userId).querySelector('.message_time').innerHTML = '' : '';
  document.getElementById(userId) ? document.getElementById(userId).querySelector('.unread-message .rounded-pill').innerHTML = '' : '';
  if (document.getElementById("s_chat_" + userId) != null) {
    messageBox.innerHTML = "";
    document.querySelector('.receiver_messageData').innerHTML = '';
  }
});

socket.on("all_Group_Message_delete", function ({ receiverId }) {
  document.getElementById("group_list_" + receiverId).querySelector(".unread_msg").setAttribute("data-msg", '0');
  document.getElementById("group_list_" + receiverId).querySelector('.unread_msg').innerHTML = '';
  if (document.getElementById("g_chat_" + receiverId) != null) {
    messageBox.innerHTML = "";
  }
});

// Single Message Forward
function singleForwordMessage(messages) {
  var type = messages.type === 'single' ? '.msg_':'.group_msg_';
  if(document.querySelector(type + messages.id + " .single_message ")){
    copy_text = document.querySelector(type + messages.id + " .single_message ").innerText;
  }
  // Image File Forward
  var imageFiles = document.querySelector(type + messages.id+ " .message-img") ? document.querySelector(type + messages.id+ " .message-img").classList.contains("message-img"):'';
  if(imageFiles == true){
    copy_text = document.querySelector(type + messages.id + " .message-img img").alt;
  }
  // Attached File Forward
  var attachedFiles = document.querySelector(type + messages.id+ " .attached-file") ? document.querySelector(type + messages.id+ " .attached-file").classList.contains("attached-file"):'';
  if(attachedFiles == true){
    copy_text = document.querySelector(type + messages.id + " .attached-file").innerText;
  }
}

var forwordForm = document.querySelector(".forward_form");
forwordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  var contactList = [];
  list = document.querySelectorAll("input[name='single_contact_list']");
  for (var i = 0; i < list.length; i++) {
    if (list[i].checked) {
      contactList.push(list[i].value);
    }
  }

  var imgList = ["jpg", "png", "mp3", "mp4"];
  var extName = copy_text != undefined ? copy_text.split(".").pop():'';
  var contact_lists = contactList;
  var sender_id = userId;
  if (imgList.includes(extName)) {
    contact_lists.forEach((element) => {
      var sender_id = userId;
      var receiver_id = element;
      var file_upload = copy_text
      socket.emit("chat message", {
        message: "",
        sender_id: userId,
        receiver_id: element,
        file_upload: file_upload,
      });
    });
  }
  else{
    contact_lists.forEach(element => {
    socket.emit("chat message", {
      message: copy_text,
      sender_id: userId,
      receiver_id: element,
      file_upload: "",
      flag: "3",
    });
  });
  }
  document.getElementById("close_model").click();
  document.querySelector(".forward_form").reset();
});


/**
 * Group Chat
 */
// Groups Details
const groupsForm = document.querySelector(".groups_form");
const groupForm = document.querySelector(".group_form");
const groupsList = document.querySelector(".group_list");
const groupName = document.getElementById("group_name");
const groupDesc = document.getElementById("group_description");
const groupContactList = document.getElementById("user-status-carousel");
const addContactForm = document.querySelector(".add_contact_form");

// Submit Functionlity
// Group Create
groupsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  name = groupName.value;
  description = groupDesc.value;
  if (name == '') {
    toastr.error('Group Name is required', 'Error');
  }
  else {
    var contactList = [], f = 0
    document
      .querySelectorAll("input[name='contact_list']:checked")
      .forEach(function (e) {
        f = 1
        contactList.push(e.value);
      });
    var contact_list = contactList;

    if (f == 1) {
      socket.emit("createGroups", { name, description, contact_list, userId });
      document.getElementById("close_model1").click();
      document.querySelector(".groups_form").reset();
    }
    else {
      toastr.error('Please select Group member!', 'Error');
    }
  }
});

// group message Create
$(document).on('click', '.group_form .chat-send', function (e) {
  e.preventDefault();
  let file = document.getElementById("upload_input").files[0];
  if (webcam) {
    file = webcam
    webcam = null;
  }
  var filessname = Math.floor(Math.random() * (1234 - 29999 + 1) + 29999);
  if (file) {
    var filesname = file.name;
    var extName = filesname.split(".").pop();
    var filename = filessname + '.' + extName;
    var imgList = ["png", "jpg", "jpeg", "gif", "mp4"];
  }
  let formData = new FormData();
  formData.append("file", file);
  formData.append("fname", filename);

  var groupId = document.querySelector(".user_detail h6").innerHTML;
  var messageId = document.querySelector('.message_id').value;
  var msg = inputField.value ? inputField.value : "";
  var message = msg.trim();
  if (messageId) {
    if (message != '') {
      socket.emit("groupMessage_update", { messageId, message, groupId });
      document.querySelector(".group_msg_" + messageId + " .single_message").innerHTML = message;
      document.querySelector(".remove_value button") ? document.querySelector(".remove_value button").remove() : "";
      document.querySelector(".message_id").setAttribute("value", '');
    }
    else {
      document.querySelector(".remove_value") ? document.querySelector(".remove_value").remove() : "";
      document.querySelector(".message_id").setAttribute("value", '');
    }

  } else {
    if (file != undefined) {
      socket.emit("group message", {
        message: inputField.value,
        sender_id: userId,
        group_id: groupId,
        file_upload: filename,
      });
      document.querySelector(".file_Upload .image_pre").remove();
      fetch("/fileUploads", { method: "POST", body: formData });
    } else {
      if (message != '') {
        socket.emit("group message", {
          message: inputField.value,
          sender_id: userId,
          group_id: groupId,
          file_upload: "",
        });
      }
    }
  }
  inputField.value = "";
  document.getElementById("upload_input").value = "";
});

addContactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  var contactList = [];
  document
    .querySelectorAll("input[name='contact_list']:checked")
    .forEach(function (e) {
      contactList.push(e.value);
    });
  var contact_list = contactList;
  var groupId = document.querySelector(".user_detail h6").innerHTML;
  socket.emit("addGroupContacts", { contact_list, groupId, userId });
  document.getElementById("close_contact_model").click();
  document.querySelector(".add_contact_form").reset();
});

// group message append function
socket.on(
  "group message",
  function ({
    id,
    message,
    sender_id,
    group_id,
    receiverName,
    receiverImage,
    file_upload,
    createdAt,
  }) {
    var groupId = document.querySelector(".user_detail h6") ? document.querySelector(".user_detail h6").innerHTML : '';

    if (groupId != group_id) {
      var unread_msg = document.getElementById("group_list_" + group_id).querySelector(".unread_msg").getAttribute("data-msg");
      var unread_count = parseInt(unread_msg) + 1;
      document.getElementById("group_list_" + group_id).querySelector(".unread_msg").setAttribute("data-msg", unread_count);
      document.getElementById("group_list_" + group_id).querySelector(".unread_msg").innerHTML = unread_count;
    } else {
      var unread = 0;
      socket.emit("unreadGroupMsgUpdate", { groupId, userId, unread });
      addGroupMessage({
        id,
        message: message,
        user: sender_id,
        receiverName,
        receiverImage,
        file_upload,
        image,
        createdAt,
      });
    }
    scrollToBottom();

  }
);

// group message append By message submit
const addGroupMessage = ({
  id,
  message,
  user,
  receiverName,
  receiverImage,
  file_upload,
  image,
  createdAt,
}) => {
  const time = new Date(createdAt);
  const created_at =
    time.getDate() +
    "-" +
    (time.getMonth() + 1) +
    "-" +
    time.getFullYear() +
    " " +
    time.getHours() +
    ":" +
    time.getMinutes();

  var none = file_upload == "" ? "none" : "block";
  var none_editBtn = file_upload != "" ? "none" : "block";
  var receiver_image = receiverImage
    ? `<img src="assets/images/users/${receiverImage}" alt="">`
    : `<div class="avatar-xs"><span class="avatar-title rounded-circle bg-soft-primary text-primary">${receiverName[0]}</span></div>`;
  var sender_image = image
    ? `<img src="assets/images/users/${image}" alt="">`
    : `<div class="avatar-xs"><span class="avatar-title rounded-circle bg-soft-primary text-primary">${username[0]}</span></div>`;

  var extName = file_upload.split(".").pop();
  var imgList = ["gif", "mp4", "mp3"];
  if (!imgList.includes(extName)) {
    var image = `<ul class="list-inline message-img  mb-0">
                      <li class="list-inline-item message-img-list me-2 ms-0">
                          <div>
                              <a class="popup-img d-inline-block m-1" href="assets/images/image/${file_upload}" target="blank" title="${file_upload}">
                              `;
    if (file_upload) {
      image += `<img src='assets/images/image/${file_upload}' alt="${file_upload}" class="rounded border" />`;
    }
    image += `</a>
                          </div>
                          <div class="message-img-link">
                              <ul class="list-inline mb-0">
                                  <li class="list-inline-item">
                                      <a href="assets/images/image/${file_upload}" download="" class="text-muted">
                                          <i class="ri-download-2-line"></i>
                                      </a>
                                  </li>
                              </ul>
                          </div>
                      </li>
                  </ul>`;

    var group_image = `<div class="avatar-sm me-3 ms-0">
                  <div class="avatar-title bg-soft-primary text-primary rounded font-size-20">
                    <i class="ri-image-fill"></i>
                  </div>
                </div>`;
  } else {

    if ("mp4".includes(extName)) {
      var icon = `<i class="ri-video-line"></i>`;
    }

    if ("mp3".includes(extName)) {
      var icon = `<i class="ri-music-line"></i>`;
    }

    if ("gif".includes(extName)) {
      var icon = `<i class="ri-file-text-fill"></i>`;
    }

    var image = `<div class="card p-2 mb-2">
                      <div class="d-flex align-items-center attached-file">
                          <div class="avatar-sm me-3 ms-0">
                              <div class="avatar-title bg-soft-primary text-primary rounded font-size-20">
                                  ${icon}
                              </div>
                          </div>
                          <div class="flex-grow-1">
                              <div class="text-start">
                                  <h5 class="font-size-14 mb-1">${file_upload}</h5>
                              </div>
                          </div>
                          <div class="ms-4 me-0">
                              <ul class="list-inline mb-0 font-size-20">
                                  <li class="list-inline-item me-2 ms-0">
                                      <a href="assets/images/image/${file_upload}" class="text-muted" download="">
                                          <i class="ri-download-2-line"></i>
                                      </a>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>`;
    var group_image = `<div class="avatar-sm me-3 ms-0">
                  <div class="avatar-title bg-soft-primary text-primary rounded font-size-20">
                    ${icon}
                  </div>
                </div>`;
  }

  const receivedMsg = `
  <li class="group_msg_${id}">
          <div class="conversation-list">
            <div class="chat-avatar">
              ${receiver_image}
            </div>
            <div class="user-chat-content">
              <div class="ctext-wrap">
                <div class="ctext-wrap-content">
                  <div style="display:${none}">${image}</div>
                  <p class="mb-0 single_message text-break">${message}</p>
                  <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i> <span
                      class="align-middle">${created_at}</span></p>
                </div>
                <div class="dropdown align-self-start">
                  <a class="dropdown-toggle" href="javascript:void(0);" role="button" data-bs-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <i class="ri-more-2-fill"></i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-end">
                      <a class="dropdown-item" href="javascript:void(0)" id="${id}" onclick="groupMessageCopy(this)" style="display:${none_editBtn}">Copy <i class="ri-file-copy-line float-end text-muted"></i></a>
                      <a class="dropdown-item" href="javascript:void(0);" id="${id}" onclick="singleForwordMessage(this)" type="group"  data-bs-toggle="modal" data-bs-target="#forwardContact-Modal">Forward<i class="ri-chat-forward-line float-end text-muted"></i></a>
                  </div>
                </div>
              </div>
              <div class="conversation-name">${receiverName}</div>
            </div>
          </div>
        </li>
  `;

  const myMsg = `
  <li class="right group_msg_${id}">
          <div class="conversation-list">
            <div class="chat-avatar">
              ${sender_image}
            </div>
            <div class="user-chat-content">
              <div class="ctext-wrap">
                <div class="ctext-wrap-content">
                  <div style="display:${none}">${image}</div>
                  <p class="mb-0 single_message text-break">${message}</p>
                  <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i> <span
                      class="align-middle">${created_at}</span></p>
                </div>
                <div class="dropdown align-self-start">
                  <a class="dropdown-toggle" href="javascript:void(0);" role="button" data-bs-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <i class="ri-more-2-fill"></i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-end">
                      <a class="dropdown-item" href="javascript:void(0)" id="${id}" onclick="groupMessageCopy(this)">Copy <i
                      class="ri-file-copy-line float-end text-muted"></i></a>
                      <a class="dropdown-item" href="javascript:void(0);" id="${id}" onclick="multiMessageUpdate(this)">Edit <i class="ri-save-line float-end text-muted"></i></a>
                      <a class="dropdown-item" href="javascript:void(0);" id="${user}" onclick="singleForwordMessage(this)" data-bs-toggle="modal" data-bs-target="#forwardContact-Modal">Forward<i class="ri-chat-forward-line float-end text-muted"></i></a>
                      <a class="dropdown-item" href="javascript:void(0);" id="${id}" onclick="groupMsgDelete(this)">Delete <i
                      class="ri-delete-bin-line float-end text-muted"></i></a>
                  </div>
                </div>
              </div>
              <div class="conversation-name">${username}</div>
            </div>
          </div>
    </li>`;
  messageBox.innerHTML += user == userId ? '' : receivedMsg;

  if (file_upload) {
    const receiverMessage = `
    <div class="card p-2 border mb-2 group_msg_${id}">
    <div class="d-flex align-items-center">
      ${group_image}
      <div class="flex-grow-1 overflow-hidden">
        <div class="text-start">
          <h5 class="font-size-14 text-truncate mb-1">${file_upload}</h5>
        </div>
      </div>

      <div class="ms-4 me-0">
        <ul class="list-inline mb-0 font-size-18">
          <li class="list-inline-item">
            <a href="assets/images/image/${file_upload}" download="" class="text-muted px-1">
              <i class="ri-download-2-line"></i>
            </a>
          </li>
          <li class="list-inline-item dropdown">
            <a class="dropdown-toggle text-muted px-1" href="javascript:void(0);" role="button"
              data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="ri-more-fill"></i>
            </a>
            <div class="dropdown-menu dropdown-menu-end">
              <a class="dropdown-item" href="javascript:void(0);" id="${id}" onclick="groupMsgDelete(this)">Delete</a>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
    `;
    document.querySelector(".receiver_messageData").innerHTML += user == userId ? '' : receiverMessage;
  }

};

/**
 * Onload Data Get
 */
// Group Search
searchGroup.addEventListener("keyup", function () {
  var searchVal = searchGroup.value;
  socket.emit("searchGroupValue", { searchVal, userId });
  groupsList.innerHTML = "";
});

// Get Contact List
socket.emit("contactIdByUser", userId);
socket.on("groupLists", ({ groups }) => {
  groupsList.innerHTML = '';
  groups.forEach((group) => {
    const userBox = `
    <li id="group_list_${group.group_id[0]}">
      <a href="javascript:void(0);" onclick="contact_group('${group.group_id[0]
      }', '${group.name}', '${userId}')">
        <div class="d-flex align-items-center">
          <div class="chat-user-img me-3 ms-0">
            <div class="avatar-xs">
              <span class="avatar-title rounded-circle bg-soft-primary text-primary">
              ${group.name[0] ? group.name[0][0] : ''}
              </span>
            </div>
          </div>
          <div class="flex-grow-1 overflow-hidden">
            <h5 class="text-truncate font-size-14 mb-0"><span class="group_name">${group.name}</span> <span data-msg='${group.unread}' class="badge badge-soft-danger rounded-pill float-end unread_msg jxhbg">${group.unread ? group.unread : ""
      }</span></h5>
          </div>
        </div>
      </a>
    </li>
  `;
    groupsList.innerHTML += userBox;
  });
});

// Group Data Append Topbar
function contact_group(groupsId, groupName, userId) {
  socket.emit("contactsDetail", groupsId, userId);
  document.querySelector(".messages__history").setAttribute("id", "g_chat_" + groupsId);
  document.querySelector(".user-chat").style.display = "block";
  document.querySelector(".online_contactList").innerHTML = "";

  startm = scrolli = 0
  userhtml = GroupMessage(groupsId, groupName);
  startm = 10

  document.getElementById('group_list_' + groupsId).querySelector('.rounded-pill').innerHTML = '';

  if (document.querySelector('.group_list li')) {
    const remove_active = document.querySelectorAll('.group_list li');
    Array.from(remove_active).forEach((element, index) => {
      element.classList.remove('active');
    });
    document.getElementById('group_list_' + groupsId) ? document.getElementById('group_list_' + groupsId).classList.add('active') : '';
  }

  document.getElementsByClassName("chat-welcome-section")[0].style.display = "none";
  document.getElementsByClassName("chat-conversation")[0].style.display = "block";
  document.getElementsByClassName("chat-input-section")[0].style.display = "block";
  document.getElementById("userProfileBar").style.display = "flex";
  document.getElementById("group_list_" + groupsId).querySelector(".unread_msg").setAttribute("data-msg", '0');
  document.querySelector('.receiver_status').innerHTML = '<i class="ri-record-circle-fill font-size-10 text-success d-inline-block ms-1"></i> Active';
  document.getElementById('message_search').value = '';

  scrollToBottom();
}

socket.on("groupInfo", ({ group }) => {
  document.getElementById('vcimg').innerHTML = `<span class="avatar-title rounded-circle bg-soft-primary text-primary group_img">${group.name[0]}</span>`
  const userBox = `
    <div class="d-block d-lg-none me-2 ms-0">
      <a href="javascript: void(0);" class="user-chat-remove text-muted font-size-16 p-2"><i
          class="ri-arrow-left-s-line"></i></a>
    </div>
    <div class="me-3 ms-0 avatar-xs">
    <span class="avatar-title rounded-circle bg-soft-primary text-primary group_img flex-shrink-0">${group.name[0]}</span>
    </div>
    <div class="flex-grow-1">
      <h5 class="font-size-16 mb-0 message_typing"><a href="javascript:void(0)" class="text-reset user-profile-show receiver_name" onclick="profile_show(this.id)">${group.name}</a> <i class="ri-record-circle-fill font-size-10 text-success d-inline-block ms-1"></i>
      </h5>
      <span class="lh-base typing_${group._id}"></span>
      <h6>${group._id}</h6>
    </div>
  `;
  userChat.innerHTML = userBox;

  const receiverData = `
        <div class="float-end">
          <button type="button" class="btn btn-light btn-sm" id="group_edit" onclick="edit_groupName(this)"><i class="ri-edit-fill me-1 ms-0 align-middle"></i> Edit</button>
        </div>
        <div>
          <p class="text-muted mb-1">Name</p>
          <h5 class="font-size-14 receiver_name" id="receiver_name">${group.Name}</h5>
          <div id="edit-group-name" class="visually-hidden d-flex justify-content-between">
            <input type="text" name="name" id="receivername" value=""
              class="form-control bg-soft-light border-light" maxlength="20"/>
            <div class="float-right">
              <button type="submit" id="receiverSave" onclick="groupNameChange(this)"
                class="btn btn-primary btn-block waves-effect waves-light" style="display: block;">
                Save</button>
            </div>
          </div>
        </div>
        <div class="dropdown-divider"></div>
      <div class="exit_group"></div>
    `;
  document.querySelector(".group_receiverData").innerHTML = receiverData;
  document.querySelector(".user_detail h6").style.display = "none";

  document.getElementById('headerimg').setAttribute('src', `assets/images/users/default_image.jpg`);
  document.getElementById('acimg').innerHTML = `<span class="avatar-title rounded-circle bg-soft-primary text-primary group_img">${group.name[0]}</span>`;
  document.getElementById('sameid').innerHTML = group._id;
  document.getElementById('vausername-input').value = group._id;

  const np = document.querySelectorAll('.vcname');
  Array.from(np).forEach((element) => {
    element.innerHTML = group.name;
  });
  document.querySelector("#type").innerHTML = 'Groupcall';
  document.querySelector(".videocallicon").style.display = 'none';
  document.querySelector(".audiocallicon").style.display = 'none';

  document.querySelector(".receiver_img").innerHTML = `<div class="avatar-md h4 mx-auto"><span class="avatar-title rounded-circle bg-soft-primary text-primary group_img">${group.name[0]}</span></div>`;
  var receiverName = document.querySelectorAll(".receiver_name");
  Array.from(receiverName).forEach((element, index) => {
    element.innerHTML = group.name;
  });
});

/**
 * Onclick data get
 */
// Contact Message Get
function GroupMessage(groupId, groupName) {
  socket.emit('groupClick', { groupId, userId, startm });
  socket.emit("online_user", {
    nick: username,
    Image: image,
    groupId: groupId,
    senderId: userId
  });
}

// Online contact List
socket.on('onlineContact', ({ online }) => {
  online.forEach(online_contact => {
    document.querySelector('#contact_list_' + online_contact + ' .chat-user-img') ? document.querySelector('#contact_list_' + online_contact + ' .chat-user-img').classList.add('online') : '';
  });
});

socket.on("group-add", ({ grp_id, name, description, userId }) => {
  const userBox = `
  <li id="group_list_${grp_id}">
    <a href="javascript:void(0);" onclick="contact_group('${grp_id
    }', '${name}', '${userId}')">
      <div class="d-flex align-items-center">
        <div class="chat-user-img me-3 ms-0">
          <div class="avatar-xs">
            <span class="avatar-title rounded-circle bg-soft-primary text-primary">
            ${name[0] ? name[0][0] : ''}
            </span>
          </div>
        </div>
        <div class="flex-grow-1 overflow-hidden">
          <h5 class="text-truncate font-size-14 mb-0"><span class="group_name">${name}</span> <span data-msg='0' class="badge badge-soft-danger rounded-pill float-end unread_msg jxhbg"></span></h5>
        </div>
      </div>
    </a>
  </li>
`;
  groupsList.innerHTML += userBox;
});

socket.on("addGroup", ({ groups }) => {
  const add_group = `
    <li id="group_list_${groups._id}">
      <a href="javascript:void(0);" onclick="contact_group('${groups._id
    }', '${groups.name}', '${groups.userId}')">
        <div class="d-flex align-items-center">
          <div class="chat-user-img me-3 ms-0">
            <div class="avatar-xs">
              <span class="avatar-title rounded-circle bg-soft-primary text-primary">
              ${groups.name[0][0]}
              </span>
            </div>
          </div>
          <div class="flex-grow-1 overflow-hidden">
            <h5 class="text-truncate font-size-14 mb-0"><span class="group_name">${groups.name}</span> <span data-msg='0' class="badge badge-soft-danger rounded-pill float-end unread_msg jxhbg"></span></h5>
          </div>
        </div>
      </a>
    </li>
  `;
  groupsList.innerHTML += add_group;
});

/** Group Detaile disply--------------*/
socket.on("groupDetail", ({ groupUsers, groupId }) => {

  if (document.getElementById("g_chat_" + groupId) != undefined) {
    var conar = [];
    var admbr = [];
    mcontact_list.forEach((mc) => {
      conar.push(mc.user_id);
    });
    groupUsers.forEach((gc) => {
      admbr.push(gc.user_id[0]);
    });

    addmbr = conar.filter(item => !admbr.includes(item));
    document.querySelector(".addcontactGroup").innerHTML = '';

    /** add member to group **/
    addmbr.forEach((member) => {
      var cnam;
      mcontact_list.forEach((mc) => {
        if (member == mc.user_id) {
          cnam = mc.name;
        }
      });

      const contactList = `
      <li>
        <div class="form-check">
          <input type="checkbox" class="form-check-input" id="add_contact_${member}" name="contact_list" value="${member}">
          <label class="form-check-label" for="add_contact_${member}">${cnam}</label>
        </div>
      </li>
    `;
      document.querySelector(".addcontactGroup").innerHTML += contactList;
    });

    document.querySelector(".online_contactList").innerHTML = "";
    var remove_icon = '';
    var admin_c = 0;
    groupUsers.forEach((contact) => {
      if (contact.is_admin == 1 && contact.user_id[0] == userId) {
        admin_c = 1;
        document.querySelector('.online_contact_list li').classList.remove('d-none');
        setTimeout(function () {
          document.querySelector(".exit_group").innerHTML = "";
          let exit_btn = `<a class="dropdown-item text-danger" onclick="deleteGroup('${contact.group_id}')" href="javascript:void(0);">Delete Group<i class="ri-delete-bin-line float-end text-danger"></i></a>`
          document.querySelector(".exit_group").innerHTML += exit_btn;
        }, 800);
      }
    });

    if (admin_c == 0) {
      document.querySelector('.online_contact_list li').classList.add('d-none');
      setTimeout(function () {
        document.querySelector(".exit_group") ? document.querySelector(".exit_group").innerHTML = "" : '';
        let exit_btn = `<a class="dropdown-item text-danger" id="${userId}" onclick="deleteGroupMember(this.id)" href="javascript:void(0);">Exit Group<i class="ri-delete-bin-line float-end text-danger"></i></a>`
        document.querySelector(".exit_group") ? document.querySelector(".exit_group").innerHTML += exit_btn : '';
      }, 800)
    }

    groupUsers.forEach((contact) => {
      var contactName = contact.contactName != '' ? contact.contactName : contact.name;
      var group_admin = contact.is_admin == 1 ? `Group Admin` : ``;
      if (contact.is_admin == 1) {
        var contact_id = contact.contact_id;
        document.querySelector(".receiver_data").setAttribute("id", contact_id);
      }

      var iconRemove = '';
      if (contact.is_admin == 1 && admin_c != 0) {
      }
      if (contact.is_admin != 1 && admin_c != 0) {
        remove_icon = `<i class="ri-close-line text-danger" id="${contact.contact_id}" onclick="deleteGroupUser(this.id)"></i>`;
        iconRemove = remove_icon;
      }
      if (contact.contact_id != userId) {
        groupcallContact.push(contact.contact_id);
      }

      const online_users = `
      <li id="contact_list_${contact.contact_id}">
      <a href="javascript:void(0);">
      <div class="d-flex align-items-center">
      <div class="chat-user-img me-3 ms-0">
      <div class="avatar-xs">
      <span class="avatar-title rounded-circle bg-soft-primary text-primary">
      ${contact.name[0][0]}
      </span>
      </div>
      </div>
      <div class="flex-grow-1 overflow-hidden">
      <h5 class="text-truncate font-size-14 mb-0" <span data-msg='0' class="badge badge-soft-danger rounded-pill float-end jxhbg"></span>${contactName}</h5>
      </div>
      ${iconRemove} <span class="bg-success text-white badge">${group_admin}</span>
      </div>
      </a>
      </li>`;
      document.querySelector(".online_contactList").innerHTML += online_users;

      if (document.getElementById("add_contact_" + contact.user_id) != null) {
        document.getElementById("add_contact_" + contact.user_id).checked = true ? 'checked' : '';
      }
    });
  }
});

//--------------------- grp Message Append ---------------------------------------
socket.on('groupMessage', ({ groups, msgno }) => {
  messageBox.innerHTML = '';
  msgtno = msgno
  document.querySelector('.receiver_messageData').innerHTML = '';
  $('.messages__history').html('')
  addgchat(groups)
  scrolli = $(".messages__history").height()
});

//--------------------- grp pg Message Append ---------------------------------------
socket.on('gchat-pg', ({ groups }) => {
  scrolli = $(".messages__history").height()
  addgchat(groups)
  $('#messageBody .simplebar-content-wrapper').scrollTop($(".messages__history").height() - scrolli);
});

let addgchat = groups => {
  document.querySelector(".receiver_messageData").innerHTML = '';
  groups.forEach((group) => {
    var none = group.file_upload == "" ? "none" : "block";
    var none_editBtn = group.file_upload != "" ? "none" : "block";
    const time = new Date(group.createdAt);
    const createdAt =
      time.getDate() +
      "-" +
      (time.getMonth() + 1) +
      "-" +
      time.getFullYear() +
      " " +
      time.getHours() +
      ":" +
      time.getMinutes();
    var receiver_image = group.image[0] ? `<img src="assets/images/users/${group.image[0]}" alt="">` : `<div class="avatar-xs"><span class="avatar-title rounded-circle bg-soft-primary text-primary">${group.name[0][0]}</span></div>`;
    var extName = group.file_upload.split(".").pop();
    var attachedList = ["gif", "mp4", "mp3"];
    var imgList = ["jpg", "jpeg", "png"];
    if (imgList.includes(extName)) {
      var image = `<ul class="list-inline message-img  mb-0">
                        <li class="list-inline-item message-img-list me-2 ms-0">
                            <div>
                                <a class="popup-img d-inline-block m-1" href="assets/images/image/${group.file_upload}" target="blank" title="${group.file_upload}">
                                <img src='assets/images/image/${group.file_upload}' alt="${group.file_upload}" class="rounded border" /></a>
                            </div>
                            <div class="message-img-link">
                                <ul class="list-inline mb-0">
                                    <li class="list-inline-item">
                                        <a href="assets/images/image/${group.file_upload}" download="" class="text-muted">
                                            <i class="ri-download-2-line"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>`;

      var group_image = `<div class="avatar-sm me-3 ms-0">
            <div class="avatar-title bg-soft-primary text-primary rounded font-size-20">
              <i class="ri-image-fill"></i>
            </div>
          </div>`;
    } 
    else if(attachedList.includes(extName)) {
      if ("mp4".includes(extName)) {
        var icon = `<i class="ri-video-line"></i>`;
      }

      if ("mp3".includes(extName)) {
        var icon = `<i class="ri-music-line"></i>`;
      }

      if ("gif".includes(extName)) {
        var icon = `<i class="ri-file-text-fill"></i>`;
      }
      var attachedFile = `<div class="card p-2 mb-2">
                        <div class="d-flex align-items-center attached-file">
                            <div class="avatar-sm me-3 ms-0">
                                <div class="avatar-title bg-soft-primary text-primary rounded font-size-20">
                                   ${icon}
                                </div>
                            </div>
                            <div class="flex-grow-1">
                                <div class="text-start">
                                    <h5 class="font-size-14 mb-1">${group.file_upload}</h5>
                                </div>
                            </div>
                            <div class="ms-4 me-0">
                                <ul class="list-inline mb-0 font-size-20">
                                    <li class="list-inline-item me-2 ms-0">
                                        <a href="assets/images/image/${group.file_upload}" class="text-muted" download="">
                                            <i class="ri-download-2-line"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>`;

      var group_image = `<div class="avatar-sm me-3 ms-0">
            <div class="avatar-title bg-soft-primary text-primary rounded font-size-20">
              ${icon}
            </div>
          </div>`;
    }
    else{
      var message = `<p class="mb-0 single_message text-break">${group.message}</p>`;
    }
    const receivedMsg = `
      <li class="group_msg_${group._id}">
          <div class="conversation-list">
            <div class="chat-avatar">
              ${receiver_image}
            </div>
            <div class="user-chat-content">
              <div class="ctext-wrap">
                <div class="ctext-wrap-content">
                  ${image != undefined?image:''}
                  ${attachedFile != undefined?attachedFile:''}
                  ${message != undefined?message:''} 
                  <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i> <span
                      class="align-middle">${createdAt}</span></p>
                </div>
                <div class="dropdown align-self-start">
                  <a class="dropdown-toggle" href="javascript:void(0);" role="button" data-bs-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <i class="ri-more-2-fill"></i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item" href="javascript:void(0)" id="${group._id}" onclick="groupMessageCopy(this)" style="display:${none_editBtn}">Copy <i class="ri-file-copy-line float-end text-muted"></i></a>
                    <a class="dropdown-item" href="javascript:void(0);" id="${group._id}" onclick="singleForwordMessage(this)" type="group" data-bs-toggle="modal" data-bs-target="#forwardContact-Modal">Forward<i class="ri-chat-forward-line float-end text-muted"></i></a>
                  </div>
                </div>
              </div>
              <div class="conversation-name">${group.name[0]}</div>
            </div>
          </div>
        </li>
      `;

    const myMsg = `
      <li class="right group_msg_${group._id}">
          <div class="conversation-list">
            <div class="chat-avatar">
              ${receiver_image}
            </div>
            <div class="user-chat-content">
              <div class="ctext-wrap">
                <div class="ctext-wrap-content">
                  ${image != undefined?image:''}
                  ${attachedFile != undefined?attachedFile:''}
                  ${message != undefined?message:''}                  
                  <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i> <span class="align-middle">${createdAt}</span></p>
                </div>
  
                <div class="dropdown align-self-start">
                  <a class="dropdown-toggle" href="javascript:void(0);" role="button" data-bs-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <i class="ri-more-2-fill"></i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item" href="javascript:void(0)" id="${group._id}" onclick="groupMessageCopy(this)" style="display:${none_editBtn}">Copy <i class="ri-file-copy-line float-end text-muted"></i></a>
                        <a class="dropdown-item" href="javascript:void(0);" id="${group._id}" onclick="multiMessageUpdate(this)" style="display:${none_editBtn}">Edit <i class="ri-save-line float-end text-muted"></i></a>
                        <a class="dropdown-item" href="javascript:void(0);" id="${group._id}" onclick="singleForwordMessage(this)" type="group" data-bs-toggle="modal" data-bs-target="#forwardContact-Modal">Forward<i class="ri-chat-forward-line float-end text-muted"></i></a>
                    <a class="dropdown-item" href="javascript:void(0);" id="${group._id}" onclick="groupMsgDelete(this)">Delete <i
                        class="ri-delete-bin-line float-end text-muted"></i></a>
                  </div>
                </div>
              </div>
  
              <div class="conversation-name">${username}</div>
            </div>
          </div>
        </li>
      `;
    $('.messages__history').prepend(userId === group.sender_id ? myMsg : receivedMsg)

    if (group.file_upload) {
      const receiverMessage = `
        <div class="card p-2 border mb-2 group_msg_${group._id}">
        <div class="d-flex align-items-center">
          ${group_image}
          <div class="flex-grow-1 overflow-hidden">
            <div class="text-start">
              <h5 class="font-size-14 text-truncate mb-1">${group.file_upload}</h5>
            </div>
          </div>
  
          <div class="ms-4 me-0">
            <ul class="list-inline mb-0 font-size-18">
              <li class="list-inline-item">
                <a href="assets/images/image/${group.file_upload}" download="" class="text-muted px-1">
                  <i class="ri-download-2-line"></i>
                </a>
              </li>
              <li class="list-inline-item dropdown">
                <a class="dropdown-toggle text-muted px-1" href="javascript:void(0);" role="button"
                  data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="ri-more-fill"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-end">
                  <a class="dropdown-item" href="javascript:void(0);" id="${group._id}" onclick="groupMsgDelete(this)">Delete</a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
        `;
      document.querySelector(".receiver_messageData").innerHTML += receiverMessage;
    }
  });
}

/** Onclick Functions */
// Group Message Copy
function groupMessageCopy(message) {
  const copy_text = document.querySelector(
    ".group_msg_" + message.id + " .single_message"
  ).innerText;
  navigator.clipboard.writeText(copy_text);
}

// Group Message Update
function multiMessageUpdate(messages) {
  const message_id = messages.id;
  const copy_text = messages.parentElement.parentElement.parentElement.querySelector("p.single_message").innerText;
  document.querySelector(".message_form__input").value = copy_text;
  document.querySelector(".col-auto .list-inline .remove_value").innerHTML = `<button type="button" class="btn btn-link text-decoration-none font-size-16 btn-lg waves-effect"><i class="ri-close-line text-danger" onclick="removeEditMsg(this)"></i></div></button>`;
  document.querySelector(".message_id").setAttribute("value", message_id);
}
socket.on("groupMessage_update", function ({ messageId, message, groupId }) {
  if (document.getElementById("g_chat_" + groupId) != null) {
    document.querySelector(
      ".group_msg_" + messageId + " .single_message"
    ).innerHTML = message;
  }
});

// Group Message Delete
function groupMsgDelete(message) {
  const message_id = message.id;
  var groupId = document.querySelector(".user_detail h6").innerHTML;
  socket.emit("group_msg_delete", { message_id, groupId });
  var remove_group_msg = document.querySelectorAll(".group_msg_" + message.id);
  Array.from(remove_group_msg).forEach((element, index) => {
    element.remove();
  });
}
socket.on("group_msg_delete", function ({ message_id, groupId }) {
  if (document.getElementById("g_chat_" + groupId) != null) {
    var remove_group_msg = document.querySelectorAll(
      ".group_msg_" + message_id
    );
    Array.from(remove_group_msg).forEach((element, index) => {
      element.remove();
    });
  }
});

// Profile Show
function profile_show(profile) {
  document.querySelector('.user-profile-sidebar').style.display = "block";
}

// Delete Group
function deleteGroup(id) {
  swal({
    title: `Are you sure you want to delete this group?`,
    text: "If you delete this, it will be gone forever.",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
    .then((willDelete) => {
      if (willDelete) {
        socket.emit("group_delete", { id });
      }
    });
};

socket.on("group_delete", function ({ id }) {
  document.getElementById("group_list_" + id) ? document.getElementById("group_list_" + id).remove() : '';
  document.getElementsByClassName("chat-conversation")[0].style.display = "none";
  document.getElementById("userProfileBar").style.display = "none";
  document.querySelector(".user-profile-sidebar").style.display = "none";
  document.getElementsByClassName("chat-welcome-section")[0].style.display = "flex";
});

// Delete Group Member
function deleteGroupMember(id) {
  var group_id = document.querySelector(".user_detail h6").innerHTML;
  swal({
    title: `Are you sure you want to delete this group?`,
    text: "If you delete this, it will be gone forever.",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
    .then((willDelete) => {
      if (willDelete) {
        socket.emit("group_delete_member", { id, group_id });
        var receiverId = document.querySelector(".user_detail h6").innerHTML;
        document.getElementById("group_list_" + receiverId).remove();
        document.getElementsByClassName("chat-conversation")[0].style.display = "none";
        document.getElementById("userProfileBar").style.display = "none";
        document.querySelector(".user-profile-sidebar").style.display = "none";
        document.getElementsByClassName("chat-welcome-section")[0].style.display = "flex";
      }
    });

}

socket.on("group_delete_member", function ({ id, group_id }) {
  var contact_name = document.querySelector("#contact_list_" + id + " h5").innerHTML;
  const contactList = `
    <li>
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="add_contact_${id}" name="contact_list" value="${id}">
        <label class="form-check-label" for="add_contact_${id}">${contact_name}</label>
      </div>
    </li>
    `;
  document.querySelector(".addcontactGroup").innerHTML += contactList;
  var remove_group_msg = document.querySelectorAll("#contact_list_" + id);
  Array.from(remove_group_msg).forEach((element, index) => {
    element.remove();
  });
});


// Delete Group User
function deleteGroupUser(id) {
  var group_id = document.querySelector(".user_detail h6").innerHTML;
  socket.emit("deleteGroupUser", { id, group_id });
  var contact_name = document.querySelector("#contact_list_" + id + " h5").innerHTML;
  const contactList = `
    <li>
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="add_contact_${id}" name="contact_list" value="${id}">
        <label class="form-check-label" for="add_contact_${id}">${contact_name}</label>
      </div>
    </li>
    `;
  document.querySelector(".addcontactGroup").innerHTML += contactList;
  var remove_group_msg = document.querySelectorAll("#contact_list_" + id);
  Array.from(remove_group_msg).forEach((element, index) => {
    element.remove();
  });

}

socket.on("deleteGroupUser", function ({ id, group_id }) {
  if (id == userId) {
    document.getElementById("group_list_" + group_id).remove();
    if (document.getElementById("g_chat_" + group_id) != undefined) {
      document.getElementsByClassName("chat-conversation")[0].style.display = "none";
      document.getElementById("userProfileBar").style.display = "none";
      document.querySelector(".user-profile-sidebar").style.display = "none";
      document.getElementsByClassName("chat-welcome-section")[0].style.display = "flex";
    }
  } else {
    document.getElementById("contact_list_" + id) ? document.getElementById("contact_list_" + id).remove() : '';
  }
});

/**
 * Custom Function
 */
// Current User data
socket.emit("currentUser", { userId });
socket.on("currentUser", function ({ userInfo }) {
  var user_Notification = userInfo.notification;
  var userMute_Notification = userInfo.is_muted;
  var preview = document.querySelectorAll(".user-profile-image");
  var userImage = document.querySelectorAll(".userProfile");
  var userName = document.querySelectorAll(".user_name");
  var userEmail = document.querySelectorAll(".user_email");
  var userTime = document.querySelectorAll(".user_time");
  var userLocation = document.querySelectorAll(".user_location");

  Array.from(preview).forEach((element, index) => {
    var profile_img = userInfo.image ? userInfo.image : "default_image.jpg";
    element.src = `assets/images/users/${profile_img}`;
  });
  Array.from(userName).forEach((element, index) => {
    element.innerHTML = userInfo.name;
  });
  Array.from(userEmail).forEach((element, index) => {
    element.innerHTML = userInfo.email;
  });
  Array.from(userTime).forEach((element, index) => {
    const time = new Date(userInfo.createdAt);
    const createdAt =
      time.getDate() +
      "-" +
      (time.getMonth() + 1) +
      "-" +
      time.getFullYear() +
      "&ensp;" +
      time.getHours() +
      ":" +
      time.getMinutes();
    element.innerHTML = createdAt;
  });
  Array.from(userLocation).forEach((element, index) => {
    element.innerHTML = userInfo.location;
  });

  if (userInfo._id == userId) {
    user_Notification == 1 ? (document.getElementById("security-notificationswitch").checked = true) : "";
    userMute_Notification == 1 ? (document.getElementById("notification_muted_switch").checked = true) : "";
  }

});

// Image Upload add message form
document.querySelector("#upload_input").addEventListener("change", function () {
  webcam = null;
  var preview = document.querySelectorAll(".file_Upload");
  var file = document.querySelector(".upload_input").files[0];

  var reader = new FileReader();
  reader.addEventListener(
    "load",
    function () {
      Array.from(preview).forEach((element, index) => {
        var filename = file.name;
        var extName = filename.split(".").pop();
        var imgList = ["gif", "mp4", "mp3"];

        if (!imgList.includes(extName)) {
          var image = `<img src='${reader.result}' class='profile-user border border-light bg-white rounded' height="300" width=350>`;
        } else {
          if ('mp4'.includes(extName)) {
            var image = `<video width="400" controls><source src="${reader.result}" id="video_here"></video>`;
          }
          if ('mp3'.includes(extName)) {
            var image = `<video width="400" controls><source src="${reader.result}" id="video_here"></video>`;
          }
        }
        element.innerHTML = `<div class="image_pre d-inline-block position-relative">${image}<i class="ri-close-line text-danger image-remove end-0 top-0 px-1" onclick="deleteImage(this)"></i></div>`;
      });
    },
    false
  );
  if (file) {
    reader.readAsDataURL(file);
  }
});

// Delete Upload Preview Image
function deleteImage(image) {
  image.closest(".image_pre").remove();
  document.getElementById("upload_input").value = "";
  webcam = null;
}

// Edit Msg Remove
function removeEditMsg(image) {
  image.closest("li .remove_value .btn").remove();
  inputField.value = "";
  document.querySelector(".message_id").setAttribute("value", '');
}

// Message Scrolle Top/ Bottom 
function scrollToBottom() {
  var simpleBar = document.querySelector("#messageBody .simplebar-content-wrapper");
  var offsetHeight = document.getElementsByClassName("messages__history")[0] ? document.getElementsByClassName("messages__history")[0].scrollHeight - window.innerHeight + 250 : 0;
  if (offsetHeight)
    simpleBar.scrollTo({ top: offsetHeight, behavior: "smooth" });
}

// Message Pagination

setTimeout(() => {
  $("#messageBody .simplebar-content-wrapper").on('scroll', function () {
    if ($("#messageBody .simplebar-content-wrapper").scrollTop() == 0) {
      if (msgtno > startm) {

        let rid = document.querySelector(".user_detail h6").innerHTML
        var form_class = document.getElementById("chat_add").getAttribute("class");
        if (form_class == 'message_form')
          socket.emit("userClick", { id: rid, startm });
        if (form_class == 'group_form')
          socket.emit('groupClick', { groupId: rid, startm });
        startm += 10
      }
    }
  });
}, 800);

/** Current User Data**/
// Profile Upload and Update
document.getElementById("user_edit").onclick = function () {
  document
    .getElementById("setting_user_name")
    .classList.toggle("visually-hidden");
  document.getElementById("user_edit").classList.toggle("visually-hidden");
  document.getElementById("edit-name").classList.toggle("visually-hidden");

  var username = document.getElementById("setting_user_name").textContent;
  document.getElementById("usrname").value = username;

  socket.emit("currentUser", { userId });
  socket.on("currentUser", function ({ userInfo }) { });
};

// current user name edit
document.getElementById("usrname").addEventListener('keydown', function (e) {
  if (this.value.length === 0 && e.which === 32) e.preventDefault();
});
document.querySelector("#btnSave").addEventListener("click", (e) => {
  e.preventDefault();
  var name = document.getElementById("usrname").value;
  if (name == '') {
    toastr.error(`Name is Rrequires`, "Error");
  }
  else {
    var userName = document.querySelectorAll(".user_name");
    Array.from(userName).forEach((element, index) => {
      element.innerHTML = name;
    });

    data = JSON.parse(localStorage.getItem("currentUser"));
    isvalue = Object.assign(data.data.user, { name: name });
    localStorage.setItem("currentUser", JSON.stringify(Object.assign(data, isvalue)));
    document
      .getElementById("setting_user_name")
      .classList.toggle("visually-hidden");
    document.getElementById("edit-name").classList.toggle("visually-hidden");
    document.getElementById("user_edit").classList.toggle("visually-hidden");
    username = name;
    socket.emit("updateUserName", { userId, name });
    socket.on("updateUserName", function ({ userInfo }) { });
  }

});

// Receiver Name Update
function edit_receiverName(message) {
  document.getElementById("receiver_name").classList.toggle("visually-hidden");
  document.getElementById("receiver_edit").classList.toggle("visually-hidden");
  document.getElementById("edit-receiver-name").classList.toggle("visually-hidden");
  var username = document.getElementById("receiver_name").textContent;
  document.getElementById("receivername").value = username;
};

// current user name edit
function cnameChange() {
  var receiverId = document.querySelector(".user_detail h6").innerHTML;
  var name = document.getElementById("receivername").value;
  if (name == '') {
    toastr.error(`Name is Rrequires`, "Error");
  }
  else {
    document.getElementById(receiverId).querySelector('h5').innerHTML = name;
    var before = document.getElementById("contact_" + receiverId).children[0].children[0].children[0].innerHTML[0];
    document.getElementById("contact_" + receiverId).querySelector('h5').innerHTML = name;
    var after = document.getElementById("contact_" + receiverId).children[0].children[0].children[0].innerHTML[0];
    const cntctlengthbf = document.getElementById("contact-sort-" + before).getElementsByTagName('li').length;
    if (cntctlengthbf <= 1) {
      var temp = document.getElementById('contact_' + receiverId).outerHTML;
      var el = document.createElement("div");
      el.className = 'px-3 font-weight-bold text-primary';
      el.id = `contact-of-${after}`;
      el.innerHTML = `<div class="contact-of-${after}">${after.toUpperCase()}</div>
      <ul id="contact-sort-${after}" class="list-unstyled contact-list">
      </ul>`;
      document.getElementById('contact-of-' + before).remove();
      var lastabcd;
      if (document.getElementById(`contact-sort-${after}`) == null) {
        const abcd = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        abcd.forEach(element => {
          if (document.getElementById(`contact-sort-${element}`) != null) {
            if (element < after) {
              lastabcd = element;
            }
          }
        })
        if (lastabcd == undefined || lastabcd == null) {
          document.querySelector('.sort-contact').prepend(el)
        } else {
          var lasttemp = document.getElementById(`contact-of-${lastabcd}`);
          lasttemp.parentNode.insertBefore(el, lasttemp.nextSibling);
        }
      }
      document.getElementById(`contact-sort-${after}`).innerHTML += temp;
    }
    else {
      var temp = document.getElementById('contact_' + receiverId).outerHTML;
      document.getElementById(`contact-sort-${before}`).querySelector(`#contact_${receiverId}`).remove();

      var el = document.createElement("div");
      el.className = 'px-3 font-weight-bold text-primary';
      el.id = `contact-of-${after}`;
      el.innerHTML = `<div class="contact-of-${after}">${after.toUpperCase()}</div>
      <ul id="contact-sort-${after}" class="list-unstyled contact-list">
      </ul>`;
      var lastabcd;
      if (document.getElementById(`contact-sort-${after}`) == null) {
        const abcd = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        abcd.forEach(element => {
          if (document.getElementById(`contact-sort-${element}`) != null) {
            if (element < after) {
              lastabcd = element;
            }
          }
        })
        if (lastabcd == undefined || lastabcd == null) {
          document.querySelector('.sort-contact').prepend(el)
        } else {
          var lasttemp = document.getElementById(`contact-of-${lastabcd}`);
          lasttemp.parentNode.insertBefore(el, lasttemp.nextSibling);
        }
      }
      document.getElementById(`contact-sort-${after}`).innerHTML += temp;
    }
    document.getElementById("receiver_name").classList.toggle("visually-hidden");
    document.getElementById("edit-receiver-name").classList.toggle("visually-hidden");
    document.getElementById("receiver_edit").classList.toggle("visually-hidden");
    var userName = document.querySelectorAll(".receiver_name");
    Array.from(userName).forEach((element, index) => {
      element.innerHTML = name;
    });
    var userImg = document.querySelectorAll(".contact_img");
    var ocimg = document.getElementById(receiverId).querySelectorAll(".onchangeimg");
    Array.from(userImg).forEach((element, index) => {
      element.innerHTML = name[0];
    });
    Array.from(ocimg).forEach((element, index) => {
      element.innerHTML = name[0];
    });
    socket.emit("updateReceiverName", { userId, receiverId, name });
  }
}

// Group Name Form Toggle class set
function edit_groupName(message) {
  document.getElementById("receiver_name").classList.toggle("visually-hidden");
  document.getElementById("group_edit").classList.toggle("visually-hidden");
  document.getElementById("edit-group-name").classList.toggle("visually-hidden");
  var username = document.getElementById("receiver_name").textContent;
  document.getElementById("receivername").value = username;
};

// Group Name Update
function groupNameChange() {
  var groupId = document.querySelector(".user_detail h6").innerHTML;
  var name = document.getElementById("receivername").value;
  document.getElementById("receiver_name").classList.toggle("visually-hidden");
  document.getElementById("edit-group-name").classList.toggle("visually-hidden");
  document.getElementById("group_edit").classList.toggle("visually-hidden");
  socket.emit("updateGroupName", { groupId, name });
}
socket.on("updateGroupName", function ({ groupId, name }) {
  document.getElementById('group_list_' + groupId).querySelector('.group_name').innerHTML = name;
  document.getElementById('group_list_' + groupId).querySelector('.chat-user-img .rounded-circle').innerHTML = name[0];
  var userName = document.querySelectorAll(".receiver_name");
  Array.from(userName).forEach((element, index) => {
    element.innerHTML = name;
  });
  var groupImg = document.querySelectorAll(".group_img");
  Array.from(groupImg).forEach((element, index) => {
    element.innerHTML = name[0];
  });
});

// Profile Image Update
document.querySelector("#profile-img-file-input").addEventListener("change", function () {
  var preview = document.querySelectorAll(".user-profile-image");
  var file = document.querySelector(".profile-img-file-input").files[0];
  var filename = file.name;
  var extName = filename.split(".").pop();
  var imgList = ["png", "jpg", "jpeg"];

  if (!imgList.includes(extName)) {
    toastr.error(`Invalid Image`, "Error");
  } else {
    var reader = new FileReader();
    reader.addEventListener(
      "load",
      function () {
        Array.from(preview).forEach((element, index) => {
          element.src = reader.result;
        });

        var receiverId = document.querySelector(".user_detail h6") ? document.querySelector(".user_detail h6").innerHTML : '';
        if (document.getElementById('s_chat_' + receiverId) != null) {
          var sender_img = document.querySelectorAll('.right .chat-avatar');
          Array.from(sender_img).forEach((element, index) => {
            element.innerHTML = `<img src="assets/images/users/${image}" class="rounded-circle avatar-xs" alt="">`;
          });
        }
      },
      false
    );
    if (file) {
      let formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", userId);
      fetch("/profileUpdate", { method: "POST", body: formData });
      reader.readAsDataURL(file);
      data = JSON.parse(localStorage.getItem("currentUser"));
      isvalue = Object.assign(data.data.user, { image: formData.get('file').name });
      localStorage.setItem("currentUser", JSON.stringify(data));
      image = filename;
      setimg(image);
    }
  }
});

socket.on("message_update1", function ({ userid, image }) {
  var form_class = document.getElementById("chat_add").getAttribute("class");
  if (form_class == 'message_form') {
    document.getElementById(userid) ? document.getElementById(userid).querySelector('a').click() : '';
    document.getElementById(userid) ? document.getElementById(userid).querySelector('.chat-user-img').innerHTML = `<img src="assets/images/users/${image}" class="rounded-circle avatar-xs" alt=""><span class="user-status"></span>` : '';
  }
  if (form_class == 'group_form') {
    document.getElementById(userid) ? document.getElementById(userid).querySelector('a').click() : '';
    document.getElementById(userid) ? document.getElementById(userid).querySelector('.chat-user-img').innerHTML = `<img src="assets/images/users/${image}" class="rounded-circle avatar-xs" alt=""><span class="user-status"></span>` : '';
  }
});


/**
 * Security Notification 
 */
// notification security on/off set
function notification_switch(src) {
  var checkbox = document.getElementById("security-notificationswitch");
  var notification = checkbox.checked == true ? 1 : 0;
  socket.emit("userNotification", {
    user_id: userId,
    notification: notification,
  });
}

// notification muted security on/off set
function notification_muted_switch(src) {
  var checkbox = document.getElementById("notification_muted_switch");
  var is_muted = checkbox.checked == true ? 1 : 0;
  socket.emit("userMutedNotification", {
    user_id: userId,
    is_muted: is_muted,
  });
}

// User Joined
socket.emit("new-user-joined", userId, username);
socket.on("user-connected", (socket_id, socket_name) => {
  document.getElementById(socket_id) ? document.getElementById(socket_id).querySelector('.chat-user-img').classList.add("online") : '';
  if (document.getElementById('s_chat_' + socket_id) != null) {
    document.querySelector('.user_status').classList.add('text-success');
    document.querySelector('.receiver_status').innerHTML = `<i class="ri-record-circle-fill font-size-10 text-success d-inline-block ms-1"></i> Online`;
  }
});

// User Disconnected
socket.on("user-disconnected", (socket_id) => {
  document.getElementById(socket_id) ? document.getElementById(socket_id).querySelector('.chat-user-img').classList.remove("online") : '';
  document.querySelector('.user_status') ? document.querySelector('.user_status').classList.remove('text-success') : '';
  document.querySelector('.receiver_status').innerHTML = `<i class="ri-record-circle-fill font-size-10 text-secondary d-inline-block ms-1"></i> Offline`;
});

// Online User List
socket.on("user-list", (users) => {
  user_arr = Object.values(users ? users : '');
  user_arr.pop(userId);
  for (i = 0; i < user_arr.length; i++) {
    // document.getElementById(user_arr[i]) ? document.getElementById(user_arr[i]).querySelector(" .chat-user-img").classList.add("online") : '';
  }
});

//------------------------SINGLE USER VIDEO/AUDIO CALL --------------------------------------------//

var audioring = new Audio('assets/notification/callertune.mp3');
var callerring = new Audio('assets/notification/call-ring.mp3');
var busyring = new Audio('assets/notification/busy.mp3');

let isactive = false;
let vausername
let localStream
let peerConn
let isAudio = true
let isVideo = true
let cutingphone
document.getElementById('closeincomingmodel').addEventListener('click', () => {
  var rspid = document.getElementById(`icvid`).innerHTML;
  callerring.pause();
  callerring.currentTime = 0;
  socket.emit('cutanswerd', rspid, document.getElementById(`calltype`).innerHTML);
})
document.getElementById('cutaudiocall').addEventListener('click', () => {
  var clid = document.getElementById(`sameid`).innerHTML;
  socket.emit('closevc', clid, 'audio');
  endvcall();
})
document.getElementById('cutcall').addEventListener('click', () => {
  var clid = document.getElementById(`sameid`).innerHTML;
  socket.emit('closevc', clid, 'video');
  endvcall();
})
document.getElementById('callaudiomodel').addEventListener('click', () => {
  if (document.getElementById('type').innerHTML == 'single') {
    document.getElementById(`audiotext`).style.display = 'Calling...';
    document.getElementById(`audiotext`).style.display = 'block';
    sendUsername('audio');
    startCall('audio');
  }
})
document.getElementById('callvideomodel').addEventListener('click', () => {
  if (document.getElementById('type').innerHTML == 'single') {
    document.getElementById(`calltext`).innerHTML = "Calling...";
    document.getElementById(`calltext`).style.display = 'block';
    sendUsername('video');
    startCall('video');
  }

})
document.getElementById('receivevcall').addEventListener('click', () => {
  callerring.pause();
  callerring.currentTime = 0;
  var rspid = document.getElementById(`icvid`).innerHTML;
  socket.emit('answerd', rspid, document.getElementById(`calltype`).innerHTML);
  if (document.getElementById(`calltype`).innerHTML == 'video') {
    document.getElementById("video-call-div")
      .style.display = "block";
  } else {
    document.getElementById("video-call-div")
      .style.display = "none";
  }
  document.getElementById(`opencallvideomodel`).click();
  document.getElementById(`cutincomingmodel`).click();
  joinCall(document.getElementById(`calltype`).innerHTML, userId, rspid);
})
socket.on('itbusy', () => {
  document.getElementById(`calltext`).innerHTML = "The person is busy";
  document.getElementById(`audiotext`).innerHTML = "The person is busy";
  document.getElementById(`callvideomodel`).style.display = "none";
  document.getElementById(`callaudiomodel`).style.display = "none";
  audioring.pause();
  audioring.currentTime = 0;
  busyring.play();
  endvcall();
  setTimeout(function () {
    busyring.pause();
    busyring.currentTime = 0;
    document.getElementById(`closevcmodel`).click();
    document.getElementById(`audiotext`).innerHTML = "Calling...";
    document.getElementById(`calltext`).innerHTML = "Calling...";
    document.getElementById(`callvideomodel`).style.display = "block";
    document.getElementById(`callaudiomodel`).style.display = "block";
    document.getElementById(`audiotext`).style.display = "none";
    document.getElementById(`calltext`).style.display = "none"; b
    document.getElementById(`closeaudiomodel`).click();
  }, 3500)

})
socket.on('cutphoness', () => {
  cutingphone = true;
  document.getElementById(`cutincomingmodel`).click();
  callerring.pause();
  callerring.currentTime = 0;

})
socket.on('cutpeeranswer', () => {
  document.getElementById(`audiotext`).innerHTML = "The person is busy";
  document.getElementById(`calltext`).innerHTML = "The person is busy";
  document.getElementById(`callvideomodel`).style.display = "none";
  document.getElementById(`callaudiomodel`).style.display = "none";
  audioring.pause();
  audioring.currentTime = 0;
  busyring.play();
  endvcall();
  setTimeout(function () {
    busyring.pause();
    busyring.currentTime = 0;
    document.getElementById(`closevcmodel`).click();
    document.getElementById(`callvideomodel`).style.display = "block";
    document.getElementById(`callaudiomodel`).style.display = "block";
    document.getElementById(`audiotext`).style.display = "none";
    document.getElementById(`calltext`).style.display = "none";
    document.getElementById(`closeaudiomodel`).click();
  }, 3500)
})
socket.on("ringcalling", (uid, icid, name, image, ctype) => {
  if (!isactive) {
    cutingphone = false
    const user_img1 = `<img src="assets/images/users/${image}" class="avatar-title rounded-circle bg-soft-primary text-primary" alt="">`;
    document.getElementById(`incomingimg`).innerHTML = user_img1;
    document.getElementById('callimg').innerHTML = `<img src="assets/images/users/${image}" alt="" style="width: 500px; border-radius: 50%;">`;
    document.getElementById('headerimg').setAttribute('src', `assets/images/users/${image}`);
    document.getElementById(`icvid`).innerHTML = icid;
    document.getElementById(`sameid`).innerHTML = icid;
    document.getElementById(`icmname`).innerHTML = name;
    document.getElementById(`samename`).innerHTML = name;
    document.getElementById(`calltype`).innerHTML = 'video';
    document.getElementById(`callicon`).innerHTML = ' <i class="ri-vidicon-fill"></i>';
    document.getElementById(`calltypetext`).innerHTML = 'Incoming Video Call';
    if (ctype == 'audio') {
      document.getElementById(`calltype`).innerHTML = 'audio';
      document.getElementById(`callicon`).innerHTML = ' <i class="ri-phone-fill"></i>';
      document.getElementById(`calltypetext`).innerHTML = 'Incoming Audio Call';
    }
    setTimeout(function () {
      if (!cutingphone) {
        callerring.play();
        requestNotificationPermissions();
        var instance = new Notification(
          name, {
          body: `Incoming ${ctype} Call`,
          icon: `assets/images/users/${image}`
        });
        document.getElementById(`openincoming_${uid}`).click();
      }
    }, 2500);
  } else {
    socket.emit('isbusy', icid);
  }
})
socket.on('answered', (rspid, ctype) => {
  document.getElementById(`calltext`).style.display = 'none';
  if (ctype == 'video') {
    document.getElementById("video-call-div")
      .style.display = "block";
  } else {
    document.getElementById("video-call-div")
      .style.display = "none";
  }
  audioring.pause();
  audioring.currentTime = 0;
  document.getElementById(`opencallvideomodel`).click();
  document.getElementById(`closevcmodel`).click();
  document.getElementById(`closeaudiomodel`).click();

})
socket.on('cutvc', (ctype) => {
  endvcall();
})
socket.on('getingonmsgs', (event) => {
  handleSignallingData(JSON.parse(event))
})
function cutphones() {
  if (document.getElementById(`audiotext`).style.display == 'block' || document.getElementById(`calltext`).style.display == 'block') {
    vaid = document.getElementById("vausername-input").value;
    socket.emit('cutphone', vaid);
    document.getElementById(`audiotext`).style.display = 'none';
    document.getElementById(`calltext`).style.display = 'none';
    setTimeout(() => {
      endvcall();
    }, 2000);
  }
}
function handleSignallingData(data) {
  switch (data.type) {
    case "answer":
      peerConn.setRemoteDescription(data.answer)
      break
    case "candidate":
      peerConn.addIceCandidate(data.candidate)
      break
    case "offer":
      peerConn.setRemoteDescription(data.offer)
      createAndSendAnswer()
  }
}
function sendUsername(ctype) {
  let users_id = document.getElementById("vausername-input").value
  vausername = document.getElementById("vausername-input").value + '_' + userId;
  socket.emit('ringcall', users_id, userId, globalusername, image, ctype)
  sendData({
    type: "store_user"
  })
}
function sendData(data) {
  data.username = vausername
  socket.emit('vccallmsg', JSON.stringify(data))
}
function createAndSendAnswer() {
  peerConn.createAnswer((answer) => {
    peerConn.setLocalDescription(answer)
    sendData({
      type: "send_answer",
      answer: answer
    })
  }, error => {
    console.log(error)
  })
}
function createAndSendOffer() {
  peerConn.createOffer((offer) => {
    sendData({
      type: "store_offer",
      offer: offer
    })
    peerConn.setLocalDescription(offer)
  }, (error) => {
    console.log(error)
  })
}
function startCall(ctype) {
  isactive = true;
  audioring.play();
  if (ctype == 'audio') {
    ctype = false
  } else {
    ctype = {
      frameRate: 24,
      width: {
        min: 480,
        ideal: 720,
        max: 1280
      },
      aspectRatio: 1.33333
    };
    document.getElementById("video-call-div")
      .style.display = "inline";
  }

  navigator.getUserMedia({
    video: ctype,
    audio: true
  }, (stream) => {
    localStream = stream
    let configuration;
    if (ctype != false) {
      document.getElementById("local-video").srcObject = localStream;
      configuration = {
        iceServers: [{
          "urls": ["stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302"
          ]
        }]
      }
    }
    peerConn = new RTCPeerConnection(configuration)
    peerConn.addStream(localStream)

    peerConn.onaddstream = (e) => {
      document.getElementById("remote-video")
        .srcObject = e.stream
    }

    peerConn.onicecandidate = ((e) => {
      if (e.candidate == null)
        return
      sendData({
        type: "store_candidate",
        candidate: e.candidate
      })
    })

    createAndSendOffer()
  }, (error) => {
    toastr.error('Device not found', 'Error');
    document.getElementById(`cutincomingmodel`).click();
    cutphones();
  setTimeout(function () {
    document.getElementById(`closevcmodel`).click();
    document.getElementById(`closeaudiomodel`).click();
  }, 1500)
  })
}
function joinCall(jctype, userId, rspid) {
  isactive = true;
  if (jctype == 'audio') {
    jctype = false
  } else {
    jctype = {
      frameRate: 24,
      width: {
        min: 480,
        ideal: 720,
        max: 1280
      },
      aspectRatio: 1.33333
    };
    document.getElementById("video-call-div")
      .style.display = "inline";
  }
  vausername = userId + '_' + rspid

  navigator.getUserMedia({
    video: jctype,
    audio: true
  }, (stream) => {
    localStream = stream
    let configuration
    if (jctype != false) {
      document.getElementById("local-video").srcObject = localStream
      configuration = {
        iceServers: [{
          "urls": ["stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302"
          ]
        }]
      }
    }
    peerConn = new RTCPeerConnection(configuration)
    peerConn.addStream(localStream)
    peerConn.onaddstream = (e) => {
      document.getElementById("remote-video")
        .srcObject = e.stream
    }
    peerConn.onicecandidate = ((e) => {
      if (e.candidate == null)
        return

      sendData({
        type: "send_candidate",
        candidate: e.candidate
      })
    })
    sendData({
      type: "join_call"
    })

  }, (error) => {
    console.log(error)
  })
}
function endvcall() {
  isactive = false;
  $('#video i').attr('class', 'ri-camera-fill');
  $('#audio i').attr('class', 'ri-mic-fill');
  isAudio = true
  isVideo = true
  audioring.pause();
  audioring.currentTime = 0;
  document.getElementById(`closevideomodel`).click();
  if (localStream.getTracks != undefined) {
    localStream.getTracks().forEach(function (track) {
      if (track.readyState == 'live') {
        track.stop();
      }
    });
  }
  if (peerConn.close !== undefined) peerConn.close();
}
function muteAudio() {
  if (isAudio == true)
    $('#audio i').attr('class', 'ri-mic-off-fill');
  else
    $('#audio i').attr('class', 'ri-mic-fill');
  isAudio = !isAudio
  localStream.getAudioTracks()[0].enabled = isAudio
}
function muteVideo() {
  if (isVideo == true)
    $('#video i').attr('class', 'ri-camera-off-fill');
  else
    $('#video i').attr('class', 'ri-camera-fill');
  isVideo = !isVideo
  localStream.getVideoTracks()[0].enabled = isVideo
}
//-------------------------------------------- CAMERA SNAP SEND --------------------------------------------//

let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#view_video");
let click_button = document.getElementById("click-photo");
let close_button = document.getElementById("close-photo");
let canvas = document.querySelector("#canvas");

camera_button.addEventListener('click', async function () {
  document.getElementById('upload_input').value = '';
  document.getElementById('cmdiv').style.display = 'block';
  document.querySelector(".file_Upload").innerHTML = '';
  file = null;
  video.style.display = 'block';
  click_button.style.display = 'block';
  close_button.style.display = 'block';
  navigator.getUserMedia({
    video: true, audio: false
  }, (stream) => {
    video.srcObject = stream;
  }, (error) => {
    toastr.error('Device not found', 'Error');
    close_button.click();
  })
  
});

close_button.addEventListener('click', function () {
  video.style.display = 'none';
  click_button.style.display = 'none';
  document.getElementById('cmdiv').style.display = 'none';
  close_button.style.display = 'none';
  video.srcObject != null ? video.srcObject.getVideoTracks().forEach(track => track.stop()):'';
})

click_button.addEventListener('click', function () {
  var preview = document.querySelector(".file_Upload");
  video.style.display = 'none';
  document.getElementById('cmdiv').style.display = 'none';
  close_button.style.display = 'none';
  click_button.style.display = 'none';
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  let image_data_url = canvas.toDataURL('image/png');
  var image = `<img src='${image_data_url}' class='profile-user rounded' width=150>`;
  preview.innerHTML = `<div class="image_pre d-inline-block position-relative">${image}<i class="ri-close-line text-danger image-remove end-0 top-0 px-1" onclick="deleteImage(this)"></i></div>`;
  var imgname = Math.floor(Math.random() * (1234 - 29999 + 1) + 29999);
  urltoFile(image_data_url, imgname, 'png')
    .then(function (filed) {
      webcam = filed;
    })
  video.srcObject.getVideoTracks().forEach(track => track.stop());
});
function urltoFile(url, filename, mimeType) {
  mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
  return (fetch(url)
    .then(function (res) { return res.arrayBuffer(); })
    .then(function (buf) { return new File([buf], `${filename}.png`, { type: mimeType }); })
  );
}