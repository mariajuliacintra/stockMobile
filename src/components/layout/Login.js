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
import api from "../../services/axios"; // Certifique-se de que este caminho está correto

const { width, height } = Dimensions.get("window");

function Login({ visible, onClose, onOpenCadastro }) {
  const navigation = useNavigation();

  // Estados do componente
  const [usuario, setUsuario] = useState({
    email: "",
    password: "",
    showSenha: true,
  });
  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const [internalModalMessage, setInternalModalMessage] = useState("");
  const [internalModalType, setInternalModalType] = useState("info");
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);

  async function armazenarDados(idUser, token) {
    try {
      await SecureStore.setItemAsync("idUsuario", idUser.toString());
      await SecureStore.setItemAsync("tokenUsuario", token.toString());
    } catch (erro) {
    }
  }

  async function handleLogin() {
    try {
      const response = await api.postLogin(usuario);

      setInternalModalMessage(response.data.message);
      setInternalModalType("success");
      setInternalModalVisible(true);

      const idUser = response.data.user.idUser;
      const token = response.data.token;

      await armazenarDados(idUser, token);

      setUsuario({
        email: "",
        password: "",
        showSenha: true,
      })
      setTimeout(() => {
        onClose();
        navigation.navigate("Principal");
      }, 1000);
    } catch (error) {
      setInternalModalMessage(error.response?.data?.error || "Erro desconhecido");
      setInternalModalType("error");
      setInternalModalVisible(true);
    }
  }

  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: "rgba(255, 255, 255, 1)",
      padding: width * 0.06,
      borderRadius: 15,
      width: width * 0.85,
      maxWidth: 400,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 10,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      padding: 5,
      zIndex: 1,
    },
    headerImage: {
      width: width * 0.6,
      height: width * 0.25,
      resizeMode: 'contain',
      marginBottom: height * 0.02,
    },
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: height * 0.025,
      gap: width * 0.02,
    },
    inputGroup: {
      flex: 1,
      alignItems: 'flex-start',
    },
    inputTitle: {
      fontSize: width * 0.035,
      marginBottom: height * 0.005,
      fontWeight: "500",
      color: '#555',
    },
    summaryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.04,
      marginBottom: height * 0.03,
      width: '100%',
    },
    summaryIcon: {
      marginRight: width * 0.025,
      color: 'rgb(177, 16, 16)',
    },
    summaryText: {
      fontSize: width * 0.038,
      color: '#333',
      fontWeight: '500',
    },
    confirmButton: {
      backgroundColor: "rgb(177, 16, 16)",
      paddingVertical: height * 0.02,
      paddingHorizontal: width * 0.08,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 6,
    },
    confirmButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: width * 0.045,
      marginLeft: width * 0.02,
    },
    separator: {
      height: 1,
      width: '80%',
      backgroundColor: '#eee',
      marginVertical: height * 0.018,
    },
    buttonToCadastro: {
      backgroundColor: "transparent",
      paddingVertical: height * 0.0001,
      paddingHorizontal: width * 0.05,
      borderRadius: 8,
      alignItems: "center",
      marginTop: height * 0.015,
      width: '100%',
    },
    textButtonToCadastro: {
      fontSize: width * 0.045,
      color: "rgb(152, 0, 0)",
      fontWeight: "bold",
      textDecorationLine: 'underline',
    },
    loginInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: '100%',
      borderWidth: 1,
      borderColor: "#ddd",
      backgroundColor: "#f5f5f5",
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.03,
      borderRadius: 8,
      marginBottom: height * 0.025,
    },
    loginInputField: {
      flex: 1,
      fontSize: width * 0.04,
      color: '#333',
      paddingVertical: 0,
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%" }}
        >
          <View style={dynamicStyles.modal}>
            <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle-outline" size={width * 0.07} color="#999" />
            </TouchableOpacity>

            <Image
              source={require("../../img/logo.png")}
              style={dynamicStyles.headerImage}
            />

            <View style={dynamicStyles.loginInputContainer}>
              <Ionicons name="person-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <TextInput
                placeholder="e-mail"
                value={usuario.email}
                onChangeText={(value) => {
                  setUsuario({ ...usuario, email: value });
                }}
                style={dynamicStyles.loginInputField}
                placeholderTextColor="gray"
              />
            </View>

            <View style={dynamicStyles.loginInputContainer}>
              <Ionicons name="lock-closed-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <TextInput
                style={dynamicStyles.loginInputField}
                placeholder="senha"
                value={usuario.password}
                secureTextEntry={usuario.showSenha}
                onChangeText={(value) => {
                  setUsuario({ ...usuario, password: value });
                }}
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

            <TouchableOpacity onPress={handleLogin} style={dynamicStyles.confirmButton}>
              <Text style={dynamicStyles.confirmButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={dynamicStyles.separator} />

            <TouchableOpacity
              style={dynamicStyles.buttonToCadastro}
              onPress={() => {
                setForgotPasswordModalVisible(true);
              }}
            >
              <Text style={dynamicStyles.textButtonToCadastro}>Esqueceu a senha?</Text>
            </TouchableOpacity>
              
            <TouchableOpacity
              style={dynamicStyles.buttonToCadastro}
              onPress={() => {
                onClose();
                if (onOpenCadastro) {
                  onOpenCadastro();
                } else {
                  navigation.navigate("Cadastro");
                }
              }}
            >
              <Text style={dynamicStyles.textButtonToCadastro}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      <CustomModal
        open={internalModalVisible}
        onClose={() => setInternalModalVisible(false)}
        title={internalModalType === "success" ? "Login Concluído" : "Erro"}
        message={internalModalMessage}
        type={internalModalType}
      />
      <ForgotPasswordModal
        visible={forgotPasswordModalVisible}
        onClose={() => setForgotPasswordModalVisible(false)}
      />
    </Modal>
  );
}

export default Login;