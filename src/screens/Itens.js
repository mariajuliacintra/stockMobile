import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import sheets from "../services/axios";
import CardType from "../components/layout/cardType";

const { width } = Dimensions.get("window");

function Itens() {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params; // Pega a categoria passada como parâmetro
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar os itens da API com base na categoria
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await sheets.getItemsByCategory(category);
        setItems(response.data);
      } catch (error) {
        console.error("Erro ao buscar itens por categoria:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [category]); // A dependência [category] garante que a função será executada novamente se a categoria mudar

  const handleLogout = () => {
    navigation.navigate("Principal");
  };

  const handleProfile = () => {
    navigation.navigate("Home");
  };

  const handleCardPress = (item) => {
    // Adicione a lógica para lidar com o clique em um item, se necessário
    console.log("Card clicado:", item.name);
  };

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
          <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
          {items.map((item) => (
            <CardType
              key={item.idItem}
              title={item.name}
              description={item.description}
              onPress={() => handleCardPress(item)}
            />
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
});

export default Itens;
