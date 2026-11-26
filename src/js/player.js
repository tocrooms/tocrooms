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

function createSpeechSprite(messageText) {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 160;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padX = 28;
    const boxW = canvas.width - padX * 2;
    const boxH = 92;
    const boxX = padX;
    const boxY = 16;
    const radius = 18;

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "#5474bd";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(boxX + radius, boxY);
    ctx.lineTo(boxX + boxW - radius, boxY);
    ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + radius);
    ctx.lineTo(boxX + boxW, boxY + boxH - radius);
    ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - radius, boxY + boxH);
    ctx.lineTo(canvas.width / 2 + 16, boxY + boxH);
    ctx.lineTo(canvas.width / 2, boxY + boxH + 18);
    ctx.lineTo(canvas.width / 2 - 16, boxY + boxH);
    ctx.lineTo(boxX + radius, boxY + boxH);
    ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - radius);
    ctx.lineTo(boxX, boxY + radius);
    ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 32px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#111111";

    const maxTextWidth = boxW - 32;
    let displayText = messageText;
    while (ctx.measureText(displayText).width > maxTextWidth && displayText.length > 1) {
        displayText = displayText.slice(0, -1);
    }
    if (displayText !== messageText) {
        displayText = displayText.slice(0, -1) + "…";
    }

    ctx.fillText(displayText, canvas.width / 2, boxY + boxH / 2 + 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(5.4, 1.35, 1);
    sprite.position.set(0, 7.05, 0);

    return sprite;
}

function setSpeechBubble(charGroup, messageText, durationMs = 4000) {
    if (!charGroup || !charGroup.userData) return;

    if (charGroup.userData.speechTimer) {
        clearTimeout(charGroup.userData.speechTimer);
        charGroup.userData.speechTimer = null;
    }

    if (charGroup.userData.speechSprite) {
        charGroup.remove(charGroup.userData.speechSprite);
        if (charGroup.userData.speechSprite.material && charGroup.userData.speechSprite.material.map) {
            charGroup.userData.speechSprite.material.map.dispose();
        }
        if (charGroup.userData.speechSprite.material) {
            charGroup.userData.speechSprite.material.dispose();
        }
        charGroup.userData.speechSprite = null;
    }

    if (!messageText) return;

    const sprite = createSpeechSprite(messageText);
    charGroup.add(sprite);
    charGroup.userData.speechSprite = sprite;

    charGroup.userData.speechTimer = setTimeout(() => {
        if (charGroup.userData.speechSprite === sprite) {
            charGroup.remove(sprite);
            if (sprite.material && sprite.material.map) sprite.material.map.dispose();
            if (sprite.material) sprite.material.dispose();
            charGroup.userData.speechSprite = null;
        }
    }, durationMs);
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

function createRemotePlayer(scene, username, colors = null, initialWins = 0) {
    const mesh = buildCharacterMesh(username, colors);
    mesh.position.set(0, 0, 0);
    scene.add(mesh);
    const targetPos = new THREE.Vector3(0, 0, 0);
    let targetRotY = 0;
    let targetIsMoving = false;
    let targetIsGrounded = true;
    let targetVelocityY = 0;
    let initialized = false;
    let lastPos = new THREE.Vector3(0, 0, 0);
    let remoteWins = typeof initialWins === "number" ? initialWins : 0;
    let remoteWinsSprite = null;

    if (typeof createWinsSprite === "function") {
        remoteWinsSprite = createWinsSprite();
        remoteWinsSprite.sprite.position.set(0, 7.6, 0);
        remoteWinsSprite.draw(remoteWins);
        mesh.add(remoteWinsSprite.sprite);
    }

    mesh.traverse((child) => {
        if (child.isSprite && child !== (remoteWinsSprite && remoteWinsSprite.sprite)) {
            child.position.y = 4.6;
        }
    });

    const animator = typeof createCharacterAnimator === "function"
        ? createCharacterAnimator(mesh)
        : null;

    return {
        mesh,
        setWins(w) {
            remoteWins = Number(w) || 0;
            if (remoteWinsSprite) {
                remoteWinsSprite.draw(remoteWins);
            }
        },
        setState(data) {
            targetPos.set(data.x, data.y, data.z);
            targetRotY = data.rotY;

            if (typeof data.isMoving === "boolean") {
                targetIsMoving = data.isMoving;
            }
            if (typeof data.isGrounded === "boolean") {
                targetIsGrounded = data.isGrounded;
            }
            if (typeof data.velocityY === "number") {
                targetVelocityY = data.velocityY;
            }
            if (typeof data.wins === "number") {
                this.setWins(data.wins);
            }

            if (data.speech) {
                setSpeechBubble(mesh, data.speech);
            }

            if (!initialized) {
                mesh.position.copy(targetPos);
                mesh.rotation.y = targetRotY;
                lastPos.copy(targetPos);
                initialized = true;
            }
        },
        updateSmooth(alpha = 0.25, dt = 1 / 60) {
            const safeDt = Math.min(0.05, Math.max(0.001, dt));
            const smoothFactor = 1 - Math.pow(1 - Math.min(0.9, Math.max(0.05, alpha)), safeDt * 60);

            mesh.position.lerp(targetPos, smoothFactor);

            let diff = targetRotY - mesh.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            mesh.rotation.y += diff * smoothFactor;

            const distToTarget = mesh.position.distanceTo(targetPos);
            const vertDelta = mesh.position.y - lastPos.y;
            const distToTargetY = Math.abs(targetPos.y - mesh.position.y);

            const moving = targetIsMoving && distToTarget > 0.02;
            const grounded = distToTargetY < 0.06 && Math.abs(vertDelta) < 0.06 && targetIsGrounded;
            const velY = Math.abs(targetVelocityY) > 0.01 ? targetVelocityY : vertDelta / safeDt;

            lastPos.copy(mesh.position);

            if (animator) {
                animator.update({
                    dt: safeDt,
                    isMoving: moving,
                    isGrounded: grounded,
                    velocityY: velY
                });
            }
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
    let isMoving = false;
    let lastFrameTime = performance.now();
    const moveSpeed = 0.22;
    const gravity = -0.018;
    const jumpForce = 0.58;

    const animator = typeof createCharacterAnimator === "function"
        ? createCharacterAnimator(player)
        : null;

    function respawn() {
        player.position.copy(spawnPosition);
        player.rotation.y = 0;
        velocityY = 0;
        isGrounded = false;
        isMoving = false;
        if (animator) animator.reset();
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
        const now = performance.now();
        const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
        lastFrameTime = now;

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

        isMoving = moveDir.lengthSq() > 0;

        if (isMoving) {
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

        if (animator) {
            animator.update({
                dt,
                isMoving,
                isGrounded,
                velocityY
            });
        }
    }

    return {
        mesh: player,
        username: savedUser,
        update,
        respawn,
        setSpawnPoint,
        showChatBubble: (text) => setSpeechBubble(player, text),
        setVelocityY: (v) => { velocityY = v; },
        setIsGrounded: (g) => { isGrounded = g; },
        getMoveState: () => ({ isMoving, isGrounded, velocityY })
    };
}