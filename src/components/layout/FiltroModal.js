import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import DiasModal from "../mod/DiasModal"; // Importa o DiasModal externo

function FiltroModal({ visible, onClose, onApplyFilters }) {
  const { width, height } = useWindowDimensions();

  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());

  const [showDataInicioPicker, setShowDataInicioPicker] = useState(false);
  const [showDataFimPicker, setShowDataFimPicker] = useState(false);
  const [showHoraInicioPicker, setShowHoraInicioPicker] = useState(false);
  const [showHoraFimPicker, setShowHoraFimPicker] = useState(false);

  const [selectedDays, setSelectedDays] = useState([]);
  const [validDays, setValidDays] = useState([]);
  const [showDaySelectionModal, setShowDaySelectionModal] = useState(false);

  const diasSemanaMap = {
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado",
  };
  const diasSemanaKeys = Object.keys(diasSemanaMap).map(Number);

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
    const newCalculatedValidDays = getDaysInRange(dataInicio, dataFim);

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
  }, [dataInicio, dataFim, getDaysInRange, validDays]);

  const toggleDay = (dayNum) => {
    setSelectedDays((prevSelectedDays) => {
      if (prevSelectedDays.includes(dayNum)) {
        return prevSelectedDays.filter((day) => day !== dayNum);
      } else {
        return [...prevSelectedDays, dayNum];
      }
    });
  };

  const formatDate = (dateObj) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatTime24h = (dateObj) => {
    dateObj.setSeconds(0);
    dateObj.setMilliseconds(0);
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const mi = String(dateObj.getMinutes()).padStart(2, "0");
    return `${hh}:${mi}:00`;
  };

  const handleApply = () => {
    let diaSemanaToSend = null;
    if (selectedDays.length > 0) {
      if (selectedDays.length === 1) {
        diaSemanaToSend = selectedDays[0];
      } else {
        diaSemanaToSend = selectedDays;
      }
    }

    const filters = {
      data_inicio: formatDate(dataInicio),
      data_fim: formatDate(dataFim),
      hora_inicio: formatTime24h(horaInicio),
      hora_fim: formatTime24h(horaFim),
    };

    if (diaSemanaToSend !== null) {
      filters.dias_semana = [diaSemanaToSend];
    }

    onApplyFilters(filters);
    onClose();
  };

  const getSelectedDaysText = () => {
    if (selectedDays.length === 0) {
      return "Selecione os dias";
    }
    return selectedDays.map(dayNum => diasSemanaMap[dayNum]).join(", ");
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
      paddingVertical: height * 0.02,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: "center",
      width: '50%',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 6,
    },
    confirmButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: width * 0.04,
      marginRight: width * 0.05,
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.overlay}>
        <View style={dynamicStyles.modal}>
          <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle-outline" size={width * 0.07} color="#999" />
          </TouchableOpacity>

          <Ionicons name="options-outline" size={width * 0.11} color="white" style={dynamicStyles.headerIcon} />
          <Text style={dynamicStyles.title}>Filtrar Salas</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{width: '100%', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => setShowDataInicioPicker(true)} style={dynamicStyles.inputFake}>
              <Ionicons name="calendar-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputFakeText}>
                Data Início: {dataInicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </Text>
            </TouchableOpacity>
            {showDataInicioPicker && (
              <DateTimePicker
                value={dataInicio}
                mode="date"
                display="default"
                onChange={(_, selected) => {
                  setShowDataInicioPicker(false);
                  if (selected) setDataInicio(selected);
                }}
              />
            )}

            <TouchableOpacity onPress={() => setShowDataFimPicker(true)} style={dynamicStyles.inputFake}>
              <Ionicons name="calendar-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputFakeText}>
                Data Fim: {dataFim.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </Text>
            </TouchableOpacity>
            {showDataFimPicker && (
              <DateTimePicker
                value={dataFim}
                mode="date"
                display="default"
                onChange={(_, selected) => {
                  setShowDataFimPicker(false);
                  if (selected) setDataFim(selected);
                }}
              />
            )}

            <TouchableOpacity onPress={() => setShowHoraInicioPicker(true)} style={dynamicStyles.inputFake}>
              <Ionicons name="time-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputFakeText}>
                Hora Início: {horaInicio.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
              </Text>
            </TouchableOpacity>
            {showHoraInicioPicker && (
              <DateTimePicker
                value={horaInicio}
                mode="time"
                display="spinner"
                is24Hour={true}
                onChange={(_, selected) => {
                  setShowHoraInicioPicker(false);
                  if (selected) setHoraInicio(selected);
                }}
              />
            )}

            <TouchableOpacity onPress={() => setShowHoraFimPicker(true)} style={dynamicStyles.inputFake}>
              <Ionicons name="time-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputFakeText}>
                Hora Fim: {horaFim.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
              </Text>
            </TouchableOpacity>
            {showHoraFimPicker && (
              <DateTimePicker
                value={horaFim}
                mode="time"
                display="spinner"
                is24Hour={true}
                onChange={(_, selected) => {
                  setShowHoraFimPicker(false);
                  if (selected) setHoraFim(selected);
                }}
              />
            )}

            <TouchableOpacity
              style={dynamicStyles.inputFake}
              onPress={() => setShowDaySelectionModal(true)}
            >
              <Ionicons name="checkbox-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputFakeText}>
                Dias da Semana: {getSelectedDaysText()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleApply} style={dynamicStyles.confirmButton}>
              <Text style={dynamicStyles.confirmButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <DiasModal // Usando o DiasModal importado
        visible={showDaySelectionModal}
        onClose={() => setShowDaySelectionModal(false)}
        validDays={validDays}
        selectedDays={selectedDays}
        toggleDay={toggleDay}
        diasSemanaMap={diasSemanaMap}
      />
    </Modal>
  );
}

export default FiltroModal;
