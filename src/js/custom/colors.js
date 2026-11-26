const STORAGE_KEY = "tocrooms_player_colors";

const DEFAULT_COLORS = {
    head: "#f9a825",
    torso: "#3366cc",
    leftArm: "#f9a825",
    rightArm: "#f9a825",
    leftLeg: "#2b2b2b",
    rightLeg: "#2b2b2b"
};

const PALETTE_COLORS = [
    "#ffdfc4", "#f0d5be", "#b49b7f", "#e0ac69", "#c68642", "#77593f", "#8d5524", "#5c3818", "#3d2314",
    "#ffe0bd", "#f5cd30", "#ffd700", "#ffb347",

    "#fff8e1", "#ffecb3", "#ffe0b2", "#ffccbc", "#f8bbd0", "#e1bee7", "#d1c4e9",
    "#c5cae9", "#bbdefb", "#b2ebf2", "#b2dfdb", "#c8e6c9", "#f0f4c3",

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