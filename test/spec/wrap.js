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
      expect(list.html()).toBe('<li><b>1</b></li><li><b>2</b></li>');

      list.remove();
    });
  });
}());
