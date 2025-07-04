import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

import ReservasUsuarioModal from "../mod/ReservasUsuarioModal";
import ReservasHistoricoModal from "../mod/ReservasHistoricoModal";
import ReservasDeletadas from "../mod/ReservasDeletadasModal";
import CustomModal from "../mod/CustomModal";
import AtualizarUsuarioModal from "../mod/AtualizarUsuarioModal";
import ConfirmarDelecaoModal from "../mod/ConfirmarDelecaoModal";

import api from "../../services/axios";

const { width, height } = Dimensions.get("window");

function PerfilModal({ visible, onClose }) {
  const [usuarioOriginal, setUsuarioOriginal] = useState(null);
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    NIF: "",
  });

  const [mostrarListaReservas, setMostrarListaReservas] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [mostrarDeletadas, setMostrarDeletadas] = useState(false);

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customModalTitle, setCustomModalTitle] = useState("");
  const [customModalMessage, setCustomModalMessage] = useState("");
  const [customModalType, setCustomModalType] = useState("info");

  const [showConfirmarSenhaModal, setShowConfirmarSenhaModal] = useState(false);
  const [showConfirmarDelecaoModal, setShowConfirmarDelecaoModal] = useState(false);

  const fetchDadosUsuario = useCallback(async () => {
    if (!visible) return; // Só busca se o modal estiver visível
    try {
      const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
      if (!idUsuarioStr) return;

      const idUsuario = Number(idUsuarioStr);
      if (isNaN(idUsuario)) {
        console.error("ID do usuário não é um número válido");
        return;
      }
      const responseUsuario = await api.getUsuarioById(idUsuario);

      setUsuarioOriginal(responseUsuario.data.usuario);
      setUsuario({
        nome: responseUsuario.data.usuario.nome,
        email: responseUsuario.data.usuario.email,
        NIF: responseUsuario.data.usuario.NIF,
      });
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      setCustomModalTitle("Erro");
      setCustomModalMessage(error.response?.data?.error || "Erro ao carregar dados do perfil.");
      setCustomModalType("error");
      setCustomModalOpen(true);
    }
  }, [visible]);

  useEffect(() => {
    fetchDadosUsuario();
  }, [fetchDadosUsuario]);

  const handleAbrirConfirmacaoEdicao = () => {
    setShowConfirmarSenhaModal(true);
  };

  const handleAtualizarUsuarioAposConfirmacao = async (dadosAtualizados, senhaDigitada) => {
    setShowConfirmarSenhaModal(false);

    try {
      const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
      if (!idUsuarioStr) throw new Error("ID do usuário não encontrado.");

      const idUsuario = Number(idUsuarioStr);
      if (isNaN(idUsuario)) {
        setCustomModalTitle("Erro");
        setCustomModalMessage("ID do usuário inválido.");
        setCustomModalType("error");
        setCustomModalOpen(true);
        return;
      }

      const dadosParaAPI = { ...dadosAtualizados, senhaAtual: senhaDigitada };

      const response = await api.putAtualizarUsuario(idUsuario, dadosParaAPI);

      if (response.status === 200) {
        setCustomModalTitle("Sucesso");
        setCustomModalMessage("Perfil atualizado com sucesso!");
        setCustomModalType("success");
        setCustomModalOpen(true);

        setUsuario((prev) => ({
          ...prev,
          nome: dadosAtualizados.nome,
          email: dadosAtualizados.email,
        }));

        setUsuarioOriginal((prev) => ({
          ...prev,
          nome: dadosAtualizados.nome,
          email: dadosAtualizados.email,
          senha: dadosAtualizados.senha || prev.senha,
        }));
      } else {
        throw new Error("Erro na atualização");
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      setCustomModalTitle("Erro");
      setCustomModalMessage(error.response?.data?.error || "Não foi possível atualizar o perfil.");
      setCustomModalType("error");
      setCustomModalOpen(true);
    }
  };

  const handleAbrirConfirmarDelecao = () => {
    setShowConfirmarDelecaoModal(true);
  };

  const handleDeletarConta = async () => {
    setShowConfirmarDelecaoModal(false);
    try {
      const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
      if (!idUsuarioStr) {
        setCustomModalTitle("Erro");
        setCustomModalMessage("ID do usuário não encontrado.");
        setCustomModalType("error");
        setCustomModalOpen(true);
        return;
      }
      const idUsuario = Number(idUsuarioStr);

      const deleteResponse = await api.deleteUsuario(idUsuario);
      setCustomModalTitle("Sucesso");
      setCustomModalMessage(
        deleteResponse.data.message || "Sua conta foi deletada com sucesso."
      );
      setCustomModalType("success");
      setCustomModalOpen(true);
      navigation.navigate("Home");
    } catch (deleteError) {
      console.error("Erro ao deletar conta:", deleteError);
      const deleteErrorMessage =
        deleteError.response?.data?.error || "Erro ao deletar sua conta.";
      setCustomModalTitle("Erro");
      setCustomModalMessage(deleteErrorMessage);
      setCustomModalType("error");
      setCustomModalOpen(true);
    }
  };

  const dynamicStyles = StyleSheet.create({
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
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 10,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      padding: 5,
      zIndex: 1,
    },
    headerIcon: {
      marginBottom: height * 0.02,
      color: 'white',
      backgroundColor: 'rgb(177, 16, 16)',
      padding: width * 0.03,
      borderRadius: (width * 0.11 + width * 0.03 * 2) / 2,
    },
    title: {
      fontSize: width * 0.06,
      fontWeight: "bold",
      color: '#333',
      marginBottom: height * 0.02,
      textAlign: 'center',
    },
    inputFake: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: "#ddd",
      backgroundColor: "#f5f5f5",
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.03,
      borderRadius: 8,
      width: '100%',
      justifyContent: 'flex-start',
      marginBottom: height * 0.025,
    },
    inputFakeText: {
      fontSize: width * 0.04,
      color: '#333',
      flex: 1,
    },
    iconStyle: {
      marginRight: width * 0.02,
    },
    confirmButton: {
      backgroundColor: "rgb(177, 16, 16)",
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.06,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80%',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 6,
      marginTop: height * 0.01,
    },
    confirmButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: width * 0.04,
      marginLeft: width * 0.02,
    },
    buttonGroup: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: height * 0.025,
      marginTop: height * 0.01,
    },
    smallButton: {
      backgroundColor: "rgb(177, 16, 16)",
      paddingVertical: height * 0.012,
      paddingHorizontal: width * 0.04,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginHorizontal: width * 0.01,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    smallButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: width * 0.035,
    },
    linkButton: {
        marginTop: height * 0.02,
        marginBottom: height * 0.01,
    },
    linkButtonText: {
        color: "rgb(152, 0, 0)",
        fontWeight: "600",
        fontSize: width * 0.04,
        textDecorationLine: 'underline',
    }
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={dynamicStyles.overlay}>
        <View style={dynamicStyles.modal}>
          <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle-outline" size={width * 0.07} color="#999" />
          </TouchableOpacity>

          <Ionicons name="person-circle-outline" size={width * 0.11} style={dynamicStyles.headerIcon} />
          <Text style={dynamicStyles.title}>Meu Perfil</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{width: '100%', alignItems: 'center'}}>
            <View style={dynamicStyles.inputFake}>
              <Ionicons name="person-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputFakeText}>
                {usuario.nome || ""}
              </Text>
            </View>

            <View style={dynamicStyles.inputFake}>
              <Ionicons name="mail-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputFakeText}>
                {usuario.email || ""}
              </Text>
            </View>

            <View style={dynamicStyles.inputFake}>
              <Ionicons name="document-text-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputFakeText}>
                {usuario.NIF || ""}
              </Text>
            </View>

            <View style={dynamicStyles.buttonGroup}>
              <TouchableOpacity
                style={dynamicStyles.smallButton}
                onPress={handleAbrirConfirmacaoEdicao}
              >
                <Text style={dynamicStyles.smallButtonText}>Atualizar Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={dynamicStyles.smallButton}
                onPress={handleAbrirConfirmarDelecao}
              >
                <Text style={dynamicStyles.smallButtonText}>Deletar Perfil</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={dynamicStyles.linkButton}
              onPress={() => setMostrarListaReservas(true)}
            >
              <Text style={dynamicStyles.linkButtonText}>
                Minhas Reservas
              </Text>
            </TouchableOpacity>

            <ReservasUsuarioModal
              visible={mostrarListaReservas}
              onClose={() => setMostrarListaReservas(false)}
              onHistorico={() => setMostrarHistorico(true)}
              onDeletadas={() => setMostrarDeletadas(true)}
            />

            <CustomModal
              open={customModalOpen}
              onClose={() => setCustomModalOpen(false)}
              title={customModalTitle}
              message={customModalMessage}
              type={customModalType}
            />

            <ReservasHistoricoModal
              visible={mostrarHistorico}
              onClose={() => setMostrarHistorico(false)}
            />

            <ReservasDeletadas
              visible={mostrarDeletadas}
              onClose={() => setMostrarDeletadas(false)}
            />

            <AtualizarUsuarioModal
              visible={showConfirmarSenhaModal}
              onClose={() => setShowConfirmarSenhaModal(false)}
              usuarioDados={usuario}
              onConfirm={handleAtualizarUsuarioAposConfirmacao}
            />

            <ConfirmarDelecaoModal
              visible={showConfirmarDelecaoModal}
              onClose={() => setShowConfirmarDelecaoModal(false)}
              onConfirm={handleDeletarConta}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default PerfilModal;
