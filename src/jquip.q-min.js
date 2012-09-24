$['plug'](function($){
  var doc = document,
    $id = function(id, ctx){ return (ctx || doc).getElementById(id); },
    $tag = function(tag, ctx){ return (ctx || doc).getElementsByTagName(tag); },
    $cls = doc.getElementsByClassName //&& false
      ? function(cls, ctx){
        return (ctx || doc).getElementsByClassName(cls); }
      : function(cls, ctx){
        var ret = $['walk'](function(el){
          return el.className && el.className.indexOf(cls) >= 0;
        }, (ctx || doc));
        return $['unique'](ret);
        };

  function childSel(sel, ctx){
    var el = $['$$'](ctx)[0], cls = sel.split('.'), tag = cls.shift(), fPos = tag.indexOf('['), fName, fValue, parts,
      firstChar = tag.charAt(0);
    if (firstChar == "#") return $id(tag.substring(1), el);
    if (fPos >= 0){
      parts = tag.substring(fPos + 1, tag.length - 1).split('=');
      fName = parts[0];
      fValue = parts.length == 2 && parts[1];
      if (fValue && fValue.charAt(0) == "'")
        fValue = fValue.substring(1, fValue.length - 1);
      tag = tag.substring(0, fPos);
    }
    var tagWithId = tag.split('#');
    if (tagWithId.length == 2){
      el = $id(tagWithId[1], el);
      if (!el) return [];
      if (!$['eqSI'](el.tagName, tagWithId[0])) return [];
      if (cls.length == 1) return [el];
    }
    var els = tag ? $tag(tag, el) : $cls(cls.shift(), el);
    if (!cls.length && !fName) return els;
    var ret = [];
    for(var i = 0, l = els.length; i < l; i++){
      var subEl = els[i], j = cls.length, matches = true;
      if (cls.length) while (j--) if (!$['hasClass']([subEl], cls[j])) matches = false;
      if (matches && (!fName || (!fValue || subEl[fName] == fValue)))
        ret.push(subEl);
    }
    return ret;
  }

  $['setQuery'](function(selector, ctx){
    if (doc.querySelectorAll)
      return (ctx || doc).querySelectorAll(selector);

    var els, resSet = [
      [(ctx || doc)]
    ], heir = selector.split(' '), ret = [];
    for(var i = 0, l = heir.length; i < l; i++){
      var parentSet = resSet[i];
      if (parentSet.length == 0) return ret;
      var sel = heir[i], res = [];

      for(var j = 0, jlen = parentSet.length; j < jlen; j++){
        els = childSel(sel, parentSet[j]);
        for(var k = 0, klen = els.length; k < klen; k++)
          res.push(els[k]);
      }
      resSet.push(res);

    }
    return resSet.length > 1 ? resSet.pop() : [];
  });
});
