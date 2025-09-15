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
import ItemDetailModal from "../components/layout/ItemDetailModal"; // Importação adicionada

const { width } = Dimensions.get("window");

const categoryMapping = {
  tool: { title: "Ferramentas", description: "Instrumentos para trabalhos manuais." },
  material: { title: "Material", description: "Itens de consumo, como fitas e tintas." },
  rawMaterial: { title: "Matéria-Prima", description: "Insumos brutos para produção." },
  equipment: { title: "Equipamentos", description: "Máquinas e aparelhos em geral." },
  product: { title: "Produto", description: "Itens finais para comercialização." },
  diverses: { title: "Diversos", description: "Itens variados e de uso geral." },
};

function Principal() {
  const navigation = useNavigation();
  const [allItems, setAllItems] = useState([]); // Nova lista para armazenar todos os itens
  const [items, setItems] = useState([]); // Lista para exibição (filtrada)
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Efeito para carregar todos os itens da API apenas uma vez
  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true);
      try {
        // Remove os parâmetros de busca, pois a rota da API não os utiliza
        const response = await sheets.getAllItems();
        setAllItems(response.data);
      } catch (error) {
        console.error("Erro ao buscar todos os itens:", error);
        setAllItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllItems();
  }, []); // Array de dependência vazio para rodar apenas uma vez

  // Efeito para filtrar a lista de itens baseada na busca e nos filtros
  useEffect(() => {
    let filteredItems = allItems;

    // Filtra por termo de busca
    if (searchTerm) {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtra por categorias selecionadas
    if (selectedCategories.length > 0) {
      filteredItems = filteredItems.filter(item =>
        selectedCategories.includes(item.category)
      );
    }

    setItems(filteredItems);
  }, [searchTerm, selectedCategories, allItems]); // Dependências para disparar o filtro

  const toggleFilterModal = () => {
    // Limpa a lista de categorias selecionadas ao abrir o modal
    if (!isFilterModalVisible) {
      setSelectedCategories([]);
    }
    setFilterModalVisible(!isFilterModalVisible);
  };


  const toggleDetailModal = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(!isDetailModalVisible);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleLogout = () => {
    navigation.navigate("Home");


  const handleProfile = () => {
    navigation.navigate("Perfil");
  };

  return (
    <View style={styles.container}>
      {/* Header com botões de Perfil e Sair */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfile} style={styles.profile}>
          <Ionicons name="person-circle-outline" color="#FFFFFF" size={40} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <AntDesign name="logout" color="#FFF" size={25} />
        </TouchableOpacity>
      </View>

      {/* Barra de Pesquisa e Botão de Filtro */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por nome..."
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilterModal}>
          <Text style={styles.filterButtonText}>Filtros Avançados</Text>
        </TouchableOpacity>
      </View>

      {/* Exibição dos itens ou mensagem de carregamento */}
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
                onPress={() => toggleDetailModal(item)} // Abre o modal de detalhes
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Modal de Filtros Avançados */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={toggleFilterModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Filtros por Categoria</Text>
            {Object.entries(categoryMapping).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={styles.checkboxContainer}
                onPress={() => handleCategoryToggle(key)}
              >
                <Ionicons
                  name={selectedCategories.includes(key) ? "checkbox-outline" : "square-outline"}
                  size={24}
                  color="#600000"
                />
                <Text style={styles.checkboxText}>{value.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={toggleFilterModal}>
              <Text style={styles.buttonText}>Filtrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NOVO: Componente do Modal de Detalhes separado */}
      <ItemDetailModal
        isVisible={isDetailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        item={selectedItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E4E4E4",
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: 'white',
  },
  filterButton: {
    backgroundColor: '#600000',
    borderRadius: 8,
    padding: 10,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemsContainer: {
    flex: 1,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#600000",
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 18,
    color: '#600000',
    textAlign: 'center',
  },
  // Estilos do Modal
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "left",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#600000',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  }
});

export default Principal;
