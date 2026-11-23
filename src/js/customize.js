const STORAGE_KEY = "tocrooms_player_colors";

const DEFAULT_COLORS = {
    head: "#f9a825",
    torso: "#3366cc",
    leftArm: "#f9a825",
    rightArm: "#f9a825",
    leftLeg: "#2b2b2b",
    rightLeg: "#2b2b2b"
};

const PRESETS = {
    "Classic Guy": {
        head: "#f5cd30",
        torso: "#fffbd6",
        leftArm: "#f5cd30",
        rightArm: "#f5cd30",
        leftLeg: "#fb974b",
        rightLeg: "#fb974b"
    },
    "Guest": {
        head: "#ffe0bd",
        torso: "#3366cc",
        leftArm: "#ffe0bd",
        rightArm: "#ffe0bd",
        leftLeg: "#2b2b2b",
        rightLeg: "#2b2b2b"
    },
    "Guest 2": {
        head: "#b49b7f",
        torso: "#3366cc",
        leftArm: "#b49b7f",
        rightArm: "#b49b7f",
        leftLeg: "#2b2b2b",
        rightLeg: "#2b2b2b"
    },
    "Guest 3": {
        head: "#6d4c41",
        torso: "#3366cc",
        leftArm: "#6d4c41",
        rightArm: "#6d4c41",
        leftLeg: "#2b2b2b",
        rightLeg: "#2b2b2b"
    },
    "Guest 4": {
        head: "#4e342e",
        torso: "#3366cc",
        leftArm: "#4e342e",
        rightArm: "#4e342e",
        leftLeg: "#2b2b2b",
        rightLeg: "#2b2b2b"
    },
    "Emo Guy": {
        head: "#e0ac69",
        torso: "#212121",
        leftArm: "#424242",
        rightArm: "#424242",
        leftLeg: "#212121",
        rightLeg: "#212121"
    },
    "Colorfull Cool Guy": {
        head: "#f0d5be",
        torso: "#00e676",
        leftArm: "#00bcd4",
        rightArm: "#00bcd4",
        leftLeg: "#9c27b0",
        rightLeg: "#9c27b0"
    },
    "Colorfull Cool Guy 2": {
        head: "#77593f",
        torso: "#f1eaaa",
        leftArm: "#00d471",
        rightArm: "#00d471",
        leftLeg: "#ff006a",
        rightLeg: "#ff006a"
    },
    "Fire Guy": {
        head: "#c68642",
        torso: "#d32f2f",
        leftArm: "#d32f2f",
        rightArm: "#d32f2f",
        leftLeg: "#212121",
        rightLeg: "#212121"
    },
    "Snow White": {
        head: "#ffdfc4",
        torso: "#ffffff",
        leftArm: "#ffffff",
        rightArm: "#ffffff",
        leftLeg: "#e0e0e0",
        rightLeg: "#e0e0e0"
    },
    "Noob": {
        head: "#ffeb3b",
        torso: "#1976d2",
        leftArm: "#ffeb3b",
        rightArm: "#ffeb3b",
        leftLeg: "#4caf50",
        rightLeg: "#4caf50"
    },
    "Guy": {
        head: "#f0d5be",
        torso: "#455a64",
        leftArm: "#f0d5be",
        rightArm: "#f0d5be",
        leftLeg: "#1a237e",
        rightLeg: "#1a237e"
    },
    "Builder": {
        head: "#ff9800",
        torso: "#424242",
        leftArm: "#ff9800",
        rightArm: "#ff9800",
        leftLeg: "#263238",
        rightLeg: "#263238"
    },
    "Zombie": {
        head: "#8bc34a",
        torso: "#5d4037",
        leftArm: "#8bc34a",
        rightArm: "#8bc34a",
        leftLeg: "#3e2723",
        rightLeg: "#3e2723"
    },
    "Skeleton": {
        head: "#eeeeee",
        torso: "#e0e0e0",
        leftArm: "#eeeeee",
        rightArm: "#eeeeee",
        leftLeg: "#bdbdbd",
        rightLeg: "#bdbdbd"
    },
    "Cyborg": {
        head: "#90a4ae",
        torso: "#37474f",
        leftArm: "#00bcd4",
        rightArm: "#90a4ae",
        leftLeg: "#263238",
        rightLeg: "#263238"
    },
    "Golden Knight": {
        head: "#ffd700",
        torso: "#ffb300",
        leftArm: "#ffca28",
        rightArm: "#ffca28",
        leftLeg: "#ff8f00",
        rightLeg: "#ff8f00"
    },
    "Shadow Ninja": {
        head: "#212121",
        torso: "#000000",
        leftArm: "#212121",
        rightArm: "#212121",
        leftLeg: "#000000",
        rightLeg: "#000000"
    },
    "Ice Guy": {
        head: "#e0f7fa",
        torso: "#0288d1",
        leftArm: "#80d8ff",
        rightArm: "#80d8ff",
        leftLeg: "#01579b",
        rightLeg: "#01579b"
    },
    "Forest Guy": {
        head: "#e0ac69",
        torso: "#2e7d32",
        leftArm: "#556b2f",
        rightArm: "#556b2f",
        leftLeg: "#4e342e",
        rightLeg: "#4e342e"
    },
    "Pastel Color Guy": {
        head: "#ffdfc4",
        torso: "#f8bbd0",
        leftArm: "#e1bee7",
        rightArm: "#bbdefb",
        leftLeg: "#b2dfdb",
        rightLeg: "#b2dfdb"
    },
    "Really Cool Cyberpunk": {
        head: "#8d5524",
        torso: "#212121",
        leftArm: "#ff006a",
        rightArm: "#00e676",
        leftLeg: "#311b92",
        rightLeg: "#311b92"
    },
    "Royal Guard": {
        head: "#ffe0bd",
        torso: "#880e4f",
        leftArm: "#ad1457",
        rightArm: "#ad1457",
        leftLeg: "#212121",
        rightLeg: "#212121"
    },
    "Alien": {
        head: "#00e676",
        torso: "#4a148c",
        leftArm: "#00e676",
        rightArm: "#00e676",
        leftLeg: "#311b92",
        rightLeg: "#311b92"
    }
};

const PALETTE_COLORS = [
  "#ffdfc4", "#f0d5be", "#b49b7f", "#e0ac69", "#c68642", "#77593f", "#8d5524", "#5c3818", "#3d2314",
  "#ffe0bd", "#f5cd30", "#ffd700", "#ffb347",
  
  "#fff8e1", "#ffecb3", "#ffe0b2", "#ffccbc", "#f8bbd0", "#e1bee7", "#d1c4e9",
  "#c5cae9", "#bbdefb", "#b2ebf2", "#b2dfdb", "#e0f7fa", "#c8e6c9", "#f0f4c3",

  "#ff69b4", "#da70d6", "#ba55d3", "#9370db", "#8a2be2",
  "#ff80ab", "#ff4081", "#f50057", "#c51162",
  "#ff006a", "#e91e63", "#d81b60", "#c2185b", "#ad1457", "#880e4f",
  "#9c27b0", "#8e24aa", "#7b1fa2", "#6a1b9a", "#4a148c",
  "#673ab7", "#5e35b1", "#512da8", "#4527a0", "#311b92",

  "#ff0000", "#e53935", "#d32f2f", "#c62828", "#b71c1c",
  "#ff5252", "#ff1744", "#d50000", "#800000", "#4a0000",

  "#ff5722", "#f4511e", "#e64a19", "#ff7043", "#ff8a65",
  "#ff9800", "#fb8c00", "#f57c00", "#ef6c00", "#e65100", "#ffb74d",

  "#f1eaaa", "#ffeb3b", "#fdd835", "#fbc02d", "#f9a825", "#f57f17",
  "#ffca28", "#ffc107", "#ffb300", "#ffa000", "#ff8f00", "#ff6f00",

  "#795548", "#6d4c41", "#5d4037", "#4e342e", "#3e2723",
  "#a1887f", "#8d6e63", "#d7ccc8", "#bcaaa4",

  "#00d471", "#4caf50", "#43a047", "#388e3c", "#2e7d32", "#1b5e20",
  "#8bc34a", "#7cb342", "#689f38", "#558b2f", "#33691e",
  "#cddc39", "#afb42b", "#827717", "#556b2f", "#808000",
  "#00e676", "#00c853", "#b9f6ca",

   "#1de9b6", "#009688", "#00897b", "#00796b", "#00695c", "#004d40",

  "#00bcd4", "#00acc1", "#0097a7", "#00838f", "#006064",
  "#00b0ff", "#0091ea", "#80d8ff",
  "#03a9f4", "#039be5", "#0288d1", "#0277bd", "#01579b",
  "#2196f3", "#1e88e5", "#1976d2", "#1565c0", "#0d47a1", "#82b1ff",
  "#3f51b5", "#3949ab", "#303f9f", "#283593", "#1a237e",

  "#ffffff", "#fafafa", "#f5f5f5", "#eeeeee", "#e0e0e0", 
  "#bdbdbd", "#9e9e9e", "#757575", "#616161", "#424242", "#212121", "#000000",
  "#cfd8dc", "#90a4ae", "#607d8b", "#455a64", "#263238"
];

const PART_NAMES = {
    head: "Head",
    torso: "Torso",
    leftArm: "Left Arm",
    rightArm: "Right Arm",
    leftLeg: "Left Leg",
    rightLeg: "Right Leg"
};

function getSavedColors() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_COLORS };
        return { ...DEFAULT_COLORS, ...JSON.parse(raw) };
    } catch (e) {
        return { ...DEFAULT_COLORS };
    }
}

function saveColorsToStorage(colors) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
}

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
    scene.add(character);

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

    customColorInput.value = currentColors[selectedPart];
    customColorInput.addEventListener("input", (e) => {
        applyColorToPart(selectedPart, e.target.value);
    });

    const saveStatus = document.getElementById("saveStatus");

    document.getElementById("saveColorsBtn").addEventListener("click", () => {
        saveColorsToStorage(currentColors);
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