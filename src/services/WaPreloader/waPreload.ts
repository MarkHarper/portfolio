// inspired by this discussion
// https://github.com/shoelace-style/webawesome-alpha/discussions/156

async function preloadWaElements() {
  const html = document.documentElement;
  const preload = html.getAttribute('data-wa-preload')?.split(' ');

  if (preload?.length) {
    await Promise.all(
      preload.map(async (elName) => {
        const defined = await customElements.whenDefined(elName);

        return defined;
      }),
    );
  }

  html.removeAttribute('data-wa-preload');
  html.classList.remove('wa-reduce-fouce');
}

export default preloadWaElements;
