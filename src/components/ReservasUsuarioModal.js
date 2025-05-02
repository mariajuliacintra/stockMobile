import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

const ReservasUsuarioModal = ({ visible, onClose, reservas = [], onSelecionar }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Minhas Reservas</Text>
          <ScrollView style={styles.scrollView}>
            {reservas.length > 0 ? (
              reservas.map((reserva) => (
                <TouchableOpacity
                  key={reserva.id_reserva}
                  style={styles.itemReserva}
                  onPress={() => onSelecionar(reserva.id)}
                >
                  <Text>{reserva.sala} - {reserva.data}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noReserva}>Nenhuma reserva encontrada</Text>
            )}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.fecharButton}>
            <Text style={styles.fecharText}>Fechar</Text>
          </TouchableOpacity>
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
  scrollView: {
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
  },
  fecharText: {
    color: "white",
    fontWeight: "bold",
  },
  noReserva: {
    textAlign: "center",
    marginVertical: 10,
    color: "gray",
  },
});

export default ReservasUsuarioModal;
