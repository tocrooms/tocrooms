function createPlane(scene) {
    const obstacleGroup = new THREE.Group();
    const platforms = [];
    const groundGeo = new THREE.BoxGeometry(200, 1, 200);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x3d963d });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.5;
    scene.add(ground);

    scene.add(obstacleGroup);

    return {
        platforms,
        groundY: 0
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
scene.background = new THREE.Color(0x9ec9f5);
scene.fog = new THREE.Fog(0x9ec9f5, 60, 220);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
dirLight.position.set(40, 80, 30);
scene.add(dirLight);

const planeMap = createPlane(scene);
const player = createPlayer(scene);
const cameraController = createCameraController(camera);
const multiplayer = createMultiplayer(scene, player, updatePlayerListUI, "plane");

function checkPlaneCollisions(pos, velocityY) {
    let grounded = false;
    let targetY = planeMap.groundY;

    if (pos.y <= planeMap.groundY && velocityY <= 0) {
        grounded = true;
        targetY = planeMap.groundY;
    }
    return { grounded, y: targetY };
}

function animate() {
    requestAnimationFrame(animate);
    player.update(cameraController.getYaw(), checkPlaneCollisions);
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