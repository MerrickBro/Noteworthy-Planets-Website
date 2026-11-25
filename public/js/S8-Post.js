// --== Variables ==--
let postForm = document.getElementById("S8-Main");
let gateForm = document.getElementById("S8-Gate");
let gateStatus = document.getElementById("S8-GateStatus");
let postStatus = document.getElementById("S8-Status");
let uploadButton = document.getElementById("S8-Upload");
let slotHolder = document.getElementById("S8-GlyphSlots");
let glyphCode = document.getElementById("S8-GlyphCode");
let previewBox = document.getElementById("S8-Preview");
let postGlyphs = "";
let postHazard = "None";
let lastPostedId = null;

const HAZARD_ICONS = {
    None: null,
    Cold: "assets/Protection.Cold.png",
    Heat: "assets/Protection.Heat.png",
    Radiation: "assets/Protection.Radiation.png",
    Toxic: "assets/Protection.Toxic.png"
};


// --== Setup ==--
// -= Dropdowns =-
let fillDropdowns = async () => {
    let options = await loadOptions();
    postForm.querySelectorAll("select[data-options]").forEach(select => {
        options[select.dataset.options].forEach(value => select.add(new Option(value, value)));
    });
    postForm.resource2.selectedIndex = 0;
    postForm.resource3.selectedIndex = 1;
};

// -= Hazards =-
let buildHazards = () => {
    let holder = document.getElementById("S8-Hazards");
    Object.entries(HAZARD_ICONS).forEach(([name, icon]) => {
        let button = document.createElement("button");
        button.type = "button";
        button.className = "S8-Hazard";
        button.setAttribute("role", "radio");
        button.dataset.hazard = name;
        button.title = name;
        button.innerHTML = icon ? `<img src="${icon}" alt="">` : "<span>None</span>";
        button.setAttribute("aria-label", name);
        button.addEventListener("click", () => setHazard(name));
        holder.appendChild(button);
    });
    setHazard("None");
};

let setHazard = (name) => {
    postHazard = name;
    document.querySelectorAll(".S8-Hazard").forEach(b => {
        let selected = b.dataset.hazard === name;
        b.classList.toggle("S8-Selected", selected);
        b.setAttribute("aria-checked", selected);
    });
};


// --== Account ==--
// -= Show Gate Or Form =-
let updateAccountView = () => {
    let signedIn = Boolean(Auth.session);
    gateForm.hidden = signedIn;
    postForm.hidden = !signedIn;
    if (!signedIn) {
        postForm.poster.value = "";
        return;
    }

    document.getElementById("S8-AccountText").textContent = "Signed in" + (Auth.email ? " as " + Auth.email : "");
    let poster = postForm.poster;
    poster.readOnly = Boolean(Auth.name);
    poster.placeholder = Auth.name ? "" : "Pick a poster name (locked after your first post)";
    poster.value = Auth.name ?? poster.value;
};

// -= Sign In / Sign Up =-
let showGateStatus = (message, kind) => {
    gateStatus.textContent = message;
    gateStatus.className = kind ? "S8-" + kind : "";
};

gateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let action = e.submitter?.dataset.action ?? "signin";
    let email = gateForm.email.value.trim();
    let password = gateForm.password.value;
    if (!email || password.length < 6) {
        showGateStatus("Enter your email and a password of at least 6 characters", "Error");
        return;
    }

    let buttons = gateForm.querySelectorAll("button");
    buttons.forEach(b => b.disabled = true);
    showGateStatus(action === "signup" ? "Creating account..." : "Signing in...");
    try {
        if (action === "signin") {
            await signIn(email, password);
            showGateStatus("");
        } else if (await signUp(email, password)) {
            showGateStatus("");
        } else {
            showGateStatus("Check your email to confirm your account, then sign in here.", "Success");
        }
        gateForm.password.value = "";
    } catch (err) {
        showGateStatus(err.message, "Error");
    }
    buttons.forEach(b => b.disabled = false);
});

document.getElementById("S8-SignOut").addEventListener("click", signOut);


// --== Glyph Address ==--
// -= Build =-
let buildGlyphInput = () => {
    for (let i = 0; i < 12; i++) {
        let slot = document.createElement("button");
        slot.type = "button";
        slot.className = "S8-Slot";
        slot.setAttribute("aria-label", "Glyph slot " + (i + 1));
        slot.addEventListener("click", () => setPostGlyphs(postGlyphs.slice(0, i)));
        slot.appendChild(document.createElement("img"));
        slotHolder.appendChild(slot);
    }

    let pad = document.getElementById("S8-GlyphPad");
    Glyphs.forEach(g => {
        let key = document.createElement("button");
        key.type = "button";
        key.className = "S8-Key";
        key.setAttribute("aria-label", "Glyph " + g.id);
        key.innerHTML = `<img src="${g.image}" alt="">`;
        key.addEventListener("click", () => setPostGlyphs(postGlyphs + g.id));
        pad.appendChild(key);
    });
};

// -= Update =-
let setPostGlyphs = (value, updateInput = true) => {
    postGlyphs = value.slice(0, 12);
    [...slotHolder.children].forEach((slot, i) => {
        let id = postGlyphs[i];
        slot.classList.toggle("S8-Filled", Boolean(id));
        slot.classList.toggle("S8-Next", i === postGlyphs.length);
        slot.firstChild.src = id ? glyphImage(id) : "";
    });
    if (updateInput) glyphCode.value = formatGlyphs(postGlyphs);
};


// --== Image Preview ==--
let updatePreview = () => {
    let img = previewBox.querySelector("img");
    let url = postForm.image.value.trim();
    previewBox.classList.remove("S8-PreviewError");
    if (!/^https:\/\/.+/.test(url)) {
        img.hidden = true;
        return;
    }
    img.onload = () => img.hidden = false;
    img.onerror = () => {
        img.hidden = true;
        previewBox.classList.add("S8-PreviewError");
    };
    img.src = url;
};


// --== Submit ==--
// -= Validate =-
let findProblem = () => {
    for (let field of ["name", "poster"]) {
        if (!postForm[field].value.trim()) return { field, message: field === "poster" ? "Pick a poster name" : "Fill in the planet name" };
    }
    if (postGlyphs.length !== 12) return { field: null, message: "Add all 12 glyphs of the portal address" };
    if (!/^https:\/\/.+/.test(postForm.image.value.trim())) return { field: "image", message: "Add an https image link (see the ? guide)" };
    return null;
};

let showStatus = (message, kind) => {
    postStatus.textContent = message;
    postStatus.className = kind ? "S8-" + kind : "";
};

// -= Upload =-
postForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (lastPostedId) {
        openPlanet(lastPostedId);
        return;
    }

    let problem = findProblem();
    if (problem) {
        showStatus(problem.message, "Error");
        if (problem.field) postForm[problem.field].focus();
        return;
    }

    let planet = Object.fromEntries(new FormData(postForm));
    planet.glyphs = postGlyphs;
    planet.hazard = postHazard;

    uploadButton.disabled = true;
    showStatus("Uploading...");
    try {
        let saved = await postPlanet(planet);
        Auth.name = saved.poster;
        updateAccountView();
        await loadPlanets();
        lastPostedId = saved.id;
        showStatus("Planet posted! Thanks, " + saved.poster + ".", "Success");
        uploadButton.textContent = "View Your Planet";
        resetPostForm();
    } catch (err) {
        showStatus(err.message, "Error");
    }
    uploadButton.disabled = false;
});

// -= Reset =-
let resetPostForm = () => {
    let poster = postForm.poster.value;
    postForm.reset();
    postForm.poster.value = poster;
    postForm.resource2.selectedIndex = 0;
    postForm.resource3.selectedIndex = 1;
    setPostGlyphs("");
    setHazard("None");
    updatePreview();
};

postForm.addEventListener("input", (e) => {
    if (e.target === glyphCode) return;
    if (lastPostedId) {
        lastPostedId = null;
        uploadButton.textContent = "Upload Planet";
    }
});


// --== Events ==--
glyphCode.addEventListener("input", () => {
    setPostGlyphs(glyphCode.value.toUpperCase().replace(/[^0-9A-F]/g, ""), false);
});
glyphCode.addEventListener("blur", () => glyphCode.value = formatGlyphs(postGlyphs));
document.getElementById("S8-GlyphBack").addEventListener("click", () => setPostGlyphs(postGlyphs.slice(0, -1)));
postForm.image.addEventListener("input", updatePreview);


// --== Init ==--
fillDropdowns();
buildHazards();
buildGlyphInput();
setPostGlyphs("");
onAuthChange(updateAccountView);
updateAccountView();
