import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Button,
} from "react-native";
import api from "../services/axios";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function Perfil({ navigation }) {
  return (
    <View>
      <View style={styles.Header}>
        <TouchableOpacity
          style={styles.buttonToMinhasReservas}
          onPress={() => navigation.navigate("MinhasReservas")}
        >
          <Text style={styles.textButtonToMinhasReservas}>Minhas Reservas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonToPrincipal}
          onPress={() => navigation.navigate("Principal")}
        >
          <FontAwesome name="home" size={45} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <FontAwesome6
          style={styles.IconProfile}
          name="user-circle"
          size={38}
          color="#920D0D"
          weight="thin"
        />
        <Text style={styles.textProfile}>Nome do usuário</Text>
      </View>

      <View style={styles.Container}>
      <View style={styles.BoxSeuPerfil}></View>
      <Text style={styles.textSeuPerfil}>Seu perfil</Text>
      <View style={styles.container}>
        <Text style={styles.textNome}>Nome do usuário</Text>
      </View> 
        <Text style={styles.container}>NIF</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  Header: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    height: 70,
    width: 500,
    marginTop: 3,
    borderBottomColor: "white",
    borderBottomWidth: 3,
    flexDirection: "row",
  },
  buttonToMinhasReservas: {
    backgroundColor: "rgb(250, 24, 24)",
    paddingHorizontal: 10,
    borderRadius: 20,
    borderColor: "white",
    borderWidth: 2,
    marginLeft: 240,
    marginTop: 10,
    height: 50,
    width: 150,
    justifyContent: "center",
    alignItems: "center",
  },

  textButtonToMinhasReservas: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonToPrincipal: {
    marginTop: 10,
    marginLeft: 25,
  },
  body: {
    backgroundColor: "#DAD7D7",
    height: "100%",
  },
  IconProfile: {
    marginTop: 30,
    marginLeft: 30,
  },
  textProfile:{
    marginLeft: 80,
    marginTop: -25,
  },
  Container:{
    backgroundColor: "#F0EDED",
    height: 500,
    width: 380,
    marginTop: 180,
    marginLeft: 50,
    borderRadius: 20,
    position: "absolute",
  },
  BoxSeuPerfil:{
    backgroundColor: "#DBDBDB",
    height: 30,
    width: 100,
    marginTop: 20,
    marginLeft: 20,
    borderRadius: 20,
  },
  textSeuPerfil:{
    fontSize: 15,
    color: "black",
    fontWeight: "bold",
    textAlign: "justify",
    marginLeft: 35,
    marginTop: -25,
  },
  container:{
    backgroundColor: "#DBDBDB",
    height: 40,
    width: 300,
    marginTop: 40,
    marginLeft: 20,
    borderRadius: 20,
    alignContent: "center",
    
  },
  textNome:{
    marginTop: 10,
    marginLeft: 20,
  },
  textNif:{
    marginTop: 10,
    marginLeft: 20,
  },
});