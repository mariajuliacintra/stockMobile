import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../services/axios";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

function Principal({ navigation }) {
  const [salas, setSalas] = useState([]);

  async function getSalas() {
    await api.getSalas().then(
      (response) => {
        setSalas(response.data.salas);
      },
      (error) => {
        console.log("Erro", error);
      }
    );
  }

  useEffect(() => {
    getSalas();
  }, []);

  const listSalas = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.tableCell, styles.nome]}>{item.nome}</Text>
      <Text style={[styles.tableCell, styles.descricao]}>{item.descricao}</Text>
      <Text style={[styles.tableCell, styles.bloco]}>{item.bloco}</Text>
      <Text style={[styles.tableCell, styles.tipo]}>{item.tipo}</Text>
      <Text style={[styles.tableCell, styles.capacidade]}>
        {item.capacidade}
      </Text>
    </View>
  );

  return (
    <ImageBackground
      source={require("../img/fundo.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.header}>
      <MaterialCommunityIcons name="menu" size={50} color="white" weight="thin" />
        <TouchableOpacity
          style={styles.buttonToProfile}
          onPress={() => navigation.navigate("Perfil")}
        >
          <FontAwesome6 name="user-circle" size={38} color="white" weight="thin" />
          
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonToHome}
          onPress={() => navigation.navigate("Home")}
        >
          <MaterialCommunityIcons name="exit-to-app" size={40} color="white" weight="thin"/>
          
        </TouchableOpacity> 
      </View>
      <View style={styles.body}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.headerNome]}>
            Nome
            </Text>
          <Text style={[styles.tableHeaderCell, styles.headerDescricao]}>
            Descrição
          </Text>
          <Text style={[styles.tableHeaderCell, styles.headerBloco]}>
            Bloco
          </Text>
          <Text style={[styles.tableHeaderCell, styles.headerTipo]}>
            Tipo
            </Text>
          <Text style={[styles.tableHeaderCell, styles.headerCapacidade]}>
            Capacidade
          </Text>
        </View>
        <FlatList
          data={salas}
          renderItem={listSalas}
          keyExtractor={(sala) => sala.id_sala.toString()}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { height: "100vh" },
  header: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    height: 60,
    borderBottomColor: "white",
    borderBottomWidth: 3,
    flexDirection: "row",
  },
  logo: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    width: 120,
    height: 34,
    marginTop: 12,
    marginLeft: -30,
  },
  buttonToHome: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    marginLeft: 14,
  },
  imageButtonToHome: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    width: 40,
    height: 40,
  },
  buttonToProfile:{
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    marginLeft: 330,
  },
  imageButtonToProfile:{
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    width: 40,
    height: 40,
  },
  body: {
    padding: 8,
    paddingTop: 10,
    paddingBottom: 180,
    marginBottom: 60,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "gray",
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  tableHeaderCell: {
    textAlign: "center",
    alignItems: "center",
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  headerNome: { width: 50, marginLeft: 25 },
  headerDescricao: { width: 100, marginLeft: 30 },
  headerBloco: { width: 70 },
  headerTipo: { width: 80, marginLeft: -5 },
  headerCapacidade: { width: 100, marginLeft: 1,},

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "white",
    backgroundColor: "#949494",
  },
  nome: {
    width: 100,
    flexWrap: "wrap",
    textAlign: "center",
    justifyContent: "center",
    color: "white",
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRightWidth: 0.5,
    borderRightColor: "white",
    fontWeight: "bold",
  },
  descricao: {
    width: 120,
    flexWrap: "wrap",
    textAlign: "center",
    color: "white",
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderLeftWidth: 0.5,
    borderLeftColor: "white",
    borderRightWidth: 0.5,
    borderRightColor: "white",
  },
  bloco: {
    width: 50,
    flexWrap: "wrap",
    textAlign: "center",
    color: "white",
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderLeftWidth: 0.5,
    borderLeftColor: "white",
    borderRightWidth: 0.5,
    borderRightColor: "white",
  },
  tipo: {
    width: 80,
    flexWrap: "wrap",
    textAlign: "center",
    color: "white",
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderLeftWidth: 0.5,
    borderLeftColor: "white",
    borderRightWidth: 0.5,
    borderRightColor: "white",
    fontStyle: "italic",
  },
  capacidade: {
    width: 100,
    flexWrap: "wrap",
    textAlign: "center",
    justifyContent:"center",
    color: "white",
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderLeftWidth: 0.5,
    borderLeftColor: "white",
  },
});

export default Principal;
