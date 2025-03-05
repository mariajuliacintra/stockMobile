import React from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

export default function Principal({ navigation }) {
  return (
    <ImageBackground
      source={require("../../img/fundo.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.buttonToHome}
          onPress={() => navigation.navigate("Login")}
        >
          <Image
            source={require("../../img/botaohome.png")}
            style={styles.imageButtonToHome}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    backgroundColor: "transparent",
  },
  buttonToHome: {
    position: "absolute",
    top: 20,
    left:20,
    width: 50,
    height: 50,
    backgroundColor: "white",
    borderRadius: 100,
    alignItems:'center',
    justifyContent:'center'
  },
  imageButtonToHome: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    color: "white",
  },
});
