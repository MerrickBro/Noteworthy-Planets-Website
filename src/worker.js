import options from "../public/data/options.json";

// --== Variables ==--
const POST_LIMIT = 5;
const POST_WINDOW_SECONDS = 3600;

const PLANET_COLUMNS = "id, name, star_system, galaxy, type, biome, economy, lifeform, resource1, resource2, resource3, sentinel, hazard, facts, image, poster, glyphs, created_at";

const TEXT_FIELDS = {
    name: 60,
    star_system: 60,
    poster: 40,
    facts: 1000
};

const CHOICE_FIELDS = {
    galaxy: options.galaxies,
    type: options.types,
    biome: options.biomes,
    economy: options.economies,
    lifeform: options.lifeforms,
    resource1: options.primaryResources,
    resource2: options.resources,
    resource3: options.resources,
    sentinel: options.sentinels,
    hazard: options.hazards
};


// --== Helpers ==--
// -= Responses =-
let json = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
};

let fail = (message, status = 400) => json({ error: message }, status);

// -= Admin =-
let isAdmin = (request, env) => {
    let key = request.headers.get("x-admin-key");
    return Boolean(env.ADMIN_KEY) && key === env.ADMIN_KEY;
};

// -= Validate Planet =-
let validatePlanet = (body) => {
    let planet = {};

    for (let [field, max] of Object.entries(TEXT_FIELDS)) {
        let value = String(body[field] ?? "").trim();
        if (field === "star_system" && !value) value = "Unknown";
        if (field !== "facts" && !value) return { error: "Missing " + field.replace("_", " ") };
        if (value.length > max) return { error: field.replace("_", " ") + " is too long" };
        planet[field] = value;
    }

    for (let [field, choices] of Object.entries(CHOICE_FIELDS)) {
        let value = String(body[field] ?? "");
        if (!choices.includes(value)) return { error: "Pick a valid " + field };
        planet[field] = value;
    }

    let glyphs = String(body.glyphs ?? "").toUpperCase();
    if (!/^[0-9A-F]{12}$/.test(glyphs)) return { error: "Glyph address needs all 12 glyphs" };
    planet.glyphs = glyphs;

    let image = String(body.image ?? "").trim();
    try {
        let url = new URL(image);
        if (url.protocol !== "https:" || image.length > 500) throw new Error();
    } catch {
        return { error: "Image must be an https link" };
    }
    planet.image = image;

    return { planet };
};


// --== Routes ==--
// -= List Planets =-
let listPlanets = async (env) => {
    let { results } = await env.DB.prepare(
        `SELECT ${PLANET_COLUMNS} FROM planets WHERE hidden = 0 ORDER BY id`
    ).all();
    return json({ planets: results });
};

// -= Get Planet =-
let getPlanet = async (env, id) => {
    let planet = await env.DB.prepare(
        `SELECT ${PLANET_COLUMNS} FROM planets WHERE id = ? AND hidden = 0`
    ).bind(id).first();
    return planet ? json({ planet }) : fail("Planet not found", 404);
};

// -= List Posters =-
let listPosters = async (env) => {
    let { results } = await env.DB.prepare(
        "SELECT poster AS name, COUNT(*) AS count FROM planets WHERE hidden = 0 GROUP BY poster ORDER BY count DESC, MIN(id)"
    ).all();
    return json({ posters: results });
};

// -= Create Planet =-
let createPlanet = async (request, env) => {
    let body;
    try {
        body = await request.json();
    } catch {
        return fail("Invalid request");
    }

    let { planet, error } = validatePlanet(body);
    if (error) return fail(error);

    let ip = request.headers.get("cf-connecting-ip") ?? "unknown";
    let now = Math.floor(Date.now() / 1000);

    if (!isAdmin(request, env)) {
        let recent = await env.DB.prepare(
            "SELECT COUNT(*) AS count FROM post_log WHERE ip = ? AND created_at > ?"
        ).bind(ip, now - POST_WINDOW_SECONDS).first();
        if (recent.count >= POST_LIMIT) return fail("Too many posts, try again in an hour", 429);
    }

    let existing = await env.DB.prepare(
        "SELECT poster FROM planets WHERE poster = ? LIMIT 1"
    ).bind(planet.poster).first();
    if (existing) planet.poster = existing.poster;

    let fields = Object.keys(planet);
    let result = await env.DB.prepare(
        `INSERT INTO planets (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")}) RETURNING ${PLANET_COLUMNS}`
    ).bind(...fields.map(f => planet[f])).first();

    await env.DB.batch([
        env.DB.prepare("INSERT INTO post_log (ip, created_at) VALUES (?, ?)").bind(ip, now),
        env.DB.prepare("DELETE FROM post_log WHERE created_at < ?").bind(now - POST_WINDOW_SECONDS)
    ]);

    return json({ planet: result }, 201);
};

// -= Hide Planet =-
let hidePlanet = async (request, env, id) => {
    if (!isAdmin(request, env)) return fail("Not allowed", 403);
    let result = await env.DB.prepare("UPDATE planets SET hidden = 1 WHERE id = ?").bind(id).run();
    return result.meta.changes ? json({ ok: true }) : fail("Planet not found", 404);
};


// --== Router ==--
let handleApi = async (request, env, path) => {
    let method = request.method;
    let planetMatch = path.match(/^\/api\/planets\/(\d+)$/);

    if (path === "/api/planets" && method === "GET") return listPlanets(env);
    if (path === "/api/planets" && method === "POST") return createPlanet(request, env);
    if (path === "/api/posters" && method === "GET") return listPosters(env);
    if (planetMatch && method === "GET") return getPlanet(env, Number(planetMatch[1]));
    if (planetMatch && method === "DELETE") return hidePlanet(request, env, Number(planetMatch[1]));

    return fail("Not found", 404);
};

export default {
    async fetch(request, env) {
        let path = new URL(request.url).pathname;

        if (path.startsWith("/api/")) {
            try {
                return await handleApi(request, env, path);
            } catch (e) {
                console.error(e);
                return fail("Server error", 500);
            }
        }

        return env.ASSETS.fetch(request);
    }
};
