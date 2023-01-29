// React Native
import React, { Component } from "react";
import { View, Button, TextInput } from "react-native";

// firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase.config";

export class Login extends Component {
  // Use constructor to set initial state of the Text input boxes.
  // Constructor is used to initialize state and bind methods.
  // https://reactjs.org/docs/react-component.html#constructor
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
    };

    // bind onSignUp as explained in line 12.
    this.onSignIn = this.onSignIn.bind(this);
  }

  // Call onSignUp function
  onSignIn() {
    // Get new state after setting state.
    const { email, password } = this.state;

    // Firebase signIn function.
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
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
          placeholder="email"
          onChangeText={(email) => this.setState({ email })}
        />
        <TextInput
          placeholder="password"
          secureTextEntry={true}
          onChangeText={(password) => this.setState({ password })}
        />

        <Button onPress={() => this.onSignIn()} title="Sign In" />
      </View>
    );
  }
}

export default Login;
