// UsersScreen.js

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
// ÍCONES
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; 
import { Feather, FontAwesome5 } from "@expo/vector-icons"; 

import sheets from "../services/axios"; 
import CreateUserModal from '../components/layout/CreateUserModal'; // 💡 Novo Modal
// Importe seu CustomModal real se ele não for globalmente acessível
// import CustomModal from "../components/mod/CustomModal"; 

const UsersScreen = () => {
  const { width, height } = useWindowDimensions();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false);

  // 💡 Funções de Alerta (Adapte para o seu CustomModal)
  const showCustomModal = (title, message, type = "info") => {
    // ESTA É UMA IMPLEMENTAÇÃO SIMPLIFICADA PARA O SEU CUSTOM MODAL. 
    // VOCÊ DEVE SUBSTITUIR ISSO PELA SUA LÓGICA REAL DE EXIBIÇÃO DO CustomModal.
    console.log(`[ALERTA - ${type.toUpperCase()}] ${title}: ${message}`);
    alert(`${title}: ${message}`); 
  };
  // Fim das Funções de Alerta
  
  // Estilos Dinâmicos do Cabeçalho (Baseado no PerfilScreen)
  const dynamicStyles = StyleSheet.create({
    topBar: {
      backgroundColor: "rgba(177, 16, 16, 1)",
      height: height * 0.1,
      borderBottomColor: "white",
      borderBottomWidth: 3,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      width: width,
      paddingRight: width * 0.06,
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 10,
    },
  });

  // 💡 Lógica de Requisição (Função getAllUsers)
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await sheets.getAllUsers(1, 10);

      if (response.data && response.data.success) {
        const paginationObject = response.data.data[0];
        // Mapeia os dados para simplificar o 'role', como no protótipo (Comum/Administrador)
        const userList = (paginationObject?.users || []).map(user => ({
            ...user,
            displayRole: user.role === 'manager' ? 'Administrador' : 'Comum'
        }));

        if (Array.isArray(userList)) {
          setUsers(userList);
        } else {
          setError("Erro: Estrutura de dados inválida da API.");
          setUsers([]);
        }
      } else {
        setError(response.data?.message || "Falha ao buscar usuários.");
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
    fetchUsers();
  }, []);

  const handleEditPress = (userId) => {
    console.log(`Editar Usuário: ${userId}`);
  };

  const handleDeletePress = (userId) => {
    console.log(`Deletar Usuário: ${userId}`);
  };

  const handleAddPress = () => {
    // 💡 Abre o modal de criação de usuário
    setCreateUserModalVisible(true);
  };
  
  // 💡 Função para recarregar a lista após o sucesso do registro/verificação
  const handleUserRegistrationSuccess = () => {
      showCustomModal("Sucesso", "A lista será recarregada para mostrar o novo usuário.", "success");
      fetchUsers();
  };


  // Componente de Cabeçalho (Baseado no PerfilScreen)
  const AppHeader = () => (
    <View style={dynamicStyles.topBar}>
      {/* Botão home (Adapte a navegação para sua rota "Principal" ou similar) */}
      <TouchableOpacity onPress={() => console.log('Navegar para Principal')}>
        <MaterialCommunityIcons name="home-circle-outline" size={60} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // Função para renderizar cada item da lista
  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          Nome do Usuário: {item.name || 'N/A'}
        </Text>
        <Text style={styles.userRole}>
          Cargo: {item.displayRole || 'Comum'}
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


  // --- Renderização Condicional ---

  if (isLoading) {
    return (
      <View style={styles.fullScreenContainer}>
        <AppHeader />
        <View style={[styles.cardContainer, styles.loadingCard, { marginTop: height * 0.12 }]}>
            <ActivityIndicator size="large" color="rgba(177, 16, 16, 1)" />
            <Text style={styles.loadingText}>Carregando Usuários...</Text>
        </View>
      </View>
    );
  }

  // Conteúdo principal (Lista ou "Nenhum Usuário")
  const listContent = users.length === 0 ? (
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
    />
  );
  
  return (
    <View style={styles.fullScreenContainer}>
      {/* Cabeçalho Fixo */}
      <AppHeader />
      
      {/* Conteúdo da Tela */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
          {/* Cabeçalho do Card: "Lista de Usuários" + Ícone de Adição */}
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Lista de Usuários</Text>
            {/* 💡 Botão Verde para Criar Usuário */}
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

      {/* 💡 Modal de Criação de Usuário */}
      <CreateUserModal 
          visible={createUserModalVisible}
          onClose={() => setCreateUserModalVisible(false)}
          showCustomModal={showCustomModal} // Passa a função de alerta
          onRegistrationSuccess={handleUserRegistrationSuccess} // Recarrega a lista
      />
      
    </View>
  );
};

export default UsersScreen;

// ----------------------------------------------------------------------
// --- ESTILOS ---
// ----------------------------------------------------------------------

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#d9d9d9", // Fundo cinza claro
  },
  
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 90, // Espaço para o cabeçalho fixo
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    borderColor: '#e0e0e0',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 5,
  },

  // Estilos de Estado
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    textDecorationLine: "underline",
  },
  noUsersContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noUsers: {
    fontSize: 16,
    color: "#999",
    fontStyle: 'italic',
  },
});