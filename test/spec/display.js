(function() {
  'use strict';
  describe('jquip.show and jquip.hide', function() {
    var el;
    beforeEach(function() {
      el = jquip('<div>').appendTo('body');
    });

    afterEach(function() {
      el.remove();
    });

    it('sets display none on hiding', function() {
      el.hide();
      expect(el.css('display')).toBe('none');
    });

    it('sets display back to block on show', function() {
      el.hide();
      el.show();
      expect(el.css('display')).toBe('block');
    });

    it('sets display back to previous value if set', function() {
      el.css('display', 'inline-block');
      el.hide();
      el.show();
      expect(el.css('display')).toBe('inline-block');
    });
  });
}());
