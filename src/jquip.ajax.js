$['plug']("ajax", function ($) {
	var xhrs = [
           function () { return new XMLHttpRequest(); },
           function () { return new ActiveXObject("Microsoft.XMLHTTP"); },
           function () { return new ActiveXObject("MSXML2.XMLHTTP.3.0"); },
           function () { return new ActiveXObject("MSXML2.XMLHTTP"); }
        ],
        _xhrf = null;
	function _xhr() {
		if (_xhrf != null) return _xhrf();
		for (var i = 0, l = xhrs.length; i < l; i++) {
			try {
				var f = xhrs[i], req = f();
				if (req != null) {
					_xhrf = f;
					return req;
				}
			} catch (e){}
		}
		return function () { };
	} $['xhr'] = _xhr;
	function _xhrResp(xhr, dataType) {
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
				return window.JSON ? window.JSON['parse'](xhr.responseText) : eval(xhr.responseText);
			default:
				return xhr.responseText;
		}
	} $['_xhrResp'] = _xhrResp;
	$['formData'] = function formData(o) {
		var kvps = [], regEx = /%20/g;
		for (var k in o) kvps.push(encodeURIComponent(k).replace(regEx, "+") + "=" + encodeURIComponent(o[k].toString()).replace(regEx, "+"));
		return kvps.join('&');
	};
	$['each']("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function(i,o){
		$['fn'][o] = function(f){
			return this['bind'](o, f);
		};
	});

	function ajax(o) {
		var xhr = _xhr(), timer, n = 0;
		o = $['_defaults'](o, { 'userAgent': "XMLHttpRequest", 'lang': "en", 'type': "GET", 'data': null, 'contentType': "application/x-www-form-urlencoded", 'dataType': "application/json" });
		if (o.timeout) timer = setTimeout(function () { xhr.abort(); if (o.timeoutFn) o.timeoutFn(o.url); }, o.timeout);
		var cbCtx = $(o['context'] || document), evtCtx = cbCtx;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4){
				if (timer) clearTimeout(timer);
				if (xhr.status < 300){
					var res = _xhrResp(xhr, o.dataType);
					if (o['success'])
						o['success'](res);
					evtCtx['trigger']("ajaxSuccess", [xhr, res, o]);
				}
				else {
					if (o.error)
						o.error(xhr, xhr.status, xhr.statusText);
					evtCtx['trigger'](cbCtx, "ajaxError", [xhr, xhr.statusText, o]);
				}
				if (o['complete'])
					o['complete'](xhr, xhr.statusText);
				evtCtx['trigger'](cbCtx, "ajaxComplete", [xhr, o]);
			}
			else if (o['progress']) o['progress'](++n);
		};
		var url = o['url'], data = null;
		var isPost = o['type'] == "POST" || o['type'] == "PUT";
		if (!isPost && o['data']) url += "?" + formData(o['data']);
		xhr.open(o['type'], url);

		if (isPost) {
			var isJson = o['dataType'].indexOf("json") >= 0;
			data = isJson ? JSON.stringify(o['data']) : formData(o['data']);
			xhr.setRequestHeader("Content-Type", isJson ? "application/json" : "application/x-www-form-urlencoded");
		}
		xhr.send(data);
	} $['ajax'] = ajax;
	$['getJSON'] = function (url, data, success, error) {
		if ($['isFunction'](data)){
			error = success;
			success = data;
			data = null;
		}
		ajax({'url': url, 'data': data, 'success': success, 'dataType': 'json'});
	};
	$['get'] = function (url, data, success, dataType) {
		if ($['isFunction'](data)) {
			dataType = success;
			success = data;
			data = null;
		}
		ajax({'url': url, 'type': "GET", 'data': data, 'success': success, 'dataType': dataType || "text/plain"});
	};
	$['post'] = function (url, data, success, dataType) {
		if ($['isFunction'](data)) {
			dataType = success;
			success = data;
			data = null;
		}
		ajax({'url': url, 'type': "POST", 'data': data, 'success': success, 'dataType': dataType || "text/plain"});
	};

	if (!win.JSON)
		$['loadAsync']("http://ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js");

    //TODO $.getScript
});
