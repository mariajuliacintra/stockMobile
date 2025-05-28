import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

// Função para formatar a data e hora (já está perfeita!)
const formatarDataHora = (dataString) => {
  const dataObj = new Date(dataString);
  if (isNaN(dataObj.getTime())) {
    return {
      data: "Data inválida",
      hora: "",
    };
  }

  return {
    data: dataObj.toLocaleDateString("pt-BR"),
    hora: dataObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
// NOVO: Adicione 'salas' como uma prop
const HistoricoReservasModal = ({ visible, onClose, reservas = [], salas = []}) => {

  // Função auxiliar para encontrar o nome da sala pelo ID
  const getNomeSala = (idSala) => {
    const salaEncontrada = salas.find(sala => sala.id_sala === idSala); // Assumindo que o objeto sala tem 'id_sala' e 'nome'
    return salaEncontrada ? salaEncontrada.nome : "Sala Desconhecida"; // Assumindo que o nome da sala está na propriedade 'nome'
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.modalTitle}>Histórico de Reservas</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="red" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {reservas.length > 0 ? (
              reservas.map((reserva, index) => {
                const { data} = formatarDataHora(reserva.data);
                const nomeDaSala = getNomeSala(reserva.fk_id_sala); // Use a função auxiliar para obter o nome
                const key = reserva.id_log || reserva.data_hora_log || `${reserva.id_reserva}-${index}`;
                return (
                  <View key={key} style={styles.itemReserva}>
                    <Text>
                      {nomeDaSala} - {data} 
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noReserva}>Nenhuma reserva encontrada</Text>
            )}
          </ScrollView>
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
  // Modal de confirmação (esses estilos não são usados neste modal, mas estão OK aqui)
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

export default HistoricoReservasModal;