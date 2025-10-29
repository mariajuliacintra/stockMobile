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
import Header from "../components/mod/Header";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import sheets from "../services/axios";
import CardType from "../components/layout/cardType";
import Pagination from "../components/mod/Pagination";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userId, setUserId] = useState(null);

  // ✅ Verifica se o usuário é manager
  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await SecureStore.getItemAsync("userRole");
      const storedEmail = await SecureStore.getItemAsync("userEmail");
      if (
        storedRole === "manager" ||
        (storedEmail && storedEmail.includes("@sp.senai.br"))
      ) {
        setIsManager(true);
      }
    };
    fetchRole();
  }, []);

  // 🔹 Buscar userId do SecureStore
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await SecureStore.getItemAsync("userId");
        if (id) setUserId(Number(id));
      } catch (error) {
      }
    };
    fetchUserId();
  }, []);

  // Buscar itens
  const fetchItems = async (pageToLoad = 1, append = false) => {
    if (pageToLoad === 1 && !append) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await sheets.getAllItems(pageToLoad, 25); // 25 itens por página

      if (response.data.success) {
        const newItems = response.data.items || [];

        setItems((prevItems) =>
          append ? [...prevItems, ...newItems] : newItems
        );

        setTotalPages(response.data.pagination?.totalPages || 1);
        setPage(response.data.pagination?.currentPage || pageToLoad);
      } else {
        if (!append) setItems([]);
      }
    } catch (err) {
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
      }
    } catch (error) {
    } finally {
      setLoadingCategorias(false);
    }
  };

  // Atualiza pesquisa com debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      setItems([]);
      setPage(1);
      fetchItems(1);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchTerm, selectedCategories]);

  // Buscar categorias quando o modal abrir
  useEffect(() => {
    if (isFilterModalVisible) fetchCategorias();
  }, [isFilterModalVisible]);

  // Alterna modal de filtro
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

  const handleItemDeleted = (deletedItemId) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.idItem !== deletedItemId)
    );
  };

  const handleLogout = () => navigation.navigate("Home");
  const handleProfile = () => navigation.navigate("Perfil");
  const handleArquivos = () => navigation.navigate("Arquivos");
  return (
    <View style={styles.container}>
      <Header
        isManager={isManager}
        onProfilePress={handleProfile}
        onLogoutPress={handleLogout}
        onArquivosPress={handleArquivos}
      />

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
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            style={{ flex: 1 }}
          >
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
          {totalPages > 1 && (
            <View style={styles.paginationWrapper}>
              <Pagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={(pageNum) => fetchItems(pageNum, false)} // ⬅️ Substitui itens
              />
            </View>
          )}
        </View>
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
            {/* Botão de fechar (X) */}
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={toggleFilterModal}
            >
              <AntDesign name="close" size={24} color="#600000" />
            </TouchableOpacity>

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
                      <Text style={styles.checkboxLabel}>
                        {cat.categoryValue}
                      </Text>
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
        onClose={() => {
          setDetailModalVisible(false);
          fetchItems(1); // 🔹 Atualiza a lista de itens
        }}
        item={selectedItem}
        onItemDeleted={handleItemDeleted}
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
  profile: {
    backgroundColor: "#600000",
    borderRadius: 50,
    padding: 8.5,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 2,
    marginRight: 10,
  },
  folderButton: {
    backgroundColor: "#600000",
    borderRadius: 50,
    padding: 8.5,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 2,
    marginRight: 32,
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
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
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
  listWrapper: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  paginationWrapper: {
    paddingVertical: 0,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Principal;
