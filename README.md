jQuery getting too big? 

The primary goal of this project would be for the feedback/demand to kickstart jquery.com into re-organizing its code-base so it's more modular since we believe we've proved the most useful parts of jQuery is a fraction of its code-base. 

To this end, follow this project if you want jquery.com to measure the demand for this. Another project with 
similar goals is http://ender.no.de/ - for node.js. 

[Zepto.js](http://zeptojs.com/) is another great alternative to jQuery, it's fast, light and optimized for mobile/webkit browsers.
It's a popular option for PhoneGap developers with full support for the 
[Backbone.js](http://documentcloud.github.com/backbone/), [Underscore.js](http://documentcloud.github.com/underscore/) and [Spine.js](http://spinejs.com) frameworks.

Based on recent posts it does looks like jQuery wants to [build a slimmer jQuery](http://blog.jquery.com/2011/11/08/building-a-slimmer-jquery/). Although we don't thing giving a trim is going far enough, we hope they perform larger re-structural changes allowing us to use most of the useful parts at a fraction of their cost. Their [recent conversations into future file size reduction](https://groups.google.com/forum/#!topic/jquery-bugs-team/17rGK6eAAxI/discussion) do sound promising. 

# Introducing jquip - aka jQuery-in-parts.

Smaller, Lighter, Faster, more modular jQuery - include only the parts you want! Don't use it, Don't include it.

Minified & gzipped code sizes (v.02):
  
  - jquip.js (5.7k)
  - jquip.events.js (1k)
  - jquip.docready.js (.5k)
  - jquip.css.js (1.6k)
  - jquip.ajax.js (.9k)

### Query Engine options (not required for modern browsers)

  - jquip.q-min.js (.6k) - An extremely fast but limited query engine (see below)
  - jquip.q-qwery.js (2.6k) - A New fast replacement for Sizzle.js
  - jquip.q-sizzle.js (5.29k) - Sizzle.js

The core **jquip.js** is only **5.7KB** (minified and gzipped) - a fraction of the size of jQuery.

Has 90% of the good parts of jQuery (rest to be added plugins as needed), small enough to drop-in as source saving an external js reference. 

### Automatically downloads parts needed for older browsers
Sizzle.js is only added on demand from [cdnjs.com](http://cdnjs.com) for browers that need it (i.e. <=IE7) which we believe this is the optimal way to download shims for browsers that need it. We still have some testing to do, but that is at least our goal.

Most code has been ported from jQuery or Zepto.js and optimized where possible, e.g. internals use underscore's native `_.each` over jquery's slower `$.each` etc.

Licence: http://www.opensource.org/licenses/mit-license.php (Same as jQuery and Zepto.js)

### Build customizable jquip packages with the [jQuip Library Builder service](http://www.servicestack.net/jqbuilder/)

#### Disclaimer

This is **NOT** an official [jQuery.com](http://jquery.com/) project.

Code-base will now be more stable as we've reached our goal of jquip.js (with the **events** + **docready** plugins) working in Backbone.js, there are likely a few fixes still to be added but the core is close to feature complete and wont require the major refactoring done recently.

We sould still like to hear feedback on issues/non-implemented core functionality so we can measure the API popularity of missing pieces.

## News

### v.02

  - We now are able to compile in Closure Compiler's advanced compilation mode! 
  The minified output passes Backbone.js test suite and reports only 1 not implemented feature in Spine.js tests. We still have Closure Compiler warnings as a result of un-annotated methods which we'll look at adding in the near future.
  - The total code-size (min+gzip) for jquip and non-query plugins (i.e. docready,events,css,ajax,custom) is **9.67k** in advanced mode and **9.86k** in Simple mode.


### v.01

  - Abstracted Events, pluggable query engines and new `$().find` and `Events` system courtesy of the much leaner implementation in [Zepto.js](http://zeptojs.com/), refactored to support multiple browsers.  
  - We are now passing Backbone.js latest test-suite in all the latest browsers!
    - (we'll get to older IE browsers as soon as we find a PC with them installed :)

### pre-alpha, first release

  - Customizable Library builder service at 
  - Node js build scripts added to minify jquip with UglifyJS.
  
## Roadmap

  - Getting jquip to work in Google Closure Compiler's advanced compilation mode without warnings so it can be used to programatically strip out dead code your application doesn't use for an even smaller footprint!
  - Add caching to improve performance

## Changes
  
#### v.01 
  
  - New Spine.js tests added as well, now passing all but 1 test (in latest browsers)
  - New tests added and bug fixes. Backbone.js latest test suite now passes in all the latest browsers - now included in the **/test** folder.
  - New Event system added as a plugin, now with abstracted events. 
    - We expect most devs would want to include events, but can now be stripped if you dont.
  - Query engines are now pluggable and none are included by default but will auto detect window.Sizzle or window.qwery if available and automatically download Sizzle.js from [cdnjs.com](http://cdnjs.com) if a browser doesn't support `document.querySelectorAll` (i.e. <=IE7). Note: because there's no Sizzle.js it's important to be aware of limitations when relying on browsers native querySelector implementations, i.e. there are [restrictions in IE8](http://www.javascriptkit.com/dhtmltutors/css_selectors_api.shtml) where the HTML page must be in standards mode and Safari in quirks mode [can't handle uppercase or unicode characters](http://www.wordsbyf.at/2011/11/23/selectors-selectoring/).

#### pre-alpha

  - $.addConstructor is now `$.hook`
  - $.addPlugin is now `$.plug`
  - **scrollLeft** and **scrollTop** is now in the **css** plugin
  - Due to a request by the jQuery team we're no longer assigning the **jQuery** variable, you will now need to manually change this yourself on the first line of jquip.js:    
    `window.jquip = window.$ = (function()..` 


## What's in the box? - i.e. the 90% good parts

Methods marked with * are only partially implemented.

  - [$(selector)](http://api.jquery.com/jQuery/) 
	- $(selector, context), $(element), $(array)
	- $(callback) requires **docready** plugin.

### Methods operating on a `$(selctor)`
  
  - add
  - each
  - attr
  - removeAttr
  - get
  - toArray
  - data
  - append
  - prepend
  - before
  - after
  - toggle*
  - hide, show, fadeIn and fadeOut - does so without animation, consider using [jquery.animate-enhanced plugin](http://playground.benbarnett.net/jquery-animate-enhanced/)*
  - eq
  - first
  - last
  - slice
  - find
  - not
  - filter
  - indexOf
  - is
  - remove
  - val - does not do checkbox, select, etc.
  - html
  - text
  - empty
  - addClass
  - removeClass
  - hasClass
  - parent
  - parents
  - parentsUntil
  - next
  - prev
  - nextAll
  - nextUntil
  - prevUntil
  - siblings
  - children
  - contents
  - serializeArray

### static methods off $
  
  - $$ - querySelectorAll or query engine shim
  - $.each 
  - [$._each](http://documentcloud.github.com/underscore/#each) - Underscore's native each
  - [$._indexOf](http://documentcloud.github.com/underscore/#indexOf) - Underscore's indexOf
  - [$._defaults](http://documentcloud.github.com/underscore/#defaults) - Underscore's defaults
  - [$._filter](http://documentcloud.github.com/underscore/#filter) - Underscore's filter
  - $.filter
  - $.dir
  - $.nth
  - $.sibling
  - $.grep
  - $.map
  - $.data
  - $.attrs
  - $.trim
  - $.isFunction
  - $.isArray
  - $.isWindow
  - $.isNaN
  - $.merge
  - $.extend
  - $.makeArray
  - $.hasClass
  - $.typeOf - safe type of an variable
  - $.loadScript - (url, callback [, async]) load an external script dynamically
  - $.htmlFrag - creates a document fragment from a html string **(name changed)**
  - $.walk - traveres all childElems including self `(predicateFn, [[, context], results])`
  - $.query - Sizzle(or mock) || doc.querySelector || limitedQueryAll*
  - $.attrs - an elements attributes
  - $.unique - return a unique list of elements in document order
  - $.contains - parent element contains sibling
  - $.setQuery - plugin your own query engine

## Plugins

Pick and choose the parts of jQuery when and add you use them.

Other parts of jQuery can be Added via Plugins which is simply a matter of copying or including the 
script after the core `jquip.js`.

### [events](https://github.com/mythz/jquip/blob/master/src/jquip.events.js)

### Methods on `$(selector)`

  - bind
  - unbind
  - one
  - delegate
  - undelegate
  - live
  - die
  - trigger

### Helpers on `$(selector)`

blur focus focusin focusout load resize scroll unload click dblclick 
mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave 
change select submit keydown keypress keyup error

### Static Methods 

  - $.bind
  - $.unbind

### [documentReady](https://github.com/mythz/jquip/blob/master/src/jquip.docready.js)
yep, it's a plugin!

  - [$(function())](http://api.jquery.com/ready/)
  - [$.ready](http://api.jquery.com/ready/)

### [css](https://github.com/mythz/jquip/blob/master/src/jquip.css.js)

  - [$.css](http://api.jquery.com/css/)
  - width
  - height
  - innerHeight
  - innerWidth
  - outerHeight
  - outerWidth
  - scrollLeft
  - scrollTop
  - $.camelCase

### [ajax](https://github.com/mythz/jquip/blob/master/src/jquip.ajax.js)
based on [David Flanagan HttpUtils](http://www.davidflanagan.com/javascript5/display.php?n=20-1&f=20/01.js) 
modfied to work like jQuery's ajax.

  - $.xhr (cross-browser XHR Native Object)
  - [$.ajax](http://api.jquery.com/jQuery.ajax/)
  - [$.getJSON](http://api.jquery.com/jQuery.getJSON/)
  - $.get
  - $.post
  - $.formData - convert object hash into a url Encoded string component

### [custom](https://github.com/mythz/jquip/blob/master/src/jquip.custom.js)

  - $.queryString - cached map of queryString variables 
  - $.is[Tab|Enter|Shift|...] - static functions to detect named keys pressed, e.g. `if ($.isEnter(e)) console.log("pressed enter")`
  - $.cancelEvent - cross-browser fn to `preventDefault()` and `stopPropogation()`, returns false.

### Plugin Authors (adding your own plugins)

Extending jquip:

  * `[elements] window.Sizzle (selector, context)` - Provide an alternate query engine.
  * `bool $.hook (function(selector, contxt))` - Intercept the constructor request.
  * `plug(name, fn($))` - Register your own plugin, mutate `$` to extend jquip.

Intercept the `$(){ .. }` constructor and inject your own implementation. Return true to short-circuit. e.g: from the **docready** plugin:

  $.plug("docready", function ($) {
    $.hook(function (selector, ctx) {
        if (typeof selector == "function") {
            this.ready(selector);
            return true;
        }
    });
    ... 
  });

## Limitations

Many corner cases we feel that are not likely to be hit in normal development have been intentionally stripped out, it's therefore possible for older browsers could experience some issues if you work in these edge cases. In addition to its fluent API, jQuery does a lot of sanitization and quarantine for edge cases in older browsers which makes it the safer but slower option. 

Non supported examples:

  - Script tags in inserted HTML are not automatically evaluated 
  - Attributes and event handlers of cloned html fragments are not copied across
  - No expression support beyond the browsers native **querySelector** APIs or Sizzle.js shim

We prefer not to take the perf and code-bloat hit of this quarantine - if your app does hit one of these edge cases you will either need to code a specific workaround for your apps usage (which will in all likely be more optimized than jQuery's general purpose solution) or simply move back to using jQuery.

## Best Practices 

Contrary to the strong-held opinions of many "javascipt experts" DOMContentReady is rarely the fastest solution to run your app's logic. It is a *safer option* but in most cases your app will run faster if you execute your javascript below the HTML elements they reference. This is the guidance from the 
[Google Apps](https://groups.google.com/forum/#!msg/closure-library-discuss/G-7Ltdavy0E/RjllWWJTXAcJ) and YUI developer teams (amongst others). If you can't control where user scripts are placed, DOMContentReady is still a suitable option. This [answer on StackOverflow](http://stackoverflow.com/q/1439382/85785) provides a good overview over when to use it. 

We thought we'd clarify as we've received a lot of feedback on this issue - this is why jQuery's popular **docready** is a plugin and not included by default - simply include it as a plugin if you want it.

Simarily related, for best page load times you should [move scripts to the bottom](http://developer.yahoo.com/blogs/ydn/posts/2007/07/high_performanc_5/) of your page, e.g. before the closing </body> tag.

If you're not referencing jquip near the bottom of your page and don't have either the **events** or **docready** plugins included, you should call `$.onload()` in your own post DOMReady event. It performs post processsing tasks like downloading Sizzle.js (for <=IE7), calculates browser feature support, etc.

### Mini Query Engine (jquip.q-min.js)

Weighing at just **0.6k** query-min is an ultra fast selector engine for browsers that don't provide native support for the **querySelectorAll** APIs (e.g. <=IE7). It works by offloading as much work as possible to the browsers primitive `document.getElementById()`, `document.getElementsByTagName()` and `document.getElementsByClassName()` apis.

On our last JavaScript heavy project, performance was improved by **7-8x** in older browsers. If you're having performance issues with older browsers it's worth evaluating.

All selectors require an Id (i.e. #) Tag (e.g. INPUT) or class name in each child selector.
 
 Valid Examples:

   - TBODY TD.c1 INPUT
   - TH.c1 STRONG
   - #btnSubmit SPAN
   - FORM INPUT[name='chkProcess']
   - FORM INPUT[type='text']
   - FORM INPUT[type]
   - FORM#id.a.b
   - FORM#id .a.b
   - .a.b.c
   - .a 

For optimal performance in <= IE7, the first child selector should be a tag or an #id as it cuts down the amount of DOM traversing needed to be done in JavaScript since there is no `document.getElementsByClassName()` available.

### jquip Library Builder Service

The project now includes the node.js **/server/jquip.builder.js**
so you can host your own jquip Library builder service internally.

### Contributing

I'd love help with this so Contributors and pull requests are very welcome!

The main task that needs doing is to get all the missing jQuery parts in as plugins 
and a comprehensive test suite so we can properly identify the parts of jQuery supported.

Feedback is welcome, drop me a line on [@demisbellot](http://twitter.com/demisbellot).

## Contributors

  - [@mythz](https://github.com/mythz) (Demis Bellot)
  - [@jeyb](https://github.com/jeyb) (Jey Balachandran)
