const FACE_LIST = [
    { id: "happy", name: "Happy Smile", file: "../images/happy.png" },
    { id: "tongle", name: "Tongle smile", file: "../images/little-tongle.png" },
    { id: "neutral", name: "Neutral face", file: "../images/neutral.png" },
    { id: "no mouth", name: "No mouth", file: "../images/no-mouth.png" },
    { id: "sad", name: "Sad Face", file: "../images/sad.png.png" },
    { id: "surprice", name: "Surpeise Face", file: "../images/surprise.png" }
];

function getFaceImagePath(faceId) {
    const face = FACE_LIST.find((f) => f.id === faceId) || FACE_LIST[0];
    const inPagesFolder = window.location.pathname.includes("/pages/");
    const prefix = inPagesFolder ? "../../" : "./";
    return `${prefix}assets/faces/${face.file}`;
}

const faceTextureLoader = new THREE.TextureLoader();

function createFaceTexture(faceId) {
    const texture = faceTextureLoader.load(getFaceImagePath(faceId));
    texture.needsUpdate = true;
    return texture;
}

function getPlayerFace() {
    return localStorage.getItem("tocrooms_player_face") || "classic";
}

function setCharacterFace(charGroup, faceId) {
    if (!charGroup || !charGroup.userData || !charGroup.userData.faceMesh) return;
    const faceMesh = charGroup.userData.faceMesh;
    if (faceMesh.material.map) {
        faceMesh.material.map.dispose();
    }
    faceMesh.material.map = createFaceTexture(faceId);
    faceMesh.material.needsUpdate = true;
    charGroup.userData.currentFace = faceId;
}

function createNameSprite(nameText) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 40px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
    ctx.strokeText(nameText, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(nameText, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4.5, 1.125, 1);
    sprite.position.set(0, 5.95, 0);

    return sprite;
}

function getPlayerColors() {
    const defaults = {
        head: "#ffe0bd",
        torso: "#3366cc",
        leftArm: "#ffe0bd",
        rightArm: "#ffe0bd",
        leftLeg: "#2b2b2b",
        rightLeg: "#2b2b2b"
    };
    try {
        const saved = localStorage.getItem("tocrooms_player_colors");
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch (e) {
        return defaults;
    }
}

function buildCharacterMesh(username, customColors = null, customFace = null) {
    const colors = customColors || getPlayerColors();
    const faceId = customFace || getPlayerFace();
    const charGroup = new THREE.Group();

    const leftLegMat = new THREE.MeshLambertMaterial({ color: colors.leftLeg });
    const rightLegMat = new THREE.MeshLambertMaterial({ color: colors.rightLeg });
    const torsoMat = new THREE.MeshLambertMaterial({ color: colors.torso });
    const leftArmMat = new THREE.MeshLambertMaterial({ color: colors.leftArm });
    const rightArmMat = new THREE.MeshLambertMaterial({ color: colors.rightArm });
    const headMat = new THREE.MeshLambertMaterial({ color: colors.head });

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2, 1), leftLegMat);
    leftLeg.position.set(-0.5, 1, 0);
    charGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2, 1), rightLegMat);
    rightLeg.position.set(0.5, 1, 0);
    charGroup.add(rightLeg);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1), torsoMat);
    torso.position.set(0, 3, 0);
    charGroup.add(torso);

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), leftArmMat);
    leftArm.position.set(-1.5, 3, 0);
    charGroup.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), rightArmMat);
    rightArm.position.set(1.5, 3, 0);
    charGroup.add(rightArm);

    const headGeo = new THREE.SphereGeometry(0.68, 24, 24);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 4.65, 0);
    charGroup.add(head);

    const faceGeo = new THREE.SphereGeometry(
        0.686,
        24,
        24,
        Math.PI * 0.22,
        Math.PI * 0.56,
        Math.PI * 0.24,
        Math.PI * 0.52
    );
    const faceMat = new THREE.MeshBasicMaterial({
        map: createFaceTexture(faceId),
        transparent: true,
        depthWrite: false
    });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.set(0, 4.65, 0);
    charGroup.add(faceMesh);

    const nameTag = createNameSprite(username || "Guest");
    charGroup.add(nameTag);

    charGroup.userData.parts = {
        head,
        torso,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg
    };
    charGroup.userData.faceMesh = faceMesh;
    charGroup.userData.currentFace = faceId;

    return charGroup;
}

function createRemotePlayer(scene, username, colors = null, face = null) {
    const mesh = buildCharacterMesh(username, colors, face);
    mesh.position.set(0, 0, 0);
    scene.add(mesh);
    const targetPos = new THREE.Vector3(0, 0, 0);
    let targetRotY = 0;
    let initialized = false;

    return {
        mesh,
        setState(data) {
            targetPos.set(data.x, data.y, data.z);
            targetRotY = data.rotY;

            if (data.face && mesh.userData.currentFace !== data.face) {
                setCharacterFace(mesh, data.face);
            }

            if (!initialized) {
                mesh.position.copy(targetPos);
                mesh.rotation.y = targetRotY;
                initialized = true;
            }
        },
        updateSmooth(alpha = 0.25) {
            mesh.position.lerp(targetPos, alpha);

            let diff = targetRotY - mesh.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            mesh.rotation.y += diff * alpha;
        },
        remove() {
            scene.remove(mesh);
        }
    };
}

function createPlayer(scene, initialSpawn = { x: 0, y: 0, z: 0 }) {
    const savedUser = localStorage.getItem("tocrooms_anon_id") || "Guest";
    const player = buildCharacterMesh(savedUser);
    const spawnPosition = new THREE.Vector3(
        initialSpawn.x ?? 0,
        initialSpawn.y ?? 0,
        initialSpawn.z ?? 0
    );

    player.position.copy(spawnPosition);
    scene.add(player);
    const keys = {};

    let velocityY = 0;
    let isGrounded = true;
    const moveSpeed = 0.22;
    const gravity = -0.018;
    const jumpForce = 0.58;

    function respawn() {
        player.position.copy(spawnPosition);
        player.rotation.y = 0;
        velocityY = 0;
        isGrounded = false;
    }

    function setSpawnPoint(x, y, z) {
        spawnPosition.set(x, y, z);
    }

    window.addEventListener("keydown", (e) => {
        keys[e.code] = true;

        const tag = e.target && e.target.tagName;
        const isTyping = tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable;
        if (e.code === "KeyR" && !e.repeat && !isTyping) {
            respawn();
        }
    });

    window.addEventListener("keyup", (e) => {
        keys[e.code] = false;
    });

    function update(cameraYaw, checkCollisionsCallback) {
        const forward = new THREE.Vector3(
            -Math.sin(cameraYaw),
            0,
            -Math.cos(cameraYaw)
        );
        const right = new THREE.Vector3(
            Math.cos(cameraYaw),
            0,
            -Math.sin(cameraYaw)
        );

        const moveDir = new THREE.Vector3(0, 0, 0);
        if (keys["KeyW"] || keys["ArrowUp"]) moveDir.add(forward);
        if (keys["KeyS"] || keys["ArrowDown"]) moveDir.sub(forward);
        if (keys["KeyA"] || keys["ArrowLeft"]) moveDir.sub(right);
        if (keys["KeyD"] || keys["ArrowRight"]) moveDir.add(right);

        if (moveDir.lengthSq() > 0) {
            moveDir.normalize();
            player.position.addScaledVector(moveDir, moveSpeed);
            player.rotation.y = Math.atan2(moveDir.x, moveDir.z);
        }

        if (keys["Space"] && isGrounded) {
            velocityY = jumpForce;
            isGrounded = false;
        }

        velocityY += gravity;
        player.position.y += velocityY;

        if (checkCollisionsCallback) {
            const collision = checkCollisionsCallback(player.position, velocityY);
            if (collision.grounded) {
                player.position.y = collision.y;
                velocityY = 0;
                isGrounded = true;
            } else {
                isGrounded = false;
            }
        } else {
            if (player.position.y <= 0) {
                player.position.y = 0;
                velocityY = 0;
                isGrounded = true;
            }
        }
    }

    return {
        mesh: player,
        username: savedUser,
        update,
        respawn,
        setSpawnPoint,
        setVelocityY: (v) => { velocityY = v; },
        setIsGrounded: (g) => { isGrounded = g; }
    };
}