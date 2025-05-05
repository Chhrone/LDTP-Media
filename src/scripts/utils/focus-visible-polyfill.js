

(function() {

  if (typeof document !== 'undefined' && 'querySelector' in document && 'classList' in document.documentElement) {

    const hasFocusVisible = () => {
      try {
        document.querySelector(':focus-visible');
        return true;
      } catch (e) {
        return false;
      }
    };


    if (hasFocusVisible()) {
      return;
    }


    let hadKeyboardEvent = false;
    let hadFocusVisibleRecently = false;
    let hadFocusVisibleRecentlyTimeout = null;


    const shouldApplyFocusVisible = (element) => {
      return hadKeyboardEvent || element.getAttribute('data-force-focus-visible');
    };


    const onFocus = (e) => {
      if (shouldApplyFocusVisible(e.target)) {
        e.target.classList.add('focus-visible');
      }
    };


    const onBlur = (e) => {
      if (e.target.classList.contains('focus-visible')) {
        hadFocusVisibleRecently = true;

        window.clearTimeout(hadFocusVisibleRecentlyTimeout);
        hadFocusVisibleRecentlyTimeout = window.setTimeout(() => {
          hadFocusVisibleRecently = false;
        }, 100);
        e.target.classList.remove('focus-visible');
      }
    };


    const onKeyDown = (e) => {
      if (e.key === 'Tab' || (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey)) {
        hadKeyboardEvent = true;
      }
    };


    const onPointerDown = () => {
      hadKeyboardEvent = false;
    };


    const onWindowBlur = () => {
      hadKeyboardEvent = false;
    };


    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    document.addEventListener('focus', onFocus, true);
    document.addEventListener('blur', onBlur, true);
    window.addEventListener('blur', onWindowBlur);


    const style = document.createElement('style');
    style.textContent = `
      .focus-visible:focus {
        outline: 2px solid var(--orange-accent) !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }
})();
