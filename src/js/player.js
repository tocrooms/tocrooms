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

function buildCharacterMesh(username, customColors = null) {
    const colors = customColors || getPlayerColors();
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

    return charGroup;
}

function createRemotePlayer(scene, username, colors = null) {
    const mesh = buildCharacterMesh(username, colors);
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

function createPlayer(scene) {
    const savedUser = localStorage.getItem("tocrooms_anon_id") || "Guest";
    const player = buildCharacterMesh(savedUser);
    player.position.set(0, 0, 0);
    scene.add(player);
    const keys = {};

    window.addEventListener("keydown", (e) => {
        keys[e.code] = true;
    });
    window.addEventListener("keyup", (e) => {
        keys[e.code] = false;
    });

    let velocityY = 0;
    let isGrounded = true;
    const moveSpeed = 0.22;
    const gravity = -0.018;
    const jumpForce = 0.58;

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
        setVelocityY: (v) => { velocityY = v; },
        setIsGrounded: (g) => { isGrounded = g; }
    };
}