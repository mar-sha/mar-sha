window.defer.push(() => {
    const w = window;

    w.NProgress.start();

    w.lazyLoad();
    w.on(w, 'hashchange', w.lazyLoad);
    w.interactiveMD();

    w.NProgress.done();
});
window.tmp = window.runDefer ? window.runDefer() : () => { };
window.Reflect.deleteProperty(window, 'tmp');