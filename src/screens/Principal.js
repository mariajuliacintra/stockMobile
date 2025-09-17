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
import * as SecureStore from "expo-secure-store";

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

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [isDetailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    
    // Estados para a paginação
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Função para buscar itens da API
    const fetchItems = async (pageToLoad = 1) => {

        // Define o estado de loading correto
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
                // A API espera 'categoryValue', não a 'key' do seu mapeamento
                categories: selectedCategories.join(',')
            };
            const response = await sheets.getAllItems(params, token);
            
            if (response.data && response.data.success) {
                // Se for a primeira página, substitui os itens, caso contrário, concatena
                if (pageToLoad === 1) {
                    setItems(response.data.items);
                } else {
                    setItems(prevItems => [...prevItems, ...response.data.data]);
                }
                setTotalPages(response.data.totalPages);
                setPage(pageToLoad);
            } else {
                console.error("Resposta da API sem sucesso:", response.data.message);
            }
        } catch (error) {
            console.error("Erro ao buscar itens:", error);
            setItems([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Efeito para buscar a primeira página quando o componente é montado
    // e sempre que o termo de busca ou categorias mudam.
    useEffect(() => {
        setItems([]); // Limpa a lista para uma nova busca
        setPage(1); // Reseta a página para 1
        fetchItems(1);
    }, [searchTerm, selectedCategories]);

    // Carrega mais itens quando o usuário chega ao final da lista
    const handleScroll = ({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

        // Verifica se pode carregar mais itens
        if (isCloseToBottom && page < totalPages && !loading && !loadingMore) {
            fetchItems(page + 1);
        }
    };

    // Abre/fecha modal de filtros
    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    // Abre/fecha modal de detalhes do item
    const toggleDetailModal = (item) => {
        setSelectedItem(item);
        setDetailModalVisible(!isDetailModalVisible);
    };

    // Seleciona/desmarca categoria
    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(cat => cat !== category)
                : [...prev, category]
        );
    };

    // Navegação
    const handleLogout = () => {
        navigation.navigate("Home");
    };

    const handleProfile = () => {
        navigation.navigate("Perfil");
    };

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
                <TouchableOpacity style={styles.filterButton} onPress={toggleFilterModal}>
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
                        items.map(item => (
                            <CardType
                                key={item.idItem}
                                title={item.name}
                                description={item.description}
                                onPress={() => toggleDetailModal(item)}
                            />
                        ))
                    )}
                    {loadingMore && <ActivityIndicator size="small" color="#600000" style={styles.loadingMoreIndicator} />}
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
                        {Object.entries(categoryMapping).map(([key, value]) => (
                            <TouchableOpacity
                                key={key}
                                style={styles.checkboxContainer}
                                onPress={() => handleCategoryToggle(key)}
                            >
                                <Ionicons
                                    name={selectedCategories.includes(key) ? "checkbox" : "square-outline"}
                                    size={24}
                                    color="#600000"
                                />
                                <Text style={styles.checkboxText}>{value.title}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.closeButton} onPress={toggleFilterModal}>
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
    messageContainer: { alignItems: "center", justifyContent: "center", marginTop: 50, paddingHorizontal: 20 },
    messageText: { fontSize: 18, color: "#600000", textAlign: "center" },
    centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
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
    checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    checkboxText: { marginLeft: 8, fontSize: 16 },
    closeButton: { backgroundColor: "#600000", borderRadius: 20, padding: 10, elevation: 2, marginTop: 15 },
    buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
    loadingMoreIndicator: { marginVertical: 20 },
});

export default Principal;