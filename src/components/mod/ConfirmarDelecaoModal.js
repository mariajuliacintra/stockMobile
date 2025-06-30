import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import CustomModal from "./CustomModal";
import * as SecureStore from "expo-secure-store";
import api from "../../services/axios";

const { width, height } = Dimensions.get("window");

const ConfirmarDelecaoModal = ({ visible, onClose, onConfirm }) => {
  const [senhaDigitada, setSenhaDigitada] = useState("");
  const [mostrarSenhaDigitada, setMostrarSenhaDigitada] = useState(false);
  const [modalConfirmarExclusao, setModalConfirmarExclusao] = useState(false);

  const [modalInfo, setModalInfo] = useState({
    type: "info",
    title: "",
    message: "",
  });
  const [isCustomModalVisible, setIsCustomModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setSenhaDigitada("");
      setMostrarSenhaDigitada(false);
    }
  }, [visible]);

  const handleConfirmarSenha = async () => {
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

      const response = await api.verificarSenhaUsuario(idUsuario, {
        senha: senhaDigitada,
      });

      if (response.data.valido) {
        setModalConfirmarExclusao(true);
      } else {
        setModalInfo({
          type: "error",
          title: "Erro de Confirmação",
          message: "Senha atual incorreta. Por favor, tente novamente.",
        });
        setIsCustomModalVisible(true);
      }
    } catch (error) {
      setModalInfo({
        type: "error",
        title: "Erro",
        message:
          "Erro ao verificar a senha. Tente novamente mais tarde. " +
          (error.response?.data?.error || ""),
      });
      setIsCustomModalVisible(true);
    }
  };

  const handleDeletarUsuario = () => {
    setModalConfirmarExclusao(false);
    onClose();
    onConfirm(senhaDigitada);
    setModalConfirmarExclusao(false);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.lockIconContainer}>
              <MaterialIcons name="lock" size={width * 0.08} color="white" />
            </View>
            <Text style={styles.title}>Confirmar Senha Atual</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Senha Atual"
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
                  size={width * 0.06}
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
              <TouchableOpacity
                style={styles.button}
                onPress={handleConfirmarSenha}
              >
                <Text style={styles.buttonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalConfirmarExclusao} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.lockIconContainer}>
              <MaterialIcons name="lock" size={width * 0.08} color="white" />
            </View>
            <Text style={styles.title}>Confirmação de Deleção</Text>
            <Text style={styles.SubTitle}>
              Tem certeza que deseja deletar sua conta? Essa ação é irreversível
              e removerá suas reservas.
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalConfirmarExclusao(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={handleDeletarUsuario}
              >
                <Text style={styles.buttonText}>Excluir</Text>
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
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.12,
    paddingBottom: height * 0.04,
    width: "75%",
    maxWidth: 400,
    borderRadius: 10,
    alignItems: "center",
    marginTop: height * 0.05,
    position: "relative",
  },
  lockIconContainer: {
    position: "absolute",
    top: (width * 0.04),
    alignSelf: "center",
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: (width * 0.15) / 2,
    backgroundColor: "#8B0000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    elevation: 5,
  },
  title: {
    fontSize: width * 0.05,
    marginBottom: height * 0.025,
    fontWeight: "bold",
    textAlign: "center",
  },
  SubTitle: {
    fontSize: width * 0.04,
    marginBottom: height * 0.025,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: width * 0.03,
    marginBottom: height * 0.02,
    width: "100%",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    height: height * 0.06,
    fontSize: width * 0.04,
    color: "gray",
  },
  visibilityButton: {
    padding: width * 0.015,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: height * 0.015,
  },
  button: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: width * 0.04,
  },
});

export default ConfirmarDelecaoModal;
