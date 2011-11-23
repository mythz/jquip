window.$ = window.jQuery = (function ()
{
	var win = window, doc = document, docEl = doc.documentElement, $id = function (id) { return doc.getElementById(id); },
        $tag = function (tag, ctx) { return (ctx || doc).getElementsByTagName(tag); },
        notImplemented = "Not Implemented",
	    runtil = /Until$/, rmultiselector = /,/,
        slice = Array.prototype.slice, push = Array.prototype.push, indexOf = Array.prototype.indexOf,
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
        $qs,
		breaker = {},
		ArrayProto = Array.prototype, ObjProto = Object.prototype,
		hasOwn = ObjProto.hasOwnProperty,
        nativeForEach = ArrayProto.forEach,
        nativeMap = ArrayProto.map;

	if (rnotwhite.test("\xA0")) trimLeft = /^[\s\xA0]+/, trimRight = /[\s\xA0]+$/;

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
			if (selector.charAt(0) === "<") return this.make(fromHtml(selector));
			return this.make($qs(selector, ctx));
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
				cb.call(this, fromHtml(value));
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
		pushStack: function(els, name, selector){
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
			return this.pushStack(slice.apply(this, arguments),
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
			var ret = this.pushStack("", "find", sel), len, n, r;
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

	//BeginQuery
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
	}
	function $token(sel, ctx)
	{
		var el = $el(ctx), cls = sel.split('.'), tag = cls.shift(), fPos = tag.indexOf('['), fName, fValue, parts;
		if (fPos >= 0) {
			parts = tag.substring(fPos + 1, tag.length - 1).split('=');
			fName = parts[0], fValue = parts.length == 2 && parts[1];
			if (fValue && fValue.charAt(0) == "'")
				fValue = fValue.substring(1, fValue.length - 1);
			tag = tag.substring(0, fPos);
		}
		var tagWithId = tag.split('#');
		if (tagWithId.length == 2){
			el = $id(tagWithId[1], el);
			if (!el) return [];
			if (!eq(el.tagName, tagWithId[0])) return [];
			if (cls.length == 1) return [el];
		}
		var els = tag ? $tag(tag,el) : $cls(cls.shift(), el);
		if (!cls.length && !fName) return els;
		var ret = [];
		for (var i = 0, l = els.length; i < l; i++){
			var subEl = els[i], j = cls.length, matches = true;
			if (cls.length) while (j--) if (!hasClass([subEl], cls[j])) matches = false;
			if (matches && (!fName || (!fValue || subEl[fName] == fValue)))
				ret.push(subEl);
		}
		return ret;
	}
	function walk(fn, ctx, ret)
	{
		ctx = ctx || doc, ret = ret || [];
		if (ctx.nodeType == 1)
			if (fn(ctx)) ret.push(ctx);
		var els = ctx.childNodes;
		for (var i = 0, l = els.length; i < l; i++) {
			var subEl = els[i];
			if (subEl.nodeType == 1) {
				if (fn(subEl)) ret.push(subEl);
				walk(fn, subEl, ret);
			}
		}
		return ret;
	} $.walk = walk;

	var $cls = doc.getElementsByClassName //&& false
            ? function (cls, ctx) { return (ctx || doc).getElementsByClassName(cls); }
            : function (cls, ctx) {
            	var ret = walk(function (el) {
            		return el.className && el.className.indexOf(cls) >= 0;
            	}, (ctx || doc));
            	return unique(ret);
            };
	$qs = $.fn.qs = doc.querySelectorAll //&& false
            ? function (sel, ctx) { return (ctx || doc).querySelectorAll(sel); }
            : win.Sizzle || function (selector, ctx) {
            	var els, resSet = [[(ctx || doc)]], heir = selector.split(' '), ret = [];
            	for (var i = 0, l = heir.length; i < l; i++) {
            		var parentSet = resSet[i];
            		if (parentSet.length == 0) return ret; //short-circuit
            		var sel = heir[i], res = [], firstChar = sel.charAt(0);
            		if (firstChar == '#') {
            			resSet.push([(ctx || doc).getElementById(sel.substring(1))]);
            		} else {
            			for (var j = 0, jlen = parentSet.length; j < jlen; j++) {
            				els = $token(sel, parentSet[j]);
            				for (var k = 0, klen = els.length; k < klen; k++)
            					res.push(els[k]);
            			}
            			resSet.push(res);
            		}
            	}
            	return resSet.length > 1 ? resSet.pop() : [];
            };
	$.queryAll = $qs;
	function $qsMany(els, sel)
	{
		var ret = [];
		for (var i = 0, l = els.length; i < l; i++) {
			var el = els[i];
			merge(ret, $qs(sel, el));
		}
		unique(ret);
		return ret;
	};
	//EndQuery
	function $el(sel) {
		if (isS(sel))
			return sel.charAt(0) == '#' ? $id(sel.substring(1)) : $tag(sel)[0];
		return sel;
	}
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
	}; $._each = _each;
	$.filter = function (expr, els, not) {
		var ret = [], isTagOnly = (expr.indexOf(' ') === -1);
		if (isTagOnly) {
			_each(els, function (el) {
				if (el.tagName == expr) ret.push(el);
			});
			return ret;
		}
		throw notImplemented;
	};
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
	$.map = function (o, fn, ctx) {
		var results = [];
		if (o == null) return results;
		if (nativeMap && o.map === nativeMap) return o.map(fn, ctx);
		_each(o, function (value, index, list) {
			results.push(fn.call(ctx, value, index, list));
		});
		return results;
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
	function attrs(el) {
		var o = {};
		for (var i = 0, elAttrs = el.attributes, len = elAttrs.length; i < len; i++)
			o[elAttrs.item(i).nodeName] = elAttrs.item(i).nodeValue;
		return o;
	}; $.attrs = attrs;
	trim = strim
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

	function typeOf(o) { return o == null ? String(o) : class2type[toString.call(o)] || "object"; }; $.type = typeOf;
	function isS(o) { return typeof o === "string"; };
	function isF(o) { return typeof o === "function" || typeOf(o) === "function"; }; $.isFunction = isF;
	function isA(o) { return typeOf(o) === "array"; }; $.isArray = Array.isArray || isA;
	function isWin(o) { return o && typeof o === "object" && "setInterval" in o; }; $.isWindow = isWin;
	function isNan(obj) { return obj == null || !rdigit.test(obj) || isNaN(obj); }; $.isNaN = isNan;
	function eq(str1, str2) { return !str1 || !str2 ? str1 == str2 : str1.toLowerCase() == str2.toLowerCase(); }
	function isPlainObject(o) {
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
	}; $.merge = merge;
	$.extend = $.fn.extend = function () {
		var opt, name, src, copy, copyIsArr, clone, args = arguments,
			dst = args[0] || {}, i = 1, aLen = args.length, deep = false;
		if (typeof dst === "boolean")
			deep = dst, dst = args[1] || {}, i = 2;
		if (typeof dst !== "object" && !isF(dst)) dst = {};
		if (aLen === i) { dst = this; --i; }
		for (; i < aLen; i++) {
			if ((opt = args[i]) != null) {
				for (name in opt) {
					src = dst[name];
					copy = opt[name];
					if (dst === copy) continue;
					if (deep && copy && (isPlainObject(copy) || (copyIsArr = isA(copy)))) {
						if (copyIsArr) {
							copyIsArr = false;
							clone = src && isA(src) ? src : [];
						} else
							clone = src && isPlainObject(src) ? src : {};
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
	function fromHtml(html) {
		var frag = doc.createDocumentFragment(),
            div = doc.createElement('div'),
            tag = (rtagname.exec(html) || ["", ""])[1].toLowerCase(),
            wrap = wrapMap[tag] || wrapMap._default,
            depth = wrap[0];

		div.innerHTML = wrap[1] + html + wrap[2];
		while (depth--) { div = div.lastChild; }
		while (div.firstChild) frag.appendChild(div.firstChild);
		return frag;
	}; $.fromHtml = fromHtml;

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
	var sortOrder = docEl.compareDocumentPosition
        ? function (a, b) {
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
	function unique(els)
	{
		if (sortOrder)
		{
			hasDup = baseHasDup;
			els.sort(sortOrder);
			if (hasDup)
				for (var i = 1; i < els.length; i++)
					if (els[i] === els[i - 1]) els.splice(i--, 1);
		}
		return els;
	}; $.unique = unique;
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
			return $.nodeName(el, "iframe") ? el.contentDocument || el.contentWindow.document : $.makeArray(el.childNodes);
		}
	}, function (fn, name) {
		$.fn[name] = function (until, sel) {
			var ret = $.map(this, fn, until), args = slice.call(arguments);
			if (!runtil.test(name)) sel = until;
			if (sel && isS(sel)) ret = $.filter(sel, ret);
			ret = this.length > 1 && !guaranteedUnique[name] ? $.unique(ret) : ret;
			if ((this.length > 1 || rmultiselector.test(sel)) && rparentsprev.test(name)) ret = ret.reverse();
			return this.pushStack(ret, name, args.join(","));
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

	function getWin(el) { return isWin(el) ? el : el.nodeType === 9 ? el.defaultView || el.parentWindow : false; }
	_each(["Left", "Top"], function (name, i) {
		var method = "scroll" + name;
		$.fn[method] = function (val) {
			var el, win;
			if (val === undefined) {
				el = this[0];
				if (!el) return null;
				win = getWin(el);
				return win ? ("pageXOffset" in win)
                    ? win[i ? "pageYOffset" : "pageXOffset"]
                    : $.support.boxModel && win.document.documentElement[method] || win.document.body[method] : el[method];
			}
			return this.each(function() {
				win = getWin(this);
				if (win)
					win.scrollTo(!i ? val : $(win).scrollLeft(), i ? val : $(win).scrollTop());
				else
					this[method] = val;
			});
		};
	});

	$.addConstructor = function (fn) { ctors.push(fn); };
	$.addPlugin = function (meta, fn) {
		var name = isS(meta) ? meta : meta['name'];
		fn = typeof meta == "function" ? meta : fn;
		if (typeof fn != "function") throw "Plugin fn required";
		if (name && fn) plugins[name] = fn;
		fn($);
	};

	return $;
})();
$.addPlugin("ajax", function ($) {
	var xhrs = [
           function () { return new XMLHttpRequest(); },
           function () { return new ActiveXObject("Microsoft.XMLHTTP"); },
           function () { return new ActiveXObject("MSXML2.XMLHTTP.3.0"); },
           function () { return new ActiveXObject("MSXML2.XMLHTTP"); }
        ],
        _xhrf = null;
	$.xhr = function () {
		if (_xhrf != null) return _xhrf();
		for (var i = 0, l = xhrs.length; i < l; i++)
		{
			try
			{
				var f = xhrs[i], req = f();
				if (req != null)
				{
					_xhrf = f;
					return req;
				}
			} catch (e)
			{
				continue;
			}
		}
		return function () { };
	};
	$._xhrResp = function (xhr, dataType) {
		dataType = dataType || xhr.getResponseHeader("Content-Type").split(";")[0];
		switch (dataType) {
			case "text/xml":
				return xhr.responseXML;
			case "json":
			case "text/json":
			case "application/json":
			case "text/javascript":
			case "application/javascript":
			case "application/x-javascript":
				return window.JSON ? JSON.parse(xhr.responseText) : eval(xhr.responseText);
			default:
				return xhr.responseText;
		}
	};
	$._formData = function (o) {
		var kvps = [], regEx = /%20/g;
		for (var k in o) kvps.push(encodeURIComponent(k).replace(regEx, "+") + "=" + encodeURIComponent(o[k].toString()).replace(regEx, "+"));
		return kvps.join('&');
	};
	$.ajax = function (o) {
		var xhr = $.xhr(), timer, n = 0;
		o = $.extend({ userAgent: "XMLHttpRequest", lang: "en", type: "GET", data: null, contentType: "application/x-www-form-urlencoded", dataType: "application/json" }, o);
		if (o.timeout) timer = setTimeout(function () { xhr.abort(); if (o.timeoutFn) o.timeoutFn(o.url); }, o.timeout);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4)
			{
				if (timer) clearTimeout(timer);
				if (xhr.status < 300)
				{
					if (o.success) o.success($._xhrResp(xhr, o.dataType));
				}
				else if (o.error) o.error(xhr, xhr.status, xhr.statusText);
				if (o.complete) o.complete(xhr, xhr.statusText);
			}
			else if (o.progress) o.progress(++n);
		};
		var url = o.url, data = null;
		var isPost = o.type == "POST" || o.type == "PUT";
		if (!isPost && o.data) url += "?" + $._formData(o.data);
		xhr.open(o.type, url);

		if (isPost) {
			var isJson = o.dataType.indexOf("json") >= 0;
			data = isJson ? JSON.stringify(o.data) : $._formData(o.data);
			xhr.setRequestHeader("Content-Type", isJson ? "application/json" : "application/x-www-form-urlencoded");
		}
		xhr.send(data);
	};
	$.getJSON = function (url, data, success, error) {
		if ($.isFunction(data))
		{
			error = success;
			success = data;
			data = null;
		}
		$.ajax({ url: url, dataType: "json", data: data, success: success, error: error });
	};
	$.get = function (url, data, success, dataType) {
		if ($.isFunction(data)) {
			dataType = success;
			success = data;
			data = null;
		}
		$.ajax({url: url, type: "GET", data: data, success: success, dataType: dataType || "text/plain"});
	};
	$.post = function (url, data, success, dataType) {
		if ($.isFunction(data)) {
			dataType = success;
			success = data;
			data = null;
		}
		$.ajax({url: url, type: "POST", data: data, success: success, dataType: dataType || "text/plain"});
	};
});
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
$.addPlugin("custom", function($){
    var win=window, doc=document, qsMap = {}, 
        vars = win.location.search.substring(1).split("&");

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
    $._each($.Key.namedKeys, function (val, key) {
        var keyCode = val;
        $.Key.prototype['is' + key] = function () { return this.keyCode === keyCode; };
    });
    $.key = function (e) {
        e = e || window.event;
        return new $.Key(e.keyCode || e.which);
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
    $.templateSettings = {
      evaluate    : /<%([\s\S]+?)%>/g,
      interpolate : /<%=([\s\S]+?)%>/g,
      escape      : /<%-([\s\S]+?)%>/g
    };
    $.template = function(str, data) {
        var c  = _.templateSettings;
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
        var func = new Function('obj', '_', tmpl);
        return data ? func(data, _) : function(data) { return func(data, _) };
    };
});
$.addPlugin("docready", function ($) {
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
