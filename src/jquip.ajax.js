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
    dataType = (dataType || xhr.getResponseHeader("Content-Type").split(";")[0]).toLowerCase();
    if (dataType.indexOf("json") >= 0){
      var j = false;
      if(window.JSON){
        j = window.JSON['parse'](xhr.responseText);
      }else{
        j = eval(xhr.responseText);
      }
      return j;
    }
    if (dataType.indexOf("script") >= 0)
      return eval(xhr.responseText);
    if (dataType.indexOf("xml") >= 0)
      return xhr.responseXML;
    return xhr.responseText;
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

  function ajax(url, o) {
      var xhr = _xhr(), timer, n = 0;
      if (typeof url === "object") o = url;
      else o['url'] = url;
      o = $['_defaults'](o, { 'userAgent': "XMLHttpRequest", 'lang': "en", 'type': "GET", 'data': null, 'contentType': "application/x-www-form-urlencoded", 'dataType': null, 'processData': true, 'headers': {"X-Requested-With": "XMLHttpRequest" }});
      if (o.timeout) timer = setTimeout(function () { xhr.abort(); if (o.timeoutFn) o.timeoutFn(o.url); }, o.timeout);
      var cbCtx = $(o['context'] || document), evtCtx = cbCtx;
      xhr.onreadystatechange = function() {
          if (xhr.readyState == 4){
              if (timer) clearTimeout(timer);
              if (xhr.status < 300){
                  var res, decode = true, dt = o.dataType || "";
                  try{
                      res = _xhrResp(xhr, dt, o);
                  }catch(e){
                      decode = false;
                      if (o.error)
                      o.error(xhr, xhr.status, xhr.statusText);
                  evtCtx['trigger'](cbCtx, "ajaxError", [xhr, xhr.statusText, o]);
                  }
                  if (o['success'] && decode && (dt.indexOf('json')>=0 || !!res))
                      o['success'](res);
                  evtCtx['trigger'](cbCtx,"ajaxSuccess", [xhr, res, o]);

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
      if( o['data'] && o['processData'] && typeof o['data'] == 'object' )
          data = $['formData'](o['data']);

      if (!isPost && data) {
          url += "?" + data;
          data = null;
      }
      xhr.open(o['type'], url);

      try {
          for (var i in o.headers)
              xhr.setRequestHeader(i, o.headers[i]);
      } catch(_) { console.log(_) }

      if (isPost) {
          if(o['contentType'].indexOf('json')>=0)
              data = o['data'];
          xhr.setRequestHeader("Content-Type", o['contentType']);
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

  $['getScript'] = function (url, success) {
    return $['get'](url, undefined, success, "script");
  };

  if (!window.JSON)
    $['loadAsync']("http://ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js");
});
