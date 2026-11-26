function createObbyMap(scene) {
    const obstacleGroup = new THREE.Group();

    const startMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
    const platformMat = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
    const movingMat = new THREE.MeshLambertMaterial({ color: 0xFFEB3B });
    const checkpointMat = new THREE.MeshLambertMaterial({ color: 0x00BCD4 });
    const endMat = new THREE.MeshLambertMaterial({ color: 0xE91E63 });
    const lavaMat = new THREE.MeshLambertMaterial({ color: 0xFF3D00 });

    const platforms = [];
    const movingPlatforms = [];
    const lavaHazards = [];

    function addStaticBox(x, y, z, w, h, d, mat, isEnd = false) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.updateMatrixWorld();
        obstacleGroup.add(mesh);

        const platObj = {
            mesh,
            box: new THREE.Box3().setFromObject(mesh),
            topY: y + h / 2,
            isEnd,
            deltaX: 0,
            deltaZ: 0
        };
        platforms.push(platObj);
        return platObj;
    }

    function addMovingBox(x, y, z, w, h, d, rangeX, rangeZ, speed, phase = 0) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, movingMat);
        mesh.position.set(x, y, z);
        mesh.updateMatrixWorld();
        obstacleGroup.add(mesh);

        const platObj = {
            mesh,
            box: new THREE.Box3().setFromObject(mesh),
            topY: y + h / 2,
            isEnd: false,
            baseX: x,
            baseY: y,
            baseZ: z,
            rangeX,
            rangeZ,
            speed,
            time: phase,
            deltaX: 0,
            deltaZ: 0
        };
        platforms.push(platObj);
        movingPlatforms.push(platObj);
        return platObj;
    }

    function addLava(x, y, z, w, h, d) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, lavaMat);
        mesh.position.set(x, y, z);
        mesh.updateMatrixWorld();
        obstacleGroup.add(mesh);

        lavaHazards.push({
            mesh,
            box: new THREE.Box3().setFromObject(mesh)
        });
    }

    function addChessboard(startX, y, startZ, cols, rows, cellSize, gap) {
        const step = cellSize + gap;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cx = startX + (c - (cols - 1) / 2) * step;
                const cz = startZ - r * step;
                if ((r + c) % 2 === 0) {
                    addStaticBox(cx, y, cz, cellSize, 1, cellSize, platformMat);
                } else {
                    addLava(cx, y + 0.15, cz, cellSize, 0.8, cellSize);
                }
            }
        }
    }

    addStaticBox(0, -0.5, 0, 14, 1, 14, startMat);

    addStaticBox(0, 1.0, -28, 10, 1, 38, platformMat);
    addLava(0, 1.6, -18, 10, 0.6, 1.6);
    addLava(0, 1.6, -28, 10, 0.6, 1.6);
    addLava(0, 1.6, -38, 10, 0.6, 1.6);

    addMovingBox(0, 2.5, -56, 10, 1, 10, 9, 0, 0.025, 0);
    addMovingBox(0, 4.0, -72, 10, 1, 10, 0, 9, 0.025, 1.2);
    addMovingBox(0, 5.5, -88, 10, 1, 10, 10, 0, 0.03, 2.4);

    addStaticBox(0, 7.0, -104, 12, 1, 12, checkpointMat);

    addChessboard(0, 8.0, -116, 5, 6, 3.6, 0.6);

    addStaticBox(0, 9.0, -158, 10, 1, 34, platformMat);
    addLava(0, 9.6, -149, 1.6, 0.6, 10);
    addLava(0, 9.6, -158, 10, 0.6, 1.6);
    addLava(0, 9.6, -167, 1.6, 0.6, 10);

    addMovingBox(-12, 10.5, -184, 10, 1, 10, 10, 0, 0.03, 0);
    addMovingBox(0, 12.0, -200, 10, 1, 10, 11, 0, 0.032, 1.8);
    addMovingBox(12, 13.5, -216, 10, 1, 10, 0, 10, 0.028, 3.2);

    addChessboard(12, 14.5, -228, 5, 6, 3.6, 0.6);

    addStaticBox(12, 15.5, -262, 12, 1, 12, checkpointMat);

    addStaticBox(12, 17.0, -296, 12, 1, 44, platformMat);
    addLava(9.5, 17.6, -284, 7, 0.6, 1.6);
    addLava(14.5, 17.6, -292, 7, 0.6, 1.6);
    addLava(9.5, 17.6, -300, 7, 0.6, 1.6);
    addLava(14.5, 17.6, -308, 7, 0.6, 1.6);

    addMovingBox(12, 18.5, -328, 9, 1, 9, 11, 0, 0.035, 0);
    addMovingBox(0, 20.0, -344, 9, 1, 9, 0, 10, 0.032, 1.5);
    addMovingBox(-12, 21.5, -360, 9, 1, 9, 11, 0, 0.038, 3.0);

    addStaticBox(-12, 23.0, -376, 12, 1, 12, checkpointMat);

    addChessboard(-12, 24.0, -390, 7, 8, 3.4, 0.6);

    addStaticBox(-12, 25.5, -444, 10, 1, 36, platformMat);
    addLava(-12, 26.1, -434, 10, 0.6, 1.8);
    addLava(-12, 26.1, -444, 1.8, 0.6, 12);
    addLava(-12, 26.1, -454, 10, 0.6, 1.8);

    addMovingBox(-4, 27.0, -472, 9, 1, 9, 12, 0, 0.036, 0.5);
    addMovingBox(6, 28.5, -488, 9, 1, 9, 12, 0, 0.04, 2.1);

    addStaticBox(6, 30.0, -508, 16, 1, 16, endMat, true);

    scene.add(obstacleGroup);

    return {
        platforms,
        lavaHazards,
        update() {
            movingPlatforms.forEach(p => {
                const oldX = p.mesh.position.x;
                const oldZ = p.mesh.position.z;
                p.time += p.speed;
                p.mesh.position.x = p.baseX + Math.sin(p.time) * p.rangeX;
                p.mesh.position.z = p.baseZ + Math.cos(p.time) * p.rangeZ;
                p.deltaX = p.mesh.position.x - oldX;
                p.deltaZ = p.mesh.position.z - oldZ;
                p.mesh.updateMatrixWorld();
                p.box.setFromObject(p.mesh);
                p.topY = p.mesh.position.y + p.mesh.geometry.parameters.height / 2;
            });
        }
    };
}

const STORAGE_KEY = "tocrooms_obby3_data";
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
        if (p.isLocal) {
            li.classList.add("local-player");
        }
        listEl.appendChild(li);
    });
}

const canvas = document.getElementById("gameCanvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 600);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
dirLight.position.set(40, 80, 30);
scene.add(dirLight);

const obby = createObbyMap(scene);
const player = createPlayer(scene);

if (player && player.mesh) {
    winsSprite = createWinsSprite();
    player.mesh.add(winsSprite.sprite);
    adjustNameTag(player.mesh);
}

const cameraController = createCameraController(camera);
const multiplayer = createMultiplayer(scene, player, updatePlayerListUI, "obby3");

let activePlatform = null;
let winLock = false;

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

function respawnPlayer() {
    player.mesh.position.set(0, 2, 0);
    player.setVelocityY(0);
    player.setIsGrounded(true);
    activePlatform = null;
}

function checkLavaTouch(pos) {
    const playerBox = new THREE.Box3(
        new THREE.Vector3(pos.x - 0.5, pos.y, pos.z - 0.5),
        new THREE.Vector3(pos.x + 0.5, pos.y + 4.5, pos.z + 0.5)
    );

    for (let i = 0; i < obby.lavaHazards.length; i++) {
        if (playerBox.intersectsBox(obby.lavaHazards[i].box)) {
            return true;
        }
    }
    return false;
}

function checkObbyCollisions(pos, velocityY) {
    let grounded = false;
    let targetY = pos.y;
    let currentPlat = null;
    const margin = 0.55;

    obby.platforms.forEach(plat => {
        const box = plat.box;
        if (
            pos.x >= box.min.x - margin && pos.x <= box.max.x + margin &&
            pos.z >= box.min.z - margin && pos.z <= box.max.z + margin
        ) {
            const platTop = plat.topY;
            const prevY = pos.y - velocityY;
            if (prevY >= platTop - 0.5 && pos.y <= platTop + 0.4 && velocityY <= 0) {
                grounded = true;
                targetY = platTop;
                currentPlat = plat;
            }
        }
    });

    activePlatform = grounded ? currentPlat : null;
    return { grounded, y: targetY };
}

function animate() {
    requestAnimationFrame(animate);

    obby.update();

    if (activePlatform) {
        if (activePlatform.isEnd) {
            handleWin();
        } else {
            if (activePlatform.deltaX) player.mesh.position.x += activePlatform.deltaX;
            if (activePlatform.deltaZ) player.mesh.position.z += activePlatform.deltaZ;
        }
    }

    player.update(cameraController.getYaw(), checkObbyCollisions);
    adjustNameTag(player.mesh);

    if (checkLavaTouch(player.mesh.position) || player.mesh.position.y < -20) {
        respawnPlayer();
    }

    cameraController.update(player.mesh.position);
    multiplayer.sync();
    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();