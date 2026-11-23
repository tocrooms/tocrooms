function createCameraController(camera) {
    let cameraYaw = 0;
    let cameraPitch = 0.35;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const camDist = 11;

    window.addEventListener("mousedown", (e) => {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        cameraYaw -= deltaX * 0.007;
        cameraPitch = Math.max(0.1, Math.min(1.3, cameraPitch + deltaY * 0.007));
    });

    function update(targetPosition) {
        const targetPos = new THREE.Vector3(
            targetPosition.x,
            targetPosition.y + 3.2,
            targetPosition.z
        );

        camera.position.x = targetPos.x + Math.sin(cameraYaw) * Math.cos(cameraPitch) * camDist;
        camera.position.y = targetPos.y + Math.sin(cameraPitch) * camDist;
        camera.position.z = targetPos.z + Math.cos(cameraYaw) * Math.cos(cameraPitch) * camDist;
        camera.lookAt(targetPos);
    }

    return {
        getYaw: () => cameraYaw,
        update
    };
}