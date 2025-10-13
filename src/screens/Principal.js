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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import sheets from "../services/axios";
import CardType from "../components/layout/cardType";
import ItemDetailModal from "../components/layout/ItemDetailModal";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

function Principal() {
  const navigation = useNavigation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isManager, setIsManager] = useState(false); // 👈 novo estado

  // Estados para a paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Verifica se o usuário é manager
  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await SecureStore.getItemAsync("userRole");
      const storedEmail = await SecureStore.getItemAsync("userEmail");
      if (storedRole === "manager" || (storedEmail && storedEmail.includes("@sp.senai.br"))) {
        setIsManager(true);
      }
    };
    fetchRole();
  }, []);

  // Função para buscar itens da API
  const fetchItems = async (pageToLoad = 1) => {
    if (pageToLoad === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const token = await SecureStore.getItemAsync("tokenUsuario");
      const params = {
        page: pageToLoad,
        limit: 10,
        searchTerm,
        categories: selectedCategories.join(","),
      };
      const response = await sheets.getAllItems(params, token);

      if (response.data && response.data.success) {
        if (pageToLoad === 1) {
          setItems(response.data.items);
        } else {
          setItems((prevItems) => [...prevItems, ...response.data.data]);
        }
        setTotalPages(response.data.totalPages);
        setPage(pageToLoad);
      } else {
        setItems([]);
      }
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setPage(1);
    fetchItems(1);
  }, [searchTerm, selectedCategories]);

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isCloseToBottom && page < totalPages && !loading && !loadingMore) {
      fetchItems(page + 1);
    }
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!isFilterModalVisible);
  };

  const toggleDetailModal = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(!isDetailModalVisible);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const handleLogout = () => {
    navigation.navigate("Home");
  };

  const handleProfile = () => {
    navigation.navigate("Perfil");
  };

  const handleArquivos = () => {
    navigation.navigate("Arquivos"); // tela que você ainda vai criar
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfile} style={styles.profile}>
          <Ionicons name="person-circle-outline" color="#FFF" size={40} />
        </TouchableOpacity>

        {isManager && (
          <TouchableOpacity
            onPress={handleArquivos}
            style={styles.folderButton}
          >
            <MaterialCommunityIcons
              name="folder-outline"
              color="#FFF"
              size={40}
            />
          </TouchableOpacity>
        )}

        {/* Botão logout */}
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
          <Text style={styles.filterButtonText}>Filtros Avançados</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de itens */}
      {loading && items.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#600000" />
          <Text style={styles.loadingText}>Carregando itens...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.itemsContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
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
          {loadingMore && (
            <ActivityIndicator
              size="small"
              color="#600000"
              style={styles.loadingMoreIndicator}
            />
          )}
        </ScrollView>
      )}

      {/* Modal de filtros */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={toggleFilterModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Filtros por Categoria</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleFilterModal}
            >
              <Text style={styles.buttonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de detalhes */}
      <ItemDetailModal
        isVisible={isDetailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        item={selectedItem}
      />
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
    padding: 35,
    alignItems: "flex-start",
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
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
  loadingMoreIndicator: { marginVertical: 20 },
});

export default Principal;
