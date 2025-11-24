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

const { width: W, height: H } = Dimensions.get("window");

export default function CreateUserModal({
  visible,
  onClose,
  onRegistrationSuccess,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");

  const [isLoading, setIsLoading] = useState(false);

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customModalTitle, setCustomModalTitle] = useState("");
  const [customModalMessage, setCustomModalMessage] = useState("");
  const [customModalType, setCustomModalType] = useState("error");

  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [formDataForVerification, setFormDataForVerification] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("user");
    setIsLoading(false);
  };

  const handleRegister = async () => {
    setIsLoading(true);

    try {
      const response = await sheets.registerUserByManager({
        name,
        email,
        password,
        confirmPassword,
        role,
      });

      const data = response.data;

      if (data.success) {
        setCustomModalTitle("Sucesso");
        setCustomModalMessage(data.message);
        setCustomModalType("success");
        setCustomModalVisible(true);

        setFormDataForVerification({ email });
        setVerifyModalVisible(true);

        onClose();
      } else {
        setCustomModalTitle("Erro");
        setCustomModalMessage(
          data.details || data.error || "Falha ao registrar usuário."
        );
        setCustomModalType("error");
        setCustomModalVisible(true);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.details ||
        err.response?.data?.error ||
        "Erro de conexão ao tentar registrar.";

      setCustomModalTitle("Erro");
      setCustomModalMessage(errorMsg);
      setCustomModalType("error");
      setCustomModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = (user) => {
    setCustomModalTitle("Sucesso");
    setCustomModalMessage("Usuário criado e verificado com sucesso!");
    setCustomModalType("success");
    setCustomModalVisible(true);

    clearForm();
    onRegistrationSuccess(user);
    setVerifyModalVisible(false);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent
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
                size={W * 0.07}
                color="#999"
              />
            </TouchableOpacity>

            <Text style={styles.titleText}>Criar Novo Usuário</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width: "100%" }}
            >
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={W * 0.05} color="gray" />
                <TextInput
                  style={styles.inputField}
                  placeholder="Nome Completo"
                  placeholderTextColor="gray"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={W * 0.05} color="gray" />
                <TextInput
                  style={styles.inputField}
                  placeholder="E-mail"
                  placeholderTextColor="gray"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={W * 0.05}
                  color="gray"
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Senha Inicial"
                  placeholderTextColor="gray"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={W * 0.055}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={W * 0.05}
                  color="gray"
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Confirmar Senha"
                  placeholderTextColor="gray"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={W * 0.055}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, styles.pickerContainer]}>
                <Ionicons
                  name="briefcase-outline"
                  size={W * 0.05}
                  color="gray"
                />
                <Picker
                  selectedValue={role}
                  onValueChange={setRole}
                  style={styles.picker}
                >
                  <Picker.Item label="Usuário Comum" value="user" />
                  <Picker.Item
                    label="Gerente/Administrador"
                    value="manager"
                  />
                </Picker>
              </View>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Cadastrar Usuário
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CustomModal
        open={customModalVisible}
        onClose={() => setCustomModalVisible(false)}
        title={customModalTitle}
        message={customModalMessage}
        type={customModalType}
      />

      <VerificationModal
        visible={verifyModalVisible}
        formData={formDataForVerification}
        mode="register"
        onVerificationSuccess={handleVerificationSuccess}
        onClose={() => setVerifyModalVisible(false)}
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
  modal: {
    backgroundColor: "white",
    padding: W * 0.06,
    borderRadius: 15,
    width: W * 0.85,
    maxWidth: 400,
    maxHeight: H * 0.8,
    alignItems: "center",
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
    marginTop: 10,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: W * 0.045,
  },
});
