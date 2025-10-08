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
  Alert, // Adicionado para validação
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import sheets from "../../services/axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomModal from "../mod/CustomModal";

// --- Hooks/Constants ---

const initialSpecsState = { id: "", value: "" };

const CreateItemModal = ({ visible, onClose, fkIdUser }) => {
  // --- Estados do Formulário ---
  const [sapCode, setSapCode] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState([]); // array de specs {id, value}
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [noExpiration, setNoExpiration] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Estados de Dropdown e UI ---
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Estados do Modal de Feedback (CustomModal) ---
  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const [internalModalType, setInternalModalType] = useState("success");
  const [internalModalMessage, setInternalModalMessage] = useState("");

  // Memo para checar se o formulário está preenchido (melhora a UX do botão)
  const isFormValid = useMemo(() => {
    return (
      name.trim() !== "" &&
      minimumStock.trim() !== "" &&
      quantity.trim() !== "" &&
      selectedLocation !== "" &&
      selectedCategory !== ""
    );
  }, [name, minimumStock, quantity, selectedLocation, selectedCategory]);

  // --- Funções de Lógica ---

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
      // Feedback amigável para o usuário
      setInternalModalType("error");
      setInternalModalMessage("Erro ao carregar dados de Local e Categoria.");
      setInternalModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchDropdownData();
    }
  }, [visible, fetchDropdownData]);

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
  };

  const handleClose = () => {
    clearFields();
    onClose();
  };

  // Funções de manipulação de Especificações
  const handleAddSpec = () => {
    setSelectedSpecs((prev) => [...prev, initialSpecsState]);
  };

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

    const hasDuplicateSpecs = selectedSpecs.some((spec, index, arr) => 
        spec.id && arr.findIndex(s => s.id === spec.id) !== index
    );

    if (hasDuplicateSpecs) {
        return "Você selecionou a mesma especificação técnica mais de uma vez.";
    }

    return null; // Nulo significa que a validação passou
  }

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

    try {
      const payload = {
        sapCode,
        name,
        brand,
        description,
        minimumStock: Number(minimumStock),
        fkIdCategory: Number(selectedCategory),
        quantity: Number(quantity),
        // Se Sem Validade for true, envia null. Senão, formata a data
        expirationDate: noExpiration
          ? null
          : expirationDate.toISOString().split("T")[0],
        fkIdLocation: Number(selectedLocation),
        fkIdUser: Number(fkIdUser),
        // Reduz o array de specs para o formato de objeto {id: value}
        technicalSpecs: selectedSpecs.reduce((acc, spec) => {
          if (spec.id && spec.value.trim()) acc[spec.id] = spec.value;
          return acc;
        }, {}),
      };

      await sheets.createItem(payload);

      setInternalModalType("success");
      setInternalModalMessage("Item cadastrado com sucesso!");
      setInternalModalVisible(true); // Exibe o feedback de sucesso

      clearFields();
      // Não chama onClose() aqui para manter o modal de cadastro aberto até o usuário fechar o CustomModal
    } catch (error) {
      console.error("Erro ao cadastrar item:", error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.error || "Erro ao cadastrar o item. Tente novamente.";

      setInternalModalType("error");
      setInternalModalMessage(errorMessage);
      setInternalModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // --- Renderização ---

  // Componente de entrada para o valor da especificação
  const SpecValueInput = ({ spec, index, handleSpecChange }) => {
    const specData = specs.find((s) => s.idTechnicalSpec === spec.id);
    const placeholder = specData
      ? `Digite o valor de ${specData.technicalSpecKey}`
      : "Digite o valor";

    return (
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={spec.value}
        onChangeText={(val) => handleSpecChange(index, "value", val)}
      />
    );
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
              {/* Campos de Input */}
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

              {/* Picker Local */}
              <Text style={styles.label}>Local *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedLocation}
                  onValueChange={(itemValue) => setSelectedLocation(itemValue)}
                  style={styles.picker}
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

              {/* Picker Categoria */}
              <Text style={styles.label}>Categoria *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                  style={styles.picker}
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

              {/* Especificações Técnicas */}
              <Text style={styles.label}>Especificações Técnicas</Text>
              {selectedSpecs.map((spec, index) => (
                <View key={index} style={styles.specGroup}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={spec.id}
                      onValueChange={(val) => handleSpecChange(index, "id", val)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Selecione uma especificação" value="" />
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
                    <SpecValueInput
                      spec={spec}
                      index={index}
                      handleSpecChange={handleSpecChange}
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

              {/* Validade */}
              <View style={styles.validityRow}>
                <Text style={styles.label}>Sem Validade</Text>
                <Switch value={noExpiration} onValueChange={setNoExpiration} />
              </View>

              {!noExpiration && (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {`Validade: ${expirationDate.toLocaleDateString()}`}
                  </Text>
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

              {/* Botão de Salvar */}
              <TouchableOpacity
                style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
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

      {/* Modal de Feedback (Sucesso/Erro) - Fora do Modal de Cadastro */}
      <CustomModal
        open={internalModalVisible}
        onClose={() => {
          setInternalModalVisible(false);
          // Fecha o modal de cadastro APÓS o usuário fechar o feedback de sucesso.
          if (internalModalType === "success") {
            onClose();
          }
        }}
        title={internalModalType === "success" ? "Sucesso" : "Erro"}
        message={internalModalMessage}
        type={internalModalType}
      />
    </>
  );
};

// --- Estilos ---
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
    overflow: "hidden", // Para garantir que o Picker respeite o borderRadius
  },
  picker: {
    // Estilos específicos para o Picker, se necessário
  },
  specGroup: {
    marginBottom: 10,
  },
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
  saveButtonDisabled: {
    backgroundColor: "#99caff", // Cor mais clara para indicar desabilitado
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  addSpecButton: {
    marginBottom: 10,
    padding: 6,
    alignItems: "flex-start",
  },
  addSpecButtonText: {
    color: "#007bff",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default CreateItemModal;