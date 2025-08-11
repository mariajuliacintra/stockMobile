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
  Dimensions,
  useWindowDimensions,
  Image
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import api from "../../services/axios";
import CustomModal from "../mod/CustomModal";

const { width, height } = Dimensions.get("window");

function Cadastro({ visible, onClose, onOpenLogin }) {
  const navigation = useNavigation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [usuario, setUsuario] = useState({
    name: "",
    email: "",
    password: "",
    showPassword: true,
  });
  const [confirmPassword, setConfirmPassword] = useState("");

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

  async function handleCadastro() {
    // CORREÇÃO: os nomes das chaves aqui agora correspondem aos nomes que sua API espera.
    const usuarioParaEnviar = {
      name: usuario.name,
      email: usuario.email,
      password: usuario.password,
      confirmPassword: confirmPassword,
    };

    try {
      const response = await api.postCadastro(usuarioParaEnviar);
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
      setInternalModalMessage(error.response?.data?.error || "Erro ao cadastrar.");
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
      backgroundColor: "white",
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
    createAccountText: {
      fontSize: width * 0.039,
      color: 'gray',
      marginBottom: height * 0.001,
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
                <Ionicons name="person-outline" size={width * 0.05} color="gray" />
                <TextInput
                    placeholder="nome"
                    value={usuario.name}
                    onChangeText={(value) => {
                        setUsuario({ ...usuario, name: value });
                    }}
                    style={dynamicStyles.loginInputField}
                    placeholderTextColor="gray"
                />
            </View>

            <View style={dynamicStyles.loginInputContainer}>
                <Ionicons name="mail-outline" size={width * 0.05} color="gray" />
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
                <Ionicons name="lock-closed-outline" size={width * 0.05} color="gray" />
                <TextInput
                    style={dynamicStyles.loginInputField}
                    placeholder="senha"
                    value={usuario.password}
                    secureTextEntry={usuario.showPassword}
                    onChangeText={(value) => {
                        setUsuario({ ...usuario, password: value });
                    }}
                    placeholderTextColor="gray"
                />
                <TouchableOpacity
                    onPress={() => setUsuario({ ...usuario, showPassword: !usuario.showPassword })}
                >
                    <Ionicons
                        name={usuario.showPassword ? "eye-off-outline" : "eye-outline"}
                        size={width * 0.05}
                        color="gray"
                    />
                </TouchableOpacity>
            </View>

            <View style={dynamicStyles.loginInputContainer}>
                <Ionicons name="lock-closed-outline" size={width * 0.05} color="gray" />
                <TextInput
                    style={dynamicStyles.loginInputField}
                    placeholder="confirmar senha"
                    value={confirmPassword}
                    secureTextEntry={usuario.showPassword}
                    onChangeText={(value) => setConfirmPassword(value)}
                    placeholderTextColor="gray"
                />
                <TouchableOpacity
                    onPress={() => setUsuario({ ...usuario, showPassword: !usuario.showPassword })}
                >
                    <Ionicons
                        name={usuario.showPassword ? "eye-off-outline" : "eye-outline"}
                        size={width * 0.05}
                        color="gray"
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleCadastro}
              style={dynamicStyles.confirmButton}
            >
              <Text style={dynamicStyles.confirmButtonText}>Cadastrar-se</Text>
            </TouchableOpacity>
            
            <View style={dynamicStyles.separator} />

            <Text style={dynamicStyles.createAccountText}>Já tem uma conta?</Text>
            <TouchableOpacity
              style={dynamicStyles.buttonToCadastro}
              onPress={() => {
                onClose();
                if (onOpenLogin) {
                  onOpenLogin();
                } else {
                  navigation.navigate("Login");
                }
              }}
            >
              <Text style={dynamicStyles.textButtonToCadastro}>Login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      <CustomModal
        open={internalModalVisible}
        onClose={() => setInternalModalVisible(false)}
        title={internalModalType === "success" ? "Cadastro Concluído" : "Erro"}
        message={internalModalMessage}
        type={internalModalType}
      />
    </Modal>
  );
}

export default Cadastro;
