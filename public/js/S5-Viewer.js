// --== Variables ==--
let currentPlanet = 0;
let touchStartX = null;

const HAZARD_IMAGES = {
    Cold: "assets/Protection.Cold.png",
    Heat: "assets/Protection.Heat.png",
    Radiation: "assets/Protection.Radiation.png",
    Toxic: "assets/Protection.Toxic.png"
};


// --== Helpers ==--
let setText = (id, text) => document.getElementById(id).textContent = text;

let fillGlyphs = (holder, glyphs) => {
    holder.innerHTML = "";
    [...glyphs].forEach(id => {
        let img = document.createElement("img");
        img.src = glyphImage(id);
        img.alt = id;
        holder.appendChild(img);
    });
};

let isScreen = (id) => document.getElementById(id).classList.contains("active");


// --== Render ==--
let showPlanet = (index) => {
    let total = Data.planets.length;
    let empty = total === 0;

    document.getElementById("S5-Empty").hidden = !empty;
    ["S5-Header", "S5-Glyphs", "S5-Actions", "S5-Footer"].forEach(id => {
        document.getElementById(id).style.visibility = empty ? "hidden" : "";
    });
    if (empty) return;

    currentPlanet = (index + total) % total;
    let planet = Data.planets[currentPlanet];
    let description = planetDescription(planet);
    let counter = (currentPlanet + 1) + "/" + total;

    // -= Viewer =-
    document.getElementById("S5-Image").src = planet.image;
    setText("S5-Name", planet.name);
    setText("S5-System", planet.star_system === "Unknown" ? "Unknown System" : planet.star_system);
    setText("S5-Galaxy", planet.galaxy);
    setText("S5-Description", description);
    setText("S5-Poster", "Posted By: " + planet.poster);
    fillGlyphs(document.getElementById("S5-Glyphs"), planet.glyphs);

    // -= Info =-
    document.getElementById("S6-Backdrop").src = planet.image;
    document.getElementById("S6-Image").src = planet.image;
    let hazard = document.getElementById("S6-Hazard");
    hazard.hidden = !HAZARD_IMAGES[planet.hazard];
    hazard.src = HAZARD_IMAGES[planet.hazard] ?? "";
    hazard.alt = planet.hazard;
    setText("S6-Name", planet.name);
    setText("S6-System", planet.star_system === "Unknown" ? "Unknown System" : planet.star_system);
    setText("S6-Galaxy", planet.galaxy);
    setText("S6-Sentinel", planet.sentinel === "Unknown" ? "Sentinels Unknown" : planet.sentinel);
    setText("S6-Description", description);
    setText("S6-Resources", [planet.resource1, planet.resource2, planet.resource3].join(", "));
    setText("S6-Economy", planet.economy + " : " + planet.lifeform);
    setText("S6-HazardName", planet.hazard);
    setText("S6-Poster", planet.poster);
    setText("S6-Code", formatGlyphs(planet.glyphs));
    setText("S6-Facts", planet.facts);
    document.getElementById("S6-Facts").hidden = !planet.facts;
    fillGlyphs(document.getElementById("S6-Glyphs"), planet.glyphs);

    document.querySelectorAll(".PlanetCounter").forEach(c => c.textContent = counter);
};

// -= Open By Id =-
let openPlanet = (id) => {
    let index = Data.planets.findIndex(p => p.id === id);
    showPlanet(index === -1 ? 0 : index);
    switchScreen("S5");
};


// --== Events ==--
document.querySelectorAll(".PlanetPrev").forEach(b => b.addEventListener("click", () => showPlanet(currentPlanet - 1)));
document.querySelectorAll(".PlanetNext").forEach(b => b.addEventListener("click", () => showPlanet(currentPlanet + 1)));

document.addEventListener("keydown", (e) => {
    if (!isScreen("S5") && !isScreen("S6")) return;
    if (e.target.matches("input, textarea, select")) return;
    if (e.key === "ArrowLeft") showPlanet(currentPlanet - 1);
    if (e.key === "ArrowRight") showPlanet(currentPlanet + 1);
    if (e.key === "Home") switchScreen("S2");
});

["S5", "S6"].forEach(id => {
    let screen = document.getElementById(id);
    screen.addEventListener("touchstart", (e) => touchStartX = e.touches[0].clientX, { passive: true });
    screen.addEventListener("touchend", (e) => {
        if (touchStartX === null) return;
        let distance = e.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(distance) < 60) return;
        showPlanet(currentPlanet + (distance < 0 ? 1 : -1));
    });
});

document.getElementById("S6-Copy").addEventListener("click", async (e) => {
    let button = e.currentTarget;
    try {
        await navigator.clipboard.writeText(document.getElementById("S6-Code").textContent);
        button.textContent = "Copied";
    } catch {
        button.textContent = "Failed";
    }
    setTimeout(() => button.textContent = "Copy", 1500);
});


// -= Broken Images =-["S5-Image", "S6-Image", "S6-Backdrop"].forEach(id => {
    let img = document.getElementById(id);
    img.addEventListener("error", () => img.style.opacity = 0);
    img.addEventListener("load", () => img.style.opacity = 1);
});


// --== Init ==--
onDataChange(() => showPlanet(currentPlanet));
showPlanet(0);
