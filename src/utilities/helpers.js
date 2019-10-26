

export function register(components) {
  window.addEventListener('WebComponentsReady', function () {
    components.forEach((c) => {
      customElements.define(c.tag, c.class);
    });
  });
}

export function interval (fxn, arg, time) {
  setTimeout(function () {
      fxn(arg);
      interval(fxn, arg, time);
  }, time);
}