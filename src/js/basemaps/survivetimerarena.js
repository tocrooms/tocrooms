function createSurviveTimerArena(scene) {
    const group = new THREE.Group();

    const floorMat = new THREE.MeshLambertMaterial({ color: 0x3182ce });
    const borderMat = new THREE.MeshLambertMaterial({ color: 0x2c5282 });
    const warningMat = new THREE.MeshLambertMaterial({ color: 0xecc94b });
    const goneMat = new THREE.MeshLambertMaterial({ color: 0x1a202c });
    const hazardMat = new THREE.MeshLambertMaterial({ color: 0xff3b00 });

    const arenaRadius = 38;
    const arenaY = 0;

    const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(arenaRadius + 2, arenaRadius + 2, 1.5, 32), borderMat);
    baseRing.position.set(0, arenaY - 1.2, 0);
    group.add(baseRing);

    const tiles = [];
    const cols = 7;
    const rows = 7;
    const tileSize = 9.5;
    const gap = 0.8;
    const step = tileSize + gap;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = (c - (cols - 1) / 2) * step;
            const z = (r - (rows - 1) / 2) * step;
            if (Math.hypot(x, z) > arenaRadius - tileSize * 0.45) continue;

            const mesh = new THREE.Mesh(new THREE.BoxGeometry(tileSize, 1.2, tileSize), floorMat.clone());
            mesh.position.set(x, arenaY - 0.6, z);
            group.add(mesh);

            tiles.push({
                id: tiles.length,
                x,
                z,
                halfW: tileSize / 2,
                halfD: tileSize / 2,
                topY: arenaY,
                mesh,
                state: "active",
                timer: 0
            });
        }
    }

    scene.add(group);

    const obstacles = [];
    let nextObsId = 1;
    let spawnTimer = 0;
    const spawnInterval = 26;
    const maxObstacles = 22;
    const obstacleLifetimeMs = 10 * 1000;

    function removeObstacleAt(index) {
        const ob = obstacles[index];
        scene.remove(ob.mesh);
        ob.mesh.geometry.dispose();
        obstacles.splice(index, 1);
    }

    function createObstacleMesh(radius) {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 14), hazardMat);
        scene.add(mesh);
        return mesh;
    }

    function spawnObstacleAuthoritative() {
        if (obstacles.length >= maxObstacles) return;
        const radius = 1.6 + Math.random() * 1.1;
        const mesh = createObstacleMesh(radius);
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (arenaRadius - radius - 2);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const y = 26 + Math.random() * 10;
        mesh.position.set(x, y, z);

        obstacles.push({
            id: nextObsId++,
            mesh,
            radius,
            spawnedAt: Date.now(),
            vel: new THREE.Vector3((Math.random() - 0.5) * 0.08, -0.35, (Math.random() - 0.5) * 0.08),
            targetPos: new THREE.Vector3(x, y, z)
        });
    }

    function applyTileStates(statesList) {
        if (!Array.isArray(statesList)) return;
        statesList.forEach((st) => {
            const tile = tiles[st.id];
            if (!tile) return;
            tile.state = st.state;
            tile.timer = st.timer || 0;
            if (tile.state === "warning") {
                tile.mesh.material.color.setHex(0xecc94b);
                tile.mesh.position.y = arenaY - 0.6;
            } else if (tile.state === "gone") {
                tile.mesh.material.color.setHex(0x1a202c);
                tile.mesh.position.y = arenaY - 12;
            } else {
                tile.mesh.material.color.setHex(0x3182ce);
                tile.mesh.position.y = arenaY - 0.6;
            }
        });
    }

    function getTileStatesSnapshot() {
        return tiles.map((t) => ({
            id: t.id,
            state: t.state,
            timer: t.timer
        }));
    }

    function getObstaclesSnapshot() {
        return obstacles.map((o) => ({
            id: o.id,
            radius: o.radius,
            x: o.mesh.position.x,
            y: o.mesh.position.y,
            z: o.mesh.position.z,
            vx: o.vel.x,
            vy: o.vel.y,
            vz: o.vel.z
        }));
    }

    function applyObstaclesSnapshot(snapshotList) {
        if (!Array.isArray(snapshotList)) return;
        const incomingIds = new Set(snapshotList.map((s) => s.id));

        for (let i = obstacles.length - 1; i >= 0; i--) {
            if (!incomingIds.has(obstacles[i].id)) {
                removeObstacleAt(i);
            }
        }

        snapshotList.forEach((snap) => {
            let existing = obstacles.find((o) => o.id === snap.id);
            if (!existing) {
                const mesh = createObstacleMesh(snap.radius);
                mesh.position.set(snap.x, snap.y, snap.z);
                existing = {
                    id: snap.id,
                    mesh,
                    radius: snap.radius,
                    spawnedAt: Date.now(),
                    vel: new THREE.Vector3(snap.vx || 0, snap.vy || 0, snap.vz || 0),
                    targetPos: new THREE.Vector3(snap.x, snap.y, snap.z)
                };
                obstacles.push(existing);
            } else {
                existing.targetPos.set(snap.x, snap.y, snap.z);
                existing.vel.set(snap.vx || 0, snap.vy || 0, snap.vz || 0);
            }
        });
    }

    function resetArena() {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            removeObstacleAt(i);
        }
        spawnTimer = 0;

        tiles.forEach((t) => {
            t.state = "active";
            t.timer = 0;
            t.mesh.material.color.setHex(0x3182ce);
            t.mesh.position.y = arenaY - 0.6;
        });
    }

    function checkPlayerHit(playerPos, onHit) {
        if (!playerPos) return;
        for (let i = 0; i < obstacles.length; i++) {
            const ob = obstacles[i];
            const horizDist = Math.hypot(ob.mesh.position.x - playerPos.x, ob.mesh.position.z - playerPos.z);
            if (
                horizDist < ob.radius + 0.65 &&
                ob.mesh.position.y + ob.radius > playerPos.y &&
                ob.mesh.position.y - ob.radius < playerPos.y + 4.2
            ) {
                if (typeof onHit === "function") onHit();
                break;
            }
        }
    }

    function stepObstacle(ob) {
        ob.vel.y -= 0.035;
        ob.mesh.position.add(ob.vel);

        for (let i = 0; i < tiles.length; i++) {
            const t = tiles[i];
            if (t.state === "gone") continue;
            if (
                Math.abs(ob.mesh.position.x - t.x) <= t.halfW + ob.radius &&
                Math.abs(ob.mesh.position.z - t.z) <= t.halfD + ob.radius &&
                ob.mesh.position.y - ob.radius <= t.topY &&
                ob.mesh.position.y + ob.radius >= t.topY - 1.2
            ) {
                ob.mesh.position.y = t.topY + ob.radius;
                ob.vel.y = ob.vel.y < -0.15 ? -ob.vel.y * 0.45 : 0;
                break;
            }
        }
    }

    function updateAsHost(playerPos, onHit) {
        const now = Date.now();
        for (let i = obstacles.length - 1; i >= 0; i--) {
            if (now - obstacles[i].spawnedAt >= obstacleLifetimeMs) {
                removeObstacleAt(i);
            }
        }

        spawnTimer++;
        if (spawnTimer >= spawnInterval) {
            spawnTimer = 0;
            spawnObstacleAuthoritative();
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const ob = obstacles[i];
            stepObstacle(ob);
            if (ob.mesh.position.y < -25) {
                removeObstacleAt(i);
            }
        }

        if (Math.random() < 0.04) {
            const activeList = tiles.filter((t) => t.state === "active");
            if (activeList.length > 4) {
                const chosen = activeList[Math.floor(Math.random() * activeList.length)];
                chosen.state = "warning";
                chosen.timer = 75;
                chosen.mesh.material.color.setHex(0xecc94b);
            }
        }

        for (let i = 0; i < tiles.length; i++) {
            const t = tiles[i];
            if (t.state === "warning") {
                t.timer--;
                if (t.timer <= 0) {
                    t.state = "gone";
                    t.timer = 240;
                    t.mesh.material.color.setHex(0x1a202c);
                    t.mesh.position.y = arenaY - 12;
                }
            } else if (t.state === "gone") {
                t.timer--;
                if (t.timer <= 0) {
                    t.state = "active";
                    t.timer = 0;
                    t.mesh.material.color.setHex(0x3182ce);
                    t.mesh.position.y = arenaY - 0.6;
                }
            }
        }

        checkPlayerHit(playerPos, onHit);
    }

    function updateAsClient(playerPos, onHit) {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const ob = obstacles[i];
            stepObstacle(ob);
            ob.mesh.position.lerp(ob.targetPos, 0.2);
            if (ob.mesh.position.y < -25) {
                removeObstacleAt(i);
            }
        }
        checkPlayerHit(playerPos, onHit);
    }

    function checkFloorCollision(pos, velocityY) {
        const margin = 0.45;
        for (let i = 0; i < tiles.length; i++) {
            const t = tiles[i];
            if (t.state === "gone") continue;
            if (
                pos.x >= t.x - t.halfW - margin &&
                pos.x <= t.x + t.halfW + margin &&
                pos.z >= t.z - t.halfD - margin &&
                pos.z <= t.z + t.halfD + margin
            ) {
                const prevY = pos.y - velocityY;
                if (prevY >= t.topY - 0.5 && pos.y <= t.topY + 0.4 && velocityY <= 0.15) {
                    return { grounded: true, y: t.topY };
                }
            }
        }
        return { grounded: false, y: pos.y };
    }

    return {
        arenaRadius,
        resetArena,
        getTileStatesSnapshot,
        applyTileStates,
        getObstaclesSnapshot,
        applyObstaclesSnapshot,
        updateAsHost,
        updateAsClient,
        checkFloorCollision
    };
}

const STORAGE_KEY = "tocrooms_survivetimer_data";
let stats = { wins: 0 };
try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.wins === "number") stats = saved;
} catch (e) {}

function getLocalWins() {
    return stats.wins;
}

function saveWins() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch (e) {}
}

let winsSprite = null;

function createWinsSprite() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 96;
    const ctx = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(4.5, 1.7, 1);
    sprite.position.set(0, 7.6, 0);

    function draw(w) {
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.font = "bold 42px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.strokeText("Wins: " + w, 128, 60);
        ctx.fillText("Wins: " + w, 128, 60);
        tex.needsUpdate = true;
    }

    draw(stats.wins);
    return { sprite, draw };
}

function adjustNameTag(mesh) {
    if (!mesh) return;
    mesh.traverse((child) => {
        if (child.isSprite && child !== (winsSprite && winsSprite.sprite)) {
            child.position.y = 4.6;
        }
    });
}

function updatePlayerListUI(players) {
    const countEl = document.getElementById("playerCount");
    const listEl = document.getElementById("playerList");
    if (!countEl || !listEl) return;

    countEl.textContent = players.length;
    listEl.innerHTML = "";
    players.forEach((p) => {
        const li = document.createElement("li");
        li.textContent = p.isLocal ? p.username + " (You)" : p.username;
        if (p.isLocal) li.classList.add("local-player");
        listEl.appendChild(li);
    });
}

const hud = document.createElement("div");
hud.style.cssText = "position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#222;color:#fff;padding:4px 10px;font-family:Arial;font-size:13px;z-index:999;";
document.body.appendChild(hud);

const canvas = document.getElementById("gameCanvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x63b3ed);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 800);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const sun = new THREE.DirectionalLight(0xffffff, 0.7);
sun.position.set(40, 100, 50);
scene.add(sun);

const arenaMap = createSurviveTimerArena(scene);
const player = createPlayer(scene);

if (player && player.mesh) {
    winsSprite = createWinsSprite();
    player.mesh.add(winsSprite.sprite);
    adjustNameTag(player.mesh);
}

const cameraController = createCameraController(camera);

const ROUND_MS = 45 * 1000;
let roundEndTime = Date.now() + ROUND_MS;
let eliminatedThisRound = false;
let winLock = false;
let lastBroadcast = 0;

function respawnPlayer(resetElimination = true) {
    if (!player || !player.mesh) return;
    if (resetElimination) eliminatedThisRound = false;
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 14;
    player.mesh.position.set(Math.cos(angle) * r, 1.5, Math.sin(angle) * r);
    if (typeof player.setVelocityY === "function") player.setVelocityY(0);
    if (typeof player.setIsGrounded === "function") player.setIsGrounded(true);
}

function handleEliminated() {
    if (eliminatedThisRound) return;
    eliminatedThisRound = true;
    respawnPlayer(false);
}

let multiplayer = null;

function broadcastRoundState(forceResetPlayers = false) {
    if (!multiplayer || typeof multiplayer.sendMapSync !== "function") return;
    multiplayer.sendMapSync({
        roundEndTime,
        tiles: arenaMap.getTileStatesSnapshot(),
        obstacles: arenaMap.getObstaclesSnapshot(),
        forceResetPlayers
    });
}

function handleMapSync(data) {
    if (!data) return;

    if (typeof data.roundEndTime === "number") {
        roundEndTime = data.roundEndTime;
        updateHud();
    }

    if (Array.isArray(data.tiles)) {
        arenaMap.applyTileStates(data.tiles);
    }

    if (Array.isArray(data.obstacles)) {
        arenaMap.applyObstaclesSnapshot(data.obstacles);
    }

    if (data.forceResetPlayers) {
        respawnPlayer(true);
    }
}

multiplayer = createMultiplayer(scene, player, updatePlayerListUI, "survivetimer", handleMapSync);

function handleWin() {
    if (winLock || eliminatedThisRound) return;
    winLock = true;
    stats.wins += 1;
    saveWins();
    if (winsSprite) winsSprite.draw(stats.wins);
    if (multiplayer && typeof multiplayer.sync === "function") {
        multiplayer.sync();
    }
    setTimeout(() => { winLock = false; }, 1000);
}

function startNewRound() {
    if (!multiplayer || typeof multiplayer.isHost !== "function" || !multiplayer.isHost()) return;
    roundEndTime = Date.now() + ROUND_MS;
    arenaMap.resetArena();
    respawnPlayer(true);
    broadcastRoundState(true);
    updateHud();
}

function updateHud() {
    const sec = Math.max(0, Math.ceil((roundEndTime - Date.now()) / 1000));
    const statusText = eliminatedThisRound ? " | Eliminado" : " | Vivo";
    hud.textContent = `Tempo: ${sec}s${statusText}`;
}

setInterval(() => {
    const isHostNow = multiplayer && typeof multiplayer.isHost === "function" ? multiplayer.isHost() : true;
    if (Date.now() >= roundEndTime) {
        if (!eliminatedThisRound) {
            handleWin();
        }
        if (isHostNow) {
            startNewRound();
        } else {
            roundEndTime = Date.now() + ROUND_MS;
            respawnPlayer(true);
        }
    }
    updateHud();
}, 250);
updateHud();

function checkCollisions(pos, velocityY = 0) {
    const distFromCenter = Math.hypot(pos.x, pos.z);
    const maxR = arenaMap.arenaRadius + 1.2;
    if (distFromCenter > maxR) {
        const scale = maxR / distFromCenter;
        pos.x *= scale;
        pos.z *= scale;
    }

    return arenaMap.checkFloorCollision(pos, velocityY);
}

function animate() {
    requestAnimationFrame(animate);

    const isHostNow = multiplayer && typeof multiplayer.isHost === "function" ? multiplayer.isHost() : true;

    if (player && player.mesh) {
        if (isHostNow) {
            arenaMap.updateAsHost(player.mesh.position, handleEliminated);
            const now = performance.now();
            if (now - lastBroadcast >= 80) {
                lastBroadcast = now;
                broadcastRoundState(false);
            }
        } else {
            arenaMap.updateAsClient(player.mesh.position, handleEliminated);
        }

        player.update(cameraController.getYaw(), checkCollisions);
        adjustNameTag(player.mesh);

        if (player.mesh.position.y < -15) {
            handleEliminated();
        }

        cameraController.update(player.mesh.position);
    }

    if (multiplayer && typeof multiplayer.sync === "function") multiplayer.sync();
    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

respawnPlayer(true);
animate();