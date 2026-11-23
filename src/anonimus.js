const anonymousButton = document.getElementById("anonymousButton");
const anonymousName = document.getElementById("anonymousName");
const logoutButton = document.getElementById("logoutAnonymousButton");

function createAnonymousName() {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZÇabcdefghijklmnopqrstuvwxyzç0123456789";

    let randomPart = "";

    for (let i = 0; i < 16; i++) {
        randomPart += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }

    return "anom_" + randomPart;
}

const savedUsername = localStorage.getItem("tocrooms_anon_id");

if (savedUsername && anonymousName && anonymousButton) {
    anonymousName.textContent = "Welcome, " + savedUsername + "!";
    anonymousButton.textContent = "Entered as " + savedUsername;
    anonymousButton.disabled = true;

    if (logoutButton) {
        logoutButton.style.display = "inline-block";
    }
} else if (anonymousButton) {
    anonymousButton.disabled = false;
    anonymousButton.textContent = "Enter as Anonymous";

    if (logoutButton) {
        logoutButton.style.display = "none";
    }
}

if (anonymousButton) {
    anonymousButton.addEventListener("click", function () {
        if (localStorage.getItem("tocrooms_anon_id")) {
            return;
        }

        const username = createAnonymousName();
        localStorage.setItem("tocrooms_anon_id", username);
        window.location.reload();
    });
}

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("tocrooms_anon_id");
        window.location.reload();
    });
}