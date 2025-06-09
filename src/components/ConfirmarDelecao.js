import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import CustomModal from "./CustomModal";
import * as SecureStore from "expo-secure-store";
import api from "../services/axios";

const ConfirmarDelecaoModal = ({
  visible,
  onClose,
  onConfirm, // Esta função será chamada com a senhaDigitada
  // A prop currentPassword foi removida daqui, pois não é utilizada
}) => {
  const [senhaDigitada, setSenhaDigitada] = useState("");
  const [mostrarSenhaDigitada, setMostrarSenhaDigitada] = useState(false);
  // Removi o estado `EtapaConfirmacao` pois ele não é necessário para este modal de uma etapa.
  const [modalInfo, setModalInfo] = useState({
    type: "info",
    title: "",
    message: "",
  });
  const [isCustomModalVisible, setIsCustomModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setSenhaDigitada(""); // Limpa a senha digitada ao abrir o modal
      setMostrarSenhaDigitada(false);
    }
  }, [visible]);

  const handleConfirmar = async () => {
    try {
      const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
      const idUsuario = Number(idUsuarioStr);

      if (isNaN(idUsuario)) {
        setModalInfo({
          type: "error",
          title: "Erro",
          message: "ID do usuário inválido.",
        });
        setIsCustomModalVisible(true);
        return;
      }

      // 1. Verificar a senha atual com a API
      const response = await api.verificarSenhaUsuario(idUsuario, {
        senha: senhaDigitada,
      });

      if (response.data.valido) {
        // Se a senha estiver correta, chame a função onConfirm do componente pai
        // passando a senha digitada.
        onConfirm(senhaDigitada);
        onClose(); // Fecha o modal após a confirmação bem-sucedida
      } else {
        setModalInfo({
          type: "error",
          title: "Erro de Confirmação",
          message: "Senha atual incorreta. Por favor, tente novamente.",
        });
        setIsCustomModalVisible(true);
      }
    } catch (error) {
      console.error("Erro ao verificar senha para deleção:", error); // Log mais específico
      setModalInfo({
        type: "error",
        title: "Erro",
        message:
          "Erro ao verificar a senha. Tente novamente mais tarde. " +
          (error.response?.data?.error || ""), // Adiciona mensagem de erro do backend se disponível
      });
      setIsCustomModalVisible(true);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>
              Para confirmar a exclusão do seu perfil, digite sua senha:
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Sua senha"
                value={senhaDigitada}
                secureTextEntry={!mostrarSenhaDigitada}
                onChangeText={setSenhaDigitada}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenhaDigitada((prev) => !prev)}
                style={styles.visibilityButton}
              >
                <MaterialIcons
                  name={mostrarSenhaDigitada ? "visibility-off" : "visibility"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomModal
        open={isCustomModalVisible}
        onClose={() => setIsCustomModalVisible(false)}
        title={modalInfo.title}
        message={modalInfo.message}
        type={modalInfo.type}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    width: "85%",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "gray",
  },
  visibilityButton: {
    padding: 5,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  button: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ConfirmarDelecaoModal;