(function(){
  describe('jquip.toggleClass', function() {
    var el;
    beforeEach(function() {
      el = jquip('<div class="foo bar">');
    });

    it('removes class if exists', function() {
      el.toggleClass('foo');
      expect(el.hasClass('foo')).toBe(false);
    });

    it('adds class if not present', function() {
      el.toggleClass('qux');
      expect(el.hasClass('qux')).toBe(true);
    });

    it('removes if switch is false', function() {
      el.toggleClass('bar', false);
      expect(el.hasClass('bar')).toBe(false);
      el.toggleClass('bar', false);
      expect(el.hasClass('bar')).toBe(false);
    });

    it('adds if switch is true', function() {
      el.toggleClass('bar', true);
      expect(el.hasClass('bar')).toBe(true);

      el.toggleClass('zing', true);
      expect(el.hasClass('zing')).toBe(true);
    });
  });
}());
