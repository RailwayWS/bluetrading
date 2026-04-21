import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export function sign_up(email, password) {
    const auth = getAuth();

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        return true;
    })
    .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        return false;
  });
}

export function sign_in(email, password) {
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        return true;
    })
    .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        return false;
  });
};