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
import AntDesign from "react-native-vector-icons/AntDesign";
import sheets from "../../services/axios";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import CustomModal from "../mod/CustomModal";

const ItemDetailModal = ({ isVisible, onClose, item }) => {
  const [detailedItem, setDetailedItem] = useState(null);
  const [quantityChange, setQuantityChange] = useState("");
  const [actionDescription, setActionDescription] = useState("IN");
  const [isActionPickerVisible, setActionPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customModalTitle, setCustomModalTitle] = useState("");
  const [customModalMessage, setCustomModalMessage] = useState("");
  const [customModalType, setCustomModalType] = useState("info");

  const [isManager, setIsManager] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);

  const showCustomModal = (title, message, type = "info") => {
    setCustomModalTitle(title);
    setCustomModalMessage(message);
    setCustomModalType(type);
    setCustomModalVisible(true);
  };

  const onDismissCustomModal = () => setCustomModalVisible(false);

  useEffect(() => {
    if (isVisible) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(status === "granted");
      })();
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      setSelectedImage(null);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !item?.idItem) return;

    const fetchItemDetails = async () => {
      setFetching(true);
      setDetailedItem(null);
      try {
        const response = await sheets.getItemByIdDetails(item.idItem);
        if (response.data?.success && response.data?.item?.length > 0) {
          setDetailedItem(response.data.item[0]);
        } else {
          showCustomModal("Erro", "Não foi possível carregar os detalhes.", "error");
        }
      } catch {
        showCustomModal("Erro", "Falha ao carregar os detalhes.", "error");
      } finally {
        setFetching(false);
      }
    };

    fetchItemDetails();
  }, [isVisible, item]);

  useEffect(() => {
    (async () => {
      const role = await SecureStore.getItemAsync("userRole");
      if (role === "manager") setIsManager(true);
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (hasCameraPermission === false) {
      showCustomModal("Erro", "Permissão da câmera negada.", "error");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) {
      showCustomModal("Erro", "Selecione ou tire uma foto primeiro!", "error");
      return;
    }

    try {
      setUploadingImage(true);

      const response = await sheets.uploadItemImage(
        detailedItem.idItem,
        selectedImage
      );

      if (response.data?.success) {
        showCustomModal("Sucesso", "Imagem atualizada!", "success");

        const refreshed = await sheets.getItemByIdDetails(detailedItem.idItem);
        if (refreshed.data?.item?.length > 0) {
          setDetailedItem(refreshed.data.item[0]);
        }

        setSelectedImage(null);
      } else {
        showCustomModal("Erro", "Falha ao enviar imagem.", "error");
      }
    } catch {
      showCustomModal("Erro", "Erro ao enviar imagem.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    onClose();
  };

  const handleTransaction = async () => {
    if (!quantityChange || isNaN(quantityChange) || parseFloat(quantityChange) <= 0) {
      showCustomModal("Erro", "Quantidade inválida.", "error");
      return;
    }

    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync("tokenUsuario");
      const decoded = jwtDecode(token);
      const fkIdUser = decoded?.idUser;

      const qtyNum = parseFloat(quantityChange);
      const idLot =
        detailedItem?.lots?.[0]?.idLot ||
        detailedItem?.idLot ||
        detailedItem?.lot?.idLot;

      let payload;
      if (actionDescription === "IN")
        payload = { quantity: qtyNum, fkIdUser, isAjust: false };
      if (actionDescription === "OUT")
        payload = { quantity: -Math.abs(qtyNum), fkIdUser, isAjust: false };
      if (actionDescription === "ADJUST")
        payload = { quantity: qtyNum, fkIdUser, isAjust: true };

      const response = await sheets.updateLotQuantity(idLot, payload);

      if (response.data?.success) {
        showCustomModal("Sucesso", "Ação registrada!", "success");
        setQuantityChange("");
        handleClose();
      } else {
        showCustomModal("Erro", "Falha ao registrar ação.", "error");
      }
    } catch {
      showCustomModal("Erro", "Erro ao registrar ação.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!detailedItem?.idItem) return;
    setLoading(true);

    try {
      const response = await sheets.deleteItem(detailedItem.idItem);

      if (response.data?.success) {
        showCustomModal("Sucesso", "Item deletado!", "success");
        handleClose();
      } else {
        showCustomModal("Erro", "Falha ao deletar item.", "error");
      }
    } catch {
      showCustomModal("Erro", "Erro ao deletar item.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal animationType="slide" transparent visible={isVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {fetching ? (
              <ActivityIndicator size="large" color="#600000" />
            ) : detailedItem ? (
              <>
                <TouchableOpacity style={styles.closeIcon} onPress={handleClose}>
                  <AntDesign name="close" size={24} color="#600000" />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>{detailedItem.name}</Text>

                {detailedItem.image ? (
                  <Image
                    source={{
                      uri: `data:${detailedItem.image.type};base64,${detailedItem.image.data}`,
                    }}
                    style={styles.itemImage}
                  />
                ) : (
                  <Text>Item sem imagem</Text>
                )}

                {selectedImage && (
                  <Image
                    source={{ uri: selectedImage }}
                    style={[styles.itemImage, { borderWidth: 2, borderColor: "#600000" }]}
                  />
                )}

                <TouchableOpacity onPress={pickImage}>
                  <Text style={styles.redText}>Trocar imagem (galeria)</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={takePhoto}>
                  <Text style={styles.redText}>Tirar foto</Text>
                </TouchableOpacity>

                {selectedImage && (
                  <TouchableOpacity
                    style={[styles.imageButton, { backgroundColor: "#228B22" }]}
                    onPress={handleUploadImage}
                  >
                    {uploadingImage ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Salvar Imagem</Text>
                    )}
                  </TouchableOpacity>
                )}

                <Text style={styles.modalText}>Descrição: {detailedItem.description}</Text>
                <Text style={styles.modalText}>
                  Categoria: {detailedItem.category?.value}
                </Text>
                <Text style={styles.modalText}>
                  Quantidade disponível: {detailedItem.totalQuantity}
                </Text>

                <View style={styles.transactionContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setActionPickerVisible(true)}
                  >
                    <Text style={styles.actionButtonText}>
                      {actionDescription === "IN"
                        ? "Entrada"
                        : actionDescription === "OUT"
                        ? "Saída"
                        : "Ajuste"}
                    </Text>
                    <Ionicons name="caret-down-outline" size={20} color="#fff" />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.quantityInput}
                    placeholder="Quantidade"
                    keyboardType="numeric"
                    value={quantityChange}
                    onChangeText={setQuantityChange}
                  />
                </View>

                <TouchableOpacity style={styles.transactButton} onPress={handleTransaction}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirmar Ação</Text>}
                </TouchableOpacity>

                {isManager && (
                  <TouchableOpacity
                    style={[styles.transactButton, { backgroundColor: "#600000" }]}
                    onPress={handleDeleteItem}
                  >
                    <Text style={styles.buttonText}>Deletar Item</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text>Item não encontrado</Text>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomModal
        open={customModalVisible}
        onClose={onDismissCustomModal}
        title={customModalTitle}
        message={customModalMessage}
        type={customModalType}
      />
    </>
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
    width: "90%",
    alignItems: "center",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  modalText: { fontSize: 16, marginBottom: 8, width: "100%" },
  itemImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
    borderRadius: 10,
  },
  redText: {
    color: "#600000",
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginBottom: 5,
  },
  imageButton: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#600000",
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  transactionContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 15,
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: "#600000",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  actionButtonText: { color: "#fff", fontWeight: "bold" },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 8,
  },
  transactButton: {
    backgroundColor: "#600000",
    width: "100%",
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
});

export default ItemDetailModal;
