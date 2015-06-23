(function($){
  describe('jquip.base', function() {

    describe('jquip.each', function() {
      it('iterates over dom', function() {
        var $el = $('<div name="life"></div><div name="is"></div><div name="absurd"></div>')
          , concat = "";
        $el.each(function(){
          concat += this.getAttribute('name');
        });
        expect(concat).toEqual("lifeisabsurd");
      });

      it('iterates over dom and stops halfway', function() {
        var $el = $('<div name="life"></div><div name="is"></div><div name="absurd"></div>')
          , concat = "";
        $el.each(function(){
          concat += this.getAttribute('name');
          return false;
        });
        expect(concat).toEqual("life");
      });
    });
  });

}(jquip));
