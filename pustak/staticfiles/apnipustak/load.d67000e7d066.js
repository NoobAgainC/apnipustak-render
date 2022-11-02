const root = ReactDOM.createRoot(document.getElementById('titles'));
const rootBook = ReactDOM.createRoot(document.getElementById('product'));
const isAuthenticated = $("#user_authentication").text()
const LIST_LIMIT = 13;
var firstRender = true;
var ReplaceTitle;
var AddTitle;
var IsEnd;
var IsBook;
var listId;
var titleCount = 1, listCount = 1; 
var userQuery = "";
const csrftoken = getCookie('csrftoken');

urlRedirector();


$(window).on('popstate', function() {
    urlRedirector(); 
})

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function loadMore(isBook) {
    $("#loadmore").hide();
    $("#loading").show();
    isBook ? getListings(listId, listCount++) : getTitles(userQuery, titleCount++);
}

function urlRedirector() {
    const url = window.location
    const params = new Proxy(new URLSearchParams(url.search), {
        // https://stackoverflow.com/a/901144
        get: (searchParams, prop) => searchParams.get(prop),
      });
    const hash = url.hash
    if (params.q) return getTitles(params.q, 0);
    if (params.id) return getListings(params.id, 0)
    if (hash) {
        let n = hash.lastIndexOf('+');
        let id = hash.substring(n + 1);
        return getBook(id, true)
    }
    return getTitles("", 0);
}

function urlPutter(str) {
    // URL.split(/[?#]/)[0];
    history.pushState(null, null, `/${str}`);
}

function getTitles(query, start, redirected) {
    $('#titles').show();
    $('#product').hide();
    $('#banner').show();
    userQuery = query;
    fetch(`/json/titles?q=${query}&start=${start}`)
    .then(response => response.json())
    .then(titles => {
        if (query && !redirected) urlPutter(`?q=${query}`);
        
        if (firstRender) {
            firstRender = false;
            return root.render(<RenderTitle titles={titles} isListing={false} query={query} />);
        }
        start === 0 ? ReplaceTitle(titles, false) : AddTitle(titles);
    })
}

function getListings(id, start, redirected) {
    $('#titles').show();
    $('#product').hide();
    $('#banner').show();
    listId = id;
    fetch(`/json/listings/${id}?start=${start}`)
    .then(response => {
        console.log(response)
        if(response.ok) return response.json();
        return getTitles("", 0);
    })
    .then(titles => {
        let title = titles[0]['title'].replace(/ /g,"+");
        let id = titles[0]['isbn_id'];
        if (firstRender) {
            firstRender = false;
            return root.render(<RenderTitle titles={titles} isListing={true}/>);
        }
        if (start === 0)  {
            if (!redirected) urlPutter(`?id=${id}&title=${title}`);
            return ReplaceTitle(titles, true)
        }
        AddTitle(titles);
    })
}

function getBook(id, redirected, title) {
    $('#titles').hide();
    $('#product').show();
    $('#banner').hide()
    if (!redirected) urlPutter("#"+ title.replace(/ /g, '+') + '+' + id);
    fetch(`/json/book/${id}`)
    .then(response => {
        if(response.ok) return response.json();
        return getTitles("", 0);
    })
    .then(book => {
        return rootBook.render(<RenderBook book={book} />);
    })

}

function AddWatch(id, isBook) {
    fetch('/json/watch/', {
        method: 'PUT',
        body: JSON.stringify({
            id : id
        })
    })
    .then(response =>{
        if (response.status === 403) 
        {
            let loc = window.location.pathname + window.location.search + window.location.hash;
            window.location.href = `accounts/login/?next=${loc}`;
        }
        else return  response.json()})
    .then(data => {
        if (data["method"] == "added") {
            if ($(`#watch-${id}`)) $(`#watch-${id}`).addClass("fa").removeClass("fa-regular");
            $("#js-alerts").text(data["message"]).show().delay(3000).fadeOut('slow');

            if ($("#book-watch") && isBook) {
                let cache = $(`#book-watch-${id}`).children();
                $(`#book-watch-${id}`).text("Remove from Wishlist").prepend(cache);
            }
        }
        else {
            if ($(`#watch-${id}`)) $(`#watch-${id}`).addClass("fa-regular").removeClass("fa");
            $("#js-alerts").text(data["message"]).show().delay(2000).fadeOut('slow');
            if ($(`#book-watch-${id}`) && isBook) {
                let cache = $(`#book-watch-${id}`).children();
                $(`#book-watch-${id}`).text("Add to Wishlist").prepend(cache);
            }
        }
    }); 
    
}

function showLoad() {
    $("#loading").hide();
    $("#loadmore").show();
}

function RenderTitle(props) {
    console.log(props.titles)

    React.useEffect(() => {
        showLoad();
    });

    const [end, SetEnd] = React.useState(() => {
        if (props.titles.length != LIST_LIMIT) return true;
        props.titles.pop();
        return false;
    });
    
    const [titles, SetTitles] = React.useState(props.titles);

    const [isListing, SetListing] = React.useState(props.isListing)


    AddTitle = (title) => {
        title = IsEnd(title);
        SetTitles(titles.concat(title));
    }

    ReplaceTitle = (title, bool) => {
        title = IsEnd(title);
        SetTitles(title);
        SetListing(bool);
    }

    IsEnd = (title) => {
        if (title.length != LIST_LIMIT) {
            SetEnd(true);
            return title;
        }
        SetEnd(false);
        title.pop();
        return title;
    }


    const titleItem = titles.map((title) => 
        
                <div className="col-lg-3 col=md-4 col-sm-6 col-12  mb-4 d-flex" key={title.id.toString()}>
                    <div className="card w-100 p-3 border border-secondary listing bg-light">
                        <div onClick={isListing ? (() => getBook(title.id, false, title.title)) : (() => getListings(title.id, 0))}>
                            <div className="bg-image hover-zoom ripple ripple-surface ripple-surface-light h-400"
                            data-mdb-ripple-color="light">
                                <div className="img-cnt justify-content-center">
                                    <img src={title.images[0]} className="img-pro" loading="lazy" />
                                    
                                </div>
                                
                                <div className="hover-overlay">
                                <div className="mask" style={{backgroundColor: "rgba(251, 251, 251, 0.15)"}}></div>
                                </div>

                            </div>
                            <div className="card-body">
                            
                                <h5 className="card-title mb-3 title text-reset">{title.title}</h5>
                                <hr/>
                            
                                <p className="description text-reset">{ title.description }</p>
                            
                            <h6 className="mb-3"><s>${ title.original_price }</s><strong className="ms-2 text-danger">${title.offer_price }</strong></h6>
                            
                            </div>
                        </div>
                        <div className="justify-content-start">
                        {isListing ? (<div>
                            <form method="post" action="../chat/create/">
                                <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken} />
                                <input type="hidden" name="book-listing" value={title.id.toString()} />
                                <input type="submit" value="Buy Now" className="btn btn-primary buy-book"/>
                                <a className="btn btn-light btn-icon"> <i onClick={() => AddWatch(title.id)} className={"fa-heart heart-button "+ (title.watched ? "fa" : "fa-regular")} style={{color: "red"}} id={"watch-" + title.id}></i> </a>
                            </form>
                        </div>) : (<div></div>)}
            
                        </div>
                         
                    </div>

                </div>
            

        
    );
    return (
        <div>
            <div className="row">{titleItem}</div>
            <div> {titles.length === 0 ? (<div className="m-5 p-5">Sorry! No Matches found.</div>) : <div></div> } </div>
            <div>{end ? (<button type="button" id="loadmore" onClick={() => window.location.href = "/"} className="btn btn-outline-primary">Veiw More Books...</button>) : (<button type="button" id="loadmore" onClick={() => loadMore(isListing)} className="btn btn-outline-primary">Load More...</button>)} </div>
            
        </div>

        
      );
}

function RenderBook(props) {
    const book = props.book
    const [photo, setPhoto]  = React.useState(book.images[0])
    const [id, setId] = React.useState(book.id)

    React.useEffect(() => {
        if (id != book.id) {
            setPhoto(book.images[0]);
            setId(book.id)
        }
        showLoad();
    });

    const images = book.images.map((image, index) => 
            <span data-type="image" className="item-thumb" key={index}> 
                <img width="60" height="60" src={image} onClick={() => setPhoto(image)} className="border border-primary m-1"/> 
            </span>
    );
    return (
        <div className="row">
            <aside className="col-lg-6">
            <article className="gallery-wrap"> 
                <div className="img-big-wrap img-thumbnail">
                    <img height="560" id="ImagePreview" src={photo} /> 
                </div>
                <div className="thumbs-wrap">
                {images}
                </div> 
            </article> 
            </aside>
            <main className="col-lg-6">
            <article className="ps-lg-3">
                <h4 className="title text-dark">{book.title}</h4>
                <hr/>
                <div className="mb-3"> 
                    <span className="price h4 text-danger"><s>&#8377;{book.original_price}</s></span>
                    <var className="price h5">&#8377;{book.offer_price}</var> 
                </div> 
                <div className="book-all-details">
                    <p className="book-details">{book.description}</p>
                    <dl className="row">     
                        <dt className="col-3">ISBN Number:</dt>
                        <dd className="col-9">{book.isbn}</dd>
                    
                        <dt className="col-3">Subject:</dt>
                        <dd className="col-9">{book.subject}</dd>
                    
                        <dt className="col-3">Semester:</dt>
                        <dd className="col-9">{book.semester}</dd>

                        <dt className="col-3">Original Price:</dt>
                        <dd className="col-9">{book.original_price}</dd>
                    
                        <dt className="col-3">Listed by:</dt>
                        <dd className="col-9">{book.owner}</dd>
                    </dl>
                </div>
                
            
                <hr/>
                <form method="post" action="../chat/create/">
                    <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken} />
                    <input type="hidden" name="book-listing" value={book.id.toString()} />
                    <input type="submit" value="Buy Now" className="btn btn-warning"/>
                    <a className="btn  btn-primary" id={"book-watch-" + book.id} onClick={(e) => AddWatch(book.id, true)}> <i  className="me-1 fa fa-shopping-basket"></i> {book.watched ? "Remove from Wishlist": "Add to Wishlist"} </a>
                </form>
            
            </article>
            </main>
        </div>
    );
}


