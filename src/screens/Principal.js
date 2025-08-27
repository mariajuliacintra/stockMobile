import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import CardType from "../components/layout/cardType";

const { width, height } = Dimensions.get("window");

function Principal() {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.navigate("Home");
  };
  const handleProfile = () => {
    navigation.navigate("Home");
  };

  const handleEquipamentos = () => {
    // Lógica para navegar para a tela de Equipamentos
    navigation.navigate("Home");
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

      <CardType 
        title="Equipamentos"
        description="Máquinas ou aparelhos usados no trabalho."
        onPress={handleEquipamentos}
      />

      <CardType 
        title="Matéria-Prima"
        description="Insumos brutos usados na produção."
        onPress={() => console.log('Navegar para Matéria-Prima')}
      />

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
    backgroundColor: "#BFAEAE",
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
