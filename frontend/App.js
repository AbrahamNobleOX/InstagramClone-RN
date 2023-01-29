// React Native
import React, { Component } from "react";
import { View, Text } from "react-native";

// Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Redux
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import rootReducer from "./redux/reducers";
import thunk from "redux-thunk";

// firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase.config";

// screens
import LandingScreen from "./components/auth/Landing";
import RegisterScreen from "./components/auth/Register";
import LoginScreen from "./components/auth/Login";
import MainScreen from "./components/Main";
import AddScreen from "./components/main/Add";
import SaveScreen from "./components/main/Save";
import CommentScreen from "./components/main/Comment";

// Create Redux Store
const store = createStore(rootReducer, applyMiddleware(thunk));

// Create Native Stack Navigation
const Stack = createNativeStackNavigator();

export class App extends Component {
  // Use constructor to set initial state of the app, if app as loaded or not.
  // Constructor is used to initialize state and bind methods.
  // The constructor for a React component is called before it is mounted.
  // The constructor for a React component is called before it is mounted. When implementing the constructor for a React.Component subclass, you should call super(props) before any other statement. Otherwise, this.props will be undefined in the constructor, which can lead to bugs.
  // https://reactjs.org/docs/react-component.html#constructor
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
    };
  }

  // If you need to load data from a remote endpoint, this is a good place to instantiate the network request.
  // This method is a good place to set up any subscriptions.
  // https://reactjs.org/docs/react-component.html#componentdidmount
  componentDidMount() {
    // Check auth state and define new state.
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Set state if User is signed in, see firebase docs for a list of available properties
        this.setState({
          loggedIn: true,
          loaded: true,
        });
      } else {
        // User is signed out
        this.setState({
          loggedIn: false,
          loaded: true,
        });
      }
    });
  }

  render() {
    // Get new state after setting state.
    const { loggedIn, loaded } = this.state;

    // If app is not loaded, show loading text indicator.
    if (!loaded) {
      return (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text> Loading... </Text>
        </View>
      );
    }

    // If user is not loggedIn, show landingScreen, where you can log in or rgister.
    if (!loggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen
              name="Landing"
              component={LandingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }

    // If user is loggedIn, go straight to Main which will have initial route of Feed.
    return (
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen
              name="Main"
              component={MainScreen}
              // options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Add"
              component={AddScreen}
              navigation={this.props.navigation}
            />
            <Stack.Screen
              name="Save"
              component={SaveScreen}
              navigation={this.props.navigation}
            />
            <Stack.Screen
              name="Comment"
              component={CommentScreen}
              navigation={this.props.navigation}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    );
  }
}

export default App;
