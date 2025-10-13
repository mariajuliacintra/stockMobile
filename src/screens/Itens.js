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
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import sheets from "../services/axios";

const { width } = Dimensions.get("window");

const categoryMapping = {
  tool: { title: "Ferramentas", description: "Instrumentos para trabalhos manuais." },
  material: { title: "Material", description: "Itens de consumo, como fitas e tintas." },
  rawMaterial: { title: "Matéria-Prima", description: "Insumos brutos para produção." },
  equipment: { title: "Equipamentos", description: "Máquinas e aparelhos em geral." },
  product: { title: "Produto", description: "Itens finais para comercialização." },
  diverses: { title: "Diversos", description: "Itens variados e de uso geral." },
};

function ItemCard({ item }) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [actionType, setActionType] = useState('Entrada');

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.cardHeader}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
        <AntDesign
          name={isOpen ? "up" : "down"}
          size={20}
          color="#FFF"
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContent}>
          <Text style={styles.dropdownText}>
            <Text style={styles.dropdownLabel}>Marca:</Text> {item.brand || 'N/A'}
          </Text>
          <Text style={styles.dropdownText}>
            <Text style={styles.dropdownLabel}>Especificações:</Text> {item.technicalSpecifications || 'N/A'}
          </Text>
          <Text style={styles.dropdownText}>
            <Text style={styles.dropdownLabel}>Quantidade:</Text> {item.quantity || '0'}
          </Text>
          <Text style={styles.dropdownText}>
            <Text style={styles.dropdownLabel}>Última Manutenção:</Text> {item.lastMaintenance || 'N/A'}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Quantidade:</Text>
            <TextInput
              style={styles.quantityInput}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
            />
          </View>

          <View style={styles.actionTypeContainer}>
            <TouchableOpacity
              style={[styles.actionButton, actionType === 'Entrada' && styles.actionButtonSelected]}
              onPress={() => setActionType('Entrada')}
            >
              <Text style={styles.actionButtonText}>Entrada</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, actionType === 'Saída' && styles.actionButtonSelected]}
              onPress={() => setActionType('Saída')}
            >
              <Text style={styles.actionButtonText}>Saída</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function Itens() {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params; 
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await sheets.getItemsByCategory(category);
        setItems(response.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [category]);

  const handleLogout = () => {
    navigation.navigate("Principal");
  };

  const handleProfile = () => {
    navigation.navigate("Home");
  };

  const translatedTitle = categoryMapping[category]?.title || category;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfile} style={styles.profile}>
          <Ionicons name="person-circle-outline" color="#FFFFFF" size={40} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <AntDesign name="logout" color="#FFF" size={25} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#600000" />
          <Text style={styles.loadingText}>Carregando itens...</Text>
        </View>
      ) : (
        <ScrollView style={styles.itemsContainer}>
          <Text style={styles.categoryTitle}>{translatedTitle.toUpperCase()}</Text>
          {items.map((item) => (
            <ItemCard key={item.idItem} item={item} />
          ))}
        </ScrollView>
      )}
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
  itemsContainer: {
    flex: 1,
    width: "100%",
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    color: "#600000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#BFAEAE",
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
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(177, 16, 16, 1)',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  dropdownContent: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dropdownText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  dropdownLabel: {
    fontWeight: "bold",
    color: '#600000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  inputLabel: {
    fontWeight: "bold",
    marginRight: 8,
    color: '#600000',
  },
  quantityInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  actionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#600000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  actionButtonSelected: {
    backgroundColor: 'rgba(177, 16, 16, 1)',
    borderColor: '#FFF',
    borderWidth: 1,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Itens;
