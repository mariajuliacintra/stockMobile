import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
} from "react-native";
import { StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo from "../img/logo.png";
import api from "../services/axios";
import { useNavigation } from "@react-navigation/native";

function Perfil() {
  const [reservas, setReservas] = useState([]);
  const [reservaSelecionada, setReservaSelecionada] = useState("");
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
                style={{ ...styles.textField, marginTop: 16, flex: 1 }}
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

            <View style={styles.selectContainer}>
              <Picker
                selectedValue={reservaSelecionada}
                onValueChange={(itemValue) => {
                  if (itemValue === "verTodas") {
                    console.log("Ver todas as reservas");
                  } else {
                    setReservaSelecionada(itemValue);
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item
                  label="Selecione uma reserva"
                  value=""
                  enabled={false}
                />
                {reservas.length > 0 ? (
                  reservas.map((reserva) => (
                    <Picker.Item
                      key={reserva.id} // A chave única deve ser garantida aqui
                      label={`${reserva.sala} - ${reserva.data}`}
                      value={reserva.id}
                    />
                  ))
                ) : (
                  <Picker.Item label="Nenhuma reserva encontrada" value="" />
                )}
                <Picker.Item label="Ver todas as reservas" value="verTodas" />
              </Picker>
            </View>

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
  body:{
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
    height: "8%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    fontSize: 17,
    color: "gray",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: "8%",
  },
  visibilityButton: {
    padding: 10,
    position: "absolute",
    right: 15,
    top: 10,
  },
  selectContainer: {
    width: "100%",
    marginTop: 16,
  },
  picker: {
    width: "100%",
    height: 55,
    backgroundColor: "white",
    borderColor: "#ccc",
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    fontSize: 12,
    color: "gray",
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
