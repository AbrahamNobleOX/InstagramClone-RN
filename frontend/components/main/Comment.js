// React Native
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, TextInput } from "react-native";

// firebase
import { doc, query, getDocs, addDoc, collection } from "firebase/firestore";
import { auth, firestore } from "../../firebase/firebase.config";

// Redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUsersData } from "../../redux/actions/index";

function Comment(props) {
  // Hooks
  const [comments, setComments] = useState([]);
  const [postId, setPostId] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    // Match users to their respective comments
    function matchUserToComment(comments) {
      // Loop through the comments and assign them to the creators
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].hasOwnProperty("user")) {
          continue;
        }

        // Find the user ids and check if it matches any of the ids registered in the comments
        const user = props.users.find((x) => x.uid === comments[i].creator);

        // If it doesn't match
        if (user == undefined) {
          props.fetchUsersData(comments[i].creator, false);
        } else {
          // If it matches, map the comment to the creator
          comments[i].user = user;
        }
      }
      setComments(comments);
    }

    if (props.route.params.postId !== postId) {
      // Read comments from database
      getDocs(
        query(
          collection(
            firestore,
            "posts",
            props.route.params.uid,
            "userPosts",
            props.route.params.postId,
            "comments"
          )
        )
      ).then((docSnap) => {
        let comments = docSnap.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return {
            id,
            ...data,
          };
        });

        // Pass comments in Hooks as params
        matchUserToComment(comments);
      });
      setPostId(props.route.params.postId);
    } else {
      matchUserToComment(comments);
    }
  }, [props.route.params.postId, props.users]);

  // Post comments function
  const onCommentSend = () => {
    addDoc(
      collection(
        doc(firestore, "posts", props.route.params.uid),
        "userPosts",
        props.route.params.postId,
        "comments"
      ),
      {
        creator: auth.currentUser.uid,
        text,
      }
    ).then(function () {});
  };

  return (
    <View>
      <FlatList
        numColumns={1}
        horizontal={false}
        data={comments}
        renderItem={({ item }) => (
          <View>
            {item.user !== undefined ? <Text>{item.user.name}</Text> : null}
            <Text>{item.text}</Text>
          </View>
        )}
      />

      <View>
        <TextInput
          placeholder="Comment..."
          onChangeText={(text) => setText(text)}
        />
        <Button onPress={() => onCommentSend()} title="Send" />
      </View>
    </View>
  );
}

// To Access userState in ../redux/reducers/index and map to currentUser in ../redux/reducers/user
const mapStateToProps = (store) => ({
  users: store.usersState.users,
});

// To Access the fetchUser() data created in ../redux/actions/index
const mapDispatchProps = (dispatch) =>
  bindActionCreators({ fetchUsersData }, dispatch);

// Export the constants and class variables.
export default connect(mapStateToProps, mapDispatchProps)(Comment);
