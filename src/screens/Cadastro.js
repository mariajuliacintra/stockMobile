import { useState } from "react";

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
  Dimensions,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import api from "../services/axios";

import Header from "../components/Header";
import Footer from "../components/Footer";
import CustomModal from "../components/CustomModal";

import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function Cadastro() {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    NIF: "",
    senha: "",
    showSenha: true,
  });
  const [confirmarSenha, setConfirmarSenha] = useState(""); // Novo estado para confirmarSenha

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info");

  async function armazenarDados(idUsuario, token) {
    try {
      await SecureStore.setItemAsync("idUsuario", idUsuario.toString());
      await SecureStore.setItemAsync("tokenUsuario", token.toString());
    } catch (erro) {
      console.error("Erro ao armazenar dados:", erro);
    }
  }

  async function handleCadastro() {
    // Remove o campo `showSenha` antes de enviar
    const usuarioParaEnviar = {
      nome: usuario.nome,
      email: usuario.email,
      NIF: usuario.NIF,
      senha: usuario.senha,
      confirmarSenha: confirmarSenha,
    };

  
    await api.postCadastro(usuarioParaEnviar).then(
      (response) => {
        setModalMessage(response.data.message);
        setModalType("success");
        setModalVisible(true);
  
        const idUsuario = response.data.usuario.id_usuario;
        const token = response.data.token;
  
        armazenarDados(idUsuario, token);
  
        setTimeout(() => {
          navigation.navigate("Principal");
        }, 700);
      },
      (error) => {
        setModalMessage(error.response?.data?.error || "Erro ao cadastrar.");
        setModalType("error");
        setModalVisible(true);
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
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.body}>
            <View style={styles.form}>
              <Image source={require("../img/logo.png")} style={styles.logo} />
              <TextInput
                placeholder=" nome"
                value={usuario.nome}
                onChangeText={(value) => {
                  setUsuario({ ...usuario, nome: value });
                }}
                style={styles.input}
                placeholderTextColor="gray"
              />
              <TextInput
                placeholder=" e-mail"
                value={usuario.email}
                onChangeText={(value) => {
                  setUsuario({ ...usuario, email: value });
                }}
                style={styles.input}
                placeholderTextColor="gray"
              />
              <TextInput
                placeholder=" NIF"
                value={usuario.NIF}
                onChangeText={(value) => {
                  setUsuario({ ...usuario, NIF: value });
                }}
                style={styles.input}
                placeholderTextColor="gray"
              />
              <View style={styles.senhaForm}>
                <TextInput
                  style={styles.inputSenha}
                  placeholder=" senha"
                  value={usuario.senha}
                  secureTextEntry={usuario.showSenha}
                  onChangeText={(value) => {
                    setUsuario({ ...usuario, senha: value });
                  }}
                  placeholderTextColor="gray"
                />
                <TouchableOpacity
                  onPress={() =>
                    setUsuario({ ...usuario, showSenha: !usuario.showSenha })
                  }
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={usuario.showSenha ? "eye-off" : "eye"}
                    size={width * 0.06}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>

              {/* Novo campo para confirmar senha */}
              <View style={styles.senhaForm}>
                <TextInput
                  style={styles.inputSenha}
                  placeholder=" confirmar senha"
                  value={confirmarSenha}
                  secureTextEntry={usuario.showSenha} // Use o mesmo showSenha para ambos
                  onChangeText={(value) => setConfirmarSenha(value)}
                  placeholderTextColor="gray"
                />
                <TouchableOpacity
                  onPress={() =>
                    setUsuario({ ...usuario, showSenha: !usuario.showSenha })
                  }
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={usuario.showSenha ? "eye-off" : "eye"}
                    size={width * 0.06}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {/* Fim do novo campo */}

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
          </View>
        </KeyboardAvoidingView>
        <Footer />
      </View>

      <CustomModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalType === "success" ? "Cadastro Concluído" : "Erro"}
        message={modalMessage}
        type={modalType}
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
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  body: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  form: {
    width: width * 0.82,
    height: height * 0.65,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 238, 238, 0.82)",
    borderRadius: 50,
  },
  logo: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    width: width * 0.6,
    height: height * 0.08,
    marginBottom: height * 0.02,
    marginTop: height * 0.01,
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 4,
  },
  input: {
    width: "85%",
    height: height * 0.055,
    borderWidth: 0,
    marginBottom: height * 0.015,
    paddingHorizontal: width * 0.025,
    borderRadius: 12,
    backgroundColor: "white",
    fontSize: width * 0.04,
    color: "#333",
  },
  inputSenha: {
    flex: 1,
    fontSize: width * 0.04,
    color: "#333",
  },
  senhaForm: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    height: height * 0.055,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: height * 0.015,
    paddingHorizontal: width * 0.025,
  },
  eyeIcon: {
    padding: width * 0.01,
  },
  buttonCadastrar: {
    backgroundColor: "rgb(250, 24, 24)",
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.004,
    borderRadius: 8,
    borderWidth: 0,
    alignItems: "center",
    margin: width * 0.01,
    marginTop: height * 0.01,
    width: width * 0.28,
  },
  textButtonCadastrar: {
    fontSize: width * 0.04,
    color: "white",
    fontWeight: "700",
  },
  buttonToLogin: {
    backgroundColor: "transparent",
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
    borderRadius: 8,
    borderWidth: 0,
    alignItems: "center",
    marginTop: height * 0.01,
  },
  textButtonToLogin: {
    fontSize: width * 0.04,
    color: "rgb(152, 0, 0)",
    fontWeight: "600",
    borderBottomWidth: 1.3,
    borderBottomColor: "rgb(152, 0, 0)",
  },
  text: {
    color: "white",
  },
});