import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import api from "../axios/axios";

export default function Login({ navigation }) {
  const [usuario, setUsuario] = useState({
    email: "",
    senha: "",
  });

  async function handleLogin() {
    await api.postLogin(usuario).then(
      (response) => {
        console.log(response.data.message);
        Alert.alert("OK", response.data.message);
        navigation.navigate("Principal");
      },
      (error) => {
        Alert.alert("Erro", error.response.data.error);
        console.log(error);
      }
    );
  }
  return (
    <ImageBackground
      source={require("../img/fundo.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.container}>
            <Image source={require("../img/logo.png")} style={styles.logo} />
            <TextInput
              placeholder=" e-mail"
              value={usuario.email}
              onChangeText={(value) => {
                setUsuario({ ...usuario, email: value });
              }}
              style={styles.input}
            />
            <TextInput
              placeholder=" senha"
              value={usuario.senha}
              onChangeText={(value) => {
                setUsuario({ ...usuario, senha: value });
              }}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={handleLogin}
              style={styles.button_Entrar}
            >
              <Text style={styles.text_button_Entrar}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button_toCadastro}
              onPress={() => navigation.navigate("Cadastro")}
            >
              <Text style={styles.text_button_Cadastro}>Cadastro</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    minHeight: 180,
    marginVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 30,
    backgroundColor: "rgba(255, 238, 238, 0.82)",
    borderRadius: 50,
    marginTop: 220,
  },
  logo: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    width: 205,
    height: 55,
    marginBottom: 25,
    marginTop: 16,
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 4,
  },
  input: {
    width: 250,
    height: 40,
    borderWidth: 0,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "white",
  },
  button_Entrar: {
    backgroundColor: "rgb(250, 24, 24)",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    borderWidth: 0,
    alignItems: "center",
    margin: 5,
    marginBottom: 2,
  },
  text_button_Entrar: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  button_toCadastro: {
    backgroundColor: "transparent",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 0,
    alignItems: "center",
    marginTop: 10,
    color: "white",
  },
  text_button_Cadastro: {
    fontSize: 15.5,
    color: "rgb(152, 0, 0)",
    fontWeight: 600,
    borderBottomWidth: 1.3,
    borderBottomColor: "rgb(152, 0, 0)",
  },
  text: {
    color: "white",
  },
});
