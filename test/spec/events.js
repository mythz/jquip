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

    describe('bind and unbind', function() {

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
    });

    describe('delegate and undelegate', function() {

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

    describe('on and off', function() {
      it('subscribes to events', function() {
        var spy = jasmine.createSpy('cb');
        el.on('zing', spy);
        el.trigger('zing');

        expect(spy).toHaveBeenCalled();
      });

      it('unsubscribes from events', function() {
        var spy = jasmine.createSpy('cb');
        el.on('zing', spy);
        el.off('zing', spy);
        el.trigger('zing');

        expect(spy).not.toHaveBeenCalled();
      });

      it('unsubscribes all callbacks', function() {
        var spy = jasmine.createSpy('cb'),
            spy2 = jasmine.createSpy('cb2');

        el.on('click', spy);
        el.on('click', spy2);

        el.off('click');
        el.click();

        expect(spy).not.toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
      });

      it('subscribes to events of nested elements', function() {
        var spy = jasmine.createSpy('cb'),
            inner = $('<span>').appendTo(el);

        el.on('span', 'click', spy);
        inner.click();

        expect(spy).toHaveBeenCalled();
      });

      it('unsubscribes from events of nested elements', function() {
        var spy = jasmine.createSpy('cb'),
            inner = $('<span>').appendTo(el);

        el.on('span', 'click', spy);
        el.off('span', 'click', spy);
        inner.click();

        expect(spy).not.toHaveBeenCalled();
      });

      it('unsubscribes all callbacks of nested elements', function() {
        var spy = jasmine.createSpy('cb'),
            spy2 = jasmine.createSpy('cb2'),
            inner = $('<span>').appendTo(el);

        el.on('span', 'click', spy);
        el.on('span', 'click', spy2);

        el.off('span', 'click');
        inner.click();

        expect(spy).not.toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
      });
    });



  });

}(jquip));
