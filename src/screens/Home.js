import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Login from "../components/layout/Login";
import Cadastro from "../components/layout/Cadastro";

function Home() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [isCadastroModalVisible, setCadastroModalVisible] = useState(false);

  const dynamicStyles = StyleSheet.create({
    background: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
      backgroundColor: "rgba(177, 16, 16, 1)",
      height: height * 0.1,
      borderBottomColor: "white",
      borderBottomWidth: 3,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      width: width,
    },
    logo: {
      justifyContent: "center",
      alignItems: "center",
      resizeMode: "contain",
      width: width * 0.45,
      height: height * 0.06,
      borderRadius: 8,
      borderColor: "white",
      borderWidth: 4,
      marginRight: width * 0.04,
    },
    buttonToCadastro: {
      backgroundColor: "rgb(250, 24, 24)",
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.04,
      borderRadius: 20,
      borderWidth: 0,
      alignItems: "center",
      marginRight: width * 0.03,
      borderColor: "white",
      borderWidth: 2,
    },
    textButtonToCadastro: {
      fontSize: width * 0.035,
      color: "white",
      fontWeight: "bold",
    },
    buttonToLogin: {
      backgroundColor: "rgb(250, 24, 24)",
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.04,
      marginRight: width * 0.02,
      borderRadius: 20,
      borderWidth: 0,
      alignItems: "center",
      borderColor: "white",
      borderWidth: 2,
    },
    textButtonToLogin: {
      fontSize: width * 0.035,
      color: "white",
      fontWeight: "bold",
    },
    body: {
      height: height * 0.83,
      width: width * 0.8,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    textBody: {
      color: "white",
      fontSize: Math.min(width * 0.244, height * 0.25),
      fontWeight: "bold",
      textAlign: "start",
    },
    footer: {
      backgroundColor: "rgba(177, 16, 16, 1)",
      height: height * 0.07,
      borderTopColor: "white",
      borderTopWidth: 3,
      justifyContent: "center",
      alignItems: "center",
      width: width,
    },
    textDesenvolvido: {
      color: "white",
      fontWeight: "bold",
      fontSize: width * 0.035,
    },
  });

  return (
    <ImageBackground
      source={require("../img/fundo.png")}
      style={dynamicStyles.background}
      resizeMode="cover"
    >
      <View style={dynamicStyles.header}>
        <Image source={require("../img/logo.png")} style={dynamicStyles.logo} />
        <TouchableOpacity
          style={dynamicStyles.buttonToCadastro}
          onPress={() => setCadastroModalVisible(true)}
        >
          <Text style={dynamicStyles.textButtonToCadastro}>Cadastre-se</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={dynamicStyles.buttonToLogin}
          onPress={() => setLoginModalVisible(true)}
        >
          <Text style={dynamicStyles.textButtonToLogin}>Login</Text>
        </TouchableOpacity>
      </View>
      <View style={dynamicStyles.body}>
        <Text style={dynamicStyles.textBody}>
          Seja Bem Vindo ao app de Reservas do SENAI
        </Text>
      </View>
      <View style={dynamicStyles.footer}>
        <Text style={dynamicStyles.textDesenvolvido}>
          &copy; Desenvolvido por: Vinicius Fogaça, Maria Júlia e Maria Fernanda
        </Text>
      </View>

      <Login
        visible={isLoginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onOpenCadastro={() => {
          setCadastroModalVisible(true);
        }}
      />
      <Cadastro
        visible={isCadastroModalVisible}
        onClose={() => setCadastroModalVisible(false)}
        onOpenLogin={() => {
          setLoginModalVisible(true);
        }}
      />
    </ImageBackground>
  );
}

export default Home;
