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

const ConfirmarSenhaModal = ({
  visible,
  onClose,
  onConfirm, // Esta função agora receberá os dados atualizados E a senha digitada para a validação no pai (se você mantiver a validação no pai)
  usuarioDados,
}) => {
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

      // Verificação da senha atual com a API
      const response = await api.verificarSenhaUsuario(idUsuario, {
        senha: senhaDigitada,
      });

      if (response.data.valido) {
        setEtapaConfirmacao(false); // Avança para a etapa de edição
      } else {
        setModalInfo({
          type: "error",
          title: "Erro de Confirmação",
          message: "Senha atual incorreta. Por favor, tente novamente.",
        });
        setIsCustomModalVisible(true);
      }
    } catch (error) {
      console.error("Erro ao verificar senha:", error);
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
      (editandoSenha && novaSenha.trim() !== ""); // Considera alteração se a nova senha foi digitada

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
      // Se estiver editando a senha, enviamos a nova senha, caso contrário, não enviamos a senha para o backend
      // para evitar re-hashear senhas já hasheadas sem necessidade.
      ...(editandoSenha && { senha: novaSenha }),
    };

    // Chama a função onConfirm do componente pai com os dados atualizados
    // A senha atual (senhaDigitada) é necessária para a API no back-end para validação final.
    onConfirm(dadosParaAtualizar, senhaDigitada); 
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {etapaConfirmacao ? (
              // Etapa 1: Confirmar Senha Atual
              <>
                <Text style={styles.title}>Confirme sua senha atual:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Sua senha atual"
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
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleConfirmarSenhaAtual}
                  >
                    <Text style={styles.buttonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Etapa 2: Editar Dados do Perfil
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

                {/* Campo de Senha */}
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
                      name={editandoSenha ? (mostrarNovaSenha ? "visibility-off" : "visibility") : "edit"}
                      size={24}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>

                {/* Campo de Confirmar Nova Senha - Só aparece se 'editandoSenha' for true */}
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
                        size={24}
                        color="gray"
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {/* Botão para cancelar edição da senha, se estiver ativa */}
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
                    <Text style={styles.buttonText}>Voltar</Text>
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
  cancelEditButton: {
    marginTop: -10,
    marginBottom: 15,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cancelEditText: {
    color: "rgb(155, 0, 0)",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default ConfirmarSenhaModal;