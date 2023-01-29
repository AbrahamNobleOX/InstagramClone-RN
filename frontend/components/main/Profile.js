// React Native
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, FlatList, Button } from "react-native";

// Redux
import { connect } from "react-redux";

// firebase
import { signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, firestore } from "../../firebase/firebase.config";

function Profile(props) {
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  // props.following is different from following because props.following is from redux and following is the boolean in the Hook above.

  // useEffect, adds the ability to perform side effects from a function component. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes
  useEffect(() => {
    // currentUser & posts is gotten from redux.
    const { currentUser, posts } = props;
    // console.log({ currentUser, posts });

    // props.route.params.uid is gotten from the props passed when navigating to this page from Main.js
    if (props.route.params.uid === auth.currentUser.uid) {
      setUser(currentUser);
      setUserPosts(posts);
    } else {
      // If user is not the current user, load the user's data afresh.
      getDoc(doc(firestore, "users", props.route.params.uid)).then(
        (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data());
          } else {
            console.log("User Does Not Exist!");
          }
        }
      );
      // Load the user's posts.
      getDocs(
        query(
          collection(firestore, "posts", props.route.params.uid, "userPosts"),
          orderBy("creation", "asc")
        )
      ).then((docSnap) => {
        let posts = docSnap.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });
        // console.log(posts);
        setUserPosts(posts);
      });
    }

    // If current user is following the user its profile is opened, set following boolean to true which shows the "Following" buuton, else set to false and ask current user to follow.
    if (props.following.indexOf(props.route.params.uid) > -1) {
      setFollowing(true);
    } else {
      setFollowing(false);
    }
  }, [props.route.params.uid, props.following]); // [props.route.params.uid, props.following] is used for useEffect to be re-called everytime uid and following variable state changes.
  // props.following is different from following because props.following is from redux and following is the boolean in the Hook above.

  // follow user function
  const onFollow = () => {
    setDoc(
      doc(
        firestore,
        "following",
        auth.currentUser.uid,
        "userFollowing",
        props.route.params.uid
      ),
      {}
    ).then(function () {});
  };

  // Unfollow user function
  const onUnfollow = () => {
    deleteDoc(
      doc(
        firestore,
        "following",
        auth.currentUser.uid,
        "userFollowing",
        props.route.params.uid
      )
    ).then(function () {});
  };

  // Logout function
  const onLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("Sign Out Successful!");
      })
      .catch((error) => {
        // An error happened.
        console.log("Error Signing Out!");
      });
  };

  // If useEffect has not loaded i.e if user is null.
  if (user === null) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>

        {props.route.params.uid !== auth.currentUser.uid ? (
          <View>
            {following ? (
              <Button title="Following" onPress={() => onUnfollow()} />
            ) : (
              <Button title="Follow" onPress={() => onFollow()} />
            )}
          </View>
        ) : (
          <Button title="Logout" onPress={() => onLogout()} />
        )}
      </View>

      <View style={styles.containerGallery}>
        <FlatList
          numColumns={3}
          horizontal={false}
          data={userPosts}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <Image style={styles.image} source={{ uri: item.downloadURL }} />
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerInfo: {
    margin: 20,
  },
  containerGallery: {
    flex: 1,
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
  containerImage: {
    flex: 1 / 3,
  },
});

// To Access userState in ../redux/reducers/index and map to currentUser in ../redux/reducers/user
const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
  following: store.userState.following,
});

// Export the constants and class variables.
export default connect(mapStateToProps, null)(Profile);
