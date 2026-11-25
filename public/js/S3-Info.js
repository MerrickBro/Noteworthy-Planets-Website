// --== Variables ==--
let speedSlider = document.getElementById("S3-SpeedSlider");
let toggleButton = document.getElementById("S3-ToggleButton");

let sentinelLevels = [
    { title: "Low", names: ["Absent", "Few", "Infrequent", "Intermittent", "Irregular Patrols", "Isolated", "Limited", "Low", "Low Security", "Minimal", "Missing", "None", "None Present", "Not Present", "Remote", "Sparse", "Spread Thin"] },
    { title: "High", names: ["Attentive", "Enforcing", "Ever-present", "Frequent", "Observant", "Regular Patrols", "Require Obedience", "Require Orthodoxy", "Unwavering"] },
    { title: "Aggressive", names: ["Aggressive", "Frenzied", "Hateful", "High Security", "Hostile Patrols", "Inescapable", "Malicious", "Threatening", "Zealous"] },
    { title: "Corrupted", names: ["Answer To None", "Corrupted", "De-Harmonised", "Dissonant", "Forsaken", "Rebellious", "Sharded from the Atlas"] }
];

// GUESS: no planet database yet, so posters stay empty until one exists
let posters = [];


// --== Music Controls ==--
// -= Volume =-
let showVolume = () => {
    document.getElementById("S3-VolumeValue").textContent = Math.round(slider.value * 100) + "%";
};

slider.addEventListener("input", showVolume);
showVolume();

// -= Speed =-
let setSpeed = (value) => {
    audio.playbackRate = value;
    audio.defaultPlaybackRate = value;
    document.getElementById("S3-SpeedValue").textContent = Number(value).toFixed(2) + "x";
};

speedSlider.addEventListener("input", () => setSpeed(speedSlider.value));
audio.addEventListener("loadeddata", () => setSpeed(speedSlider.value));

// -= Prev / Next =-
let playPrevTrack = () => {
    let prevIndex = (currentAudioIndex - 1 + tracks.length) % tracks.length;
    playTrack(prevIndex);
};

document.getElementById("S3-PrevButton").addEventListener("click", playPrevTrack);
document.getElementById("S3-NextButton").addEventListener("click", playNextTrack);

// -= Toggle =-
let showToggleState = () => {
    toggleButton.textContent = audio.paused ? "Music Play" : "Music Pause";
};

toggleButton.addEventListener("click", () => {
    if (!audio.src) return playTrack(currentAudioIndex);
    if (audio.paused) audio.play();
    else audio.pause();
});

audio.addEventListener("play", showToggleState);
audio.addEventListener("pause", showToggleState);


// --== Planet Refresh ==--
// GUESS: placeholder until a planet database is chosen
let refreshPlanets = () => {
    let button = document.getElementById("S3-RefreshButton");
    button.textContent = "No planet database yet";
    setTimeout(() => button.textContent = "Planet Refresh", 2000);
};

document.getElementById("S3-RefreshButton").addEventListener("click", refreshPlanets);


// --== Popups ==--
// -= Open / Close =-
let openPopup = (id) => {
    closePopup();
    if (id === "P2") renderPosterList();
    document.getElementById(id).classList.remove("P-Closed");
    document.getElementById("PopupBackdrop").classList.remove("P-Closed");
};

let closePopup = () => {
    document.querySelectorAll(".P-Popup, #PopupBackdrop").forEach(p => p.classList.add("P-Closed"));
};

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
});

// -= Name List =-
let renderPosterList = () => {
    let list = document.getElementById("P2-NameList");
    list.innerHTML = "";

    if (posters.length === 0) {
        list.innerHTML = "<li class='P-Empty'>No names submitted yet.</li>";
        return;
    }

    [...posters].sort((a, b) => b.count - a.count).forEach(p => {
        let item = document.createElement("li");
        item.innerHTML = "<span></span><span></span>";
        item.children[0].textContent = p.name;
        item.children[1].textContent = p.count;
        list.appendChild(item);
    });
};

// -= Sentinel Chart =-
let renderSentinelChart = () => {
    let chart = document.getElementById("P3-Chart");

    sentinelLevels.forEach(level => {
        let column = document.createElement("div");
        column.className = "P3-Column";

        let title = document.createElement("p");
        title.className = "P-Box P3-ColumnTitle";
        title.textContent = level.title;

        let names = document.createElement("ul");
        names.className = "P-Box P3-Names";
        level.names.forEach(n => {
            let item = document.createElement("li");
            item.textContent = n;
            names.appendChild(item);
        });

        column.append(title, names);
        chart.appendChild(column);
    });
};

renderSentinelChart();
