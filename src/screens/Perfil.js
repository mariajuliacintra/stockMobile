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
import logo from "../img/logo.png";
import api from "../services/axios";
import { useNavigation } from "@react-navigation/native";

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

  const recuperarDados = async () => {
    try {
      const email = await AsyncStorage.getItem("email");
      if (email !== null) {
        console.log("E-mail: ", email);
      }
    } catch (erro) {
      console.error("Erro ao recuperar dados:", erro);
    }
  };

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const email = await AsyncStorage.getItem("email");
        if (!email) return;

        const responseUsuario = await api.getUsuarioByEmail(email);
        setUsuario(responseUsuario.data.usuario);

        const responseReservas = await api.getUsuarioReservasByEmail(email);
        setReservas(responseReservas.data.reservas || []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchDados();
    recuperarDados();
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
              style={styles.selectContainer}
              onPress={() => setMostrarListaReservas(!mostrarListaReservas)}
            >
              <Text style={styles.selectText}>
                {reservaSelecionada
                  ? reservas.find((r) => r.id === reservaSelecionada)?.sala +
                    " - " +
                    reservas.find((r) => r.id === reservaSelecionada)?.data
                  : "Minhas Reservas"}
              </Text>
              <MaterialIcons
                name={mostrarListaReservas ? "arrow-drop-up" : "arrow-drop-down"}
                size={20}
                color="gray"
                style={styles.dropdownIcon}
              />
            </TouchableOpacity>

            {mostrarListaReservas && (
              <View style={styles.listaReservasContainer}>
                <ScrollView style={styles.listaReservasScroll}>
                  {reservas.length > 0 ? (
                    reservas.map((reserva) => (
                      <TouchableOpacity
                        key={reserva.id}
                        style={styles.itemReserva}
                        onPress={() => handleReservaSelecionada(reserva.id)}
                      >
                        <Text>
                          {reserva.sala} - {reserva.data}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text>Nenhuma reserva encontrada</Text>
                  )}
                  <TouchableOpacity
                    style={styles.itemReserva}
                    onPress={() => handleReservaSelecionada("verTodas")}
                  >
                    <Text>Ver todas as reservas</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              style={styles.buttonAtualizar}
              onPress={() => console.log("Atualizar Perfil")}
            >
              <Text style={styles.buttonText}>Atualizar Perfil</Text>
            </TouchableOpacity>
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
    marginTop: 16,
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
    backgroundColor: "rgb(222, 222, 222)",
    paddingVertical: "5%",
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
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 55,
    backgroundColor: "white",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  selectText: {
    fontSize: 17,
    color: "gray",
    flex: 2
  },
  dropdownIcon: {
    right: 10,
  },
  listaReservasContainer: {
    width: "100%",
    maxHeight: 200,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white",
    position: "absolute",
    top: 445,
    zIndex: 2,
  },
  listaReservasScroll: {
    flexGrow: 1,
  },
  itemReserva: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  buttonAtualizar: {
    marginTop: 16,
    backgroundColor: "rgba(255, 0, 0, 1)",
    width: 180,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
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