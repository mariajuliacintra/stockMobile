import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import api from "../../services/axios";

const { width, height } = Dimensions.get("window");

function ReservasHistoricoModal({
  visible,
  onClose,
}) {
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [activeTab, setActiveTab] = useState("simples");
  const [expandedDaysMap, setExpandedDaysMap] = useState({});

  const diasSemanaMap = {
    "0": "Domingo",
    "1": "Segunda-feira",
    "2": "Terça-feira",
    "3": "Quarta-feira",
    "4": "Quinta-feira",
    "5": "Sexta-feira",
    "6": "Sábado",
  };

  const fetchHistorico = useCallback(async () => {
    if (!visible) return;
    try {
      const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
      if (!idUsuarioStr) {
        console.warn("ID do usuário não encontrado no SecureStore.");
        return;
      }

      const idUsuario = Number(idUsuarioStr);
      if (isNaN(idUsuario)) {
        console.error("ID do usuário não é um número válido:", idUsuarioStr);
        return;
      }

      const responseHistorico = await api.getReservasHistoricoById(idUsuario);
      setHistoricoReservas(responseHistorico.data.reservasHistorico || []);
    } catch (error) {
      console.error("Erro ao buscar histórico de reservas:", error);
    }
  }, [visible]);

  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  const toggleDayExpansion = useCallback((reservaId) => {
    setExpandedDaysMap(prevState => ({
      ...prevState,
      [reservaId]: !prevState[reservaId]
    }));
  }, []);

  const simplesHistorico = historicoReservas.filter(
    (reserva) => typeof reserva.tipo === 'string' && reserva.tipo.toLowerCase().includes("simples")
  );
  const periodicasHistorico = historicoReservas.filter(
    (reserva) => typeof reserva.tipo === 'string' && reserva.tipo.toLowerCase().includes("periodica")
  );

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
      width: width * 0.8,
      maxWidth: 500,
      minHeight: height * 0.5,
      maxHeight: height * 0.85,
      flexDirection: 'column',
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 10,
    },
    closeButton: {
      position: "absolute",
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
      borderRadius: (width * 0.12 + width * 0.03 * 2) / 2,
    },
    modalTitle: {
      fontSize: width * 0.06,
      fontWeight: "bold",
      color: "#333",
      marginBottom: height * 0.02,
      textAlign: "center",
    },
    tabContainer: {
      flexDirection: "row",
      marginBottom: height * 0.02,
      width: "100%",
      justifyContent: "center",
    },
    tabButton: {
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.04,
      borderRadius: 8,
      marginHorizontal: width * 0.01,
      backgroundColor: "#f0f0f0",
      borderWidth: 1,
      borderColor: "#ddd",
    },
    tabButtonActive: {
      backgroundColor: "rgb(177, 16, 16)",
      borderColor: "rgb(177, 16, 16)",
    },
    tabButtonText: {
      fontSize: width * 0.04,
      fontWeight: "bold",
      color: "#555",
    },
    tabButtonTextActive: {
      color: "white",
    },
    scrollViewEmptyContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: "100%",
    },
    scrollViewFilledContent: {
      width: "100%",
      paddingBottom: height * 0.02,
      alignItems: "center",
    },
    itemReserva: {
      backgroundColor: "#f9f9f9",
      borderRadius: 10,
      paddingVertical: height * 0.02,
      paddingHorizontal: width * 0.05,
      marginBottom: height * 0.015,
      borderWidth: 1,
      borderColor: "#eee",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
      width: "100%",
      alignItems: "flex-start",
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: height * 0.01,
      width: "100%",
    },
    itemTitle: {
      fontSize: width * 0.045,
      fontWeight: "bold",
      color: "#333",
      flexShrink: 1,
      marginRight: width * 0.02,
    },
    detailRow: {
      flexDirection: "row",
      marginBottom: height * 0.005,
      width: "100%",
    },
    detailLabel: {
      fontSize: width * 0.035,
      fontWeight: "600",
      color: "#555",
      marginRight: width * 0.01,
      flexBasis: "auto",
      flexShrink: 0,
    },
    detailValue: {
      fontSize: width * 0.035,
      color: "#777",
      flex: 1,
      flexWrap: "wrap",
    },
    detailValueExpandable: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    dayListContainer: {
      marginTop: height * 0.005,
      width: "100%",
    },
    singleDayText: {
      fontSize: width * 0.035,
      color: '#777',
      marginBottom: height * 0.002,
    },
    noReserva: {
      textAlign: "center",
      marginVertical: height * 0.02,
      color: "gray",
      fontSize: width * 0.04,
    },
  });

  const renderHistoricoList = (historicoList) => {
    return (
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={historicoList.length === 0 ? dynamicStyles.scrollViewEmptyContent : dynamicStyles.scrollViewFilledContent}
        showsVerticalScrollIndicator={false}
      >
        {historicoList.length === 0 ? (
          <Text style={dynamicStyles.noReserva}>Nenhuma reserva encontrada</Text>
        ) : (
          historicoList.map((reserva, index) => {
            const isExpanded = expandedDaysMap[reserva.id_reserva];
            const formattedDaysArray =
              reserva.dias_semana && Array.isArray(reserva.dias_semana)
                ? reserva.dias_semana.map(
                    (dayNum) => diasSemanaMap[String(dayNum)] || `Dia ${dayNum}`
                  )
                : [];

            const displayDaysCollapsed =
              formattedDaysArray.length > 0
                ? formattedDaysArray.length > 1
                  ? `- ${formattedDaysArray[0]}...`
                  : `- ${formattedDaysArray[0]}`
                : "N/A";
            
            const showExpandToggle = formattedDaysArray.length > 1;

            return (
              <View
                key={`${reserva.id_reserva}-${index}`}
                style={dynamicStyles.itemReserva}
              >
                <View style={dynamicStyles.itemHeader}>
                  <Text style={dynamicStyles.itemTitle}>{String(reserva.sala)}</Text>
                </View>
                {activeTab === "simples" ? (
                  <View>
                    <View style={dynamicStyles.detailRow}>
                      <Text style={dynamicStyles.detailLabel}>Data:</Text>
                      <Text style={dynamicStyles.detailValue}>
                        {String(reserva.data_inicio)}
                      </Text>
                    </View>
                    <View style={dynamicStyles.detailRow}>
                      <Text style={dynamicStyles.detailLabel}>Hora Início:</Text>
                      <Text style={dynamicStyles.detailValue}>
                        {String(reserva.hora_inicio).substring(0, 5)}
                      </Text>
                    </View>
                    <View style={dynamicStyles.detailRow}>
                      <Text style={dynamicStyles.detailLabel}>Hora Fim:</Text>
                      <Text style={dynamicStyles.detailValue}>
                        {String(reserva.hora_fim).substring(0, 5)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={dynamicStyles.detailRow}>
                      <Text style={dynamicStyles.detailLabel}>Data Início:</Text>
                      <Text style={dynamicStyles.detailValue}>
                        {String(reserva.data_inicio)}
                      </Text>
                    </View>
                    <View style={dynamicStyles.detailRow}>
                      <Text style={dynamicStyles.detailLabel}>Data Fim:</Text>
                      <Text style={dynamicStyles.detailValue}>
                        {String(reserva.data_fim)}
                      </Text>
                    </View>
                    <View style={dynamicStyles.detailRow}>
                      <Text style={dynamicStyles.detailLabel}>Hora Início:</Text>
                      <Text style={dynamicStyles.detailValue}>
                        {String(reserva.hora_inicio).substring(0, 5)}
                      </Text>
                    </View>
                    <View style={dynamicStyles.detailRow}>
                      <Text style={dynamicStyles.detailLabel}>Hora Fim:</Text>
                      <Text style={dynamicStyles.detailValue}>
                        {String(reserva.hora_fim).substring(0, 5)}
                      </Text>
                    </View>
                    <View style={dynamicStyles.detailRow}>
                      <Text style={dynamicStyles.detailLabel}>Dias da Semana:</Text>
                      <TouchableOpacity
                        onPress={() => toggleDayExpansion(reserva.id_reserva)}
                        style={dynamicStyles.detailValueExpandable}
                        disabled={!showExpandToggle}
                      >
                        <View style={{ flex: 1 }}>
                          {isExpanded ? (
                            <View style={dynamicStyles.dayListContainer}>
                              {formattedDaysArray.map((dayName, dayIndex) => (
                                <Text key={dayIndex} style={dynamicStyles.singleDayText}>
                                  - {dayName}
                                </Text>
                              ))}
                            </View>
                          ) : (
                            <Text style={dynamicStyles.detailValue}>{displayDaysCollapsed}</Text>
                          )}
                        </View>
                        {showExpandToggle && (
                          <Ionicons
                            name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                            size={width * 0.04}
                            color="#777"
                            style={{ marginLeft: width * 0.02 }}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={dynamicStyles.overlay}>
          <View style={dynamicStyles.modal}>
            <TouchableOpacity
              style={dynamicStyles.closeButton}
              onPress={onClose}
            >
              <Ionicons
                name="close-circle-outline"
                size={width * 0.07}
                color="#999"
              />
            </TouchableOpacity>

            <Ionicons name="time-outline" size={width * 0.12} style={dynamicStyles.headerIcon} />
            <Text style={dynamicStyles.modalTitle}>Histórico de Reservas</Text>

            <View style={dynamicStyles.tabContainer}>
              <TouchableOpacity
                style={[
                  dynamicStyles.tabButton,
                  activeTab === "simples" && dynamicStyles.tabButtonActive,
                ]}
                onPress={() => setActiveTab("simples")}
              >
                <Text
                  style={[
                    dynamicStyles.tabButtonText,
                    activeTab === "simples" && dynamicStyles.tabButtonTextActive,
                  ]}
                >
                  Simples
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  dynamicStyles.tabButton,
                  activeTab === "periodicas" && dynamicStyles.tabButtonActive,
                ]}
                onPress={() => setActiveTab("periodicas")}
              >
                <Text
                  style={[
                    dynamicStyles.tabButtonText,
                    activeTab === "periodicas" &&
                      dynamicStyles.tabButtonTextActive,
                  ]}
                >
                  Periódicas
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, width: '100%' }}>
              {activeTab === "simples"
                ? renderHistoricoList(simplesHistorico)
                : renderHistoricoList(periodicasHistorico)}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default ReservasHistoricoModal;
