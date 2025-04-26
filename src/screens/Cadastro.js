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
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigation } from "@react-navigation/native";
import api from "../services/axios";
import CustomModal from "../components/CustomModal";

export default function Cadastro() {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    NIF: "",
    senha: "",
    showSenha: true,
  });

  const [modalVisible, setModalVisible] = useState(false); // Controle de visibilidade do modal
  const [modalMessage, setModalMessage] = useState(""); // Mensagem do modal
  const [modalType, setModalType] = useState("info"); // Tipo do modal ('success', 'error')

  async function handleCadastro() {
    await api.postCadastro(usuario).then(
      (response) => {
        setModalMessage(response.data.message);
        setModalType("success");
        setModalVisible(true); // Exibe o modal de sucesso
        setTimeout(() => {
          navigation.navigate("Principal");
        }, 1500); // Aguarda o modal ser fechado antes de navegar
      },
      (error) => {
        setModalMessage(error.response.data.error);
        setModalType("error");
        setModalVisible(true); // Exibe o modal de erro
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
              <View style={styles.senhaForm}>
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
          </View>
        </KeyboardAvoidingView>
        <Footer />
      </View>

      {/* Modal de feedback */}
      <CustomModal
        open={modalVisible}
        onClose={() => setModalVisible(false)} // Fecha o modal ao clicar no botão
        title={modalType === "success" ? "Cadastro Concluído" : "Erro"}
        message={modalMessage}
        type={modalType} // Determina o tipo do modal: sucesso ou erro
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
  },
  form: {
    width: "70%",
    height: "auto",
    paddingVertical: 15,
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
    height: "12%",
    marginBottom: "8%",
    marginTop: "2%",
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 4,
  },
  input: {
    width: "85%",
    height: "9.5%",
    borderWidth: 0,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "white",
  },
  inputSenha: {
    flex: 1,
  },
  senhaForm: {
    flexDirection: "row",
    alignItems: "center",
    alignItems: "center",
    width: "85%",
    height: "9.5%",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 10,
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
});
