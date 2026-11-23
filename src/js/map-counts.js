document.addEventListener("DOMContentLoaded", () => {
    const badges = document.querySelectorAll("[data-room-count]");
    if (!badges.length || typeof Peer === "undefined") return;

    const checkerPeer = new Peer();
    const activeConns = new Map();
    let isReady = false;

    function updateBadge(badge, count) {
        const safeCount = Math.max(0, Number(count) || 0);
        badge.textContent = `(${safeCount} ${safeCount === 1 ? "player" : "players"})`;
        badge.classList.toggle("has-players", safeCount > 0);
    }

    function requestCountOnConn(conn, roomId, badge) {
        if (!conn || !conn.open) return;
        conn.send({ type: "get_player_count", roomId });
    }

    function queryRoomCount(roomId, badge) {
        if (!isReady || checkerPeer.disconnected || checkerPeer.destroyed) return;

        const existing = activeConns.get(roomId);
        if (existing && existing.open) {
            requestCountOnConn(existing, roomId, badge);
            return;
        }

        const hostId = "tocrooms-" + roomId + "-host-v1";
        let answered = false;

        const conn = checkerPeer.connect(hostId, { reliable: true });
        activeConns.set(roomId, conn);

        const timer = setTimeout(() => {
            if (!answered) {
                updateBadge(badge, 0);
            }
        }, 1200);

        conn.on("open", () => {
            requestCountOnConn(conn, roomId, badge);
        });

        conn.on("data", (data) => {
            if (data && data.type === "player_count_response" && data.roomId === roomId) {
                answered = true;
                clearTimeout(timer);
                updateBadge(badge, data.count);
            }
        });

        conn.on("close", () => {
            clearTimeout(timer);
            if (activeConns.get(roomId) === conn) {
                activeConns.delete(roomId);
            }
            updateBadge(badge, 0);
        });

        conn.on("error", () => {
            clearTimeout(timer);
            if (activeConns.get(roomId) === conn) {
                activeConns.delete(roomId);
            }
            updateBadge(badge, 0);
        });
    }

    function refreshAllRooms() {
        if (!isReady || checkerPeer.disconnected || checkerPeer.destroyed) return;

        badges.forEach((badge) => {
            const roomId = badge.dataset.roomCount;
            if (roomId) {
                queryRoomCount(roomId, badge);
            }
        });
    }

    checkerPeer.on("open", () => {
        isReady = true;
        refreshAllRooms();
        setInterval(refreshAllRooms, 1500);
    });

    checkerPeer.on("error", (err) => {
        if (err && err.type === "peer-unavailable" && err.message) {
            const match = err.message.match(/tocrooms-(.+)-host-v1/);
            if (match && match[1]) {
                const roomId = match[1];
                activeConns.delete(roomId);
                const badge = document.querySelector(`[data-room-count="${roomId}"]`);
                if (badge) updateBadge(badge, 0);
            }
        }
    });

    window.addEventListener("beforeunload", () => {
        activeConns.forEach((conn) => {
            try { conn.close(); } catch (e) {}
        });
        activeConns.clear();
        if (checkerPeer && !checkerPeer.destroyed) {
            checkerPeer.destroy();
        }
    });
});