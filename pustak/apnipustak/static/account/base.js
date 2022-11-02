try {
    let form =  document.getElementById("form-for-site");
    let inputs = form.querySelectorAll("input");
    let labels = form.getElementsByTagName("label");
    let errors = form.getElementsByClassName("errorlist");

    for(let each of inputs) {
        each.classList.add("form-control");
        each.classList.add("form-control-lg");
    }
    
    for(let each of labels) {
        each.classList.add("form-label");
    }
    
    for(let each of errors) {
        if( each.classList.contains("nonfield") ) each.style.display = "none";
        else each.classList.add("text-danger");
    }

}
catch(e){
    
}
