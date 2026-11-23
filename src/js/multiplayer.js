function createMultiplayer(scene, localPlayer, onPlayersChange, roomId = "default") {
    const ROOM_HOST_ID = "tocrooms-" + roomId + "-host-v1";
    const remotePlayers = new Map();
    const connections = new Set();
    let peer = null;
    let isHost = false;

    function notifyPlayersChange() {
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
        const payload = {
            type: "player_state",
            username: localPlayer.username,
            colors: typeof getPlayerColors === "function" ? getPlayerColors() : null,
            x: localPlayer.mesh.position.x,
            y: localPlayer.mesh.position.y,
            z: localPlayer.mesh.position.z,
            rotY: localPlayer.mesh.rotation.y
        };

        if (targetConn) {
            if (targetConn.open) targetConn.send(payload);
        } else {
            broadcast(payload);
        }
    }

    function handleMessage(fromPeerId, data) {
        if (!data || !data.type) return;

        if (data.type === "player_state") {
            const senderId = data.peerId || fromPeerId;
            let remote = remotePlayers.get(senderId);

            if (!remote) {
                remote = createRemotePlayer(scene, data.username, data.colors);
                remote.username = data.username || "Guest";
                remotePlayers.set(senderId, remote);
                notifyPlayersChange();
            } else if (data.username && remote.username !== data.username) {
                remote.username = data.username;
                notifyPlayersChange();
            }

            remote.setState(data);

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
    let prevX = localPlayer.mesh.position.x;
    let prevY = localPlayer.mesh.position.y;
    let prevZ = localPlayer.mesh.position.z;
    let prevRotY = localPlayer.mesh.rotation.y;

    function sync() {
        remotePlayers.forEach((remote) => {
            remote.updateSmooth(0.28);
        });

        const x = localPlayer.mesh.position.x;
        const y = localPlayer.mesh.position.y;
        const z = localPlayer.mesh.position.z;
        const rotY = localPlayer.mesh.rotation.y;

        const moved =
            Math.abs(x - prevX) > 0.001 ||
            Math.abs(y - prevY) > 0.001 ||
            Math.abs(z - prevZ) > 0.001 ||
            Math.abs(rotY - prevRotY) > 0.001;

        const now = performance.now();
        if (moved && now - lastSent >= 16) {
            lastSent = now;
            prevX = x;
            prevY = y;
            prevZ = z;
            prevRotY = rotY;
            sendPlayerState();
        }
    }
    init();
    return { sync };
}