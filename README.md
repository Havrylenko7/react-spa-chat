# React Chat App

This project was created with React, TypeScript, Firebase.

## Getting started

First, download current repository:

```bash
git clone https://github.com/Havrylenko7/react-spa-chat.git
```

Initialize your project using [Firebase](https://firebase.google.com). Follow these [steps](https://firebase.google.com/docs/firestore/quickstart) related to the creation of a new project. Then take a look on that [page](https://firebase.google.com/docs/storage/web/start) as well for file storage creation and necessary tuning.

After initializing you have to create your `firebaseConfig.js` file in `src` folder which should look like that:
```
export const firebaseConfig = {
  apiKey: "yourApiKey",
  authDomain: "yourAuthDomain",
  projectId: "yourprojectId",
  storageBucket: "yourStorageBucket",
  messagingSenderId: "yourMessagingSenderId",
  appId: "yourAppId"
};
```
Also, you have to create manually in your Firestore Database `chats` and `users` collections.

Then install all packages and run the development server:

```bash
npm install

npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
