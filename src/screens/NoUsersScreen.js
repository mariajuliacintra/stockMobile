import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import EditUserModal from "../components/layout/EditUserModal";
import CreateUserModal from "../components/layout/CreateUserModal";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import sheets from "../services/axios";
import ConfirmarDelecaoModal from "../components/mod/ConfirmarDelecaoModal";
import Pagination from "../components/mod/Pagination";

const UsersScreen = () => {
  const navigation = useNavigation();
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const { width, height } = useWindowDimensions();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const showCustomModal = (title, message, type = "info") => {};

  const dynamicStyles = StyleSheet.create({
    topBar: {
      backgroundColor: "rgba(177, 16, 16, 1)",
      height: 90,
      borderBottomColor: "white",
      borderBottomWidth: 3,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      width: width,
      paddingRight: width * 0.06,
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 10,
    },
  });

  // Lógica de Requisição
  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
  

      const response = await sheets.getAllUsers(page, 8);

  
      const usersData = response.data?.users || [];
      const paginationData = response.data?.pagination || {};
  
      if (usersData.length > 0) {
        const userList = usersData.map((user) => ({
          ...user,
          displayRole: user.role === "manager" ? "Administrador" : "Comum",
        }));
  
        setUsers(userList);
        setCurrentPage(paginationData.currentPage || 1);
        setTotalPages(paginationData.totalPages || 1);
      } else {
        setError("Nenhum usuário encontrado.");
        setUsers([]);
      }
    } catch (err) {
      let errorMessage = "Erro de Conexão. Verifique sua rede e o servidor.";
      if (err.response) {
        errorMessage = `Erro HTTP ${err.response.status}: ${err.response.data?.message || err.message}`;
      }
      setError(errorMessage);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };  
  

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditPress = (userId) => {
    const user = users.find((u) => String(u.idUser) === String(userId));
    if (user) {
      setUserToEdit(user);
      setEditUserModalVisible(true);
    } else {
      showCustomModal("Erro", "Usuário não encontrado.", "error");
    }
  };

  const handleDeletePress = (userId) => {
    const user = users.find((u) => String(u.idUser) === String(userId));
    if (user) {
      setUserToDelete(user);
      setDeleteModalVisible(true);
    } else {
      showCustomModal("Erro", "Usuário não encontrado para deleção.", "error");
    }
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      executeDeleteUser(userToDelete.idUser);
      setDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };

  const executeDeleteUser = async (userId) => {
    setIsLoading(true);

    try {
      const storedToken = await SecureStore.getItemAsync("tokenUsuario");

      if (!userId || !storedToken) {
        showCustomModal(
          "Erro",
          "Dados de usuário ou token de acesso ausentes.",
          "error"
        );
        return;
      }

      const headers = { Authorization: storedToken };
      const response = await sheets.deleteUsuario(userId, { headers });

      if (response.data?.success) {
        showCustomModal(
          response.data.message || "Sucesso",
          response.data.details || "Usuário deletado com sucesso.",
          "success"
        );
        fetchUsers();
      } else {
        showCustomModal(
          "Erro",
          response.data.error || "Erro ao deletar usuário",
          "error"
        );
      }
    } catch (error) {
      showCustomModal("Erro", "Não foi possível deletar o usuário.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPress = () => {
    setCreateUserModalVisible(true);
  };

  const handleUserRegistrationSuccess = () => {
    showCustomModal(
      "Sucesso",
      "A lista será recarregada para mostrar o novo usuário.",
      "success"
    );
    fetchUsers();
  };
  const handleUserUpdateSuccess = () => {
    fetchUsers();
    setEditUserModalVisible(false);
  };

  const handleNavigateToHome = () => {
    navigation.navigate("Principal");
  };

  const AppHeader = () => (
    <View style={dynamicStyles.topBar}>
      <TouchableOpacity
        onPress={handleNavigateToHome}
        style={styles.home}
      >
        <Entypo name="home" size={40} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          Nome do Usuário: {item.name || "N/A"}
        </Text>
        <Text style={styles.userRole}>
          Cargo: {item.displayRole || "Comum"}
        </Text>
      </View>

      <View style={styles.actionIcons}>
        <TouchableOpacity
          onPress={() => handleEditPress(item.idUser)}
          style={styles.iconButton}
        >
          <Feather name="edit-2" size={18} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeletePress(item.idUser)}
          style={styles.iconButton}
        >
          <FontAwesome5 name="trash-alt" size={18} color="#D9534F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.fullScreenContainer}>
        <AppHeader />
        <View style={styles.loadingWrapper}>
          <View style={[styles.cardContainer, styles.loadingCard]}>
            <ActivityIndicator size="large" color="rgba(177, 16, 16, 1)" />
            <Text style={styles.loadingText}>Carregando Usuários...</Text>
          </View>
        </View>
      </View>
    );
  }

  const listContent =
    users.length === 0 ? (
      <View style={styles.noUsersContent}>
        <Text style={styles.noUsers}>Nenhum usuário encontrado</Text>
        <TouchableOpacity onPress={fetchUsers} style={{ marginTop: 10 }}>
          <Text style={styles.retryText}>Recarregar Lista</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.idUser)}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        scrollEnabled={false}
        nestedScrollEnabled={true}
      />
    );

  return (
    <View style={styles.fullScreenContainer}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
      >
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Lista de Usuários</Text>
            <TouchableOpacity onPress={handleAddPress}>
              <Feather name="plus-square" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.noUsersContent}>
              <Text style={styles.errorText}>❌ {error}</Text>
              <TouchableOpacity onPress={fetchUsers}>
                <Text style={styles.retryText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            listContent
          )}
        </View>
      </ScrollView>

      <CreateUserModal
        visible={createUserModalVisible}
        onClose={() => setCreateUserModalVisible(false)}
        showCustomModal={showCustomModal}
        onRegistrationSuccess={handleUserRegistrationSuccess}
      />
      <EditUserModal
        visible={editUserModalVisible}
        onClose={() => setEditUserModalVisible(false)}
        showCustomModal={showCustomModal}
        user={userToEdit}
        onUpdateSuccess={handleUserUpdateSuccess}
      />

      <ConfirmarDelecaoModal
        visible={deleteModalVisible}
        title="Excluir Usuário"
        message={
          userToDelete
            ? `Tem certeza que deseja excluir o usuário "${userToDelete.name}"? Esta ação é irreversível.`
            : "Confirme a exclusão deste usuário."
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setUserToDelete(null);
        }}
      />
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </View>
  );
};

export default UsersScreen;

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#d9d9d9",
  },

  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  home: {
    backgroundColor: "#600000",
    borderRadius: 50,
    padding: 8.5,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 2,
    marginRight: -15,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 90,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },

  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  userItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E2A3A",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: "#6B7280",
  },

  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 5,
  },

  loadingCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "#D9534F",
    textAlign: "center",
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 14,
    color: "#007BFF",
    marginTop: 5,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  noUsersContent: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noUsers: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
  },
});
