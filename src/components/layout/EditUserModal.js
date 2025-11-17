import React, { useState, useEffect } from "react";
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
import * as SecureStore from 'expo-secure-store';
import VerificationModal from './VerificationModal'; 

const { width, height } = Dimensions.get("window");

export default function EditUserModal({
  visible,
  onClose,
  showCustomModal,
  user, 
  onUpdateSuccess, 
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [formDataForVerification, setFormDataForVerification] = useState({});

  useEffect(() => {
    if (visible && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "user");
    }
  }, [visible, user]);

  const handleUpdate = async () => {
    if (!name || !email || !role) {
      showCustomModal("Atenção", "Nome, e-mail e cargo são obrigatórios.", "warning");
      return;
    }

    setIsLoading(true);

    try {
      const storedToken = await SecureStore.getItemAsync("tokenUsuario");
      if (!user.idUser || !storedToken) {
        showCustomModal("Erro", "Dados de usuário ou token de acesso ausentes.", "error");
        setIsLoading(false);
        return;
      }

      const dadosAtualizados = { 
        name, 
        email, 
        role 
      };

      const headers = { Authorization: storedToken };
      const response = await sheets.putAtualizarUsuario(user.idUser, dadosAtualizados, { headers }); 

      const responseData = response.data;

      const requiresVerification =
          Array.isArray(responseData.data) && responseData.data[0]?.requiresEmailVerification;
      if (requiresVerification) {
          setFormDataForVerification({ email: email, userId: user.idUser });
          setVerifyModalVisible(true);
          onClose(); 
          showCustomModal(
            "Verificação Pendente", 
            responseData.message || "E-mail alterado. Insira o código enviado para concluir a verificação.", 
            "info"
          );
      } else if (responseData.success) {
        showCustomModal("Sucesso", responseData.message || "Usuário atualizado com sucesso!", "success");
        onUpdateSuccess(); 
        onClose(); 
      } else {
        showCustomModal(
          "Erro",
          responseData.details || responseData.error || "Falha ao atualizar usuário.",
          "error"
        );
      }

    } catch (error) {
      const errorMsg =
        error.response?.data?.details ||
        error.response?.data?.error ||
        "Erro de conexão ao tentar atualizar.";
      showCustomModal("Erro", errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    showCustomModal(
      "Sucesso",
      "E-mail verificado e usuário atualizado com sucesso!",
      "success"
    );
    onUpdateSuccess(); 
    setVerifyModalVisible(false); 
  };
  
  const handleClose = () => {
    onClose();
    setName("");
    setEmail("");
    setRole("user");
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons
                name="close-circle-outline"
                size={width * 0.07}
                color="#999"
              />
            </TouchableOpacity>

            <Text style={styles.titleText}>Editar Usuário: {user?.name}</Text>
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
                onPress={handleUpdate}
                style={[styles.confirmButton, { backgroundColor: '#FF2C2C' }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Salvar Alterações</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <VerificationModal
        visible={verifyModalVisible}
        onClose={() => setVerifyModalVisible(false)}
        formData={formDataForVerification}
        onVerificationSuccess={handleVerificationSuccess}
        mode="update" 
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
