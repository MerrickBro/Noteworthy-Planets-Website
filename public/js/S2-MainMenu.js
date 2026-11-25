// --== Glyph Button ==--
let glyphButtonImage = document.getElementById("S2-GlyphButtonImage");

setInterval(() => {
    if (!document.getElementById("S2").classList.contains("active")) return;
    let glyph = Glyphs[Math.floor(Math.random() * Glyphs.length)];
    glyphButtonImage.src = glyph.image;
}, 400);


// --== Planet Fetcher ==--
let menuRefreshStatus = document.getElementById("S2-RefreshStatus");
document.getElementById("S2-RefreshButton").addEventListener("click", () => refreshWithFeedback(menuRefreshStatus, ""));
