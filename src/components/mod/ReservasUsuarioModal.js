import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";

const ReservasUsuarioModal = ({
  visible,
  onClose,
  onApagarReserva,
  onHistorico,
  onDeletadas,
  reservas = [],
  onSelecionar,
}) => {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState(null);

  const handleEditarReserva = (reserva) => {
    onSelecionar(reserva);
    onClose();
  };

  const handleDeletarReserva = (reserva) => {
    setReservaToDelete(reserva); // Armazena o objeto reserva completo
    setConfirmDeleteOpen(true);
  };

  const handleConfirmApagar = () => {
    if (reservaToDelete) {
      onApagarReserva(reservaToDelete); // Passa o objeto reserva completo
    }
    setConfirmDeleteOpen(false);
    setReservaToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setReservaToDelete(null);
  };

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.modalTitle}>Minhas Reservas</Text>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close" size={24} color="red" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={[
                reservas.length > 5 && { height: 250 }, // altura fixa se mais de 5 reservas
              ]}
            >
              {reservas.length > 0 ? (
                reservas.map((reserva) => (
                  <View key={reserva.id_reserva} style={styles.itemReserva}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text>
                        {reserva.sala} - {reserva.data}
                      </Text>
                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          onPress={() => handleEditarReserva(reserva)}
                        >
                          <FontAwesome name="pencil" size={24} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeletarReserva(reserva)}
                          style={{ marginLeft: 15 }}
                        >
                          <AntDesign name="delete" size={24} color="black" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noReserva}>Nenhuma reserva encontrada</Text>
              )}
            </ScrollView>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                onPress={onHistorico}
                style={styles.historicoButton}
              >
                <Text style={styles.fecharText}>HISTÓRICO</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onDeletadas}
                style={styles.deletadasButton}
              >
                <Text style={styles.fecharText}>DELETADAS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmDeleteOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Confirmar exclusão</Text>
            <Text style={styles.confirmMessage}>
              Tem certeza que deseja apagar esta reserva?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                onPress={handleCancelDelete}
                style={styles.cancelarButton}
              >
                <Text style={styles.confirmar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmApagar}
                style={styles.deleteButton}
              >
                <Text style={styles.confirmar}>Apagar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: "80%",
    maxHeight: "70%",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemReserva: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  fecharButton: {
    backgroundColor: "#b11010",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  historicoButton: {
    backgroundColor: "#801515",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  deletadasButton: {
    backgroundColor: "#801515",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  fecharText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 15,
  },
  noReserva: {
    textAlign: "center",
    marginVertical: 10,
    color: "gray",
  },
  // Modal de confirmação
  confirmModal: {
    backgroundColor: "white",
    padding: 20,
    width: "75%",
    borderRadius: 10,
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  confirmMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelarButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#b11010",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  confirmar: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ReservasUsuarioModal;
