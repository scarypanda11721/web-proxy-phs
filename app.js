const WORKER =
    "https://infinite-portal.scarypanda11721.workers.dev";

const view =
    document.getElementById("view");

const urlBar =
    document.getElementById("urlBar");

const HISTORY_KEY =
    "proxy-history";

const LAST_KEY =
    "proxy-last-url";

function normalize(url) {

    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {

        url =
            "https://" + url;
    }

    return url;
}

function proxify(url) {

    return (
        WORKER +
        "/?url=" +
        encodeURIComponent(url)
    );
}

function saveHistory(url) {

    let history =
        JSON.parse(
            localStorage.getItem(
                HISTORY_KEY
            ) || "[]"
        );

    history =
        history.filter(
            x => x !== url
        );

    history.unshift(url);

    history =
        history.slice(0, 100);

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );

    localStorage.setItem(
        LAST_KEY,
        url
    );
}

async function load(
    url,
    push=true
) {

    url =
        normalize(url);

    urlBar.value =
        url;

    saveHistory(url);

    const response =
        await fetch(
            proxify(url)
        );

    const html =
        await response.text();

    view.innerHTML =
        html;

    rewriteLinks();

    if (push) {

        history.pushState(
            { url },
            "",
            "#" +
            encodeURIComponent(url)
        );
    }
}

function rewriteLinks() {

    // Links
    document
    .querySelectorAll("#view a")
    .forEach(a => {

        a.addEventListener(
            "click",
            e => {

                e.preventDefault();

                const href =
                    a.href;

                if (href) {

                    load(href);
                }
            }
        );
    });

    // Forms
    document
    .querySelectorAll("#view form")
    .forEach(form => {

        form.addEventListener(
            "submit",
            e => {

                e.preventDefault();

                const action =
                    form.action;

                if (action) {

                    load(action);
                }
            }
        );
    });
}

document
.getElementById("go")
.addEventListener(
    "click",
    () => {

        load(urlBar.value);
    }
);

urlBar.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {

            load(urlBar.value);
        }
    }
);

document
.getElementById("back")
.addEventListener(
    "click",
    () => {

        history.back();
    }
);

document
.getElementById("forward")
.addEventListener(
    "click",
    () => {

        history.forward();
    }
);

document
.getElementById("refresh")
.addEventListener(
    "click",
    () => {

        load(urlBar.value);
    }
);

window.addEventListener(
    "popstate",
    e => {

        if (e.state?.url) {

            load(
                e.state.url,
                false
            );
        }
    }
);

// Restore last page
const saved =
    localStorage.getItem(
        LAST_KEY
    );

if (saved) {

    load(saved, false);

} else if (
    location.hash.length > 1
) {

    load(
        decodeURIComponent(
            location.hash.substring(1)
        ),
        false
    );
}