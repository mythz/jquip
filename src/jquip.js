var $ = (function ()
{
	var doc = document, docEl = doc.documentElement, $id = function (id) { return doc.getElementById(id); },
        $tag = function (tag) { return doc.getElementsByTagName(tag); },
        notImplemented = "Not Implemented";

	var runtil = /Until$/, rmultiselector = /,/,
        slice = Array.prototype.slice, push = Array.prototype.push, indexOf = Array.prototype.indexOf,
        rparentsprev = /^(?:parents|prevUntil|prevAll)/,
        rclass = /[\n\t\r]/g,
        rspace = /\s+/,
        rdigit = /\d/,
        rnotwhite = /\S/,
        trim = String.prototype.trim,
        trimLeft = /^\s+/,
        trimRight = /\s+$/,
        guaranteedUnique = { children: true, contents: true, next: true, prev: true },
        toString = Object.prototype.toString,
        class2type = {},
        hasDuplicate = false, baseHasDuplicate = true;

	if (rnotwhite.test("\xA0"))
	{
		trimLeft = /^[\s\xA0]+/;
		trimRight = /[\s\xA0]+$/;
	}
	function $el(sel)
	{
		if (typeof sel == 'string')
			return sel.charAt(0) == '#' ? $id(sel.substring(1)) : $tag(sel)[0];
		return sel;
	}
	function $find(rootEl, tagSel)
	{
		var parts = tagSel.split('.'), tag = parts[0], cls = parts.length == 2 && parts[1];
		var el = $el(rootEl);
		var fPos = tag.indexOf('['), fName, fValue;
		if (fPos != -1)
		{
			parts = tag.substring(fPos + 1, tag.length - 1).split('=');
			fName = parts[0], fValue = parts.length == 2 && parts[1];
			if (fValue && fValue.charAt(0) == "'")
				fValue = fValue.substring(1, fValue.length - 1);
			tag = tag.substring(0, fPos);
		}
		var els = el.getElementsByTagName(tag);
		if (!cls && !fName) return els;
		var ret = [];
		for (var i = 0, l = els.length; i < l; i++)
		{
			var childEl = els[i];
			if ((!cls || (childEl.className && childEl.className.indexOf(cls) != -1))
                    && (!fName || childEl[fName] == fValue))
			{
				ret.push(childEl);
			}
		}
		return ret;
	}

	function $(selector, ctx)
	{
		return new $.fn.init(selector, ctx);
	}
	$.constructors = [];
	$.plugins = {};

	$.fn = $.prototype = {
		constructor: $,
		init: function (selector, ctx)
		{
			for (var i = 0, l = $.constructors.length; i < l; i++)
				if ($.constructors[i].apply(this, arguments)) return this;

			if (!selector) return this;
			if (typeof selector == "function")
			{
				console.warn("handling $(onDocumentReadyFn) not registerd. ignoring...");
				return this;
			} else if ($.isArray(selector)) return this.make(selector);
			if (selector.nodeType || $.isWindow(selector)) return this.make([selector]);
			if (doc.querySelectorAll) return this.make((ctx || doc).querySelectorAll(selector));

			var els, resSet = [[(ctx || doc)]], args = selector.split(' ');
			for (var i = 0, l = args.length; i < l; i++)
			{
				var parentSet = resSet[i];
				if (parentSet.length == 0) return this.make([]); //short-circuit
				var sel = args[i], res = [];
				if (sel.charAt(0) === '#')
				{
					resSet.push([(ctx || doc).getElementById(sel.substring(1))]);
					continue;
				}
				for (var j = 0, jlen = parentSet.length; j < jlen; j++)
				{
					els = $find(parentSet[j], sel);
					for (var k = 0, klen = els.length; k < klen; k++)
						res.push(els[k]);
				}
				resSet.push(res);
			}
			return resSet.length > 1 ? this.make(resSet.pop()) : this.make([]);
		},
		make: function (els)
		{
			this.length = (els && els.length || 0);
			if (this.length == 0) return this;
			for (var i = 0, l = els.length; i < l; i++)
				this[i] = els[i];
			return this;
		},
		each: function (fn)
		{
			if (typeof fn != "function") return this;
			for (var i = 0, l = this.length; i < l; i++)
				fn.call(this[i], i, this[i]);
			return this;
		},
		attr: function (name)
		{
			return this[0] && $.attrs(this[0])[name];
		},
		bind: function (type, data, fn)
		{
			return this.each(function () { $.bind(this, type, fn, data); });
		},
		unbind: function (type, fn)
		{
			return this.each(function () { $.unbind(this, type, fn); });
		},
		data: function (name, setVal)
		{
			return $.data(this[0], name, setVal);
		},
		append: function ()
		{
			return this.domManip(arguments, true, function (el)
			{
				if (this.nodeType === 1)
					this.appendChild(el);
			});
		},
		prepend: function ()
		{
			return this.domManip(arguments, true, function (el)
			{
				if (this.nodeType === 1)
					this.insertBefore(el, this.firstChild);
			});
		},
		before: function ()
		{
			this.domManip(arguments, false, function (el)
			{
				this.parentNode.insertBefore(el, this);
			});
			return this;
		},
		after: function ()
		{
			if (this[0] && this[0].parentNode)
			{
				return this.domManip(arguments, false, function (el)
				{
					this.parentNode.insertBefore(el, this.nextSibling);
				});
			}
			return this;
		},
		domManip: function (args, table, cb)
		{
			var value = args[0];
			if (typeof value != "string") throw "Not supported: " + value;
			return this.each(function ()
			{
				var frag = $.fromHtml(value);
				cb.call(this, frag);
			});
		},
		hide: function ()
		{
			this.each(function () { this.style.display = "none"; });
		},
		show: function ()
		{
			this.each(function () { this.style.display = "block"; });
		},
		toggle: function ()
		{
			this.each(function () { this.style.display = this.style.display === "none" ? "block" : "none"; });
		},
		pushStack: function (els, name, selector)
		{
			var ret = this.constructor();
			if ($.isArray(els)) push.apply(ret, els);
			else $.merge(ret, els);
			ret.prevObject = this;
			ret.context = this.context;
			if (name === "find")
				ret.selector = this.selector + (this.selector ? " " : "") + selector;
			else if (name)
				ret.selector = this.selector + "." + name + "(" + selector + ")";
			return ret;
		},
		eq: function (i) { return i === -1 ? this.slice(i) : this.slice(i, +i + 1); },
		first: function () { return this.eq(0); },
		last: function () { return this.eq(-1); },
		slice: function ()
		{
			return this.pushStack(slice.apply(this, arguments),
		        "slice", slice.call(arguments).join(","));
		},
		find: function (sel)
		{
			var self = this, i, l;
			if (typeof sel !== "string")
			{
				return $(sel).filter(function ()
				{
					for (i = 0, l = self.length; i < l; i++)
						if ($.contains(self[i], this)) return true;
				});
			}
			var ret = this.pushStack("", "find", sel), len, n, r;
			for (i = 0, l = this.length; i < l; i++)
			{
				len = ret.len;
				$.merge(ret, $(sel, this[i]));
				if (i == 0)
				{
					for (n = len; n < ret.length; n++)
						for (r = 0; r < len; r++)
							if (ret[r] === ret[n]) { ret.splice(n--, 1); break; }
				}
			}
			return ret;
		},
		remove: function ()
		{
			for (var i = 0, el; (el = this[i]) != null; i++) if (el.parentNode) el.parentNode.removeChild(el);
			return this;
		},
		val: function (setVal)
		{
			if (setVal == null) return (this[0] && this[0].value) || "";
			return this.each(function () { this.value = setVal; });
		},
		html: function (setHtml)
		{
			if (setHtml == null) return (this[0] && this[0].innerHTML) || "";
			return this.each(function () { this.innerHTML = setHtml; });
		},
		addClass: function (value)
		{
			var cls, i, l, el, setClass, c, cl;
			if ($.isFunction(value))
				return this.each(function (j)
				{
					$(this).addClass(value.call(this, j, this.className));
				});
			if (value && typeof value === "string")
			{
				cls = value.split(rspace);
				for (i = 0, l = this.length; i < l; i++)
				{
					el = this[i];
					if (el.nodeType === 1)
					{
						if (!el.className && cls.length === 1)
							el.className = value;
						else
						{
							setClass = " " + el.className + " ";
							for (c = 0, cl = cls.length; c < cl; c++)
							{
								if (! ~setClass.indexOf(" " + cls[c] + " "))
									setClass += cls[c] + " ";
							}
							el.className = $.trim(setClass);
						}
					}
				}
			}
			return this;
		},
		removeClass: function (value)
		{
			var clss, i, l, el, cls, c, cl;
			if ($.isFunction(value))
				return this.each(function (j)
				{
					$(this).removeClass(value.call(this, j, this.className));
				});

			if ((value && typeof value === "string") || value === undefined)
			{
				clss = (value || "").split(rspace);
				for (i = 0, l = this.length; i < l; i++)
				{
					el = this[i];
					if (el.nodeType === 1 && el.className)
					{
						if (value)
						{
							cls = (" " + el.className + " ").replace(rclass, " ");
							for (c = 0, cl = clss.length; c < cl; c++)
							{
								cls = cls.replace(" " + clss[c] + " ", " ");
							}
							el.className = $.trim(cls);
						}
						else el.className = "";
					}
				}
			}
			return this;
		},
		hasClass: function (sel)
		{
			var cls = " " + sel + " ";
			for (var i = 0, l = this.length; i < l; i++)
				if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(cls) > -1)
					return true;
			return false;
		},
		fadeIn: function ()
		{
			this.each(function ()
			{
				$(this).show();
			});
		},
		fadeOut: function ()
		{
			this.each(function ()
			{
				$(this).hide();
			});
		}
	};
	$.fn.init.prototype = $.fn;

	var breaker = {};
	var ArrayProto = Array.prototype, ObjProto = Object.prototype;
	var hasOwnProperty = ObjProto.hasOwnProperty,
        nativeForEach = ArrayProto.forEach,
        nativeMap = ArrayProto.map,
        nativeFilter = ArrayProto.filter;

	$.each = function (o, cb, args)
	{
		var k, i = 0, l = o.length, isObj = l === undefined || $.isFunction(o);
		if (args)
		{
			if (isObj)
				for (k in o)
					if (cb.apply(o[k], args) === false) break;
					else
						for (; i < l; )
							if (cb.apply(o[i++], args) === false) break;
		} else
		{
			if (isObj)
				for (k in o)
					if (cb.call(o[k], k, o[k]) === false) break;
					else
						for (; i < l; )
							if (cb.call(o[i], i, o[i++]) === false) break;
		}
		return o;
	};

	var _ = _ || {}; //use underscore if exists
	if (!_.each) _.each = function (o, fn, ctx)
	{
		if (o == null) return;
		if (nativeForEach && o.forEach === nativeForEach)
			o.forEach(fn, ctx);
		else if (o.length === +o.length)
		{
			for (var i = 0, l = o.length; i < l; i++)
				if (i in o && fn.call(ctx, o[i], i, o) === breaker) return;
		} else
		{
			for (var key in o)
				if (hasOwnProperty.call(o, key))
					if (fn.call(ctx, o[key], key, o) === breaker) return;
		}
	};
	$._each = _.each;
	if (!_.select) _.select = function (o, fn, ctx)
	{
		var results = [];
		if (o == null) return results;
		if (nativeFilter && o.filter === nativeFilter) return o.filter(fn, ctx);
		$._each(o, function (value, index, list)
		{
			if (fn.call(ctx, value, index, list)) results[results.length] = value;
		});
		return results;
	};
	$._select = _.select;
	$.filter = function (expr, els, not)
	{
		var ret = [], isTagOnly = (expr.indexOf(' ') === -1);
		if (isTagOnly)
		{
			$._each(els, function (el)
			{
				if (el.tagName == expr) ret.push(el);
			});
			return ret;
		}
		throw notImplemented;
	};
	$.dir = function (el, dir, until)
	{
		var matched = [], cur = el[dir];
		while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !$(cur).is(until)))
		{
			if (cur.nodeType === 1) matched.push(cur);
			cur = cur[dir];
		}
		return matched;
	};
	$.nth = function (cur, result, dir, el)
	{
		result = result || 1;
		var num = 0;
		for (; cur; cur = cur[dir])
			if (cur.nodeType === 1 && ++num === result) break;
		return cur;
	};
	$.sibling = function (n, el)
	{
		var r = [];
		for (; n; n = n.nextSibling) if (n.nodeType === 1 && n !== el) r.push(n);
		return r;
	};
	$.map = function (o, fn, ctx)
	{
		var results = [];
		if (o == null) return results;
		if (nativeMap && o.map === nativeMap) return o.map(fn, ctx);
		$._each(o, function (value, index, list)
		{
			results.push(fn.call(ctx, value, index, list));
		});
		return results;
	};
	$.bind = function (o, type, fn, data)
	{
		if (o.attachEvent)
		{
			o['e' + type + fn] = fn;
			o[type + fn] = function () { o['e' + type + fn](window.event); };
			o.attachEvent('on' + type, o[type + fn]);
		} else
			o.addEventListener(type, fn, false);
	};
	$.unbind = function (o, type, fn)
	{
		if (o.detachEvent)
		{
			o.detachEvent('on' + type, o[type + fn]);
			o[type + fn] = null;
		} else
			o.removeEventListener(type, fn, false);
	};
	$.data = function (el, name, setVal)
	{
		if (!el) return {};
		if (name && setVal)
		{
			el.setAttribute(name, setVal);
			return null;
		}
		var o = {};
		$._each($.attrs(el), function (val, aName)
		{
			if (aName.indexOf("data-") !== 0 || !val) return;
			o[aName.substr("data-".length)] = val;
		});
		if (typeof name == "string") return o[name];
		return o;
	};
	$.attrs = function (el)
	{
		var o = {};
		for (var i = 0, attrs = el.attributes, len = attrs.length; i < len; i++)
			o[attrs.item(i).nodeName] = attrs.item(i).nodeValue;
		return o;
	};
	$.trim = trim
        ? function (text) { return text == null ? "" : trim.call(text); }
        : function (text) { return text == null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, ""); };
	$.indexOf = function (el, arr)
	{
		if (!arr) return -1;
		if (indexOf) return indexOf.call(arr, el);

		for (var i = 0, length = arr.length; i < length; i++)
			if (arr[i] === el)
				return i;
		return -1;
	};
	$.fn.trigger = function (name)
	{
		var $this = this;
		return this.each(function (i)
		{
			var fn = this[name];
			if ($.isFunction(fn))
				fn.call(this);
			return $this;
		});
	};
	$._each("Boolean Number String Function Array Date RegExp Object".split(" "), function (name, i)
	{
		class2type["[object " + name + "]"] = name.toLowerCase();
		return this;
	});
	$.type = function (o) { return o == null ? String(o) : class2type[toString.call(o)] || "object"; };
	$.isFunction = function (o) { return typeof o === "function" || $.type(o) === "function"; };
	$.isArray = Array.isArray || function (o) { return $.type(o) === "array"; };
	$.isWindow = function (o) { return o && typeof o === "object" && "setInterval" in o; };
	$.isNaN = function (obj) { return obj == null || !rdigit.test(obj) || isNaN(obj); };
	$.merge = function (a1, a2)
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
	};
	$.extend = function (o)
	{
		$._each(slice.call(arguments, 1), function (a)
		{
			for (var p in a) if (a[p] !== void 0) o[p] = a[p];
		});
		return o;
	};
	$.makeArray = function (arr, results)
	{
		var ret = results || [];
		if (arr != null)
		{
			var type = $.type(arr);
			if (arr.length == null || type === "string" || type === "function" || type === "regexp" || $.isWindow(arr))
			{
				push.call(ret, arr);
			} else
			{
				$.merge(ret, arr);
			}
		}
		return ret;
	};
    $.fromHtml = function (html) {
        var frag = doc.createDocumentFragment(), div = doc.createElement('div');
        div.innerHTML = html;
        while (div.firstChild) frag.appendChild(div.firstChild);
        return frag;
    };
	var sibChk = function (a, b, ret)
	{
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
        ? function (a, b)
        {
        	if (a === b)
        	{
        		hasDuplicate = true;
        		return 0;
        	}
        	if (!a.compareDocumentPosition || !b.compareDocumentPosition)
        		return a.compareDocumentPosition ? -1 : 1;
        	return a.compareDocumentPosition(b) & 4 ? -1 : 1;
        }
        : function (a, b)
        {
        	if (a === b) { hasDuplicate = true; return 0; }
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
	$.unique = function (results)
	{
		if (sortOrder)
		{
			hasDuplicate = baseHasDuplicate;
			results.sort(sortOrder);
			if (hasDuplicate)
				for (var i = 1; i < results.length; i++)
					if (results[i] === results[i - 1]) results.splice(i--, 1);
		}
		return results;
	};

	$._each(("blur focus focusin focusout load resize scroll unload click dblclick " +
            "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
            "change select submit keydown keypress keyup error").split(" "),
        function (name, i)
        {
        	$.fn[name] = function (data, fn)
        	{
        		if (fn == null)
        		{
        			fn = data;
        			data = null;
        		}
        		return arguments.length > 0 ? this.bind(name, data, fn) : this.trigger(name);
        	};
        }
    );
	$._each({
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
		contents: function (el)
		{
			return $.nodeName(el, "iframe") ? el.contentDocument || el.contentWindow.document : $.makeArray(el.childNodes);
		}
	}, function (fn, name)
	{
		$.fn[name] = function (until, sel)
		{
			var ret = $.map(this, fn, until), args = slice.call(arguments);
			if (!runtil.test(name)) sel = until;
			if (sel && typeof sel === "string") ret = $.filter(sel, ret);
			ret = this.length > 1 && !guaranteedUnique[name] ? $.unique(ret) : ret;
			if ((this.length > 1 || rmultiselector.test(sel)) && rparentsprev.test(name)) ret = ret.reverse();
			return this.pushStack(ret, name, args.join(","));
		};
	});

	function boxmodel()
	{
		if (!doc.body)
		{
			$(window).bind("load", function ()
			{
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
	(function ()
	{
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

	function getWindow(el)
	{
		return $.isWindow(el) ? el : el.nodeType === 9 ? el.defaultView || el.parentWindow : false;
	}
	$._each(["Left", "Top"], function (name, i)
	{
		var method = "scroll" + name;
		$.fn[method] = function (val)
		{
			var el, win;
			if (val === undefined)
			{
				el = this[0];
				if (!el) return null;
				win = getWindow(el);
				return win ? ("pageXOffset" in win)
                    ? win[i ? "pageYOffset" : "pageXOffset"]
                    : $.support.boxModel && win.document.documentElement[method] || win.document.body[method] : el[method];
			}
			return this.each(function ()
			{
				win = getWindow(this);
				if (win)
					win.scrollTo(!i ? val : $(win).scrollLeft(), i ? val : $(win).scrollTop());
				else
					this[method] = val;
			});
		};
	});

	$.addConstructor = function (fn) { $.constructors.push(fn); };
	$.addPlugin = function (meta, fn)
	{
		var name = typeof meta == "string" ? meta : meta['name'];
		fn = typeof meta == "function" ? meta : fn;
		if (typeof fn != "function") throw "Plugin function required";
		if (name && fn) $.plugins[name] = fn;
		fn($);
	};

	return $;
})();
