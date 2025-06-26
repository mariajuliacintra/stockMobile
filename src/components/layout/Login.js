import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

import api from "../../services/axios";
import CustomModal from "../mod/CustomModal";

function Login({ visible, onClose, onOpenCadastro }) {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  const [usuario, setUsuario] = useState({
    email: "",
    senha: "",
    showSenha: true,
  });

  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const [internalModalMessage, setInternalModalMessage] = useState("");
  const [internalModalType, setInternalModalType] = useState("info");

  async function armazenarDados(idUsuario, token) {
    try {
      await SecureStore.setItemAsync("idUsuario", idUsuario.toString());
      await SecureStore.setItemAsync("tokenUsuario", token.toString());
    } catch (erro) {
      console.error("Erro ao armazenar dados:", erro);
    }
  }

  async function handleLogin() {
    try {
      const response = await api.postLogin(usuario);
      console.log(response.data.message);
      setInternalModalMessage(response.data.message);
      setInternalModalType("success");
      setInternalModalVisible(true);

      const idUsuario = response.data.usuario.id_usuario;
      const token = response.data.token;

      armazenarDados(idUsuario, token);

      setTimeout(() => {
        onClose();
        navigation.navigate("Principal");
      }, 700);
    } catch (error) {
      setInternalModalMessage(error.response?.data?.error || "Erro desconhecido");
      setInternalModalType("error");
      setInternalModalVisible(true);
    }
  }

  const dynamicStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: width * 0.84,
      maxHeight: height * 0.8,
      backgroundColor: "white",
      borderRadius: 10,
      paddingVertical: height * 0.05,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 1,
      padding: 5,
    },
    modalTitle: {
      fontSize: width * 0.062,
      fontWeight: '600',
      marginBottom: height * 0.04,
      color: '#333',
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: width * 0.7,
      backgroundColor: "white",
      borderRadius: 5,
      marginBottom: height * 0.02,
      paddingHorizontal: width * 0.03,
      height: height * 0.06,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    iconStyle: {
      marginRight: width * 0.02,
    },
    inputField: {
      flex: 1,
      fontSize: width * 0.04,
      color: 'black',
      paddingVertical: 0,
    },
    buttonEntrar: {
      backgroundColor: "rgb(250, 24, 24)",
      paddingVertical: height * 0.018,
      paddingHorizontal: width * 0.1,
      borderRadius: 5,
      alignItems: "center",
      marginTop: height * 0.03,
      width: width * 0.7,
    },
    textButtonEntrar: {
      fontSize: width * 0.045,
      color: "white",
      fontWeight: "bold",
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
      width: width * 0.7,
    },
    textButtonToCadastro: {
      fontSize: width * 0.045,
      color: "rgb(152, 0, 0)",
      fontWeight: "bold",
      textDecorationLine: 'underline',
    },
    createAccountText: {
      fontSize: width * 0.039,
      color: 'gray',
      marginBottom: height * 0.001,
    }
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%" }}
        >
          <View style={dynamicStyles.modalContent}>
            <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle-outline" size={width * 0.07} color="gray" />
            </TouchableOpacity>

            <Text style={dynamicStyles.modalTitle}>Login</Text>

            <View style={dynamicStyles.inputContainer}>
                <Ionicons name="person-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
                <TextInput
                    placeholder="e-mail"
                    value={usuario.email}
                    onChangeText={(value) => {
                        setUsuario({ ...usuario, email: value });
                    }}
                    style={dynamicStyles.inputField}
                    placeholderTextColor="gray"
                />
            </View>

            <View style={dynamicStyles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
                <TextInput
                    style={dynamicStyles.inputField}
                    placeholder="senha"
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
                >
                    <Ionicons
                        name={usuario.showSenha ? "eye-off-outline" : "eye-outline"}
                        size={width * 0.05}
                        color="gray"
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleLogin} style={dynamicStyles.buttonEntrar}>
              <Text style={dynamicStyles.textButtonEntrar}>Login</Text>
            </TouchableOpacity>

            <View style={dynamicStyles.separator} />

            <Text style={dynamicStyles.createAccountText}>Não tem uma conta?</Text>
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
    </Modal>
  );
}

export default Login;
