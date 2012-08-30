(function($) {
  'use strict';

  describe('jquip.events', function() {
    var el;
    beforeEach(function() { el = $('<div>').appendTo('body'); });
    afterEach(function() { el.remove(); } );

    it('fires callbacks when events are triggered', function() {
      var spy = jasmine.createSpy('cb');
      el.click(spy);
      el.click();
      expect(spy).toHaveBeenCalled();
    });

    it('can subscribe to and trigger arbitrary events', function() {
      var spy = jasmine.createSpy('cb');
      el.bind('foobar', spy);
      el.trigger('foobar');
      expect(spy).toHaveBeenCalled();
    });

    it('fires multiple callbacks', function() {
      var spy = jasmine.createSpy('cb');
      var spy2 = jasmine.createSpy('cb2');

      el.bind('x', spy);
      el.bind('x', spy2);
      el.trigger('x');

      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it('does not fire callbacks when unbound', function() {
      var spy = jasmine.createSpy('cb');
      el.bind('foobar', spy);
      el.unbind('foobar', spy);
      el.trigger('foobar');
      expect(spy).not.toHaveBeenCalled();
    });

    it('subscribes to events from nested elements', function() {
      var spy = jasmine.createSpy('cb'),
          inner = $('<span>').appendTo(el);

      el.delegate('span', 'click', spy);
      inner.click();

      expect(spy).toHaveBeenCalled();
    });

    it('subscribes to events from future nested elements', function() {
      var spy = jasmine.createSpy('cb'),
          inner;

      el.delegate('span', 'click', spy);
      inner = $('<span>').appendTo(el); //added after bind
      inner.click();

      expect(spy).toHaveBeenCalled();
    });

  });

}(jquip));
