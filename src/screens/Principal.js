import React, { useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as SecureStore from "expo-secure-store";
import ReservarModal from "../components/ReservarModal";
import CustomModal from "../components/CustomModal";
import api from "../services/axios";

function Principal({ navigation }) {
  const [salas, setSalas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [salaSelecionada, setSalaSelecionada] = useState(null);

  const [data, setData] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());

  const [showData, setShowData] = useState(false);
  const [showHoraInicio, setShowHoraInicio] = useState(false);
  const [showHoraFim, setShowHoraFim] = useState(false);

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

  async function filtrarSalas() {
    try {
      const formatDate = (dateObj) => {
        const cleanDate = new Date(dateObj);
        const yyyy = cleanDate.getFullYear();
        const mm = String(cleanDate.getMonth() + 1).padStart(2, "0");
        const dd = String(cleanDate.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      const formatTime24h = (dateObj) => {
        const cleanDate = new Date(dateObj);
        cleanDate.setSeconds(0);
        cleanDate.setMilliseconds(0);
        const hh = String(cleanDate.getHours()).padStart(2, "0");
        const mi = String(cleanDate.getMinutes()).padStart(2, "0");
        return `${hh}:${mi}:00`;
      };

      const dataFormatada = formatDate(data);
      const horaInicioFormatada = formatTime24h(horaInicio);
      const horaFimFormatada = formatTime24h(horaFim);

      const payload = {
        data: dataFormatada,
        hora_inicio: horaInicioFormatada,
        hora_fim: horaFimFormatada,
      };
      
      console.log("Payload: ", payload)

      const response = await api.getSalasDisponivelHorario(payload);
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
            <View style={{ flexDirection: "row", gap: 15 }}>
              <TouchableOpacity
                style={styles.buttonToProfile}
                onPress={() => navigation.navigate("Perfil")}
              >
                <FontAwesome6 name="user-circle" size={35} color="white" style={{marginTop:10}} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonToHome}
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

          <View style={styles.body}>
            <View style={styles.filtro}>
              <TouchableOpacity onPress={() => setShowData(true)}>
                <Text style={styles.inputFiltro}>
                  Data: {data.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
              {showData && (
                <DateTimePicker
                  value={data}
                  mode="date"
                  display="default"
                  onChange={(_, selected) => {
                    setShowData(false);
                    if (selected) setData(selected);
                  }}
                />
              )}

              <TouchableOpacity onPress={() => setShowHoraInicio(true)}>
                <Text style={styles.inputFiltro}>
                  Hora Início:{" "}
                  {horaInicio.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </Text>
              </TouchableOpacity>
              {showHoraInicio && (
                <DateTimePicker
                  value={horaInicio}
                  mode="time"
                  display="default"
                  is24Hour={true}
                  onChange={(_, selected) => {
                    setShowHoraInicio(false);
                    if (selected) setHoraInicio(selected);
                  }}
                />
              )}

              <TouchableOpacity onPress={() => setShowHoraFim(true)}>
                <Text style={styles.inputFiltro}>
                  Hora Fim:{" "}
                  {horaFim.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </Text>
              </TouchableOpacity>
              {showHoraFim && (
                <DateTimePicker
                  value={horaFim}
                  mode="time"
                  display="default"
                  is24Hour={true}
                  onChange={(_, selected) => {
                    setShowHoraFim(false);
                    if (selected) setHoraFim(selected);
                  }}
                />
              )}

              <Button
                title="Filtrar"
                style={styles.buttonFiltrar}
                color="rgba(177, 16, 16, 1)"
                onPress={filtrarSalas}
              />
            </View>

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

      {customModalVisible && (
        <CustomModal
          title={customModalContent.title}
          message={customModalContent.message}
          type={customModalContent.type}
          onClose={() => setCustomModalVisible(false)}
        />
      )}
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
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  body: {
    paddingHorizontal: "4%",
    paddingVertical: "5%",
    width: "100%",
    height: "92%",
  },
  filtro: {
    marginBottom: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgb(194, 194, 194)",
    gap: 10,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 5,
    paddingVertical: 10
  },
  inputFiltro: {
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "white",
    fontWeight: "semibold",
    margin: 2,
  },
  buttonFiltrar: { fontWeight: "bold" },
  table: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "white",
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
  nome: { width: 110 },
  descricao: { width: 100 },
  bloco: { width: 75 },
  tipo: { width: 80, fontStyle: "italic" },
  capacidade: { width: 70, borderRightWidth: 0 },
});

export default Principal;