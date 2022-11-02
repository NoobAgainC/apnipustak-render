function removeWatch(id) {
    fetch('/json/watch/', {
        method: 'PUT',
        body: JSON.stringify({
            id : id
        })
    });
    let el = $(`#article-${id}`)
    aniHide(el)
}

function aniHide(el) {
    el.animate({opacity: '0'}, 180, function() {
        el.animate({height: '0px'}, 180, function() {
            el.remove();
        })
    })
}