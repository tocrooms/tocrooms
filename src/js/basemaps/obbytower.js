function createObbyTowerMap(scene, variant = 1) {
    const group = new THREE.Group();
    const towerRadius = 24;
    const wallSegments = 16;
    const floorHeight = 35;
    const lobbyFloorMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
    const lobbyPadMat = new THREE.MeshLambertMaterial({ color: 0x059669 });
    const staticMat = new THREE.MeshLambertMaterial({ color: 0x2563eb });
    const rotatingMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const movingMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
    const endMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f });
    const platforms = [];
    const rotatingPlatforms = [];
    const movingPlatforms = [];
    const killObjects = [];

    const lobbyFloor = new THREE.Mesh(
        new THREE.CylinderGeometry(towerRadius, towerRadius, 2, wallSegments),
        lobbyFloorMat
    );
    lobbyFloor.position.set(0, -1, 0);
    lobbyFloor.updateMatrixWorld();
    group.add(lobbyFloor);
    platforms.push({
        mesh: lobbyFloor,
        box: new THREE.Box3().setFromObject(lobbyFloor),
        topY: 0,
        isEnd: false,
        deltaX: 0,
        deltaY: 0,
        deltaZ: 0
    });

    const spawnPad = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 10), lobbyPadMat);
    spawnPad.position.set(0, 0.2, 0);
    spawnPad.updateMatrixWorld();
    group.add(spawnPad);
    platforms.push({
        mesh: spawnPad,
        box: new THREE.Box3().setFromObject(spawnPad),
        topY: 0.4,
        isEnd: false,
        deltaX: 0,
        deltaY: 0,
        deltaZ: 0
    });

    const floorColors = variant === 2
        ? [0x3b0764, 0x2e1065, 0x1e1b4b, 0x172554]
        : (variant === 3
            ? [0x7f1d1d, 0x581c87, 0x312e81, 0x1e1b4b]
            : [0x0f172a, 0x064e3b, 0x713f12, 0x831843]);

    floorColors.forEach((color, index) => {
        const wallMat = new THREE.MeshLambertMaterial({ color, side: THREE.BackSide });
        const wallMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(towerRadius, towerRadius, floorHeight, wallSegments, 1, true),
            wallMat
        );
        wallMesh.position.set(0, index * floorHeight + floorHeight / 2, 0);
        group.add(wallMesh);
    });

    function addStatic(x, y, z, w, h, d, isEnd = false) {
        const mat = isEnd ? endMat : staticMat;
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.set(x, y, z);
        mesh.updateMatrixWorld();
        group.add(mesh);

        const obj = {
            mesh,
            box: new THREE.Box3().setFromObject(mesh),
            topY: y + h / 2,
            isEnd,
            deltaX: 0,
            deltaY: 0,
            deltaZ: 0
        };
        platforms.push(obj);
        return obj;
    }

    function addRotating(x, y, z, w, h, d, angularSpeed) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), rotatingMat);
        mesh.position.set(x, y, z);
        mesh.updateMatrixWorld();
        group.add(mesh);

        const obj = {
            mesh,
            box: new THREE.Box3().setFromObject(mesh),
            topY: y + h / 2,
            isEnd: false,
            angularSpeed,
            deltaX: 0,
            deltaY: 0,
            deltaZ: 0
        };
        platforms.push(obj);
        rotatingPlatforms.push(obj);
        return obj;
    }

    function addMoving(x, y, z, w, h, d, rangeX, rangeY, rangeZ, speed, phase = 0) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), movingMat);
        mesh.position.set(x, y, z);
        mesh.updateMatrixWorld();
        group.add(mesh);

        const obj = {
            mesh,
            box: new THREE.Box3().setFromObject(mesh),
            topY: y + h / 2,
            isEnd: false,
            baseX: x,
            baseY: y,
            baseZ: z,
            rangeX,
            rangeY,
            rangeZ,
            speed,
            phase,
            deltaX: 0,
            deltaY: 0,
            deltaZ: 0
        };
        platforms.push(obj);
        movingPlatforms.push(obj);
        return obj;
    }

    if (variant === 1) {
        addStatic(0, 4, -13, 8, 1, 8);
        addMoving(11, 8, -7, 7, 1, 7, 0, 0, 6, 1.8, 0);
        addStatic(11, 13, 7, 7, 1, 7);
        addRotating(0, 18, 12, 16, 1, 3, 1.4);
        addMoving(-11, 23, 6, 7, 1, 7, 6, 0, 0, 1.9, 1.2);
        addStatic(0, 29, 0, 12, 1, 12);

        addMoving(0, 35, 13, 7, 1, 7, 11, 0, 0, 2.1, 0);
        addStatic(13, 41, 0, 7, 1, 7);
        addMoving(0, 47, -13, 7, 1, 7, 11, 0, 0, 2.1, Math.PI);
        addStatic(-13, 53, 0, 7, 1, 7);
        addStatic(0, 59, 0, 12, 1, 12);

        addMoving(-9, 65, -9, 6, 1, 6, 0, 4, 0, 2.2, 0);
        addRotating(0, 72, 0, 18, 1, 3, -1.6);
        addMoving(9, 79, 9, 6, 1, 6, 0, 4, 0, 2.2, Math.PI);
        addStatic(0, 86, 0, 12, 1, 12);

        addMoving(0, 92, 11, 6, 1, 6, 9, 0, 0, 2.4, 0.5);
        addRotating(0, 99, 0, 16, 1, 3, 1.9);
        addMoving(0, 106, -11, 6, 1, 6, 9, 0, 0, 2.4, 3.6);
        addStatic(0, 115, 0, 14, 1.5, 14, true);

    } else if (variant === 2) {
        addMoving(-13, 4, 0, 7, 1, 7, 0, 0, 9, 2.0, 0);
        addStatic(0, 9, -13, 7, 1, 7);
        addMoving(13, 14, 0, 7, 1, 7, 0, 0, 9, 2.0, Math.PI);
        addStatic(0, 19, 13, 7, 1, 7);
        addRotating(0, 24, 0, 18, 1, 3, 1.7);
        addStatic(0, 30, 0, 12, 1, 12);

        addMoving(-10, 36, -10, 6, 1, 6, 7, 0, 7, 2.2, 0);
        addMoving(10, 43, 10, 6, 1, 6, 7, 0, 7, 2.2, Math.PI);
        addStatic(0, 50, 0, 10, 1, 10);

        addStatic(-13, 56, 8, 6, 1, 6);
        addMoving(0, 62, 0, 6, 1, 6, 12, 0, 0, 2.5, 0);
        addStatic(13, 68, -8, 6, 1, 6);
        addRotating(0, 75, 0, 18, 1, 3, -2.0);
        addStatic(0, 82, 0, 12, 1, 12);

        addMoving(0, 89, 12, 6, 1, 6, 0, 3.5, 6, 2.4, 0);
        addMoving(0, 98, -12, 6, 1, 6, 0, 3.5, 6, 2.4, Math.PI);
        addRotating(0, 106, 0, 16, 1, 3, 2.2);
        addStatic(0, 115, 0, 14, 1.5, 14, true);

    } else {
        addStatic(0, 5, -11, 7, 1, 7);
        addMoving(11, 11, 0, 6, 1, 6, 0, 4.5, 0, 2.4, 0);
        addRotating(0, 18, 11, 16, 1, 3, -2.1);
        addMoving(-11, 25, 0, 6, 1, 6, 0, 4.5, 0, 2.4, Math.PI);
        addStatic(0, 32, 0, 11, 1, 11);

        addMoving(0, 39, 13, 5.5, 1, 5.5, 12, 0, 0, 2.7, 0);
        addMoving(0, 46, -13, 5.5, 1, 5.5, 12, 0, 0, 2.7, Math.PI);
        addRotating(0, 53, 0, 19, 1, 3, 2.4);
        addStatic(0, 61, 0, 10, 1, 10);

        addMoving(-11, 68, -11, 5.5, 1, 5.5, 6, 3, 0, 2.8, 0);
        addStatic(11, 75, -11, 5.5, 1, 5.5);
        addMoving(11, 82, 11, 5.5, 1, 5.5, 0, 3, 6, 2.8, 1.5);
        addStatic(-11, 89, 11, 5.5, 1, 5.5);
        addStatic(0, 96, 0, 10, 1, 10);

        addRotating(0, 103, 0, 18, 1, 3, -2.7);
        addMoving(0, 109, 10, 5.5, 1, 5.5, 10, 0, 0, 3.0, 0);
        addStatic(0, 115, 0, 14, 1.5, 14, true);
    }

    scene.add(group);

    return {
        towerRadius,
        platforms,
        killObjects,
        group,
        dispose() {
            group.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((m) => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        },
        update(elapsedSeconds) {
            rotatingPlatforms.forEach((p) => {
                p.mesh.rotation.y = elapsedSeconds * p.angularSpeed;
                p.mesh.updateMatrixWorld();
                p.box.setFromObject(p.mesh);
                p.topY = p.mesh.position.y + p.mesh.geometry.parameters.height / 2;
            });

            movingPlatforms.forEach((p) => {
                const oldX = p.mesh.position.x;
                const oldY = p.mesh.position.y;
                const oldZ = p.mesh.position.z;

                const t = elapsedSeconds * p.speed + p.phase;
                p.mesh.position.x = p.baseX + Math.sin(t) * p.rangeX;
                p.mesh.position.y = p.baseY + Math.sin(t) * p.rangeY;
                p.mesh.position.z = p.baseZ + Math.cos(t) * p.rangeZ;

                p.deltaX = p.mesh.position.x - oldX;
                p.deltaY = p.mesh.position.y - oldY;
                p.deltaZ = p.mesh.position.z - oldZ;

                p.mesh.updateMatrixWorld();
                p.box.setFromObject(p.mesh);
                p.topY = p.mesh.position.y + p.mesh.geometry.parameters.height / 2;
            });
        }
    };
}

const STORAGE_KEY = "tocrooms_obbytower_data";
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
scene.background = new THREE.Color(0x0b0f19);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 800);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
dirLight.position.set(20, 150, 20);
scene.add(dirLight);

const RESET_MS = 3 * 60 * 1000;
let cycleStartEpoch = Date.now();
let nextReset = cycleStartEpoch + RESET_MS;
let currentVariant = 1;
let obbyMap = createObbyTowerMap(scene, currentVariant);

const player = createPlayer(scene);

if (player && player.mesh) {
    winsSprite = createWinsSprite();
    player.mesh.add(winsSprite.sprite);
    adjustNameTag(player.mesh);
}

const cameraController = createCameraController(camera);

let winLock = false;
let activePlatform = null;

function respawnPlayer() {
    if (!player || !player.mesh) return;
    activePlatform = null;
    player.mesh.position.set(0, 1.5, 0);
    if (typeof player.setVelocityY === "function") player.setVelocityY(0);
    if (typeof player.setIsGrounded === "function") player.setIsGrounded(true);
}

function applyVariant(newVar, newCycleStartEpoch) {
    if (typeof newVar === "number" && newVar !== currentVariant) {
        scene.remove(obbyMap.group);
        if (typeof obbyMap.dispose === "function") obbyMap.dispose();
        currentVariant = newVar;
        obbyMap = createObbyTowerMap(scene, currentVariant);
        activePlatform = null;
    }
    if (typeof newCycleStartEpoch === "number") {
        cycleStartEpoch = newCycleStartEpoch;
    }
}

let multiplayer = null;

function broadcastFullMapState(forceResetPlayers = false) {
    if (!multiplayer || typeof multiplayer.sendMapSync !== "function") return;
    multiplayer.sendMapSync({
        nextReset,
        cycleStartEpoch,
        variant: currentVariant,
        forceResetPlayers
    });
}

function handleMapSync(data) {
    if (!data) return;

    if (typeof data.nextReset === "number") {
        nextReset = data.nextReset;
        updateHud();
    }

    if (typeof data.variant === "number") {
        applyVariant(data.variant, data.cycleStartEpoch);
    }

    if (data.forceResetPlayers) {
        respawnPlayer();
    }
}

multiplayer = createMultiplayer(scene, player, updatePlayerListUI, "obbytower", handleMapSync);

function resetCycle() {
    if (!multiplayer || typeof multiplayer.isHost !== "function" || !multiplayer.isHost()) return;
    cycleStartEpoch = Date.now();
    nextReset = cycleStartEpoch + RESET_MS;

    let nextVar;
    do {
        nextVar = Math.floor(Math.random() * 3) + 1;
    } while (nextVar === currentVariant);

    applyVariant(nextVar, cycleStartEpoch);
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

function checkCollisions(pos, velocityY) {
    const maxDist = obbyMap.towerRadius - 0.8;
    const distFromCenter = Math.hypot(pos.x, pos.z);
    if (distFromCenter > maxDist) {
        const angle = Math.atan2(pos.z, pos.x);
        pos.x = Math.cos(angle) * maxDist;
        pos.z = Math.sin(angle) * maxDist;
    }

    const playerBox = new THREE.Box3(
        new THREE.Vector3(pos.x - 0.45, pos.y + 0.1, pos.z - 0.45),
        new THREE.Vector3(pos.x + 0.45, pos.y + 3.2, pos.z + 0.45)
    );
    for (let i = 0; i < obbyMap.killObjects.length; i++) {
        if (playerBox.intersectsBox(obbyMap.killObjects[i].box)) {
            respawnPlayer();
            return { grounded: true, y: 1.5 };
        }
    }

    let grounded = false;
    let targetY = pos.y;
    let currentPlat = null;
    const margin = 0.55;

    obbyMap.platforms.forEach((plat) => {
        const box = plat.box;
        if (
            pos.x >= box.min.x - margin && pos.x <= box.max.x + margin &&
            pos.z >= box.min.z - margin && pos.z <= box.max.z + margin
        ) {
            const platTop = plat.topY;
            const prevY = pos.y - velocityY;
            if (prevY >= platTop - 0.7 && pos.y <= platTop + 0.55 && velocityY <= 0.1) {
                grounded = true;
                targetY = platTop;
                currentPlat = plat;
            }
        }
    });

    activePlatform = grounded ? currentPlat : null;
    return { grounded, y: targetY };
}

let lastMapBroadcast = 0;

function animate() {
    requestAnimationFrame(animate);

    const isHostNow = multiplayer && typeof multiplayer.isHost === "function" ? multiplayer.isHost() : true;
    const elapsedSeconds = Math.max(0, (Date.now() - cycleStartEpoch) / 1000);

    obbyMap.update(elapsedSeconds);

    if (activePlatform) {
        if (activePlatform.isEnd) {
            handleWin();
        } else {
            if (activePlatform.deltaX) player.mesh.position.x += activePlatform.deltaX;
            if (activePlatform.deltaY) player.mesh.position.y += activePlatform.deltaY;
            if (activePlatform.deltaZ) player.mesh.position.z += activePlatform.deltaZ;
        }
    }

    if (player && player.mesh) {
        if (isHostNow) {
            const now = performance.now();
            if (now - lastMapBroadcast >= 250) {
                lastMapBroadcast = now;
                broadcastFullMapState(false);
            }
        }

        player.update(cameraController.getYaw(), checkCollisions);
        adjustNameTag(player.mesh);

        if (player.mesh.position.y < -10) {
            respawnPlayer();
        }

        cameraController.update(player.mesh.position);
    }

    if (multiplayer && typeof multiplayer.sync === "function") {
        multiplayer.sync();
    }

    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

respawnPlayer();
animate();