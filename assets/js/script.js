window.defer.push(() => {
    const w = window;

    w.NProgress.start();

    w.lazyLoad();
    w.on(w, "hashchange", w.lazyLoad);
    w.interactiveMD();

    w.NProgress.done();
});