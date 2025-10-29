// ArquivosScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer";
import sheets from "../services/axios";

export default function ArquivosScreen() {
  const navigation = useNavigation();

  // GERAR EXCEL
  const handleGerarExcel = async (tipo) => {
    try {
      let response;

      switch (tipo) {
        case "Relatório Geral":
          response = await sheets.getExcelGeneral();
          break;
        case "Estoque Baixo":
          response = await sheets.getExcelLowStock();
          break;
        case "Transações":
          response = await sheets.getExcelTransactions();
          break;
        default:
          return;
      }

      const fileUri = `${FileSystem.documentDirectory}${tipo}.xlsx`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        Buffer.from(response.data, "binary").toString("base64"),
        { encoding: FileSystem.EncodingType.Base64 }
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Download concluído", `Arquivo salvo em: ${fileUri}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível gerar o arquivo Excel.");
    }
  };

  //GERAR PDF
  const handleGerarPDF = async (tipo) => {
    try {
      let response;

      switch (tipo) {
        case "Relatório Geral":
          response = await sheets.getPdfGeneral();
          break;
        case "Estoque Baixo":
          response = await sheets.getPdfLowStock();
          break;
        case "Transações":
          response = await sheets.getPdfTransactions();
          break;
        default:
          return;
      }

      const fileUri = `${FileSystem.documentDirectory}${tipo}.pdf`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        Buffer.from(response.data, "binary").toString("base64"),
        { encoding: FileSystem.EncodingType.Base64 }
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Download concluído", `Arquivo salvo em: ${fileUri}`);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível gerar o arquivo PDF.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Principal")}
            style={styles.iconButton}
          >
            <Entypo name="home" size={40} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Perfil")}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={40}
              color="#fff"
              light
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Relatório Geral */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="folder" size={30} color="#003366" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Relatório Geral do Estoque</Text>
              <Text style={styles.cardDesc}>
                Relatório completo de todos os itens, localizações e
                especificações.
              </Text>
            </View>
            <View style={styles.buttonColumn}>
              <TouchableOpacity
                style={[styles.button, styles.buttonExcel]}
                onPress={() => handleGerarExcel("Relatório Geral")}
              >
                <MaterialCommunityIcons
                  name="file-excel"
                  size={22}
                  color="#fff"
                />
                <Text style={styles.buttonText}>Excel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonPDF]}
                onPress={() => handleGerarPDF("Relatório Geral")}
              >
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={22}
                  color="#fff"
                />
                <Text style={styles.buttonText}>PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Estoque Baixo */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="clipboard-alert-outline"
              size={30}
              color="#003366"
            />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Relatório de Estoque Baixo</Text>
              <Text style={styles.cardDesc}>
                Lista de itens que estão abaixo do estoque mínimo definido.
              </Text>
            </View>
            <View style={styles.buttonColumn}>
              <TouchableOpacity
                style={[styles.button, styles.buttonExcel]}
                onPress={() => handleGerarExcel("Estoque Baixo")}
              >
                <MaterialCommunityIcons
                  name="file-excel"
                  size={22}
                  color="#fff"
                />
                <Text style={styles.buttonText}>Excel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonPDF]}
                onPress={() => handleGerarPDF("Estoque Baixo")}
              >
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={22}
                  color="#fff"
                />
                <Text style={styles.buttonText}>PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Transações */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="history" size={30} color="#003366" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Relatório de Transações</Text>
              <Text style={styles.cardDesc}>
                Histórico detalhado das últimas movimentações de entrada e
                saída.
              </Text>
            </View>
            <View style={styles.buttonColumn}>
              <TouchableOpacity
                style={[styles.button, styles.buttonExcel]}
                onPress={() => handleGerarExcel("Transações")}
              >
                <MaterialCommunityIcons
                  name="file-excel"
                  size={22}
                  color="#fff"
                />
                <Text style={styles.buttonText}>Excel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonPDF]}
                onPress={() => handleGerarPDF("Transações")}
              >
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={22}
                  color="#fff"
                />
                <Text style={styles.buttonText}>PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// 🎨 ESTILOS ORIGINAIS MANTIDOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  header: {
    backgroundColor: "#a30000",
    height: 90,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: "white",
  },
  iconContainer: {
    flexDirection: "row",
  },
  iconButton: {
    backgroundColor: "#600000",
    borderRadius: 50,
    padding: 8.5,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 2,
    marginRight: -5,
    marginLeft: 15,
  },
  scrollContent: {
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardInfo: {
    marginLeft: 10,
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
  },
  cardDesc: {
    color: "#555",
    fontSize: 13,
    marginTop: 3,
  },
  buttonColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 3,
  },
  buttonExcel: {
    backgroundColor: "#2e7d32",
  },
  buttonPDF: {
    backgroundColor: "#c62828",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
});
