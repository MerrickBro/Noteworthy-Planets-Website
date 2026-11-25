// --== Variables ==--
const SUPABASE_URL = "https://xvhukcmeygqdykuvmqti.supabase.co";
const SUPABASE_KEY = "sb_publishable_DXN4F8vQJSFhDuhaZHv81g_veAEi1qq";
const SESSION_KEY = "np-session";

let Auth = {
    session: null,
    name: null,
    email: ""
};

let authListeners = [];


// --== Storage ==--
let saveSession = (session) => {
    Auth.session = session;
    try {
        if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        else localStorage.removeItem(SESSION_KEY);
    } catch {}
};

let readSession = () => {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
};

let toSession = (data) => ({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Number(data.expires_at ?? Math.floor(Date.now() / 1000) + Number(data.expires_in ?? 3600))
});


// --== Supabase Requests ==--
// -= Call =-
let authCall = async (path, body, token) => {
    let headers = { apikey: SUPABASE_KEY, "content-type": "application/json" };
    if (token) headers.authorization = "Bearer " + token;
    let response = await fetch(SUPABASE_URL + "/auth/v1/" + path, {
        method: body ? "POST" : "GET",
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    let result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.msg ?? result.error_description ?? result.message ?? "Account server error");
    return result;
};

// -= Sign In =-
let signIn = async (email, password) => {
    let data = await authCall("token?grant_type=password", { email, password });
    saveSession(toSession(data));
    await loadAccount();
};

// -= Sign Up =-
let signUp = async (email, password) => {
    let redirect = encodeURIComponent(location.origin + "/");
    let data = await authCall("signup?redirect_to=" + redirect, { email, password });
    if (!data.access_token) return false;
    saveSession(toSession(data));
    await loadAccount();
    return true;
};

// -= Sign Out =-
let signOut = async () => {
    let token = Auth.session?.access_token;
    saveSession(null);
    Auth.name = null;
    Auth.email = "";
    notifyAuth();
    if (token) authCall("logout", {}, token).catch(() => {});
};

// -= Fresh Token =-
let getAccessToken = async () => {
    let session = Auth.session;
    if (!session) return null;
    if (session.expires_at - 60 > Date.now() / 1000) return session.access_token;
    try {
        let data = await authCall("token?grant_type=refresh_token", { refresh_token: session.refresh_token });
        saveSession(toSession(data));
        return Auth.session.access_token;
    } catch {
        saveSession(null);
        notifyAuth();
        return null;
    }
};


// --== Account ==--
let loadAccount = async () => {
    let token = await getAccessToken();
    if (token) {
        let response = await fetch("api/me", { headers: { authorization: "Bearer " + token } });
        if (response.ok) {
            let account = await response.json();
            Auth.name = account.name;
            Auth.email = account.email;
        } else if (response.status === 401) saveSession(null);
    }
    notifyAuth();
};

let onAuthChange = (fn) => authListeners.push(fn);

let notifyAuth = () => authListeners.forEach(fn => fn());


// --== Email Link ==--
// Confirmation links land here with the session in the URL hash
let readEmailLink = () => {
    let params = new URLSearchParams(location.hash.slice(1));
    if (!params.get("access_token") && !params.get("error_description")) return;
    history.replaceState(null, "", location.pathname + location.search);
    if (params.get("access_token")) saveSession(toSession(Object.fromEntries(params)));
};


// --== Init ==--
readEmailLink();
Auth.session = Auth.session ?? readSession();
loadAccount().catch(e => console.log(e.message));
