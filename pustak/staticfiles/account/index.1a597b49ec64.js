const root = ReactDOM.createRoot(document.getElementById('listedByUser'));
const LIST_LIMIT = 13;
const owner = $('#consumer_id').text();
var ordercount = 0;
function getOrders() {
  return fetch(`/json/listings/1/?seller=${owner}&start=${ordercount++}`).then(response => response.json());
}
function renderOrders() {
  $("#loading").show();
  $("#listedByUser").show();
  $("#orders").hide();
  $("#transactions").hide();
  try {
    $("#order-table").removeClass("btn-primary");
    $("#transaction-table").removeClass("btn-primary");
  } catch {
    console.log("Anonymous");
  }
  $("#list-table").addClass("btn-primary");
  getOrders().then(orders => root.render( /*#__PURE__*/React.createElement(RenderTitles, {
    titles: orders,
    name: "order"
  })));
}
function showOrders() {
  $("#orders").show();
  $("#transactions").hide();
  $("#listedByUser").hide();
  $("#order-table").addClass("btn-primary");
  $("#list-table").removeClass("btn-primary");
  $("#transaction-table").removeClass("btn-primary");
}
function showTrans() {
  $("#transactions").show();
  $("#orders").hide();
  $("#listedByUser").hide();
  $("#transaction-table").addClass("btn-primary");
  $("#list-table").removeClass("btn-primary");
  $("#order-table").removeClass("btn-primary");
}
function showLoad() {
  $("#loading").hide();
  $("#loadmore").show();
}
function RenderTitles(props) {
  const [titles, SetTitles] = React.useState(props.titles);
  const [end, SetEnd] = React.useState(() => {
    if (props.titles.length != LIST_LIMIT) return true;
    props.titles.pop();
    return false;
  });
  React.useEffect(() => {
    showLoad();
  });
  function isEnd(title) {
    if (title.length != LIST_LIMIT) {
      SetEnd(true);
      return title;
    }
    SetEnd(false);
    title.pop();
    return title;
  }
  function loadMore(meth) {
    $("#loadmore").hide();
    $("#loading").show();
    getOrders().then(orders => {
      orders = isEnd(orders);
      SetTitles(titles.concat(orders));
    });
  }
  function bookUrl(title, id) {
    return '/#' + title.replace(/ /g, '+') + '+' + id;
  }
  const titleItem = titles.map(title => /*#__PURE__*/React.createElement("article", {
    className: "card border-primary mb-4",
    key: title.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-body"
  }, /*#__PURE__*/React.createElement("header", {
    className: "d-lg-flex"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-grow-1"
  }, /*#__PURE__*/React.createElement("h6", {
    className: "mb-0"
  }, "Book Name: ", title.isbn, " ", /*#__PURE__*/React.createElement("i", {
    className: "dot"
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-muted"
  }, "Original Price: \u20B9", title.original_price)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    href: bookUrl(title.title, title.id),
    className: "btn btn-sm btn-outline-primary"
  }, "View listing"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "btn btn-sm btn-primary"
  }, "Contact Seller"))), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-md-4 col-sm-6"
  }, /*#__PURE__*/React.createElement("figure", {
    className: "itemside mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "aside"
  }, /*#__PURE__*/React.createElement("img", {
    loading: "lazy",
    width: "72",
    height: "72",
    src: title.images[0],
    className: "img-sm rounded border"
  })), /*#__PURE__*/React.createElement("figcaption", {
    className: "info"
  }, /*#__PURE__*/React.createElement("p", {
    className: "title"
  }, "Subject: ", title.subject, " "), /*#__PURE__*/React.createElement("strong", null, " Discounted Price: \u20B9", title.offer_price, " ")))), /*#__PURE__*/React.createElement("div", {
    className: "col-md-4 col-sm-6"
  }, /*#__PURE__*/React.createElement("p", {
    className: "mb-0 text-muted"
  }, "Seller Details"), /*#__PURE__*/React.createElement("p", {
    className: "m-0"
  }, title.owner, " ", /*#__PURE__*/React.createElement("br", null), "  University: ", /*#__PURE__*/React.createElement("br", null), " Email: info@mywebsite.com "))))));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, titleItem), /*#__PURE__*/React.createElement("div", null, " ", titles.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "m-5 p-5"
  }, "Sorry! No Matches found.") : /*#__PURE__*/React.createElement("div", null), " "), /*#__PURE__*/React.createElement("div", {
    className: "text-center"
  }, end ? /*#__PURE__*/React.createElement("div", null) : /*#__PURE__*/React.createElement("button", {
    type: "button",
    id: "loadmore",
    onClick: () => loadMore(props.name),
    className: "btn btn-outline-primary"
  }, "Load More..."), " "));
}
