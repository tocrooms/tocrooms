function createQuickChat(localPlayer, multiplayer) {
    const phrases = [
    "Hi", "Hello", "Yes", "No",
    "Follow me", "Wow", "How?", "???",
    "Wait", "Nice", "Look", "Help", "Bye",
    "Thanks!", "Sorry", "No problem", "GG",
    "Come here", "Stop!", "Watch out!", "Behind you",
    "Ready?", "Let's go!", "I don't know", "Maybe",
    "Awesome!", "What?!", "Why?", "One sec",
    "Good luck", "Welcome"
    ];

    const container = document.createElement("div");
    container.id = "chatSystem";
    container.style.position = "fixed";
    container.style.bottom = "12px";
    container.style.left = "12px";
    container.style.zIndex = "2147483647";

    const menu = document.createElement("div");
    menu.id = "quickChatMenu";
    menu.style.display = "none";
    menu.style.flexDirection = "column";
    menu.style.background = "#ffffff";
    menu.style.maxHeight = "140px";
    menu.style.overflowY = "auto";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.textContent = "Chat (C)";
    toggleBtn.style.background = "#ffffff";
    toggleBtn.style.color = "#000000";
    toggleBtn.style.border = "none";
    toggleBtn.style.cursor = "pointer";

    function toggleMenu(forceState) {
        const isOpen = forceState !== undefined ? forceState : menu.style.display === "none";
        menu.style.display = isOpen ? "flex" : "none";
    }

    function sendMessage(phrase) {
        if (!phrase) return;

        if (localPlayer && typeof localPlayer.showChatBubble === "function") {
            localPlayer.showChatBubble(phrase);
        }
        if (multiplayer && typeof multiplayer.sendChatMessage === "function") {
            multiplayer.sendChatMessage(phrase);
        }
        toggleMenu(false);
    }

    phrases.forEach((phrase) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = phrase;
        btn.style.background = "#ffffff";
        btn.style.color = "#000000";
        btn.style.border = "none";
        btn.style.textAlign = "left";
        btn.style.cursor = "pointer";
        btn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            sendMessage(phrase);
        });

        menu.appendChild(btn);
    });

    toggleBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        toggleMenu();
    });

    container.appendChild(menu);
    container.appendChild(toggleBtn);

    function mountChat() {
        if (!document.getElementById("chatSystem") && document.body) {
            document.body.appendChild(container);
        }
    }

    if (document.body) {
        mountChat();
    } else {
        document.addEventListener("DOMContentLoaded", mountChat);
    }

    window.addEventListener(
        "keydown",
        (e) => {
            const tag = e.target && e.target.tagName;
            const isTyping = tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable;
            if (isTyping || e.repeat) return;

            if (e.code === "KeyC" || (e.key && e.key.toLowerCase() === "c")) {
                mountChat();
                toggleMenu();
            } else if (e.code === "Escape" || e.key === "Escape") {
                toggleMenu(false);
            }
        },
        true
    );

    return { toggleMenu, sendPhrase: sendMessage, sendMessage };
}