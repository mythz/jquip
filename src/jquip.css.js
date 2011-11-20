$.addPlugin("css", function ($) {
    var doc = document,
        ralpha = /alpha\([^)]*\)/i,
        ropacity = /opacity=([^)]*)/,
        rdashAlpha = /-([a-z])/ig,
        rupper = /([A-Z])/g,
        rnumpx = /^-?\d+(?:px)?$/i,
        rnum = /^-?\d/,
        curCSS,
        getComputedStyle,
        currentStyle,
        fcamelCase = function (all, l) { return l.toUpperCase(); };
    
    $.cssHooks = {
        opacity: {
            get: function (el, comp) {
                if (!comp) return el.style.opacity;
                var ret = curCSS(el, "opacity", "opacity");
                return ret === "" ? "1" : ret;
            }
        }
    };
    if (!$.support.opacity) {
        $.cssHooks.opacity = {
            get: function (el, computed) {
                return ropacity.test((computed && el.currentStyle ? el.currentStyle.filter : el.style.filter) || "")
                    ? (parseFloat(RegExp.$1) / 100) + "" 
                    : computed ? "1" : "";
            },
            set: function (el, value) {
                var s = el.style;
                s.zoom = 1;
                var opacity = $.isNaN(value) ? "" : "alpha(opacity=" + value * 100 + ")", filter = s.filter || "";
                s.filter = ralpha.test(filter) ?
			    filter.replace(ralpha, opacity) :
			    s.filter + ' ' + opacity;
            }
        };
    }        
    if (doc.defaultView && doc.defaultView.getComputedStyle) {
        getComputedStyle = function (el, newName, name) {
            var ret, defaultView, computedStyle;
            name = name.replace(rupper, "-$1").toLowerCase();
            if (!(defaultView = el.ownerDocument.defaultView)) return undefined;
            if ((computedStyle = defaultView.getComputedStyle(el, null))) {
                ret = computedStyle.getPropertyValue(name);
                if (ret === "" && !$.contains(el.ownerDocument.documentElement, el))
                    ret = $.style(el, name);
            }
            return ret;
        };
    }
    if (doc.documentElement.currentStyle) {
        currentStyle = function (el, name) {
            var left,
		        ret = el.currentStyle && el.currentStyle[name],
		        rsLeft = el.runtimeStyle && el.runtimeStyle[name],
		        style = el.style;
            if (!rnumpx.test(ret) && rnum.test(ret)) {
                left = style.left;
                if (rsLeft) el.runtimeStyle.left = el.currentStyle.left;
                style.left = name === "fontSize" ? "1em" : (ret || 0);
                ret = style.pixelLeft + "px";
                style.left = left;
                if (rsLeft) el.runtimeStyle.left = rsLeft;
            }
            return ret === "" ? "auto" : ret;
        };
    }
    curCSS = getComputedStyle || currentStyle;

    $.fn.css = function (name, value) {
        if (arguments.length === 2 && value === undefined) return this;

        return $.access(this, name, value, true, function (el, name, value) {
            return value !== undefined ? $.style(el, name, value) : $.css(el, name);
        });
    };
    $.cssNumber = { "zIndex": true, "fontWeight": true, "opacity": true, "zoom": true, "lineHeight": true };
    $.cssProps = { "float": $.support.cssFloat ? "cssFloat" : "styleFloat" };
    $.style = function (el, name, value, extra) {
        if (!el || el.nodeType === 3 || el.nodeType === 8 || !el.style) return;
        var ret, origName = $.camelCase(name), style = el.style, hooks = $.cssHooks[origName];
        name = $.cssProps[origName] || origName;
        if (value !== undefined) {
            if (typeof value === "number" && isNaN(value) || value == null) return;
            if (typeof value === "number" && !$.cssNumber[origName]) value += "px";
            if (!hooks || !("set" in hooks) || (value = hooks.set(el, value)) !== undefined) {
                try {
                    style[name] = value;
                } catch (e) { }
            }
        } else {
            if (hooks && "get" in hooks && (ret = hooks.get(el, false, extra)) !== undefined)
                return ret;
            return style[name];
        }
    };
    $.css = function (el, name, extra) {
        var ret, origName = $.camelCase(name), hooks = $.cssHooks[origName];
        name = $.cssProps[origName] || origName;
        if (hooks && "get" in hooks && (ret = hooks.get(el, true, extra)) !== undefined) return ret;
        else if (curCSS) return curCSS(el, name, origName);
    };
    $.swap = function (el, opt, cb) {
        var old = {};
        for (var k in opt) {
            old[k] = el.style[k];
            el.style[k] = opt[k];
        }
        cb.call(el);
        for (name in opt) el.style[name] = old[name];
    };
    $.camelCase = function (s) { return s.replace(rdashAlpha, fcamelCase); };
    $.access = function (els, key, value, exec, fn, pass) {
        var l = els.length;
        if (typeof key === "object") {
            for (var k in key) {
                $.access(els, k, key[k], exec, fn, value);
            }
            return els;
        }
        if (value !== undefined) {
            exec = !pass && exec && $.isFunction(value);
            for (var i = 0; i < l; i++)
                fn(els[i], key, exec ? value.call(els[i], i, fn(els[i], key)) : value, pass);
            return els;
        }
        return l ? fn(els[0], key) : undefined;
    };
    $._each(["Height", "Width"], function (name, i) {
        var type = name.toLowerCase();
        $.fn["inner" + name] = function () {
            var el = this[0];
            return el && el.style ? parseFloat($.css(el, type, "padding")) : null;
        };
        $.fn["outer" + name] = function (margin) {
            var el = this[0];
            return el && el.style ? parseFloat($.css(el, type, margin ? "margin" : "border")) : null;
        };
        $.fn[type] = function (size) {
            var el = this[0];
            if (!el) return size == null ? null : this;

            if ($.isFunction(size))
                return this.each(function (i) {
                    var self = $(this);
                    self[type](size.call(this, i, self[type]()));
                });

            if ($.isWindow(el)) {
                var docElemProp = el.document.documentElement["client" + name], body = el.document.body;
                return el.document.compatMode === "CSS1Compat" && docElemProp || body && body["client" + name] || docElemProp;
            } else if (el.nodeType === 9) {
                return Math.max(
			        el.documentElement["client" + name],
			        el.body["scroll" + name], el.documentElement["scroll" + name],
			        el.body["offset" + name], el.documentElement["offset" + name]);
            } else if (size === undefined) {
                var orig = $.css(el, type),
                    ret = parseFloat(orig);
                return $.isNaN(ret) ? orig : ret;
            }
            else return this.css(type, typeof size === "string" ? size : size + "px");
        };
    });
});