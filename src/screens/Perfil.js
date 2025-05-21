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
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';


import ReservasUsuarioModal from "../components/ReservasUsuarioModal";

import logo from "../img/logo.png";
import api from "../services/axios";
  

function Perfil() {
  const [reservas, setReservas] = useState([]);
  const [reservaSelecionada, setReservaSelecionada] = useState("");
  const [mostrarListaReservas, setMostrarListaReservas] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigation = useNavigation();
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

        const responseReservas = await api.getUsuarioReservasById(idUsuario);
        setReservas(responseReservas.data.reservas || []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchDados();
  }, []);

  const handleReservaSelecionada = (reservaId) => {
    if (reservaId === "verTodas") {
      console.log("Ver todas as reservas");
      setReservaSelecionada(""); // Ou defina para um valor que indique "ver todas"
    } else {
      setReservaSelecionada(reservaId);
    }
    setMostrarListaReservas(false); // Oculta a lista após a seleção
  };

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
              editable={false}
              value={usuario.nome || ""}
              style={styles.textField}
            />
            <TextInput
              placeholder="e-mail"
              editable={false}
              value={usuario.email || ""}
              style={styles.textField}
            />
            <TextInput
              placeholder="NIF"
              editable={false}
              value={usuario.NIF || ""}
              style={styles.textField}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                secureTextEntry={!mostrarSenha}
                placeholder="senha"
                editable={false}
                value={usuario.senha || ""}
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
            <TouchableOpacity
            style={styles.buttonAtualizar}
              onPress={() => console.log("Atualizar Perfil")}
            >
            <Text style={styles.buttonText}>Atualizar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonMinhasReservas}
              onPress={() => setMostrarListaReservas(true)}
            >
              <Text style={styles.buttonTextMinhasReservas}>Minhas Reservas</Text>
            </TouchableOpacity>

            <ReservasUsuarioModal
              visible={mostrarListaReservas}
              onClose={() => setMostrarListaReservas(false)}
              reservas={reservas}
              onSelecionar={(reservaId) => {
                handleReservaSelecionada(reservaId);
                setMostrarListaReservas(false);
              }}
            />
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
  buttonMinhasReservas: {
    marginTop: 2,
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
  buttonAtualizar:{
    marginTop: 16,
    backgroundColor: "rgba(255, 0, 0, 1)",
    width: 180,
    backgroundColor: "rgb(199, 0, 0)",
    width: "50%",
    height: 45,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText:{
    color: "white",
    padding: 2,
    marginTop:8,
    fontWeight: "610",
    fontSize: 15,
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

export default Perfil;