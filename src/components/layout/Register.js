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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/axios";
import CustomModal from "../mod/CustomModal";
import VerificationModal from "./VerificationModal";
import Login from "./Login"; 

const { width, height } = Dimensions.get("window");

const InputField = ({ iconName, placeholder, value, onChangeText, secureTextEntry, onToggleSecureEntry }) => (
  <View style={styles.inputContainer}>
    <Ionicons name={iconName} size={width * 0.05} color="gray" />
    <TextInput
      style={styles.inputField}
      placeholder={placeholder}
      placeholderTextColor="gray"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
    {onToggleSecureEntry && (
      <TouchableOpacity onPress={onToggleSecureEntry}>
        <Ionicons
          name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
          size={width * 0.05}
          color="gray"
        />
      </TouchableOpacity>
    )}
  </View>
);

export default function Register({ visible, onClose, onOpenLogin }) {
  const initialFormData = { name: "", email: "", password: "", confirmPassword: "" };
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [customModal, setCustomModal] = useState({ visible: false, message: "", type: "info" });

  useEffect(() => {
    if (visible) {
      setCustomModal({ visible: false, message: "", type: "info" });
    }
  }, [visible]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCloseAndReset = () => {
    setCustomModal({ visible: false, message: "", type: "info" });
    onClose();
  };

  const handleCadastro = async () => {
    setIsLoading(true);
    try {
      const response = await api.postSendVerificationCode(formData);

      if (response.status === 200) {
        setCustomModal({ visible: true, message: "Código de verificação enviado!", type: "success" });
        handleCloseAndReset();
        setVerificationModalVisible(true);
      }
    } catch (error) {
      setCustomModal({
        visible: true,
        message: error.response?.data?.details || "Erro ao enviar o código.",
        type: "error",
      });
      console.error("erro", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setFormData(initialFormData);
    setVerificationModalVisible(false);

    if (onOpenLogin) {
      onOpenLogin();
    } else {
      setLoginModalVisible(true);
    }
  };

  return (
    <>
      <Modal animationType="fade" transparent visible={visible} onRequestClose={handleCloseAndReset}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
            <View style={styles.modal}>
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseAndReset}>
                <Ionicons name="close-circle-outline" size={width * 0.07} color="#999" />
              </TouchableOpacity>
              <Image source={require("../../img/logo.png")} style={styles.headerImage} />
              <InputField
                iconName="person-outline"
                placeholder="nome"
                value={formData.name}
                onChangeText={(v) => handleChange("name", v)}
              />
              <InputField
                iconName="mail-outline"
                placeholder="e-mail"
                value={formData.email}
                onChangeText={(v) => handleChange("email", v)}
              />
              <InputField
                iconName="lock-closed-outline"
                placeholder="senha"
                value={formData.password}
                secureTextEntry={showPassword}
                onChangeText={(v) => handleChange("password", v)}
                onToggleSecureEntry={() => setShowPassword(!showPassword)}
              />
              <InputField
                iconName="lock-closed-outline"
                placeholder="confirmar senha"
                value={formData.confirmPassword}
                secureTextEntry={showPassword}
                onChangeText={(v) => handleChange("confirmPassword", v)}
                onToggleSecureEntry={() => setShowPassword(!showPassword)}
              />

              <TouchableOpacity onPress={handleCadastro} style={styles.confirmButton} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Cadastrar-se</Text>}
              </TouchableOpacity>

              <View style={styles.separator} />

              <Text style={styles.createAccountText}>Já tem uma conta?</Text>
              <TouchableOpacity
                style={styles.buttonToLogin}
                onPress={() => {
                  handleCloseAndReset();
                  if (onOpenLogin) onOpenLogin();
                  else setLoginModalVisible(true);
                }}
              >
                <Text style={styles.textButtonToLogin}>Login</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Login visible={loginModalVisible} onClose={() => setLoginModalVisible(false)} onOpenCadastro={() => {}} />

      <VerificationModal
  visible={verificationModalVisible}
  onClose={() => setVerificationModalVisible(false)}
  formData={formData}
  onVerificationSuccess={handleVerificationSuccess}
  mode="register"
/>


      <CustomModal
        open={customModal.visible}
        onClose={() => setCustomModal({ ...customModal, visible: false })}
        title={customModal.type === "success" ? "Sucesso" : "Erro"}
        message={customModal.message}
        type={customModal.type}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  keyboardView: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%" },
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
  closeButton: { position: "absolute", top: 10, right: 10, padding: 5, zIndex: 1 },
  headerImage: { width: width * 0.6, height: width * 0.25, resizeMode: "contain", marginBottom: height * 0.02 },
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
  inputField: { flex: 1, fontSize: width * 0.04, color: "#333", paddingVertical: 0 },
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
  confirmButtonText: { color: "white", fontWeight: "bold", fontSize: width * 0.045 },
  separator: { height: 1, width: "80%", backgroundColor: "#eee", marginVertical: height * 0.018 },
  buttonToLogin: { marginTop: height * 0.015 },
  textButtonToLogin: { fontSize: width * 0.045, color: "rgb(152, 0, 0)", fontWeight: "bold", textDecorationLine: "underline" },
  createAccountText: { fontSize: width * 0.039, color: "gray" },
});
