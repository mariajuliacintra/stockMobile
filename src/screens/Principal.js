import React, { useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as SecureStore from "expo-secure-store";
import ReservarModal from "../components/mod/ReservarModal";
import CustomModal from "../components/mod/CustomModal";
import FiltroModal from "../components/layout/FiltroModal";
import api from "../services/axios";

const { width, height } = Dimensions.get("window");

function Principal({ navigation }) {
  const [salas, setSalas] = useState([]);
  const [reservarModalVisible, setReservarModalVisible] = useState(false);
  const [salaSelecionada, setSalaSelecionada] = useState(null);

  const [isFiltroModalVisible, setFiltroModalVisible] = useState(false);

  // Estados para armazenar os filtros aplicados
  const [filtroDataInicio, setFiltroDataInicio] = useState(new Date());
  const [filtroDataFim, setFiltroDataFim] = useState(new Date());
  const [filtroHoraInicio, setFiltroHoraInicio] = useState(new Date());
  const [filtroHoraFim, setFiltroHoraFim] = useState(new Date());
  // O estado para selectedDays não precisa ser mantido em Principal,
  // pois FiltroModal gerencia e retorna isso na função onApplyFilters

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customModalContent, setCustomModalContent] = useState({
    title: "",
    message: "",
    type: "",
  });

  async function getSalas() {
    try {
      const response = await api.getSalas();
      setSalas(response.data.salas);
    } catch (error) {
      console.log("Erro", error);
    }
  }

  async function aplicarFiltrosNasSalas(filters) {
    // Atualiza os estados de filtro na tela Principal
    setFiltroDataInicio(new Date(filters.data_inicio));
    setFiltroDataFim(new Date(filters.data_fim));
    // As horas precisam de uma data de referência para serem criadas corretamente
    setFiltroHoraInicio(new Date(`2000-01-01T${filters.hora_inicio}`));
    setFiltroHoraFim(new Date(`2000-01-01T${filters.hora_fim}`));

    console.log("Dados enviados para a API:", filters);

    try {
      const response = await api.getSalasDisponivelHorario(filters);
      const { salas, message, error } = response.data;

      if (error) {
        setCustomModalContent({
          title: "Erro",
          message: error || "Erro ao buscar salas.",
          type: "error",
        });
      } else {
        setSalas(salas);
        setCustomModalContent({
          title: "Sucesso",
          message: message || "Salas disponíveis carregadas.",
          type: "success",
        });
      }
      setCustomModalVisible(true);
    } catch (e) {
      console.log("Erro ao buscar salas:", e);
      const errorMessage =
        e.response?.data?.error || "Erro ao buscar salas disponíveis.";
      setCustomModalContent({
        title: "Erro",
        message: errorMessage,
        type: "error",
      });
      setCustomModalVisible(true);
    }
  }

  useEffect(() => {
    getSalas();
  }, []);

  const listSalas = ({ item }) => (
    <TouchableOpacity
      style={dynamicStyles.rowButton}
      onPress={() => {
        setSalaSelecionada(item);
        setReservarModalVisible(true);
      }}
      activeOpacity={0.88}
    >
      <View style={dynamicStyles.row}>
        <Text style={[dynamicStyles.cell, dynamicStyles.nome]}>
          {item.nome}
        </Text>
        <Text style={[dynamicStyles.cell, dynamicStyles.descricao]}>
          {item.descricao}
        </Text>
        <Text style={[dynamicStyles.cell, dynamicStyles.bloco]}>
          {item.bloco}
        </Text>
        <Text style={[dynamicStyles.cell, dynamicStyles.tipo]}>
          {item.tipo}
        </Text>
        <Text style={[dynamicStyles.cell, dynamicStyles.capacidade]}>
          {item.capacidade}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const dynamicStyles = StyleSheet.create({
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
      height: height * 0.08,
      width: width,
      borderBottomColor: "white",
      borderBottomWidth: 3,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingHorizontal: width * 0.05,
    },
    buttonToProfile: {
      // Estilos para o botão de perfil
    },
    buttonToHome: {
      // Estilos para o botão de sair
    },
    body: {
      paddingHorizontal: width * 0.04,
      paddingVertical: height * 0.02,
      width: width,
      height: height * 0.92,
    },
    filtroButtonContainer: {
      width: "100%",
      alignItems: "center",
      marginBottom: height * 0.02,
    },
    filtroButton: {
      backgroundColor: "rgba(177, 16, 16, 1)",
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.06,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      borderColor: "white",
      borderWidth: 2,
    },
    filtroButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: width * 0.045,
    },
    table: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: "white",
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "gray",
      paddingVertical: height * 0.015,
      borderWidth: 2,
      borderColor: "white",
    },
    tableHeaderCell: {
      textAlign: "center",
      fontWeight: "bold",
      color: "white",
      paddingHorizontal: width * 0.01,
      paddingVertical: height * 0.005,
      fontSize: width * 0.035,
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
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.01,
      borderRightWidth: 1,
      borderRightColor: "white",
      fontSize: width * 0.035,
    },
    nome: { width: width * 0.22 },
    descricao: { width: width * 0.25 },
    bloco: { width: width * 0.15 },
    tipo: { width: width * 0.18, fontStyle: "italic" },
    capacidade: { width: width * 0.15, borderRightWidth: 0 },
  });

  return (
    <>
      <ImageBackground
        source={require("../img/fundo.png")}
        style={dynamicStyles.background}
        resizeMode="cover"
      >
        <View style={dynamicStyles.container}>
          <View style={dynamicStyles.header}>
            <View style={{ flexDirection: "row", gap: 15 }}>
              <TouchableOpacity
                style={dynamicStyles.buttonToProfile}
                onPress={() => navigation.navigate("Perfil")}
              >
                <FontAwesome6
                  name="user-circle"
                  size={35}
                  color="white"
                  style={{ marginTop: 10 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={dynamicStyles.buttonToHome}
                onPress={async () => {
                  await SecureStore.deleteItemAsync("tokenUsuario");
                  navigation.navigate("Home");
                }}
              >
                <MaterialCommunityIcons
                  name="exit-to-app"
                  size={38}
                  color="white"
                  style={{ marginTop: 10 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamicStyles.body}>
            <View style={dynamicStyles.filtroButtonContainer}>
              <TouchableOpacity
                style={dynamicStyles.filtroButton}
                onPress={() => setFiltroModalVisible(true)}
              >
                <Text style={dynamicStyles.filtroButtonText}>Abrir Filtro</Text>
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.table}>
              <View style={dynamicStyles.tableHeader}>
                <Text
                  style={[dynamicStyles.tableHeaderCell, dynamicStyles.nome]}
                >
                  Nome
                </Text>
                <Text
                  style={[
                    dynamicStyles.tableHeaderCell,
                    dynamicStyles.descricao,
                  ]}
                >
                  Descrição
                </Text>
                <Text
                  style={[dynamicStyles.tableHeaderCell, dynamicStyles.bloco]}
                >
                  Bloco
                </Text>
                <Text
                  style={[dynamicStyles.tableHeaderCell, dynamicStyles.tipo]}
                >
                  Tipo
                </Text>
                <Text
                  style={[
                    dynamicStyles.tableHeaderCell,
                    dynamicStyles.capacidade,
                  ]}
                >
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
        isOpen={reservarModalVisible}
        onClose={() => setReservarModalVisible(false)}
        idSala={salaSelecionada?.id_sala}
        handleReserva={() => {
          setReservarModalVisible(false);
        }}
      />

      {customModalVisible && (
        <CustomModal
          title={customModalContent.title}
          message={customModalContent.message}
          type={customModalContent.type}
          onClose={() => setCustomModalVisible(false)}
        />
      )}

      <FiltroModal
        visible={isFiltroModalVisible}
        onClose={() => setFiltroModalVisible(false)}
        onApplyFilters={aplicarFiltrosNasSalas}
        initialDataInicio={filtroDataInicio}
        initialDataFim={filtroDataFim}
        initialHoraInicio={filtroHoraInicio}
        initialHoraFim={filtroHoraFim}
      />
    </>
  );
}

export default Principal;
