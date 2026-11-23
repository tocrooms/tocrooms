function createGravityTestMap(scene) {
    const obstacleGroup = new THREE.Group();
    const groundY = 0;

    const groundGeo = new THREE.BoxGeometry(200, 1, 200);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x3d963d });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.5;
    obstacleGroup.add(ground);

    scene.add(obstacleGroup);

    const spheres = [];
    const sphereColors = [0xff5555, 0x50fa7b, 0x8be9fd, 0xffb86c, 0xbd93f9, 0xf1fa8c];
    const gravity = -0.018;
    const bounceFactor = 0.6;
    const friction = 0.98;

    let spawnTimer = 0;
    const spawnInterval = 50;
    const maxSpheres = 40;

    function spawnSphere() {
        if (spheres.length >= maxSpheres) return;

        const radius = 0.9 + Math.random() * 0.8;
        const color = sphereColors[Math.floor(Math.random() * sphereColors.length)];
        
        const geo = new THREE.SphereGeometry(radius, 24, 24);
        const mat = new THREE.MeshLambertMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);

        mesh.position.set(
            (Math.random() - 0.5) * 60,
            40 + Math.random() * 15,
            (Math.random() - 0.5) * 60
        );

        scene.add(mesh);

        spheres.push({
            mesh,
            radius,
            vel: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                0,
                (Math.random() - 0.5) * 0.1
            ),
            life: 500 + Math.floor(Math.random() * 200)
        });
    }

    function update(playerPosition) {
        spawnTimer++;
        if (spawnTimer >= spawnInterval) {
            spawnTimer = 0;
            spawnSphere();
        }

        const playerRadius = 0.6;

        for (let i = spheres.length - 1; i >= 0; i--) {
            const s = spheres[i];

            s.vel.y += gravity;
            s.mesh.position.add(s.vel);

            if (s.mesh.position.y - s.radius <= groundY) {
                s.mesh.position.y = groundY + s.radius;
                if (Math.abs(s.vel.y) > 0.03) {
                    s.vel.y = -s.vel.y * bounceFactor;
                } else {
                    s.vel.y = 0;
                }
                s.vel.x *= friction;
                s.vel.z *= friction;
            }

            const pDiff = new THREE.Vector3(
                s.mesh.position.x - playerPosition.x,
                0,
                s.mesh.position.z - playerPosition.z
            );
            const pDist = pDiff.length();
            const pMinDist = s.radius + playerRadius;
            const playerTop = playerPosition.y + 4.5;
            const playerBottom = playerPosition.y;

            if (pDist < pMinDist && s.mesh.position.y + s.radius > playerBottom && s.mesh.position.y - s.radius < playerTop) {
                if (pDist > 0.0001) {
                    const pushDir = pDiff.normalize();
                    const pushForce = (pMinDist - pDist) * 0.5;
                    s.vel.x += pushDir.x * pushForce;
                    s.vel.z += pushDir.z * pushForce;
                    s.mesh.position.x += pushDir.x * pushForce;
                    s.mesh.position.z += pushDir.z * pushForce;
                }
            }

            for (let j = i - 1; j >= 0; j--) {
                const other = spheres[j];
                const diff = new THREE.Vector3().subVectors(s.mesh.position, other.mesh.position);
                const dist = diff.length();
                const minDist = s.radius + other.radius;

                if (dist < minDist && dist > 0.0001) {
                    const normal = diff.normalize();
                    const overlap = minDist - dist;

                    s.mesh.position.addScaledVector(normal, overlap * 0.5);
                    other.mesh.position.addScaledVector(normal, -overlap * 0.5);

                    const relVel = new THREE.Vector3().subVectors(s.vel, other.vel);
                    const sepVel = relVel.dot(normal);

                    if (sepVel < 0) {
                        const impulse = -(1 + bounceFactor) * sepVel * 0.5;
                        s.vel.addScaledVector(normal, impulse);
                        other.vel.addScaledVector(normal, -impulse);
                    }
                }
            }

            s.life--;

            if (s.life <= 0 || s.mesh.position.y < -30) {
                scene.remove(s.mesh);
                s.mesh.geometry.dispose();
                s.mesh.material.dispose();
                spheres.splice(i, 1);
            }
        }
    }

    return {
        groundY,
        update
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

const gravityMap = createGravityTestMap(scene);
const player = createPlayer(scene);
const cameraController = createCameraController(camera);
const multiplayer = createMultiplayer(scene, player, updatePlayerListUI, "gravitytest");

function checkCollisions(pos, velocityY) {
    let grounded = false;
    let targetY = gravityMap.groundY;

    if (pos.y <= gravityMap.groundY && velocityY <= 0) {
        grounded = true;
        targetY = gravityMap.groundY;
    }
    return { grounded, y: targetY };
}

function animate() {
    requestAnimationFrame(animate);
    gravityMap.update(player.mesh.position);
    player.update(cameraController.getYaw(), checkCollisions);
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
