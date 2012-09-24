(function($){
  var template = [
  '<div class="outer">',
  '<i id="i1" class="a">i1</i>',
  '<i id="i2" class="b">i2</i>',
  '<i id="i3" class="a">i3</i>',
  '<i id="i4" class="b">i4</i>',
  '<i id="i5" class="a c">i5</i>',
  '<form id="f1" class="a">',
  '  <i id="i6" class="a b c d e">i6</i>',
  '  <i id="i7" class="b">i7</i>',
  '  <input name="a" value="a" id="in1" class="c" />',
  '  <input name="a" value="b" id="in2" class="c" />',
  '  <div id="d1" class="n" data-attr="meta">',
  '    <i id="i8" class="d">i8</i>',
  '    <i id="i9" class="d">i9</i>',
  '  </div>',
  '</form>',
  '<input name="a" value="b" id="in3" class="d" />',
  '<input name="b" value="b" id="in4" class="d" />',
  '<input value="b" id="in5" class="d" />',
  '<input name="ball" value="b" id="in6" class="e" />',
  '<i id="i10" class="b c d e f g">i10</i>',
  '<textarea id="t1"></textarea>',
  '<div id="append"></div>',
  '</div>'
  ].join(''),
  ids = function(els) {
    return Array.prototype.slice.call(els.map(function() {
      return this.id;
    })).join(',');
  };
  describe('jquip.query', function() {
    var el;
    beforeEach(function() {
      el = $(template).appendTo('body');
    });

    afterEach(function() {
      el.remove();
    });

    it('is empty when not found', function() {
      var res = $('#doesnotexist');

      expect(ids(res)).toBe('');
    });

    it('finds elements by id', function() {
      var res = $('#i1');

      expect(ids(res)).toBe('i1');
    });

    it('finds elements by class', function() {
      var res = $('.a');
      expect(ids(res)).toBe('i1,i3,i5,f1,i6');
    });

    it('finds elements with two classes', function() {
      var res = $('.a.c');
      expect(ids(res)).toBe('i5,i6');
    });

    it('finds elements by tag name', function() {
      var res = $('form');
      expect(ids(res)).toBe('f1');
    });

    it('finds elements by tag name and id', function() {
      var res = $('form#f1');
      expect(ids(res)).toBe('f1');
    });

    it('finds elements by tag name and class', function() {
      var res = $('input.d');
      expect(ids(res)).toBe('in3,in4,in5');
    });

    it('finds elements by id and class', function() {
      var res = $('#in4.d');
      expect(ids(res)).toBe('in4');
    });

    it('finds elements by id and class', function() {
      var res = $('#in4.d');
      expect(ids(res)).toBe('in4');
    });

    it('finds elements by attribute existence', function() {
      var res = $('input[name]');
      expect(ids(res)).toBe('in1,in2,in3,in4,in6');
    });

    it('finds elements by attribute value', function() {
      var res = $('input[name=a]');
      expect(ids(res)).toBe('in1,in2,in3');

      res2 = $('input[name="a"]');
      expect(ids(res2)).toBe('in1,in2,in3');
    });

    it('finds elements by attribute value prefix', function() {
      var res = $('input[name^=b]');
      expect(ids(res)).toBe('in4,in6');
    });

    it('finds nested elements', function() {
      var res = $('form i');
      expect(ids(res)).toBe('i6,i7,i8,i9');
    });

    it('finds direct sibling elements', function() {
      var res = $('form > i');
      expect(ids(res)).toBe('i6,i7');
    });

    it('finds on multi-root document', function() {
      spyOn(console, 'warn');
      var res = $('<p>foo</p> <p><i class="yo">bar</i></p>').find('.yo')
      expect(res.length).toBe(1);
      expect(res[0].innerHTML).toBe('bar');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('filters selections', function() {
      var res = $('.c').filter('input');
      expect(ids(res)).toBe('in1,in2');
    });

    it('filters nodes not appended to dom', function() {
      var res = $('<input>').filter('input');
      expect(res.length).toBe(1);
    });

    it('finds nodes not attached to dom', function() {
      var res = $('<p><i class="a" id="foo"></i></p>').find('.a');
      expect(ids(res)).toBe('foo');
    });

    it('finds nodes not attached to dom by id', function() {
      var res = $('<p><i id="foo"></i></p>').find('#foo');
      expect(ids(res)).toBe('foo');
    });

    describe('children', function() {
      var template = [
      '<div class="outer">',
      '  <div id="d1"></div>',
      '  <div id="d2" class="b"></div>',
      '  <div id="d3"></div>',
      '</div>'
      ].join(''), el;

      beforeEach(function() { el = $(template).appendTo('body'); });
      afterEach(function() { el.remove(); });

      it('selects children by tag name', function() {
        var res = el.children('div')
        expect(ids(res)).toBe('d1,d2,d3');
      });

      it('selects children by class name', function() {
        var res = el.children('.b')
        expect(ids(res)).toBe('d2');
      });

      it('selects children by tag and class name', function() {
        var res = el.children('div.b')
        expect(ids(res)).toBe('d2');
      });
    });

  });
}(jquip));
