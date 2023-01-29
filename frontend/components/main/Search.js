// React Native
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";

// firebase
import { getDocs, where, query, collection } from "firebase/firestore";
import { firestore } from "../../firebase/firebase.config";

export default function Search(props) {
  const [users, setUsers] = useState([]);

  const fetchUsers = (search) => {
    // Await won't work inside this function as done in the firebase documentation because it's not an async function, so we use ".then"
    // https://firebase.google.com/docs/firestore/query-data/order-limit-data
    // https://stackoverflow.com/a/69286989
    getDocs(
      query(collection(firestore, "users"), where("name", ">=", search))
    ).then((docSnap) => {
      let users = docSnap.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data };
      });
      //   console.log(users);
      setUsers(users);
    });
  };

  return (
    <View>
      <TextInput
        placeholder="Type Here..."
        onChangeText={(search) => fetchUsers(search)}
      />
      <FlatList
        numColumns={1}
        horizontal={false}
        data={users}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate("Profile", { uid: item.id })
            }
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
