import React, { useState, useEffect, useCallback } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getToday } from "../../utils/dateUtils";
import api from "../../services/axios";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import CustomModal from "./CustomModal";
import DiasModal from "./DiasModal";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const ReservarModal = ({ isOpen, onClose, idSala }) => {
  const [currentMode, setCurrentMode] = useState('simples');

  const [dataSimples, setDataSimples] = useState(new Date());

  const [dataInicioPeriodica, setDataInicioPeriodica] = useState(new Date());
  const [dataFimPeriodica, setDataFimPeriodica] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState([]);
  const [validDays, setValidDays] = useState([]);
  const [showDaySelectionModal, setShowDaySelectionModal] = useState(false);

  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));

  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarDataInicioPickerPeriodica, setMostrarDataInicioPickerPeriodica] = useState(false);
  const [mostrarDataFimPickerPeriodica, setMostrarDataFimPickerPeriodica] = useState(false);
  const [mostrarStartTimePicker, setMostrarStartTimePicker] = useState(false);
  const [mostrarEndTimePicker, setMostrarEndTimePicker] = useState(false);

  const diasSemanaMap = {
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado",
  };
  const diasSemanaKeys = Object.keys(diasSemanaMap).map(Number);

  const [idUsuario, setIdUsuario] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    type: "success",
    title: "",
    message: "",
  });

  const navigation = useNavigation();

  const getDaysInRange = useCallback((startDate, endDate) => {
    const days = new Set();
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (diasSemanaKeys.includes(dayOfWeek)) {
        days.add(dayOfWeek);
      }
      current.setDate(current.getDate() + 1);
    }
    return Array.from(days).sort((a, b) => a - b);
  }, [diasSemanaKeys]);

  useEffect(() => {
    if (currentMode === 'periodica') {
      const newCalculatedValidDays = getDaysInRange(dataInicioPeriodica, dataFimPeriodica);

      const areValidDaysEqual = validDays.length === newCalculatedValidDays.length &&
                                validDays.every((val, index) => val === newCalculatedValidDays[index]);

      if (!areValidDaysEqual) {
        setValidDays(newCalculatedValidDays);

        setSelectedDays((prevSelectedDays) => {
          const filteredDays = prevSelectedDays.filter((day) => newCalculatedValidDays.includes(day));
          const areSelectedDaysEqual = filteredDays.length === prevSelectedDays.length &&
                                       filteredDays.every((val, index) => val === prevSelectedDays[index]);
          if (!areSelectedDaysEqual) {
            return filteredDays;
          }
          return prevSelectedDays;
        });
      }
    }
  }, [dataInicioPeriodica, dataFimPeriodica, currentMode, getDaysInRange, validDays]);

  useEffect(() => {
    const buscarIdUsuario = async () => {
      try {
        const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
        if (idUsuarioStr) {
          const id = Number(idUsuarioStr);
          const response = await api.getUsuarioById(id);
          setIdUsuario(response.data.usuario.id_usuario);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };
    buscarIdUsuario();
  }, []);

  const formatarDataExibicao = useCallback((date) => {
    if (!(date instanceof Date)) return "";
    const dia = date.getDate().toString().padStart(2, "0");
    const mes = (date.getMonth() + 1).toString().padStart(2, "0");
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }, []);

  const formatarHoraExibicao = useCallback((date) => {
    if (!(date instanceof Date)) {
      return "";
    }
    const horas = date.getHours().toString().padStart(2, "0");
    const minutos = date.getMinutes().toString().padStart(2, "0");
    return `${horas}:${minutos}`;
  }, []);

  const ajustarHoraFim = useCallback((newHoraInicio) => {
    const adjustedTime = new Date(newHoraInicio.getTime() + 60 * 60 * 1000);
    setHoraFim(adjustedTime);
  }, []);

  const formatarHoraComSegundosZero = useCallback((date) => {
    if (!(date instanceof Date)) {
      return "";
    }
    const horas = date.getHours().toString().padStart(2, "0");
    const minutos = date.getMinutes().toString().padStart(2, "0");
    return `${horas}:${minutos}:00`;
  }, []);

  const toggleDay = useCallback((dayNum) => {
    setSelectedDays((prevSelectedDays) => {
      if (prevSelectedDays.includes(dayNum)) {
        return prevSelectedDays.filter((day) => day !== dayNum);
      } else {
        return [...prevSelectedDays, dayNum];
      }
    });
  }, []);

  const getSelectedDaysText = useCallback(() => {
    if (selectedDays.length === 0) {
      return "Selecione os dias";
    }
    return selectedDays.map(dayNum => diasSemanaMap[dayNum]).join(", ");
  }, [selectedDays, diasSemanaMap]);

  const handleReserva = useCallback(async () => {
    if (horaFim.getTime() <= horaInicio.getTime()) {
      setModalInfo({
        type: "error",
        title: "Erro de Hora",
        message: "A Hora de Fim deve ser posterior à Hora de Início.",
      });
      setModalVisible(true);
      return;
    }

    let reservaPayload;
    if (currentMode === 'simples') {
      const formattedData = dataSimples.toISOString().split("T")[0];
      const formattedHoraInicio = formatarHoraComSegundosZero(horaInicio);
      const formattedHoraFim = formatarHoraComSegundosZero(horaFim);

      reservaPayload = {
        data: formattedData,
        hora_inicio: formattedHoraInicio,
        hora_fim: formattedHoraFim,
        fk_id_usuario: idUsuario,
        fk_id_sala: idSala,
      };

      try {
        const response = await api.postReserva(reservaPayload);
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
          message: error.response?.data?.error || "Erro desconhecido ao reservar sala.",
        });
        setModalVisible(true);
        console.log(error);
      }

    } else { // currentMode === 'periodica'
      if (dataFimPeriodica.getTime() < dataInicioPeriodica.getTime()) {
        setModalInfo({
          type: "error",
          title: "Erro de Data",
          message: "A Data de Fim deve ser posterior ou igual à Data de Início.",
        });
        setModalVisible(true);
        return;
      }
      if (selectedDays.length === 0) {
        setModalInfo({
          type: "error",
          title: "Erro de Dias da Semana",
          message: "Selecione pelo menos um dia da semana para a reserva periódica.",
        });
        setModalVisible(true);
        return;
      }

      const formattedDataInicio = dataInicioPeriodica.toISOString().split("T")[0];
      const formattedDataFim = dataFimPeriodica.toISOString().split("T")[0];
      const formattedHoraInicio = formatarHoraComSegundosZero(horaInicio);
      const formattedHoraFim = formatarHoraComSegundosZero(horaFim);

      let diasSemanaToSend = null;
      if (selectedDays.length > 0) {
        if (selectedDays.length === 1) {
          diasSemanaToSend = selectedDays[0];
        } else {
          diasSemanaToSend = selectedDays;
        }
      }

      reservaPayload = {
        data_inicio: formattedDataInicio,
        data_fim: formattedDataFim,
        hora_inicio: formattedHoraInicio,
        hora_fim: formattedHoraFim,
        fk_id_usuario: idUsuario,
        fk_id_sala: idSala,
        dias_semana: diasSemanaToSend,
      };

      try {
        const response = await api.postReservaPeriodica(reservaPayload);
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
          message: error.response?.data?.error || "Erro desconhecido ao reservar sala periodicamente.",
        });
        setModalVisible(true);
        console.log(error);
      }
    }
  }, [
    currentMode,
    dataSimples,
    dataInicioPeriodica,
    dataFimPeriodica,
    formatarHoraComSegundosZero,
    horaFim,
    horaInicio,
    idSala,
    idUsuario,
    selectedDays,
  ]);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    if (modalInfo.type === "success") {
      navigation.navigate("Principal");
      onClose();
    }
  }, [modalInfo.type, navigation, onClose]);


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
      color: 'rgb(177, 16, 16)',
    },
    title: {
      fontSize: width * 0.06,
      fontWeight: "bold",
      color: '#333',
      marginBottom: height * 0.02,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: width * 0.04,
      color: '#666',
      marginBottom: height * 0.03,
      textAlign: 'center',
    },
    modeToggleContainer: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'center',
      marginBottom: height * 0.025,
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      overflow: 'hidden',
    },
    modeToggleButton: {
      flex: 1,
      paddingVertical: height * 0.015,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    modeToggleButtonActive: {
      backgroundColor: 'rgb(177, 16, 16)',
      borderColor: 'rgb(177, 16, 16)',
    },
    modeButtonText: {
      fontSize: width * 0.04,
      fontWeight: 'bold',
      color: '#555',
    },
    modeButtonTextActive: {
      color: 'white',
    },
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: height * 0.025,
      gap: width * 0.02,
    },
    inputGroup: {
      flex: 1,
      alignItems: 'flex-start',
    },
    inputTitle: {
      fontSize: width * 0.035,
      marginBottom: height * 0.005,
      fontWeight: "500",
      color: '#555',
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
      justifyContent: 'space-between',
    },
    inputFakeText: {
      fontSize: width * 0.04,
      color: '#333',
    },
    summaryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.04,
      marginBottom: height * 0.03,
      width: '100%',
    },
    summaryIcon: {
      marginRight: width * 0.025,
      color: 'rgb(177, 16, 16)',
    },
    summaryText: {
      fontSize: width * 0.038,
      color: '#333',
      fontWeight: '500',
      flexShrink: 1,
      flexWrap: 'wrap',
    },
    confirmButton: {
      backgroundColor: "rgb(177, 16, 16)",
      paddingVertical: height * 0.02,
      paddingHorizontal: width * 0.08,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
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
      marginLeft: width * 0.02,
    },
  });

  return (
    <>
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
        <View style={dynamicStyles.overlay}>
          <View style={dynamicStyles.modal}>
            <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle-outline" size={width * 0.07} color="#999" />
            </TouchableOpacity>

            <Ionicons name="calendar" size={width * 0.12} style={dynamicStyles.headerIcon} />
            <Text style={dynamicStyles.title}>Reservar Sala</Text>

            <View style={dynamicStyles.modeToggleContainer}>
              <TouchableOpacity
                style={[dynamicStyles.modeToggleButton, currentMode === 'simples' && dynamicStyles.modeToggleButtonActive]}
                onPress={() => setCurrentMode('simples')}
              >
                <Text style={[dynamicStyles.modeButtonText, currentMode === 'simples' && dynamicStyles.modeButtonTextActive]}>Reserva Simples</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modeToggleButton, currentMode === 'periodica' && dynamicStyles.modeToggleButtonActive]}
                onPress={() => setCurrentMode('periodica')}
              >
                <Text style={[dynamicStyles.modeButtonText, currentMode === 'periodica' && dynamicStyles.modeButtonTextActive]}>Reserva Periódica</Text>
              </TouchableOpacity>
            </View>

            {currentMode === 'simples' ? (
              <>
                <View style={dynamicStyles.inputRow}>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputTitle}>Data</Text>
                    <TouchableOpacity
                      onPress={() => setMostrarDatePicker(true)}
                      style={dynamicStyles.inputFake}
                    >
                      <Text style={dynamicStyles.inputFakeText}>{formatarDataExibicao(dataSimples)}</Text>
                      <FontAwesome name="calendar" size={width * 0.04} color="#888" />
                    </TouchableOpacity>
                    {mostrarDatePicker && (
                      <DateTimePicker
                        mode="date"
                        value={dataSimples}
                        minimumDate={getToday()}
                        onChange={(e, selected) => {
                          if (selected) setDataSimples(selected);
                          setMostrarDatePicker(false);
                        }}
                      />
                    )}
                  </View>
                </View>

                <View style={dynamicStyles.inputRow}>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputTitle}>Início</Text>
                    <TouchableOpacity
                      onPress={() => setMostrarStartTimePicker(true)}
                      style={dynamicStyles.inputFake}
                    >
                      <Text style={dynamicStyles.inputFakeText}>{formatarHoraExibicao(horaInicio)}</Text>
                      <Ionicons name="time-outline" size={width * 0.04} color="#888" />
                    </TouchableOpacity>
                    {mostrarStartTimePicker && (
                      <DateTimePicker
                        mode="time"
                        display="spinner"
                        is24Hour={true}
                        value={horaInicio}
                        onChange={(e, selected) => {
                          if (selected) {
                            const newHoraInicio = new Date(selected);
                            newHoraInicio.setSeconds(0);
                            newHoraInicio.setMilliseconds(0);
                            setHoraInicio(newHoraInicio);
                            ajustarHoraFim(newHoraInicio);
                          }
                          setMostrarStartTimePicker(false);
                        }}
                      />
                    )}
                  </View>

                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputTitle}>Fim</Text>
                    <TouchableOpacity
                      onPress={() => setMostrarEndTimePicker(true)}
                      style={dynamicStyles.inputFake}
                    >
                      <Text style={dynamicStyles.inputFakeText}>{formatarHoraExibicao(horaFim)}</Text>
                      <Ionicons name="time-outline" size={width * 0.04} color="#888" />
                    </TouchableOpacity>
                    {mostrarEndTimePicker && (
                      <DateTimePicker
                        mode="time"
                        display="spinner"
                        is24Hour={true}
                        value={horaFim}
                        minimumDate={new Date(horaInicio.getTime() + 60 * 60 * 1000)}
                        onChange={(e, selected) => {
                          if (selected) {
                            const newHoraFim = new Date(selected);
                            newHoraFim.setSeconds(0);
                            newHoraFim.setMilliseconds(0);
                            setHoraFim(newHoraFim);
                          }
                          setMostrarEndTimePicker(false);
                        }}
                      />
                    )}
                  </View>
                </View>

                <View style={dynamicStyles.summaryContainer}>
                  <FontAwesome name="calendar" size={width * 0.045} style={dynamicStyles.summaryIcon} />
                  <Text style={dynamicStyles.summaryText}>
                    {formatarDataExibicao(dataSimples)} das {formatarHoraExibicao(horaInicio)} às {formatarHoraExibicao(horaFim)}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={dynamicStyles.inputRow}>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputTitle}>Data Início</Text>
                    <TouchableOpacity
                      onPress={() => setMostrarDataInicioPickerPeriodica(true)}
                      style={dynamicStyles.inputFake}
                    >
                      <Text style={dynamicStyles.inputFakeText}>{formatarDataExibicao(dataInicioPeriodica)}</Text>
                      <FontAwesome name="calendar" size={width * 0.04} color="#888" />
                    </TouchableOpacity>
                    {mostrarDataInicioPickerPeriodica && (
                      <DateTimePicker
                        mode="date"
                        value={dataInicioPeriodica}
                        minimumDate={getToday()}
                        onChange={(e, selected) => {
                          if (selected) setDataInicioPeriodica(selected);
                          setMostrarDataInicioPickerPeriodica(false);
                        }}
                      />
                    )}
                  </View>

                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputTitle}>Data Fim</Text>
                    <TouchableOpacity
                      onPress={() => setMostrarDataFimPickerPeriodica(true)}
                      style={dynamicStyles.inputFake}
                    >
                      <Text style={dynamicStyles.inputFakeText}>{formatarDataExibicao(dataFimPeriodica)}</Text>
                      <FontAwesome name="calendar" size={width * 0.04} color="#888" />
                    </TouchableOpacity>
                    {mostrarDataFimPickerPeriodica && (
                      <DateTimePicker
                        mode="date"
                        value={dataFimPeriodica}
                        minimumDate={dataInicioPeriodica}
                        onChange={(e, selected) => {
                          if (selected) setDataFimPeriodica(selected);
                          setMostrarDataFimPickerPeriodica(false);
                        }}
                      />
                    )}
                  </View>
                </View>

                <View style={dynamicStyles.inputRow}>
                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputTitle}>Início</Text>
                    <TouchableOpacity
                      onPress={() => setMostrarStartTimePicker(true)}
                      style={dynamicStyles.inputFake}
                    >
                      <Text style={dynamicStyles.inputFakeText}>{formatarHoraExibicao(horaInicio)}</Text>
                      <Ionicons name="time-outline" size={width * 0.04} color="#888" />
                    </TouchableOpacity>
                    {mostrarStartTimePicker && (
                      <DateTimePicker
                        mode="time"
                        display="spinner"
                        is24Hour={true}
                        value={horaInicio}
                        onChange={(e, selected) => {
                          if (selected) {
                            const newHoraInicio = new Date(selected);
                            newHoraInicio.setSeconds(0);
                            newHoraInicio.setMilliseconds(0);
                            setHoraInicio(newHoraInicio);
                            ajustarHoraFim(newHoraInicio);
                          }
                          setMostrarStartTimePicker(false);
                        }}
                      />
                    )}
                  </View>

                  <View style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputTitle}>Fim</Text>
                    <TouchableOpacity
                      onPress={() => setMostrarEndTimePicker(true)}
                      style={dynamicStyles.inputFake}
                    >
                      <Text style={dynamicStyles.inputFakeText}>{formatarHoraExibicao(horaFim)}</Text>
                      <Ionicons name="time-outline" size={width * 0.04} color="#888" />
                    </TouchableOpacity>
                    {mostrarEndTimePicker && (
                      <DateTimePicker
                        mode="time"
                        display="spinner"
                        is24Hour={true}
                        value={horaFim}
                        minimumDate={new Date(horaInicio.getTime() + 60 * 60 * 1000)}
                        onChange={(e, selected) => {
                          if (selected) {
                            const newHoraFim = new Date(selected);
                            newHoraFim.setSeconds(0);
                            newHoraFim.setMilliseconds(0);
                            setHoraFim(newHoraFim);
                          }
                          setMostrarEndTimePicker(false);
                        }}
                      />
                    )}
                  </View>
                </View>

                <View style={{ width: '100%', marginBottom: height * 0.025 }}>
                  <Text style={dynamicStyles.inputTitle}>Dias da Semana</Text>
                  <TouchableOpacity
                    onPress={() => setShowDaySelectionModal(true)}
                    style={dynamicStyles.inputFake}
                  >
                    <Text style={dynamicStyles.inputFakeText}>{getSelectedDaysText()}</Text>
                    <Ionicons name="chevron-down-outline" size={width * 0.04} color="#888" />
                  </TouchableOpacity>
                </View>

                <View style={dynamicStyles.summaryContainer}>
                  <FontAwesome name="calendar" size={width * 0.045} style={dynamicStyles.summaryIcon} />
                  <Text style={dynamicStyles.summaryText}>
                    De {formatarDataExibicao(dataInicioPeriodica)} a {formatarDataExibicao(dataFimPeriodica)}, na(s) {getSelectedDaysText()}, das {formatarHoraExibicao(horaInicio)} às {formatarHoraExibicao(horaFim)}
                  </Text>
                </View>
              </>
            )}

            <TouchableOpacity style={dynamicStyles.confirmButton} onPress={handleReserva}>
              <FontAwesome name="check-circle" size={width * 0.05} color="white" />
              <Text style={dynamicStyles.confirmButtonText}>CONFIRMAR RESERVA</Text>
            </TouchableOpacity>
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

      {currentMode === 'periodica' && (
        <DiasModal
          visible={showDaySelectionModal}
          onClose={() => setShowDaySelectionModal(false)}
          validDays={validDays}
          selectedDays={selectedDays}
          toggleDay={toggleDay}
          diasSemanaMap={diasSemanaMap}
        />
      )}
    </>
  );
};

export default ReservarModal;
