import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function AuthLoading({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("tokenUsuario");

      if (token) {
        // Usuário autenticado → vai pra tela principal
        navigation.replace("Principal");
      } else {
        // Sem token → vai pra Home (onde abre o modal de login)
        navigation.replace("Home");
      }
    };

    checkAuth();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}
