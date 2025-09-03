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
import { useNavigation } from "@react-navigation/native";
import sheets from "../services/axios";
import CardType from "../components/layout/cardType";

const { width } = Dimensions.get("window");

const categoryMapping = {
  Ferramentas: { title: "Ferramentas", description: "Instrumentos para trabalhos manuais." },
  Material: { title: "Material", description: "Itens de consumo, como fitas e tintas." },
  MateriaPrima: { title: "Matéria-Prima", description: "Insumos brutos para produção." },
  equipment: { title: "Equipamentos", description: "Máquinas e aparelhos em geral." },
  product: { title: "Produto", description: "Itens finais para comercialização." },
  diverses: { title: "Diversos", description: "Itens variados e de uso geral." },
};

function Principal() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await sheets.getAllItems();
        const allItems = response.data;
        const uniqueCategories = new Set(allItems.map(item => item.category));
        const categoriesArray = [...uniqueCategories];
        
        const formattedData = categoriesArray.map((category, index) => ({
          id: index,
          title: categoryMapping[category]?.title || category,
          description: categoryMapping[category]?.description || "Sem descrição disponível.",
          // Alteramos a rota para passar a categoria como parâmetro
          category: category, 
        }));
        
        setCategories(formattedData);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = () => {
    navigation.navigate("Home");
  };
  
  const handleProfile = () => {
    navigation.navigate("Perfil");
  };

  const handleCardPress = (category) => {
    // Agora, navegamos para a tela "Itens" e passamos a categoria como parâmetro
    navigation.navigate("Itens", { category: category });
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
          <Text style={styles.loadingText}>Carregando categorias...</Text>
        </View>
      ) : (
        <ScrollView style={styles.cardContainer}>
          {categories.map((item) => (
            <CardType
              key={item.id}
              title={item.title}
              description={item.description}
              // Passamos a propriedade `category` para a função de navegação
              onPress={() => handleCardPress(item.category)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#E4E4E4",
  },
  cardContainer: {
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
});

export default Principal;
