//Cancel browser default event compatible
function cancelHandler(event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
}
//Compute css style compatible
function getStyle(elem, prop) {
    if (window.getComputedStyle) {
        return window.getComputedStyle(elem, null)[prop];
    } else {
        return elem.currentStyle[prop];
    }
}
//Event compatibility package
function addEvent(elem, type, handle) {
    if (elem.addEventListener) {
        elem.addEventListener(type, handle, false);
    } else if (elem.attachEvent) {
        elem.attachEvent('on' + type, function () {
            handle.call(elem);
        })
    } else {
        elem['on' + type] = handle;
    }
}
//Get the width of the document
function getScollSize() {
    var w1 = document.body.scrollWidth,
        w2 = document.documentElement.scrollWidth,
        h1 = document.body.scrollHeight,
        h2 = document.documentElement.scrollHeight;
    return {
        w: w1 > w2 ? w1 : w2,
        h: h1 > h2 ? h1 : h2,
    }
}
