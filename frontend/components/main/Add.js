// React Native
import { Camera, CameraType } from "expo-camera";
import { useState } from "react";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function Add({ navigation }) {
  // Get new state after setting state.
  const [type, setType] = useState(CameraType.back);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  // If camera permissions are still loading
  if (!permission) {
    return <View />;
  }

  // If camera permissions are not granted.
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // Swith camera from front to back and vice versa.
  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  // Take picture function and show image.
  const takePicture = async () => {
    if (camera) {
      // This method takes a picture.
      const data = await camera.takePictureAsync(null);

      // To show image, Set image to be uri of taken image.
      setImage(data.uri);
    }
  };

  // Pick Image Function.
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // If camera permissions are granted.
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Camera
          ref={(ref) => setCamera(ref)}
          style={styles.camera}
          type={type}
          ratio={"1:1"}
        />
      </View>

      <Button
        style={styles.button}
        onPress={toggleCameraType}
        title="Flip Camera"
      ></Button>
      <Button title="Take Picture" onPress={() => takePicture()} />
      <Button title="Pick an image from Gallery" onPress={pickImage} />
      <Button
        title="Save Picture"
        onPress={() => navigation.navigate("Save", { image })}
      />

      {image && <Image source={{ uri: image }} style={{ flex: 1 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    aspectRatio: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
