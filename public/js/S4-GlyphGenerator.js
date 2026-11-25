// --== Variables ==--
let glyphGrid = document.getElementById("S4-Glyphs");
let codeInput = document.getElementById("S4-Code");
let copyButton = document.getElementById("S4-CopyButton");
let glyphIDs = Glyphs.map(g => g.id).join("");
let currentAddress = "";


// --== Address ==--
// -= Random Hex =-
let randomHex = (min, max, length) => {
    let value = min + Math.floor(Math.random() * (max - min + 1));
    return value.toString(16).toUpperCase().padStart(length, "0");
};

// -= Generate =-
// Portal address layout: planet (1) system (3) Y (2) Z (3) X (3)
let generateAddress = () => {
    return randomHex(1, 6, 1) + randomHex(1, 0x2FF, 3) + randomHex(0, 0xFF, 2) + randomHex(0, 0xFFF, 3) + randomHex(0, 0xFFF, 3);
};

// -= Format =-
let formatAddress = (address) => {
    return address.match(/.{1,4}/g)?.join(":") ?? "";
};

let cleanAddress = (text) => {
    return text.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 12);
};


// --== Display ==--
// -= Build Grid =-
let buildGlyphGrid = () => {
    for (let i = 0; i < 12; i++) {
        let button = document.createElement("button");
        button.className = "S4-Glyph";
        button.setAttribute("aria-label", "Glyph " + (i + 1));
        button.addEventListener("click", () => cycleGlyph(i));
        button.appendChild(document.createElement("img"));
        glyphGrid.appendChild(button);
    }
};

// -= Show Address =-
let showAddress = (address, updateInput = true) => {
    currentAddress = address;
    [...glyphGrid.children].forEach((button, i) => {
        let img = button.firstChild;
        let id = address[i];
        button.classList.toggle("S4-Empty", !id);
        img.src = id ? Glyphs[glyphIDs.indexOf(id)].image : "";
        img.alt = id ?? "";
    });
    if (updateInput) codeInput.value = formatAddress(address);
};

// -= Cycle One Glyph =-
let cycleGlyph = (index) => {
    let address = currentAddress.padEnd(12, "0").split("");
    address[index] = glyphIDs[(glyphIDs.indexOf(address[index]) + 1) % 16];
    showAddress(address.join(""));
};

// -= Animate =-
let rollAddress = () => {
    let finalAddress = generateAddress();
    let rolls = 0;
    let roll = setInterval(() => {
        rolls++;
        if (rolls >= 8) {
            clearInterval(roll);
            showAddress(finalAddress);
            return;
        }
        showAddress(generateAddress());
    }, 45);
};


// --== Events ==--
document.getElementById("S4-GenerateButton").addEventListener("click", rollAddress);

codeInput.addEventListener("input", () => {
    showAddress(cleanAddress(codeInput.value), false);
});

codeInput.addEventListener("blur", () => {
    codeInput.value = formatAddress(currentAddress);
});

copyButton.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(formatAddress(currentAddress));
        copyButton.textContent = "Copied";
    } catch {
        copyButton.textContent = "Failed";
    }
    setTimeout(() => copyButton.textContent = "Copy", 1500);
});

document.addEventListener("keydown", (e) => {
    let onS4 = document.getElementById("S4").classList.contains("active");
    if (onS4 && e.key === " " && document.activeElement !== codeInput) {
        e.preventDefault();
        rollAddress();
    }
});


// --== Init ==--
buildGlyphGrid();
showAddress(generateAddress());
