window.jquip = window.$ = (function ()
{
	var win = window, doc = document, docEl = doc.documentElement,
	    runtil = /Until$/, rmultiselector = /,/,
        rparentsprev = /^(?:parents|prevUntil|prevAll)/,
        rtagname = /<([\w:]+)/,
        rclass = /[\n\t\r]/g,
        rspace = /\s+/,
        rdigit = /\d/,
        rnotwhite = /\S/,
        strim = String.prototype.trim, trim,
        trimLeft = /^\s+/,
        trimRight = /\s+$/,
        guaranteedUnique = { children: true, contents: true, next: true, prev: true },
        toString = Object.prototype.toString,
        class2type = {},
        hasDup = false, baseHasDup = true,
        wrapMap = {
        	option: [1, "<select multiple='multiple'>", "</select>"],
        	legend: [1, "<fieldset>", "</fieldset>"],
        	thead: [1, "<table>", "</table>"],
        	tr: [2, "<table><tbody>", "</tbody></table>"],
        	td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        	col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
        	area: [1, "<map>", "</map>"],
        	_default: [0, "", ""] },
        rComplexQuery = /[,\s.\[]/, emptyArr = [],
		breaker = {},
		ArrayProto = Array.prototype, ObjProto = Object.prototype,
        hasOwn = ObjProto.hasOwnProperty,
        slice = ArrayProto.slice,
        push = ArrayProto.push,
        indexOf = ArrayProto.indexOf,
        nativeForEach = ArrayProto.forEach,
        nativeFilter  = ArrayProto.filter,
        nativeIndexOf = ArrayProto.indexOf;

	if (rnotwhite.test("\xA0")) { trimLeft = /^[\s\xA0]+/; trimRight = /[\s\xA0]+$/; }

	var ctors = [], plugins = {};
	function $(selector, ctx)
	{
		return new $.fn.init(selector, ctx);
	}
	$.fn = $.prototype = {
		constructor: $,
		init: function (selector, ctx) {
			for (var i = 0, l = ctors.length; i < l; i++)
				if (ctors[i].apply(this, arguments)) return this;

			if (!selector) return this;
			if (typeof selector == "function")
			{
				warn("require docready");
				return this;
			} else if (isA(selector)) return this.make(selector);
			if (selector.nodeType || isWin(selector)) return this.make([selector]);
			if (!selector.split) return this;
			if (selector.charAt(0) === "<") return this.make(htmlFrag(selector));
			return this.make($$(selector, ctx));
		},
		make: function(els) {
			make(this, els);
			return this;
		},
		get: function(idx) {
			return this[idx];
		},
		add: function(sel, ctx) {
			return this.make($(sel, ctx));
		},
		each: function(fn) {
			if (!isF(fn)) return this;
			for (var i = 0, l = this.length; i < l; i++)
				fn.call(this[i], i, this[i]);
			return this;
		},
		attr: function(name) {
			return this[0] && attrs(this[0])[name];
		},
		bind: function(type, data, fn) {
			return this.each(function () { $.bind(this, type, fn, data); });
		},
		unbind: function(type, fn) {
			return this.each(function () { $.unbind(this, type, fn); });
		},
		data: function(name, setVal) {
			return $.data(this[0], name, setVal);
		},
		append: function() {
			return this.dm(arguments, true, function (el) {
				if (this.nodeType === 1)
					this.appendChild(el);
			});
		},
		prepend: function() {
			return this.dm(arguments, true, function (el) {
				if (this.nodeType === 1)
					this.insertBefore(el, this.firstChild);
			});
		},
		before: function()	{
			return this.dm(arguments, false, function (el) {
				this.parentNode.insertBefore(el, this);
			});
		},
		after: function(){
			if (this[0] && this[0].parentNode) {
				this.dm(arguments, false, function (el)	{
					this.parentNode.insertBefore(el, this.nextSibling);
				});
			}
			return this;
		},
		dm: function(args, table, cb) {
			var value = args[0];
			if (!value) return this;
			if (!isS(value)) throw "Not supported: " + value;
			return this.each(function () {
				cb.call(this, htmlFrag(value));
			});
		},
		hide: function(){
			this.each(function () { this.style.display = "none"; });
		},
		show: function(){
			this.each(function () { this.style.display = "block"; });
		},
		toggle: function(){
			this.each(function () { this.style.display = this.style.display === "none" ? "block" : "none"; });
		},
		ps: function(els, name, selector){
			var ret = this.constructor();
			if (isA(els)) push.apply(ret, els);
			else merge(ret, els);
			ret.prevObject = this;
			ret.context = this.context;
			if (name === "find")
				ret.selector = this.selector + (this.selector ? " " : "") + selector;
			else if (name)
				ret.selector = this.selector + "." + name + "(" + selector + ")";
			return ret;
		},
		eq: function(i) { return i === -1 ? this.slice(i) : this.slice(i, +i + 1); },
		first: function() { return this.eq(0); },
		last: function() { return this.eq(-1); },
		slice: function(){
			return this.ps(slice.apply(this, arguments),
		        "slice", slice.call(arguments).join(","));
		},
		find: function (sel){
			var self = this, i, l;
			if (!isS(sel)) {
				return $(sel).filter(function(){
					for (i = 0, l = self.length; i < l; i++)
						if ($.contains(self[i], this)) return true;
				});
			}
			var ret = this.ps("", "find", sel), len, n, r;
			for (i = 0, l = this.length; i < l; i++){
				len = ret.len;
				merge(ret, $(sel, this[i]));
				if (i == 0){
					for (n = len; n < ret.length; n++)
						for (r = 0; r < len; r++)
							if (ret[r] === ret[n]) { ret.splice(n--, 1); break; }
				}
			}
			return ret;
		},
        not: function(sel){
          var els=[];
          if (isF(sel) && sel.call !== undefined)
            this.each(function(idx){
              if (!sel.call(this,idx)) els.push(this);
            });
          else {
            var excludes = isS(sel)
                ? this.filter(sel)
                : (isAL(sel) && isF(sel.item))
                    ? slice.call(sel)
                    : $(sel);
            this.each(function(el){
              if (excludes.indexOf(el) < 0) els.push(el);
            });
          }
          return $(els);
        },
        filter: function(sel){
            return $(_filter(this, function(el){
                return el.parentNode && _indexOf($$(el.parentNode, sel), el) >= 0; })
        )},
        indexOf: function(val) {
            return _indexOf(this, val);
        },
       	is: function(sel) {
           return this.length > 0 && $(this[0]).filter(sel).length > 0;
       	},
		remove: function(){
			for (var i = 0, el; (el = this[i]) != null; i++) if (el.parentNode) el.parentNode.removeChild(el);
			return this;
		},
		val: function(setVal){
			if (setVal == null) return (this[0] && this[0].value) || "";
			return this.each(function () { this.value = setVal; });
		},
		html: function(setHtml){
			if (setHtml == null) return (this[0] && this[0].innerHTML) || "";
			return this.each(function () { this.innerHTML = setHtml; });
		},
        text: function(txt) {
       		return typeof txt !== "undefined"
                ? this.each(function(){ this.innerText = txt })
                : txt(this);
       	},
		addClass: function(value){
			var cls, i, l, el, setClass, c, cl;
			if (isF(value))
				return this.each(function (j){
					$(this).addClass(value.call(this, j, this.className));
				});

			if (value && isS(value)) {
				cls = value.split(rspace);
				for (i = 0, l = this.length; i < l; i++) {
					el = this[i];
					if (el && el.nodeType === 1) {
						if (!el.className && cls.length === 1)
							el.className = value;
						else {
							setClass = " " + el.className + " ";
							for (c = 0, cl = cls.length; c < cl; c++) {
								if (! ~setClass.indexOf(" " + cls[c] + " "))
									setClass += cls[c] + " ";
							}
							el.className = trim(setClass);
						}
					}
				}
			}
			return this;
		},
		removeClass: function(value) {
			var clss, i, l, el, cls, c, cl;
			if (isF(value)) return this.each(function (j) {
				$(this).removeClass(value.call(this, j, this.className));
			});

			if ((value && isS(value)) || value === undefined) {
				clss = (value || "").split(rspace);
				for (i = 0, l = this.length; i < l; i++) {
					el = this[i];
					if (el.nodeType === 1 && el.className) {
						if (value) {
							cls = (" " + el.className + " ").replace(rclass, " ");
							for (c = 0, cl = clss.length; c < cl; c++){
								cls = cls.replace(" " + clss[c] + " ", " ");
							}
							el.className = trim(cls);
						}
						else el.className = "";
					}
				}
			}
			return this;
		},
		hasClass: function(sel) {
			return hasClass(this, sel);
		},
		fadeIn: function() {
			this.each(function(){
				$(this).show();
			});
		},
		fadeOut: function(){
			this.each(function(){
				$(this).hide();
			});
		}
	};
	$.fn.init.prototype = $.fn;

	function make(arr, els)
	{
		arr.length = (els && els.length || 0);
		if (arr.length == 0) return arr;
		for (var i = 0, l = els.length; i < l; i++)
			arr[i] = els[i];
		return arr;
	}

	function hasClass(els, cls)
	{
		var cls = " " + cls + " ";
		for (var i = 0, l = els.length; i < l; i++)
			if (els[i].nodeType === 1 && (" " + els[i].className + " ").replace(rclass, " ").indexOf(cls) > -1)
				return true;
		return false;
	} $.hasClass = hasClass;

	function walk(fn, ctx, ret)
	{
		ctx = ctx || doc; ret = ret || [];
		if (ctx.nodeType == 1)
			if (fn(ctx)) ret.push(ctx);
		var els = ctx.childNodes;
		for (var i = 0, l = els.length; i < l; i++) {
			var subEl = els[i];
			if (subEl.nodeType == 1) 
				walk(fn, subEl, ret);			
		}
		return ret;
	} $.walk = walk;

    function $$(sel, ctx, query){
        if (sel && isS(sel)) {
            ctx = ctx || doc; query = query || $.query;
            var firstChar = sel.charAt(0), arg = sel.substring(1),
                complex = rComplexQuery.test(arg), el;
            try {
                if (complex) return slice.call(query(sel, ctx));
                return complex
                    ? slice.call(query(sel, ctx))
                    : (firstChar == "#"
                        ? ((el = (ctx || doc).getElementById(arg)) ? [el] : emptyArr)
                        : slice.call(firstChar == "."
                            ? ctx.getElementsByClassName(arg)
                            : ctx.getElementsByTagName(sel))
                    );
            } catch(e){}
        }
        return sel.nodeType == 1 || sel.nodeType == 9 ? [sel] : emptyArr;
    } $.$$ = $$;

    $.setQuery = function(query) {
        $.query = function (sel, ctx)
        {
            var ret = $$(sel, ctx, query
                || function(sel, ctx) { return ctx.querySelectorAll(sel); }
            );
            return ret;
        };
    };
    $.setQuery(win.Sizzle || win.qwery); //if declared above use it

	function warn() { console && console.warn(arguments) }

	$.each = function (o, cb, args) {
		var k, i = 0, l = o.length, isObj = l === undefined || isF(o);
		if (args) {
			if (isObj)
				for (k in o)
					if (cb.apply(o[k], args) === false) break;
					else
						for (; i < l; )
							if (cb.apply(o[i++], args) === false) break;
		} else {
			if (isObj)
				for (k in o)
					if (cb.call(o[k], k, o[k]) === false) break;
					else
						for (; i < l; )
							if (cb.call(o[i], i, o[i++]) === false) break;
		}
		return o;
	};
	function _each(o, fn, ctx) {
		if (o == null) return;
		if (nativeForEach && o.forEach === nativeForEach)
			o.forEach(fn, ctx);
		else if (o.length === +o.length) {
			for (var i = 0, l = o.length; i < l; i++)
				if (i in o && fn.call(ctx, o[i], i, o) === breaker) return;
		} else {
			for (var key in o)
				if (hasOwn.call(o, key))
					if (fn.call(ctx, o[key], key, o) === breaker) return;
		}
	} $._each = _each;
    function _indexOf(arr, val) {
        if (arr == null) return -1;
        var i, l;
        if (nativeIndexOf && arr.indexOf === nativeIndexOf) return arr.indexOf(val);
        for (i = 0, l = arr.length; i < l; i++) if (arr[i] === val) return i;
        return -1;
    } $._indexOf = _indexOf;
    $._defaults = function(obj) {
        _each(slice.call(arguments, 1), function(o) {
            for (var k in o)
                if (obj[k] == null) obj[k] = o[k];
        });
        return obj;
    };
    function _filter(o, fn, ctx) {
      var ret = [];
      if (o == null) return ret;
      if (nativeFilter && o.filter === nativeFilter) return o.filter(fn, ctx);
      _each(o, function(val, i, arr) {
        if (fn.call(ctx, val, i, arr)) ret[ret.length] = val;
      });
      return ret;
    } $._filter = _filter;
	$.dir = function (el, dir, until) {
		var matched = [], cur = el[dir];
		while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !$(cur).is(until))) {
			if (cur.nodeType === 1) matched.push(cur);
			cur = cur[dir];
		}
		return matched;
	};
	$.nth = function (cur, result, dir, el) {
		result = result || 1;
		var num = 0;
		for (; cur; cur = cur[dir])
			if (cur.nodeType === 1 && ++num === result) break;
		return cur;
	};
	$.sibling = function (n, el) {
		var r = [];
		for (; n; n = n.nextSibling) if (n.nodeType === 1 && n !== el) r.push(n);
		return r;
	};
    $.grep = function(els, cb, inv) {
        var ret = [], retVal;
        inv = !!inv;
        for (var i = 0, length = els.length; i < length; i++) {
            retVal = !!cb(els[i], i);
            if (inv !== retVal)
                ret.push(els[i]);
        }
        return ret;
    };
    $.map = function(els, cb, arg) {
        var value, key, ret = [], i = 0, length = els.length,
            isArray = els instanceof $
                || typeof length === "number"
                    && ((length > 0 && els[0] && els[length-1]) || length === 0 || isA(els));
        if (isArray) {
            for (; i < length; i++) {
                value = cb(els[i], i, arg);
                if (value != null)
                    ret[ret.length] = value;
            }
        } else {
            for (key in els) {
                value = cb(els[key], key, arg);
                if (value != null)
                    ret[ret.length] = value;
            }
        }
        return ret.concat.apply([], ret);
    };
     $.bind = function (o, type, fn) {
		if (o.attachEvent) {
			o['e' + type + fn] = fn;
			o[type + fn] = function () { o['e' + type + fn](win.event); };
			o.attachEvent('on' + type, o[type + fn]);
		} else
			o.addEventListener(type, fn, false);
	};
	$.unbind = function (o, type, fn) {
		if (o.detachEvent) {
			o.detachEvent('on' + type, o[type + fn]);
			o[type + fn] = null;
		} else
			o.removeEventListener(type, fn, false);
	};
	$.data = function (el, name, setVal) {
		if (!el) return {};
		if (name && setVal) {
			el.setAttribute(name, setVal);
			return null;
		}
		var o = {};
		_each(attrs(el), function (val, aName) {
			if (aName.indexOf("data-") !== 0 || !val) return;
			o[aName.substr("data-".length)] = val;
		});
		if (isS(name)) return o[name];
		return o;
	};
    function text(el) {
        var attr = el.getAttribute("type"), type = el.type;
        return eqSI(el.nodeName, "input") && "text" === type && ( attr === type || attr === null );
    }
	function attrs(el) {
		var o = {};
		for (var i = 0, elAttrs = el.attributes, len = elAttrs.length; i < len; i++)
			o[elAttrs.item(i).nodeName] = elAttrs.item(i).nodeValue;
		return o;
	} $.attrs = attrs;
    function eqSI(str1, str2) {
        return !str1 || !str2 ? str1 == str2 : str1.toLowerCase() === str2.toLowerCase();
    } $.eqSI = eqSI;
	$.trim = trim = strim
        ? function (text) { return text == null ? "" : strim.call(text); }
        : function (text) { return text == null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, ""); };
	$.indexOf = $.inArray = function (el, arr) {
		if (!arr) return -1;
		if (indexOf) return indexOf.call(arr, el);

		for (var i = 0, length = arr.length; i < length; i++)
			if (arr[i] === el)
				return i;
		return -1;
	};
	$.fn.trigger = function (name) {
		var $this = this;
		return this.each(function(){
			var fn = this[name];
			if (isF(fn))
				fn.call(this);
			return $this;
		});
	};
	_each("Boolean Number String Function Array Date RegExp Object".split(" "), function (name)	{
		class2type["[object " + name + "]"] = name.toLowerCase();
		return this;
	});

	function typeOf(o) { return o == null ? String(o) : class2type[toString.call(o)] || "object"; } $.type = typeOf;
	function isS(o) { return typeof o === "string"; }
	function isF(o) { return typeof o === "function" || typeOf(o) === "function"; } $.isFunction = isF;
	function isA(o) { return typeOf(o) === "array"; } $.isArray = Array.isArray || isA;
    function isAL(obj) { return typeof obj.length == 'number' }
	function isWin(o) { return o && typeof o === "object" && "setInterval" in o; } $.isWindow = isWin;
	function isNan(obj) { return obj == null || !rdigit.test(obj) || isNaN(obj); } $.isNaN = isNan;
	function isPlainObj(o) {
		if (!o || typeOf(o) !== "object" || o.nodeType || isWin(o)) return false;
		try {
			if (o.constructor && !hasOwn.call(o, "constructor") && !hasOwn.call(o.constructor.prototype, "isPrototypeOf")) return false;
		} catch (e) { return false; }
		var key;
		for (key in o) { }
		return key === undefined || hasOwn.call(o, key);
	}
	function merge(a1, a2)
	{
		var i = a1.length, j = 0;
		if (typeof a2.length === "number")
			for (var l = a2.length; j < l; j++)
				a1[i++] = a2[j];
		else
			while (a2[j] !== undefined)
				a1[i++] = a2[j++];
		a1.length = i;
		return a1;
	} $.merge = merge;
	$.extend = $.fn.extend = function () {
		var opt, name, src, copy, copyIsArr, clone, args = arguments,
			dst = args[0] || {}, i = 1, aLen = args.length, deep = false;
		if (typeof dst === "boolean")
			deep = dst; dst = args[1] || {}; i = 2;
		if (typeof dst !== "object" && !isF(dst)) dst = {};
		if (aLen === i) { dst = this; --i; }
		for (; i < aLen; i++) {
			if ((opt = args[i]) != null) {
				for (name in opt) {
					src = dst[name];
					copy = opt[name];
					if (dst === copy) continue;
					if (deep && copy && (isPlainObj(copy) || (copyIsArr = isA(copy)))) {
						if (copyIsArr) {
							copyIsArr = false;
							clone = src && isA(src) ? src : [];
						} else
							clone = src && isPlainObj(src) ? src : {};
						dst[name] = $.extend(deep, clone, copy);
					} else if (copy !== undefined)
						dst[name] = copy;
				}
			}
		}
		return dst;
	};
	$.makeArray = function (arr, results) {
		var ret = results || [];
		if (arr != null) {
			var type = typeOf(arr);
			if (arr.length == null || isS(type) || isF(type) || type === "regexp" || isWin(arr)) 
				push.call(ret, arr);
			else 
				merge(ret, arr);
		}
		return ret;
	};
	function htmlFrag(html) {
		var frag = doc.createDocumentFragment(),
            div = doc.createElement('div'),
            tag = (rtagname.exec(html) || ["", ""])[1].toLowerCase(),
            wrap = wrapMap[tag] || wrapMap._default,
            depth = wrap[0];
		div.innerHTML = wrap[1] + html + wrap[2];
		while (depth--) { div = div.lastChild; }
		while (div.firstChild) frag.appendChild(div.firstChild);
		return frag;
	} $.htmlFrag = htmlFrag;

	var sibChk = function (a, b, ret) {
		if (a === b) return ret;
		var cur = a.nextSibling;
		while (cur)
		{
			if (cur === b) return -1;
			cur = cur.nextSibling;
		}
		return 1;
	};
    $.contains = docEl.contains
        ? function(a,b){return a !== b && (a.contains ? a.contains(b) : true) }
        : function(){ return false };
	var sortOrder = docEl.compareDocumentPosition
        ? ($.contains = function(a,b){ return !!(a.compareDocumentPosition(b) & 16); }) //just assigning $.contains
            && function (a, b) {
                if (a === b)
                {
                    hasDup = true;
                    return 0;
                }
                if (!a.compareDocumentPosition || !b.compareDocumentPosition)
                    return a.compareDocumentPosition ? -1 : 1;
                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            }
        : function (a, b) {
        	if (a === b) { hasDup = true; return 0; }
        	else if (a.sourceIndex && b.sourceIndex) return a.sourceIndex - b.sourceIndex;
        	var al, bl, ap = [], bp = [], aup = a.parentNode, bup = b.parentNode, cur = aup;
        	if (aup === bup) return sibChk(a, b);
        	else if (!aup) return -1;
        	else if (!bup) return 1;
        	while (cur) { ap.unshift(cur); cur = cur.parentNode; }
        	cur = bup;
        	while (cur) { bp.unshift(cur); cur = cur.parentNode; }
        	al = ap.length;
        	bl = bp.length;
        	for (var i = 0; i < al && i < bl; i++)
        		if (ap[i] !== bp[i]) return sibChk(ap[i], bp[i]);
        	return i === al ? sibChk(a, bp[i], -1) : sibChk(ap[i], b, 1);
        };
	function unique(els) {
		if (sortOrder) {
			hasDup = baseHasDup;
			els.sort(sortOrder);
			if (hasDup)
				for (var i = 1; i < els.length; i++)
					if (els[i] === els[i - 1]) els.splice(i--, 1);
		}
		return els;
	} $.unique = unique;
	_each(("blur focus focusin focusout load resize scroll unload click dblclick " +
            "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
            "change select submit keydown keypress keyup error").split(" "),
        function (name) {
        	$.fn[name] = function (data, fn) {
        		if (fn == null) {
        			fn = data;
        			data = null;
        		}
        		return arguments.length > 0 ? this.bind(name, data, fn) : this.trigger(name);
        	};
        }
    );
	_each({
		parent: function (el) { var parent = el.parentNode; return parent && parent.nodeType !== 11 ? parent : null; },
		parents: function (el) { return $.dir(el, "parentNode"); },
		parentsUntil: function (el, i, until) { return $.dir(el, "parentNode", until); },
		next: function (el) { return $.nth(el, 2, "nextSibling"); },
		prev: function (el) { return $.nth(el, 2, "previousSibling"); },
		nextAll: function (el) { return $.dir(el, "nextSibling"); },
		prevAll: function (el) { return $.dir(el, "previousSibling"); },
		nextUntil: function (el, i, until) { return $.dir(el, "nextSibling", until); },
		prevUntil: function (el, i, until) { return $.dir(el, "previousSibling", until); },
		siblings: function (el) { return $.sibling(el.parentNode.firstChild, el); },
		children: function (el) { return $.sibling(el.firstChild); },
		contents: function (el) {
			return el.nodeName === "iframe" ? el.contentDocument || el.contentWindow.document : $.makeArray(el.childNodes);
		}
	}, function (fn, name) {
		$.fn[name] = function (until, sel) {
			var ret = $.map(this, fn, until), args = slice.call(arguments);
			if (!runtil.test(name)) sel = until;
			if (sel && isS(sel)) ret = $.filter(sel, ret);
			ret = this.length > 1 && !guaranteedUnique[name] ? $.unique(ret) : ret;
			if ((this.length > 1 || rmultiselector.test(sel)) && rparentsprev.test(name)) ret = ret.reverse();
			return this.ps(ret, name, args.join(","));
		};
	});

	function boxmodel() {
		if (!doc.body) { //in HEAD
			$(win).bind("load", function() {
				$.support = boxmodel();
			});
			return null;
		}
		var d = doc.createElement('div');
		doc.body.appendChild(d);
		d.style.width = '20px';
		d.style.padding = '10px';
		var w = d.offsetWidth;
		doc.body.removeChild(d);
		return w == 40;
	}
	(function () {
		var div = document.createElement("div");
		div.style.display = "none";
		div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
		var a = div.getElementsByTagName("a")[0];
		$.support = {
			boxModel: boxmodel(),
			opacity: /^0.55$/.test(a.style.opacity),
			cssFloat: !!a.style.cssFloat
		};
	})();

	$.hook = function (fn) { ctors.push(fn); };
	$.plug = function (meta, fn) {
		var name = isS(meta) ? meta : meta['name'];
		fn = isF(meta) ? meta : fn;
		if (!isF(fn)) throw "Plugin fn required";
		if (name && fn) plugins[name] = fn;
		fn($);
	};

	return $;
})();
$.plug(function($) {

    var doc = document,
        $id = function (id, ctx) { return (ctx || doc).getElementById(id); },
        $tag = function (tag, ctx) { return (ctx || doc).getElementsByTagName(tag); },
        $cls = doc.getElementsByClassName //&& false
            ? function (cls, ctx) { return (ctx || doc).getElementsByClassName(cls); }
            : function (cls, ctx) {
                var ret = $.walk(function (el) {
                    return el.className && el.className.indexOf(cls) >= 0;
                }, (ctx || doc));
                    return $.unique(ret);
            };

    function childSel(sel, ctx)
   	{
   		var el = $.$$(ctx)[0], cls = sel.split('.'), tag = cls.shift(), fPos = tag.indexOf('['), fName, fValue, parts,
               firstChar = tag.charAt(0);
        if (firstChar == "#") return $id(tag.substring(1), el);
   		if (fPos >= 0) {
   			parts = tag.substring(fPos + 1, tag.length - 1).split('=');
   			fName = parts[0]; fValue = parts.length == 2 && parts[1];
   			if (fValue && fValue.charAt(0) == "'")
   				fValue = fValue.substring(1, fValue.length - 1);
   			tag = tag.substring(0, fPos);
   		}
   		var tagWithId = tag.split('#');
   		if (tagWithId.length == 2){
   			el = $id(tagWithId[1], el);
   			if (!el) return [];
   			if (!$.eqSI(el.tagName, tagWithId[0])) return [];
   			if (cls.length == 1) return [el];
   		}
   		var els = tag ? $tag(tag,el) : $cls(cls.shift(), el);
   		if (!cls.length && !fName) return els;
   		var ret = [];
   		for (var i = 0, l = els.length; i < l; i++){
   			var subEl = els[i], j = cls.length, matches = true;
   			if (cls.length) while (j--) if (!$.hasClass([subEl], cls[j])) matches = false;
   			if (matches && (!fName || (!fValue || subEl[fName] == fValue)))
   				ret.push(subEl);
   		}
   		return ret;
   	}

    $.setQuery(function (selector, ctx) {
        var els, resSet = [[(ctx || doc)]], heir = selector.split(' '), ret = [];
        for (var i = 0, l = heir.length; i < l; i++) {
            var parentSet = resSet[i];
            if (parentSet.length == 0) return ret;
            var sel = heir[i], res = [];

                for (var j = 0, jlen = parentSet.length; j < jlen; j++) {
                    els = childSel(sel, parentSet[j]);
                    for (var k = 0, klen = els.length; k < klen; k++)
                        res.push(els[k]);
                }
                resSet.push(res);

        }
        return resSet.length > 1 ? resSet.pop() : [];
    });
});