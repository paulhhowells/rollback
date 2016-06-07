/*
 * Rollback.
 */
(function() {
  'use strict';

  // Todo:
  // Introduce hysteris when detached, visible, and decreasing.

  var
    VISIBLE = true,
    HIDDEN = false,
    DETACHED = true,
    ATTACHED = false,
    state = {
      visible : null,
      detached : false
    },
    css = {
      isDetached : 'is-detached',
      isHidden : 'is-hidden',
      isVisible : 'is-visible'
    },
    $window,
    $panel,
    $panelInner,
    panelHeight,
    panelHeightOffset;

  // On ready.
  $(function () {
    $window = $(window);
    $panel = $('.wensleydale');
    $panelInner = $panel.wrapInner('<div/>').children();

    updatePanelHeight();
    $window.on('resize', updatePanelHeight);

    if ($window.scrollTop() >= panelHeightOffset) {
      // Go to a detached & hidden state.
      detachAndHide();
    }
  });

  // Attach callbacks for scroll events.
  scrollMonitor.on('inc', inc);
  scrollMonitor.on('dec', dec);
  scrollMonitor.on('zero', zero);

  // Declare functions.

  function updatePanelHeight () {
    panelHeight = $panelInner.outerHeight();
    panelHeightOffset = Math.floor(panelHeight * 1.5);

    if (state.detached) {
      $panel.height(panelHeight);
    }
  }

  function inc () {
    if (state.detached) {
      // Currently detached.

      if ($window.scrollTop() <= panelHeight) {
        attach();
      }
      else {
        if (state.visible === VISIBLE) {
          // Hide panelInner.
          state.visible = HIDDEN;
          $panelInner
            .addClass(css.isHidden)
            .removeClass(css.isVisible)
            .css({'top' : -panelHeight});
        }
      }
    }
    else {
      // Currently attached.
      if ($window.scrollTop() >= panelHeightOffset) { // panelHeight) {
        // Go to a detached & hidden state.
        // This will allow the detached panel to made visible.
        detachAndHide();
      }
    }
  }

  function dec () {
    // Decreasing scroll, returning to the top of the document.
    // Consider showing detached panel.

    if (state.detached === DETACHED) {
      // Currently detached.

      if ($window.scrollTop() <= 0) {
        attach();
      }
      else {
        // Make visible.
        if (state.visible !== VISIBLE) {
          state.visible = VISIBLE;
          $panelInner
            .css({'top' : ''})
            .addClass(css.isVisible)
            .removeClass(css.isHidden);
        }
      }
    }
  }

  function zero () {
    attach();
  }

  function attach () {
    if (state.detached === DETACHED && state.visible !== null) {
      // Attach
      state.detached = ATTACHED;
      state.visible = null; // HIDDEN;
      $panel.height('');
      $panelInner
        .css({'top' : ''})
        .removeClass(css.isDetached)
        .removeClass(css.isVisible)
        .removeClass(css.isHidden);
    }
  }

  function detachAndHide () {
    state.detached = DETACHED;
    state.visible = HIDDEN;
    $panel.height(panelHeight);
    $panelInner.css({'top' : -panelHeight});

    // Wrapping in timeout is a hack for Safari.
    window.setTimeout(function () {
      $panelInner
        .addClass(css.isDetached)
        .addClass(css.isHidden)
        .removeClass(css.isVisible);
    }, 0);
  }
}());
