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

      it('returns undefined when no data has been set', function() {
        expect(el.data()).toBeUndefined();
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

      it('prioritizes cached items', function() {
        el.attr('data-foo', 'qux');
        el.data('foo', 'baz');
        expect(el.data('foo')).toBe('baz');
      });

      it('does not add attributes', function() {
        el.data('pow', 'zip');
        expect(el.attr('data-pow')).toBeUndefined();
      });

      it('returns identical values', function() {
        var obj = {a: 1, b: 2};
        el.data('foo', obj);
        expect(el.data('foo')).toBe(obj);
      });
    });

  });
}());
