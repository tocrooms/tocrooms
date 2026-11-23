function createObbyMap(scene) {
    const obstacleGroup = new THREE.Group();

    const startMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
    const platformMat = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
    const rotatingMat = new THREE.MeshLambertMaterial({ color: 0xFF9800 });
    const stairMat = new THREE.MeshLambertMaterial({ color: 0xFFEB3B });
    const spiralMat = new THREE.MeshLambertMaterial({ color: 0xE91E63 });
    const checkpointMat = new THREE.MeshLambertMaterial({ color: 0x00BCD4 });
    const endMat = new THREE.MeshLambertMaterial({ color: 0x9C27B0 });

    const platforms = [];
    const rotatingPlatforms = [];
    const movingPlatforms = [];

    function addBox(x, y, z, w, h, d, mat, extra = {}) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.updateMatrixWorld();
        obstacleGroup.add(mesh);

        const platObj = {
            mesh,
            type: 'box',
            w,
            h,
            d,
            isRotating: false,
            isEnd: false,
            speed: 0,
            deltaX: 0,
            deltaZ: 0,
            ...extra
        };
        platforms.push(platObj);
        return platObj;
    }

    function addCylinder(x, y, z, radius, h, mat) {
        const geo = new THREE.CylinderGeometry(radius, radius, h, 24);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.updateMatrixWorld();
        obstacleGroup.add(mesh);

        const platObj = {
            mesh,
            type: 'cylinder',
            radius,
            h,
            isRotating: false,
            isEnd: false,
            deltaX: 0,
            deltaZ: 0
        };
        platforms.push(platObj);
        return platObj;
    }

    function addStraightStairs(startX, startY, startZ, steps, stepW, stepH, stepD, dirZ = -1) {
        for (let i = 0; i < steps; i++) {
            const x = startX;
            const y = startY + (i * stepH);
            const z = startZ + (i * stepD * dirZ);
            addBox(x, y, z, stepW, stepH, stepD + 0.5, stairMat);
        }
    }

    function addCurvedStairs(centerX, startY, centerZ, radius, totalSteps, angleStep, stepHeight, stepSize, startAngle = 0) {
        const totalHeight = totalSteps * stepHeight;
        addCylinder(centerX, startY + totalHeight / 2 - 1, centerZ, radius * 0.45, totalHeight + 2, platformMat);

        for (let i = 0; i < totalSteps; i++) {
            const angle = startAngle + (i * angleStep);
            const x = centerX + Math.cos(angle) * radius;
            const z = centerZ + Math.sin(angle) * radius;
            const y = startY + (i * stepHeight);

            addBox(x, y, z, stepSize, 1.0, stepSize, spiralMat);
        }
    }

    addBox(0, -1.0, 0, 18, 2.0, 18, startMat);

    const staticData1 = [
        { x: 0, y: 1.5, z: -18, w: 6, h: 2.0, d: 6 },
        { x: 6, y: 3.0, z: -29, w: 5, h: 2.0, d: 5 },
        { x: -6, y: 4.5, z: -40, w: 5, h: 2.0, d: 5 },
        { x: 0, y: 6.0, z: -52, w: 8, h: 2.0, d: 8 }
    ];
    staticData1.forEach(d => addBox(d.x, d.y, d.z, d.w, d.h, d.d, platformMat));

    addStraightStairs(0, 6.8, -58, 18, 8, 0.6, 1.8, -1);
    addBox(0, 17.5, -96, 14, 2.0, 14, checkpointMat);

    const rotData1 = [
        { x: 0, y: 18.5, z: -112, w: 14, h: 2.0, d: 2.8, speed: 0.025 },
        { x: 0, y: 19.5, z: -128, w: 2.8, h: 2.0, d: 14, speed: -0.03 },
        { x: 0, y: 20.5, z: -144, w: 14, h: 2.0, d: 2.8, speed: 0.035 }
    ];

    rotData1.forEach(data => {
        const platObj = addBox(data.x, data.y, data.z, data.w, data.h, data.d, rotatingMat, {
            isRotating: true,
            speed: data.speed
        });
        rotatingPlatforms.push(platObj);
    });

    addBox(0, 21.5, -162, 14, 2.0, 14, checkpointMat);

    addCurvedStairs(0, 22.2, -182, 12, 28, 0.26, 0.7, 4.8, Math.PI / 2);
    addBox(0, 42.0, -198, 14, 2.0, 14, checkpointMat);

    const rotData2 = [
        { x: 0, y: 43.0, z: -212, w: 12, h: 2.0, d: 2.8, speed: -0.03 },
        { x: 0, y: 44.0, z: -222, w: 2.8, h: 2.0, d: 12, speed: 0.035 },
        { x: 0, y: 45.0, z: -232, w: 12, h: 2.0, d: 2.8, speed: -0.04 }
    ];

    rotData2.forEach(data => {
        const platObj = addBox(data.x, data.y, data.z, data.w, data.h, data.d, rotatingMat, {
            isRotating: true,
            speed: data.speed
        });
        rotatingPlatforms.push(platObj);
    });

    addBox(0, 46.5, -250, 14, 2.0, 14, checkpointMat);

    addCurvedStairs(14, 47.2, -261, 14, 22, -0.16, 0.75, 5.2, Math.PI);
    addBox(12, 64.0, -282, 14, 2.0, 14, checkpointMat);

    const staticData2 = [
        { x: 12, y: 65.5, z: -298, w: 6, h: 2.0, d: 6 },
        { x: 4, y: 67.0, z: -310, w: 5, h: 2.0, d: 5 },
        { x: 20, y: 68.5, z: -322, w: 5, h: 2.0, d: 5 },
        { x: 12, y: 70.0, z: -334, w: 8, h: 2.0, d: 8 }
    ];
    staticData2.forEach(d => addBox(d.x, d.y, d.z, d.w, d.h, d.d, platformMat));

    addStraightStairs(12, 70.8, -342, 20, 8, 0.65, 1.8, -1);
    addBox(12, 84.0, -384, 14, 2.0, 14, checkpointMat);

    const rotData3 = [
        { x: 12, y: 85.0, z: -400, w: 13, h: 2.0, d: 2.6, speed: 0.035 },
        { x: 12, y: 86.0, z: -414, w: 2.6, h: 2.0, d: 13, speed: -0.04 },
        { x: 12, y: 87.0, z: -428, w: 13, h: 2.0, d: 2.6, speed: 0.045 }
    ];

    rotData3.forEach(data => {
        const platObj = addBox(data.x, data.y, data.z, data.w, data.h, data.d, rotatingMat, {
            isRotating: true,
            speed: data.speed
        });
        rotatingPlatforms.push(platObj);
    });

    addCurvedStairs(12, 88.0, -450, 14, 32, 0.24, 0.7, 5.0, Math.PI / 2);
    addBox(12, 111.0, -472, 22, 2.5, 22, endMat, { isEnd: true });

    scene.add(obstacleGroup);

    return {
        platforms,
        update() {
            rotatingPlatforms.forEach(p => {
                p.mesh.rotation.y += p.speed;
                p.mesh.updateMatrixWorld();
            });

            movingPlatforms.forEach(p => {
                const oldX = p.mesh.position.x;
                p.time += p.speed;
                p.mesh.position.x = p.baseX + Math.sin(p.time) * p.rangeX;
                p.deltaX = p.mesh.position.x - oldX;
                p.mesh.updateMatrixWorld();
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
scene.fog = new THREE.Fog(0x87ceeb, 100, 600);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
dirLight.position.set(60, 120, 40);
scene.add(dirLight);

const obby = createObbyMap(scene);
const player = createPlayer(scene);
const cameraController = createCameraController(camera);
const multiplayer = createMultiplayer(scene, player, updatePlayerListUI, "obby2");

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
    const playerRadius = 0.45;
    const maxStepHeight = 0.85;

    for (let i = 0; i < obby.platforms.length; i++) {
        const plat = obby.platforms[i];
        const pPos = plat.mesh.position;

        if (plat.type === 'cylinder') {
            const dx = pos.x - pPos.x;
            const dz = pos.z - pPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const minDist = plat.radius + playerRadius;

            if (dist < minDist) {
                const platTop = pPos.y + plat.h / 2;
                const platBottom = pPos.y - plat.h / 2;
                const heightDiff = platTop - pos.y;

                if (heightDiff >= -0.45 && heightDiff <= maxStepHeight && velocityY <= 0.15) {
                    if (!grounded || platTop > targetY) {
                        grounded = true;
                        targetY = platTop;
                        currentPlat = plat;
                    }
                } else if (pos.y < platTop - 0.1 && pos.y + 1.5 > platBottom) {
                    if (dist > 0.0001) {
                        const push = minDist / dist;
                        pos.x = pPos.x + dx * push;
                        pos.z = pPos.z + dz * push;
                    }
                }
            }
            continue;
        }

        let localX = pos.x - pPos.x;
        let localZ = pos.z - pPos.z;

        if (plat.isRotating) {
            const angle = -plat.mesh.rotation.y;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const rx = localX * cos - localZ * sin;
            const rz = localX * sin + localZ * cos;
            localX = rx;
            localZ = rz;
        }

        const halfW = plat.w / 2 + playerRadius;
        const halfD = plat.d / 2 + playerRadius;

        if (Math.abs(localX) <= halfW && Math.abs(localZ) <= halfD) {
            const platTop = pPos.y + plat.h / 2;
            const platBottom = pPos.y - plat.h / 2;
            const heightDiff = platTop - pos.y;

            if (heightDiff >= -0.45 && heightDiff <= maxStepHeight && velocityY <= 0.15) {
                if (!grounded || platTop > targetY) {
                    grounded = true;
                    targetY = platTop;
                    currentPlat = plat;
                }
            } else if (pos.y < platTop - 0.1 && pos.y + 1.5 > platBottom) {
                const overlapX = halfW - Math.abs(localX);
                const overlapZ = halfD - Math.abs(localZ);

                if (overlapX < overlapZ) {
                    localX += localX > 0 ? overlapX : -overlapX;
                } else {
                    localZ += localZ > 0 ? overlapZ : -overlapZ;
                }

                if (plat.isRotating) {
                    const angle = plat.mesh.rotation.y;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    pos.x = pPos.x + (localX * cos - localZ * sin);
                    pos.z = pPos.z + (localX * sin + localZ * cos);
                } else {
                    pos.x = pPos.x + localX;
                    pos.z = pPos.z + localZ;
                }
            }
        }
    }

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
            if (activePlatform.deltaX) {
                player.mesh.position.x += activePlatform.deltaX;
            }
            if (activePlatform.isRotating) {
                const pPos = activePlatform.mesh.position;
                const dx = player.mesh.position.x - pPos.x;
                const dz = player.mesh.position.z - pPos.z;
                const cos = Math.cos(activePlatform.speed);
                const sin = Math.sin(activePlatform.speed);
                player.mesh.position.x = pPos.x + (dx * cos - dz * sin);
                player.mesh.position.z = pPos.z + (dx * sin + dz * cos);
            }
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