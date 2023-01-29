// React Native
import React, { useState, useEffect } from "react";
import { StyleSheet, Button, View, Text, Image, FlatList } from "react-native";

// firebase
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, firestore } from "../../firebase/firebase.config";

// Redux
import { connect } from "react-redux";

function Feed(props) {
  const [posts, setPosts] = useState([]);

  // useEffect, adds the ability to perform side effects from a function component. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes
  // useEffect is used to trigger a function whenever you update a variable
  useEffect(() => {
    // Empty Array
    // let posts = [];

    // If count of loaded user following gotten from users.js is equal to the number of following gotten from user.js in redux.
    if (
      props.usersFollowingLoaded == props.following.length &&
      props.following.length !== 0
    ) {
      // for each of the user following
      // for (let i = 0; i < props.following.length; i++) {
      //   const user = props.users.find((el) => el.uid === props.following[i]);

      //   // If user contains data or it is defined.
      //   if (user != undefined) {
      //     posts = [...posts, ...user.posts];
      //   }
      // }

      // Sort posts of users you are following by creation as defined in the database.
      props.feed.sort(function (x, y) {
        return y.creation - x.creation;
      });

      // setPosts to the posts from redux, set with posts = [...posts, ...user.posts] above.
      setPosts(props.feed);
    }
    console.log(posts);
  }, [props.usersFollowingLoaded, props.feed]); // [props.usersFollowingLoaded] is used for useEffect to be re-called everytime uid and following variable state changes.

  // Like Posts function
  const onLikePress = (userId, postId) => {
    setDoc(
      doc(
        firestore,
        "posts",
        userId,
        "userPosts",
        postId,
        "likes",
        auth.currentUser.uid
      ),
      {}
    ).then(function () {});
  };

  // Unlike post function
  const onDislikePress = (userId, postId) => {
    deleteDoc(
      doc(
        firestore,
        "posts",
        userId,
        "userPosts",
        postId,
        "likes",
        auth.currentUser.uid
      )
    ).then(function () {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerGallery}>
        <FlatList
          numColumns={1}
          horizontal={false}
          data={posts}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <Text>
                {item.user.name} - {item.id}
              </Text>
              <Image style={styles.image} source={{ uri: item.downloadURL }} />
              {item.currentUserLike ? (
                <Button
                  title="Dislike"
                  onPress={() => onDislikePress(item.user.uid, item.id)}
                />
              ) : (
                <Button
                  title="Like"
                  onPress={() => onLikePress(item.user.uid, item.id)}
                />
              )}
              <Text
                onPress={() =>
                  props.navigation.navigate("Comment", {
                    postId: item.id,
                    uid: item.user.uid,
                  })
                }
              >
                View Comments...
              </Text>
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
    flex: 1 / 1,
  },
});

// To Access userState and usersState in ../redux/reducers/index and map to currentUser in ../redux/reducers/user and ../redux/reducers/users respectively.
const mapStateToProps = (store) => ({
  // From User.js
  currentUser: store.userState.currentUser,
  following: store.userState.following,

  // From Users.js
  feed: store.usersState.feed,
  // users: store.usersState.users,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded,
});

// Export the constants and class variables.
export default connect(mapStateToProps, null)(Feed);
