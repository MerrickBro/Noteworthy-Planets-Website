// --== Loading Glyphs ==--
document.querySelectorAll(".loadingGlyph").forEach(img => {
    let glyph = Glyphs[Math.floor(Math.random() * Glyphs.length)];
    img.src = glyph.image;
    img.alt = "";
});


// --== Start Hint ==--
let isTouch = window.matchMedia("(pointer: coarse)").matches;
document.getElementById("S1-StartHint").textContent = (isTouch ? "Tap" : "Click") + " anywhere to start";
