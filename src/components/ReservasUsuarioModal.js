import React, {useState} from "react";
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
  onEditarReserva,
  reservas = [],
  onSelecionar,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalEdicaoVisible, setModalEdicaoVisible] = useState(false);
    const [reservaSelecionada, setReservaSelecionada] = useState(null);
    const [listaDeReservas, setListaDeReservas] = useState([]);
  
    const handleEditarReserva = (reserva) => {
      setModalVisible(false); // Fecha o modal de reservas
      setReservaSelecionada(reserva); // Define a reserva selecionada
      setModalEdicaoVisible(true); // Abre o modal de edição
    };
  
    const handleFecharModalEdicao = () => {
      setModalEdicaoVisible(false);
      setReservaSelecionada(null);
    };
  
  if (typeof onEditarReserva === 'function') {
    onEditarReserva(reserva);
  } else {
    console.log('onEditarReserva não está definido'); 
  }


  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Minhas Reservas</Text>
          <ScrollView style={styles.scrollView}>
            {reservas.length > 0 ? (
              reservas.map((reserva) => (
                <View
                  key={reserva.id_reserva}
                  style={styles.itemReserva}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text>
                      {reserva.sala} - {reserva.data}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <FontAwesome
                        name="pencil"
                        size={24}
                        color="black"
                        style={{ marginLeft: 15 }}
                        onPress={() => {
                          onClose(); // Fecha o modal atual
                          onEditarReserva={handleEditarReserva}; // Abre o modal de atualização com os dados da reserva
                        }}
                      />
                      <AntDesign
                        name="delete"
                        size={24}
                        color="red"
                        style={{ marginLeft: 15 }}
                        onPress={() => onApagarReserva(reserva.id_reserva)}
                      />
                    </View>
                  </View>
                </View>
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
