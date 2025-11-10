import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import ForgotPasswordModal from "./forgotpassword";
import CustomModal from "../mod/CustomModal";
import api from "../../services/axios";

const { width, height } = Dimensions.get("window");

function Login({ visible, onClose, onOpenCadastro }) {
  const navigation = useNavigation();

  const [usuario, setUsuario] = useState({
    email: "",
    password: "",
    showSenha: true,
  });

  const [modalState, setModalState] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] =
    useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(visible);

  useEffect(() => {
    setLoginModalVisible(visible);
  }, [visible]);

  const handleCloseLogin = () => {
    setModalState({ visible: false, message: "", type: "info" });
    setLoginModalVisible(false);
    onClose?.();
  };

  const armazenarTokenETipoUsuario = async (token, idUser, userRole) => {
    try {
      if (token) await SecureStore.setItemAsync("tokenUsuario", String(token));
      if (idUser) await SecureStore.setItemAsync("userId", String(idUser));
      if (userRole)
        await SecureStore.setItemAsync("userRole", String(userRole));
    } catch (erro) {
      console.error("Erro ao armazenar token:", erro);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await api.postLogin(usuario);
      const userData = response.data?.user?.[0];

      if (!userData?.token || !userData?.idUser) {
        setModalState({
          visible: true,
          message: "Resposta inválida da API. Tente novamente.",
          type: "error",
        });
        return;
      }

      await armazenarTokenETipoUsuario(
        userData.token,
        userData.idUser,
        userData.role
      );
      await SecureStore.setItemAsync("userEmail", userData.email);

      setModalState({
        visible: true,
        message: response.data.message || "Login realizado!",
        type: "success",
      });

      setUsuario({ email: "", password: "", showSenha: true });

      setTimeout(() => {
        handleCloseLogin();
        navigation.navigate("Principal");
      }, 1000);
    } catch (error) {
      setModalState({
        visible: true,
        message: error.response?.data?.details || "Erro desconhecido",
        type: "error",
      });
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: "#fff",
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
    },
    headerImage: {
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
    linkButton: {
      backgroundColor: "transparent",
      paddingVertical: height * 0.0001,
      paddingHorizontal: width * 0.05,
      borderRadius: 8,
      alignItems: "center",
      marginTop: height * 0.015,
      width: "100%",
    },
    linkText: {
      fontSize: width * 0.045,
      color: "rgb(152, 0, 0)",
      fontWeight: "bold",
      textDecorationLine: "underline",
    },
    separator: {
      height: 1,
      width: "80%",
      backgroundColor: "#eee",
      marginVertical: height * 0.018,
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent
      visible={loginModalVisible}
      onRequestClose={handleCloseLogin}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <View style={styles.modal}>
            <Image
              source={require("../../img/logo.png")}
              style={styles.headerImage}
            />

            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={width * 0.05}
                color="gray"
                style={{ marginRight: width * 0.02 }}
              />
              <TextInput
                placeholder="e-mail"
                value={usuario.email}
                onChangeText={(value) =>
                  setUsuario({ ...usuario, email: value })
                }
                style={styles.inputField}
                placeholderTextColor="gray"
              />
            </View>

            {/* Senha */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={width * 0.05}
                color="gray"
                style={{ marginRight: width * 0.02 }}
              />
              <TextInput
                placeholder="senha"
                value={usuario.password}
                secureTextEntry={usuario.showSenha}
                onChangeText={(value) =>
                  setUsuario({ ...usuario, password: value })
                }
                style={styles.inputField}
                placeholderTextColor="gray"
              />
              <TouchableOpacity
                onPress={() =>
                  setUsuario({ ...usuario, showSenha: !usuario.showSenha })
                }
              >
                <Ionicons
                  name={usuario.showSenha ? "eye-off-outline" : "eye-outline"}
                  size={width * 0.05}
                  color="gray"
                />
              </TouchableOpacity>
            </View>

            {/* Botão de Login */}
            <TouchableOpacity onPress={handleLogin} style={styles.button}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Esqueceu senha */}
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setForgotPasswordModalVisible(true)}
            >
              <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            {/* Cadastro */}
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                handleCloseLogin();
                onOpenCadastro
                  ? onOpenCadastro()
                  : navigation.navigate("Cadastro");
              }}
            >
              <Text style={styles.linkText}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Modais */}
      <CustomModal
        open={modalState.visible}
        onClose={() => setModalState({ ...modalState, visible: false })}
        title={modalState.type === "success" ? "Login Concluído" : "Erro"}
        message={modalState.message}
        type={modalState.type}
      />

      <ForgotPasswordModal
        visible={forgotPasswordModalVisible}
        onClose={() => setForgotPasswordModalVisible(false)}
      />
    </Modal>
  );
}

export default Login;
