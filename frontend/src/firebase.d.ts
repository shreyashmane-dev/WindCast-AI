declare module "firebase/app" {
  export function initializeApp(config: any): any;
  export function getApps(): any[];
  export function getApp(): any;
}

declare module "firebase/auth" {
  export function getAuth(app?: any): any;
  export function signInWithEmailAndPassword(auth: any, email: any, password: any): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: any, password: any): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export class GoogleAuthProvider {
    constructor();
  }
  export function signInWithPopup(auth: any, provider: any): Promise<any>;
  export function onAuthStateChanged(auth: any, next: (user: any) => void): () => void;
}
