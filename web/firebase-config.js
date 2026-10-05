// Design Task Hub: deployment settings. Fill these in once (see DEPLOY.md).
// The Firebase values are public identifiers, not secrets; access is enforced by
// firestore.rules on the server.
window.DTH_CONFIG = {
  firebase: {
    apiKey: "",            // Project settings > General > Your apps > Web app
    authDomain: "",        // e.g. design-task-hub.firebaseapp.com
    projectId: "",         // e.g. design-task-hub
    appId: "",
  },
  // Owners: these accounts get the Owner Dashboard as soon as they sign up (written into the security rules at build time)
  ownerEmails: ["manu.nair@knolskape.com", "sreedhar.badrinath@knolskape.com", "kalyan.maganti@knolskape.com"],
  allowedDomain: "knolskape.com",        // only these emails can have accounts
  // emulators: { auth: "http://127.0.0.1:9099", firestoreHost: "127.0.0.1", firestorePort: 8080 },
};
