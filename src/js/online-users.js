document.addEventListener("DOMContentLoaded", () => {
    const countEl = document.getElementById("onlineUsersCount");
    const listEl = document.getElementById("onlineUsersList");
    if (!countEl || !listEl) return;

    const LOBBY_HOST_ID = "tocrooms-global-lobby-v1";
    const ROOM_IDS = ["plane", "obby1", "obby2", "obby3", "gravitytest"];
    const myPeerKey = "user_" + Math.random().toString(36).slice(2, 10);
    const myUsername = localStorage.getItem("tocrooms_anon_id") || "Guest";
    const onlineUsers = new Map();
    const roomPlayersMap = new Map();

    function touchSelf() {
        onlineUsers.set(myPeerKey, {
            username: myUsername,
            location: "Home",
            lastSeen: Date.now()
        });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function renderList() {
        touchSelf();
        const now = Date.now();
        onlineUsers.forEach((info, id) => {
            if (id !== myPeerKey && now - (info.lastSeen || 0) > 8000) {
                onlineUsers.delete(id);
            }
        });

        const merged = [];
        roomPlayersMap.forEach((players, roomId) => {
            players.forEach((name) => {
                merged.push({
                    username: name || "Guest",
                    location: roomId
                });
            });
        });

        const mapUsernames = new Set(merged.map((m) => m.username));
        onlineUsers.forEach((info, id) => {
            if (id === myPeerKey && mapUsernames.has(info.username)) return;
            merged.push({
                username: info.username || "Guest",
                location: info.location || "Home"
            });
        });

        countEl.textContent = String(merged.length);

        if (merged.length > 2) {
            listEl.classList.add("scrollable-online-list");
        } else {
            listEl.classList.remove("scrollable-online-list");
        }

        if (merged.length === 0) {
            listEl.innerHTML = `<li class="online-empty">No users online right now.</li>`;
            return;
        }

        listEl.innerHTML = "";
        merged.forEach((user) => {
            const li = document.createElement("li");
            const statusText = user.location && user.location !== "Home"
                ? ` — Playing ${user.location}`
                : " — Online";
            li.innerHTML = `<strong>${escapeHtml(user.username)}</strong><span class="online-status">${escapeHtml(statusText)}</span>`;
            listEl.appendChild(li);
        });
    }

    renderList();

    if (typeof Peer === "undefined") return;

    let lobbyPeer = null;
    let isLobbyHost = false;
    let hostConn = null;
    const clientConns = new Set();
    let reconnectTimer = null;

    function getRosterArray() {
        touchSelf();
        return Array.from(onlineUsers.entries()).map(([id, info]) => ({
            id,
            username: info.username,
            location: info.location,
            lastSeen: info.lastSeen
        }));
    }

    function broadcastRoster() {
        if (!isLobbyHost) return;
        const payload = {
            type: "lobby_roster",
            users: getRosterArray()
        };
        clientConns.forEach((conn) => {
            if (conn && conn.open) {
                conn.send(payload);
            }
        });
    }

    function mergeUsers(usersArray) {
        if (!Array.isArray(usersArray)) return;
        usersArray.forEach((u) => {
            if (!u || !u.id) return;
            onlineUsers.set(u.id, {
                username: u.username || "Guest",
                location: u.location || "Home",
                lastSeen: Date.now()
            });
        });
        renderList();
    }

    function attachHostClientHandlers(conn) {
        clientConns.add(conn);

        conn.on("open", () => {
            conn.send({
                type: "lobby_roster",
                users: getRosterArray()
            });
        });

        conn.on("data", (data) => {
            if (!data || !data.type) return;

            if (data.type === "lobby_heartbeat" || data.type === "lobby_hello") {
                const userId = data.id || conn.peer;
                onlineUsers.set(userId, {
                    username: data.username || "Guest",
                    location: data.location || "Home",
                    lastSeen: Date.now()
                });
                renderList();
                broadcastRoster();
            } else if (data.type === "lobby_leave") {
                const userId = data.id || conn.peer;
                if (userId !== myPeerKey) {
                    onlineUsers.delete(userId);
                }
                renderList();
                broadcastRoster();
            }
        });

        conn.on("close", () => {
            clientConns.delete(conn);
            renderList();
            broadcastRoster();
        });

        conn.on("error", () => {
            clientConns.delete(conn);
        });
    }

    function connectToLobbyHost() {
        if (lobbyPeer && !lobbyPeer.destroyed) {
            try { lobbyPeer.destroy(); } catch (e) {}
        }

        isLobbyHost = false;
        const client = new Peer();
        lobbyPeer = client;

        client.on("open", () => {
            const conn = client.connect(LOBBY_HOST_ID, { reliable: true });
            hostConn = conn;

            conn.on("open", () => {
                touchSelf();
                conn.send({
                    type: "lobby_hello",
                    id: myPeerKey,
                    username: myUsername,
                    location: "Home"
                });
            });

            conn.on("data", (data) => {
                if (!data || !data.type) return;
                if (data.type === "lobby_roster") {
                    mergeUsers(data.users);
                }
            });

            conn.on("close", () => {
                hostConn = null;
                scheduleLobbyInit(1200);
            });

            conn.on("error", () => {
                hostConn = null;
                scheduleLobbyInit(1200);
            });
        });

        client.on("error", () => {
            scheduleLobbyInit(1500);
        });
    }

    function initLobby() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        if (lobbyPeer && !lobbyPeer.destroyed) {
            try { lobbyPeer.destroy(); } catch (e) {}
        }

        isLobbyHost = false;
        const host = new Peer(LOBBY_HOST_ID);
        lobbyPeer = host;

        host.on("open", () => {
            isLobbyHost = true;
            touchSelf();
            renderList();
        });

        host.on("connection", (conn) => {
            attachHostClientHandlers(conn);
        });

        host.on("error", (err) => {
            if (err && err.type === "unavailable-id") {
                connectToLobbyHost();
            } else {
                scheduleLobbyInit(1500);
            }
        });
    }

    function scheduleLobbyInit(delay = 1500) {
        if (reconnectTimer) return;
        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            initLobby();
        }, delay);
    }

    setInterval(() => {
        touchSelf();
        if (isLobbyHost) {
            broadcastRoster();
        } else if (hostConn && hostConn.open) {
            hostConn.send({
                type: "lobby_heartbeat",
                id: myPeerKey,
                username: myUsername,
                location: "Home"
            });
        }
        renderList();
    }, 1500);

    const roomCheckerPeer = new Peer();
    const roomConns = new Map();
    let checkerReady = false;

    function queryRoom(roomId) {
        if (!checkerReady || roomCheckerPeer.disconnected || roomCheckerPeer.destroyed) return;

        const existing = roomConns.get(roomId);
        if (existing && existing.open) {
            existing.send({ type: "get_player_count", roomId });
            return;
        }

        const hostId = "tocrooms-" + roomId + "-host-v1";
        const conn = roomCheckerPeer.connect(hostId, { reliable: true });
        roomConns.set(roomId, conn);

        conn.on("open", () => {
            conn.send({ type: "get_player_count", roomId });
        });

        conn.on("data", (data) => {
            if (data && data.type === "player_count_response" && data.roomId === roomId) {
                roomPlayersMap.set(roomId, Array.isArray(data.players) ? data.players : []);
                renderList();
            }
        });

        conn.on("close", () => {
            if (roomConns.get(roomId) === conn) roomConns.delete(roomId);
            roomPlayersMap.delete(roomId);
            renderList();
        });

        conn.on("error", () => {
            if (roomConns.get(roomId) === conn) roomConns.delete(roomId);
            roomPlayersMap.delete(roomId);
            renderList();
        });
    }

    roomCheckerPeer.on("open", () => {
        checkerReady = true;
        ROOM_IDS.forEach((id) => queryRoom(id));
        setInterval(() => ROOM_IDS.forEach((id) => queryRoom(id)), 1500);
    });

    roomCheckerPeer.on("error", (err) => {
        if (err && err.type === "peer-unavailable" && err.message) {
            const match = err.message.match(/tocrooms-(.+)-host-v1/);
            if (match && match[1]) {
                const roomId = match[1];
                roomConns.delete(roomId);
                roomPlayersMap.delete(roomId);
                renderList();
            }
        }
    });

    initLobby();

    window.addEventListener("beforeunload", () => {
        if (hostConn && hostConn.open) {
            try {
                hostConn.send({ type: "lobby_leave", id: myPeerKey });
            } catch (e) {}
        }
        clientConns.forEach((conn) => {
            try {
                if (conn.open) conn.send({ type: "lobby_leave", id: myPeerKey });
                conn.close();
            } catch (e) {}
        });
        roomConns.forEach((conn) => {
            try { conn.close(); } catch (e) {}
        });
        if (lobbyPeer && !lobbyPeer.destroyed) lobbyPeer.destroy();
        if (roomCheckerPeer && !roomCheckerPeer.destroyed) roomCheckerPeer.destroy();
    });
});