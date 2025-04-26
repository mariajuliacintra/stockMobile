import React, { useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../services/axios";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ReservarModal from "../components/ReservarModal";

function Principal({ navigation }) {
  const [salas, setSalas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [salaSelecionada, setSalaSelecionada] = useState(null);

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
    <TouchableOpacity
      style={styles.rowButton}
      onPress={() => {
        setSalaSelecionada(item);
        setModalVisible(true);
      }}
      activeOpacity={0.88}
    >
      <View style={styles.row}>
        <Text style={[styles.cell, styles.nome]}>{item.nome}</Text>
        <Text style={[styles.cell, styles.descricao]}>{item.descricao}</Text>
        <Text style={[styles.cell, styles.bloco]}>{item.bloco}</Text>
        <Text style={[styles.cell, styles.tipo]}>{item.tipo}</Text>
        <Text style={[styles.cell, styles.capacidade]}>{item.capacidade}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <ImageBackground
        source={require("../img/fundo.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="menu"
              size={40}
              color="white"
              weight="thin"
            />
            <View style={{ flexDirection: "row", gap: 15 }}>
              <TouchableOpacity
                style={styles.buttonToProfile}
                onPress={() => navigation.navigate("Perfil")}
              >
                <FontAwesome6
                  name="user-circle"
                  size={35}
                  color="white"
                  weight="thin"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonToHome}
                onPress={() => navigation.navigate("Home")}
              >
                <MaterialCommunityIcons
                  name="exit-to-app"
                  size={38}
                  color="white"
                  weight="thin"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.nome]}>Nome</Text>
                <Text style={[styles.tableHeaderCell, styles.descricao]}>
                  Descrição
                </Text>
                <Text style={[styles.tableHeaderCell, styles.bloco]}>
                  Bloco
                </Text>
                <Text style={[styles.tableHeaderCell, styles.tipo]}>Tipo</Text>
                <Text style={[styles.tableHeaderCell, styles.capacidade]}>
                  Cap
                </Text>
              </View>

              <FlatList
                data={salas}
                renderItem={listSalas}
                keyExtractor={(sala) => sala.id_sala.toString()}
              />
            </View>
          </View>
        </View>
      </ImageBackground>

      <ReservarModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        idSala={salaSelecionada?.id_sala}
        handleReserva={() => {
          setModalVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: "100%",
    width: "100%",
  },
  header: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    height: "8%",
    width: "100%",
    borderBottomColor: "white",
    borderBottomWidth: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  body: {
    paddingHorizontal: "4%",
    paddingVertical: "5%",
    width: "100%",
    height: "92%",
  },
  table: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "white",
  },
  tableHeader: {
    justifyContent: "space-between",
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
    paddingHorizontal: 18,
    paddingVertical: 5,
  },
  rowButton: {
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#949494",
    borderBottomWidth: 1,
    borderColor: "white",
  },
  cell: {
    textAlign: "center",
    color: "white",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: "white",
  },
  nome: {
    width: 90,
    fontWeight: "bold",
  },
  descricao: {
    width: 85.1,
  },
  bloco: {
    width: 64.1,
  },
  tipo: {
    width: 80,
    fontStyle: "italic",
  },
  capacidade: {
    width: 55,
    borderRightWidth: 0,
  },
});

export default Principal;
