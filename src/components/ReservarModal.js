import React, { useState, useEffect, useCallback } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getToday } from "../utils/dateUtils";
import api from "../services/axios";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import CustomModal from "./CustomModal";

const ReservarModal = ({ isOpen, onClose, idSala }) => {
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
        const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
        if (idUsuarioStr) {
          const idUsuario = Number(idUsuarioStr);
          const response = await api.getUsuarioById(idUsuario);
          setIdUsuario(response.data.usuario.id_usuario);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };

    buscarIdUsuario();
  }, []); // Executa apenas uma vez na montagem

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

    const reserva = {
      data: formattedData,
      hora_inicio: formattedHoraInicio,
      hora_fim: formattedHoraFim,
      fk_id_usuario: idUsuario,
      fk_id_sala: idSala,
    };

    // console.log("Objeto reserva:", reserva);

    try {
      const response = await api.postReserva(reserva);
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
    idSala,
    idUsuario,
  ]); // Depende de todos os valores usados dentro

  // Função para lidar com o fechamento do modal de feedback
  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    if (modalInfo.type === "success") {
      navigation.navigate("Principal");
      onClose();
    }
  }, [modalInfo.type, navigation, onClose]); // Depende de valores externos

  return (
    <>
      <Modal visible={isOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Reservar</Text>

            <Text style={styles.inputTitle}>Data</Text>
            <TouchableOpacity
              onPress={() => setMostrarDatePicker(true)}
              style={styles.inputFake}
            >
              <Text>{data.toLocaleDateString()}</Text>
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
                <Text style={styles.buttonText}>Reservar</Text>
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
  modal: {
    backgroundColor: "rgb(227, 227, 227)",
    padding: 20,
    borderRadius: 8,
    width: 300,
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

export default ReservarModal;
