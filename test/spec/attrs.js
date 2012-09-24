(function(){
  describe('jquip.attrs and jquip.prop', function() {
    var el;
    beforeEach(function() {
      el = jquip('<div id="joe" data-age="35">');
    });

    it('returns the attributes as object', function() {
      expect(jquip.attrs(el[0])).toEqual({'data-age': '35', 'id': 'joe'});
    });

    it('returns an empty object if it is the document element', function() {
      expect(jquip.attrs(document)).toEqual({});
    });

    it('reads property of inner element', function() {
      var checkbox = jquip('<input type="checkbox" />');
      checkbox.attr('checked', '');

      expect(checkbox.prop('checked')).toBe(true);
    });

    it('sets property of all selected elements', function() {
      var root = jquip('<div><i>a</i><i>b</i><i>c</i></div>'),
          els = root.find('i').prop('foo', 'x');

      expect(els[0].foo).toBe('x');
      expect(els[1].foo).toBe('x');
      expect(els[2].foo).toBe('x');
    });


  });
}());
