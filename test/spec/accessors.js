(function($){
  describe('jquip.accessors', function() {
    it('returns the attributes as object', function() {
      var el = $('<div id="joe" data-age="35">');
      expect($.attrs(el[0])).toEqual({'data-age': '35', 'id': 'joe'});
    });

    it('returns an empty object if it is the document element', function() {
      expect($.attrs(document)).toEqual({});
    });

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

    it('gets value of inputs', function() {
      var el = $('<input value="foo" />');
      expect(el.val()).toBe('foo');
    });

    it('sets value of inputs', function() {
      var el = $('<input value="foo" />');
      el.val('bar');
      expect(el.val()).toBe('bar');
    });

    it('gets html of element', function() {
      var el = $('<div><i>Hello</i></div>');
      expect(el.html()).toBe('<i>Hello</i>');
    });

    it('sets html of element', function() {
      var el = $('<div><i>Hello</i></div>');
      el.html('<b>zing</b>');
      expect(el.html()).toBe('<b>zing</b>');
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
