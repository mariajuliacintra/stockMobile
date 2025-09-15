// components/layout/VerifyCodeModal.js (versão refatorada)

import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomModal from "../mod/CustomModal";

const { width, height } = Dimensions.get("window");

// O modal agora aceita 'onVerify' e 'email' como props.
export default function VerifyCodeModal({ visible, onClose, onVerify, email }) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const [internalModalMessage, setInternalModalMessage] = useState("");
  const [internalModalType, setInternalModalType] = useState("");

  async function handleCodeVerification() {
    setIsLoading(true);
    if (!verificationCode) {
      setInternalModalMessage("Por favor, insira o código de verificação.");
      setInternalModalType("error");
      setInternalModalVisible(true);
      setIsLoading(false);
      return;
    }

    try {
      // Chama a função onVerify, que é passada pelo componente pai
      const response = await onVerify(verificationCode);

      if (response.success) {
        setInternalModalMessage(response.message || "Verificação bem-sucedida!");
        setInternalModalType("success");
        setInternalModalVisible(true);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setInternalModalMessage(response.error || "Erro ao verificar o código.");
        setInternalModalType("error");
        setInternalModalVisible(true);
      }
    } catch (error) {
      setInternalModalMessage(error.message || "Erro ao verificar o código.");
      setInternalModalType("error");
      setInternalModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle-outline" size={width * 0.07} color="#999" />
            </TouchableOpacity>
            <Text style={styles.titleText}>Verificação de E-mail</Text>
            <Text style={styles.instructionText}>
              Um código foi enviado para o e-mail: <Text style={{ fontWeight: "bold" }}>{email}</Text>. Por favor, digite o código abaixo.
            </Text>
            
            <View style={[styles.inputContainer, styles.disabledInputContainer]}>
              <Ionicons name="mail-outline" size={width * 0.05} color="gray" />
              <Text style={[styles.inputField, styles.disabledInputText]}>{email}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={width * 0.05} color="gray" />
              <TextInput
                style={styles.inputField}
                placeholder="Código de Verificação"
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholderTextColor="gray"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity onPress={handleCodeVerification} style={styles.confirmButton} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Verificar</Text>}
            </TouchableOpacity>
          </View>
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

const styles = StyleSheet.create({
  //... (Seus estilos existentes)
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
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  titleText: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: height * 0.02,
    color: "#333",
  },
  instructionText: {
    fontSize: width * 0.04,
    color: "gray",
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
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
  confirmButton: {
    backgroundColor: "rgb(177, 16, 16)",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.08,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  disabledInputContainer: {
    backgroundColor: "#e8e8e8", 
  },
  disabledInputText: {
    color: "#666", 
  },
});