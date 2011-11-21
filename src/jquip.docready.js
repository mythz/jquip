$.addPlugin("documentReady", function ($) {
    var win = window, doc = document, DOMContentLoaded, readyBound, readyList = [], isReady = false, readyWait = 1;        
    $.addConstructor(function (selector, ctx) {
        if (typeof selector == "function") {
            this.ready(selector);
            return true;
        }
    });
    $.fn.ready = function (fn) {
        $.bindReady();
        if (isReady) fn.call(doc, $);
        else if (readyList) readyList.push(fn);
        return this;
    };
    function doScrollCheck() {
        if (isReady) return;
        try {
            doc.documentElement.doScroll("left");
        } catch (e) {
            setTimeout(doScrollCheck, 1);
            return;
        }
        $.ready();
    }
    $.ready = function (wait) {
        if (wait === true) readyWait--;
        if (!readyWait || (wait !== true && !isReady)) {
            if (!doc.body) return setTimeout($.ready, 1);
            isReady = true;
            if (wait !== true && --readyWait > 0) return;
            if (readyList) {
                var fn, i = 0, ready = readyList;
                readyList = null;
                while ((fn = ready[i++])) fn.call(doc, $);
                if ($.fn.trigger) $(doc).trigger("ready").unbind("ready");
            }
        }
    };
    if (doc.addEventListener)
        DOMContentLoaded = function () {
            doc.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
            $.ready();
        };
    else if (doc.attachEvent)
        DOMContentLoaded = function () {
            if (doc.readyState === "complete") {
                doc.detachEvent("onreadystatechange", DOMContentLoaded);
                $.ready();
            }
        };
    $.bindReady = function () {
        if (readyBound) return;
        readyBound = true;
        if (doc.readyState === "complete") return setTimeout($.ready, 1);

        if (doc.addEventListener) {
            doc.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
            win.addEventListener("load", $.ready, false);
        } else if (doc.attachEvent) {
            doc.attachEvent("onreadystatechange", DOMContentLoaded);
            win.attachEvent("onload", $.ready);
            var toplevel = false;
            try { toplevel = window.frameElement == null; } catch (e) { }
            if (doc.documentElement.doScroll && toplevel) doScrollCheck();
        }
    };
});
