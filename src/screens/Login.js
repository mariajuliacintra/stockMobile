import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import api from "../services/axios";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import CustomModal from "../components/mod/CustomModal";

export default function Login() {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState({
    email: "",
    senha: "",
    showSenha: true,
  });

  const [modalVisible, setModalVisible] = useState(false);  // Controle de visibilidade do modal
  const [modalMessage, setModalMessage] = useState("");     // Mensagem do modal
  const [modalType, setModalType] = useState("info");       // Tipo do modal ('success', 'error')

  async function armazenarDados(idUsuario, token) {
    try {
      await SecureStore.setItemAsync("idUsuario", idUsuario.toString());
      await SecureStore.setItemAsync("tokenUsuario", token.toString());  // Armazenando o token
    } catch (erro) {
      console.error("Erro ao armazenar dados:", erro);
    }
  }
  
  async function handleLogin() {
    await api.postLogin(usuario).then(
      (response) => {
        console.log(response.data.message);
        setModalMessage(response.data.message);
        setModalType("success");
        setModalVisible(true);  // Exibe o modal de sucesso


        const idUsuario = response.data.usuario.id_usuario;  // Extrai o id_usuario da resposta
        const token = response.data.token;  // Extrai o token da resposta
  
        // Armazena o id e o token no SecureStorage
        armazenarDados(idUsuario, token);   
  
        setTimeout(() => {
          navigation.navigate("Principal");
        }, 700);  // Aguarda o modal ser fechado antes de navegar
      },
      (error) => {
        setModalMessage(error.response.data.error);
        setModalType("error");
        setModalVisible(true);  // Exibe o modal de erro
      }
    );
  }

  return (
    <ImageBackground
      source={require("../img/fundo.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <View style={styles.body}>
            <View style={styles.form}>
              <Image source={require("../img/logo.png")} style={styles.logo} />
              <TextInput
                placeholder=" e-mail"
                value={usuario.email}
                onChangeText={(value) => {
                  setUsuario({ ...usuario, email: value });
                }}
                style={styles.inputEmail}
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
              <TouchableOpacity onPress={handleLogin} style={styles.buttonEntrar}>
                <Text style={styles.textButtonEntrar}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonToCadastro}
                onPress={() => navigation.navigate("Cadastro")}
              >
                <Text style={styles.textButtonToCadastro}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        <Footer />
      </View>

      <CustomModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}  // Fecha o modal ao clicar no botão
        title={modalType === "success" ? "Login Concluído" : "Erro"}
        message={modalMessage}
        type={modalType}  // Determina o tipo do modal: sucesso ou erro
      />
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
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  body: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  form: {
    width: "70%",
    height: "auto",
    paddingVertical: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 238, 238, 0.82)",
    borderRadius: 50,
  },
  logo: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    width: "70%",
    height: "14%",
    marginBottom: "8%",
    marginTop: "2%",
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 4,
  },
  inputEmail: {
    width: "85%",
    height: "11%",
    marginBottom: "7%",
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
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: "5%",
    paddingHorizontal: 10,
    height: "11%",
  },
  buttonEntrar: {
    backgroundColor: "rgb(250, 24, 24)",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "3%",
  },
  textButtonEntrar: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  buttonToCadastro: {
    backgroundColor: "transparent",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "3%",
    color: "white",
  },
  textButtonToCadastro: {
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
