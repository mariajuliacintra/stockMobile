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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import sheets from "../../services/axios";
import CustomModal from "../mod/CustomModal";

const { width, height } = Dimensions.get("window");

function ForgotPasswordModal({ visible, onClose }) {
  const [email, setEmail] = useState("");
  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const [internalModalMessage, setInternalModalMessage] = useState("");
  const [internalModalType, setInternalModalType] = useState("info");

  const handleSendRecoveryEmail = async () => {
    try {
      const response = await sheets.postVerifyRecoveryPassword(email);
      setInternalModalMessage(response.data.message);
      setInternalModalType("success");
      setInternalModalVisible(true);
      
      setTimeout(() => {
        setInternalModalVisible(false);
        onClose(true, email);
        setEmail("");
      }, 1000);
      
    } catch (error) {
      setInternalModalMessage(error.response?.data?.error || "Erro ao enviar o e-mail de recuperação.");
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
            
            <Text style={dynamicStyles.title}>Recuperar Senha</Text>
            <Text style={dynamicStyles.subtitle}>
              Informe o e-mail da sua conta para que possamos enviar um código de recuperação.
            </Text>
            <View style={dynamicStyles.loginInputContainer}>
              <Ionicons name="mail-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <TextInput
                placeholder="e-mail"
                value={email}
                onChangeText={(value) => setEmail(value)}
                style={dynamicStyles.loginInputField}
                placeholderTextColor="gray"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity onPress={handleSendRecoveryEmail} style={dynamicStyles.confirmButton}>
              <Text style={dynamicStyles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      <CustomModal
        open={internalModalVisible}
        onClose={() => setInternalModalVisible(false)}
        title={internalModalType === "success" ? "Sucesso" : "Erro"}
        message={internalModalMessage}
        type={internalModalType}
      />
    </Modal>
  );
}

export default ForgotPasswordModal;
