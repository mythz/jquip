(function() {
  'use strict';
  describe('jquip.data', function() {
    var el;
    beforeEach(function() {
      el = jquip('<div>').appendTo('body');
    });

    afterEach(function() {
      el.remove();
    });

    it('returns undefined when key does not exist', function() {
      expect(el.data('notfound')).toBeUndefined();
    });
  });
}());
