import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import sheets from "../services/axios";
import CardType from "../components/layout/cardType";
import ItemDetailModal from "../components/layout/ItemDetailModal";
import CreateItemModal from "../components/layout/createItemModal";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

function Principal() {
  const navigation = useNavigation();

  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]); 
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userId, setUserId] = useState(null);

  // 🔹 Buscar userId do SecureStore
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await SecureStore.getItemAsync("userId");
        if (id) setUserId(Number(id));
      } catch (error) {
        console.error("Erro ao carregar ID do usuário:", error);
      }
    };
    fetchUserId();
  }, []);

  // 🔍 Buscar itens
  const fetchItems = async () => {
    setLoading(true);
    try {
      const body = {
        name: searchTerm.trim() || "",
        idCategory: selectedCategories.length > 0 ? selectedCategories : [],
      };

      const response = await sheets.filtroItems(body);

      if (response.data && response.data.success) {
        setItems(response.data.items || []);
      } else {
        setItems([]);
        console.error("Erro: resposta sem sucesso", response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 📦 Buscar categorias
  const fetchCategorias = async () => {
    setLoadingCategorias(true);
    try {
      const response = await sheets.getCategories();
      if (response.data && Array.isArray(response.data.categories)) {
        setCategorias(response.data.categories);
      } else {
        console.error("Formato inesperado de categorias:", response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    } finally {
      setLoadingCategorias(false);
    }
  };

  // Atualiza pesquisa
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchItems();
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm, selectedCategories]);

  // Buscar categorias quando o modal abrir
  useEffect(() => {
    if (isFilterModalVisible) fetchCategorias();
  }, [isFilterModalVisible]);

  const toggleFilterModal = () => setFilterModalVisible(!isFilterModalVisible);

  const toggleDetailModal = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(!isDetailModalVisible);
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleLogout = () => navigation.navigate("Home");
  const handleProfile = () => navigation.navigate("Perfil");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfile} style={styles.profile}>
          <Ionicons name="person-circle-outline" color="#FFF" size={40} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <AntDesign name="logout" color="#FFF" size={25} />
        </TouchableOpacity>
      </View>

      {/* Barra de pesquisa */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por nome..."
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={toggleFilterModal}
        >
          <Text style={styles.filterButtonText}>Filtros</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de itens */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#600000" />
          <Text style={styles.loadingText}>Carregando itens...</Text>
        </View>
      ) : (
        <ScrollView style={styles.itemsContainer}>
          {items.length === 0 ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>Nenhum item encontrado.</Text>
            </View>
          ) : (
            items.map((item) => (
              <CardType
                key={item.idItem}
                title={item.name}
                description={item.description}
                onPress={() => toggleDetailModal(item)}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Modal de Filtros */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={toggleFilterModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Selecione as Categorias</Text>

            {loadingCategorias ? (
              <ActivityIndicator size="small" color="#600000" />
            ) : (
              <ScrollView style={{ maxHeight: 250, width: "100%" }}>
                {categorias.map((cat) => {
                  const selected = selectedCategories.includes(cat.idCategory);
                  return (
                    <TouchableOpacity
                      key={cat.idCategory}
                      style={styles.checkboxRow}
                      onPress={() => handleCategoryToggle(cat.idCategory)}
                    >
                      <View
                        style={[
                          styles.checkboxBox,
                          selected && styles.checkboxBoxSelected,
                        ]}
                      >
                        {selected && (
                          <Ionicons name="checkmark" size={18} color="#FFF" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>{cat.categoryValue}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                toggleFilterModal();
                fetchItems();
              }}
            >
              <Text style={styles.buttonText}>Aplicar Filtros</Text>
            </TouchableOpacity>

            {/* Botão correto para abrir modal de criar item */}
            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 10 }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.buttonText}>Adicionar Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Detalhes do Item */}
      <ItemDetailModal
        isVisible={isDetailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        item={selectedItem}
      />

      {/* Modal de Criação de Item */}
      {userId && (
        <CreateItemModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          fkIdUser={userId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E4E4E4" },
  header: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    height: 80,
    borderBottomColor: "white",
    borderBottomWidth: 3,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: width,
    paddingRight: 20,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: "white",
  },
  filterButton: {
    backgroundColor: "#600000",
    borderRadius: 8,
    padding: 10,
  },
  filterButtonText: { color: "#FFF", fontWeight: "bold" },
  itemsContainer: { flex: 1, width: "100%" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#600000" },
  profile: {
    backgroundColor: "#600000",
    borderRadius: 50,
    padding: 8.5,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 2,
    marginRight: 30,
  },
  logoutButton: {
    backgroundColor: "#600000",
    borderRadius: 50,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 2,
    marginLeft: -22,
    marginRight: -10,
  },
  messageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  messageText: { fontSize: 18, color: "#600000", textAlign: "center" },
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
    padding: 25,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  closeButton: {
    backgroundColor: "#600000",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    width: 150,
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
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
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },
});

export default Principal;
