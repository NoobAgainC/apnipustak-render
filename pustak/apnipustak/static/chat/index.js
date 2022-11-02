const msgroute = ReactDOM.createRoot(document.getElementById("messagesroot"));
const userid = JSON.parse(document.getElementById('userid').textContent);
var AddMessage;
var msgcount = 0;
var first = true;
var append = true;
var room;
var uName, uPhoto;
var start;
let tempHeight;
const csrftoken = getCookie('csrftoken');
urlRedirector();
$(window).on('popstate', function () {
  urlRedirector();
});
$("#contacts .contact").click(function () {
  if (room != $(this).attr("id") || $(window).width() < 576) {
    room = $(this).attr("id");
    urlPutter();
  }
});
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
function urlRedirector() {
  const url = window.location;
  const params = new Proxy(new URLSearchParams(url.search), {
    // https://stackoverflow.com/a/901144
    get: (searchParams, prop) => searchParams.get(prop)
  });
  const hash = url.hash;
  if (hash) {
    room = hash.substring(1);
    uName = $(`#${room}`).find('.name').text();
    uPhoto = $(`#${room}`).find('.userimage').attr('src');
    if (uName) return initiate_room();
  }
  $('#messagesroot').hide();
  $('.message-input').hide();
  if ($(window).width() < 576) {
    $('body').css("overflow", "auto");
    $('#frame .content').width(0);
  }
}
function urlPutter() {
  history.pushState(null, null, `#${room}`);
  urlRedirector();
}
function initiate_room() {
  if ($(window).width() < 576) {
    $('body').css("overflow", "hidden");
    $('#frame .content').width("100vw");
  }
  $('.message-input').show();
  $('#messagesroot').show();
  append = true;
  start = 0;
  load_msg();
  create_socket(room);
}
function create_socket(roomName) {
  const chatSocket = new WebSocket('wss://' + window.location.host + '/ws/chat/' + roomName + '/');
  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    append = true;
    data["id"] = `newmsg${msgcount++}`;
    AddMessage(data, 'a');
  };
  chatSocket.onclose = function (e) {
    console.error('Chat socket closed unexpectedly');
  };
  document.querySelector('#msginput').focus();
  document.querySelector('#msginput').onkeyup = function (e) {
    if (e.keyCode === 13) {
      // enter, return
      document.querySelector('#msgsend').click();
    }
  };
  document.querySelector('#msgsend').onclick = function (e) {
    const messageInputDom = document.querySelector('#msginput');
    const message = messageInputDom.value;
    if (!message) return;
    chatSocket.send(JSON.stringify({
      'message': message,
      'sender': userid
    }));
    messageInputDom.value = '';
  };
}
function load_msg(command) {
  fetch(`json/room/${room}?start=${start}`).then(response => response.json()).then(messages => {
    if (first) msgroute.render( /*#__PURE__*/React.createElement(Message, {
      messages: messages
    }));else AddMessage(messages, command);
  });
}
function Message(props) {
  const texts = props.messages;
  const [messages, setMessage] = React.useState(texts);
  const [owner, setOwner] = React.useState(room.substring(room.indexOf('t2b') + 3));
  AddMessage = (new_msg, command) => {
    if (command == 'a') setMessage([...messages, new_msg]);else if (command == 'p') setMessage(new_msg.concat(messages));else setMessage(new_msg);
  };
  React.useEffect(() => {
    let el = document.querySelector('#chatmsg');
    if (append) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTop = el.scrollHeight - tempHeight;
    }
    if (owner != room.substring(room.indexOf('t2b') + 3)) {
      setOwner(room.substring(room.indexOf('t2b') + 3));
    }
  });
  first = false;
  const msgitem = messages.map(text => /*#__PURE__*/React.createElement("li", {
    className: text.sender == userid ? "replies" : "sent",
    key: text.id
  }, /*#__PURE__*/React.createElement("p", null, text.message)));
  return /*#__PURE__*/React.createElement("div", {
    className: "msginfos"
  }, /*#__PURE__*/React.createElement("div", {
    className: "contact-profile"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-arrow-left arrow ps-3 pe-2",
    onClick: () => history.back()
  }), /*#__PURE__*/React.createElement("img", {
    src: uPhoto,
    alt: "userimage"
  }), /*#__PURE__*/React.createElement("p", {
    id: "contact-name"
  }, uName), /*#__PURE__*/React.createElement("form", {
    className: "dots",
    id: "conclude",
    method: "post",
    action: "/delete/",
    onSubmit: confirmation
  }, /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "csrfmiddlewaretoken",
    value: csrftoken
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "room",
    value: room
  }), /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-ellipsis-vertical px-2",
    "data-bs-toggle": "dropdown",
    style: {
      cursor: "pointer"
    }
  }), /*#__PURE__*/React.createElement("ul", {
    className: "dropdown-menu"
  }, owner == userid ? /*#__PURE__*/React.createElement("li", null, " ", /*#__PURE__*/React.createElement("input", {
    name: "close",
    className: "dropdown-item",
    type: "submit",
    value: "Close Deal"
  }), " ") : /*#__PURE__*/React.createElement("li", null), /*#__PURE__*/React.createElement("li", null, " ", /*#__PURE__*/React.createElement("input", {
    name: "cancel",
    className: "dropdown-item text-danger",
    type: "submit",
    value: "Cancel Deal"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "messages"
  }, /*#__PURE__*/React.createElement("ul", {
    id: "chatmsg",
    onScroll: e => loadMoreMsg(e)
  }, /*#__PURE__*/React.createElement("li", {
    style: {
      height: '5%'
    }
  }), msgitem)));
  function loadMoreMsg(e) {
    if (e.target.scrollTop == 0) {
      start++;
      append = false;
      let el = document.querySelector('#chatmsg');
      tempHeight = el.scrollHeight;
      load_msg('p');
    }
  }
  function confirmation(e) {
    let meth = e['nativeEvent'].submitter.name;
    if (meth === 'cancel') {
      if (!confirm("Do you really want to cancel the deal?")) e.preventDefault();
    } else {
      if (!confirm("Only close the deal if you have delivered the book. Do you want to close deal?")) e.preventDefault();
    }
  }
}
