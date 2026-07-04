declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: {
        id: string;
        email: string;
        name: string;
        isAdmin: boolean;
      } | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};

declare global {
  interface Document {
    startViewTransition?(
      callback: () => Promise<void> | void,
    ): ViewTransition;
  }
}