(function(){
  describe('jquip.wrap', function() {
    var el;
    beforeEach(function() {
      outer = jquip('<div><p class="wrap">wrap me</p></div>').appendTo('body');
      el = outer.find('.wrap');
    });

    afterEach(function() {
      outer.remove();
    });

    it('should wrap node', function() {
      el.wrap('<span>')
      expect(el.parent()[0].nodeName).toEqual('SPAN');
    });

    it('should wrap detached node', function() {
      var detached = $('<div>');
      detached.wrap('<span>');
      expect(detached.parent()[0].nodeName).toEqual('SPAN');
    });

    it('should wrap text node', function() {
      var text = el.contents();
      expect(text.wrap("<span>")[0]).toBe(text[0]);
      expect(el.find('span').text()).toEqual('wrap me');
    });

    it('should wrap detached text node', function() {
      var text = el.contents();
      text.remove();
      expect(el.text()).toBe('');

      text.wrap("<span>");
      expect(text.parent().text()).toEqual('wrap me');
    });

    it('wraps multiple nodes', function() {
      var list = $('<ul><li>1</li><li>2</li></ul>').appendTo('body');
      list.find('li').contents().wrap('<b>');
      expect(list.find('b').length).toBe(2);

      list.remove();
    });
  });
  describe('jquip.clone', function() {

    it('creates a copy', function() {
      var els = jquip('<div><i>1</i><i>2</i></div>').find('i');
      var clones = els.clone();
      clones.html('x')

      expect(els[0].innerHTML).toBe('1')
      expect(els[1].innerHTML).toBe('2')

      expect(clones[0].innerHTML).toBe('x')
      expect(clones[1].innerHTML).toBe('x')
    });
  });
}());
