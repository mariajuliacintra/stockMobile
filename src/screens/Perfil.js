import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Image,
  useWindowDimensions,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
export default function PerfilScreen() {

  const navigation = useNavigation();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const { width, height } = useWindowDimensions();

  const dynamicStyles = StyleSheet.create({
    background: {
      flex: 1,
      width,
      height,
      alignItems: "center",
    },
    header: {
      backgroundColor: "rgba(177, 16, 16, 1)",
      height: height * 0.1,
      borderBottomColor: "white",
      borderBottomWidth: 3,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      width: width,
      paddingRight: width * 0.06,
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 1)",
      padding: width * 0.06,
      borderRadius: 15,
      width: width * 0.85,
      maxWidth: 400,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 10,
      marginTop: height * 0.12, // espaço para o header
    },
    logo: {
      width: width * 0.6,
      height: width * 0.25,
      resizeMode: "contain",
      marginBottom: height * 0.02,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      borderWidth: 1,
      borderColor: "#ddd",
      backgroundColor: "#f5f5f5",
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.03,
      borderRadius: 8,
      marginBottom: height * 0.025,
    },
    inputField: {
      flex: 1,
      fontSize: width * 0.04,
      color: "#333",
      paddingVertical: 0,
    },
    button: {
      backgroundColor: "rgb(177, 16, 16)",
      paddingVertical: height * 0.02,
      paddingHorizontal: width * 0.08,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 6,
      marginBottom: height * 0.015,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: width * 0.045,
    },
    link: {
      fontSize: width * 0.045,
      color: "rgb(152, 0, 0)",
      fontWeight: "bold",
      textDecorationLine: "underline",
    },
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        style={dynamicStyles.background}
        source={require("../img/fundo.png")}
      >
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Principal")}>
            <MaterialCommunityIcons
              name="home-circle-outline"
              size={60}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.card}>
          <Image
            source={require("../img/logo.png")}
            style={dynamicStyles.logo}
            resizeMode="contain"
          />

          <View style={dynamicStyles.inputContainer}>
            <TextInput
              style={dynamicStyles.inputField}
              placeholder="Nome"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={dynamicStyles.inputContainer}>
            <TextInput
              style={dynamicStyles.inputField}
              placeholder="E-mail"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity style={dynamicStyles.button}>
            <Text style={dynamicStyles.buttonText}>Editar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={dynamicStyles.link}>Meus pedidos</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
