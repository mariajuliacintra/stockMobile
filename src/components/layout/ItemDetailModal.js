import React, { useState, useEffect } from "react";
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
import jwtDecode from "jwt-decode";

const ItemDetailModal = ({ isVisible, onClose, item }) => {
  const [quantityChange, setQuantityChange] = useState("");
  const [actionDescription, setActionDescription] = useState("IN");
  const [isActionPickerVisible, setActionPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [imageDataUri, setImageDataUri] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  // LOGS DE TESTE APROFUNDADO
  // Busque a imagem embutida no objeto item
useEffect(() => {
  // Log de depuração
  console.log("Modal foi renderizado com item:", item?.name);
  console.log("Modal está visível?", isVisible);
  console.log("Objeto de imagem existe?", !!item?.image);

  if (!isVisible || !item || !item.image || !item.image.data) {
      console.log("Condição para exibir imagem não foi satisfeita.");
      setImageDataUri(null);
      setImageLoading(false);
      return;
  }

  const imageData = item.image.data;
  console.log("Tipo dos dados da imagem:", typeof imageData);
  console.log("Tamanho dos dados da imagem:", imageData.length);

  if (typeof imageData === 'string' && imageData.length > 0) {
      setImageLoading(true);
      try {
          const mimeType = item.image.type || 'image/png';
          
          // Refatoração: Remove caracteres inválidos para Base64
          const base64Data = imageData.replace(/[^A-Z0-9+/=]/gi, ''); 
          
          setImageDataUri(`data:${mimeType};base64,${base64Data}`);
          console.log("URI da imagem criada com sucesso.");
      } catch (error) {
          console.error("Erro ao processar imagem embutida:", error);
          setImageDataUri(null);
      } finally {
          setImageLoading(false);
      }
  } else {
      console.log("Os dados da imagem não são uma string válida.");
      setImageDataUri(null);
      setImageLoading(false);
  }
}, [isVisible, item]);

  const handleTransaction = async () => {
    if (
      !quantityChange ||
      isNaN(quantityChange) ||
      parseFloat(quantityChange) <= 0
    ) {
      setMessage({
        type: "error",
        text: "Por favor, insira uma quantidade válida e positiva.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = await SecureStore.getItemAsync("tokenUsuario");
      if (!token) throw new Error("Token de usuário ausente.");
      const decodedToken = jwtDecode(token);
      const fkIdUser = decodedToken?.idUser;
      if (!fkIdUser) throw new Error("Usuário inválido no token.");

      const qtyNum = parseFloat(quantityChange);
      const quantityForApi =
        actionDescription === "OUT" ? -Math.abs(qtyNum) : qtyNum;
      const payload = { quantity: quantityForApi, fkIdUser, isAjust: false };

      if (!item.idItem) throw new Error("ID do item não encontrado.");

      if (Array.isArray(item.lots) && item.lots.length > 1) {
        setMessage({
          type: "error",
          text: "Este item possui mais de um lote. Selecione um lote específico ou use o endpoint de lote.",
        });
        return;
      }

      await sheets.updateLotQuantity(item.idItem, payload);
      setMessage({
        type: "success",
        text: "Quantidade do lote atualizada com sucesso!",
      });
      setQuantityChange("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message?.includes("ID")
          ? error.message
          : "Erro ao registrar a transação. Item não encontrado.",
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

          {imageLoading ? (
            <ActivityIndicator
              size="large"
              color="#600000"
              style={{ marginBottom: 15 }}
            />
          ) : imageDataUri ? (
            <Image
              source={{ uri: imageDataUri }}
              style={styles.itemImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ alignSelf: "center", marginBottom: 15 }}>
              Imagem não disponível
            </Text>
          )}

          <Text style={styles.modalText}>Descrição: {item.description}</Text>
          <Text style={styles.modalText}>
            Categoria: {item.category?.value}
          </Text>
          {item.brand && (
            <Text style={styles.modalText}>Marca: {item.brand}</Text>
          )}

          {item.technicalSpecs && Array.isArray(item.technicalSpecs) && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.modalText}>Especificações:</Text>
              {item.technicalSpecs.map((spec) => (
                <Text key={spec.idTechnicalSpec} style={styles.modalText}>
                  {spec.technicalSpecKey}: {spec.technicalSpecValue}
                </Text>
              ))}
            </View>
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

// Styles mantidos
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
    width: "90%",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "left",
    width: "100%",
  },
  itemImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
    borderRadius: 10,
    alignSelf: "center",
  },
  closeButton: {
    backgroundColor: "#600000",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
  transactionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
    width: "100%",
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
    width: "100%",
    alignItems: "center",
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