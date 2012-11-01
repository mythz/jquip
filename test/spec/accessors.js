(function($){
  describe('jquip.accessors', function() {

    describe('jquip.attrs', function() {
      it('returns the attributes as object', function() {
        var el = $('<div id="joe" data-age="35">');
        expect($.attrs(el[0])).toEqual({'data-age': '35', 'id': 'joe'});
      });

      it('returns an empty object if it is the document element', function() {
        expect($.attrs(document)).toEqual({});
      });
    });

    describe('jquip.attr', function() {

      it('reads attributes', function() {
        var bound, clss,
            frag = $('<h1 class="big">title</h1>\n\n<h2 data-bind="article.subtitle">subtitle</h2>');
        frag.each(function(i, elt){ // note : we will iterate over text nodes that don't have attributes in this loop
          var $elt = $(elt);
          if ($elt.attr("class")) {
             clss = $elt.attr("class");
          }
          if ($elt.attr("data-bind")) {
             bound = $elt.attr("data-bind");
          }
        });
        expect(clss).toEqual("big");
        expect(bound).toEqual("article.subtitle");
      });

      it('returns empty attributes as empty strings', function() {
        var $h1 = $('<h1 title="">title</h1>');
        expect($h1.attr("title")).toBeDefined();
        expect($h1.attr("title")).toBe("");
        var $div = $('<div data-bind="">title</div>');
        expect($div.attr("data-bind")).toBeDefined();
        expect($div.attr("data-bind")).toBe("");
      });

      it('returns undefined attributes as undefined', function() {
        var $h1 = $('<h1>title</h1>');
        expect($h1.attr("type")).toBeUndefined();
      });

      it('returns undefined on an empty set', function() {
        var $frag = $('<h1>title</h1><h2>title</h2>'),
            attr  = $frag.filter(false).attr("whatever");
        expect(attr).toBeUndefined();
      });

      it('writes attributes', function() {
        var $header = $("<hgroup><h1>title</h1>\n\n<h2>subtitle</h2></hgroup>");
        $header.children().each(function(i, elt){
          var $elt = $(elt);
          if (elt.tagName == "H1") {
            $elt.attr("class", "big");
          } else if (elt.tagName == "H2") {
            $elt.attr("class", "medium");
          }
        });
        expect($("h1.big",$header).length).toEqual(1);
        expect($("h2.medium",$header).length).toEqual(1);
      });

    });

    describe('.removeAttr()', function() {
      it('remove attributes', function() {
        var frag = $('<h1 class="big">title</h1>\n\n<h2 data-bind="article.subtitle">subtitle</h2>');
        frag.each(function(i, elt){
          $(elt).removeAttr("class data-bind");
        });
        expect($("h1.big",frag).length).toEqual(0);
        expect($("h2[data-bind]",frag).length).toEqual(0);
      });
    });

    describe('.prop()', function() {
      it('reads property of inner element', function() {
        var checkbox = $('<input type="checkbox" />');
        checkbox.attr('checked', '');

        expect(checkbox.prop('checked')).toBe(true);
      });

      it('sets property of all selected elements', function() {
        var root = $('<div><i>a</i><i>b</i><i>c</i></div>'),
            els = root.find('i').prop('foo', 'x');

        expect(els[0].foo).toBe('x');
        expect(els[1].foo).toBe('x');
        expect(els[2].foo).toBe('x');
      });
    });

    describe('.val()', function() {
      it('gets value of inputs', function() {
        var el = $('<input value="foo" />');
        expect(el.val()).toBe('foo');
      });

      it('sets value of inputs', function() {
        var el = $('<input value="foo" />');
        el.val('bar');
        expect(el.val()).toBe('bar');
      });
    });

    describe('.html()', function() {
      it('gets html of element', function() {
        var el = $('<div><i>Hello</i></div>');
        expect(el.html()).toMatch(/<i>Hello<\/i>/i);
      });

      it('sets html of element', function() {
        var el = $('<div><i>Hello</i></div>');
        el.html('<b>zing</b>');
        expect(el.html()).toMatch(/<b>zing<\/b>/i);
      });
    });

    describe('text', function() {
      it('gets text of element', function() {
        var el = $('<div><i>Hello</i></div>');
        expect(el.text()).toBe('Hello');
      });

      it('sets text of element', function() {
        var el = $('<div><i>Hello</i></div>');
        el.text('zing');
        expect(el.text()).toBe('zing');
      });

      it('gets text of text element', function() {
        var el = $(document.createTextNode('truck'));
        expect(el.text()).toBe('truck');
      });
    });

    it('empties elements', function() {
      var el = $('<div><i>Hello</i></div>');
      el.empty();
      expect(el.html()).toBe('');
    });
  });
}(jquip));
