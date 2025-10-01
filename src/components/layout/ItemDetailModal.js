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
  const [detailedItem, setDetailedItem] = useState(null);
  const [quantityChange, setQuantityChange] = useState("");
  const [actionDescription, setActionDescription] = useState("IN");
  const [isActionPickerVisible, setActionPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isVisible || !item?.idItem) return;

    const fetchItemDetails = async () => {
      setFetching(true);
      setDetailedItem(null);
      setMessage(null);
      try {
        console.log("Modal aberto. Buscando detalhes do item ID:", item.idItem);
        const response = await sheets.getItemByIdDetails(item.idItem);
        console.log("Resposta da API getItemByIdDetails:", response.data);

        if (response.data?.success && response.data?.item?.length > 0) {
          setDetailedItem(response.data.item[0]);
        } else {
          setMessage({ type: "error", text: "Não foi possível carregar os detalhes do item." });
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do item:", error);
        setMessage({ type: "error", text: "Erro ao buscar detalhes do item." });
      } finally {
        setFetching(false);
      }
    };

    fetchItemDetails();
  }, [isVisible, item]);

  const handleTransaction = async () => {
    if (!quantityChange || isNaN(quantityChange) || parseFloat(quantityChange) <= 0) {
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
      const quantityForApi = actionDescription === "OUT" ? -Math.abs(qtyNum) : qtyNum;
      const payload = { quantity: quantityForApi, fkIdUser, isAjust: false };

      const idItem = detailedItem?.idItem;
      if (!idItem) {
        setMessage({ type: "error", text: "ID do item não encontrado." });
        return;
      }

      if (Array.isArray(detailedItem.lots) && detailedItem.lots.length > 1) {
        setMessage({
          type: "error",
          text: "Este item possui mais de um lote. Selecione um lote específico ou use o endpoint de lote.",
        });
        return;
      }

      await sheets.updateLotQuantity(idItem, payload);
      setMessage({ type: "success", text: "Quantidade do lote atualizada com sucesso!" });
      setQuantityChange("");
    } catch (error) {
      console.error("Erro ao registrar a transação:", error);
      setMessage({
        type: "error",
        text: error?.message || "Erro ao registrar a transação.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {fetching ? (
            <ActivityIndicator size="large" color="#600000" style={{ margin: 20 }} />
          ) : detailedItem ? (
            <>
              <Text style={styles.modalTitle}>{detailedItem.name}</Text>

              {detailedItem.image ? (
                <Image
                  source={{ uri: `data:${detailedItem.image.type};base64,${detailedItem.image.data}` }}
                  style={styles.itemImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ alignSelf: "center", marginBottom: 15 }}>Imagem não disponível</Text>
              )}

              <Text style={styles.modalText}>Descrição: {detailedItem.description}</Text>
              <Text style={styles.modalText}>Categoria: {detailedItem.category?.value}</Text>
              {detailedItem.brand && <Text style={styles.modalText}>Marca: {detailedItem.brand}</Text>}

              {/* Aqui mostramos a quantidade total */}
              <Text style={styles.modalText}>
                Quantidade disponível: {detailedItem.totalQuantity}
              </Text>

              {detailedItem.technicalSpecs?.length > 0 && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={styles.modalText}>Especificações:</Text>
                  {detailedItem.technicalSpecs.map((spec) => (
                    <Text key={spec.idTechnicalSpec} style={styles.modalText}>
                      • {spec.technicalSpecKey}: {spec.technicalSpecValue}
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
            </>
          ) : (
            <Text style={{ margin: 20, textAlign: "center" }}>Item não encontrado</Text>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de escolha de ação */}
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
  centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalView: { margin: 20, backgroundColor: "white", borderRadius: 20, padding: 35, alignItems: "flex-start", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: "90%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  modalText: { fontSize: 16, marginBottom: 8, textAlign: "left", width: "100%" },
  itemImage: { width: 150, height: 150, marginBottom: 15, borderRadius: 10, alignSelf: "center" },
  closeButton: { backgroundColor: "#600000", borderRadius: 20, padding: 10, elevation: 2, marginTop: 15, width: "100%", alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
  transactionContainer: { flexDirection: "row", alignItems: "center", marginTop: 15, marginBottom: 10, width: "100%" },
  actionButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#600000", borderRadius: 8, padding: 10, marginRight: 10 },
  actionButtonText: { color: "#fff", fontWeight: "bold", marginRight: 5 },
  quantityInput: { flex: 1, height: 40, borderColor: "#ccc", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10 },
  transactButton: { backgroundColor: "#600000", borderRadius: 20, padding: 10, elevation: 2, marginTop: 15, width: "100%", alignItems: "center" },
  messageText: { textAlign: "center", marginTop: 10, fontWeight: "bold" },
  pickerModalView: { margin: 50, backgroundColor: "white", borderRadius: 10, padding: 20, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  pickerOption: { padding: 15, width: "100%", alignItems: "center" },
  pickerOptionText: { fontSize: 16, fontWeight: "bold" },
});

export default ItemDetailModal;
