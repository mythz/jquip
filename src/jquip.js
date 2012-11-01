/*jshint sub:true, regexdash:true, laxbreak: true, expr: true*/
window['$'] = window['jquip'] = (function(){
  var win = window,
      queryShimCdn = "http://cdnjs.cloudflare.com/ajax/libs/sizzle/1.4.4/sizzle.min.js",
      queryEngines = function(){ return win["Sizzle"] || win["qwery"]; },
      doc = document, docEl = doc.documentElement,
      scriptFns=[], load=[], sLoaded,
      runtil = /Until$/, rmultiselector = /,/,
      rparentsprev = /^(?:parents|prevUntil|prevAll)/,
      rtagname = /<([\w:]+)/,
      rclass = /[\n\t\r]/g,
      rtagSelector = /^[\w-]+$/,
      ridSelector = /^#[\w-]+$/,
      rclassSelector = /^\.[\w-]+$/,
      rspace = /\s+/,
      rdigit = /\d/,
      rnotwhite = /\S/,
      rReturn = /\r\n/g,
      rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
      rCRLF = /\r?\n/g,
      rselectTextarea = /^(?:select|textarea)/i,
      rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
      strim = String.prototype.trim, trim,
      trimLeft = /^\s+/,
      trimRight = /\s+$/,
      contains, sortOrder,
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
      breaker = {},
      ArrayProto = Array.prototype, ObjProto = Object.prototype,
      hasOwn = ObjProto.hasOwnProperty,
      slice = ArrayProto.slice,
      push = ArrayProto.push,
      indexOf = ArrayProto.indexOf,
      nativeForEach = ArrayProto.forEach,
      nativeFilter = ArrayProto.filter,
      nativeIndexOf = ArrayProto.indexOf,
      expando = 'jq-' + (+new Date()),
      fosterNode = doc.createElement('p');

  if (rnotwhite.test("\xA0")){
    trimLeft = /^[\s\xA0]+/;
    trimRight = /[\s\xA0]+$/;
  }

  /**
   * @constructor
   * @param {Object|Element|string|Array.<string>} sel
   * @param {Object=} ctx
   */
  function J(sel, ctx){
    var ret;
    for(var i = 0, l = ctors.length; i < l; i++)
      if (ctors[i].apply(this, arguments)) return this;

    if (!sel) return this;
    if (isF(sel)){
      if (sLoaded) sel();
      else scriptFns.push(sel);
      return this;
    } else if (isA(sel)) return this['make'](sel);
    if (sel.nodeType || isWin(sel)) return this['make']([sel]);
    if (sel == "body" && !ctx && doc.body) {
      this['context'] = sel['context'];
      this[0] = doc.body;
      this.length = 1;
      this['selector'] = sel;
      return this;
    }
    if (sel['selector'] !== undefined) {
      this['context'] = sel['context'];
      this['selector'] = sel['selector'];
      return this['make'](sel);
    }
    sel = isS(sel) && sel.charAt(0) === "<"
      ? (ret = rsingleTag.exec(sel))
        ? [doc.createElement(ret[1])]
        : htmlFrag(sel).childNodes
      : $$((this['selector'] = sel), ctx);

    this['make'](sel);
    if (isPlainObj(ctx)) this['attr'](ctx);
    return this;
  }

  var ctors=[], plugins={}, jquid=1, _cache={_id:0}, _display = {}, p;
  function $(sel, ctx){
    return new J(sel, ctx);
  }

  p = J.prototype = $.prototype = $['fn'] = {
    constructor: $,
    'selector': "",
    'length': 0,
    dm: function(args, tbl, cb){
      var value = args[0], parent, frag, first, l, i;
      if (value){
        if (this[0]) {
          if (!(frag = value.nodeType === 3 && value)){
            parent = value && value.parentNode;
            frag = parent && parent.nodeType === 11 && parent.childNodes.length === this.length
              ? parent
              : htmlFrag(value);
            first = frag.firstChild;
            if (frag.childNodes.length === 1) frag = first;
            if (!first) return this;
          }
          for (i=0, l=this.length; i<l; i++)
			cb.call(this[i],(i == 0 ? frag : frag.cloneNode(true)));
        }
      }
      return this;
    },
    /**
     * @param {Object} els
     * @param {string=} name
     * @param {string=} selector
     * */
    ps: function(els, name, selector){
      var ret = this.constructor();
      if (isA(els)) push.apply(ret, els);
      else merge(ret, els);
      ret.prevObject = this;
      ret.context = this.context;
      if (name === "find")
        ret.selector = this['selector'] + (this['selector'] ? " " : "") + selector;
      else if (name)
        ret.selector = this['selector'] + "." + name + "(" + selector + ")";
      return ret;
    }
  };

  p['make'] = function(els){
    make(this, els);
    return this;
  };
  p['toArray'] = function() {
    return slice.call(this, 0);
  };
  p['get'] = function(num){
    return isDefined(num)
      ? (num < 0 ? this[this.length + num] : this[num])
      : this['toArray']();
  };
  p['add'] = function(sel, ctx){
    var set = typeof sel == "string"
      ? $(sel, ctx)
      : makeArray(sel && sel.nodeType ? [sel] : sel),
      all = merge(this.get(), set);
    return this.ps(detached(set[0]) || detached(all[0]) ? all : unique(all));
  };
  function detached(el) {
    return !el || !el.parentNode || el.parentNode.nodeType == 11;
  }
  p['each'] = function(fn){
      if (!isF(fn)) return this;
      for(var i = 0, l = this.length; i < l; i++)
        fn.call(this[i], i, this[i]);
      return this;
  };
  p['attr'] = function(name, val){
    var el = this[0];
    return (isS(name) && val === undefined)
          ? attr(el, name)
      : this['each'](function(idx){
        var nt = this.nodeType;
        if (nt !== 3 && nt !== 8 && nt !== 2){
          if (isO(name)) for(var k in name)
            if (val === null)
              this.removeAttribute(name);
            else
              this.setAttribute(k, name[k]);
          else this.setAttribute(name, isF(val) ? val.call(this, idx, this.getAttribute(name)) : val);
      }
    });
  };
  p['removeAttr'] = function(name){
    return this['each'](function(){
      if (this.nodeType == 1) this.removeAttribute(name);
    });
  };
  p['data'] = function(name, setVal){
    return  (setVal === undefined)
            ? data(this[0], name)
            : this['each'](function(){
        data(this, name, setVal);
      });
  };
  p['append'] = function(){
    return this.dm(arguments, true, function(el){
      if (this.nodeType === 1)
        this.appendChild(el);
    });
  };
  p['prepend'] = function(){
    return this.dm(arguments, true, function(el){
      if (this.nodeType === 1)
        this.insertBefore(el, this.firstChild);
    });
  };
  p['before'] = function(){
    if (this[0] && this[0].parentNode) {
      return this.dm(arguments, false, function(el){
        this.parentNode.insertBefore(el, this);
      });
    }
    return this;
  };
  p['after'] = function(){
    if (this[0] && this[0].parentNode){
      return this.dm(arguments, false, function(el){
        this.parentNode.insertBefore(el, this.nextSibling);
      });
    }
    return this;
  };
  p['replaceWith'] = function(val){
    var self = this, isFunc = isF(val);
    return this['each'](function(i) {
        var next = this.nextSibling,
            parent = this.parentNode,
            value = isFunc ? val.call(this, i, this) : val;
        if (parent && parent.nodeType != 11) {
            parent.removeChild(this);
            (next ? $(next).before(value) : $(parent).append(value));
        } else { // detached
            self[i] = $(value).clone()[0];
        }
      });
  };
  p['hide'] = function(){
    return this['each'](function(){
      cache(this, "display", this.style.display);
      this.style.display = "none";
    });
  };
  p['show'] = function(){
    return this['each'](function(){
      this.style.display = cache(this, "display") || display(this.tagName);
    });
  };
  p['toggle'] = function(){
    return this['each'](function(){
      var el = $(this);
      $['Expr']['hidden'](this) ? el.show() : el.hide();
    });
  };
  p['eq'] = function(i){
    return i === -1 ? this.slice(i) : this.slice(i, +i + 1);
  };
  p['first'] = function(){
    return this['eq'](0);
  };
  p['last'] = function(){
    return this['eq'](-1);
  };
  p['slice'] = function(){
    return this.ps(slice.apply(this, arguments),
      "slice", slice.call(arguments).join(","));
  };
  p['map'] = function(cb) {
    return this.ps(map(this, function(el, i) {
      return cb.call(el, i, el);
    }));
  };
  p['find'] = function(sel){
    var self = this, i, l;
    if (!isS(sel)){
      return $(sel).filter(function(){
        for(i = 0, l = self.length; i < l; i++)
          if (contains(self[i], this)) return true;
      });
    }
    var ret = this.ps("", "find", sel), len, n, r;
    for(i=0, l=this.length; i<l; i++){
      len = ret.length;
      merge(ret, $(sel, this[i]));
      if (i === 0){
        for(n = len; n < ret.length; n++)
          for(r = 0; r < len; r++)
            if (ret[r] === ret[n]){
              ret.splice(n--, 1);
              break;
            }
      }
    }
    return ret;
  };
  p['not'] = function(sel){
    return this.ps(winnow(this, sel, false), "not", sel);
  };
  p['filter'] = function(sel){
    return this.ps(winnow(this, sel, true), "filter", sel);
  };
  p['indexOf'] = function(val){
    return _indexOf(this, val);
  };
  p['is'] = function(sel){
    return this.length > 0 && $(this[0]).filter(sel).length > 0;
  };
  p['remove'] = function(){
    for(var i = 0, el; isDefined(el = this[i]); i++) {
      if (el.parentNode) el.parentNode.removeChild(el);
    }
    return this;
  };
  p['closest'] = function(sel, ctx) {
    var ret=[], i, l, cur;
    for (i=0, l=this.length; i<l; i++){
      cur = this[i];
      while (cur){
        if (filter(sel, [cur]).length>0){
          ret.push(cur);
          break;
        }else{
          cur = cur.parentNode;
          if (!cur || !cur.ownerDocument || cur === ctx|| cur.nodeType === 11)
            break;
        }
      }
    }
    ret = ret.length > 1 ? unique(ret) : ret;
    return this.ps(ret, "closest", sel);
  };
  p['val'] = function(setVal){
    if (!isDefined(setVal)) return (this[0] && this[0].value) || "";
    return this['each'](function(){
      this.value = setVal;
    });
  };
  p['html'] = function(setHtml){
    if (!isDefined(setHtml)) return (this[0] && this[0].innerHTML) || "";
    return this['each'](function(){
      this.innerHTML = setHtml;
    });
  };
  p['text'] = function(val){
    var el = this[0], nt;
    return isDefined(val)
      ? this['empty']()['append']((el && el.ownerDocument || doc).createTextNode(val))
      : (el && (nt = el.nodeType)
        ? ((nt === 1 || nt === 9)
          ? (isS(el.textContent) ? el.textContent : el.innerText.replace(rReturn, ''))
          : (nt === 3 || nt === 4) ? el.nodeValue : null)
        : null);
  };
  p['empty'] = function(){
    var i, el;
    for(i = 0; isDefined(el = this[i]); i++)
      while (el.firstChild)
        el.removeChild(el.firstChild);
    return this;
  };
  p['addClass'] = function(val){
    var cls, i, l, el, setClass, c, cl;
    if (isF(val))
      return this['each'](function(j){
        $(this)['addClass'](val.call(this, j, this.className));
      });
    if (val && isS(val)){
      cls = val.split(rspace);
      for(i = 0, l = this.length; i < l; i++){
        el = this[i];
        if (el && el.nodeType === 1){
          if (!el.className && cls.length === 1)
            el.className = val;
          else {
            setClass = " " + el.className + " ";
            for(c = 0, cl = cls.length; c < cl; c++){
              if (!~setClass.indexOf(" " + cls[c] + " "))
                setClass += cls[c] + " ";
            }
            el.className = trim(setClass);
          }
        }
      }
    }
    return this;
  };
  p['removeClass'] = function(val){
    var clss, i, l, el, cls, c, cl;
    if (isF(val)) return this['each'](function(j){
      $(this)['removeClass'](val.call(this, j, this.className));
    });
    if ((val && isS(val)) || val === undefined){
      clss = (val || "").split(rspace);
      for(i = 0, l = this.length; i < l; i++){
        el = this[i];
        if (el.nodeType === 1 && el.className){
          if (val){
            cls = (" " + el.className + " ").replace(rclass, " ");
            for(c = 0, cl = clss.length; c < cl; c++)
              cls = cls.replace(" " + clss[c] + " ", " ");
            el.className = trim(cls);
          }
          else el.className = "";
        }
      }
    }
    return this;
  };
  p['hasClass'] = function(sel){
    return hasClass(this, sel);
  };
  p['fadeIn'] = function(){
    this['each'](function(){
      $(this)['show']();
    });
  };
  p['fadeOut'] = function(){
    this['each'](function(){
      $(this)['hide']();
    });
  };
  p['serializeArray'] = function() {
    return this['map'](function(){
      return this.elements ? makeArray(this.elements) : this;
    }).filter(function(){
      return this.name && !this.disabled &&
        (this.checked || rselectTextarea.test(this.nodeName) || rinput.test(this.type));
    }).map(function(i, el){
      var val = $(this)['val']();
      return val == null || isA(val)
        ? map(val, function(val){
          return { name: el.name, value: val.replace(rCRLF, "\r\n") };
                  })
        : { name: el.name, value: val.replace(rCRLF, "\r\n") };
    }).get();
  };
  p['wrap'] = function(wrapper) {
    return this['each'](function() {
      var wrapperClone = $($(wrapper)[0].cloneNode(false));
      $(this).before(wrapperClone);
      wrapperClone.append($(this));
    });
  };
  p['prop'] = function(name, setVal) {
    if (isDefined(setVal))
      return this.each(function() { this[name] = setVal; });
    return this[0] && this[0][name];
  };
  p['clone'] = function() {
    return $(this.map(function() { return this.cloneNode(true); }));
  };
  p['toggleClass'] = function(className, val) {
    return this['each'](function() {
      var el = $(this);
      (isDefined(val) ? val : !el.hasClass(className))
        ? el.addClass(className) : el.removeClass(className);
    });
  };

  $['Expr'] = {
    'hidden': function(el){
      return ($["css"] && $["css"](el,"display") || el.style.display) === "none";
    },
    'visible': function(el) {
      return !$['Expr']['hidden'](el);
    }
  };

  function winnow(els, sel, keep){
    sel = sel || 0;
    if (isF(sel))
      return grep(els, function(el, i){
        return !!sel.call(el, i, el) === keep;
      });
    else if (sel.nodeType)
      return grep(els, function(el){
        return (el === sel) === keep;
      });
    else if (isS(sel)) {
      var expr = sel.charAt(0) == ":" && $['Expr'][sel.substring(1)];
      return grep(els, function(el) {
        var parentNode = el.parentNode,
            orphan = !parentNode,
            result;
        if (orphan) {
          parentNode = fosterNode;
          parentNode.appendChild(el);
        }
        result = expr
          ? expr(el)
          : el.parentNode && _indexOf($$(sel, el.parentNode), el) >= 0;
        orphan && parentNode.removeChild(el);
        return result;
      });
    }
    return grep(els, function(el) {
      return (_indexOf(sel, el) >= 0) === keep;
    });
  }
  function cache(el, name, val)
  {
    var id = el[expando];
    if (!isDefined(val))
      return id && _cache[id] && (name ? _cache[id][name] : _cache[id]);

    if (!id) id = el[expando] = jquid++;
    return (_cache[id] || (_cache[id]={}))[name] = val;
  }
  function display(tag) {
    if (!_display[tag]) {
      var el = $("<" + tag + ">")['appendTo'](doc.body),
        d = ($['css'] && $['css'](el[0], "display")) || el[0].style.display;
      el.remove();
      _display[tag] = d;
    }
    return _display[tag];
  }
  function make(arr, els){
    arr.length = (els && els.length || 0);
    if (arr.length === 0) return arr;
    for(var i = 0, l = els.length; i < l; i++)
      arr[i] = els[i];
    return arr;
  }
  function hasClass(els, cls){
    cls = " " + cls + " ";
    for(var i = 0, l = els.length; i < l; i++)
      if (eqClass(els[i], cls))
        return true;
    return false;
  } $['hasClass'] = hasClass;
  function eqClass(el, cls){
    return el.nodeType === 1 && (" " + el.className + " ").replace(rclass, " ").indexOf(cls) > -1;
  }
  function walk(fn, ctx, ret){
    ctx = ctx || doc;
    ret = ret || [];
    if (ctx.nodeType == 1)
      if (fn(ctx)) ret.push(ctx);
    var els = ctx.childNodes;
    for(var i = 0, l = els.length; i < l; i++){
      var subEl = els[i];
      if (subEl.nodeType == 1)
        walk(fn, subEl, ret);
    }
    return ret;
  } $['walk'] = walk;

  /**
   * @param {string} html
   * @param {Object=} ctx
   * @param {Object=} qry
   * */
  function $$(sel, ctx, qry){
    if (sel && isS(sel)){
      if (ctx instanceof $) ctx = ctx[0];
      ctx = ctx || doc;
      qry = qry || $['query'];
      var el, rest = sel.substring(1);
      return ridSelector.test(sel) && ctx === doc
        ? ((el = doc.getElementById(rest)) ? [el] : [])
        : makeArray(
          rclassSelector.test(sel) && ctx.getElementsByClassName
            ? ctx.getElementsByClassName(rest)
            : rtagSelector.test(sel)
              ? ctx.getElementsByTagName(sel)
              : qry(sel, ctx));
    }
    return sel.nodeType == 1 || sel.nodeType == 9 ? [sel] : [];
  } $['$$'] = $$;

  $['setQuery'] = function(qry){
    $['query'] = function(sel, ctx){
      return $$(sel, ctx, (qry || function(sel, ctx){ return ctx.querySelectorAll(sel); }));
    };
  };

  var useQuery = queryEngines();
  $['setQuery'](useQuery || function(sel, ctx){
    return (ctx = ctx || doc).querySelectorAll ? makeArray(ctx.querySelectorAll(sel)) : [];
  });

  function loadScript(url, cb, async){
    var h = doc.head || doc.getElementsByTagName('head')[0] || docEl,
      s = doc.createElement('script'), rs;
    if (async) s.async = "async";
      s.onreadystatechange = function () {
        if (!(rs = s.readyState) || rs == "loaded" || rs == "complete"){
          s.onload = s.onreadystatechange = null;
          if (h && s.parentNode)
              h.removeChild(s);
          s = undefined;
          if (cb) cb();
        }
      };
    s.onload = cb;
    s.src = url;
    h.insertBefore(s, h.firstChild);
  } $['loadScript'] = loadScript;

  /** @param {...string} var_args */
  function warn(var_args){ win.console && win.console.warn(arguments); }

  $['each'] = function(o, cb, args){
    var k, i = 0, l = o.length, isObj = l === undefined || isF(o);
    if (args){
      if (isObj) {
        for(k in o)
          if (cb.apply(o[k], args) === false) break;
      } else
        for(; i < l;)
          if (cb.apply(o[i++], args) === false) break;
    } else {
      if (isObj) {
        for(k in o)
          if (cb.call(o[k], k, o[k]) === false) break;
      }
      else
        for(; i < l;)
          if (cb.call(o[i], i, o[i++]) === false) break;
    }
    return o;
  };
  function _each(o, fn, ctx){
    if (o == null) return;
    if (nativeForEach && o.forEach === nativeForEach)
      o.forEach(fn, ctx);
    else if (o.length === +o.length){
      for(var i = 0, l = o.length; i < l; i++)
        if (i in o && fn.call(ctx, o[i], i, o) === breaker) return;
    } else {
      for(var key in o)
        if (hasOwn.call(o, key))
          if (fn.call(ctx, o[key], key, o) === breaker) return;
    }
  } $['_each'] = _each;
  function attr(el, name) {
    if (!el || !el.getAttribute || !name) return; // text nodes or comment nodes don't have attributes
    var ret = el.hasAttribute && el.hasAttribute(name) ? el.getAttribute(name) : el[name];
    return (ret === null ? undefined : ret); // el.getAttribute inconsistently return null for non-defined attributes
  }
  function filter(sel, els) {
    return isDefined(sel) ? $(els).filter(sel) : $(els);
  } $['filter'] = filter;
  function _indexOf(arr, val){
    if (arr == null) return -1;
    var i, l;
    if (nativeIndexOf && arr.indexOf === nativeIndexOf) return arr.indexOf(val);
    for(i = 0, l = arr.length; i < l; i++) if (arr[i] === val) return i;
    return -1;
  } $['_indexOf'] = _indexOf;
  $['_defaults'] = function(obj){
    _each(slice.call(arguments, 1), function(o){
      for(var k in o)
        if (obj[k] == null) obj[k] = o[k];
    });
    return obj;
  };
  function _filter(o, fn, ctx){
    var ret = [];
    if (o == null) return ret;
    if (nativeFilter && o.filter === nativeFilter) return o.filter(fn, ctx);
    _each(o, function(val, i, arr){
      if (fn.call(ctx, val, i, arr)) ret[ret.length] = val;
    });
    return ret;
  } $['_filter'] = _filter;
  $['proxy'] = function(fn, ctx){
    if (typeof ctx == "string"){
      var tmp = fn[ctx];
      ctx = fn;
      fn = tmp;
    }
    if (isF(fn)){
      var args = slice.call(arguments, 2),
        proxy = function(){
          return fn.apply(ctx, args.concat(slice.call(arguments))); };
      proxy.guid = fn.guid = fn.guid || proxy.guid || jquid++;
      return proxy;
    }
  };
  function dir(el, prop, until){
    var matched = [], cur = el[prop];
    while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !$(cur).is(until))){
      if (cur.nodeType === 1) matched.push(cur);
      cur = cur[prop];
    }
    return matched;
  } $['dir'] = dir;
  function nth(cur, res, dir){
    res = res || 1;
    var num = 0;
    for(; cur; cur = cur[dir])
      if (cur.nodeType === 1 && ++num === res) break;
    return cur;
  } $['nth'] = nth;
  function sibling(n, el){
    var r = [];
    for(; n; n = n.nextSibling) if (n.nodeType === 1 && n !== el) r.push(n);
    return r;
  } $['sibling'] = sibling;

  function grep(els, cb, inv){
    var ret = [], retVal;
    inv = !!inv;
    for(var i=0, l=els.length; i<l; i++){
      retVal = !!cb(els[i], i);
      if (inv !== retVal)
        ret.push(els[i]);
    }
    return ret;
  } $['grep'] = grep;
  /**
   * @param {Object} els
   * @param {function} cb
   * @param {Object=} arg
   * */
  function map(els, cb, arg){
    var value, key, ret = [], i = 0, length = els.length,
      isArray = els instanceof $
        || typeof length == "number"
        && ((length > 0 && els[0] && els[length - 1]) || length === 0 || isA(els));
    if (isArray){
      for(; i < length; i++){
        value = cb(els[i], i, arg);
        if (value != null)
          ret[ret.length] = value;
      }
    } else {
      for(key in els){
        value = cb(els[key], key, arg);
        if (value != null)
          ret[ret.length] = value;
      }
    }
    return ret.concat.apply([], ret);
  } $['map'] = map;
  function data(el, name, setVal){
    if (!el) return {};
    var res = cache(el, name, setVal);
    return res || attrs(el)['data-' + name];
  } $['data'] = data;
  function attrs(el){
    var o = {};
    if (el.nodeType == 1)
      for(var i = 0, elAttrs = el.attributes, len = elAttrs.length; i < len; i++)
        o[elAttrs.item(i).nodeName] = elAttrs.item(i).nodeValue;
    return o;
  } $['attrs'] = attrs;
  function eqSI(str1, str2){
    return !str1 || !str2 ? str1 == str2 : str1.toLowerCase() === str2.toLowerCase();
  } $['eqSI'] = eqSI;
 trim = strim
  ? function(text){ return text == null ? "" : strim.call(text); }
  : function(text){ return text == null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, ""); };
  $['trim'] = trim;
  $['indexOf'] = $['inArray'] = function(el, arr){
    if (!arr) return -1;
    if (indexOf) return indexOf.call(arr, el);
    for(var i = 0, length = arr.length; i < length; i++)
      if (arr[i] === el)
        return i;
    return -1;
  };
  _each("Boolean Number String Function Array Date RegExp Object".split(" "), function(name){
    class2type["[object " + name + "]"] = name.toLowerCase();
    return this;
  });

  function typeOf(o){ return o == null ? String(o) : class2type[toString.call(o)] || "object"; } $['type'] = typeOf;
  function isDefined(o){ return o !== void 0; }
  function isS(o){ return typeof o == "string"; }
  function isO(o){ return typeof o == "object"; }
  function isF(o){ return typeof o == "function" || typeOf(o) === "function"; } $['isFunction'] = isF;
  function isA(o){ return typeOf(o) === "array"; } $['isArray'] = Array.isArray || isA;
  function isAL(o){ return !isS(o) && typeof o.length == 'number'; }
  function isWin(o){ return o && typeof o == "object" && "setInterval" in o; } $['isWindow'] = isWin;
  function isNan(obj){ return obj == null || !rdigit.test(obj) || isNaN(obj); } $['isNaN'] = isNan;
  function isPlainObj(o){
    if (!o || typeOf(o) !== "object" || o.nodeType || isWin(o)) return false;
    try{
      if (o.constructor && !hasOwn.call(o, "constructor") && !hasOwn.call(o.constructor.prototype, "isPrototypeOf"))
        return false;
    }catch(e){
      return false;
    }
    var key;
    for(key in o){}
    return key === undefined || hasOwn.call(o, key);
  }
  function merge(a1, a2){
    var i = a1.length, j = 0;
    if (typeof a2.length == "number")
      for(var l = a2.length; j < l; j++)
        a1[i++] = a2[j];
    else
      while (a2[j] !== undefined)
        a1[i++] = a2[j++];
    a1.length = i;
    return a1;
  } $['merge'] = merge;
  function extend(){
    var opt, name, src, copy, copyIsArr, clone, args = arguments,
      dst = args[0] || {}, i = 1, aLen = args.length, deep = false;
    if (typeof dst == "boolean"){ deep = dst; dst = args[1] || {}; i = 2; }
    if (typeof dst != "object" && !isF(dst)) dst = {};
    if (aLen === i){ dst = this; --i; }
    for(; i < aLen; i++){
      if ((opt = args[i]) != null){
        for(name in opt){
          src = dst[name];
          copy = opt[name];
          if (dst === copy) continue;
          if (deep && copy && (isPlainObj(copy) || (copyIsArr = isA(copy)))){
            if (copyIsArr){
              copyIsArr = false;
              clone = src && isA(src) ? src : [];
            } else
              clone = src && isPlainObj(src) ? src : {};
            dst[name] = extend(deep, clone, copy);
          } else if (copy !== undefined)
            dst[name] = copy;
        }
      }
    }
    return dst;
  } $['extend'] = $['fn']['extend'] = extend;
  function makeArray(arr, res){
    var ret = res || [];
    if (arr != null){
      var type = typeOf(arr);
      if (arr.length == null || type == "string" || type == "function" || type === "regexp" || isWin(arr))
        push.call(ret, arr);
      else
        merge(ret, arr);
    }
    return ret;
  } $['makeArray'] = makeArray;
  /**
   * @param {string} html
   * @param {Object=} ctx
   * @param {Object=} frag
   * */
  function htmlFrag(html, ctx, frag){
    ctx = ((ctx || doc) || ctx.ownerDocument || ctx[0] && ctx[0].ownerDocument || doc);
    frag = frag || ctx.createDocumentFragment();
    if (isAL(html))
      return clean(html, ctx, frag) && frag;
    var div = fragDiv(html);
    while (div.firstChild)
      frag.appendChild(div.firstChild);
    return frag;
  } $['htmlFrag'] = htmlFrag;
  /**
   * @param {string} html
   * @param {Object=} ctx
   * */
  function fragDiv(html, ctx){
    var div = (ctx||doc).createElement('div'),
      tag = (rtagname.exec(html) || ["", ""])[1].toLowerCase(),
      wrap = wrapMap[tag] || wrapMap._default,
      depth = wrap[0];
    div.innerHTML = wrap[1] + html + wrap[2];
    while (depth--)
      div = div.lastChild;
    return div;
  }
  function clean(els, ctx, frag){
    var ret=[],i,el;
    for (i=0; (el=els[i])!=null; i++){
      if (isS(el))
        el = fragDiv(el, ctx);
      if (el.nodeType)
        ret.push(el);
      else
        ret = merge(ret, el);
    }
    if (frag)
      for (i=0; i<ret.length; i++)
        if (ret[i].nodeType)
          frag.appendChild(ret[i]);
    return ret;
  }
  var sibChk = function(a, b, ret){
    if (a === b) return ret;
    var cur = a.nextSibling;
    while (cur){
      if (cur === b) return -1;
      cur = cur.nextSibling;
    }
    return 1;
  };
  contains = $['contains'] = docEl.contains
    ? function(a, b){
      return a !== b && (a.contains ? a.contains(b) : true); }
    : function(){ return false; };
  sortOrder = docEl.compareDocumentPosition
    ? (contains = function(a, b){ return !!(a.compareDocumentPosition(b) & 16); }) //assigning contains
      && function(a, b){
      if (a === b){ hasDup = true; return 0; }
      if (!a.compareDocumentPosition || !b.compareDocumentPosition)
        return a.compareDocumentPosition ? -1 : 1;
      return a.compareDocumentPosition(b) & 4 ? -1 : 1;
      }
    : function(a, b){
      if (a === b){ hasDup = true; return 0; }
      else if (a.sourceIndex && b.sourceIndex) return a.sourceIndex - b.sourceIndex;
      var al, bl, ap = [], bp = [], aup = a.parentNode, bup = b.parentNode, cur = aup;
      if (aup === bup) return sibChk(a, b);
      else if (!aup) return -1;
      else if (!bup) return 1;
      while (cur){ ap.unshift(cur); cur = cur.parentNode; }
      cur = bup;
      while (cur){ bp.unshift(cur); cur = cur.parentNode; }
      al = ap.length;
      bl = bp.length;
      for(var i = 0; i < al && i < bl; i++)
        if (ap[i] !== bp[i]) return sibChk(ap[i], bp[i]);
      return i === al ? sibChk(a, bp[i], -1) : sibChk(ap[i], b, 1);
     };
  function unique(els){
    if (sortOrder){
      hasDup = baseHasDup;
      els.sort(sortOrder);
      if (hasDup)
        for(var i = 1; i < els.length; i++)
          if (els[i] === els[i - 1]) els.splice(i--, 1);
    }
    return els;
  } $['unique'] = unique;
  _each({
    'parent': function(el){ var parent = el.parentNode; return parent && parent.nodeType !== 11 ? parent : null; },
    'parents': function(el){ return dir(el, "parentNode"); },
    'parentsUntil': function(el, i, until){ return dir(el, "parentNode", until); },
    'next': function(el){ return nth(el, 2, "nextSibling"); },
    'prev': function(el){ return nth(el, 2, "previousSibling"); },
    'nextAll': function(el){ return dir(el, "nextSibling"); },
    'prevAll': function(el){ return dir(el, "previousSibling"); },
    'nextUntil': function(el, i, until){ return dir(el, "nextSibling", until); },
    'prevUntil': function(el, i, until){ return dir(el, "previousSibling", until); },
    'siblings': function(el){ return sibling(el['parentNode']['firstChild'], el); },
    'children': function(el){ return sibling(el['firstChild']); },
    'contents': function(el){
      return el['nodeName'] === "iframe" ? el['contentDocument'] || el['contentWindow']['document '] : makeArray(el['childNodes']);
    }
  }, function(fn, name){
    $['fn'][name] = function(until, sel){
      var ret = map(this, fn, until), args = slice.call(arguments);
      if (!runtil.test(name)) sel = until;
      if (isS(sel)) ret = makeArray(filter(sel, ret));

      ret = this.length > 1 && !guaranteedUnique[name] ? unique(ret) : ret;
      if ((this.length > 1 || rmultiselector.test(sel)) && rparentsprev.test(name)) ret = ret.reverse();
      return this.ps(ret, name, args.join(","));
    };
  });
  _each({
    'appendTo': "append",
    'prependTo': "prepend",
    'insertBefore': "before",
    'insertAfter': "after"
  }, function(orig, name) {
    $['fn'][name] = function(sel){
      var ret = [], to = $(sel), i, els, l,
        p = this.length === 1 && this[0].parentNode;
      if (p && p.nodeType === 11 && p.childNodes.length === 1 && to.length === 1) {
        to[orig](this[0]);
        return this;
      }else{
        for(i=0, l=to.length; i<l; i++){
          els = (i > 0 ? this.clone(true) : this).get();
          $(to[i])[orig](els);
          ret = ret.concat(els);
        }
        return this.ps(ret, name, to['selector']);
      }
    };
  });

  function boxmodel(){
    if (!doc.body) return null; //in HEAD
    var d = doc.createElement('div');
    doc.body.appendChild(d);
    d.style.width = '20px';
    d.style.padding = '10px';
    var w = d.offsetWidth;
    doc.body.removeChild(d);
    return w == 40;
  }

  (function(){
    var div = document.createElement("div");
    div.style.display = "none";
    div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
    var a = div.getElementsByTagName("a")[0];
    $['support'] = {
      boxModel: null,
      opacity: /^0.55$/.test(a.style.opacity),
      cssFloat: !!a.style.cssFloat
    };

    var rwebkit = /(webkit)[ \/]([\w.]+)/,
      ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
      rmsie = /(msie) ([\w.]+)/,
      rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
      ua = navigator.userAgent.toLowerCase(),
      match = rwebkit.exec(ua)
         || ropera.exec( ua )
         || rmsie.exec( ua )
         || ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) || [],
      b;
    b = $['browser'] = { version: match[2] || "0" };
    b[match[1] || ""] = true;
  })();
  $['scriptsLoaded'] = function(cb) {
    if (isF(cb)) scriptFns.push(cb);
  };
  function loadAsync(url, cb){
    load.push({url:url,cb:cb});
  } $['loadAsync'] = loadAsync;

  if (!useQuery && !doc.querySelectorAll)
    loadAsync(queryShimCdn, function(){
      $['setQuery'](queryEngines());
    });

  function fireSL(){
    _each(scriptFns, function(cb){
      cb();
    });
    sLoaded = true;
  }

  $['init'] = false;
  $['onload'] = function(){
    if (!$['init'])
    try {
      $['support']['boxModel'] = boxmodel();
      var cbs = 0;
      _each(load, function(o){
        cbs++;
        loadScript(o.url, function(){
          try { if (o.cb) o.cb(); } catch(e){}
          if (!--cbs)fireSL();
        });
      });
      $['init'] = true;
      if (!cbs)fireSL();
    } catch(e){
      warn(e);
    }
  };
  if (doc['body'] && !$['init'])
    setTimeout($['onload'],1); //let plugins loadAsync

  $['hook'] = function(fn){
    ctors.push(fn);
  };
  $['plug'] = function(meta, fn){
    var name = isS(meta) ? meta : meta['name'];
    fn = isF(meta) ? meta : fn;
    if (!isF(fn)) throw "Plugin fn required";
    if (name && fn) plugins[name] = fn;
    fn($);
  };

  return $;
})();
