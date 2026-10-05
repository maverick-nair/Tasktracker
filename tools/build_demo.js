// Builds dist-web/demo.html: the app with an in-browser stand-in for Firebase
// (tests/mock-platform.js) and sample data, for previewing the design without
// a backend. Usage: node tools/build_demo.js <seed.json from tests/ui.smoke.js>
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const seedPath = process.argv[2];
if (!seedPath) throw new Error("usage: node tools/build_demo.js <seed.json>");
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const PW = "Demo#2026";
for (const u of Object.values(seed.auth)) u.password = PW;
const accounts = [["Owner", "manu.nair@knolskape.com"], ["Product manager", "raghav@knolskape.com"], ["Designer", "pragati@knolskape.com"]]
  .map(([label, email]) => ({ label, email, password: PW }));
const OWNERS = [["Manu Nair", "manu.nair@knolskape.com"], ["Sreedhar Badrinath", "sreedhar.badrinath@knolskape.com"], ["Kalyan Maganti", "kalyan.maganti@knolskape.com"]];
for (const [name, email] of OWNERS) {
  const uid = "u_" + email.split("@")[0].replace(/[^a-z0-9]/g, "");
  seed.auth[email] = seed.auth[email] || { uid, password: PW, displayName: name, verified: true };
  seed.db[`members/${uid}`] = seed.db[`members/${uid}`] || { role: "owner", name: "", email, displayName: name, joinedAt: new Date().toISOString() };
}
const config = { firebase: {}, ownerEmails: OWNERS.map((o) => o[1]), allowedDomain: "knolskape.com", demoAccounts: accounts };
const mock = fs.readFileSync(path.join(root, "tests/mock-platform.js"), "utf8");
const demo = `<script>
window.DTH_CONFIG = ${JSON.stringify(config)};
${mock}
(function () {
  const P = window.DTHPlatform, signUp = P.auth.signUp;
  // Sample data on first open (kept in the browser, or in memory where storage is blocked); new sign-ups are treated as verified
  const st = P.__store;
  if (!st.getItem("mockdb")) { st.setItem("mockdb", ${JSON.stringify(JSON.stringify(seed.db))}); st.setItem("mockauth", ${JSON.stringify(JSON.stringify(seed.auth))}); }
  P.auth.signUp = async (email, pw, name) => { const u = await signUp(email, pw, name); window.__verifyEmail(email); return { ...u, emailVerified: true }; };
  // Inside the claude.ai artifact viewer the save goes through its downloads capability; elsewhere a plain download link
  P.download = async (filename, blob) => {
    const dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null;
    if (dl) return dl.save({ filename, data: blob });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000); return { status: "saved" };
  };
})();
</script>
`;
let html = fs.readFileSync(path.join(root, "dist-web/index.html"), "utf8");
html = html.replace(/<script src="https:\/\/www\.gstatic\.com[^"]+"><\/script>\n/g, "").replace('<script src="firebase-config.js"></script>\n<script src="platform.js"></script>\n', demo);
if (!html.includes("DTH_CONFIG")) throw new Error("platform scripts not found in dist-web/index.html");
fs.writeFileSync(path.join(root, "dist-web/demo.html"), html);
// Same page as a fragment for publishing as a claude.ai artifact (the viewer adds the document skeleton)
const frag = html.replace(/^<!doctype html>\s*<html lang="en">\s*<head>\s*/, "").replace(/<meta[^>]*>\s*/g, "").replace("</head>\n<body>\n", "").replace("</body>\n</html>\n", "");
fs.writeFileSync(path.join(root, "dist-web/artifact.html"), frag);
console.log(`dist-web/demo.html ${(html.length / 1024).toFixed(0)} KB`);
