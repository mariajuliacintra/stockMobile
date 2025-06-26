import React, { useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  TextInput,
  Platform, // Importar Platform
  KeyboardAvoidingView, // Importar KeyboardAvoidingView
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as SecureStore from "expo-secure-store";
import ReservarModal from "../components/mod/ReservarModal";
import CustomModal from "../components/mod/CustomModal";
import FiltroModal from "../components/layout/FiltroModal";
import api from "../services/axios";

const { width, height } = Dimensions.get("window");

function Principal({ navigation }) {
  const [salas, setSalas] = useState([]);
  const [displayedSalas, setDisplayedSalas] = useState([]);
  const [reservarModalVisible, setReservarModalVisible] = useState(false);
  const [salaSelecionada, setSalaSelecionada] = useState(null);

  const [isFiltroModalVisible, setFiltroModalVisible] = useState(false);
  const [expandedSalaId, setExpandedSalaId] = useState(null);

  const [filtroDataInicio, setFiltroDataInicio] = useState(new Date());
  const [filtroDataFim, setFiltroDataFim] = useState(new Date());
  const [filtroHoraInicio, setFiltroHoraInicio] = useState(new Date());
  const [filtroHoraFim, setFiltroHoraFim] = useState(new Date());

  const [searchTerm, setSearchTerm] = useState("");

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
    setFiltroDataInicio(new Date(filters.data_inicio));
    setFiltroDataFim(new Date(filters.data_fim));
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

  useEffect(() => {
    if (searchTerm === "") {
      setDisplayedSalas(salas);
    } else {
      const filtered = salas.filter(sala =>
        sala.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedSalas(filtered);
    }
  }, [salas, searchTerm]);

  const toggleExpand = (id) => {
    setExpandedSalaId(expandedSalaId === id ? null : id);
  };

  const listSalas = ({ item }) => {
    const isExpanded = expandedSalaId === item.id_sala;
    return (
      <View style={dynamicStyles.salaItemContainer}>
        <TouchableOpacity
          style={dynamicStyles.salaRowHeader}
          onPress={() => toggleExpand(item.id_sala)}
          activeOpacity={0.88}
        >
          <Text style={dynamicStyles.salaName}>{item.nome}</Text>
          <Ionicons
            name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
            size={24}
            color="#555"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={dynamicStyles.salaDetails}>
            <View style={dynamicStyles.detailRow}>
              <Text style={dynamicStyles.detailLabel}>Descrição:</Text>
              <Text style={dynamicStyles.detailValue}>{item.descricao}</Text>
            </View>
            <View style={dynamicStyles.detailRow}>
              <Text style={dynamicStyles.detailLabel}>Bloco:</Text>
              <Text style={dynamicStyles.detailValue}>{item.bloco}</Text>
            </View>
            <View style={dynamicStyles.detailRow}>
              <Text style={dynamicStyles.detailLabel}>Tipo:</Text>
              <Text style={dynamicStyles.detailValue}>{item.tipo}</Text>
            </View>
            <View style={dynamicStyles.detailRow}>
              <Text style={dynamicStyles.detailLabel}>Capacidade:</Text>
              <Text style={dynamicStyles.detailValue}>{item.capacidade}</Text>
            </View>
            <TouchableOpacity
              style={dynamicStyles.reservarButton}
              onPress={() => {
                setSalaSelecionada(item);
                setReservarModalVisible(true);
              }}
            >
              <Text style={dynamicStyles.reservarButtonText}>Reservar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

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
      height: height * 0.1,
      width: width,
      borderBottomColor: "white",
      borderBottomWidth: 3,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingHorizontal: width * 0.05,
    },
    buttonToProfile: {
      marginTop: 5,
    },
    buttonToHome: {
      marginTop: 5,
    },
    body: {
      paddingHorizontal: width * 0.04,
      paddingVertical: height * 0.02,
      width: width,
      // Removido height fixo para permitir que KeyboardAvoidingView gerencie
      flex: 1, // Usar flex para que o body ocupe o espaço disponível
      backgroundColor: '#D3D3D3',
    },
    searchAndFilterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: height * 0.02,
        width: '100%',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: width * 0.03,
        height: height * 0.06,
        flex: 1,
        marginRight: width * 0.02,
    },
    searchInput: {
        flex: 1,
        fontSize: width * 0.04,
        color: '#333',
        paddingVertical: 0,
    },
    filtroButton: {
      backgroundColor: "rgba(177, 16, 16, 1)",
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.04,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      borderColor: "white",
      borderWidth: 2,
      height: height * 0.06,
    },
    filtroButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: width * 0.035,
    },
    salaItemContainer: {
      backgroundColor: "white",
      borderRadius: 8,
      marginBottom: 10,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#ddd',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    salaRowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: height * 0.02,
      paddingHorizontal: width * 0.04,
      backgroundColor: '#f9f9f9',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    salaName: {
      fontSize: width * 0.05,
      fontWeight: 'bold',
      color: '#333',
    },
    salaDetails: {
      paddingHorizontal: width * 0.04,
      paddingVertical: height * 0.015,
      backgroundColor: '#FFFFFF',
    },
    detailRow: {
      flexDirection: 'row',
      marginBottom: height * 0.008,
    },
    detailLabel: {
      fontSize: width * 0.038,
      fontWeight: '600',
      color: '#555',
      marginRight: width * 0.01,
      width: '30%',
    },
    detailValue: {
      fontSize: width * 0.038,
      color: '#777',
      flexShrink: 1,
      width: '70%',
    },
    reservarButton: {
      backgroundColor: "rgb(250, 24, 24)",
      paddingVertical: height * 0.012,
      paddingHorizontal: width * 0.05,
      borderRadius: 5,
      alignSelf: 'flex-end',
      marginTop: - height * 0.05,
    },
    reservarButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: width * 0.04,
    },
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
                <FontAwesome6 name="user-circle" size={35} color="white" style={{marginTop:10}} />
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
                  style={{marginTop:10}}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* KeyboardAvoidingView para evitar que o input seja coberto pelo teclado */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={dynamicStyles.body}
            // O offset deve ser a altura da barra superior para iOS, ou 0 para Android
            keyboardVerticalOffset={Platform.OS === "ios" ? height * 0.08 : 0}
          >
            <View style={dynamicStyles.searchAndFilterContainer}>
              <View style={dynamicStyles.searchInputContainer}>
                <Ionicons name="search-outline" size={width * 0.05} color="gray" style={{marginRight: width * 0.02}} />
                <TextInput
                  style={dynamicStyles.searchInput}
                  placeholder="Pesquisar por Tipo"
                  placeholderTextColor="gray"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>
              <TouchableOpacity
                style={dynamicStyles.filtroButton}
                onPress={() => setFiltroModalVisible(true)}
              >
                <Text style={dynamicStyles.filtroButtonText}>Filtrar</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={displayedSalas}
              renderItem={listSalas}
              keyExtractor={(item) => item.id_sala.toString()}
              contentContainerStyle={{ paddingBottom: height * 0.02 }}
            />
          </KeyboardAvoidingView>
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
