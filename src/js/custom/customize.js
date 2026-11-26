document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("avatarPreview");
    if (!canvas) return;

    let currentColors = getSavedColors();
    let selectedPart = "head";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 3.3, 8.5);
    camera.lookAt(0, 3.0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const username = localStorage.getItem("tocrooms_anon_id") || "Guest";
    const character = buildCharacterMesh(username, currentColors);
    window.previewCharacter = character;
    scene.add(character);

    if (typeof applyFaceToCharacter === "function") {
        applyFaceToCharacter(character, getSavedFace());
    }

    let isDragging = false;
    let prevX = 0;

    canvas.addEventListener("mousedown", (e) => {
        isDragging = true;
        prevX = e.clientX;
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevX;
        prevX = e.clientX;
        character.rotation.y += deltaX * 0.015;
    });

    canvas.addEventListener("touchstart", (e) => {
        isDragging = true;
        prevX = e.touches[0].clientX;
    });

    window.addEventListener("touchend", () => {
        isDragging = false;
    });

    window.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - prevX;
        prevX = e.touches[0].clientX;
        character.rotation.y += deltaX * 0.015;
    });

    const customColorInput = document.getElementById("customColorInput");
    const selectedPartLabel = document.getElementById("selectedPartLabel");

    function applyColorToPart(part, hexColor) {
        currentColors[part] = hexColor;
        customColorInput.value = hexColor;

        if (character.userData.parts && character.userData.parts[part]) {
            character.userData.parts[part].material.color.set(hexColor);
        }
    }

    function applyPreset(presetColors) {
        currentColors = { ...presetColors };
        Object.keys(currentColors).forEach((part) => {
            if (character.userData.parts && character.userData.parts[part]) {
                character.userData.parts[part].material.color.set(currentColors[part]);
            }
        });
        customColorInput.value = currentColors[selectedPart];
    }

    const presetListContainer = document.getElementById("presetList");
    if (presetListContainer && typeof PRESETS !== "undefined") {
        Object.keys(PRESETS).forEach((presetName) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "preset-btn";
            btn.textContent = presetName;
            btn.addEventListener("click", () => {
                applyPreset(PRESETS[presetName]);
            });
            presetListContainer.appendChild(btn);
        });
    }

    const partButtons = document.querySelectorAll(".part-btn");
    partButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            partButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            selectedPart = btn.dataset.part;
            selectedPartLabel.textContent = PART_NAMES[selectedPart];
            customColorInput.value = currentColors[selectedPart];
        });
    });

    const paletteContainer = document.getElementById("colorPalette");
    if (paletteContainer && typeof PALETTE_COLORS !== "undefined") {
        PALETTE_COLORS.forEach((hex) => {
            const swatch = document.createElement("div");
            swatch.className = "color-swatch";
            swatch.style.backgroundColor = hex;
            swatch.title = hex;
            swatch.addEventListener("click", () => {
                applyColorToPart(selectedPart, hex);
            });
            paletteContainer.appendChild(swatch);
        });
    }

    customColorInput.value = currentColors[selectedPart];
    customColorInput.addEventListener("input", (e) => {
        applyColorToPart(selectedPart, e.target.value);
    });

    const saveStatus = document.getElementById("saveStatus");

    document.getElementById("saveColorsBtn").addEventListener("click", () => {
        saveColorsToStorage(currentColors);
        if (typeof saveFaceToStorage === "function" && typeof getSavedFace === "function") {
            const currentFace = getSavedFace();
            saveFaceToStorage(currentFace);
            if (typeof applyFaceToCharacter === "function") {
                applyFaceToCharacter(character, currentFace);
            }
        }
        saveStatus.style.display = "inline";
        setTimeout(() => {
            saveStatus.style.display = "none";
        }, 2000);
    });

    document.getElementById("resetColorsBtn").addEventListener("click", () => {
        currentColors = { ...DEFAULT_COLORS };
        Object.keys(currentColors).forEach((part) => {
            applyColorToPart(part, currentColors[part]);
        });
        saveColorsToStorage(currentColors);
        if (typeof DEFAULT_FACE !== "undefined" && typeof saveFaceToStorage === "function") {
            saveFaceToStorage(DEFAULT_FACE);
            if (typeof applyFaceToCharacter === "function") {
                applyFaceToCharacter(character, DEFAULT_FACE);
            }
            document.querySelectorAll("#faceList .face-btn").forEach((btn) => {
                btn.classList.toggle("active", (btn.dataset.face || "") === (DEFAULT_FACE || ""));
            });
        }
        saveStatus.textContent = "Reset & Saved!";
        saveStatus.style.display = "inline";
        setTimeout(() => {
            saveStatus.style.display = "none";
            saveStatus.textContent = "Saved!";
        }, 2000);
    });

    function animate() {
        requestAnimationFrame(animate);
        if (!isDragging) {
            character.rotation.y += 0.004;
        }
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    });
});
