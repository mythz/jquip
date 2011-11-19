$.addPlugin("custom", function($){
    var win=window, doc=document, qsMap = {};
    var vars = win.location.search.substring(1).split("&");
    for (var i = 0; i < vars.length; i++) {
        var kvp = vars[i].split("=");
        qsMap[kvp[0]] = unescape(kvp[1]);
    }
    $.queryString = function (name) { return qsMap[name]; };
    $.Key = function (keyCode) { this.keyCode = keyCode; };
    $.Key.namedKeys = {
        Backspace: 8, Tab: 9, Enter: 13, Shift: 16, Ctrl: 17, Alt: 18, Pause: 19, Capslock: 20, Escape: 27, PageUp: 33, 
        PageDown: 34, End: 35, Home: 36, LeftArrow: 37, UpArrow: 38, RightArrow: 39, DownArrow: 40, Insert: 45, Delete: 46
    };
    $.each($.Key.namedKeys, function (val, key) {
        var keyCode = val;
        $.Key.prototype['is' + key] = function () { return this.keyCode === keyCode; };
    });
    $.key = function (e) {
        e = e || window.event;
        return new $.Key(e.keyCode || e.which);
    };
    $.fromHtml = function (html) {
        var frag = doc.createDocumentFragment(), div = doc.createElement('div');
        div.innerHTML = html;
        while (div.firstChild) frag.appendChild(div.firstChild);
        return frag;
    };
    $.cancelEvent = function (e) {
        if (!e) e = window.event;
        e.cancelBubble = true;
        e.returnValue = false;
        if (e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }
        return false;
    };
});