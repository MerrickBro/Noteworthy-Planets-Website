// --== Screen Switch ==--
function switchScreen(id) {
    document.querySelectorAll(".screen, .active").forEach(s => {
        s.classList.remove("active");
        s.classList.add("screen");
    });

    const screen = document.getElementById(id);
    if (!screen) return;

    screen.classList.remove("screen");
    screen.classList.add("active");
}

const tracks = [
    { file: "music/Adrift - 65daysofstatic.flac", title: "Adrift", artist: "65daysofstatic" },
    { file: "music/Airy-O - Paul Weir.flac", title: "Airy-O", artist: "Paul Weir" },
    { file: "music/Epoch of Reionisation - Paul Weir.flac", title: "Epoch of Reionisation", artist: "Paul Weir" },
    { file: "music/Expeditions - Paul Weir.flac", title: "Expeditions", artist: "Paul Weir" },
    { file: "music/Glimmer Nebula - 65daysofstatic.flac", title: "Glimmer Nebula", artist: "65daysofstatic" },
    { file: "music/Nexus - Paul Weir.flac", title: "Nexus", artist: "Paul Weir" },
    { file: "music/One Single Star - Paul Weir.flac", title: "One Single Star", artist: "Paul Weir" },
    { file: "music/Overseer Planet - 65daysofstatic.flac", title: "Overseer Planet", artist: "65daysofstatic" },
    { file: "music/Protostar - 65daysofstatic.flac", title: "Protostar", artist: "65daysofstatic" },
    { file: "music/Recursive Simulation - Paul Weir.flac", title: "Recursive Simulation", artist: "Paul Weir" },
    { file: "music/Self Test - Paul Weir.flac", title: "Self Test", artist: "Paul Weir" },
    { file: "music/The Appearance of a Star System - Paul Weir.flac", title: "The Appearance of a Star System", artist: "Paul Weir" },
    { file: "music/The Path Finder - 65daysofstatic.flac", title: "The Path Finder", artist: "65daysofstatic" },
    { file: "music/Tunguska_Iteration_02 - 65daysofstatic.flac", title: "Tunguska Iteration 02", artist: "65daysofstatic" },
    { file: "music/Tunguska_Iteration_03 - 65daysofstatic.flac", title: "Tunguska Iteration 03", artist: "65daysofstatic" },
    { file: "music/Vostok - 65daysofstatic.flac", title: "Vostok", artist: "65daysofstatic" }
];

let currentAudioIndex = 0;
let audio = new Audio();

let slider = document.getElementById("volumeSlider");

let setVolume = (value) => {
    audio.volume = value / 2;
};

if (slider) {
    slider.value = 0.1;

    slider.addEventListener("input", () => {
        setVolume(slider.value);
    });
}

setVolume(slider?.value ?? 0.1);

let displayCurrentTrackInfo = (index) => {
    let track = tracks[index];
    if (!track) return;

    //document.getElementById("currentTitle").textContent = track.title;
    //document.getElementById("currentArtist").textContent = track.artist;
};

let playTrack = (index) => {
    let track = tracks[index];
    if (!track) return;

    currentAudioIndex = index;

    audio.pause();
    audio.currentTime = 0;

    audio.src = track.file;

    audio.play().catch(e => console.log("Click page to play"));

    displayCurrentTrackInfo(index);
};

let playNextTrack = () => {
    let nextIndex = (currentAudioIndex + 1) % tracks.length;
    playTrack(nextIndex);
};

audio.addEventListener("ended", playNextTrack);

window.addEventListener("click", () => {
    if (audio.paused) {
        let randomIndex = Math.floor(Math.random() * tracks.length);
        playTrack(randomIndex);
    }
    switchScreen("S2")
}, { once: true });

document.getElementById("S1-LoadingText").textContent = "Ready.";