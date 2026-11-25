// --== Variables ==--
let Data = {
    options: null,
    planets: [],
    posters: [],
    loaded: false
};

let dataListeners = [];


// --== Loading ==--
// -= Options =-
let loadOptions = async () => {
    if (Data.options) return Data.options;
    let response = await fetch("data/options.json");
    Data.options = await response.json();
    return Data.options;
};

// -= Planets & Posters =-
let loadPlanets = async () => {
    let before = Data.planets.length;
    let [planetRes, posterRes] = await Promise.all([fetch("api/planets"), fetch("api/posters")]);
    if (!planetRes.ok || !posterRes.ok) throw new Error("Could not reach the planet database");

    Data.planets = (await planetRes.json()).planets;
    Data.posters = (await posterRes.json()).posters;
    let added = Data.loaded ? Data.planets.length - before : 0;
    Data.loaded = true;

    dataListeners.forEach(fn => fn());
    return { added, total: Data.planets.length };
};

let onDataChange = (fn) => dataListeners.push(fn);

// -= Post =-
let postPlanet = async (planet) => {
    let response = await fetch("api/planets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(planet)
    });
    let result = await response.json().catch(() => ({ error: "Server error" }));
    if (!response.ok) throw new Error(result.error ?? "Upload failed");
    return result.planet;
};


// --== Refresh Feedback ==--
// Shows "2 New Planets" then "19 Total Planets" like the old Data Fetcher
let refreshWithFeedback = async (label, resetText) => {
    label.textContent = "Fetching...";
    try {
        let { added, total } = await loadPlanets();
        label.textContent = added + (added === 1 ? " New Planet" : " New Planets");
        setTimeout(() => label.textContent = total + " Total Planets", 1500);
    } catch (e) {
        label.textContent = "Offline";
    }
    setTimeout(() => label.textContent = resetText, 3000);
};


// --== Helpers ==--
let glyphImage = (id) => "assets/PORTALSYMBOL." + id + ".png";

let formatGlyphs = (glyphs) => glyphs.match(/.{1,4}/g)?.join(":") ?? "";

let planetDescription = (planet) => {
    if (planet.biome === "Of Light") return planet.type + " Of Light";
    if (planet.biome.includes("Anomaly") || planet.biome.includes("Globe") || planet.biome.includes("Detected") || planet.biome.includes("Detonation") || planet.biome.includes("Catastrophe")) return planet.biome;
    return planet.biome + " " + planet.type;
};


// --== Init ==--
loadOptions();
loadPlanets().catch(e => console.log(e.message));
