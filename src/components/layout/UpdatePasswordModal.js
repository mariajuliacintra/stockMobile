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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import sheets from "../../services/axios";
import CustomModal from "../mod/CustomModal";

const { width, height } = Dimensions.get("window");

function UpdatePasswordModal({ visible, onClose, email }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const [internalModalMessage, setInternalModalMessage] = useState("");
  const [internalModalType, setInternalModalType] = useState("");
  
  useEffect(() => {
    if (!visible) {
      setPassword("");
      setConfirmPassword("");
    }
  }, [visible]);

  const handleUpdatePassword = async () => {
    try {
      if (password !== confirmPassword) {
        setInternalModalMessage("As senhas não coincidem.");
        setInternalModalType("error");
        setInternalModalVisible(true);
        return;
      }

      
      const response = await sheets.postRecoveryPassword({
        email,
        password,
        confirmPassword,
      });

      setInternalModalMessage(response.data.message);
      setInternalModalType("success");
      setInternalModalVisible(true);

      setTimeout(() => {
        setInternalModalVisible(false);
        onClose(true);
      }, 800);

    } catch (error) {
      setInternalModalMessage(error.response?.data?.error || "Erro ao atualizar a senha.");
      setInternalModalType("error");
      setInternalModalVisible(true);
    }
  };

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
    title: {
      fontSize: width * 0.06,
      fontWeight: "bold",
      color: '#333',
      marginBottom: height * 0.02,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: width * 0.04,
      color: '#666',
      marginBottom: height * 0.03,
      textAlign: 'center',
    },
    inputContainer: {
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
    inputField: {
      flex: 1,
      fontSize: width * 0.04,
      color: '#333',
      paddingVertical: 0,
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
  });

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={() => onClose(false)}
      >
        <View style={dynamicStyles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%" }}
          >
            <View style={dynamicStyles.modal}>
              <TouchableOpacity style={dynamicStyles.closeButton} onPress={() => onClose(false)}>
                <Ionicons name="close-circle-outline" size={width * 0.07} color="#999" />
              </TouchableOpacity>
              
              <Text style={dynamicStyles.title}>Atualizar Senha</Text>
              <Text style={dynamicStyles.subtitle}>
                Insira sua nova senha para continuar.
              </Text>
              {/* Input para Nova Senha */}
              <View style={dynamicStyles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={width * 0.05} color="gray" />
                <TextInput
                  placeholder="Nova Senha"
                  value={password}
                  onChangeText={setPassword}
                  // secureTextEntry agora depende do estado 'showPassword'
                  secureTextEntry={showPassword}
                  style={dynamicStyles.inputField}
                  placeholderTextColor="gray"
                />
                {/* Botão de "olho" para alternar a visibilidade */}
                <TouchableOpacity
                  style={dynamicStyles.togglePasswordButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    // O ícone muda dependendo do estado
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={width * 0.05}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>

              <View style={dynamicStyles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={width * 0.05} color="gray" />
                <TextInput
                  placeholder="Confirmar Nova Senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={showPassword}
                  style={dynamicStyles.inputField}
                  placeholderTextColor="gray"
                />
                <TouchableOpacity
                  style={dynamicStyles.togglePasswordButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    // O ícone muda dependendo do estado
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={width * 0.05}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleUpdatePassword} style={dynamicStyles.confirmButton}>
                <Text style={dynamicStyles.confirmButtonText}>Atualizar Senha</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <CustomModal
        open={internalModalVisible}
        onClose={() => setInternalModalVisible(false)}
        title={internalModalType === "success" ? "Sucesso" : "Erro"}
        message={internalModalMessage}
        type={internalModalType}
      />
    </>
  );
}

export default UpdatePasswordModal;
