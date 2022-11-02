let prices = document.querySelectorAll("input[type=number]");

let text = document.querySelectorAll("input[type=text], textarea");

let options = document.querySelectorAll("select");

let labels = document.querySelectorAll("label");

for (let each of text) {
    let name = each.getAttribute("name");
    name = name[0].toUpperCase() + name.slice(1);
    each.placeholder = `Enter Book ${name} here:`;
}

for (let each of options) {
    each.className = 'form-select'
    let name = each.getAttribute("name");
    console.log(name[0])
    name = name[0].toUpperCase() + name.slice(1);
    each.options[0].innerHTML = `Choose ${name}`;
    each.options[0].disabled = 'true';
}

/* ISBN to all details */

let isbn = document.getElementById("isbn");
let title_in = document.getElementById("id_title");
let detail_in = document.getElementById("id_description")
let isbn_write = 3;
let isbn_err = document.getElementById("isbn-error");

isbn.onkeyup = () =>{
                        digits = isbn.value.length
                        if(digits == 10 || digits == 13) getBookDetails(isbn.value)
                        else if (isbn_write == 1) {
                            detail_in.value = "";
                            title_in.value = "";
                            title_in.readOnly = false;
                        }
                        else{
                            isbn_err.innerHTML = "Enter valid ISBN No."
                        }
                    }

function getBookDetails(isbn) {
    // Query the book database by ISBN code.
    
    var url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn;

    fetch(url)
    .then(response => response.json())
    .then(books => {
        
        if (books.totalItems) {
            // There'll be only 1 book per ISBN
            var book = books.items[0];
        
            var title = book['volumeInfo']['title'];
            var details = book['volumeInfo']['description'] + '\n' + `Author: ${book['volumeInfo']['authors']} \n Publisher: ${book['volumeInfo']['publisher']}`
            
            
            title_in.value = title;
            title_in.readOnly = true;
            detail_in.value = details;
        
            isbn_write = 1;
        }

        else {
            message = "We could not find the details of the book with given ISBN No. Consider recheking the ISBN No. If you think it is correct, enter other details."
            isbn_err.innerHTML = message;
        }
    });
    
    
    }