$['plug']("css", function ($) {
    var doc = document,
	    docEl = doc.documentElement,
	    ralpha = /alpha\([^)]*\)/i,
        ropacity = /opacity=([^)]*)/,
        rdashAlpha = /-([a-z])/ig,
        rupper = /([A-Z])/g,
        rnumpx = /^-?\d+(?:px)?$/i,
        rnum = /^-?\d/,
	    rroot = /^(?:body|html)$/i,
	    cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	    cssWidth = [ "Left", "Right" ],
	   	cssHeight = [ "Top", "Bottom" ],
        curCSS,
        getComputedStyle,
        currentStyle,
        fcamelCase = function (all, l) { return l.toUpperCase(); };
    
    $['cssHooks'] = {
        'opacity': {
            'get': function (el, comp) {
                if (!comp) return el.style.opacity;
                var ret = curCSS(el, "opacity", "opacity");
                return ret === "" ? "1" : ret;
            }
        }
    };
	$['_each'](["height", "width"], function(k) {
		$['cssHooks'][k] = {
			get: function(el, comp, extra) {
				var val;
				if (comp) {
					if (el.offsetWidth !== 0)
						return getWH(el, k, extra);

					swap(el, cssShow, function() {
						val = getWH( el, k, extra );
					});
					return val;
				}
			},
			set: function(el, val) {
				if (rnumpx.test(val)) {
					val = parseFloat( val );

					if (val >= 0)
						return val + "px";
				} else
					return val;
			}
		};
	});
	function getWH(el, name, extra) {
		var val = name === "width" ? el.offsetWidth : el.offsetHeight,
			which = name === "width" ? cssWidth : cssHeight;
		if (val > 0) {
			if (extra !== "border") {
				$['each']( which, function() {
					if ( !extra )
						val -= parseFloat(css(el, "padding" + this) ) || 0;
					if ( extra === "margin" )
						val += parseFloat(css(el, extra + this) ) || 0;
					else
						val -= parseFloat(css(el, "border" + this + "Width") ) || 0;
				});
			}
			return val + "px";
		}
		return "";
	}

    if (!$['support']['opacity']) {
	    $['support']['opacity'] = {
            get: function (el, computed) {
                return ropacity.test((computed && el.currentStyle ? el.currentStyle.filter : el.style.filter) || "")
                    ? (parseFloat(RegExp.$1) / 100) + "" 
                    : computed ? "1" : "";
            },
            set: function (el, value) {
                var s = el.style;
                s.zoom = 1;
                var opacity = $['isNaN'](value) ? "" : "alpha(opacity=" + value * 100 + ")", filter = s.filter || "";
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
                if (ret === "" && !$['contains'](el.ownerDocument.documentElement, el))
                    ret = $['style'](el, name);
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

    $['fn']['css'] = function (name, value) {
        if (arguments.length === 2 && value === undefined) return this;

        return access(this, name, value, true, function (el, name, value) {
            return value !== undefined ? style(el, name, value) : css(el, name);
        });
    };
    $['cssNumber'] = { "zIndex": true, "fontWeight": true, "opacity": true, "zoom": true, "lineHeight": true };
    $['cssProps'] = { "float": $['support']['cssFloat'] ? "cssFloat" : "styleFloat" };
    function style(el, name, value, extra) {
        if (!el || el.nodeType === 3 || el.nodeType === 8 || !el.style) return;
        var ret, origName = camelCase(name), style = el.style, hooks = $['cssHooks'][origName];
        name = $['cssProps'][origName] || origName;
        if (value !== undefined) {
            if (typeof value === "number" && isNaN(value) || value == null) return;
            if (typeof value === "number" && !$['cssNumber'][origName]) value += "px";
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
    } $['style'] = style;
    function css(el, name, extra) {
        var ret, origName = camelCase(name), hooks = $['cssHooks'][origName];
        name = $['cssProps'][origName] || origName;
        if (hooks && "get" in hooks && (ret = hooks.get(el, true, extra)) !== undefined) return ret;
        else if (curCSS) return curCSS(el, name, origName);
    }$['css'] = css;
    function swap(el, opt, cb) {
        var old = {},k;
        for (var k in opt) {
            old[k] = el.style[k];
            el.style[k] = opt[k];
        }
        cb.call(el);
        for (k in opt) el.style[k] = old[k];
    }$['swap'] = swap;
    function camelCase(s) { return s.replace(rdashAlpha, fcamelCase); } $['camelCase'] = camelCase;
    function access(els, key, value, exec, fn, pass) {
        var l = els.length;
        if (typeof key === "object") {
            for (var k in key) {
                access(els, k, key[k], exec, fn, value);
            }
            return els;
        }
        if (value !== undefined) {
            exec = !pass && exec && $['isFunction'](value);
            for (var i = 0; i < l; i++)
                fn(els[i], key, exec ? value.call(els[i], i, fn(els[i], key)) : value, pass);
            return els;
        }
        return l ? fn(els[0], key) : undefined;
    }

	var init, noMarginBodyOff, subBorderForOverflow, suppFixedPos, noAddBorder, noAddBorderForTables,
		initialize = function() {
			if (init) return;
			var body = doc.body, c = doc.createElement("div"), iDiv, cDiv , table, td, bodyMarginTop = parseFloat(css(body, "marginTop")) || 0,
				html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
			$['extend'](c.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" });
			c.innerHTML = html;
			body.insertBefore(c, body.firstChild);
			iDiv = c.firstChild;
			cDiv = iDiv.firstChild;
			td = iDiv.nextSibling.firstChild.firstChild;
			noAddBorder = (cDiv .offsetTop !== 5);
			noAddBorderForTables = (td.offsetTop === 5);
			cDiv .style.position = "fixed";
			cDiv .style.top = "20px";
			suppFixedPos = (cDiv .offsetTop === 20 || cDiv .offsetTop === 15);
			cDiv .style.position = cDiv .style.top = "";
			iDiv.style.overflow = "hidden";
			iDiv.style.position = "relative";
			subBorderForOverflow = (cDiv .offsetTop === -5);
			noMarginBodyOff = (body.offsetTop !== bodyMarginTop);
			body.removeChild(c);
			init = true;
		},
		bodyOffset = function(body){
			var top = body.offsetTop, left = body.offsetLeft;
			initialize();
			if (noMarginBodyOff){
				top  += parseFloat( css(body, "marginTop") ) || 0;
				left += parseFloat( css(body, "marginLeft") ) || 0;
			}
			return { top: top, left: left };
		};

	$['fn']['offset'] = function(){
		var el = this[0], box;
		if (!el || !el.ownerDocument) return null;
		if (el === el.ownerDocument.body) return bodyOffset(el);
		try {
			box = el.getBoundingClientRect();
		} catch(e) {}
		if (!box || !$['contains'](docEl, el))
			return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
		var body = doc.body,
			win = getWin(doc),
			clientTop  = docEl.clientTop  || body.clientTop  || 0,
			clientLeft = docEl.clientLeft || body.clientLeft || 0,
			scrollTop  = win['pageYOffset'] || $['support']['boxModel'] && docEl.scrollTop  || body.scrollTop,
			scrollLeft = win['pageXOffset'] || $['support']['boxModel'] && docEl.scrollLeft || body.scrollLeft,
			top  = box.top + scrollTop - clientTop,
			left = box.left + scrollLeft - clientLeft;
		return { top: top, left: left };
	};
	$['fn']['position'] = function() {
		if (!this[0]) return null;
		var el = this[0],
		offPar = this['offsetParent'](),
		off = this['offset'](),
		parOff = rroot.test(offPar[0].nodeName) ? { top: 0, left: 0 } : offPar['offset']();
		off.top -= parseFloat(css(el, "marginTop")) || 0;
		off.left -= parseFloat(css(el, "marginLeft")) || 0;
		parOff.top += parseFloat(css(offPar[0], "borderTopWidth")) || 0;
		parOff.left += parseFloat(css(offPar[0], "borderLeftWidth")) || 0;
		return { top: off.top - parOff.top, left: off.left - parOff.left };
	};
	$['fn']['offsetParent'] = function(){
		return this['map'](function(){
			var op = this.offsetParent || doc.body;
			while (op && (!rroot.test(op.nodeName) && css(op,"position") === "static"))
				op = op.offsetParent;
			return op;
		});
	};

    $['_each'](["Height", "Width"], function (name, i) {
        var type = name.toLowerCase();
        $['fn']["inner" + name] = function () {
            var el = this[0];
            return el && el.style ? parseFloat(css(el, type, "padding")) : null;
        };
        $['fn']["outer" + name] = function (margin) {
            var el = this[0];
            return el && el.style ? parseFloat(css(el, type, margin ? "margin" : "border")) : null;
        };
        $['fn'][type] = function (size) {
            var el = this[0];
            if (!el) return size == null ? null : this;
            if ($['isFunction'](size))
                return this['each'](function (i) {
                    var self = $(this);
                    self[type](size.call(this, i, self[type]()));
                });
            if ($['isWindow'](el)) {
                var docElProp = el.document.documentElement["client" + name], body = el.document.body;
                return el.document.compatMode === "CSS1Compat" && docElProp || body && body["client" + name] || docElProp;
            } else if (el.nodeType === 9) {
                return Math.max(
			        el.documentElement["client" + name],
			        el.body["scroll" + name], el.documentElement["scroll" + name],
			        el.body["offset" + name], el.documentElement["offset" + name]);
            } else if (size === undefined) {
                var orig = css(el, type),
                    ret = parseFloat(orig);
                return $['isNaN'](ret) ? orig : ret;
            }
            else return this['css'](type, typeof size === "string" ? size : size + "px");
        };
    });

    function getWin(el) { return $['isWindow'](el) ? el : el.nodeType === 9 ? el.defaultView || el.parentWindow : false; }

    $['_each'](["Left", "Top"], function (name, i) {
        var method = "scroll" + name;
        $['fn'][method] = function (val) {
            var el, win;
            if (val === undefined) {
                el = this[0];
                if (!el) return null;
                win = getWin(el);
                return win ? ("pageXOffset" in win)
                    ? win[i ? "pageYOffset" : "pageXOffset"]
                    : $['support']['boxModel'] && win.document.documentElement[method] || win.document.body[method] : el[method];
            }
            return this['each'](function() {
                win = getWin(this);
                if (win)
                    win['scrollTo'](!i ? val : $(win)['scrollLeft'](), i ? val : $(win)['scrollTop']());
                else
                    this[method] = val;
            });
        };
    });

});
