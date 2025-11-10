import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import api from "../../services/axios"; 

export default function TransactionModal({ visible, onClose, userId }) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (visible && userId) {
      fetchTransactions();
    }
  }, [visible, userId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.TransactionUser(userId);
  
      if (response.data?.success) {
        setTransactions(response.data.transactions || response.data.data || []);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };
  

  const Transaction = ({ item }) => {
    const acao = item.actionDescription === "IN" ? "Entrada" : "Saída";
  
    return (
      <View style={styles.transactionCard}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.detail}>
          Data: {new Date(item.transactionDate).toLocaleDateString("pt-BR")}
        </Text>
        <Text style={styles.detail}>
          Quantidade alterada: {item.quantityChange}
        </Text>
        <Text style={styles.detail}>
          Saldo atual: {item.newQuantity}
        </Text>
        <Text style={styles.detail}>Usuário: {item.userName}</Text>
        <Text style={styles.detail}>Ação: {acao}</Text>
      </View>
    );
  };
  

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Minhas Transações</Text>

          {loading ? (
            <ActivityIndicator size="large" color="rgb(177,16,16)" />
          ) : transactions.length > 0 ? (
            <FlatList
              data={transactions}
              keyExtractor={(item) => String(item.idTransaction)}
              renderItem={Transaction}
              style={{ width: "100%" }}
            />
          ) : (
            <Text style={styles.noData}>Nenhuma transação encontrada.</Text>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    container: {
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 25,
      width: "95%",
      maxHeight: "85%",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: "rgb(177,16,16)",
      marginBottom: 20,
      textAlign: "center",
    },
    transactionCard: {
      backgroundColor: "#f0f0f0",
      padding: 15,
      borderRadius: 12,
      marginBottom: 12,
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    itemName: {
      fontSize: 17,
      fontWeight: "600",
      color: "#222",
      marginBottom: 5,
    },
    detail: {
      fontSize: 14,
      color: "#555",
    },
    noData: {
      fontSize: 16,
      color: "#aaa",
      marginTop: 30,
      textAlign: "center",
    },
    closeButton: {
      marginTop: 20,
      backgroundColor: "rgb(177,16,16)",
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
    closeText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
      textAlign: "center",
    },
  });
  

