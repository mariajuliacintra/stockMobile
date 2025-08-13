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
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import api from "../../services/axios";
import CustomModal from "../mod/CustomModal";
import VerificationModal from "./VerificationModal";

const { width, height } = Dimensions.get("window");

// Componente reutilizável para os campos de entrada
const InputField = ({ iconName, placeholder, value, onChangeText, secureTextEntry, onToggleSecureEntry }) => (
  <View style={styles.inputContainer}>
    <Ionicons name={iconName} size={width * 0.05} color="gray" />
    <TextInput
      style={styles.inputField}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="gray"
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

export default function Cadastro({ visible, onClose, onOpenLogin }) {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationModalVisible, setIsVerificationModalVisible] = useState(false);

  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const [internalModalMessage, setInternalModalMessage] = useState("");
  const [internalModalType, setInternalModalType] = useState("info");

  function handleChange(field, value) {
    setFormData(prevData => ({ ...prevData, [field]: value }));
  }

  async function handleCadastro() {
    setIsLoading(true);
    if (formData.password !== formData.confirmPassword) {
      setInternalModalMessage("As senhas não coincidem.");
      setInternalModalType("error");
      setInternalModalVisible(true);
      setIsLoading(false);
      return;
    }

    try {
      // CORREÇÃO: Enviando o objeto formData completo.
      // Isso garante que todos os campos, incluindo confirmPassword, sejam enviados.
      const response = await api.postEnviarCodigoVerificacao(formData);
      
      if (response.status === 200) {
        setInternalModalMessage("Código de verificação enviado para o seu e-mail!");
        setInternalModalType("success");
        setInternalModalVisible(true);
        onClose();
        setIsVerificationModalVisible(true);
      }
    } catch (error) {
      setInternalModalMessage(error.response?.data?.error || "Erro ao enviar o código.");
      console.error(error);
      setInternalModalType("error");
      setInternalModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  }

  const handleVerificationSuccess = () => {
    setIsVerificationModalVisible(false);
    navigation.navigate("Principal");
  };

  return (
    <>
      <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={styles.modal}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close-circle-outline" size={width * 0.07} color="#999" />
              </TouchableOpacity>

              <Image source={require("../../img/logo.png")} style={styles.headerImage} />

              <InputField
                iconName="person-outline"
                placeholder="nome"
                value={formData.name}
                onChangeText={(value) => handleChange("name", value)}
              />
              <InputField
                iconName="mail-outline"
                placeholder="e-mail"
                value={formData.email}
                onChangeText={(value) => handleChange("email", value)}
              />
              <InputField
                iconName="lock-closed-outline"
                placeholder="senha"
                value={formData.password}
                secureTextEntry={showPassword}
                onChangeText={(value) => handleChange("password", value)}
                onToggleSecureEntry={() => setShowPassword(!showPassword)}
              />
              <InputField
                iconName="lock-closed-outline"
                placeholder="confirmar senha"
                value={formData.confirmPassword}
                secureTextEntry={showPassword}
                onChangeText={(value) => handleChange("confirmPassword", value)}
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
                  onClose();
                  if (onOpenLogin) {
                    onOpenLogin();
                  } else {
                    navigation.navigate("Login");
                  }
                }}
              >
                <Text style={styles.textButtonToLogin}>Login</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <VerificationModal
          visible={isVerificationModalVisible}
          onClose={() => setIsVerificationModalVisible(false)}
          formData={formData}
          onVerificationSuccess={handleVerificationSuccess}
      />
      
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
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
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
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
  separator: {
    height: 1,
    width: "80%",
    backgroundColor: "#eee",
    marginVertical: height * 0.018,
  },
  buttonToLogin: {
    backgroundColor: "transparent",
    paddingVertical: height * 0.0001,
    paddingHorizontal: width * 0.05,
    borderRadius: 8,
    alignItems: "center",
    marginTop: height * 0.015,
    width: "100%",
  },
  textButtonToLogin: {
    fontSize: width * 0.045,
    color: "rgb(152, 0, 0)",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  createAccountText: {
    fontSize: width * 0.039,
    color: "gray",
    marginBottom: height * 0.001,
  },
});
