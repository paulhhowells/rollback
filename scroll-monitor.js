/**
 * @name scrollMonitor
 * @function
 * @requires: jQuery
 * @method: on
 * @returns: {object} An object with the on method to allow event listener callbacks to be registered for scroll events.
 */

var scrollMonitor = (function(options) {
  'use strict';

  var
    INC = 'inc',
    DEC = 'dec',
    NONE = 'none',
    scrolling = false,
    scrollTop,
    previousScrollTop,
    intervalFrequencySlow = 300,
    intervalFrequencyFast = 150,
    intervalFrequency,
    intervalID,
    direction,
    previousDirection,
    zero,
    callbacks;

  callbacks = {
    change : [],
    dec : [],
    inc : [],
    stop : [],
    zero : []
  };

  if (options) {
    if (options.hasOwnProperty('intervalFrequencySlow')) {
      intervalFrequencySlow = options.intervalFrequencySlow;
    }
    if (options.hasOwnProperty('intervalFrequencyFast')) {
      intervalFrequencySlow = options.intervalFrequencyFast;
    }
  }
  intervalFrequency = intervalFrequencySlow;

  // On ready.
  $(function () {
    // Capture scroll.
    $(window).on('scroll', scrollCallback);

    // Start polling to detect scrolling.
    intervalID = window.setInterval(intervalCallback, intervalFrequency);
  });

  return {
    on : on
  };

  // A method for adding event listeners and registering callbacks.
  function on (event, fn) {
    if (callbacks.hasOwnProperty(event)) {
      var record = { fn : fn };

      if (arguments.length > 2) {
        record.args = Array.prototype.slice.call(arguments);
      }

      record.id = event + callbacks[event].length;
      callbacks[event].push(record);

      return record.id;
    }
    else {
      return false;
    }
  }

  function event (event, message) {
    if (callbacks[event] && callbacks[event].length > 0) {
      if (message) {
        run(callbacks[event], message);
      }
      else {
        run(callbacks[event]);
      }
    }
  }

  function run (records, message) {
    var
      i,
      arrayLength = records.length,
      record;

    for (i = 0; i < arrayLength; i++) {
      record = records[i];
      if (record.args) {
        record.fn.apply(this, record.args);
      }
      else {
        if (message) {
         record.fn(message);
        }
        else {
         record.fn();
        }
      }
    }
  }

  function intervalCallback () {
    if (scrolling) {
      // A scroll has occured since this callback was last called.

      // Determine direction of scroll.
      // It can be confusing to refer to scrolling up and down, so 'inc' and
      // 'dec' are used to record scrollTop increasing and decreasing.
      previousDirection = direction;
      if (scrollTop > previousScrollTop) {
        direction = INC;
      }
      else if (scrollTop < previousScrollTop) {
        direction = DEC;
      }
      else if (scrollTop === previousScrollTop) {
        direction = NONE;
      }

      event(direction);

      if (direction !== previousDirection) {
        event('change', direction);
      }

      // Hypothesis: a scroll event occurs whenever scrollTop becomes zero.
      if (scrollTop > 0) {
        zero = false;
      }
      else if (zero !== true) {
        event('zero');
        zero = true;
      }
    }
    else {
      // Regardless of the state of previousDirection, the scroll callback
      // has not recently set scroll to true, so assume that scrolling has
      // stopped, and therefore does not have a direction.
      direction = 'none';

      if (intervalFrequency !== intervalFrequencySlow) {
        intervalFrequency = intervalFrequencySlow;
        startInterval();
      }
    }

    scrolling = false;
  }

  function scrollCallback () {
    previousScrollTop = scrollTop;
    scrollTop = $(window).scrollTop();
    scrolling = true;

    if (direction === NONE) {
      intervalCallback();

      if (intervalFrequency !== intervalFrequencyFast) {
        intervalFrequency = intervalFrequencyFast;
        startInterval();
      }
    }
  }

  function startInterval () {
    window.clearInterval(intervalID);
    intervalID = window.setInterval(intervalCallback, intervalFrequency);
  }
}());
