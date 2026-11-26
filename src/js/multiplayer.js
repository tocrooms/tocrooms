function createMultiplayer(scene, localPlayer, onPlayersChange, roomId = "default", onMapSync = null) {
    const ROOM_HOST_ID = "tocrooms-" + roomId + "-host-v1";
    const remotePlayers = new Map();
    const connections = new Set();
    let peer = null;
    let isHost = false;

    function getRoomPlayerCount() {
        return 1 + remotePlayers.size;
    }

    function getRoomPlayerNames() {
        return [
            localPlayer.username || "Guest",
            ...Array.from(remotePlayers.values()).map((remote) => remote.username || "Guest")
        ];
    }

    function pushCountToConnections(targetPeerId = null) {
        if (!isHost) return;
        const payload = {
            type: "player_count_response",
            roomId: roomId,
            count: getRoomPlayerCount(),
            players: getRoomPlayerNames()
        };

        connections.forEach((conn) => {
            if (!conn.open) return;
            if (targetPeerId && conn.peer !== targetPeerId) return;
            conn.send(payload);
        });
    }

    function notifyPlayersChange() {
        if (isHost) {
            pushCountToConnections();
        }

        if (!onPlayersChange) return;

        const players = [
            {
                id: "local",
                username: localPlayer.username,
                isLocal: true
            }
        ];

        remotePlayers.forEach((remote, id) => {
            players.push({
                id: id,
                username: remote.username || "Guest",
                isLocal: false
            });
        });

        onPlayersChange(players);
    }

    function broadcast(payload, excludePeerId = null) {
        connections.forEach((conn) => {
            if (!conn.open) return;
            if (excludePeerId && conn.peer === excludePeerId) return;
            conn.send(payload);
        });
    }

    function sendPlayerState(targetConn = null) {
        const moveState = typeof localPlayer.getMoveState === "function"
            ? localPlayer.getMoveState()
            : { isMoving: false, isGrounded: true, velocityY: 0 };

        const winsCount = typeof getLocalWins === "function" ? getLocalWins() : 0;

        const payload = {
            type: "player_state",
            username: localPlayer.username,
            colors: typeof getPlayerColors === "function" ? getPlayerColors() : null,
            wins: winsCount,
            x: localPlayer.mesh.position.x,
            y: localPlayer.mesh.position.y,
            z: localPlayer.mesh.position.z,
            rotY: localPlayer.mesh.rotation.y,
            isMoving: moveState.isMoving,
            isGrounded: moveState.isGrounded,
            velocityY: moveState.velocityY
        };

        if (targetConn) {
            if (targetConn.open) targetConn.send(payload);
        } else {
            broadcast(payload);
        }
    }

    function sendChatMessage(text) {
        if (!text) return;
        const payload = {
            type: "player_chat",
            peerId: peer ? peer.id : null,
            text: text
        };
        broadcast(payload);
    }

    function sendMapSync(payload) {
        if (!payload) return;
        broadcast({
            type: "lavamountain_sync",
            ...payload
        });
    }

    function handleMessage(fromPeerId, data) {
        if (!data || !data.type) return;

        if (data.type === "get_player_count") {
            if (isHost) {
                pushCountToConnections(fromPeerId);
            }
            return;
        }

        if (data.type === "lavamountain_sync") {
            if (typeof onMapSync === "function") {
                onMapSync(data);
            }
            if (isHost) {
                broadcast(data, fromPeerId);
            }
            return;
        }

        if (data.type === "player_state") {
            const senderId = data.peerId || fromPeerId;
            let remote = remotePlayers.get(senderId);

            if (!remote) {
                remote = createRemotePlayer(scene, data.username, data.colors, data.wins || 0);
                remote.username = data.username || "Guest";
                remotePlayers.set(senderId, remote);
                notifyPlayersChange();
            } else {
                if (data.username && remote.username !== data.username) {
                    remote.username = data.username;
                    notifyPlayersChange();
                }
            }

            remote.setState(data);
            if (typeof remote.setWins === "function" && typeof data.wins === "number") {
                remote.setWins(data.wins);
            }

            if (isHost && !data.peerId) {
                broadcast({ ...data, peerId: fromPeerId }, fromPeerId);
            }
        } else if (data.type === "player_chat") {
            const senderId = data.peerId || fromPeerId;
            const remote = remotePlayers.get(senderId);
            if (remote && data.text && typeof setSpeechBubble === "function") {
                setSpeechBubble(remote.mesh, data.text);
            }
            if (isHost && !data.peerId) {
                broadcast({ ...data, peerId: fromPeerId }, fromPeerId);
            }
        } else if (data.type === "player_leave") {
            const targetId = data.peerId || fromPeerId;
            const remote = remotePlayers.get(targetId);
            if (remote) {
                remote.remove();
                remotePlayers.delete(targetId);
                notifyPlayersChange();
            }
            if (isHost) {
                broadcast({ type: "player_leave", peerId: targetId }, fromPeerId);
            }
        }
    }

    function setupConnection(conn) {
        connections.add(conn);

        conn.on("open", () => {
            sendPlayerState(conn);
            if (isHost) {
                pushCountToConnections(conn.peer);
            }
        });

        conn.on("data", (data) => {
            handleMessage(conn.peer, data);
        });

        conn.on("close", () => {
            connections.delete(conn);
            const remote = remotePlayers.get(conn.peer);
            if (remote) {
                remote.remove();
                remotePlayers.delete(conn.peer);
                notifyPlayersChange();
            } else if (isHost) {
                pushCountToConnections();
            }
            if (isHost) {
                broadcast({ type: "player_leave", peerId: conn.peer }, conn.peer);
            }
        });
    }

    function connectAsClient() {
        const clientPeer = new Peer();
        peer = clientPeer;

        clientPeer.on("open", () => {
            const conn = clientPeer.connect(ROOM_HOST_ID, { reliable: true });
            setupConnection(conn);
        });
    }

    function init() {
        notifyPlayersChange();
        if (typeof Peer === "undefined") return;

        const hostPeer = new Peer(ROOM_HOST_ID);
        peer = hostPeer;

        hostPeer.on("open", () => {
            isHost = true;
            notifyPlayersChange();
        });

        hostPeer.on("connection", (conn) => {
            setupConnection(conn);
        });

        hostPeer.on("error", (err) => {
            if (err.type === "unavailable-id") {
                connectAsClient();
            }
        });

        window.addEventListener("beforeunload", () => {
            broadcast({
                type: "player_leave",
                peerId: peer ? peer.id : null
            });
            if (peer) peer.destroy();
        });
    }

    let lastSent = 0;
    let lastSyncFrameTime = performance.now();
    let prevX = localPlayer.mesh.position.x;
    let prevY = localPlayer.mesh.position.y;
    let prevZ = localPlayer.mesh.position.z;
    let prevRotY = localPlayer.mesh.rotation.y;
    let prevWins = typeof getLocalWins === "function" ? getLocalWins() : 0;
    let prevIsMoving = false;
    let prevIsGrounded = true;

    function sync() {
        const now = performance.now();
        const dt = Math.min(0.05, Math.max(0.001, (now - lastSyncFrameTime) / 1000));
        lastSyncFrameTime = now;

        remotePlayers.forEach((remote) => {
            remote.updateSmooth(0.28, dt);
        });

        const x = localPlayer.mesh.position.x;
        const y = localPlayer.mesh.position.y;
        const z = localPlayer.mesh.position.z;
        const rotY = localPlayer.mesh.rotation.y;
        const wins = typeof getLocalWins === "function" ? getLocalWins() : 0;

        const moveState = typeof localPlayer.getMoveState === "function"
            ? localPlayer.getMoveState()
            : { isMoving: false, isGrounded: true, velocityY: 0 };

        const moved =
            Math.abs(x - prevX) > 0.001 ||
            Math.abs(y - prevY) > 0.001 ||
            Math.abs(z - prevZ) > 0.001 ||
            Math.abs(rotY - prevRotY) > 0.001 ||
            wins !== prevWins ||
            moveState.isMoving !== prevIsMoving ||
            moveState.isGrounded !== prevIsGrounded;

        if (moved || now - lastSent >= 100) {
            lastSent = now;
            prevX = x;
            prevY = y;
            prevZ = z;
            prevRotY = rotY;
            prevWins = wins;
            prevIsMoving = moveState.isMoving;
            prevIsGrounded = moveState.isGrounded;
            sendPlayerState();
        }
    }

    init();
    return { sync, sendChatMessage, sendMapSync, isHost: () => isHost };
}