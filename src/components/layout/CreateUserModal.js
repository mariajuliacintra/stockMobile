// components/layout/CreateUserModal.js

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
  showCustomModal, // Função para exibir alertas globais
  onRegistrationSuccess, // Função chamada ao iniciar o registro com sucesso
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Padrão: user
  const [isLoading, setIsLoading] = useState(false);

  // Estado para o modal de verificação (necessário após o registro temporário)
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [formDataForVerification, setFormDataForVerification] = useState({});


  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      showCustomModal("Atenção", "Todos os campos são obrigatórios.", "warning");
      return;
    }

    setIsLoading(true);

    try {
      // 💡 Chamar a rota registerUserByManager
      const response = await sheets.registerUserByManager({
        name,
        email,
        password,
        role,
      });

      const responseData = response.data;
      
      console.log("[LOG] Resposta Registro Gerente:", responseData);

      if (responseData.success) {
        showCustomModal("Atenção!", responseData.message, "info");
        
        // Abrir o modal de verificação, passando os dados necessários
        setFormDataForVerification({ email });
        setVerifyModalVisible(true);
        
        onClose(); // Fechar o modal de criação
      } else {
        showCustomModal("Erro", responseData.details || responseData.error || "Falha ao registrar usuário.", "error");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.details || error.response?.data?.error || "Erro de conexão ao tentar registrar.";
      console.error("Erro ao registrar usuário:", error.response?.data || error);
      showCustomModal("Erro", errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Callback de sucesso da verificação (para ser passado ao VerificationModal)
  const handleVerificationSuccess = (user) => {
    // A API deve retornar o usuário finalizado. O PerfilScreen pode precisar ser recarregado.
    showCustomModal("Sucesso", "Usuário criado e verificado com sucesso!", "success");
    clearForm();
    onRegistrationSuccess(user); // Sinaliza para o UsersScreen recarregar a lista
    setVerifyModalVisible(false);
  };


  return (
    <>
      <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity style={styles.closeButton} onPress={() => { onClose(); clearForm(); }}>
              <Ionicons name="close-circle-outline" size={width * 0.07} color="#999" />
            </TouchableOpacity>

            <Text style={styles.titleText}>Criar Novo Usuário</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>

              {/* Input Nome */}
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

              {/* Input Email */}
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

              {/* Input Senha */}
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
              
              {/* Picker de Função (Role) */}
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

              {/* Botão de Confirmação */}
              <TouchableOpacity onPress={handleRegister} style={styles.confirmButton} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Cadastrar Usuário</Text>}
              </TouchableOpacity>
            
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Verificação (Usado após o sucesso do registro temporário) */}
      <VerificationModal
          visible={verifyModalVisible}
          onClose={() => { setVerifyModalVisible(false); onRegistrationSuccess(); }}
          formData={formDataForVerification}
          onVerificationSuccess={handleVerificationSuccess}
          mode="register" // Usa o modo de registro/finalização
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
    padding: width * 0.06,
    borderRadius: 15,
    width: width * 0.85,
    maxWidth: 400,
    maxHeight: height * 0.8, // Limita a altura para caber na tela
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  titleText: {
    fontSize: width * 0.055,
    fontWeight: "bold",
    marginBottom: height * 0.02,
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
    marginLeft: 10,
  },
  pickerContainer: {
    paddingVertical: 0,
  },
  picker: {
    flex: 1,
    height: height * 0.06, // Altura padrão do input
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#4CAF50", // Botão Verde para Criar
    paddingVertical: height * 0.02,
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
    fontSize: width * 0.045,
  },
});