const WORKER =
    "https://infinite-portal.scarypanda11721.workers.dev";

const frame =
    document.getElementById("frame");

const urlBar =
    document.getElementById("urlBar");

const HISTORY_KEY =
    "proxy-history";

const LAST_URL_KEY =
    "proxy-last-url";

let currentURL = "";

function normalize(url) {

    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {

        url = "https://" + url;
    }

    return url;
}

function saveHistory(url) {

    let history =
        JSON.parse(
            localStorage.getItem(HISTORY_KEY)
            || "[]"
        );

    // Remove duplicates
    history =
        history.filter(
            item => item !== url
        );

    // Add newest
    history.unshift(url);

    // Limit size
    history = history.slice(0, 100);

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );

    localStorage.setItem(
        LAST_URL_KEY,
        url
    );
}

function proxify(url) {

    return (
        WORKER +
        "/?url=" +
        encodeURIComponent(url)
    );
}

function deproxify(url) {

    try {

        const parsed =
            new URL(url);

        const real =
            parsed.searchParams.get("url");

        return real || url;

    } catch {

        return url;
    }
}

function updateBar(url) {

    currentURL = url;

    urlBar.value = url;
}

function load(url, push=true) {

    url = normalize(url);

    updateBar(url);

    saveHistory(url);

    const proxied =
        proxify(url);

    frame.src = proxied;

    if (push) {

        history.pushState(
            { url },
            "",
            "#" + encodeURIComponent(url)
        );
    }
}

document.getElementById("go")
.addEventListener("click", () => {

    load(urlBar.value);
});

urlBar.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {

            load(urlBar.value);
        }
    }
);

document.getElementById("back")
.addEventListener(
    "click",
    () => history.back()
);

document.getElementById("forward")
.addEventListener(
    "click",
    () => history.forward()
);

document.getElementById("refresh")
.addEventListener(
    "click",
    () => {

        frame.src = frame.src;
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

// Detect iframe navigation changes
frame.addEventListener(
    "load",
    () => {

        try {

            const current =
                deproxify(frame.contentWindow.location.href);

            if (
                current &&
                current !== currentURL
            ) {

                updateBar(current);

                saveHistory(current);

                history.replaceState(
                    { url: current },
                    "",
                    "#" + encodeURIComponent(current)
                );
            }

        } catch {

            // Cross-origin protection
            // Ignore silently
        }
    }
);

// Restore last page
const saved =
    localStorage.getItem(LAST_URL_KEY);

if (saved) {

    load(saved, false);

} else if (location.hash.length > 1) {

    load(
        decodeURIComponent(
            location.hash.substring(1)
        ),
        false
    );
}