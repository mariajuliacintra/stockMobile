import React from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useNavigation } from '@react-navigation/native';

function Home() {
  const navigation = useNavigation();
  return (
    <ImageBackground
      source={require("../img/fundo.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <Image source={require("../img/logo.png")} style={styles.logo} />
        <TouchableOpacity
          style={styles.buttonToCadastro}
          onPress={() => navigation.navigate("Cadastro")}
        >
          <Text style={styles.textButtonToCadastro}>Cadastre-se</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonToLogin}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.textButtonToLogin}>Login</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text style={styles.textBody}>
          Seja Bem-vindo ao site de Reservas do SENAI
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.textDesenvolvido}>
          &copy; Desenvolvido por: Vinicius Fogaça, Maria Júlia e Maria Fernanda
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    height: "10%",
    borderBottomColor: "white",
    borderBottomWidth: 3,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    width: "45%",
    height: "60%",
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 4,
    marginRight: "4%",
  },
  buttonToCadastro: {
    backgroundColor: "rgb(250, 24, 24)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 0,
    alignItems: "center",
    marginRight: "3%",
    borderColor: "white",
    borderWidth: 2,
  },
  textButtonToCadastro: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
  buttonToLogin: {
    backgroundColor: "rgb(250, 24, 24)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 0,
    alignItems: "center",
    marginRight: "3%",
    borderColor: "white",
    borderWidth: 2,
  },
  textButtonToLogin: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
  body: { height: "83%", width:"90%", alignItems: "center", justifyContent: "center" },
  textBody: {
    color: "white",
    fontSize: 85,
    fontWeight: "bold",
  },

  footer: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    height: "7%",
    borderTopColor: "white",
    borderTopWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    width: 500,
  },
  textDesenvolvido: { color: "white", fontWeight: "bold" },
});

export default Home;
