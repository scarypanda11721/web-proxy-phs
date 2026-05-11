const WORKER =
    "https://web-proxy.scarypanda11721.workers.dev/";

const frame =
    document.getElementById("frame");

const urlBar =
    document.getElementById("urlBar");

function normalize(url) {

    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {

        url = "https://" + url;
    }

    return url;
}

function load(url, push=true) {

    url = normalize(url);

    urlBar.value = url;

    const proxied =
        WORKER +
        "/?url=" +
        encodeURIComponent(url);

    frame.src = proxied;

    if (push) {

        history.pushState(
            { url },
            "",
            "#"+encodeURIComponent(url)
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

if (location.hash.length > 1) {

    load(
        decodeURIComponent(
            location.hash.substring(1)
        ),
        false
    );
}