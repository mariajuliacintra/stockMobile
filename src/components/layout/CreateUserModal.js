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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import sheets from "../../services/axios";
import CustomModal from "../mod/CustomModal";
import VerificationModal from "./VerificationModal";

const { width, height } = Dimensions.get("window");

export default function CreateUserModal({
  visible,
  onClose,
  showCustomModal,
  onRegistrationSuccess,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);

  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [formDataForVerification, setFormDataForVerification] = useState({});

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("user");
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !role) {
      showCustomModal("Atenção", "Todos os campos são obrigatórios.", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showCustomModal("Erro", "As senhas não coincidem.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await sheets.registerUserByManager({
        name,
        email,
        password,
        confirmPassword,
        role,
      });

      const responseData = response.data;

      if (responseData.success) {
        showCustomModal("Atenção!", responseData.message, "info");
        setFormDataForVerification({ email });
        setVerifyModalVisible(true);
        onClose();
      } else {
        showCustomModal(
          "Erro",
          responseData.details ||
            responseData.error ||
            "Falha ao registrar usuário.",
          "error"
        );
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.details ||
        error.response?.data?.error ||
        "Erro de conexão ao tentar registrar.";
      showCustomModal("Erro", errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = (user) => {
    showCustomModal(
      "Sucesso",
      "Usuário criado e verificado com sucesso!",
      "success"
    );
    clearForm();
    onRegistrationSuccess(user);
    setVerifyModalVisible(false);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                onClose();
                clearForm();
              }}
            >
              <Ionicons
                name="close-circle-outline"
                size={width * 0.07}
                color="#999"
              />
            </TouchableOpacity>

            <Text style={styles.titleText}>Criar Novo Usuário</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%" }}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={width * 0.05} color="gray" />
                <TextInput
                  style={styles.inputField}
                  placeholder="Nome Completo"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="gray"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={width * 0.05} color="gray" />
                <TextInput
                  style={styles.inputField}
                  placeholder="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="gray"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={width * 0.05} color="gray" />
                <TextInput
                  style={styles.inputField}
                  placeholder="Senha Inicial"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="gray"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={width * 0.05} color="gray" />
                <TextInput
                  style={styles.inputField}
                  placeholder="Confirmar Senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor="gray"
                  secureTextEntry
                />
              </View>

              <View style={[styles.inputContainer, styles.pickerContainer]}>
                <Ionicons name="briefcase-outline" size={width * 0.05} color="gray" />
                <Picker
                  selectedValue={role}
                  onValueChange={(itemValue) => setRole(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Usuário Comum" value="user" />
                  <Picker.Item label="Gerente/Administrador" value="manager" />
                </Picker>
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                style={styles.confirmButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Cadastrar Usuário</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <VerificationModal
        visible={verifyModalVisible}
        onClose={() => {
          setVerifyModalVisible(false);
          onRegistrationSuccess();
        }}
        formData={formDataForVerification}
        onVerificationSuccess={handleVerificationSuccess}
        mode="register"
      />
    </>
  );
}

const { width: W, height: H } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: W * 0.06,
    borderRadius: 15,
    width: W * 0.85,
    maxWidth: 400,
    maxHeight: H * 0.8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  titleText: {
    fontSize: W * 0.055,
    fontWeight: "bold",
    marginBottom: H * 0.02,
    color: "#333",
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
    paddingVertical: H * 0.015,
    paddingHorizontal: W * 0.03,
    borderRadius: 8,
    marginBottom: H * 0.025,
  },
  inputField: {
    flex: 1,
    fontSize: W * 0.04,
    color: "#333",
    marginLeft: 10,
  },
  pickerContainer: {
    paddingVertical: 0,
  },
  picker: {
    flex: 1,
    height: H * 0.06,
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#FF2C2C",
    paddingVertical: H * 0.02,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: W * 0.045,
  },
});