import React, { useState, useEffect, useCallback } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getToday } from "../../utils/dateUtils";
import api from "../../services/axios";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import CustomModal from "./CustomModal";

const AtualizarReservaModal = ({ visible, onClose, reserva }) => {
  if (!reserva) {
    console.error("Reserva inválida:", reserva);
    return;
  }
  // Estados para data e hora
  const [data, setData] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());

  // Estados para controlar a visibilidade dos pickers
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarStartTimePicker, setMostrarStartTimePicker] = useState(false);
  const [mostrarEndTimePicker, setMostrarEndTimePicker] = useState(false);

  // Estado para o ID do usuário
  const [idUsuario, setIdUsuario] = useState("");

  // Estados para o modal de feedback
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "",
    message: "",
  });

  // Hook de navegação
  const navigation = useNavigation();

  // Efeito para buscar o ID do usuário ao montar o componente
  useEffect(() => {
    const buscarIdUsuario = async () => {
      try {
        const idUsuarioString = await SecureStore.getItemAsync("idUsuario");
        if (idUsuarioString) {
          const idUsuario = Number(idUsuarioString);
          const response = await api.getUsuarioById(idUsuario);
          setIdUsuario(response.data.usuario.id_usuario);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };
    buscarIdUsuario();

    if (visible && reserva) {
      // Data: de "31-12-2025" para Date(2025, 11, 31)
      if (reserva.data) {
        const [dia, mes, ano] = reserva.data.split("-");
        const novaData = new Date(ano, mes - 1, dia);
        setData(novaData);
      }

      // Hora de início
      if (reserva.hora_inicio) {
        const [h, m] = reserva.hora_inicio.split(":");
        const novaHoraInicio = new Date();
        novaHoraInicio.setHours(parseInt(h), parseInt(m), 0, 0);
        setHoraInicio(new Date(novaHoraInicio)); // Garante nova instância
      }

      // Hora de fim
      if (reserva.hora_fim) {
        const [h, m] = reserva.hora_fim.split(":");
        const novaHoraFim = new Date();
        novaHoraFim.setHours(parseInt(h), parseInt(m), 0, 0);
        setHoraFim(new Date(novaHoraFim)); // Garante nova instância
      }
    }
  }, [reserva, visible]); // Executa apenas uma vez na montagem

  const formatarData = (data) => {
    if (!(data instanceof Date)) return "";
    return data.toLocaleDateString("pt-BR");
  };

  // Função para ajustar a hora de fim automaticamente (1 hora após o início)
  const ajustarHoraFim = useCallback(() => {
    setHoraFim(new Date(horaInicio.getTime() + 60 * 60 * 1000));
  }, [horaInicio]); // Depende de horaInicio para recriar se horaInicio mudar

  // Função para formatar a hora com segundos zerados
  const formatarHoraComSegundosZero = useCallback((date) => {
    if (!(date instanceof Date)) {
      return "";
    }
    const horas = date.getHours().toString().padStart(2, "0");
    const minutos = date.getMinutes().toString().padStart(2, "0");
    return `${horas}:${minutos}:00`;
  }, []); // Não tem dependências, pode ser criada uma vez

  // Função assíncrona para lidar com a reserva
  const handleReserva = useCallback(async () => {
    if (horaFim <= horaInicio) {
      ajustarHoraFim();
    }

    const formattedData = data.toISOString().split("T")[0];
    const formattedHoraInicio = formatarHoraComSegundosZero(horaInicio);
    const formattedHoraFim = formatarHoraComSegundosZero(horaFim);

    const dadosReserva = {
      data: formattedData,
      hora_inicio: formattedHoraInicio,
      hora_fim: formattedHoraFim,
      fk_id_usuario: idUsuario,
    };

    try {
      const response = await api.putAtualizarReserva(
        reserva.id_reserva,
        dadosReserva
      );
      setModalInfo({
        type: "success",
        title: "Sucesso",
        message: response.data.message,
      });
      setModalVisible(true);
    } catch (error) {
      setModalInfo({
        type: "error",
        title: "Erro",
        message: error.response?.data?.error || "Erro desconhecido",
      });
      setModalVisible(true);
      console.log(error);
    }
  }, [
    ajustarHoraFim,
    data,
    formatarHoraComSegundosZero,
    horaFim,
    horaInicio,
    idUsuario,
    visible,
    reserva,
  ]); // Depende de todos os valores usados dentro

  // Função para lidar com o fechamento do modal de feedback
  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    if (modalInfo.type === "success") {
      onClose();
    }
  }, [modalInfo.type, navigation, onClose]); // Depende de valores externos

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Atualizar Reserva</Text>

            <Text style={styles.inputTitle}>Data</Text>
            <TouchableOpacity
              onPress={() => setMostrarDatePicker(true)}
              style={styles.inputFake}
            >
              <Text>{formatarData(data)}</Text>
            </TouchableOpacity>
            {mostrarDatePicker && (
              <DateTimePicker
                mode="date"
                value={data}
                minimumDate={getToday()}
                onChange={(e, selected) => {
                  if (selected) setData(selected);
                  setMostrarDatePicker(false);
                }}
              />
            )}

            <Text style={styles.inputTitle}>Hora de Início</Text>
            <TouchableOpacity
              onPress={() => setMostrarStartTimePicker(true)}
              style={styles.inputFake}
            >
              <Text>{formatarHoraComSegundosZero(horaInicio)}</Text>
            </TouchableOpacity>
            {mostrarStartTimePicker && (
              <DateTimePicker
                mode="time"
                display="spinner"
                is24Hour={true}
                ampm={false}
                value={horaInicio}
                onChange={(e, selected) => {
                  if (selected) {
                    const newHoraInicio = new Date(selected);
                    newHoraInicio.setSeconds(0);
                    setHoraInicio(newHoraInicio);
                    ajustarHoraFim();
                  }
                  setMostrarStartTimePicker(false);
                }}
              />
            )}

            <Text style={styles.inputTitle}>Hora de Fim</Text>
            <TouchableOpacity
              onPress={() => setMostrarEndTimePicker(true)}
              style={styles.inputFake}
            >
              <Text>{formatarHoraComSegundosZero(horaFim)}</Text>
            </TouchableOpacity>
            {mostrarEndTimePicker && (
              <DateTimePicker
                mode="time"
                display="spinner"
                is24Hour={true}
                ampm={false}
                value={horaFim}
                minimumDate={new Date(horaInicio.getTime() + 60 * 60 * 1000)}
                onChange={(e, selected) => {
                  if (selected) {
                    const newHoraFim = new Date(selected);
                    newHoraFim.setSeconds(0);
                    setHoraFim(newHoraFim);
                  }
                  setMostrarEndTimePicker(false);
                }}
              />
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleReserva}>
                <Text style={styles.buttonText}>Atualizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomModal
        open={modalVisible}
        onClose={handleModalClose}
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
    width: "60%",
    maxHeight: "70%",
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: "bold",
  },
  inputTitle: {
    fontSize: 12.5,
    marginBottom: 5,
    fontWeight: "bold",
  },
  inputFake: {
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AtualizarReservaModal;
