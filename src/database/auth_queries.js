import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";


export function sign_up(email, password) {
    const auth = getAuth();
    
    return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        return { success: true, user };
    })
    .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        return { success: false, error: error.message };
  });
}

export function sign_in(email, password) {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        return { success: true, user };
    })
    .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        return { success: false, error: error.message };
  });
};