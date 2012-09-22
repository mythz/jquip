(function($){
  describe('jquip.fragments', function() {
    it('creates a single node', function() {
      var node = $('<a>');
      expect(node.length).toBe(1);
      expect(node[0].nodeName).toBe('A');
    });

    it('creates multiple nodes', function() {
      var frag = $('<a></a><b></b>');
      expect(frag.length).toBe(2);
    });

    it('creates node with an attribute hash', function() {
      var node = $('<a>', { href: 'http://example.com/' });
      expect(node.length).toBe(1);
      expect(node[0].href).toEqual('http://example.com/');
    });

  });
}(jquip));
