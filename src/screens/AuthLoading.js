import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function AuthLoading({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("tokenUsuario");
      if (token) {
        navigation.replace("Principal");
      } else {
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
