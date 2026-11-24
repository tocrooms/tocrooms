function createCharacterAnimator(charGroup) {
    const parts = charGroup && charGroup.userData ? charGroup.userData.parts : null;
    const pivots = {};

    const rigConfig = {
        leftLeg: { pivot: [-0.5, 2.0, 0.0], meshOffset: [0.0, -1.0, 0.0] },
        rightLeg: { pivot: [0.5, 2.0, 0.0], meshOffset: [0.0, -1.0, 0.0] },
        leftArm: { pivot: [-1.5, 3.85, 0.0], meshOffset: [0.0, -0.85, 0.0] },
        rightArm: { pivot: [1.5, 3.85, 0.0], meshOffset: [0.0, -0.85, 0.0] }
    };

    const baseTorso = { x: 0.0, y: 3.0, z: 0.0 };
    const baseHead = { x: 0.0, y: 4.65, z: 0.0 };

    function ensureRig() {
        if (!charGroup || !parts) return;

        Object.keys(rigConfig).forEach((key) => {
            const mesh = parts[key];
            if (!mesh || pivots[key]) return;

            const cfg = rigConfig[key];
            const pivotGroup = new THREE.Group();
            pivotGroup.position.set(cfg.pivot[0], cfg.pivot[1], cfg.pivot[2]);

            charGroup.remove(mesh);
            mesh.position.set(cfg.meshOffset[0], cfg.meshOffset[1], cfg.meshOffset[2]);
            mesh.rotation.set(0, 0, 0);

            pivotGroup.add(mesh);
            charGroup.add(pivotGroup);
            pivots[key] = pivotGroup;
        });
    }

    ensureRig();

    let walkPhase = 0;
    let moveBlend = 0;
    let airBlend = 0;
    let prevPos = charGroup ? charGroup.position.clone() : null;

    let animState = {
        leftLegX: 0,
        rightLegX: 0,
        leftArmX: 0,
        rightArmX: 0,
        leftArmZ: 0,
        rightArmZ: 0,
        torsoX: 0,
        torsoY: 0,
        torsoBob: 0,
        headX: 0,
        headY: 0
    };

    function damp(current, target, lambda, dt) {
        const factor = 1 - Math.exp(-lambda * dt);
        return current + (target - current) * factor;
    }

    function update({ dt = 1 / 60, isMoving = false, isGrounded = true, velocityY = 0, speed = null } = {}) {
        ensureRig();
        if (!parts) return;

        const safeDt = Math.min(0.05, Math.max(0.001, dt));

        let derivedSpeed = 0;
        if (typeof speed === "number") {
            derivedSpeed = speed;
        } else if (prevPos && charGroup) {
            const dx = charGroup.position.x - prevPos.x;
            const dz = charGroup.position.z - prevPos.z;
            derivedSpeed = Math.hypot(dx, dz) / safeDt;
            prevPos.copy(charGroup.position);
        }

        const movingNow = Boolean(isMoving) || derivedSpeed > 0.4;
        const targetMoveBlend = movingNow ? 1 : 0;
        const targetAirBlend = isGrounded ? 0 : 1;

        moveBlend = damp(moveBlend, targetMoveBlend, movingNow ? 14 : 10, safeDt);
        airBlend = damp(airBlend, targetAirBlend, isGrounded ? 18 : 16, safeDt);

        const speedFactor = Math.max(0.75, Math.min(1.4, derivedSpeed > 0 ? derivedSpeed / 13.2 : 1));
        if (isGrounded && moveBlend > 0.02) {
            walkPhase += safeDt * 11.5 * speedFactor;
        }

        const s = Math.sin(walkPhase);
        const c = Math.cos(walkPhase);
        const stepWave = Math.abs(s);

        // Pose parado (idle)
        const idleT = performance.now() * 0.0022;
        const breath = Math.sin(idleT);
        const idleLeftLegX = 0;
        const idleRightLegX = 0;
        const idleLeftArmX = breath * 0.03;
        const idleRightArmX = -breath * 0.03;
        const idleLeftArmZ = 0.06;
        const idleRightArmZ = -0.06;
        const idleTorsoX = 0;
        const idleTorsoY = 0;
        const idleTorsoBob = breath * 0.02;
        const idleHeadX = breath * 0.015;

        // Pose a andar (estilo Roblox)
        const legSwing = 0.72 * speedFactor;
        const armSwing = 0.78 * speedFactor;
        const walkLeftLegX = s * legSwing;
        const walkRightLegX = -s * legSwing;
        const walkLeftArmX = -s * armSwing;
        const walkRightArmX = s * armSwing;
        const walkLeftArmZ = 0.07;
        const walkRightArmZ = -0.07;
        const walkTorsoX = 0.07 * speedFactor;
        const walkTorsoY = -c * 0.06;
        const walkTorsoBob = -stepWave * 0.08;
        const walkHeadX = -0.03;

        const gLeftLegX = idleLeftLegX + (walkLeftLegX - idleLeftLegX) * moveBlend;
        const gRightLegX = idleRightLegX + (walkRightLegX - idleRightLegX) * moveBlend;
        const gLeftArmX = idleLeftArmX + (walkLeftArmX - idleLeftArmX) * moveBlend;
        const gRightArmX = idleRightArmX + (walkRightArmX - idleRightArmX) * moveBlend;
        const gLeftArmZ = idleLeftArmZ + (walkLeftArmZ - idleLeftArmZ) * moveBlend;
        const gRightArmZ = idleRightArmZ + (walkRightArmZ - idleRightArmZ) * moveBlend;
        const gTorsoX = idleTorsoX + (walkTorsoX - idleTorsoX) * moveBlend;
        const gTorsoY = idleTorsoY + (walkTorsoY - idleTorsoY) * moveBlend;
        const gTorsoBob = idleTorsoBob + (walkTorsoBob - idleTorsoBob) * moveBlend;
        const gHeadX = idleHeadX + (walkHeadX - idleHeadX) * moveBlend;

        // Pose no ar (salto / queda)
        const vClamp = Math.max(-1, Math.min(1, velocityY * 1.3));
        const airLeftLegX = -0.35 + vClamp * 0.12;
        const airRightLegX = 0.25 - vClamp * 0.1;
        const airLeftArmX = -2.35 + vClamp * 0.15;
        const airRightArmX = -2.35 + vClamp * 0.15;
        const airLeftArmZ = 0.16;
        const airRightArmZ = -0.16;
        const airTorsoX = -0.04;
        const airTorsoY = 0;
        const airTorsoBob = 0.05;
        const airHeadX = -0.06;

        const tLeftLegX = gLeftLegX + (airLeftLegX - gLeftLegX) * airBlend;
        const tRightLegX = gRightLegX + (airRightLegX - gRightLegX) * airBlend;
        const tLeftArmX = gLeftArmX + (airLeftArmX - gLeftArmX) * airBlend;
        const tRightArmX = gRightArmX + (airRightArmX - gRightArmX) * airBlend;
        const tLeftArmZ = gLeftArmZ + (airLeftArmZ - gLeftArmZ) * airBlend;
        const tRightArmZ = gRightArmZ + (airRightArmZ - gRightArmZ) * airBlend;
        const tTorsoX = gTorsoX + (airTorsoX - gTorsoX) * airBlend;
        const tTorsoY = gTorsoY + (airTorsoY - gTorsoY) * airBlend;
        const tTorsoBob = gTorsoBob + (airTorsoBob - gTorsoBob) * airBlend;
        const tHeadX = gHeadX + (airHeadX - gHeadX) * airBlend;

        const rate = 18;
        animState.leftLegX = damp(animState.leftLegX, tLeftLegX, rate, safeDt);
        animState.rightLegX = damp(animState.rightLegX, tRightLegX, rate, safeDt);
        animState.leftArmX = damp(animState.leftArmX, tLeftArmX, rate, safeDt);
        animState.rightArmX = damp(animState.rightArmX, tRightArmX, rate, safeDt);
        animState.leftArmZ = damp(animState.leftArmZ, tLeftArmZ, rate, safeDt);
        animState.rightArmZ = damp(animState.rightArmZ, tRightArmZ, rate, safeDt);
        animState.torsoX = damp(animState.torsoX, tTorsoX, rate, safeDt);
        animState.torsoY = damp(animState.torsoY, tTorsoY, rate, safeDt);
        animState.torsoBob = damp(animState.torsoBob, tTorsoBob, rate, safeDt);
        animState.headX = damp(animState.headX, tHeadX, rate, safeDt);
        animState.headY = damp(animState.headY, tTorsoBob, rate, safeDt);

        if (pivots.leftLeg) {
            pivots.leftLeg.rotation.x = animState.leftLegX;
            pivots.leftLeg.position.y = rigConfig.leftLeg.pivot[1] + animState.torsoBob * 0.5;
        }
        if (pivots.rightLeg) {
            pivots.rightLeg.rotation.x = animState.rightLegX;
            pivots.rightLeg.position.y = rigConfig.rightLeg.pivot[1] + animState.torsoBob * 0.5;
        }
        if (pivots.leftArm) {
            pivots.leftArm.rotation.x = animState.leftArmX;
            pivots.leftArm.rotation.z = animState.leftArmZ;
            pivots.leftArm.position.y = rigConfig.leftArm.pivot[1] + animState.torsoBob;
        }
        if (pivots.rightArm) {
            pivots.rightArm.rotation.x = animState.rightArmX;
            pivots.rightArm.rotation.z = animState.rightArmZ;
            pivots.rightArm.position.y = rigConfig.rightArm.pivot[1] + animState.torsoBob;
        }

        if (parts.torso) {
            parts.torso.rotation.x = animState.torsoX;
            parts.torso.rotation.y = animState.torsoY;
            parts.torso.position.set(baseTorso.x, baseTorso.y + animState.torsoBob, baseTorso.z);
        }

        if (parts.head) {
            parts.head.rotation.x = animState.headX;
            parts.head.position.set(baseHead.x, baseHead.y + animState.headY, baseHead.z);
        }
    }

    function reset() {
        ensureRig();
        walkPhase = 0;
        moveBlend = 0;
        airBlend = 0;
        if (charGroup) {
            prevPos = charGroup.position.clone();
        }
        animState = {
            leftLegX: 0,
            rightLegX: 0,
            leftArmX: 0,
            rightArmX: 0,
            leftArmZ: 0,
            rightArmZ: 0,
            torsoX: 0,
            torsoY: 0,
            torsoBob: 0,
            headX: 0,
            headY: 0
        };

        Object.values(pivots).forEach((p) => p.rotation.set(0, 0, 0));
        if (pivots.leftLeg) pivots.leftLeg.position.set(...rigConfig.leftLeg.pivot);
        if (pivots.rightLeg) pivots.rightLeg.position.set(...rigConfig.rightLeg.pivot);
        if (pivots.leftArm) pivots.leftArm.position.set(...rigConfig.leftArm.pivot);
        if (pivots.rightArm) pivots.rightArm.position.set(...rigConfig.rightArm.pivot);

        if (parts?.torso) {
            parts.torso.rotation.set(0, 0, 0);
            parts.torso.position.set(baseTorso.x, baseTorso.y, baseTorso.z);
        }
        if (parts?.head) {
            parts.head.rotation.set(0, 0, 0);
            parts.head.position.set(baseHead.x, baseHead.y, baseHead.z);
        }
    }

    return {
        update,
        reset
    };
}