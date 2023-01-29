// Manually defined constants
import {
  USER_STATE_CHANGE,
  USER_POSTS_STATE_CHANGE,
  USER_FOLLOWING_STATE_CHANGE,
  USERS_DATA_STATE_CHANGE,
  USERS_POSTS_STATE_CHANGE,
  USERS_LIKES_STATE_CHANGE,
  CLEAR_DATA,
} from "../constants/index";

// Firebase
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, firestore } from "../../firebase/firebase.config";

// Clear redux data for user.js and users.js files i.e. the reducers
export function clearData() {
  return (dispatch) => {
    dispatch({ type: CLEAR_DATA });
  };
}

// Fetch User details
export function fetchUser() {
  return (dispatch) => {
    // Await won't work inside this function as done in the firebase documentation because it's not an async function, so we use ".then"
    // https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document
    // https://stackoverflow.com/a/69531647
    getDoc(doc(firestore, "users", auth.currentUser.uid)).then((docSnap) => {
      if (docSnap.exists()) {
        dispatch({
          type: USER_STATE_CHANGE,
          currentUser: docSnap.data(),
        });
      } else {
        console.log("User Does Not Exist!");
      }
    });
  };
}

// Fetch Users Posts details
export function fetchUserPosts() {
  return (dispatch) => {
    // Await won't work inside this function as done in the firebase documentation because it's not an async function, so we use ".then"
    // https://firebase.google.com/docs/firestore/query-data/order-limit-data
    // https://stackoverflow.com/a/69286989
    getDocs(
      query(
        collection(firestore, "posts", auth.currentUser.uid, "userPosts"),
        orderBy("creation", "asc")
      )
    ).then((docSnap) => {
      let posts = docSnap.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data };
      });
      // console.log(posts);
      dispatch({
        type: USER_POSTS_STATE_CHANGE,
        posts,
      });
    });
  };
}

// Fetch list of Users the current user is Following
export function fetchUserFollowing() {
  return (dispatch) => {
    // Notice how getting realtime updates with onSnapshot doesn't require Await or .then
    // https://firebase.google.com/docs/firestore/query-data/listen#web-version-9_3
    onSnapshot(
      query(
        collection(
          firestore,
          "following",
          auth.currentUser.uid,
          "userFollowing"
        )
      ),
      (docSnap) => {
        let following = docSnap.docs.map((doc) => {
          const id = doc.id;
          return id;
        });
        // console.log(following);
        dispatch({
          type: USER_FOLLOWING_STATE_CHANGE,
          following,
        });

        // For every value of user the current user is following, call the fetchUsersData function and pass the id of the users as an argument to get their details (id, name, email and more).
        for (let i = 0; i < following.length; i++) {
          dispatch(fetchUsersData(following[i], true));
        }
      }
    );
  };
}

// ----------------------------------------------------------------
// Get the details(id, name, email and more) of the people you are following.
// Get the users ids sent from the fetchUserFollowing function and search eachone and map it to their respective posts by triggering fetchUsersFollowingPosts and passing the ids as argument.
// getPosts is used to get the post comments in Comments.js.
export function fetchUsersData(uid, getPosts) {
  return (dispatch, getState) => {
    const found = getState().usersState.users.some((el) => el.uid === uid);

    if (!found) {
      getDoc(doc(firestore, "users", uid)).then((docSnap) => {
        if (docSnap.exists()) {
          let user = docSnap.data();
          user.uid = docSnap.id;

          dispatch({
            type: USERS_DATA_STATE_CHANGE,
            user,
          });
        } else {
          console.log("User Does Not Exist!");
        }
      });
      if (getPosts) {
        dispatch(fetchUsersFollowingPosts(uid));
      }
    }
  };
}

// Get the posts of the people you are following using the ids gotten above.
// Get each users posts in this function using the user ids "uid" and store it in the "posts" variable.
export function fetchUsersFollowingPosts(uid) {
  return (dispatch, getState) => {
    getDocs(
      query(
        collection(firestore, "posts", uid, "userPosts"),
        orderBy("creation", "asc")
      )
    ).then((docSnap) => {
      const uid = docSnap.query._query.path.segments[1];
      // console.log({ docSnap, uid });
      const user = getState().usersState.users.find((el) => el.uid === uid);

      let posts = docSnap.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return {
          id,
          ...data,
          user,
        };
      });

      // console.log(posts);
      for (let i = 0; i < posts.length; i++) {
        dispatch(fetchUsersFollowingLikes(uid, posts[i].id));
      }

      dispatch({
        type: USERS_POSTS_STATE_CHANGE,
        posts,
        uid,
      });
      // console.log(getState());
    });
  };
}

// ----------------------------------------------------------------

export function fetchUsersFollowingLikes(uid, postId) {
  return (dispatch, getState) => {
    onSnapshot(
      query(collection(firestore, "posts", uid, "userPosts", postId, "likes")),
      (docSnap) => {
        const postId = docSnap.query._query.path.segments[3];
        // console.log({ docSnap, postId });

        let posts = docSnap.docs.map((doc) => {
          const id = doc.id;
          return id;
        });

        let currentUserLike = false;
        if (posts.indexOf(auth.currentUser.uid) > -1) {
          // if (posts.includes(auth.currentUser.uid)) {
          currentUserLike = true;
          // console.log(auth.currentUser.uid);
        }

        // posts.forEach((element) => {
        //   if (element == auth.currentUser.uid) {
        //     console.log(element);
        //   }
        // });

        // console.log(posts);
        dispatch({
          type: USERS_LIKES_STATE_CHANGE,
          postId,
          currentUserLike,
        });
        // console.log(getState());
      }
    );
  };
}
