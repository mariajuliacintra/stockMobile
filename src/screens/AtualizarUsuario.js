import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import ReservasUsuarioModal from "../components/ReservasUsuarioModal";

import logo from "../img/logo.png";
import api from "../services/axios";

function AtualizarUsuario() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigation = useNavigation();
  const [editando, setEditando] = useState(false); // novo estado
  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    NIF: "",
    senha: "",
  });

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const idUsuario = await AsyncStorage.getItem("idUsuario");
        if (!idUsuario) return;

        const responseUsuario = await api.getUsuarioById(idUsuario);
        setUsuario(responseUsuario.data.usuario);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    const handleAtualizarPerfil = async () => {
        try {
          const idUsuario = await AsyncStorage.getItem("idUsuario");
          if (!idUsuario) return;
    
          await api.atualizarUsuario(idUsuario, usuario);
          alert("Perfil atualizado com sucesso!");
          setEditando(false);
        } catch (error) {
          console.error("Erro ao atualizar perfil:", error);
          alert("Erro ao atualizar o perfil.");
        }
      };
    

    fetchDados();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require("../img/fundo.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Principal")}
            style={styles.buttonToPrincipal}
          >
            <MaterialIcons
              name="exit-to-app"
              style={styles.IconeLogout}
              size={35}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <View style={styles.form}>
            <Image source={logo} style={styles.logo} />
            <TextInput
              placeholder="nome"
              editable={editando}
              value={usuario.nome}
              onChangeText={(text) => setUsuario({ ...usuario, nome: text })}
              style={styles.textField}
            />
            <TextInput
              placeholder="e-mail"
              editable={editando}
              value={usuario.email}
              onChangeText={(text) => setUsuario({ ...usuario, email: text })}
              style={styles.textField}
            />
            <TextInput
              placeholder="NIF"
              editable={editando}
              value={usuario.NIF}
              onChangeText={(text) => setUsuario({ ...usuario, NIF: text })}
              style={styles.textField}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                secureTextEntry={!mostrarSenha}
                placeholder="senha"
                editable={editando}
                value={usuario.senha}
                onChangeText={(text) => setUsuario({ ...usuario, senha: text })}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setMostrarSenha((prev) => !prev)}
                style={styles.visibilityButton}
              >
                <MaterialIcons
                  name={mostrarSenha ? "visibility-off" : "visibility"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>

            {editando ? (
              <>
                <TouchableOpacity
                  style={styles.buttonAtualizar}
                  onPress={handleAtualizarPerfil}
                >
                  <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.buttonAtualizar, { backgroundColor: "#888" }]}
                  onPress={() => setEditando(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.buttonAtualizar}
                onPress={() => setEditando(true)}
              >
                <Text style={styles.buttonText}>Editar Perfil</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            &copy; Desenvolvido por: Vinicius Fogaça, Maria Júlia e Maria
            Fernanda
          </Text>
        </View>
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    width: "100%",
    height: "8%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomWidth: 3,
    borderBottomColor: "white",
  },
  buttonToPrincipal: {
    marginRight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  IconeLogout: {
    color: "white",
  },
  logo: {
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "contain",
    width: "100%",
    height: "13%",
    marginBottom: 25,
    marginTop: 45,
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 6,
  },
  body: {
    width: "100%",
    height: "84%",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(236, 236, 236, 0.72)",
    paddingVertical: "0%",
    paddingHorizontal: "8%",
    borderRadius: 10,
    width: "75%",
  },
  textField: {
    width: "100%",
    height: 55,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    fontSize: 17,
    color: "gray",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  passwordContainer: {
    width: "100%",
    height: 55,
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    fontSize: 17,
    color: "gray",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  passwordInput: {
    width: "100%",
    height: 55,
    fontSize: 17,
    color: "gray",
  },
  visibilityButton: {
    padding: 10,
    position: "absolute",
    right: 10,
  },
  buttonAtualizar: {
    marginTop: 16,
    backgroundColor: "rgb(199, 0, 0)",
    width: "50%",
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonMinhasReservas: {
    marginTop: 16,
    backgroundColor: "transparent",
    width: 180,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextMinhasReservas: {
    color: "rgb(155, 0, 0)",
    fontWeight: "600",
    fontSize: 17,
  },
  footer: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    width: "100%",
    height: "8%",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 3,
    borderTopColor: "white",
  },
  footerText: {
    color: "white",
    fontSize: 13,
  },
});

export default AtualizarUsuario;
