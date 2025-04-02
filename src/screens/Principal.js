import React from "react";
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

function Principal({ navigation }) {
  return (
    <ImageBackground
      source={require("../img/fundo.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="menu" size={50} color="white" weight="thin" marginLeft="5" />
        <TouchableOpacity
          style={styles.buttonToProfile}
          onPress={() => navigation.navigate("Perfil")}
        >
          <FontAwesome6 name="user-circle" size={38} color="white" weight="thin" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonToHome}
          onPress={() => navigation.navigate("Home")}
        >
          <MaterialCommunityIcons name="exit-to-app" size={40} color="white" weight="thin"/>
        </TouchableOpacity> 
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  header: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    height: 60,
    borderBottomColor: "white",
    borderBottomWidth: 3,
    flexDirection: "row",
  },
  buttonToHome: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    marginLeft: 14,
  },
  buttonToProfile:{
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    marginLeft: 330,
  },
});

export default Principal;
