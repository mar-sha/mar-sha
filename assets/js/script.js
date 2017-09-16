/* global Reflect, NProgress, one, all, on, str2DOM, wrapDOM, getViewport, isElementInViewport, getScroll, addClass, removeClass, hasClass */
/* jshint -W079, -W097, -W117 */

"use strict";

const w = window, cache = w.cache || {},
    noop = () => { },
    runAfterLib = () => {
        return window.runAfterLib && window.runAfterLib();
    },
    int = (i) => {
        return Number(i);
    };
let lastScrollTop = 0,
    scrollSpy = noop,
    lazyLoad = noop,
    interactiveMD = noop;


window.afterLib.push(() => {
    NProgress.start();
    cache.menu = cache.menu || one(".menu");

    scrollSpy = () => {
        if (getViewport().w < int("960")) {
            const st = getScroll().y;

            if (cache.menu && st > lastScrollTop && st > cache.menu.clientHeight * int("2")) {
                addClass(cache.menu, "folded");
            } else {
                removeClass(cache.menu, "folded");
            }
            lastScrollTop = st;
        } else {
            removeClass(cache.menu, "folded");
        }
        lazyLoad();
    };
    scrollSpy();
    on(window, "scroll resize", scrollSpy);
    on(all(".row,.flex"), "scroll", scrollSpy);

    lazyLoad = () => {
        const g = all("img.lazyload");
        let i = g.length;

        while (i--) {
            if (isElementInViewport(g[i]) && g[i].dataset.src && g[i].src.indexOf("data:image") === int("0")) {
                g[i].src = g[i].dataset.src;
                Reflect.deleteProperty(g[i].dataset, "src");
                removeClass(g[i], "lazyload");
            }
        }
    };
    lazyLoad();
    on(w, "hashchange", lazyLoad);

    interactiveMD = () => {
        const cmd = {
                "find": (d, j) => {
                    const tag = (j.tag || "").trim().toUpperCase(),
                        className = j.className || "";
                    let loop = true,
                        tmp = 0;

                    d.tabIndex = -1;
                    while (loop && (d = d.parentNode)) {
                        if (d.tagName === tag) {
                            loop = false;
                            addClass(d, className);
                            if (tag === "TABLE" && hasClass(d, "responsive")) {
                                tmp = all("tr", d);
                                addClass(tmp, "row");
                                tmp = all("td,th", d);
                                addClass(tmp, `col-sm-1 col-md-1-${tmp[int("0")].parentNode.children.length}`);
                                tmp = one("thead", d);
                                addClass(tmp, "hide");
                            }
                        }
                    }
                },
                "wrap": (d, j) => {
                    const tag = (j.tag || "").trim().toUpperCase(),
                        className = j.className || "",
                        attr = j.attr || "",
                        figcaption = j.figcaption || d.alt || d.title || "",
                        wrapper = tag.length ? str2DOM(`<${tag}  ${attr}></${tag}>`) : d;

                    addClass(wrapper, className);
                    if (wrapper !== d) {
                        wrapDOM(d, wrapper);
                        if (tag === "FIGURE" && figcaption.length) {
                            wrapper.appendChild(str2DOM(`<figcaption>${figcaption}</figcaption>`));
                        }
                    }
                },
                "audio": (d, j) => {
                    const src = j.src || d.src || d.href || "",
                        attr = j.attr || "",
                        audio = str2DOM(`<audio src="${src}" ${attr}></audio>`);

                    d.parentNode.insertBefore(audio, d);
                    on(d, "click", (e) => {
                        e.preventDefault();
                        e = audio.paused ? audio.play() : audio.pause();

                        return false;
                    });
                },
                "embed": (d, j) => {
                    const src = j.src || d.src || d.href || "",
                        className = j.className || "embed ratio ratio-16-9",
                        attr = j.attr || "allowfullscreen frameborder='0'",
                        ytsrc = src.toLowerCase().indexOf("youtube") >= int("0") && src.indexOf("?") < int("0") ? "?&autoplay=1&iv_load_policy=3&modestbranding=1&showinfo=0&rel=0&playsinline=1" : "";

                    addClass(d, className);
                    on(d, "click", (e) => {
                        e.preventDefault();
                        removeClass(d, "embed");
                        d.parentNode.replaceChild(str2DOM(`<span class="${className}"><iframe src="${src}${ytsrc}"  ${attr}></iframe></span>`), d);

                        return false;
                    });
                },
            }, el = all("body [title]");
        let i = el.length, j = noop, t = noop;

        while (i--) {
            try {
                t = JSON.parse(el[i].title);
                t = t.pop ? t : [t];
            } catch (e) {
                noop();
            }
            while (t.length && (j = t.pop())) {
                cmd[j[">"]](el[i], j);
                el[i].title = "";
            }
        }
    };
    interactiveMD();

    NProgress.done();
});
runAfterLib();