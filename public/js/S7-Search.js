// --== Variables ==--
let searchText = document.getElementById("S7-Text");
let searchGalaxy = document.getElementById("S7-Galaxy");
let searchFeature = document.getElementById("S7-Feature");
let searchSort = document.getElementById("S7-Sort");
let resultList = document.getElementById("S7-Results");

const FEATURE_GROUPS = [
    ["Biome", "biomeTypes", ["biome_type"]],
    ["Type", "types", ["type"]],
    ["Resources", "primaryResources", ["resource1"]],
    ["Resources", "resources", ["resource2", "resource3"]],
    ["Race", "lifeforms", ["lifeform"]],
    ["Economy", "economies", ["economy"]],
    ["Trade", "economyTypes", ["economy_type"]],
    ["Sentinels", "sentinels", ["sentinel"]],
    ["Hazard", "hazards", ["hazard"]],
    ["Description", "biomes", ["biome"]]
];


// --== Setup ==--
let fillSearchDropdowns = async () => {
    let options = await loadOptions();
    options.galaxies.forEach(g => searchGalaxy.add(new Option(g, g)));

    let groups = {};
    FEATURE_GROUPS.forEach(([label, key, fields]) => {
        groups[label] ??= document.createElement("optgroup");
        groups[label].label = label;
        options[key].forEach(value => {
            let option = new Option(value, fields.join(",") + "|" + value);
            groups[label].appendChild(option);
        });
    });
    Object.values(groups).forEach(g => searchFeature.appendChild(g));
};


// --== Search ==--
// -= Match =-
let matchesSearch = (planet) => {
    let text = searchText.value.trim().toLowerCase();
    let compact = text.replace(/[^0-9a-f]/g, "");

    if (searchGalaxy.value && planet.galaxy !== searchGalaxy.value) return false;

    if (searchFeature.value) {
        let [fields, value] = searchFeature.value.split("|");
        if (!fields.split(",").some(f => planet[f] === value)) return false;
    }

    if (!text) return true;
    let haystack = [planet.name, planet.star_system, planet.poster].join(" ").toLowerCase();
    return haystack.includes(text) || (compact.length >= 4 && compact.length === text.replace(/[\s:]/g, "").length && planet.glyphs.toLowerCase().includes(compact));
};

// -= Render =-
let renderResults = () => {
    let results = Data.planets.filter(matchesSearch);
    if (searchSort.value === "new") results.reverse();
    if (searchSort.value === "name") results.sort((a, b) => a.name.localeCompare(b.name));

    resultList.innerHTML = "";
    document.getElementById("S7-Count").textContent = Data.loaded
        ? results.length + (results.length === 1 ? " planet" : " planets")
        : "Loading planets...";

    results.forEach(planet => {
        let item = document.createElement("li");
        let button = document.createElement("button");
        button.className = "S7-Result";
        button.innerHTML = `<img alt="" loading="lazy"><span class="S7-ResultText"><b></b><span></span><span class="PlanetMuted"></span></span>`;
        let thumb = button.querySelector("img");
        thumb.onerror = () => thumb.style.visibility = "hidden";
        thumb.src = planet.image;
        button.querySelector("b").textContent = planet.name;
        button.querySelector(".S7-ResultText > span").textContent = planet.star_system + " - " + planet.galaxy;
        button.querySelector(".PlanetMuted").textContent = planetDescription(planet) + " - by " + planet.poster;
        button.addEventListener("click", () => openPlanet(planet.id));
        item.appendChild(button);
        resultList.appendChild(item);
    });
};

// -= Leaderboard =-
let renderLeaderboard = () => {
    let list = document.getElementById("S7-Posters");
    list.innerHTML = "";
    Data.posters.slice(0, 25).forEach(p => {
        let item = document.createElement("li");
        let button = document.createElement("button");
        button.innerHTML = "<span></span><span></span>";
        button.children[0].textContent = p.name;
        button.children[1].textContent = p.count;
        button.title = "Show planets by " + p.name;
        button.addEventListener("click", () => {
            searchText.value = p.name;
            renderResults();
        });
        item.appendChild(button);
        list.appendChild(item);
    });
};


// --== Events ==--
[searchText, searchGalaxy, searchFeature, searchSort].forEach(el => el.addEventListener("input", renderResults));


// --== Init ==--
fillSearchDropdowns();
onDataChange(() => {
    renderResults();
    renderLeaderboard();
});
renderResults();
