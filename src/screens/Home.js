import React from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

function Home({ navigation }) {
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
    height: 80,
    borderBottomColor: "white",
    borderBottomWidth: 3,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  logo: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    width: 155,
    height: 45,
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 4,
    marginRight: 90,
  },
  buttonToCadastro: {
    backgroundColor: "rgb(250, 24, 24)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 0,
    alignItems: "center",
    marginRight: 15,
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
    marginRight: 20,
    borderColor: "white",
    borderWidth: 2,
  },
  textButtonToLogin: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
  backgroundBody: { height: "70%" },
  body: {},
  textBody: {
    color: "white",
    fontSize: 80,
    fontWeight: "bold",
    marginLeft: 50,
    marginTop: 130,
  },

  footer: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    height: 60,
    borderTopColor: "white",
    borderTopWidth: 3,
    marginTop: 165,
    justifyContent: "center",
    alignItems: "center",
    width: 500,
  },
  textDesenvolvido: { color: "white", fontWeight: "bold" },
});

export default Home;
