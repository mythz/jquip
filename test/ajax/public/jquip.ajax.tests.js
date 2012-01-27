test("should process GET", function() {
  expect(3);
  stop();

  jquip.ajax(
    $.extend(helper.options, {
      type: 'GET',
      data: helper.person,
      success: function(data) {
        equal(data.method, 'GET');
        deepEqual(data.query, helper.person);
        equal(data.headers['x-requested-with'], 'XMLHttpRequest');
        start();
      }
    })
  );
});

test("should process POST", function() {
  expect(3);
  stop();

  jquip.ajax(
    $.extend(helper.options, {
      type: 'POST',
      data: helper.person,
      success: function(data) {
        equal(data.method, 'POST');
        equal(data.body, $.formData(helper.person));
        equal(data.headers['x-requested-with'], 'XMLHttpRequest');
        start();
      }
    })
  );
});

test("should process PUT", function() {
  expect(3);
  stop();

  jquip.ajax(
    $.extend(helper.options, {
      type: 'PUT',
      data: helper.person,
      success: function(data) {
        equal(data.method, 'PUT');
        equal(data.body, $.formData(helper.person));
        equal(data.headers['x-requested-with'], 'XMLHttpRequest');
        start();
      }
    })
  );
});

test("should process DELETE", function() {
  expect(3);
  stop();

  jquip.ajax(
    $.extend(helper.options, {
      type: 'DELETE',
      data: helper.person,
      success: function(data) {
        equal(data.method, 'DELETE');
        deepEqual(data.query, helper.person);
        equal(data.headers['x-requested-with'], 'XMLHttpRequest');
        start();
      }
    })
  );
});

test("should post json data", function() {
  expect(2);
  stop();

  jquip.ajax(
    $.extend(helper.options, {
      type: 'POST',
      data: JSON.stringify(helper.person),
      dataType: 'json',
      contentType: 'application/json',
      success: function(data) {
        equal(data.method, 'POST');
        equal(data.body, JSON.stringify(helper.person));
        start();
      }
    })
  );
});

test("should put json data", function() {
  expect(2);
  stop();

  jquip.ajax(
    $.extend(helper.options, {
      type: 'PUT',
      data: JSON.stringify(helper.person),
      dataType: 'json',
      contentType: 'application/json',
      success: function(data) {
        equal(data.method, 'PUT');
        equal(data.body, JSON.stringify(helper.person));
        start();
      }
    })
  );
});
