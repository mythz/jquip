$['plug']("custom", function($){
    var win=window, doc=document, qsMap = {}, 
        vars = win.location.search.substring(1).split("&");

    for (var i = 0; i < vars.length; i++) {
        var kvp = vars[i].split("=");
        qsMap[kvp[0]] = unescape(kvp[1]);
    }
    $['queryString'] = function (name) { return qsMap[name]; };
    var Key = $['Key'] = function (keyCode) { this.keyCode = keyCode; };
	Key.namedKeys = {
        Backspace: 8, Tab: 9, Enter: 13, Shift: 16, Ctrl: 17, Alt: 18, Pause: 19, Capslock: 20, Escape: 27, PageUp: 33, 
        PageDown: 34, End: 35, Home: 36, LeftArrow: 37, UpArrow: 38, RightArrow: 39, DownArrow: 40, Insert: 45, Delete: 46
    };
    $['_each'](Key.namedKeys, function (val, key) {
        var keyCode = val;
	    Key.prototype['is' + key] = function () { return this.keyCode === keyCode; };
    });
    $.key = function (e) {
        e = e || window.event;
        return new Key(e.keyCode || e.which);
    };
    $['cancelEvent'] = function (e) {
        if (!e) e = window.event;
        e.cancelBubble = true;
        e.returnValue = false;
        if (e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }
        return false;
    };
    $['templateSettings'] = {
      evaluate    : /<%([\s\S]+?)%>/g,
      interpolate : /<%=([\s\S]+?)%>/g,
      escape      : /<%-([\s\S]+?)%>/g
    };
    $['_template'] = function(str, data) {
        var c  = $['templateSettings'];
        var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
          'with(obj||{}){__p.push(\'' +
          str.replace(/\\/g, '\\\\')
             .replace(/'/g, "\\'")
             .replace(c.escape, function(match, code) {
               return "',_.escape(" + code.replace(/\\'/g, "'") + "),'";
             })
             .replace(c.interpolate, function(match, code) {
               return "'," + code.replace(/\\'/g, "'") + ",'";
             })
             .replace(c.evaluate || null, function(match, code) {
               return "');" + code.replace(/\\'/g, "'")
                                  .replace(/[\r\n\t]/g, ' ') + ";__p.push('";
             })
             .replace(/\r/g, '\\r')
             .replace(/\n/g, '\\n')
             .replace(/\t/g, '\\t')
             + "');}return __p.join('');";
        var func = new Function('obj', '$', tmpl);
        return data ? func(data, $) : function(data) { return func(data, $) };
    };
});
