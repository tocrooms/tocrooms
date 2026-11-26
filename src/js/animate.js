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
    const phaseOffset = Math.random() * Math.PI * 2;

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
    let idleClock = phaseOffset;
    let moveBlend = 0;
    let airBlend = 0;
    let landDip = 0;
    let wasGrounded = true;
    let prevPos = charGroup ? charGroup.position.clone() : null;
    let animState = {
        leftLegX: 0,
        rightLegX: 0,
        leftArmX: 0,
        rightArmX: 0,
        leftArmZ: 0.06,
        rightArmZ: -0.06,
        torsoX: 0,
        torsoY: 0,
        torsoZ: 0,
        torsoBob: 0,
        headX: 0,
        headY: 0,
        headZ: 0
    };

    function damp(current, target, lambda, dt) {
        const factor = 1 - Math.exp(-lambda * dt);
        return current + (target - current) * factor;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function triggerImpulse(type = "land") {
        if (type === "land") {
            landDip = -0.18;
        } else if (type === "jump") {
            landDip = 0.11;
        }
    }

    function update({ dt = 1 / 60, isMoving = false, isGrounded = true, velocityY = 0, speed = null } = {}) {
        ensureRig();
        if (!parts) return;

        const safeDt = Math.min(0.05, Math.max(0.001, dt));
        idleClock += safeDt * 2.2;

        let derivedSpeed = 0;
        if (typeof speed === "number") {
            derivedSpeed = Math.max(0, speed);
        } else if (prevPos && charGroup) {
            const dx = charGroup.position.x - prevPos.x;
            const dz = charGroup.position.z - prevPos.z;
            derivedSpeed = Math.hypot(dx, dz) / safeDt;
            prevPos.copy(charGroup.position);
        }

        if (!isGrounded && wasGrounded && velocityY > 0.05) {
            triggerImpulse("jump");
        } else if (isGrounded && !wasGrounded && velocityY < -0.06) {
            triggerImpulse("land");
        }
        wasGrounded = Boolean(isGrounded);
        landDip = damp(landDip, 0, 15, safeDt);

        const movingNow = Boolean(isMoving) || derivedSpeed > 0.45;
        const targetMoveBlend = movingNow ? 1 : 0;
        const targetAirBlend = isGrounded ? 0 : 1;

        moveBlend = damp(moveBlend, targetMoveBlend, movingNow ? 16 : 12, safeDt);
        airBlend = damp(airBlend, targetAirBlend, isGrounded ? 18 : 15, safeDt);

        const speedFactor = Math.max(0.75, Math.min(1.55, derivedSpeed > 0 ? derivedSpeed / 13.2 : 1));
        if (isGrounded && moveBlend > 0.02) {
            walkPhase += safeDt * 12.4 * speedFactor;
        }

        const s = Math.sin(walkPhase);
        const c = Math.cos(walkPhase);
        const stepWave = Math.abs(s);

        const breath = Math.sin(idleClock);
        const idleSway = Math.cos(idleClock * 0.5);
        const idleLeftLegX = 0;
        const idleRightLegX = 0;
        const idleLeftArmX = breath * 0.045;
        const idleRightArmX = -breath * 0.045;
        const idleLeftArmZ = 0.065 + breath * 0.018;
        const idleRightArmZ = -0.065 - breath * 0.018;
        const idleTorsoX = breath * 0.015;
        const idleTorsoY = idleSway * 0.025;
        const idleTorsoZ = idleSway * 0.01;
        const idleTorsoBob = breath * 0.03;
        const idleHeadX = breath * 0.022;
        const idleHeadY = -idleSway * 0.035;
        const idleHeadZ = -idleSway * 0.012;

        const legSwing = 0.82 * speedFactor;
        const armSwing = 0.88 * speedFactor;
        const walkLeftLegX = s * legSwing;
        const walkRightLegX = -s * legSwing;
        const walkLeftArmX = -s * armSwing;
        const walkRightArmX = s * armSwing;
        const walkLeftArmZ = 0.08 + stepWave * 0.035;
        const walkRightArmZ = -0.08 - stepWave * 0.035;
        const walkTorsoX = 0.1 * speedFactor;
        const walkTorsoY = -c * 0.085;
        const walkTorsoZ = -s * 0.032;
        const walkTorsoBob = -stepWave * 0.11;
        const walkHeadX = -0.05;
        const walkHeadY = c * 0.045;
        const walkHeadZ = s * 0.025;

        const gLeftLegX = lerp(idleLeftLegX, walkLeftLegX, moveBlend);
        const gRightLegX = lerp(idleRightLegX, walkRightLegX, moveBlend);
        const gLeftArmX = lerp(idleLeftArmX, walkLeftArmX, moveBlend);
        const gRightArmX = lerp(idleRightArmX, walkRightArmX, moveBlend);
        const gLeftArmZ = lerp(idleLeftArmZ, walkLeftArmZ, moveBlend);
        const gRightArmZ = lerp(idleRightArmZ, walkRightArmZ, moveBlend);
        const gTorsoX = lerp(idleTorsoX, walkTorsoX, moveBlend);
        const gTorsoY = lerp(idleTorsoY, walkTorsoY, moveBlend);
        const gTorsoZ = lerp(idleTorsoZ, walkTorsoZ, moveBlend);
        const gTorsoBob = lerp(idleTorsoBob, walkTorsoBob, moveBlend);
        const gHeadX = lerp(idleHeadX, walkHeadX, moveBlend);
        const gHeadY = lerp(idleHeadY, walkHeadY, moveBlend);
        const gHeadZ = lerp(idleHeadZ, walkHeadZ, moveBlend);

        const vClamp = Math.max(-1, Math.min(1, velocityY * 1.4));
        const airLeftLegX = -0.42 + vClamp * 0.18;
        const airRightLegX = 0.28 - vClamp * 0.14;
        const airLeftArmX = -2.42 + vClamp * 0.22;
        const airRightArmX = -2.42 + vClamp * 0.22;
        const airLeftArmZ = 0.2;
        const airRightArmZ = -0.2;
        const airTorsoX = -0.06 - vClamp * 0.06;
        const airTorsoY = 0;
        const airTorsoZ = 0;
        const airTorsoBob = 0.06 + vClamp * 0.035;
        const airHeadX = -0.08 - vClamp * 0.06;
        const airHeadY = 0;
        const airHeadZ = 0;

        const tLeftLegX = lerp(gLeftLegX, airLeftLegX, airBlend);
        const tRightLegX = lerp(gRightLegX, airRightLegX, airBlend);
        const tLeftArmX = lerp(gLeftArmX, airLeftArmX, airBlend);
        const tRightArmX = lerp(gRightArmX, airRightArmX, airBlend);
        const tLeftArmZ = lerp(gLeftArmZ, airLeftArmZ, airBlend);
        const tRightArmZ = lerp(gRightArmZ, airRightArmZ, airBlend);
        const tTorsoX = lerp(gTorsoX, airTorsoX, airBlend) - landDip * 0.4;
        const tTorsoY = lerp(gTorsoY, airTorsoY, airBlend);
        const tTorsoZ = lerp(gTorsoZ, airTorsoZ, airBlend);
        const tTorsoBob = lerp(gTorsoBob, airTorsoBob, airBlend) + landDip;
        const tHeadX = lerp(gHeadX, airHeadX, airBlend) + landDip * 0.28;
        const tHeadY = lerp(gHeadY, airHeadY, airBlend);
        const tHeadZ = lerp(gHeadZ, airHeadZ, airBlend);

        const rate = 18;
        animState.leftLegX = damp(animState.leftLegX, tLeftLegX, rate, safeDt);
        animState.rightLegX = damp(animState.rightLegX, tRightLegX, rate, safeDt);
        animState.leftArmX = damp(animState.leftArmX, tLeftArmX, rate, safeDt);
        animState.rightArmX = damp(animState.rightArmX, tRightArmX, rate, safeDt);
        animState.leftArmZ = damp(animState.leftArmZ, tLeftArmZ, rate, safeDt);
        animState.rightArmZ = damp(animState.rightArmZ, tRightArmZ, rate, safeDt);
        animState.torsoX = damp(animState.torsoX, tTorsoX, rate, safeDt);
        animState.torsoY = damp(animState.torsoY, tTorsoY, rate, safeDt);
        animState.torsoZ = damp(animState.torsoZ, tTorsoZ, rate, safeDt);
        animState.torsoBob = damp(animState.torsoBob, tTorsoBob, rate, safeDt);
        animState.headX = damp(animState.headX, tHeadX, rate, safeDt);
        animState.headY = damp(animState.headY, tHeadY, rate, safeDt);
        animState.headZ = damp(animState.headZ, tHeadZ, rate, safeDt);

        if (pivots.leftLeg) {
            pivots.leftLeg.rotation.x = animState.leftLegX;
            pivots.leftLeg.position.y = rigConfig.leftLeg.pivot[1] + animState.torsoBob * 0.45;
        }
        if (pivots.rightLeg) {
            pivots.rightLeg.rotation.x = animState.rightLegX;
            pivots.rightLeg.position.y = rigConfig.rightLeg.pivot[1] + animState.torsoBob * 0.45;
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
            parts.torso.rotation.z = animState.torsoZ;
            parts.torso.position.set(baseTorso.x, baseTorso.y + animState.torsoBob, baseTorso.z);
        }

        if (parts.head) {
            parts.head.rotation.x = animState.headX;
            parts.head.rotation.y = animState.headY;
            parts.head.rotation.z = animState.headZ;
            parts.head.position.set(baseHead.x, baseHead.y + animState.torsoBob * 0.85, baseHead.z);
        }
    }

    function reset() {
        ensureRig();
        walkPhase = 0;
        moveBlend = 0;
        airBlend = 0;
        landDip = 0;
        wasGrounded = true;
        if (charGroup) {
            prevPos = charGroup.position.clone();
        }
        animState = {
            leftLegX: 0,
            rightLegX: 0,
            leftArmX: 0,
            rightArmX: 0,
            leftArmZ: 0.06,
            rightArmZ: -0.06,
            torsoX: 0,
            torsoY: 0,
            torsoZ: 0,
            torsoBob: 0,
            headX: 0,
            headY: 0,
            headZ: 0
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
        reset,
        triggerImpulse
    };
}