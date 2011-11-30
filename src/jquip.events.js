$['plug']("events", function($){
	var doc = document, handlers = {}, _jquid = 1;
	function jquid(el){
		return el._jquid || (el._jquid = _jquid++);
	}
	function bind(o, type, fn){
		if (o.addEventListener)
			o.addEventListener(type, fn, false);
		else {
			o['e' + type + fn] = fn;
			o[type + fn] = function(){
				o['e' + type + fn](window.event);
			};
			o.attachEvent('on' + type, o[type + fn]);
		}
	} $['bind'] = bind;
	function unbind(o, type, fn){
		if (o.removeEventListener)
			o.removeEventListener(type, fn, false);
		else {
			o.detachEvent('on' + type, o[type + fn]);
			o[type + fn] = null;
		}
	} $['unbind'] = unbind;
	function parseEvt(evt){
		var parts = ('' + evt).split('.');
		return {e: parts[0], ns: parts.slice(1).sort().join(' ')};
	}
	function matcherFor(ns){
		return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
	}
	function findHdls(el, evt, fn, sel){
		evt = parseEvt(evt);
		if (evt.ns) var m = matcherFor(evt.ns);
		return $['_filter'](handlers[jquid(el)] || [], function(hdl){
			return hdl
				&& (!evt.e  || hdl.e == evt.e)
				&& (!evt.ns || m.test(hdl.ns))
				&& (!fn     || hdl.fn == fn)
				&& (!sel    || hdl.sel == sel);
		});
	}
	function addEvt(el, evts, fn, sel, delegate){
		var id = jquid(el), set = (handlers[id] || (handlers[id] = []));
		$['_each'](evts.split(/\s/), function(evt){
			var handler = $['extend'](parseEvt(evt), {fn: fn, sel: sel, del: delegate, i: set.length});
			set.push(handler);
			bind(el, handler.e, delegate || fn);
		});
		el = null;
	}
	function remEvt(el, evts, fn, sel){
		var id = jquid(el);
		$['_each']((evts || '').split(/\s/), function(evt){
			$['_each'](findHdls(el, evt, fn, sel), function(hdl){
				delete handlers[id][hdl.i];
				unbind(el, hdl.e, hdl.del || hdl.fn);
			});
		});
	}
	var evtMethods = ['preventDefault', 'stopImmediatePropagation', 'stopPropagation'];
	function createProxy(evt){
		var proxy = $['extend']({originalEvent: evt}, evt);
		$['_each'](evtMethods, function(key){
			proxy[key] = function(){
				return evt[key].apply(evt, arguments);
			};
		});
		return proxy;
	}
	var p = $['fn'];
	$['_each'](("blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error").split(" "),
		function(name){
			p[name] = function(fn, data){
				return arguments.length > 0 ? this['bind'](name, fn, data) : this['trigger'](name);
			};
		}
	);
	p['bind'] = function(type, cb){
		return this['each'](function(){
			addEvt(this, type, cb);
		});
	};
	p['unbind'] = function(type, cb){
		return this['each'](function(){
			 remEvt(this, type, cb);
		});
	};
	p['one'] = function(evt, cb){
		return this['each'](function(){
			var self = this;
			addEvt(this, evt, function wrapper(){
				cb();
				 remEvt(self, evt, arguments.callee);
			});
		});
	};
	p['delegate'] = function(sel, evt, cb){
		return this['each'](function(i, el){
			addEvt(el, evt, cb, sel, function(e){
				var target = e.target, nodes = $['$$'](sel, el);
				while (target && nodes.indexOf(target) < 0)
					target = target.parentNode;
				if (target && !(target === el) && !(target === document)){
					cb.call(target, $['extend'](createProxy(e||window.event), {
						currentTarget: target, liveFired: el
					}));
				}
			});
		});
	};
	p['undelegate'] = function(sel, evt, cb){
		return this['each'](function(){
			 remEvt(this, evt, cb, sel);
		});
	};
	p['live'] = function(evt, cb){
		$(doc.body)['delegate'](this['selector'], evt, cb);
		return this;
	};
	p['die'] = function(evt, cb){
		$(doc.body)['undelegate'](this['selector'], evt, cb);
		return this;
	};
    p['trigger'] = function (evt) {
        return this['each'](function () {
            if ((evt == "click" || evt == "blur" || evt == "focus") && this[evt])
                return this[evt]();
            if (doc.createEvent) {
                var e = doc.createEvent('Events');
                this.dispatchEvent(e, e.initEvent(evt, true, true));
            } else if (this.fireEvent)
                try {
                    if (evt !== "ready") {
                        this.fireEvent("on" + evt);
                    }
                } catch (e) { }
        });
    };
	if (!$['init']) $(window)['bind']("load",$['onload']);
});