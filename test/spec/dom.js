(function($){
  // test targets
  var emptyContainer, spanTheWorld, twoTargets, listWith3Items;

  // Appendable test elements
  var iWillBeIn  = "i will be in ",
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

  // $.html test suite
  describe('jquip.html', function() {

    describe('with unique targets', function() {

      it('Appends text to an empty container', function() {
        var result = emptyContainer.html(iWillBeIn);
        expect(result.text()).toEqual(iWillBeIn);
      });

      it('Replaces content by another jquip element', function() {
        emptyContainer.html(spanTheWorld);
        $("span", emptyContainer).html($(spanStar));
        expect(emptyContainer.text()).toEqual("*");
      });

      it('Replaces content by another dom element', function() {
        var domElement = document.createElement('P');
        domElement.innerHTML = "the moon";
        emptyContainer.html(spanTheWorld);
        $("span", emptyContainer).html(domElement);
        expect(emptyContainer.text()).toEqual("the moon");
      });

    });
  });

  // $.append test suite
  describe('jquip.append', function() {

    describe('with unique targets', function() {

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
        expect(result.children().length).toEqual(1);
        expect(result.text()).toEqual("*");
      });

      it('Appends a simple element to a text container', function() {
        var result = spanTheWorld.append(spanStar);
        expect(result.children().length).toEqual(1);
        expect(result.html().toLowerCase()).toEqual(theWorld + "<span>*</span>");
      });

      it('Appends a simple element to the end of a container with existing items', function() {
        var result = listWith3Items.append(fourthItem);
        expect(result.children().length).toEqual(4);
        expect(result.text()).toEqual("1234");
      });

      it('Appends multiple elements to the end of a container with existing items', function() {
        var result = listWith3Items.append(fourthItem).append(fiveAndSix);
        expect(result.children().length).toEqual(6);
        expect(result.text()).toEqual("123456");
      });

    });

    describe('with multiple targets', function() {

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

    describe('with unique targets', function() {

      it('Prepends text to an empty container', function() {
        var result = emptyContainer.prepend(iWillBeIn);
        expect(result.text()).toEqual(iWillBeIn);
      });

      it('Prepends text to a text container', function() {
        var result = spanTheWorld.prepend(iWillBeIn);
        expect(result.text()).toEqual(iWillBeIn + theWorld);
      });

      it('Prepends a simple element to an empty container', function() {
        var result = emptyContainer.prepend(spanStar);
        expect(result.children().length).toEqual(1);
        expect(result.html().toLowerCase()).toEqual("<span>*</span>");
      });

      it('Prepends a simple element to a text container', function() {
        var result = spanTheWorld.prepend(spanStar);
        expect(result.children().length).toEqual(1);
        expect(result.html().toLowerCase()).toEqual("<span>*</span>" + theWorld);
      });

      it('Prepends a simple element to the end of a container with existing items', function() {
        var result = listWith3Items.prepend(fourthItem);
        expect(result.children().length).toEqual(4);
        expect(result.text()).toEqual("4123");
      });

      it('Prepends multiple elements to the end of a container with existing items', function() {
        var result = listWith3Items.prepend(fourthItem).prepend(fiveAndSix);
        expect(result.children().length).toEqual(6);
        expect(result.text()).toEqual("564123");
      });
    });

    describe(' with multiple targets ', function() {

      it('Prepends text to multiple containers', function() {
        var targets = twoTargets.children(".target").prepend(iWillBeIn);
        expect(targets.length).toEqual(2);
        targets.each(function() {
          expect($(this).text()).toEqual(iWillBeIn);
        });
      });

      it('Prepends a simple element to multiple containers', function() {
        twoTargets.children(".target").prepend(spanStar);
        expect(twoTargets.find("span").length).toEqual(2);
        twoTargets.find("span").each(function() {
          expect($(this).text()).toEqual("*");
        });
      });

    });
  });

  // $.replaceWith test suite
  describe('jquip.replaceWith', function() {

    it('Replaces an element by another one', function() {
      emptyContainer.append(spanTheWorld);
      $("span", emptyContainer).replaceWith(spanStar);
      expect(emptyContainer.text()).toEqual("*");
    });

    it('Can replace target elements by some text', function() {
      $(".target", twoTargets).replaceWith("replaced");
      expect(twoTargets.text()).toEqual("replacedreplaced");
    });

    it('Elements already presents are removed from their original location', function() {
      $(listWith3Items.children().first()).replaceWith(listWith3Items.children().last());
      expect(listWith3Items.text()).toEqual("32");
    });

    it('Can be used with a function do dynamically generate content', function() {
      $("li", listWith3Items).replaceWith(function(i, elt){
          return $("<li>").text(Number($(this).text()) + 1);
      });
      expect(listWith3Items.text()).toEqual("234");
    });

    it('Works with top level disconnected content', function() {
      var result = listWith3Items.replaceWith(function(i, elt){
          return $("<ol>").append($(elt).children());
      });
      expect(result[0].tagName).toEqual("OL");
    });

    it('Replaces a parent with one of its children', function() {
      var result = listWith3Items.replaceWith(listWith3Items.children().first());
      expect(result[0].tagName).toEqual("LI");
      expect(result.text()).toEqual("1");
    });

  });

}(jquip));
