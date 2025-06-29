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
import AtualizarReservaModal from "./AtualizarReservaModal";

const { width, height } = Dimensions.get("window");

function ReservasUsuarioModal({ visible, onClose, onHistorico, onDeletadas }) {
  const [currentReservas, setCurrentReservas] = useState([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("simples");
  const [expandedDaysMap, setExpandedDaysMap] = useState({});
  const [reservaSelecionadaParaEdicao, setReservaSelecionadaParaEdicao] =
    useState(null);
  const [mostrarEdicaoReserva, setMostrarEdicaoReserva] = useState(false);

  const diasSemanaMap = {
    0: "Domingo",
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado",
  };

  const parseDataHora = useCallback((dataStr, horaStr) => {
    const [dia, mes, ano] = String(dataStr).split("-");
    const [hora, min, seg] = String(horaStr).split(":");
    return new Date(
      parseInt(ano),
      parseInt(mes) - 1,
      parseInt(dia),
      parseInt(hora),
      parseInt(min),
      parseInt(seg)
    );
  }, []);

  const fetchCurrentReservations = useCallback(async () => {
    if (!visible) return;
    try {
      const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
      if (!idUsuarioStr) return;

      const idUsuario = Number(idUsuarioStr);
      if (isNaN(idUsuario)) {
        console.error("ID do usuário não é um número válido");
        return;
      }

      const responseReservas = await api.getUsuarioReservasById(idUsuario);

      const agora = new Date();

      const reservasFuturas = (responseReservas.data.reservas || []).filter(
        (reserva) => {
          if (!reserva.data_fim || !reserva.hora_fim) {
            console.warn("Reserva sem data_fim ou hora_fim:", reserva);
            return false;
          }
          const dataHoraFim = parseDataHora(reserva.data_fim, reserva.hora_fim);
          return dataHoraFim >= agora;
        }
      );
      setCurrentReservas(reservasFuturas);
    } catch (error) {
      console.error("Erro ao buscar reservas atuais:", error);
    }
  }, [visible, parseDataHora]);

  useEffect(() => {
    fetchCurrentReservations();
  }, [fetchCurrentReservations]);

  const simplesReservas = currentReservas.filter(
    (reserva) =>
      typeof reserva.tipo === "string" &&
      reserva.tipo.toLowerCase().includes("simples")
  );
  const periodicasReservas = currentReservas.filter(
    (reserva) =>
      typeof reserva.tipo === "string" &&
      reserva.tipo.toLowerCase().includes("periodica")
  );

  const toggleDayExpansion = (reservaId) => {
    setExpandedDaysMap((prevState) => ({
      ...prevState,
      [reservaId]: !prevState[reservaId],
    }));
  };

  const handleEditarReserva = (reserva) => {
    setReservaSelecionadaParaEdicao(reserva);
    setMostrarEdicaoReserva(true);
  };

  const handleFecharEdicaoReserva = () => {
    setMostrarEdicaoReserva(false);
    setReservaSelecionadaParaEdicao(null);
    fetchCurrentReservations();
  };

  const handleDeletarReserva = (reserva) => {
    setReservaToDelete(reserva);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmApagar = async () => {
    if (reservaToDelete) {
      try {
        const idUsuarioStr = await SecureStore.getItemAsync("idUsuario");
        if (!idUsuarioStr) throw new Error("ID do usuário não encontrado.");
        const idUsuario = Number(idUsuarioStr);
        if (isNaN(idUsuario)) throw new Error("ID do usuário inválido.");

        await api.deleteReserva(reservaToDelete.id_reserva, idUsuario);

        fetchCurrentReservations();
      } catch (error) {
        console.error("Erro ao apagar reserva:", error);
      }
    }
    setConfirmDeleteOpen(false);
    setReservaToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setReservaToDelete(null);
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
      width: width * 0.9,
      maxWidth: 500,
      minHeight: height * 0.55,
      maxHeight: height * 0.85,
      flexDirection: "column",
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
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    scrollViewFilledContent: {
      width: "100%",
      paddingBottom: height * 0.02,
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
      flexShrink: 1,
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
    itemActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      marginLeft: width * 0.02,
      width: width * 0.07,
      height: width * 0.07,
      borderRadius: (width * 0.07) / 2,
      backgroundColor: "#444",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    },
    actionIcon: {
      color: "white",
      fontSize: width * 0.035,
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
      marginRight: width * 0.005,
      flexBasis: "auto",
      flexShrink: 0,
    },
    detailValue: {
      fontSize: width * 0.035,
      color: "#777",
      flex: 1,
      flexWrap: "wrap",
      flexGrow: 1,
      flexShrink: 1,
    },
    detailValueExpandable: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    dayListContainer: {
      marginTop: height * 0.005,
      width: "100%",
    },
    singleDayText: {
      fontSize: width * 0.035,
      color: "#777",
      marginBottom: height * 0.002,
    },
    noReserva: {
      textAlign: "center",
      marginVertical: height * 0.02,
      color: "gray",
      fontSize: width * 0.04,
    },
    bottomButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      marginTop: height * 0.02,
    },
    bottomButton: {
      backgroundColor: "rgb(177, 16, 16)",
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.04,
      borderRadius: 8,
      alignItems: "center",
      flex: 1,
      marginHorizontal: width * 0.01,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    bottomButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: width * 0.035,
      textAlign: "center",
    },
    confirmModal: {
      backgroundColor: "white",
      padding: width * 0.06,
      borderRadius: 15,
      width: width * 0.8,
      maxWidth: 350,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 10,
    },
    confirmTitle: {
      fontSize: width * 0.05,
      fontWeight: "bold",
      marginBottom: height * 0.01,
      color: "#333",
      textAlign: "center",
    },
    confirmMessage: {
      fontSize: width * 0.038,
      textAlign: "center",
      marginBottom: height * 0.03,
      color: "#666",
    },
    confirmActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    confirmButtonBase: {
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.04,
      borderRadius: 8,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    cancelButton: {
      backgroundColor: "#ccc",
      marginRight: width * 0.01,
    },
    deleteConfirmButton: {
      backgroundColor: "rgb(177, 16, 16)",
      marginLeft: width * 0.01,
    },
    confirmText: {
      color: "white",
      fontWeight: "bold",
      fontSize: width * 0.04,
    },
  });

  const renderReservasList = (reservaList) => {
    return (
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={
          reservaList.length === 0
            ? dynamicStyles.scrollViewEmptyContent
            : dynamicStyles.scrollViewFilledContent
        }
        showsVerticalScrollIndicator={false}
      >
        {reservaList.length === 0 ? (
          <Text style={dynamicStyles.noReserva}>
            Nenhuma reserva encontrada
          </Text>
        ) : (
          reservaList.map((reserva, index) => {
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
                  <Text style={dynamicStyles.itemTitle}>
                    {String(reserva.sala)}
                  </Text>
                  <View style={dynamicStyles.itemActions}>
                    <TouchableOpacity
                      onPress={() => handleEditarReserva(reserva)}
                      style={dynamicStyles.actionButton}
                    >
                      <Ionicons
                        name="pencil-outline"
                        style={dynamicStyles.actionIcon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeletarReserva(reserva)}
                      style={dynamicStyles.actionButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        style={dynamicStyles.actionIcon}
                      />
                    </TouchableOpacity>
                  </View>
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
                      <Text style={dynamicStyles.detailLabel}>
                        Hora Início:
                      </Text>
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
                      <Text style={dynamicStyles.detailLabel}>
                        Dia da Semana:
                      </Text>
                      <Text style={dynamicStyles.detailValue}>
                        {reserva.dias_semana && reserva.dias_semana.length > 0
                          ? `- ${diasSemanaMap[String(reserva.dias_semana[0])]}` ||
                            "N/A"
                          : "N/A"}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={dynamicStyles.detailRow}>
                      <Text style={dynamicStyles.detailLabel}>
                        Data Início:
                      </Text>
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
                      <Text style={dynamicStyles.detailLabel}>
                        Hora Início:
                      </Text>
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
                      <Text style={dynamicStyles.detailLabel}>
                        Dias da Semana:
                      </Text>
                      <TouchableOpacity
                        onPress={() => toggleDayExpansion(reserva.id_reserva)}
                        style={dynamicStyles.detailValueExpandable}
                        disabled={!showExpandToggle}
                      >
                        <View style={{ flex: 1 }}>
                          {isExpanded ? (
                            <View style={dynamicStyles.dayListContainer}>
                              {formattedDaysArray.map((dayName, dayIndex) => (
                                <Text
                                  key={dayIndex}
                                  style={dynamicStyles.singleDayText}
                                >
                                  - {dayName}
                                </Text>
                              ))}
                            </View>
                          ) : (
                            <Text style={dynamicStyles.detailValue}>
                              {displayDaysCollapsed}
                            </Text>
                          )}
                        </View>
                        {showExpandToggle && (
                          <Ionicons
                            name={
                              isExpanded
                                ? "chevron-up-outline"
                                : "chevron-down-outline"
                            }
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

            <Text style={dynamicStyles.modalTitle}>Minhas Reservas</Text>

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
                    activeTab === "simples" &&
                      dynamicStyles.tabButtonTextActive,
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

            <View style={{ flex: 1, width: "100%", minHeight: height * 0.15 }}>
              {activeTab === "simples"
                ? renderReservasList(simplesReservas)
                : renderReservasList(periodicasReservas)}
            </View>

            <View style={dynamicStyles.bottomButtonContainer}>
              <TouchableOpacity
                onPress={onHistorico}
                style={dynamicStyles.bottomButton}
              >
                <Text style={dynamicStyles.bottomButtonText}>Histórico</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onDeletadas}
                style={dynamicStyles.bottomButton}
              >
                <Text style={dynamicStyles.bottomButtonText}>Deletadas</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmDeleteOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={dynamicStyles.overlay}>
          <View style={dynamicStyles.confirmModal}>
            <Text style={dynamicStyles.confirmTitle}>Confirmar exclusão</Text>
            <Text style={dynamicStyles.confirmMessage}>
              Tem certeza que deseja apagar esta reserva?
            </Text>
            <View style={dynamicStyles.confirmActions}>
              <TouchableOpacity
                onPress={handleCancelDelete}
                style={[
                  dynamicStyles.confirmButtonBase,
                  dynamicStyles.cancelButton,
                ]}
              >
                <Text style={dynamicStyles.confirmText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmApagar}
                style={[
                  dynamicStyles.confirmButtonBase,
                  dynamicStyles.deleteConfirmButton,
                ]}
              >
                <Text style={dynamicStyles.confirmText}>Apagar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {reservaSelecionadaParaEdicao && (
        <AtualizarReservaModal
          visible={mostrarEdicaoReserva}
          onClose={handleFecharEdicaoReserva}
          reserva={reservaSelecionadaParaEdicao}
          onUpdateSuccess={fetchCurrentReservations}
        />
      )}
    </>
  );
}

export default ReservasUsuarioModal;
