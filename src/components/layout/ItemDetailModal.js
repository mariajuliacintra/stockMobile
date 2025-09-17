import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import sheets from "../../services/axios";
import * as SecureStore from "expo-secure-store";
import * as jwtDecode from "jwt-decode";

const ItemDetailModal = ({ isVisible, onClose, item }) => {
  const [quantityChange, setQuantityChange] = useState("");
  const [actionDescription, setActionDescription] = useState("IN");
  const [isActionPickerVisible, setActionPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleTransaction = async () => {
    if (
      !quantityChange ||
      isNaN(quantityChange) ||
      parseFloat(quantityChange) <= 0
    ) {
      setMessage({
        type: "error",
        text: "Por favor, insira uma quantidade válida.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const token = await SecureStore.getItemAsync("tokenUsuario");
      const decodedToken = jwtDecode.default(token);
      const fkIdUser = decodedToken.idUser;

      const payload = {
        fkIdUser,
        fkIdItem: item.idItem,
        actionDescription,
        quantityChange: parseFloat(quantityChange),
      };

      await sheets.addTransaction(payload);
      setMessage({
        type: "success",
        text: "Transação registrada com sucesso!",
      });
      setQuantityChange("");
    } catch (error) {
      console.error("Erro ao registrar a transação:", error);
      setMessage({
        type: "error",
        text: "Erro ao registrar a transação. Verifique suas permissões e a quantidade.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{item.name}</Text>

          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              resizeMode="contain"
            />
          )}

          <Text style={styles.modalText}>Descrição: {item.description}</Text>
          <Text style={styles.modalText}>
            Categoria: {item.category?.value}
          </Text>
          {item.brand && (
            <Text style={styles.modalText}>Marca: {item.brand}</Text>
          )}

          {/* Renderiza technicalSpecs corretamente */}
          {item.technicalSpecs && Array.isArray(item.technicalSpecs) && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.modalText}>Especificações:</Text>
              {item.technicalSpecs.map((spec) => (
                <Text key={spec.idTechnicalSpec} style={styles.modalText}>
                  • {spec.technicalSpecKey}: {spec.technicalSpecValue}
                </Text>
              ))}
            </View>
          )}

          {item.aliases && (
            <Text style={styles.modalText}>Aliases: {item.aliases}</Text>
          )}
          {item.batchCode && (
            <Text style={styles.modalText}>
              Código do Lote: {item.batchCode}
            </Text>
          )}
          {item.lotNumber && (
            <Text style={styles.modalText}>
              Número do Lote: {item.lotNumber}
            </Text>
          )}
          {item.expirationDate && (
            <Text style={styles.modalText}>
              Data de Vencimento: {item.expirationDate}
            </Text>
          )}
          {item.quantity && (
            <Text style={styles.modalText}>
              Quantidade em Estoque: {item.quantity}
            </Text>
          )}

          <View style={styles.transactionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setActionPickerVisible(true)}
            >
              <Text style={styles.actionButtonText}>
                {actionDescription === "IN" ? "Entrada" : "Saída"}
              </Text>
              <Ionicons name="caret-down-outline" size={20} color="#fff" />
            </TouchableOpacity>

            <TextInput
              style={styles.quantityInput}
              placeholder="Quantidade"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={quantityChange}
              onChangeText={setQuantityChange}
            />
          </View>

          <TouchableOpacity
            style={styles.transactButton}
            onPress={handleTransaction}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrar Transação</Text>
            )}
          </TouchableOpacity>

          {message && (
            <Text
              style={[
                styles.messageText,
                { color: message.type === "success" ? "green" : "red" },
              ]}
            >
              {message.text}
            </Text>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        {/* Modal interno para selecionar ação IN/OUT */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isActionPickerVisible}
          onRequestClose={() => setActionPickerVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.pickerModalView}>
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={() => {
                  setActionDescription("IN");
                  setActionPickerVisible(false);
                }}
              >
                <Text style={styles.pickerOptionText}>Entrada</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={() => {
                  setActionDescription("OUT");
                  setActionPickerVisible(false);
                }}
              >
                <Text style={styles.pickerOptionText}>Saída</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "left",
    width: "100%",
  },
  itemImage: { width: 150, height: 150, marginBottom: 15, borderRadius: 10 },
  closeButton: {
    backgroundColor: "#600000",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
  transactionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#600000",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  actionButtonText: { color: "#fff", fontWeight: "bold", marginRight: 5 },
  quantityInput: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  transactButton: {
    backgroundColor: "#600000",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  messageText: { textAlign: "center", marginTop: 10, fontWeight: "bold" },
  pickerModalView: {
    margin: 50,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerOption: { padding: 15, width: "100%", alignItems: "center" },
  pickerOptionText: { fontSize: 16, fontWeight: "bold" },
});

export default ItemDetailModal;
