(function($){
  // test targets
  var emptyContainer, spanTheWorld, twoTargets, listWith3Items;

  // Appendable test elements
  var iWillBeIn  = " i will be in ",
    theWorld   = "the world",
    spanStar   = $('<span>*</span>'),
    fourthItem = $('<li>4</li>'),
    fiveAndSix = $('<li>5</li><li>6</li>');

  // restore the containers before each tests
  function initTargets() {
    emptyContainer = $('<div/>');
    spanTheWorld   = $('<span>' + theWorld + '</span>');
    twoTargets     = $('<div id="containers"><div class="target"></div><div class="target"></div></div>');
    listWith3Items = $('<ul><li>1</li><li>2</li><li>3</li></ul>');
  }

  beforeEach(initTargets);

  // $.append test suite
  describe('jquip.append', function() {

    describe(' with unique targets ', function() {

      it('Appends text to an empty container', function() {
        var result = emptyContainer.append(iWillBeIn);
        expect(result.text()).toEqual(iWillBeIn);
      });

      it('Appends text to a text container', function() {
        var result = spanTheWorld.append(iWillBeIn);
        expect(result.text()).toEqual(theWorld + iWillBeIn);
      });

      it('Appends a simple element to an empty container', function() {
        var result = emptyContainer.append(spanStar);
        expect(result[0].childElementCount).toEqual(1);
        expect(result.html()).toEqual("<span>*</span>");
      });

      it('Appends a simple element to a text container', function() {
        var result = spanTheWorld.append(spanStar);
        expect(result[0].childElementCount).toEqual(1);
        expect(result.html()).toEqual(theWorld + "<span>*</span>");
      });

      it('Appends a simple element to the end of a container with existing items', function() {
        var result = listWith3Items.append(fourthItem);
        expect(result[0].childElementCount).toEqual(4);
        expect(result.html()).toEqual("<li>1</li><li>2</li><li>3</li><li>4</li>");
      });

      it('Appends multiple elements to the end of a container with existing items', function() {
        var result = listWith3Items.append(fourthItem).append(fiveAndSix);
        expect(result[0].childElementCount).toEqual(6);
        expect(result.html()).toEqual("<li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li>");
      });

    });

    describe(' with multiple targets ', function() {

      it('Appends text to multiple containers', function() {
        var targets = twoTargets.children(".target").append(iWillBeIn);
        expect(targets.length).toEqual(2);
        targets.each(function() {
          expect($(this).text()).toEqual(iWillBeIn);
        });
      });

      it('Appends a simple element to multiple containers', function() {
        twoTargets.children(".target").append(spanStar);
        expect(twoTargets.find("span").length).toEqual(2);
        twoTargets.find("span").each(function() {
          expect($(this).text()).toEqual("*");
        });
      });

    });
  });

  // $.prepend test suite
  describe('jquip.prepend', function() {

    describe(' with unique targets ', function() {

      it('Appends text to an empty container', function() {
        var result = emptyContainer.prepend(iWillBeIn);
        expect(result.text()).toEqual(iWillBeIn);
      });

      it('Appends text to a text container', function() {
        var result = spanTheWorld.prepend(iWillBeIn);
        expect(result.text()).toEqual(iWillBeIn + theWorld);
      });

      it('Appends a simple element to an empty container', function() {
        var result = emptyContainer.prepend(spanStar);
        expect(result[0].childElementCount).toEqual(1);
        expect(result.html()).toEqual("<span>*</span>");
      });

      it('Appends a simple element to a text container', function() {
        var result = spanTheWorld.prepend(spanStar);
        expect(result[0].childElementCount).toEqual(1);
        expect(result.html()).toEqual("<span>*</span>" + theWorld);
      });

      it('Appends a simple element to the end of a container with existing items', function() {
        var result = listWith3Items.prepend(fourthItem);
        expect(result[0].childElementCount).toEqual(4);
        expect(result.html()).toEqual("<li>4</li><li>1</li><li>2</li><li>3</li>");
      });

      it('Appends multiple elements to the end of a container with existing items', function() {
        var result = listWith3Items.prepend(fourthItem).prepend(fiveAndSix);
        expect(result[0].childElementCount).toEqual(6);
        expect(result.html()).toEqual("<li>5</li><li>6</li><li>4</li><li>1</li><li>2</li><li>3</li>");
      });
    });

    describe(' with multiple targets ', function() {

      it('Appends text to multiple containers', function() {
        var targets = twoTargets.children(".target").prepend(iWillBeIn);
        expect(targets.length).toEqual(2);
        targets.each(function() {
          expect($(this).text()).toEqual(iWillBeIn);
        });
      });

      it('Appends a simple element to multiple containers', function() {
        twoTargets.children(".target").prepend(spanStar);
        expect(twoTargets.find("span").length).toEqual(2);
        twoTargets.find("span").each(function() {
          expect($(this).text()).toEqual("*");
        });
      });

    });
  });

}(jquip));
