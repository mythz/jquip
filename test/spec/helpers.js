(function($){
  describe('jquip.helpers', function() {
    describe('jquip.trim', function() {
      it('trims on the left', function() {
        expect($.trim('  whoa')).toBe('whoa');
      });

      it('trims on the right', function() {
        expect($.trim('dude   ')).toBe('dude');
      });

      it('trims both sides', function() {
        expect($.trim('  spaced   ')).toBe('spaced');
      });

      it('trims non-strings', function() {
        expect($.trim(42)).toBe('42');
      });

      it('returns empty string on undefined', function() {
        expect($.trim(undefined)).toBe('');
      });
    });
  });
}(jquip));
