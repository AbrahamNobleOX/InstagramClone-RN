// React Native
import React, { useState } from "react";
import { Button, StyleSheet, Text, View, TextInput, Image } from "react-native";

// firebase
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, addDoc, serverTimestamp, collection } from "firebase/firestore";
import { auth, firestore, storage } from "../../firebase/firebase.config";

export default function Save(props) {
  const [caption, setCaption] = useState("");

  const uploadImage = async () => {
    const uri = props.route.params.image;
    const childPath = `post/${auth.currentUser.uid}/${Math.random().toString(
      36
    )}`;

    // Convert Image to Blob Image.
    // const blobImage = await new Promise((resolve, reject) => {
    //   const xhr = new XMLHttpRequest();
    //   xhr.onload = function () {
    //     resolve(xhr.response);
    //   };
    //   xhr.onerror = function () {
    //     reject(new TypeError("Network Request Failed"));
    //   };
    //   xhr.responseType = "blob";
    //   xhr.open("GET", uri, true);
    //   xhr.send(null);
    // });

    // Convert Image to Blob Image.
    const response = await fetch(uri);
    const blobImage = await response.blob();

    // Create the file metadata
    /** @type {any} */
    const metadata = {
      contentType: "image/jpeg",
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    const storageRef = ref(storage, childPath);
    const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");

        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            break;
          case "storage/canceled":
            // User canceled the upload
            break;

          // ...

          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          savePostData(downloadURL);
          console.log("File available at", downloadURL);
        });
      }
    );
  };

  const savePostData = (downloadURL) => {
    // Add a new document "auth.currentUser.uid" in collection "posts"
    // addDoc was used to generate an automated id for userPosts ike this example "https://stackoverflow.com/a/70551419"
    // setDoc can be used but an ID is required like this example "https://stackoverflow.com/a/73948819"
    addDoc(
      collection(doc(firestore, "posts", auth.currentUser.uid), "userPosts"),
      {
        downloadURL,
        caption,
        likesCount: 0,
        creation: serverTimestamp(),
      }
    ).then(function () {
      // Navigate to the Main.js component which is the initial route as defined in App.js
      props.navigation.popToTop();
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: props.route.params.image }} />
      <TextInput
        placeholder="Write a Caption..."
        onChangeText={(caption) => setCaption(caption)}
      />
      <Button title="Save" onPress={() => uploadImage()} />
    </View>
  );
}
