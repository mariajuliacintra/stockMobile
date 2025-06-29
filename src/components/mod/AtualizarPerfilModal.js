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

const AtualizarPerfilModal = ({ visible, onClose, onConfirm, usuarioDados }) => {
  const [senhaDigitada, setSenhaDigitada] = useState("");
  const [mostrarSenhaDigitada, setMostrarSenhaDigitada] = useState(false);
  const [etapaConfirmacao, setEtapaConfirmacao] = useState(true);

  const [nomeEditado, setNomeEditado] = useState("");
  const [emailEditado, setEmailEditado] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarNovaSenha, setMostrarConfirmarNovaSenha] =
    useState(false);

  const [editandoSenha, setEditandoSenha] = useState(false);

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
      setEtapaConfirmacao(true);
      setNomeEditado(usuarioDados?.nome || "");
      setEmailEditado(usuarioDados?.email || "");
      setNovaSenha("");
      setConfirmarNovaSenha("");
      setMostrarNovaSenha(false);
      setMostrarConfirmarNovaSenha(false);
      setEditandoSenha(false);
    }
  }, [visible, usuarioDados]);

  const handleConfirmarSenhaAtual = async () => {
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
        setEtapaConfirmacao(false);
      } else {
        setModalInfo({
          type: "error",
          title: "Erro de Confirmação",
          message: "Senha atual incorreta. Por favor, tente novamente.",
        });
        setIsCustomModalVisible(true);
      }
    } catch (error) {
      console.log("Erro ao verificar senha:", error);
      setModalInfo({
        type: "error",
        title: "Erro",
        message: "Erro ao verificar a senha. Tente novamente mais tarde.",
      });
      setIsCustomModalVisible(true);
    }
  };

  const handleSalvarEdicao = () => {
    if (editandoSenha) {
      if (novaSenha.trim() === "") {
        setModalInfo({
          type: "error",
          title: "Erro de Senha",
          message: "Por favor, digite a nova senha ou cancele a edição.",
        });
        setIsCustomModalVisible(true);
        return;
      }
      if (novaSenha !== confirmarNovaSenha) {
        setModalInfo({
          type: "error",
          title: "Erro de Senha",
          message: "A nova senha e a confirmação de senha não coincidem.",
        });
        setIsCustomModalVisible(true);
        return;
      }
    }

    const houveAlteracao =
      nomeEditado !== usuarioDados?.nome ||
      emailEditado !== usuarioDados?.email ||
      (editandoSenha && novaSenha.trim() !== "");

    if (!houveAlteracao) {
      setModalInfo({
        type: "error",
        title: "Nenhuma Alteração",
        message: "Nenhuma alteração detectada para atualizar.",
      });
      setIsCustomModalVisible(true);
      return;
    }

    const dadosParaAtualizar = {
      nome: nomeEditado,
      email: emailEditado,
      ...(editandoSenha && { senha: novaSenha }),
    };

    onConfirm(dadosParaAtualizar, senhaDigitada);
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.lockIconContainer}>
              <MaterialIcons name="lock" size={width * 0.08} color="white" />
            </View>

            {etapaConfirmacao ? (
              <>
                <Text style={styles.title}>Confirme Senha Atual:</Text>
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
                      name={
                        mostrarSenhaDigitada ? "visibility-off" : "visibility"
                      }
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
                    onPress={handleConfirmarSenhaAtual}
                  >
                    <Text style={styles.buttonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.title}>Atualizar Perfil:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome"
                    value={nomeEditado}
                    onChangeText={setNomeEditado}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="E-mail"
                    value={emailEditado}
                    onChangeText={setEmailEditado}
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={editandoSenha ? "Nova Senha" : "Senha"}
                    value={editandoSenha ? novaSenha : "**********"}
                    secureTextEntry={!mostrarNovaSenha}
                    onChangeText={setNovaSenha}
                    editable={editandoSenha}
                    selectTextOnFocus={editandoSenha}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (editandoSenha) {
                        setMostrarNovaSenha((prev) => !prev);
                      } else {
                        setEditandoSenha(true);
                        setNovaSenha("");
                        setConfirmarNovaSenha("");
                      }
                    }}
                    style={styles.visibilityButton}
                  >
                    <MaterialIcons
                      name={
                        editandoSenha
                          ? mostrarNovaSenha
                            ? "visibility-off"
                            : "visibility"
                          : "edit"
                      }
                      size={width * 0.06}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>

                {editandoSenha && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirmar Nova Senha"
                      value={confirmarNovaSenha}
                      secureTextEntry={!mostrarConfirmarNovaSenha}
                      onChangeText={setConfirmarNovaSenha}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setMostrarConfirmarNovaSenha((prev) => !prev)
                      }
                      style={styles.visibilityButton}
                    >
                      <MaterialIcons
                        name={
                          mostrarConfirmarNovaSenha
                            ? "visibility-off"
                            : "visibility"
                        }
                        size={width * 0.06}
                        color="gray"
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {editandoSenha && (
                  <TouchableOpacity
                    onPress={() => {
                      setEditandoSenha(false);
                      setNovaSenha("");
                      setConfirmarNovaSenha("");
                      setMostrarNovaSenha(false);
                      setMostrarConfirmarNovaSenha(false);
                    }}
                    style={styles.cancelEditButton}
                  >
                    <Text style={styles.cancelEditText}>
                      Cancelar Edição de Senha
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setEtapaConfirmacao(true)}
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSalvarEdicao}
                  >
                    <Text style={styles.buttonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    paddingHorizontal: width * 0.05,
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
  cancelEditButton: {
    marginTop: -height * 0.01,
    marginBottom: height * 0.02,
    alignSelf: "flex-start",
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.005,
  },
  cancelEditText: {
    color: "rgb(155, 0, 0)",
    fontSize: width * 0.035,
    textDecorationLine: "underline",
  },
});

export default AtualizarPerfilModal;
