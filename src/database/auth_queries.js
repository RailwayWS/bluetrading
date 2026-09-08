import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";

// Firebase's raw error codes ("Firebase: Error (auth/invalid-credential).")
// aren't meaningful to a site visitor — map the common ones to plain English.
function getSignInErrorMessage(code) {
    switch (code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Incorrect email or password.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/too-many-requests":
            return "Too many failed attempts. Please wait a moment and try again.";
        case "auth/user-disabled":
            return "This account has been disabled.";
        default:
            return "Something went wrong while signing in. Please try again.";
    }
}

export function sign_up(email, password) {
    const auth = getAuth();

    return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        return { success: true, user: userCredential.user };
    })
    .catch((error) => {
        return { success: false, error: error.message };
  });
}

export function anon_sign_in() {
    const auth = getAuth();

    return signInAnonymously(auth).then(() => {
        return { success: true };
    }).catch((error) => {
        console.error("Error signing in anonymously:", error);
        return { success: false, error: error.message };
    });
}

export function sign_in(email, password) {
    const auth = getAuth();

    return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        return { success: true, user: userCredential.user };
    })
    .catch((error) => {
        return { success: false, error: getSignInErrorMessage(error.code) };
  });
};
