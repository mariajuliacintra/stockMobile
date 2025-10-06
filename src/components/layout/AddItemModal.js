import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import sheets from "../../services/axios";

function AddItemModal({ isVisible, onClose, onItemAdded }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // Buscar categorias ao abrir modal
  useEffect(() => {
    if (isVisible) fetchCategorias();
  }, [isVisible]);

  const fetchCategorias = async () => {
    setLoadingCategorias(true);
    try {
      const response = await sheets.getCategorias();
      if (response.data && Array.isArray(response.data)) {
        setCategorias(response.data);
      } else {
        console.error("Formato inesperado de categorias:", response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const handleAddItem = async () => {
    if (!name.trim() || !description.trim() || !categoryId) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const body = { name, description, idCategory: categoryId };
      const response = await sheets.addItem(body);
      if (response.data && response.data.success) {
        Alert.alert("Sucesso", "Item adicionado com sucesso!");
        setName("");
        setDescription("");
        setCategoryId(null);
        onItemAdded(); // Atualiza lista no Principal.js
      } else {
        Alert.alert("Erro", "Não foi possível adicionar o item.");
        console.error(response.data);
      }
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      Alert.alert("Erro", "Erro ao adicionar item. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Adicionar Novo Item</Text>
          <ScrollView style={{ width: "100%" }}>
            <Text style={styles.label}>Nome:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome do item"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Descrição:</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Digite a descrição"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Categoria:</Text>
            {loadingCategorias ? (
              <ActivityIndicator size="small" color="#600000" />
            ) : (
              <ScrollView style={{ maxHeight: 150, marginBottom: 10 }}>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat.idCategory}
                    style={styles.checkboxRow}
                    onPress={() => setCategoryId(cat.idCategory)}
                  >
                    <View
                      style={[
                        styles.checkboxBox,
                        categoryId === cat.idCategory && styles.checkboxBoxSelected,
                      ]}
                    >
                      {categoryId === cat.idCategory && (
                        <Ionicons name="checkmark" size={18} color="#FFF" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Adicionar Item</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

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
    padding: 20,
    alignItems: "center",
    width: "85%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  label: { fontSize: 16, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#28a745",
    borderRadius: 20,
    padding: 12,
    marginTop: 15,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#600000",
    borderRadius: 20,
    padding: 12,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "bold", textAlign: "center" },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 5,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#600000",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxBoxSelected: {
    backgroundColor: "#600000",
    borderColor: "#600000",
  },
  checkboxLabel: { fontSize: 16, color: "#333" },
});

export default AddItemModal;
