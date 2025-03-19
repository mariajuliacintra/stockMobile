import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Button,
} from "react-native";

export default function Perfil({ navigation }) {
  return (
    <View style={styles.Header}>
      <TouchableOpacity
        style={styles.buttonToMinhasReservas}
        onPress={() => navigation.navigate("MinhasReservas")}>
          <Text style={styles.textButtonToMinhasReservas}>Minhas Reservas</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  Header:{
    backgroundColor: "rgba(177, 16, 16, 1)",
    height: 70,
    width: 500,
    marginTop: 3,
    borderBottomColor: "white",
    borderBottomWidth: 3,
    flexDirection: "row",
  },
  buttonToMinhasReservas:{
    backgroundColor: "rgb(250, 24, 24)",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
    marginRight: 10,
    borderColor: "white",
    borderWidth: 2,
    marginLeft: 280,
    marginTop: 10,
    height: 20,
  },
  textButtonToMinhasReservas:{
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
});


