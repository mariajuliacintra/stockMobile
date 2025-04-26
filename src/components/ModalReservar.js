import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getToday } from "../utils/dateUtils";
import api from "../services/axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ModalReservar = ({ isOpen, onClose, idSala }) => {
  const [data, setData] = useState(new Date());
  const [hora_inicio, setHoraInicio] = useState(new Date());
  const [hora_fim, setHoraFim] = useState(new Date());

  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarStartTimePicker, setMostrarStartTimePicker] = useState(false);
  const [mostrarEndTimePicker, setMostrarEndTimePicker] = useState(false);

  const [idUsuario, setIdUsuario] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const email = await AsyncStorage.getItem("email");
        if (!email) return;

        const response = await api.getUsuarioByEmail(email);
        setIdUsuario(response.data.usuario.id_usuario);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };

    fetchUsuario();
  }, []);

  function ajustarHoraFim() {
    const horaFimAjustada = new Date(hora_inicio.getTime() + 50 * 60 * 1000);
    setHoraFim(horaFimAjustada);
  }

  function formatarHoraComSegundosZero(date) {
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return formattedTime + ":00";
  }

  async function handleReserva() {
    if (hora_fim <= hora_inicio) {
      ajustarHoraFim();
    }

    const formattedData = data.toISOString().split("T")[0]; // <-- aqui foi a mudança
    const formattedHoraInicio = formatarHoraComSegundosZero(hora_inicio);
    const formattedHoraFim = formatarHoraComSegundosZero(hora_fim);

    const reserva = {
      data: formattedData,
      hora_inicio: formattedHoraInicio,
      hora_fim: formattedHoraFim,
      fk_id_usuario: idUsuario,
      fk_id_sala: idSala,
    };

    try {
      const response = await api.postReserva(reserva);
      Alert.alert("Sucesso", response.data.message);
      navigation.navigate("Principal");
      onClose();
    } catch (error) {
      Alert.alert("Erro", error.response?.data?.error || "Erro desconhecido");
      console.log(error);
    }
  }

  return (
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
            <Text>{formatarHoraComSegundosZero(hora_inicio)}</Text>
          </TouchableOpacity>
          {mostrarStartTimePicker && (
            <DateTimePicker
              mode="time"
              value={hora_inicio}
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
            <Text>{formatarHoraComSegundosZero(hora_fim)}</Text>
          </TouchableOpacity>
          {mostrarEndTimePicker && (
            <DateTimePicker
              mode="time"
              value={hora_fim}
              minimumDate={new Date(hora_inicio.getTime() + 50 * 60 * 1000)}
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
    borderWidth: 1,
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

export default ModalReservar;