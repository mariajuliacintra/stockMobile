import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/Header";
import api from "../services/axios";

export default function Cadastro({ navigation }) {
  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    NIF: "",
    senha: "",
    showSenha: true,
  });

  async function handleCadastro() {
    await api.postCadastro(usuario).then(
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
      <Header />
      <View style={styles.container}>
        <Image source={require("../img/logo.png")} style={styles.logo} />
        <TextInput
          placeholder=" nome"
          value={usuario.nome}
          onChangeText={(value) => {
            setUsuario({ ...usuario, nome: value });
          }}
          style={styles.input}
        />
        <TextInput
          placeholder=" e-mail"
          value={usuario.email}
          onChangeText={(value) => {
            setUsuario({ ...usuario, email: value });
          }}
          style={styles.input}
        />
        <TextInput
          placeholder=" NIF"
          value={usuario.NIF}
          onChangeText={(value) => {
            setUsuario({ ...usuario, NIF: value });
          }}
          style={styles.input}
        />
        <View style={styles.senhaContainer}>
          <TextInput
            style={styles.inputSenha}
            placeholder=" senha"
            value={usuario.senha}
            secureTextEntry={usuario.showSenha}
            onChangeText={(value) => {
              setUsuario({ ...usuario, senha: value });
            }}
          />
          <TouchableOpacity
            onPress={() =>
              setUsuario({ ...usuario, showSenha: !usuario.showSenha })
            }
          >
            <Ionicons
              name={usuario.showSenha ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={handleCadastro}
          style={styles.buttonCadastrar}
        >
          <Text style={styles.textButtonCadastrar}>Cadastrar-se</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonToLogin}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.textButtonToLogin}>Login</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.textDesenvolvido}>
          &copy; Desenvolvido por: Vinicius Fogaça, Maria Júlia e Maria Fernanda
        </Text>
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
    marginTop: 150,
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 30,
    backgroundColor: "rgba(255, 238, 238, 0.82)",
    borderRadius: 50,
  },
  logo: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    width: 210,
    height: 55,
    marginBottom: 30,
    marginTop: 16,
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 5,
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
  inputSenha: {
    flex: 1,
  },
  senhaContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "250",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  buttonCadastrar: {
    backgroundColor: "rgb(250, 24, 24)",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    borderWidth: 0,
    alignItems: "center",
    margin: 5,
    marginBottom: 2,
  },
  textButtonCadastrar: {
    fontSize: 16,
    color: "white",
    fontWeight: 700,
  },
  buttonToLogin: {
    backgroundColor: "transparent",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 0,
    alignItems: "center",
    marginTop: 10,
    color: "white",
  },
  textButtonToLogin: {
    fontSize: 15.5,
    color: "rgb(152, 0, 0)",
    fontWeight: 600,
    borderBottomWidth: 1.3,
    borderBottomColor: "rgb(152, 0, 0)",
  },
  text: {
    color: "white",
  },
  footer: {
    backgroundColor: "rgb(166, 13, 13)",
    height: 50,
    width: 600,
    borderTopColor: "white",
    borderTopWidth: 3,
    alignItems: "center",
    marginTop: 130,
    marginBottom: -350,
    justifyContent: "center",
  },
  textDesenvolvido: { color: "white", fontWeight: "bold" },
});
