import React, { useState, useRef, useEffect } from "react";
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
import ResetPasswordModal from "./ResetPasswordModal"; // importa o novo modal

const { width, height } = Dimensions.get("window");

function VerifyCodeModal({ visible, onClose, email }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const [internalModalMessage, setInternalModalMessage] = useState("");
  const [internalModalType, setInternalModalType] = useState("info");
  const [resetVisible, setResetVisible] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (visible) {
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  }, [visible]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent: { key } }, index) => {
    if (key === "Backspace" && index > 0 && code[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleValidateCode = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setInternalModalMessage("Por favor, digite o código de 6 dígitos.");
      setInternalModalType("error");
      setInternalModalVisible(true);
      return;
    }

    try {
      const response = await sheets.postValidateRecoveryCode(email, fullCode);
      setInternalModalMessage(response.data.message);
      setInternalModalType("success");
      setInternalModalVisible(true);

      setTimeout(() => {
        setInternalModalVisible(false);
        setResetVisible(true); // abre reset password modal
      }, 1000);

    } catch (error) {
      setInternalModalMessage(error.response?.data?.error || "Erro ao validar o código.");
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
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 10,
    },
    closeButton: {
      position: "absolute",
      top: 10,
      right: 10,
      padding: 5,
      zIndex: 1,
    },
    title: {
      fontSize: width * 0.06,
      fontWeight: "bold",
      color: "#333",
      marginBottom: height * 0.02,
      textAlign: "center",
    },
    subtitle: {
      fontSize: width * 0.04,
      color: "#666",
      marginBottom: height * 0.03,
      textAlign: "center",
    },
    codeInputContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: height * 0.025,
      paddingHorizontal: width * 0.02,
    },
    codeInput: {
      width: width * 0.1,
      height: width * 0.1,
      borderWidth: 1,
      borderColor: "#ddd",
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
      textAlign: "center",
      fontSize: width * 0.05,
      color: "#333",
    },
    confirmButton: {
      backgroundColor: "rgb(177, 16, 16)",
      paddingVertical: height * 0.02,
      borderRadius: 10,
      alignItems: "center",
      width: "100%",
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
    },
  });

  return (
    <>
      {/* Modal de verificação de código */}
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

              <Text style={dynamicStyles.title}>Verificar Código</Text>
              <Text style={dynamicStyles.subtitle}>
                Digite o código de 6 dígitos que enviamos para o seu e-mail.
              </Text>

              <View style={dynamicStyles.codeInputContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    style={dynamicStyles.codeInput}
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                  />
                ))}
              </View>

              <TouchableOpacity onPress={handleValidateCode} style={dynamicStyles.confirmButton}>
                <Text style={dynamicStyles.confirmButtonText}>Validar Código</Text>
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

      {/* Modal de redefinição de senha */}
      <ResetPasswordModal
        visible={resetVisible}
        email={email}
        onClose={(done) => {
          setResetVisible(false);
          if (done) onClose(); // fecha todo o fluxo se redefiniu a senha
        }}
      />
    </>
  );
}

export default VerifyCodeModal;
