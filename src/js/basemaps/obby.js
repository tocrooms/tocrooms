function createObbyMap(scene) {
    const obstacleGroup = new THREE.Group();

    const startMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
    const platformMat = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
    const rotatingMat = new THREE.MeshLambertMaterial({ color: 0xFF9800 });
    const movingMat = new THREE.MeshLambertMaterial({ color: 0xFFEB3B });
    const checkpointMat = new THREE.MeshLambertMaterial({ color: 0x00BCD4 });
    const endMat = new THREE.MeshLambertMaterial({ color: 0xE91E63 });

    const platforms = [];
    const rotatingPlatforms = [];
    const movingPlatforms = [];

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
            isRotating: false,
            isEnd,
            speed: 0,
            deltaX: 0,
            deltaZ: 0
        };
        platforms.push(platObj);
        return platObj;
    }

    function addRotatingBox(x, y, z, w, h, d, speed) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, rotatingMat);
        mesh.position.set(x, y, z);
        mesh.updateMatrixWorld();
        obstacleGroup.add(mesh);

        const platObj = {
            mesh,
            box: new THREE.Box3().setFromObject(mesh),
            topY: y + h / 2,
            isRotating: true,
            isEnd: false,
            speed,
            deltaX: 0,
            deltaZ: 0
        };
        platforms.push(platObj);
        rotatingPlatforms.push(platObj);
        return platObj;
    }

    function addMovingBox(x, y, z, w, h, d, rangeX, rangeZ, speed) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, movingMat);
        mesh.position.set(x, y, z);
        mesh.updateMatrixWorld();
        obstacleGroup.add(mesh);

        const platObj = {
            mesh,
            box: new THREE.Box3().setFromObject(mesh),
            topY: y + h / 2,
            isRotating: false,
            isEnd: false,
            speed,
            baseX: x,
            baseY: y,
            baseZ: z,
            rangeX,
            rangeZ,
            time: 0,
            deltaX: 0,
            deltaZ: 0
        };
        platforms.push(platObj);
        movingPlatforms.push(platObj);
        return platObj;
    }

    addStaticBox(0, -0.5, 0, 16, 1, 16, startMat);

    const staticData1 = [
        { x: 0, y: 1.5, z: -18, w: 6, h: 1, d: 6 },
        { x: 0, y: 3.0, z: -32, w: 5, h: 1, d: 5 },
        { x: 0, y: 4.5, z: -46, w: 4, h: 1, d: 4 },
        { x: 6, y: 6.0, z: -56, w: 4, h: 1, d: 4 },
        { x: 14, y: 7.5, z: -56, w: 5, h: 1, d: 5 },
        { x: 24, y: 9.0, z: -56, w: 4, h: 1, d: 4 },
        { x: 32, y: 10.5, z: -56, w: 4, h: 1, d: 4 },
        { x: 32, y: 12.0, z: -68, w: 4, h: 1, d: 4 },
        { x: 32, y: 13.5, z: -80, w: 4, h: 1, d: 4 }
    ];
    staticData1.forEach(d => addStaticBox(d.x, d.y, d.z, d.w, d.h, d.d, platformMat));

    const rotData1 = [
        { x: 32, y: 15.0, z: -94, w: 9, h: 0.8, d: 2.2, speed: 0.025 },
        { x: 32, y: 16.5, z: -108, w: 2.2, h: 0.8, d: 9, speed: -0.03 },
        { x: 32, y: 18.0, z: -122, w: 9, h: 0.8, d: 2.2, speed: 0.035 }
    ];
    rotData1.forEach(d => addRotatingBox(d.x, d.y, d.z, d.w, d.h, d.d, d.speed));

    addStaticBox(32, 19.5, -136, 8, 1, 8, checkpointMat);

    addMovingBox(22, 20.5, -146, 5, 1, 5, 4, 0, 0.03);
    addMovingBox(10, 21.5, -146, 5, 1, 5, 0, 4, 0.035);
    addStaticBox(0, 22.5, -146, 8, 1, 8, platformMat);

    addStaticBox(0, 24.0, -160, 5, 1, 5, platformMat);
    addStaticBox(-8, 25.5, -170, 4, 1, 4, platformMat);
    addStaticBox(-8, 27.0, -182, 4, 1, 4, platformMat);

    addRotatingBox(-8, 28.5, -196, 9, 0.8, 2.2, -0.03);
    addRotatingBox(-8, 30.0, -210, 2.2, 0.8, 9, 0.035);

    addStaticBox(-8, 31.5, -224, 8, 1, 8, checkpointMat);

    const staticData2 = [
        { x: -18, y: 33.0, z: -234, w: 5, h: 1, d: 5 },
        { x: -28, y: 34.5, z: -244, w: 4, h: 1, d: 4 },
        { x: -28, y: 36.0, z: -258, w: 4, h: 1, d: 4 },
        { x: -18, y: 37.5, z: -268, w: 5, h: 1, d: 5 },
        { x: -6, y: 39.0, z: -268, w: 4, h: 1, d: 4 }
    ];
    staticData2.forEach(d => addStaticBox(d.x, d.y, d.z, d.w, d.h, d.d, platformMat));

    addMovingBox(6, 40.5, -268, 5, 1, 5, 0, 5, 0.035);
    addMovingBox(18, 42.0, -268, 5, 1, 5, 5, 0, 0.04);
    addMovingBox(18, 43.5, -282, 5, 1, 5, 5, 0, 0.035);

    addStaticBox(18, 45.0, -296, 8, 1, 8, checkpointMat);

    addRotatingBox(18, 46.5, -310, 10, 0.8, 2.2, 0.035);
    addRotatingBox(18, 48.0, -324, 2.2, 0.8, 10, -0.04);
    addRotatingBox(18, 49.5, -338, 10, 0.8, 2.2, 0.04);

    addStaticBox(8, 51.0, -348, 5, 1, 5, platformMat);
    addStaticBox(0, 52.5, -358, 5, 1, 5, platformMat);
    addStaticBox(0, 54.0, -374, 14, 1, 14, endMat, true);

    scene.add(obstacleGroup);

    return {
        platforms,
        update() {
            rotatingPlatforms.forEach(p => {
                p.mesh.rotation.y += p.speed;
                p.mesh.updateMatrixWorld();
                p.box.setFromObject(p.mesh);
                p.topY = p.mesh.position.y + p.mesh.geometry.parameters.height / 2;
            });

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
scene.fog = new THREE.Fog(0x87ceeb, 80, 450);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    800
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
const cameraController = createCameraController(camera);
const multiplayer = createMultiplayer(scene, player, updatePlayerListUI, "obby1");

let activePlatform = null;

function respawnPlayer() {
    player.mesh.position.set(0, 2, 0);
    player.setVelocityY(0);
    player.setIsGrounded(true);
    activePlatform = null;
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
            respawnPlayer();
        } else {
            if (activePlatform.deltaX) player.mesh.position.x += activePlatform.deltaX;
            if (activePlatform.deltaZ) player.mesh.position.z += activePlatform.deltaZ;
        }
    }

    player.update(cameraController.getYaw(), checkObbyCollisions);

    if (player.mesh.position.y < -20) {
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