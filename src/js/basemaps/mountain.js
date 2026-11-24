function createLavaMountainMap(scene) {
    const group = new THREE.Group();

    const greenMat = new THREE.MeshLambertMaterial({ color: 0x2e8b2e });
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x5c5c5c });
    const trimMat = new THREE.MeshLambertMaterial({ color: 0x454545 });
    const coverMat = new THREE.MeshLambertMaterial({ color: 0x8a8a8a });
    const coverTopMat = new THREE.MeshLambertMaterial({ color: 0xa3a3a3 });
    const goalMat = new THREE.MeshLambertMaterial({ color: 0xf5d033 });
    const lavaMat = new THREE.MeshLambertMaterial({ color: 0xff3b00 });

    const rampWidth = 36;
    const rampHorizontalLength = 260;
    const rampHeight = 68;
    const slopeAngle = Math.atan2(rampHeight, rampHorizontalLength);
    const rampTrueLength = Math.hypot(rampHorizontalLength, rampHeight);

    const startLength = 42;
    const startMesh = new THREE.Mesh(new THREE.BoxGeometry(rampWidth, 2, startLength), greenMat);
    startMesh.position.set(0, -1, 6);
    group.add(startMesh);

    const rampStartZ = -startLength / 2 + 6;
    const rampEndZ = rampStartZ - rampHorizontalLength;
    const rampCenterZ = (rampStartZ + rampEndZ) / 2;

    const rampMesh = new THREE.Mesh(new THREE.BoxGeometry(rampWidth, 4, rampTrueLength), greenMat);
    rampMesh.position.set(0, rampHeight / 2 - 2 * Math.cos(slopeAngle), rampCenterZ);
    rampMesh.rotation.x = slopeAngle;
    group.add(rampMesh);

    const sideWallHeight = 22 * 0.9;
    const cornerWallHeight = 22 * 1.15;
    const wallThickness = 3.5;
    const totalWallLen = startLength + rampTrueLength + 40;
    const sideWallGeo = new THREE.BoxGeometry(wallThickness, sideWallHeight, totalWallLen);
    const railGeo = new THREE.BoxGeometry(wallThickness + 0.8, 1.2, totalWallLen);

    const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
    leftWall.position.set(-(rampWidth / 2 + wallThickness / 2), rampHeight / 2 + sideWallHeight / 2 - 3, rampCenterZ);
    leftWall.rotation.x = slopeAngle * 0.85;
    group.add(leftWall);

    const leftRail = new THREE.Mesh(railGeo, trimMat);
    leftRail.position.set(-(rampWidth / 2 + wallThickness / 2), rampHeight / 2 + sideWallHeight - 2.4, rampCenterZ);
    leftRail.rotation.x = slopeAngle * 0.85;
    group.add(leftRail);

    const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
    rightWall.position.set(rampWidth / 2 + wallThickness / 2, rampHeight / 2 + sideWallHeight / 2 - 3, rampCenterZ);
    rightWall.rotation.x = slopeAngle * 0.85;
    group.add(rightWall);

    const rightRail = new THREE.Mesh(railGeo, trimMat);
    rightRail.position.set(rampWidth / 2 + wallThickness / 2, rampHeight / 2 + sideWallHeight - 2.4, rampCenterZ);
    rightRail.rotation.x = slopeAngle * 0.85;
    group.add(rightRail);

    const cornerGeo = new THREE.BoxGeometry(wallThickness * 1.35, cornerWallHeight, wallThickness * 1.35);
    const cornerCapGeo = new THREE.BoxGeometry(wallThickness * 1.6, 1.3, wallThickness * 1.6);
    [-(rampWidth / 2 + wallThickness / 2), rampWidth / 2 + wallThickness / 2].forEach((cx) => {
        const frontZ = 6 + startLength / 2;
        const frontCorner = new THREE.Mesh(cornerGeo, wallMat);
        frontCorner.position.set(cx, cornerWallHeight / 2 - 1, frontZ);
        group.add(frontCorner);

        const frontCap = new THREE.Mesh(cornerCapGeo, trimMat);
        frontCap.position.set(cx, cornerWallHeight - 0.5, frontZ);
        group.add(frontCap);

        const backZ = rampEndZ - 28;
        const backCorner = new THREE.Mesh(cornerGeo, wallMat);
        backCorner.position.set(cx, rampHeight + cornerWallHeight / 2 - 1, backZ);
        group.add(backCorner);

        const backCap = new THREE.Mesh(cornerCapGeo, trimMat);
        backCap.position.set(cx, rampHeight + cornerWallHeight - 0.5, backZ);
        group.add(backCap);
    });

    const topLength = 28;
    const topEndZ = rampEndZ - topLength;

    const topMesh = new THREE.Mesh(new THREE.BoxGeometry(rampWidth, 2, topLength), greenMat);
    topMesh.position.set(0, rampHeight - 1, rampEndZ - topLength / 2);
    group.add(topMesh);

    const goalMesh = new THREE.Mesh(new THREE.BoxGeometry(rampWidth - 2, 0.4, 6), goalMat);
    goalMesh.position.set(0, rampHeight + 0.2, rampEndZ - topLength / 2);
    group.add(goalMesh);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(rampWidth + wallThickness * 2, sideWallHeight, 2), wallMat);
    backWall.position.set(0, rampHeight + sideWallHeight / 2 - 1, topEndZ - 1);
    group.add(backWall);

    function getSurfaceY(z) {
        if (z >= rampStartZ && z <= startLength / 2 + 6) return 0;
        if (z < rampStartZ && z >= rampEndZ) return ((rampStartZ - z) / rampHorizontalLength) * rampHeight;
        if (z < rampEndZ && z >= topEndZ) return rampHeight;
        return -999;
    }

    const coverWalls = [];
    const coverW = 9.0;
    const coverH = 6.6;
    const coverD = 1.8;
    const coverGeo = new THREE.BoxGeometry(coverW, coverH, coverD);
    const coverTopGeo = new THREE.BoxGeometry(coverW + 0.6, 0.7, coverD + 0.5);

    function clearCoverWalls() {
        for (let i = 0; i < coverWalls.length; i++) {
            group.remove(coverWalls[i].group);
            coverWalls[i].bodyMesh.geometry.dispose();
            coverWalls[i].topMesh.geometry.dispose();
        }
        coverWalls.length = 0;
    }

    function applyCoverWalls(layoutList) {
        clearCoverWalls();
        if (!Array.isArray(layoutList)) return;

        layoutList.forEach((item) => {
            const wallGroup = new THREE.Group();
            const bodyMesh = new THREE.Mesh(coverGeo, coverMat);
            bodyMesh.position.set(0, coverH / 2, 0);
            wallGroup.add(bodyMesh);

            const topMesh = new THREE.Mesh(coverTopGeo, coverTopMat);
            topMesh.position.set(0, coverH + 0.35, 0);
            wallGroup.add(topMesh);

            wallGroup.position.set(item.x, item.baseY, item.z);
            group.add(wallGroup);

            coverWalls.push({
                x: item.x,
                z: item.z,
                baseY: item.baseY,
                halfW: coverW / 2,
                halfD: coverD / 2,
                height: coverH + 0.7,
                group: wallGroup,
                bodyMesh,
                topMesh
            });
        });
    }

    function generateCoverLayout() {
        const spots = [0.14, 0.25, 0.36, 0.48, 0.60, 0.72, 0.84];
        const lanes = [-10.5, -4.5, 4.5, 10.5];
        const layout = [];

        spots.forEach((baseP, idx) => {
            const p = Math.max(0.10, Math.min(0.90, baseP + (Math.random() - 0.5) * 0.04));
            const z = rampStartZ - p * rampHorizontalLength;
            const y = getSurfaceY(z);
            const x = lanes[(idx + Math.floor(Math.random() * lanes.length)) % lanes.length];
            layout.push({ x, z, baseY: y });
        });

        applyCoverWalls(layout);
        return layout;
    }

    const initialLayout = generateCoverLayout();
    scene.add(group);

    const balls = [];
    let nextBallId = 1;
    let spawnTimer = 0;
    const spawnInterval = 29;
    const maxBalls = 42;
    const spawnSafeZ = rampStartZ - 3;
    const ballLifetimeMs = 15 * 1000;

    function removeBallAt(index) {
        const b = balls[index];
        scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        balls.splice(index, 1);
    }

    function createBallMesh(radius) {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), lavaMat);
        scene.add(mesh);
        return mesh;
    }

    function spawnBallAuthoritative() {
        if (balls.length >= maxBalls) return;
        const radius = 2.0 + Math.random() * 1.4;
        const mesh = createBallMesh(radius);
        const x = (Math.random() - 0.5) * (rampWidth - radius * 2.4);
        const y = rampHeight + radius + 3;
        const z = rampEndZ + 4;
        mesh.position.set(x, y, z);

        balls.push({
            id: nextBallId++,
            mesh,
            radius,
            spawnedAt: Date.now(),
            vel: new THREE.Vector3((Math.random() - 0.5) * 0.14, 0, 0.42 + Math.random() * 0.24),
            targetPos: new THREE.Vector3(x, y, z)
        });
    }

    function getBallsSnapshot() {
        return balls.map((b) => ({
            id: b.id,
            radius: b.radius,
            x: b.mesh.position.x,
            y: b.mesh.position.y,
            z: b.mesh.position.z,
            vx: b.vel.x,
            vy: b.vel.y,
            vz: b.vel.z
        }));
    }

    function applyBallsSnapshot(snapshotList) {
        if (!Array.isArray(snapshotList)) return;
        const incomingIds = new Set(snapshotList.map((s) => s.id));

        for (let i = balls.length - 1; i >= 0; i--) {
            if (!incomingIds.has(balls[i].id)) {
                removeBallAt(i);
            }
        }

        snapshotList.forEach((snap) => {
            let existing = balls.find((b) => b.id === snap.id);
            if (!existing) {
                const mesh = createBallMesh(snap.radius);
                mesh.position.set(snap.x, snap.y, snap.z);
                existing = {
                    id: snap.id,
                    mesh,
                    radius: snap.radius,
                    spawnedAt: Date.now(),
                    vel: new THREE.Vector3(snap.vx || 0, snap.vy || 0, snap.vz || 0),
                    targetPos: new THREE.Vector3(snap.x, snap.y, snap.z)
                };
                balls.push(existing);
            } else {
                existing.targetPos.set(snap.x, snap.y, snap.z);
                existing.vel.set(snap.vx || 0, snap.vy || 0, snap.vz || 0);
            }
        });
    }

    function checkPlayerHit(playerPos, onHit) {
        if (!playerPos) return;
        for (let i = 0; i < balls.length; i++) {
            const b = balls[i];
            const horizDist = Math.hypot(b.mesh.position.x - playerPos.x, b.mesh.position.z - playerPos.z);
            if (horizDist < b.radius + 0.65 && b.mesh.position.y + b.radius > playerPos.y && b.mesh.position.y - b.radius < playerPos.y + 4.2) {
                if (typeof onHit === "function") onHit();
                break;
            }
        }
    }

    function updateAsHost(playerPos, onHit) {
        const now = Date.now();
        for (let i = balls.length - 1; i >= 0; i--) {
            if (now - balls[i].spawnedAt >= ballLifetimeMs) {
                removeBallAt(i);
            }
        }

        spawnTimer++;
        if (spawnTimer >= spawnInterval) {
            spawnTimer = 0;
            spawnBallAuthoritative();
            spawnBallAuthoritative();
            spawnBallAuthoritative();
        }

        const halfW = rampWidth / 2;

        for (let i = balls.length - 1; i >= 0; i--) {
            const b = balls[i];
            b.vel.y -= 0.032;
            b.vel.z += Math.sin(slopeAngle) * 0.034;
            b.mesh.position.add(b.vel);

            if (b.mesh.position.x - b.radius < -halfW) {
                b.mesh.position.x = -halfW + b.radius;
                b.vel.x = Math.abs(b.vel.x) * 0.85;
            } else if (b.mesh.position.x + b.radius > halfW) {
                b.mesh.position.x = halfW - b.radius;
                b.vel.x = -Math.abs(b.vel.x) * 0.85;
            }

            for (let w = 0; w < coverWalls.length; w++) {
                const cw = coverWalls[w];
                const cx = Math.max(cw.x - cw.halfW, Math.min(b.mesh.position.x, cw.x + cw.halfW));
                const cz = Math.max(cw.z - cw.halfD, Math.min(b.mesh.position.z, cw.z + cw.halfD));
                const dx = b.mesh.position.x - cx;
                const dz = b.mesh.position.z - cz;
                const d2 = dx * dx + dz * dz;

                if (d2 < b.radius * b.radius && b.mesh.position.y - b.radius < cw.baseY + cw.height && b.mesh.position.y + b.radius > cw.baseY) {
                    const dist = Math.sqrt(d2) || 0.001;
                    b.mesh.position.x += (dx / dist) * (b.radius - dist);
                    b.mesh.position.z += (dz / dist) * (b.radius - dist);
                    b.vel.x = (dx / dist) * Math.max(0.25, Math.abs(b.vel.x) * 0.7);
                    b.vel.z = (dz / dist) * Math.max(0.25, Math.abs(b.vel.z) * 0.65);
                }
            }

            const floorY = getSurfaceY(b.mesh.position.z);
            if (floorY > -500 && b.mesh.position.y - b.radius <= floorY) {
                b.mesh.position.y = floorY + b.radius;
                b.vel.y = b.vel.y < -0.18 ? -b.vel.y * 0.45 : 0;
                b.vel.z = Math.min(b.vel.z * 0.996, 2.2);
                b.vel.x *= 0.985;
            }

            if (b.mesh.position.z - b.radius >= spawnSafeZ || b.mesh.position.y < -30) {
                removeBallAt(i);
            }
        }

        checkPlayerHit(playerPos, onHit);
    }

    function updateAsClient(playerPos, onHit) {
        for (let i = 0; i < balls.length; i++) {
            const b = balls[i];
            b.mesh.position.lerp(b.targetPos, 0.35);
        }
        checkPlayerHit(playerPos, onHit);
    }

    return {
        rampWidth,
        rampEndZ,
        topEndZ,
        rampHeight,
        coverWalls,
        initialLayout,
        getSurfaceY,
        applyCoverWalls,
        generateCoverLayout,
        getBallsSnapshot,
        applyBallsSnapshot,
        updateAsHost,
        updateAsClient
    };
}

const STORAGE_KEY = "tocrooms_lavamountain_data";
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

const lavaMap = createLavaMountainMap(scene);
const player = createPlayer(scene);

if (player && player.mesh) {
    winsSprite = createWinsSprite();
    player.mesh.add(winsSprite.sprite);
    adjustNameTag(player.mesh);
}

const cameraController = createCameraController(camera);

const RESET_MS = 3 * 60 * 1000;
let nextReset = Date.now() + RESET_MS;
let currentLayout = lavaMap.initialLayout;
let winLock = false;
let lastBallBroadcast = 0;

function respawnPlayer() {
    if (!player || !player.mesh) return;
    player.mesh.position.set(0, 1, 14);
    if (typeof player.setVelocityY === "function") player.setVelocityY(0);
    if (typeof player.setIsGrounded === "function") player.setIsGrounded(true);
}

let multiplayer = null;

function broadcastFullMapState(forceResetPlayers = false) {
    if (!multiplayer || typeof multiplayer.sendMapSync !== "function") return;
    multiplayer.sendMapSync({
        nextReset,
        coverLayout: currentLayout,
        balls: lavaMap.getBallsSnapshot(),
        forceResetPlayers
    });
}

function handleMapSync(data) {
    if (!data) return;

    if (typeof data.nextReset === "number") {
        nextReset = data.nextReset;
        updateHud();
    }

    if (Array.isArray(data.coverLayout)) {
        currentLayout = data.coverLayout;
        lavaMap.applyCoverWalls(currentLayout);
    }

    if (Array.isArray(data.balls)) {
        lavaMap.applyBallsSnapshot(data.balls);
    }

    if (data.forceResetPlayers) {
        respawnPlayer();
    }
}

multiplayer = createMultiplayer(scene, player, updatePlayerListUI, "lavamountain", handleMapSync);

function resetCycle() {
    if (!multiplayer || typeof multiplayer.isHost !== "function" || !multiplayer.isHost()) return;
    nextReset = Date.now() + RESET_MS;
    currentLayout = lavaMap.generateCoverLayout();
    respawnPlayer();
    broadcastFullMapState(true);
    updateHud();
}

function updateHud() {
    const sec = Math.max(0, Math.ceil((nextReset - Date.now()) / 1000));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    hud.textContent = `Reset: ${m}:${s < 10 ? "0" : ""}${s}`;
}

setInterval(resetCycle, RESET_MS);
setInterval(updateHud, 500);
updateHud();

function handleWin() {
    if (winLock) return;
    winLock = true;
    stats.wins += 1;
    saveWins();
    if (winsSprite) winsSprite.draw(stats.wins);
    respawnPlayer();
    if (multiplayer && typeof multiplayer.sync === "function") {
        multiplayer.sync();
    }
    setTimeout(() => { winLock = false; }, 1000);
}

function checkCollisions(pos, velocityY = 0) {
    const halfW = lavaMap.rampWidth / 2 - 0.5;
    if (pos.x < -halfW) pos.x = -halfW;
    if (pos.x > halfW) pos.x = halfW;
    if (pos.z < lavaMap.topEndZ + 0.6) pos.z = lavaMap.topEndZ + 0.6;

    for (let w = 0; w < lavaMap.coverWalls.length; w++) {
        const cw = lavaMap.coverWalls[w];
        if (pos.y < cw.baseY + cw.height - 0.2 && pos.y + 1.8 > cw.baseY) {
            const minX = cw.x - cw.halfW - 0.5;
            const maxX = cw.x + cw.halfW + 0.5;
            const minZ = cw.z - cw.halfD - 0.5;
            const maxZ = cw.z + cw.halfD + 0.5;
            if (pos.x > minX && pos.x < maxX && pos.z > minZ && pos.z < maxZ) {
                const pens = [
                    { d: Math.abs(pos.x - minX), fn: () => { pos.x = minX; } },
                    { d: Math.abs(maxX - pos.x), fn: () => { pos.x = maxX; } },
                    { d: Math.abs(maxZ - pos.z), fn: () => { pos.z = maxZ; } },
                    { d: Math.abs(pos.z - minZ), fn: () => { pos.z = minZ; } }
                ];
                pens.sort((a, b) => a.d - b.d)[0].fn();
            }
        }
    }

    const surfaceY = lavaMap.getSurfaceY(pos.z);
    if (surfaceY > -500) {
        if (pos.z <= lavaMap.rampEndZ - 2 && pos.y >= lavaMap.rampHeight - 1) {
            handleWin();
            return { grounded: true, y: 0 };
        }
        if (pos.y <= surfaceY + 0.65 && velocityY <= 0.15) {
            return { grounded: true, y: surfaceY };
        }
    }

    return { grounded: false, y: pos.y };
}

function animate() {
    requestAnimationFrame(animate);

    const isHostNow = multiplayer && typeof multiplayer.isHost === "function" ? multiplayer.isHost() : true;

    if (player && player.mesh) {
        if (isHostNow) {
            lavaMap.updateAsHost(player.mesh.position, respawnPlayer);
            const now = performance.now();
            if (now - lastBallBroadcast >= 80) {
                lastBallBroadcast = now;
                broadcastFullMapState(false);
            }
        } else {
            lavaMap.updateAsClient(player.mesh.position, respawnPlayer);
        }

        player.update(cameraController.getYaw(), checkCollisions);
        adjustNameTag(player.mesh);
        if (player.mesh.position.y < -15) respawnPlayer();
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

respawnPlayer();
animate();