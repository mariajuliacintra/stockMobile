import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

// Componente separado para o modal de seleção de dias da semana
const DaySelectionModal = ({ visible, onClose, validDays, selectedDays, toggleDay, diasSemanaMap }) => {
  const { width, height } = useWindowDimensions();

  const dayModalStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    content: {
      width: width * 0.7,
      maxHeight: height * 0.6, // Limita a altura do modal de seleção de dias
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: width * 0.05,
      fontWeight: '600',
      marginBottom: 15,
      color: '#333',
    },
    scrollView: {
        width: '100%',
    },
    checkboxItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 5,
      width: '100%', // Garante que o item ocupe a largura total
    },
    checkboxText: {
      fontSize: width * 0.04,
      color: '#333',
      marginLeft: 10,
      flexShrink: 1, // Permite que o texto quebre a linha se for muito longo
    },
    checkboxTextDisabled: {
      color: '#a0a0a0',
    },
    checkboxIcon: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 4,
        borderColor: '#555',
    },
    checkboxIconChecked: {
        backgroundColor: 'rgb(177, 16, 16)',
        borderColor: 'rgb(177, 16, 16)',
    },
    closeButton: {
      marginTop: 20,
      backgroundColor: "rgb(250, 24, 24)",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: width * 0.04,
    }
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={dayModalStyles.overlay}>
        <View style={dayModalStyles.content}>
          <Text style={dayModalStyles.title}>Selecione os Dias da Semana</Text>
          <ScrollView style={dayModalStyles.scrollView} showsVerticalScrollIndicator={false}>
            {Object.entries(diasSemanaMap).map(([key, value]) => {
              const dayNum = Number(key);
              const isSelected = selectedDays.includes(dayNum);
              const isDisabled = !validDays.includes(dayNum);

              return (
                <TouchableOpacity
                  key={dayNum}
                  style={dayModalStyles.checkboxItem}
                  onPress={() => !isDisabled && toggleDay(dayNum)}
                  disabled={isDisabled}
                >
                  <View style={[
                    dayModalStyles.checkboxIcon,
                    isSelected && dayModalStyles.checkboxIconChecked
                  ]}>
                    {isSelected && <Ionicons name="checkmark-outline" size={18} color="white" />}
                  </View>
                  <Text style={[
                    dayModalStyles.checkboxText,
                    isDisabled && dayModalStyles.checkboxTextDisabled
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={dayModalStyles.closeButton}>
            <Text style={dayModalStyles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


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
  const [showDaySelectionModal, setShowDaySelectionModal] = useState(false); // Controla a visibilidade do NOVO modal de dias

  const diasSemanaMap = {
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado",
  };
  const diasSemanaKeys = Object.keys(diasSemanaMap).map(Number);

  const getDaysInRange = (startDate, endDate) => {
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
  };

  useEffect(() => {
    const newValidDays = getDaysInRange(dataInicio, dataFim);
    setValidDays(newValidDays);
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.filter((day) => newValidDays.includes(day))
    );
  }, [dataInicio, dataFim]);

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
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: width * 0.85,
      maxHeight: height * 0.9,
      backgroundColor: "white",
      borderRadius: 10,
      paddingVertical: height * 0.04,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    closeButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      zIndex: 1,
      padding: 5,
    },
    modalTitle: {
      fontSize: width * 0.06,
      fontWeight: '600',
      marginBottom: height * 0.03,
      color: '#333',
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: width * 0.7,
      backgroundColor: "white",
      borderRadius: 5,
      marginBottom: height * 0.015,
      paddingHorizontal: width * 0.03,
      height: height * 0.06,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    iconStyle: {
      marginRight: width * 0.02,
    },
    inputField: {
      flex: 1,
      fontSize: width * 0.04,
      color: 'black',
      paddingVertical: 0,
    },
    buttonApply: {
      backgroundColor: "rgb(250, 24, 24)",
      paddingVertical: height * 0.018,
      paddingHorizontal: width * 0.1,
      borderRadius: 5,
      alignItems: "center",
      marginTop: height * 0.03,
      width: width * 0.7,
    },
    textButtonApply: {
      fontSize: width * 0.045,
      color: "white",
      fontWeight: "bold",
    },
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.modalOverlay}>
        <View style={dynamicStyles.modalContent}>
          <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle-outline" size={width * 0.07} color="gray" />
          </TouchableOpacity>

          <Text style={dynamicStyles.modalTitle}>Filtrar Salas</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems: 'center'}}>
            <TouchableOpacity onPress={() => setShowDataInicioPicker(true)} style={dynamicStyles.inputContainer}>
              <Ionicons name="calendar-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputField}>
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

            <TouchableOpacity onPress={() => setShowDataFimPicker(true)} style={dynamicStyles.inputContainer}>
              <Ionicons name="calendar-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputField}>
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

            <TouchableOpacity onPress={() => setShowHoraInicioPicker(true)} style={dynamicStyles.inputContainer}>
              <Ionicons name="time-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputField}>
                Hora Início: {horaInicio.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
              </Text>
            </TouchableOpacity>
            {showHoraInicioPicker && (
              <DateTimePicker
                value={horaInicio}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={(_, selected) => {
                  setShowHoraInicioPicker(false);
                  if (selected) setHoraInicio(selected);
                }}
              />
            )}

            <TouchableOpacity onPress={() => setShowHoraFimPicker(true)} style={dynamicStyles.inputContainer}>
              <Ionicons name="time-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputField}>
                Hora Fim: {horaFim.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
              </Text>
            </TouchableOpacity>
            {showHoraFimPicker && (
              <DateTimePicker
                value={horaFim}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={(_, selected) => {
                  setShowHoraFimPicker(false);
                  if (selected) setHoraFim(selected);
                }}
              />
            )}

            {/* Input que abre o modal de seleção de Dias da Semana */}
            <TouchableOpacity
              style={dynamicStyles.inputContainer}
              onPress={() => setShowDaySelectionModal(true)}
            >
              <Ionicons name="checkbox-outline" size={width * 0.05} color="gray" style={dynamicStyles.iconStyle} />
              <Text style={dynamicStyles.inputField}>
                Dias da Semana: {getSelectedDaysText()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleApply} style={dynamicStyles.buttonApply}>
              <Text style={dynamicStyles.textButtonApply}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Renderiza o modal de seleção de dias da semana separadamente */}
      <DaySelectionModal
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
