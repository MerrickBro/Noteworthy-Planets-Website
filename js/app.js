// --== Variables ==--
let Glyphs = [
    { image: "assets/PORTALSYMBOL.0.png", id: "0" },
    { image: "assets/PORTALSYMBOL.1.png", id: "1" },
    { image: "assets/PORTALSYMBOL.2.png", id: "2" },
    { image: "assets/PORTALSYMBOL.3.png", id: "3" },
    { image: "assets/PORTALSYMBOL.4.png", id: "4" },
    { image: "assets/PORTALSYMBOL.5.png", id: "5" },
    { image: "assets/PORTALSYMBOL.6.png", id: "6" },
    { image: "assets/PORTALSYMBOL.7.png", id: "7" },
    { image: "assets/PORTALSYMBOL.8.png", id: "8" },
    { image: "assets/PORTALSYMBOL.9.png", id: "9" },
    { image: "assets/PORTALSYMBOL.A.png", id: "A" },
    { image: "assets/PORTALSYMBOL.B.png", id: "B" },
    { image: "assets/PORTALSYMBOL.C.png", id: "C" },
    { image: "assets/PORTALSYMBOL.D.png", id: "D" },
    { image: "assets/PORTALSYMBOL.E.png", id: "E" },
    { image: "assets/PORTALSYMBOL.F.png", id: "F" }
];


// --== Screen Switch ==--
function switchScreen(id) {
    document.querySelectorAll(".screen, .active").forEach(s => {
        s.classList.remove("active");
        s.classList.add("inactive");
    });

    const screen = document.getElementById(id);
    if (!screen) return;

    screen.classList.remove("inactive");
    screen.classList.add("active");
}

// --== Music Variables ==--
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

let volumeSlider = document.getElementById("volumeSlider");
let speedSlider = document.getElementById("speedSlider");
let speedValue = document.getElementById("speedValue");
let currentTitle = document.getElementById("currentTitle");
let currentArtist = document.getElementById("currentArtist");
let musicPrevButton = document.getElementById("musicPrevButton");
let musicNextButton = document.getElementById("musicNextButton");
let musicToggleButton = document.getElementById("musicToggleButton");


// --== Music Functions ==--
// -= Volume =-
let setVolume = (value) => {
    audio.volume = value / 2;
};

// -= Speed =-
let setSpeed = (value) => {
    audio.playbackRate = value;
    audio.defaultPlaybackRate = value;
    if (speedValue) speedValue.textContent = Number(value).toFixed(2) + "x";
};

// -= Now Playing =-
let displayCurrentTrackInfo = (index) => {
    let track = tracks[index];
    if (!track) return;

    if (currentTitle) currentTitle.textContent = track.title;
    if (currentArtist) currentArtist.textContent = "by " + track.artist;
};

// -= Toggle Label =-
let updateToggleLabel = () => {
    if (musicToggleButton) musicToggleButton.textContent = audio.paused ? "Music Play" : "Music Pause";
};

// -= Play =-
let playTrack = (index) => {
    let track = tracks[index];
    if (!track) return;

    currentAudioIndex = index;

    audio.pause();
    audio.src = track.file;
    audio.playbackRate = audio.defaultPlaybackRate;

    audio.play().catch(e => console.log("Click page to play"));

    displayCurrentTrackInfo(index);
};

// -= Next / Prev =-
let playNextTrack = () => {
    playTrack((currentAudioIndex + 1) % tracks.length);
};

let playPrevTrack = () => {
    playTrack((currentAudioIndex - 1 + tracks.length) % tracks.length);
};

// -= Toggle =-
let toggleMusic = () => {
    if (!audio.src) return playTrack(currentAudioIndex);
    audio.paused ? audio.play().catch(e => console.log("Click page to play")) : audio.pause();
};


// --== Music Init ==--
setVolume(volumeSlider?.value ?? 0.1);
setSpeed(speedSlider?.value ?? 1);

volumeSlider?.addEventListener("input", () => setVolume(volumeSlider.value));
speedSlider?.addEventListener("input", () => setSpeed(speedSlider.value));
musicPrevButton?.addEventListener("click", playPrevTrack);
musicNextButton?.addEventListener("click", playNextTrack);
musicToggleButton?.addEventListener("click", toggleMusic);

audio.addEventListener("ended", playNextTrack);
audio.addEventListener("play", updateToggleLabel);
audio.addEventListener("pause", updateToggleLabel);
updateToggleLabel();

window.addEventListener("click", () => {
    if (audio.paused) {
        let randomIndex = Math.floor(Math.random() * tracks.length);
        playTrack(randomIndex);
    }
    switchScreen("S2")
}, { once: true });

document.getElementById("S1-LoadingText").textContent = "Ready.";
