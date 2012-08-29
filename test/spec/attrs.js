(function(){
  describe('jquip.attrs', function() {
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
  });
}());
