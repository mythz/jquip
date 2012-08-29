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

    describe('data() without key', function() {

      it('returns empty object when no data has been set', function() {
        expect(el.data()).toEqual({});
      });

      it('returns object of attributes when data has been set', function() {
        el.data('foo', 'bar');
        expect(el.data()).toEqual({foo: 'bar'});
      });

    });


    describe('data() with key', function() {

      it('returns undefined when key does not exist', function() {
        expect(el.data('notfound')).toBeUndefined();
      });

      it('returns value when key does exists', function() {
        el.data('zing', 'bang');
        expect(el.data('zing')).toBe('bang');
      });

      it('reads from data- attributes', function() {
        el.attr('data-foo', 'qux');
        expect(el.data('foo')).toBe('qux');
      });

      it('reads from data- attributes', function() {
        el.attr('data-foo', 'qux');
        expect(el.data('foo')).toBe('qux');
      });
    });

  });
}());
