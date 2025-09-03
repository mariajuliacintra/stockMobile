import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Image,
  useWindowDimensions,
  Alert,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import sheets from '../services/axios'; // Importe o objeto 'sheets' do seu arquivo axios.js
import * as SecureStore from 'expo-secure-store';

export default function PerfilScreen() {
  const navigation = useNavigation();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null); // O ID do usuário será definido após carregar o token

  const { width, height } = useWindowDimensions();

  // Função para buscar os dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      // Obter o token e o ID do usuário de forma segura
      const token = await SecureStore.getItemAsync("tokenUsuario");
      // Você precisará de uma forma de obter o ID do usuário (talvez do token, ou de um contexto de autenticação)
      // Por exemplo, decodificando o token ou de um estado global
      const loggedInUserId = "obtenha_seu_id_aqui"; 
      setUserId(loggedInUserId);

      if (!loggedInUserId || !token) {
        Alert.alert("Erro", "Você precisa estar logado para acessar esta página.");
        navigation.navigate("Login");
        return;
      }

      try {
        const response = await sheets.getUsuarioById(loggedInUserId);
        
        if (response.data && response.data.user) {
          setNome(response.data.user.name);
          setEmail(response.data.user.email);
        } else {
          Alert.alert("Erro", "Dados do usuário não encontrados.");
        }
        
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error.response?.data || error.message);
        Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
      }
    };

    fetchUserData();
  }, [navigation]);

  // Função para atualizar o perfil
  const handleUpdateUser = async () => {
    if (!nome || !email) {
      Alert.alert("Erro", "Nome e e-mail não podem ser vazios.");
      return;
    }

    try {
      const dadosAtualizados = { name: nome, email: email };
      const response = await sheets.putAtualizarUsuario(userId, dadosAtualizados);
      
      Alert.alert("Sucesso", response.data.message);
      
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível atualizar o perfil. " + (error.response?.data?.error || ""));
    }
  };

  const dynamicStyles = StyleSheet.create({
    background: {
      flex: 1,
      width,
      height,
      alignItems: "center",
    },
    header: {
      backgroundColor: "rgba(177, 16, 16, 1)",
      height: height * 0.1,
      borderBottomColor: "white",
      borderBottomWidth: 3,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      width: width,
      paddingRight: width * 0.06,
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 1)",
      padding: width * 0.06,
      borderRadius: 15,
      width: width * 0.85,
      maxWidth: 400,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 10,
      marginTop: height * 0.12,
    },
    logo: {
      width: width * 0.6,
      height: width * 0.25,
      resizeMode: "contain",
      marginBottom: height * 0.02,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      borderWidth: 1,
      borderColor: "#ddd",
      backgroundColor: "#f5f5f5",
      paddingVertical: height * 0.015,
      paddingHorizontal: width * 0.03,
      borderRadius: 8,
      marginBottom: height * 0.025,
    },
    inputField: {
      flex: 1,
      fontSize: width * 0.04,
      color: "#333",
      paddingVertical: 0,
    },
    button: {
      backgroundColor: "rgb(177, 16, 16)",
      paddingVertical: height * 0.02,
      paddingHorizontal: width * 0.08,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 6,
      marginBottom: height * 0.015,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: width * 0.045,
    },
    link: {
      fontSize: width * 0.045,
      color: "rgb(152, 0, 0)",
      fontWeight: "bold",
      textDecorationLine: "underline",
    },
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        style={dynamicStyles.background}
        source={require("../img/fundo.png")}
      >
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Principal")}>
            <MaterialCommunityIcons
              name="home-circle-outline"
              size={60}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.card}>
          <Image
            source={require("../img/logo.png")}
            style={dynamicStyles.logo}
            resizeMode="contain"
          />

          <View style={dynamicStyles.inputContainer}>
            <TextInput
              style={dynamicStyles.inputField}
              placeholder="Nome"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={dynamicStyles.inputContainer}>
            <TextInput
              style={dynamicStyles.inputField}
              placeholder="E-mail"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity style={dynamicStyles.button} onPress={handleUpdateUser}>
            <Text style={dynamicStyles.buttonText}>Editar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={dynamicStyles.link}>Meus pedidos</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
