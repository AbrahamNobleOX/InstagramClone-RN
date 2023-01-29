// React Native
import React, { Component } from "react";
import { View, Button, TextInput } from "react-native";

// firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../../firebase/firebase.config";

export class Register extends Component {
  // Use constructor to set initial state of the Text input boxes.
  // Constructor is used to initialize state and bind methods.
  // https://reactjs.org/docs/react-component.html#constructor
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      name: "",
    };

    // bind onSignUp as explained in line 12.
    this.onSignUp = this.onSignUp.bind(this);
  }

  // Call onSignUp function
  onSignUp() {
    // Get new state after setting state.
    const { email, password, name } = this.state;

    // Firebase signUp function.
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Add a new document "auth.currentUser.uid" in collection "users"
        setDoc(doc(firestore, "users", auth.currentUser.uid), {
          name,
          email,
        });

        console.log(userCredential);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(error);
      });
  }

  render() {
    return (
      <View>
        <TextInput
          placeholder="name"
          onChangeText={(name) => this.setState({ name })}
        />
        <TextInput
          placeholder="email"
          onChangeText={(email) => this.setState({ email })}
        />
        <TextInput
          placeholder="password"
          secureTextEntry={true}
          onChangeText={(password) => this.setState({ password })}
        />

        <Button onPress={() => this.onSignUp()} title="Sign Up" />
      </View>
    );
  }
}

export default Register;
