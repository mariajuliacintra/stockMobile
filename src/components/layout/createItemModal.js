import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import sheets from "../../services/axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomModal from "../mod/CustomModal";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";

// --- Constants ---
// ADIÇÃO 1: Adicionamos um uniqueId para usar como key estável no map.
const initialSpecsState = () => ({ uniqueId: Date.now() + Math.random(), id: "", value: "" });
const initialImageState = null;

// ALTERAÇÃO 1: Mover o componente para fora do componente principal.
const SpecValueInput = ({ spec, index, onSpecChange, specsList }) => {
    const specData = specsList.find((s) => s.idTechnicalSpec === spec.id);
    const placeholder = specData
      ? `Digite o valor de ${specData.technicalSpecKey}`
      : "Digite o valor";
  
    return (
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={spec.value || ""}
        onChangeText={(val) => onSpecChange(index, "value", val)}
      />
    );
};


const CreateItemModal = ({ visible, onClose, fkIdUser }) => {
  // --- Form States ---
  const [sapCode, setSapCode] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [noExpiration, setNoExpiration] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Image ---
  const [selectedImageInfo, setSelectedImageInfo] = useState(initialImageState);

  // --- Dropdowns & UI ---
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Modal Feedback ---
  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const [internalModalType, setInternalModalType] = useState("success");
  const [internalModalMessage, setInternalModalMessage] = useState("");

  // --- Camera Permission ---
  const [hasCameraPermission, setHasCameraPermission] = useState(null);

  // --- Form Validation ---
  const isFormValid = useMemo(() => {
    return (
      name.trim() !== "" &&
      minimumStock.trim() !== "" &&
      quantity.trim() !== "" &&
      selectedLocation !== "" &&
      selectedCategory !== ""
    );
  }, [name, minimumStock, quantity, selectedLocation, selectedCategory]);

  // --- Fetch Dropdowns ---
  const fetchDropdownData = useCallback(async () => {
    try {
      setLoading(true);
      const [locRes, catRes, specRes] = await Promise.all([
        sheets.getLocations(),
        sheets.getCategories(),
        sheets.getTechnicalSpecs(),
      ]);

      setLocations(locRes.data?.locations || []);
      setCategories(catRes.data?.categories || []);
      setSpecs(specRes.data?.technicalSpecs || []);
    } catch (error) {
      console.error("Erro ao carregar dropdowns:", error);
      setInternalModalType("error");
      setInternalModalMessage("Erro ao carregar dados de Local e Categoria.");
      setInternalModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) fetchDropdownData();
  }, [visible, fetchDropdownData]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    })();
  }, []);

  // --- Clear Form ---
  const clearFields = () => {
    setSapCode("");
    setName("");
    setBrand("");
    setDescription("");
    setMinimumStock("");
    setQuantity("");
    setSelectedLocation("");
    setSelectedCategory("");
    setSelectedSpecs([]);
    setExpirationDate(new Date());
    setNoExpiration(false);
    setSelectedImageInfo(initialImageState);
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  

  // --- Technical Specs ---
  const handleAddSpec = () =>
    setSelectedSpecs((prev) => [...prev, initialSpecsState()]);

  const handleSpecChange = (index, field, value) => {
    const updated = [...selectedSpecs];
    updated[index][field] = value;
    setSelectedSpecs(updated);
  };

  const validatePayload = () => {
    if (!isFormValid) {
      return "Por favor, preencha os campos obrigatórios (Nome, Estoque Mínimo, Quantidade, Local e Categoria).";
    }

    if (noExpiration === false && expirationDate < new Date()) {
      return "A data de validade não pode ser no passado.";
    }

    const hasDuplicateSpecs = selectedSpecs.some(
      (spec, index, arr) =>
        spec.id && arr.findIndex((s) => s.id === spec.id) !== index
    );
    if (hasDuplicateSpecs)
      return "Você selecionou a mesma especificação técnica mais de uma vez.";

    const hasIncompleteSpec = selectedSpecs.some(
      (spec) => spec.id && !spec.value.trim()
    );
    if (hasIncompleteSpec)
      return "Todas as especificações técnicas selecionadas devem ter um valor preenchido.";

    return null;
  };

  // --- Image Picker & Camera ---
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setInternalModalType("error");
      setInternalModalMessage("Permissão para acessar a galeria foi negada.");
      setInternalModalVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = uri.split("/").pop();
      const fileType = asset.mimeType || "image/jpeg";

      setSelectedImageInfo({ uri, name: fileName, type: fileType });
    }
  };

  const handleTakePhoto = async () => {
    if (hasCameraPermission === false) {
      setInternalModalType("error");
      setInternalModalMessage("Permissão para acessar a câmera foi negada.");
      setInternalModalVisible(true);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = uri.split("/").pop();
      const fileType = asset.mimeType || "image/jpeg";

      setSelectedImageInfo({ uri, name: fileName, type: fileType });
    }
  };

  // --- Create Item ---
  const handleCreateItem = async () => {
    setLoading(true);
    const validationError = validatePayload();
    if (validationError) {
      setLoading(false);
      setInternalModalType("error");
      setInternalModalMessage(validationError);
      setInternalModalVisible(true);
      return;
    }

    const specsObject = selectedSpecs.reduce((acc, spec) => {
      if (spec.id && spec.value.trim()) acc[spec.id] = spec.value;
      return acc;
    }, {});

    const createItemPayload = {
      sapCode,
      name,
      brand,
      description,
      technicalSpecs: specsObject,
      minimumStock: Number(minimumStock),
      fkIdCategory: Number(selectedCategory),
      quantity: Number(quantity),
      expirationDate: noExpiration
        ? null
        : expirationDate.toISOString().split("T")[0],
      fkIdLocation: Number(selectedLocation),
      fkIdUser: Number(fkIdUser),
    };

    let idItem = null;

    try {
      const creationResponse = await sheets.createItem(createItemPayload);
      const responseDataArray = creationResponse.data?.data;
      if (Array.isArray(responseDataArray) && responseDataArray.length > 0) {
        idItem = responseDataArray[0].itemId;
      }
      if (!idItem) throw new Error("ID do item não retornado.");

      if (selectedImageInfo) {
        await sheets.uploadItemImage(idItem, selectedImageInfo.uri);
      }

      setInternalModalType("success");
      setInternalModalMessage("Item e imagem cadastrados com sucesso!");
      setInternalModalVisible(true);
      clearFields();
    } catch (error) {
      console.error(
        "Erro no cadastro ou upload:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.error ||
        `Erro ao cadastrar o item (ID: ${idItem || "N/A"}). Tente novamente.`;

      setInternalModalType("error");
      setInternalModalMessage(errorMessage);
      setInternalModalVisible(true);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Cadastrar Novo Item</Text>
              <TouchableOpacity onPress={handleClose} disabled={loading}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image */}
              <Text style={styles.label}>Imagem do Item</Text>
              {selectedImageInfo ? (
                <Image
                  source={{ uri: selectedImageInfo.uri }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={{ color: "#777" }}>
                    Nenhuma imagem selecionada
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handlePickImage}
              >
                <Text style={styles.imageButtonText}>
                  {selectedImageInfo ? "Trocar Imagem" : "Selecionar Imagem"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.imageButton, { backgroundColor: "#28a745" }]}
                onPress={handleTakePhoto}
              >
                <Text style={styles.imageButtonText}>Tirar Foto</Text>
              </TouchableOpacity>

              {/* Inputs */}
              <TextInput
                style={styles.input}
                placeholder="Código SAP (opcional)"
                value={sapCode}
                onChangeText={setSapCode}
              />
              <TextInput
                style={styles.input}
                placeholder="Nome *"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Marca (opcional)"
                value={brand}
                onChangeText={setBrand}
              />
              <TextInput
                style={styles.input}
                placeholder="Descrição (opcional)"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Estoque Mínimo *"
                keyboardType="numeric"
                value={minimumStock}
                onChangeText={setMinimumStock}
              />
              <TextInput
                style={styles.input}
                placeholder="Quantidade Inicial *"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />

              {/* Location & Category */}
              <Text style={styles.label}>Local *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <Picker.Item label="Selecione um local" value="" />
                  {locations.map((loc) => (
                    <Picker.Item
                      key={loc.idLocation}
                      label={`${loc.place} - ${loc.code}`}
                      value={loc.idLocation}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Categoria *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <Picker.Item label="Selecione uma categoria" value="" />
                  {categories.map((cat) => (
                    <Picker.Item
                      key={cat.idCategory}
                      label={cat.categoryValue}
                      value={cat.idCategory}
                    />
                  ))}
                </Picker>
              </View>

              {/* Technical Specs */}
              <Text style={styles.label}>Especificações Técnicas</Text>
              {selectedSpecs.map((spec, index) => (
                // ALTERAÇÃO 2: Usar o `uniqueId` como key
                <View key={spec.uniqueId} style={styles.specGroup}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={spec.id}
                      onValueChange={(val) =>
                        handleSpecChange(index, "id", val)
                      }
                    >
                      <Picker.Item
                        label="Selecione uma especificação"
                        value=""
                      />
                      {specs.map((s) => (
                        <Picker.Item
                          key={s.idTechnicalSpec}
                          label={s.technicalSpecKey}
                          value={s.idTechnicalSpec}
                        />
                      ))}
                    </Picker>
                  </View>
                  {spec.id !== "" && (
                     // Passando as props necessárias
                    <SpecValueInput 
                      spec={spec} 
                      index={index} 
                      onSpecChange={handleSpecChange}
                      specsList={specs}
                    />
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.addSpecButton}
                onPress={handleAddSpec}
              >
                <Text style={styles.addSpecButtonText}>
                  + Adicionar Especificação
                </Text>
              </TouchableOpacity>

              {/* Expiration */}
              <View style={styles.validityRow}>
                <Text style={styles.label}>Sem Validade</Text>
                <Switch value={noExpiration} onValueChange={setNoExpiration} />
              </View>

              {!noExpiration && (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={styles.dateText}
                  >{`Validade: ${expirationDate.toLocaleDateString()}`}</Text>
                </TouchableOpacity>
              )}

              {showDatePicker && !noExpiration && (
                <DateTimePicker
                  value={expirationDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setExpirationDate(selectedDate);
                  }}
                />
              )}

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !isFormValid && styles.saveButtonDisabled,
                ]}
                onPress={handleCreateItem}
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar Item</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <CustomModal
        open={internalModalVisible}
        onClose={() => {
          setInternalModalVisible(false);
          if (internalModalType === "success") onClose();
        }}
        title={internalModalType === "success" ? "Sucesso" : "Erro"}
        message={internalModalMessage}
        type={internalModalType}
      />
    </>
  );
};


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  label: { fontWeight: "bold", marginBottom: 4, marginTop: 10, color: "#333" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  specGroup: { marginBottom: 10 },
  validityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 5,
    paddingRight: 5,
  },
  dateButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  dateText: { color: "#333", fontWeight: "600" },
  saveButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonDisabled: { backgroundColor: "#99caff" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  addSpecButton: { marginBottom: 10, padding: 6, alignItems: "flex-start" },
  addSpecButtonText: {
    color: "#007bff",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  imagePlaceholder: {
    height: 160,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  imageButtonText: { color: "#fff", fontWeight: "bold" },
});

export default CreateItemModal;