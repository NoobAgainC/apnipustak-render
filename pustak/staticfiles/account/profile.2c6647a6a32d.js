const root = ReactDOM.createRoot(document.getElementById('listedByUser'))
const LIST_LIMIT = 13;
const owner = $('#consumer_id').text();
var ordercount = 0;


function getOrders() {
    return fetch(`/json/listings/1/?seller=${owner}&start=${ordercount++}`)
    .then(response => response.json())
}

function renderOrders() {
    $("#loading").show();
    $("#listedByUser").show();
    $("#orders").hide();
    $("#transactions").hide();
    try {
        $("#order-table").removeClass("btn-primary")
        $("#transaction-table").removeClass("btn-primary")
    }
    catch {
        console.log("Anonymous")
    }
    $("#list-table").addClass("btn-primary")
    
    getOrders().then(orders => root.render(<RenderTitles titles={orders} name={"order"}/>));
}

function showOrders() {
    $("#orders").show();
    $("#transactions").hide();
    $("#listedByUser").hide();
    $("#order-table").addClass("btn-primary")
    $("#list-table").removeClass("btn-primary")
    $("#transaction-table").removeClass("btn-primary")
}

function showTrans() {
    $("#transactions").show();
    $("#orders").hide();
    $("#listedByUser").hide();
    $("#transaction-table").addClass("btn-primary")
    $("#list-table").removeClass("btn-primary")
    $("#order-table").removeClass("btn-primary")
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

    function isEnd (title) {
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

    const titleItem = titles.map((title) => 
            <article className="card border-primary mb-4" key={title.id}>
                <div className="card-body">
                    <header className="d-lg-flex">
                        <div className="flex-grow-1">
                        <h6 className="mb-0">Book Name: { title.isbn } <i className="dot"></i>  
                        </h6>
                        <span className="text-muted">Original Price: &#8377;{title.original_price}</span>
                        </div>
                        <div>
                        <a href={bookUrl(title.title, title.id)} className="btn btn-sm btn-outline-primary">View listing</a>
                        <a href="#" className="btn btn-sm btn-primary">Contact Seller</a> 
                        </div>
                    </header>
                    <hr/>
                    <div className="row">
                        <div className="col-md-4 col-sm-6">
                        <figure className="itemside mb-3">
                            <div className="aside">
                            <img loading="lazy" width="72" height="72" src={ title.images[0] } className="img-sm rounded border"/>
                            </div>
                            <figcaption className="info">
                            <p className="title">Subject: { title.subject } </p>
                            <strong> Discounted Price: &#8377;{ title.offer_price } </strong>
                            </figcaption>
                        </figure>
                        </div>
                        <div className="col-md-4 col-sm-6">
                        <p className="mb-0 text-muted">Seller Details</p>
                        <p className="m-0"> 
                            { title.owner } <br/>  University: <br/> Email: info@mywebsite.com </p>
                        </div> 
                    </div> 
                    </div> 
            </article>
            
        )

    return (
       <div>
            <div>{titleItem}</div>
            <div> {titles.length === 0 ? (<div className="m-5 p-5">Sorry! No Matches found.</div>) : (<div></div>) } </div>
            <div className="text-center">{end ? (<div></div>) : (<button type="button" id="loadmore" onClick={() => loadMore(props.name)} className="btn btn-outline-primary">Load More...</button>)} </div>
            
       </div>
    );
}