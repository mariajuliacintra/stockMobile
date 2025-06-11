import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

import ReservasUsuarioModal from "../components/ReservasUsuarioModal";
import AtualizarReservaModal from "../components/AtualizarReservaModal";
import HistoricoReservasModal from "../components/HistoricoReservasModal";
import ReservasDeletadas from "../components/ReservasDeletadasModal";
import CustomModal from "../components/CustomModal";
import ConfirmarSenhaModal from "../components/ConfirmarSenhaModal"; // Importe o modal
import ConfirmarDelecaoModal from "../components/ConfirmarDelecao";

import logo from "../img/logo.png";
import api from "../services/axios";

function Perfil() {
  const [reservas, setReservas] = useState([]);
  const [reservaSelecionada, setReservaSelecionada] = useState("");
  const [mostrarListaReservas, setMostrarListaReservas] = useState(false);
  const [mostrarEdiçãoReserva, setMostrarEdiçãoReserva] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [mostrarDeletadas, setMostrarDeletadas] = useState(false);
  const [reservasDeletadas, setReservasDeletadas] = useState("");
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [salasDisponiveis, setSalasDisponiveis] = useState([]);
  const [usuarioOriginal, setUsuarioOriginal] = useState("null");
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    NIF: "",
  });

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customModalTitle, setCustomModalTitle] = useState("");
  const [customModalMessage, setCustomModalMessage] = useState("");
  const [customModalType, setCustomModalType] = useState("info");

  const [showConfirmarSenhaModal, setShowConfirmarSenhaModal] = useState(false);
  const [showConfirmarDelecaoModal, setShowConfirmarDelecaoModal] =
    useState(false);

  useEffect(() => {
    const fetchDados = async () => {
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

        const responseReservas = await api.getUsuarioReservasById(idUsuario);

        function parseDataHora(dataStr, horaStr) {
          const [dia, mes, ano] = dataStr.split("-");
          const [hora, min, seg] = horaStr.split(":");
          return new Date(
            parseInt(ano),
            parseInt(mes) - 1,
            parseInt(dia),
            parseInt(hora),
            parseInt(min),
            parseInt(seg)
          );
        }

        const agora = new Date();
        const offsetHoras = -3;
        const agoraAjustado = new Date(
          agora.getTime() + offsetHoras * 60 * 60 * 1000
        );

        const reservasFuturas = (responseReservas.data.reservas || []).filter(
          (reserva) => {
            const dataHoraInicio = parseDataHora(
              reserva.data,
              reserva.hora_inicio
            );
            return dataHoraInicio >= agoraAjustado;
          }
        );
        setReservas(reservasFuturas);

        const responseSalas = await api.getSalas();
        setSalasDisponiveis(responseSalas.data.salas || []);
      } catch (error) {
        console.error("Erro ao buscar dados iniciais:", error);
      }
    };

    fetchDados();
  }, []);

  const handleReservaSelecionada = (reserva) => {
    setReservaSelecionada(reserva);
    setMostrarListaReservas(false);
  };

  const fecharModalEditar = () => {
    setMostrarEdiçãoReserva(false);
    setReservaSelecionada(null);
  };

  const handleAbrirHistorico = async () => {
    await handleCarregarHistorico();
    setMostrarHistorico(true);
  };

  const fecharModalHistorico = () => {
    setMostrarHistorico(false);
  };

  const handleAbrirDeletadas = async () => {
    await handleReservasDeletadas();
    setMostrarDeletadas(true);
  };

  const handleFecharDeletadas = async () => {
    setMostrarDeletadas(false);
  };

  const handleCarregarHistorico = async () => {
    try {
      const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
      if (!idUsuarioStr) return;

      const idUsuario = Number(idUsuarioStr);
      if (isNaN(idUsuario)) return;

      const responseHistorico = await api.getHistoricoReservasById(idUsuario);

      setHistoricoReservas(responseHistorico.data.historico || []);
    } catch (error) {
      console.error("Erro ao buscar histórico de reservas:", error);
    }
  };

  const handleReservasDeletadas = async () => {
    try {
      const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
      if (!idUsuarioStr) return;

      const idUsuario = Number(idUsuarioStr);
      if (isNaN(idUsuario)) return;

      const response = await api.getUsuarioHistoricoReservasDelecaobyId(
        idUsuario
      );
      setReservasDeletadas(response.data.historicoDelecao || []);
    } catch (error) {
      console.error("Erro ao buscar histórico de reservas deletadas:", error);
    }
  };

  const handleDeletarReserva = async (reserva) => {
    try {
      const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
      if (!idUsuarioStr) return;

      const idUsuario = Number(idUsuarioStr);

      if (isNaN(idUsuario)) {
        console.error("idUsuario não é um número válido");
        return;
      }
      if (!idUsuario) {
        setCustomModalTitle("Erro");
        setCustomModalMessage("Usuário não encontrado.");
        setCustomModalType("error");
        setCustomModalOpen(true);
        return;
      }

      await api.deleteReserva(reserva.id_reserva, idUsuario);

      setCustomModalTitle("Sucesso");
      setCustomModalMessage("Reserva apagada com sucesso!");
      setCustomModalType("success");
      setCustomModalOpen(true);

      const responseReservas = await api.getUsuarioReservasById(idUsuario);

      function parseDataHora(dataStr, horaStr) {
        const [dia, mes, ano] = dataStr.split("-");
        const [hora, min, seg] = horaStr.split(":");
        return new Date(
          parseInt(ano),
          parseInt(mes) - 1,
          parseInt(dia),
          parseInt(hora),
          parseInt(min),
          parseInt(seg)
        );
      }

      const agora = new Date();

      const reservasFuturasAtualizadas = (
        responseReservas.data.reservas || []
      ).filter((r) => {
        const dataHoraInicio = parseDataHora(r.data, r.hora_inicio);
        return dataHoraInicio >= agora;
      });

      setReservas(reservasFuturasAtualizadas);
    } catch (error) {
      console.error("Erro ao apagar reserva:", error);
      setCustomModalTitle("Erro");
      setCustomModalMessage("Erro ao apagar reserva.");
      setCustomModalType("error");
      setCustomModalOpen(true);
    }
  };

  const handleAbrirConfirmacaoEdicao = () => {
    setShowConfirmarSenhaModal(true);
  };

  const handleAtualizarUsuarioAposConfirmacao = async (dadosAtualizados, senhaDigitada) => {
    setShowConfirmarSenhaModal(false); // Fecha o modal de confirmação

    try {
      const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
      if (!idUsuarioStr) return;

      const idUsuario = Number(idUsuarioStr);
      if (isNaN(idUsuario)) {
        setCustomModalTitle("Erro");
        setCustomModalMessage("ID do usuário inválido.");
        setCustomModalType("error");
        setCustomModalOpen(true);
        return;
      }

      // IMPORTANTE: A validação da senha atual é feita no ConfirmarSenhaModal.
      // Aqui você apenas envia os dados para atualização.
      // Você pode adicionar a senhaDigitada aos dados atualizados para que a API possa fazer a validação final.
      const dadosParaAPI = { ...dadosAtualizados, senhaAtual: senhaDigitada };


      const response = await api.putAtualizarUsuario(idUsuario, dadosParaAPI);

      if (response.status === 200) {
        setCustomModalTitle("Sucesso");
        setCustomModalMessage("Perfil atualizado com sucesso!");
        setCustomModalType("success");
        setCustomModalOpen(true);

        // Atualiza o estado local do Perfil com os novos dados
        setUsuario((prev) => ({
          ...prev,
          nome: dadosAtualizados.nome,
          email: dadosAtualizados.email,
        }));

        // Atualiza o usuarioOriginal para futuras comparações e validações de senha
        setUsuarioOriginal((prev) => ({
          ...prev,
          nome: dadosAtualizados.nome,
          email: dadosAtualizados.email,
          senha: dadosAtualizados.senha || prev.senha, // Atualiza a senha original se uma nova foi fornecida
        }));
      } else {
        throw new Error("Erro na atualização");
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      setCustomModalTitle("Erro");
      setCustomModalMessage("Não foi possível atualizar o perfil.");
      setCustomModalType("error");
      setCustomModalOpen(true);
    }
  };

  const handleAbrirConfirmarDelecao = () => {
    setShowConfirmarDelecaoModal(true);
  };

  const handleDeletarConta = async () => { 
    setShowConfirmarDelecaoModal(false); // Fecha o modal de confirmação de deleção
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
      navigation.navigate("Login");
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require("../img/fundo.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Principal")}
            style={styles.buttonToPrincipal}
          >
            <MaterialIcons
              name="exit-to-app"
              style={styles.IconeLogout}
              size={35}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <View style={styles.form}>
            <Image source={logo} style={styles.logo} />
            <TextInput
              placeholder="nome"
              value={usuario.nome || ""}
              style={styles.textField}
              editable={false}
            />
            <TextInput
              placeholder="e-mail"
              value={usuario.email || ""}
              style={styles.textField}
              editable={false}
            />
            <TextInput
              placeholder="NIF"
              editable={false}
              value={usuario.NIF || ""}
              style={styles.nifTextField}
            />

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={styles.buttonAtualizar}
                onPress={handleAbrirConfirmacaoEdicao}
              >
                <Text style={styles.buttonText}>Atualizar Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonDeletar}
                onPress={handleAbrirConfirmarDelecao}
              >
                <Text style={styles.buttonText}>Deletar Perfil</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.buttonMinhasReservas}
              onPress={() => setMostrarListaReservas(true)}
            >
              <Text style={styles.buttonTextMinhasReservas}>
                Minhas Reservas
              </Text>
            </TouchableOpacity>

            <ReservasUsuarioModal
              visible={mostrarListaReservas}
              onClose={() => setMostrarListaReservas(false)}
              reservas={reservas}
              onSelecionar={(reserva) => {
                handleReservaSelecionada(reserva);
                setMostrarEdiçãoReserva(true);
              }}
              onApagarReserva={handleDeletarReserva}
              onHistorico={handleAbrirHistorico}
              onDeletadas={handleAbrirDeletadas}
            />

            {reservaSelecionada && (
              <AtualizarReservaModal
                visible={mostrarEdiçãoReserva}
                onClose={fecharModalEditar}
                reserva={reservaSelecionada}
              />
            )}

            <CustomModal
              open={customModalOpen}
              onClose={() => setCustomModalOpen(false)}
              title={customModalTitle}
              message={customModalMessage}
              type={customModalType}
            />

            <HistoricoReservasModal
              visible={mostrarHistorico}
              reservas={historicoReservas}
              salas={salasDisponiveis}
              onClose={fecharModalHistorico}
            />

            <ReservasDeletadas
              visible={mostrarDeletadas}
              reservas={reservasDeletadas}
              salas={salasDisponiveis}
              onClose={handleFecharDeletadas}
            />

            <ConfirmarSenhaModal
              visible={showConfirmarSenhaModal}
              onClose={() => setShowConfirmarSenhaModal(false)}
              usuarioDados={usuario}
              onConfirm={handleAtualizarUsuarioAposConfirmacao}
            />

            <ConfirmarDelecaoModal
              visible={showConfirmarDelecaoModal}
              onClose={() => setShowConfirmarDelecaoModal(false)}
              // Removido currentPassword daqui, pois a senha digitada será passada no onConfirm do modal
              onConfirm={handleDeletarConta}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            &copy; Desenvolvido por: Vinicius Fogaça, Maria Júlia e Maria
            Fernanda
          </Text>
        </View>
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    width: "100%",
    height: "8%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomWidth: 3,
    borderBottomColor: "white",
  },
  buttonToPrincipal: {
    marginRight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  IconeLogout: {
    color: "white",
  },
  logo: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    width: "100%",
    height: "13%",
    marginBottom: 25,
    marginTop: 45,
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 6,
  },
  body: {
    width: "100%",
    height: "84%",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(236, 236, 236, 0.72)",
    paddingVertical: "0%",
    paddingHorizontal: "8%",
    borderRadius: 10,
    width: "75%",
  },
  textField: {
    width: "100%",
    height: 55,
    backgroundColor: "rgb(242, 242, 242)", // Cor de fundo para indicar que não é editável
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    fontSize: 17,
    color: "gray",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  nifTextField: {
    width: "100%",
    height: 55,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "rgb(242, 242, 242)",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    fontSize: 17,
    color: "gray",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  passwordContainer: {
    width: "100%",
    height: 55,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    fontSize: 17,
    color: "gray",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  passwordInput: {
    width: "100%",
    height: 55,
    fontSize: 17,
    color: "gray",
  },
  visibilityButton: {
    padding: 10,
    position: "absolute",
    right: 10,
  },
  buttonMinhasReservas: {
    marginTop: 2,
    backgroundColor: "transparent",
    width: 180,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextMinhasReservas: {
    color: "rgb(155, 0, 0)",
    fontWeight: "600",
    fontSize: 17,
  },
  buttonAtualizar: {
    marginTop: 16,
    backgroundColor: "rgba(255, 0, 0, 1)",
    width: 180,
    backgroundColor: "rgb(199, 0, 0)",
    width: "50%",
    height: 45,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonDeletar: {
    marginTop: 16,
    marginLeft: 10,
    backgroundColor: "rgba(255, 0, 0, 1)",
    width: 180,
    backgroundColor: "rgb(199, 0, 0)",
    width: "50%",
    height: 45,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    padding: 2,
    marginTop: 8,
    fontWeight: "610",
    fontSize: 15,
  },
  footer: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    width: "100%",
    height: "8%",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 3,
    borderTopColor: "white",
  },
  footerText: {
    color: "white",
    fontSize: 13,
  },
});

export default Perfil;