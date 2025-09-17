import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import sheets from "../services/axios";
import * as SecureStore from "expo-secure-store";
import ConfirmPasswordModal from "../components/layout/ConfirmPasswordModal";
import VerifyCodeModal from "../components/layout/VerificationModal";
import CustomModal from "../components/mod/CustomModal"; 
import DelecaoModal from '../components/mod/ConfirmarDelecaoModal';

export default function PerfilScreen() {
  const navigation = useNavigation();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [senhaModalVisible, setSenhaModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { width, height } = useWindowDimensions();

  // Estados para CustomModal (snackbar/alertas)
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customModalTitle, setCustomModalTitle] = useState("");
  const [customModalMessage, setCustomModalMessage] = useState("");
  const [customModalType, setCustomModalType] = useState("info");

  // Estado para confirmação de exclusão
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const showCustomModal = (title, message, type = "info") => {
    setCustomModalTitle(title);
    setCustomModalMessage(message);
    setCustomModalType(type);
    setCustomModalVisible(true);
  };
  const onDismissCustomModal = () => setCustomModalVisible(false);

  useEffect(() => {
    const fetchUserData = async () => {
      // 🕵️‍♂️ LOG 1: Iniciando a busca pelos dados do usuário
      console.log("useEffect: Iniciando a busca pelos dados do usuário.");
      try {
        const storedUserData = await SecureStore.getItemAsync("user");

        // 🕵️‍♂️ LOG 2: Mostrando o valor bruto do SecureStore
        console.log("SecureStore: Valor bruto para a chave 'user':", storedUserData);

        if (storedUserData) {
          const userData = JSON.parse(storedUserData)[0];
          
          // 🕵️‍♂️ LOG 3: Mostrando o objeto do usuário após o JSON.parse
          console.log("JSON.parse: Dados do usuário processados:", userData);

          setNome(userData.name || "");
          setEmail(userData.email || "");
          setCurrentEmail(userData.email || "");

          // 🕵️‍♂️ LOG 4: Verificando se os estados foram definidos
          console.log("Estado 'nome' definido para:", userData.name);
          console.log("Estado 'email' definido para:", userData.email);

        } else {
          // 🕵️‍♂️ LOG 5: Caso não encontre dados
          console.log("SecureStore: Nenhum dado de usuário encontrado.");
          showCustomModal("Erro", "Usuário não encontrado, faça login novamente.", "error");
          navigation.navigate("Login");
        }
      } catch (error) {
        // 🕵️‍♂️ LOG 6: Em caso de erro
        console.error("Erro ao carregar dados do usuário:", error.message, error);
        showCustomModal("Erro", "Não foi possível carregar os dados do usuário.", "error");
      }
    };
    fetchUserData();
  }, [navigation]);
  
  const handleValidatePasswordAndEnableEdit = async (senhaAtual) => {
  try {
    const storedUser = await SecureStore.getItemAsync("user");
    const storedToken = await SecureStore.getItemAsync("tokenUsuario"); // 👈 O token está sendo recuperado aqui.

    if (!storedUser || !storedToken) {
      console.error("Erro: Usuário ou token de autenticação não encontrado.");
      return false;
    }

    const user = JSON.parse(storedUser)[0]; // 👈 A correção que fizemos antes
    const idUser = user.idUser;

    // 💡 O ponto crucial: crie um objeto de headers e inclua o token JWT.
    const headers = {
      'Authorization': `Bearer ${storedToken}`,
      'Content-Type': 'application/json'
    };

    const response = await sheets.postValidatePassword(
      idUser,
      { password: senhaAtual },
      { headers: headers } // 👈 Envie o objeto de headers com a requisição.
    );

    return response.data.isValid;
  } catch (error) {
    console.error("Erro ao validar senha:", error.response?.data || error.message);
    return false;
  }
};

  const handleUpdateUser = async () => {
    console.log("handleUpdateUser: Iniciando atualização do usuário.");
    if (newPassword && newPassword !== confirmNewPassword) {
      showCustomModal("Erro", "A confirmação de senha não corresponde à nova senha.", "error");
      return;
    }
    setLoading(true);
    try {
      const storedUser = await SecureStore.getItemAsync("user");
      if (!storedUser) {
        console.error("handleUpdateUser: Erro, usuário não encontrado para atualização.");
        throw new Error("Usuário não encontrado");
      }
      const user = JSON.parse(storedUser);
      const idUser = user.idUser;
      const dadosAtualizados = {
        name: nome,
        email: email,
      };
      if (newPassword) {
        dadosAtualizados.password = newPassword;
        dadosAtualizados.confirmPassword = confirmNewPassword;
      }
      console.log("handleUpdateUser: Enviando dados para a API:", dadosAtualizados);
      
      const response = await sheets.putAtualizarUsuario(idUser, dadosAtualizados);
      console.log("handleUpdateUser: Resposta da API de atualização:", response.data);

      if (response.data && response.data.requiresEmailVerification) {
        setVerifyModalVisible(true);
      } else if (response.data && response.data.user) {
        console.log("handleUpdateUser: Atualização local do usuário no SecureStore.");
        await SecureStore.setItemAsync("user", JSON.stringify(response.data.user));
        showCustomModal("Sucesso", response.data.message || "Perfil atualizado!", "success");
        setNewPassword("");
        setConfirmNewPassword("");
        setIsEditing(false);
      } else {
        showCustomModal("Erro", response.data.message || "Resposta da API incompleta. Perfil pode não ter sido atualizado corretamente.", "error");
      }
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error.response?.data || error.message);
      showCustomModal("Erro", "Não foi possível atualizar o perfil.", "error");
    } finally {
      setLoading(false);
      console.log("handleUpdateUser: Processo de atualização finalizado.");
    }
  };

  const handleDeleteUser = async () => {
    console.log("handleDeleteUser: Iniciando exclusão do usuário.");
    try {
      const storedUser = await SecureStore.getItemAsync("user");
      if (!storedUser) {
        console.error("handleDeleteUser: Erro, usuário não encontrado para exclusão.");
        throw new Error("Usuário não encontrado");
      }
      const user = JSON.parse(storedUser);
      const idUser = user.idUser;

      const response = await sheets.deleteUsuario(idUser);
      console.log("handleDeleteUser: Resposta da API de exclusão:", response.data);

      if (response.data && response.data.auth) {
        await SecureStore.deleteItemAsync("user");
        await SecureStore.deleteItemAsync("tokenUsuario");
        console.log("handleDeleteUser: Dados do usuário deletados do SecureStore.");

        showCustomModal("Sucesso", response.data.message || "Conta deletada!", "success");

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Principal" }],
          });
        }, 1500);

      } else {
        showCustomModal("Erro", response.data.error || "Erro ao deletar usuário", "error");
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error.response?.data || error.message);
      showCustomModal("Erro", "Não foi possível deletar o usuário.", "error");
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const handleVerifyEmailCode = async (code) => {
    console.log("handleVerifyEmailCode: Iniciando verificação de código.");
    try {
      const storedUser = await SecureStore.getItemAsync("user");
      if (!storedUser) throw new Error("Usuário não encontrado");
      const user = JSON.parse(storedUser);

      const response = await sheets.postVerifyUpdate({
        email: email,
        code: code,
      });
      console.log("handleVerifyEmailCode: Resposta da verificação:", response.data);

      if (response.data.auth && response.data.user) {
        await SecureStore.setItemAsync("user", JSON.stringify(response.data.user));
        console.log("handleVerifyEmailCode: E-mail atualizado e salvo localmente.");
        return { success: true, message: response.data.message || "E-mail atualizado com sucesso!" };
      } else {
        return { success: false, error: response.data.error || "Código de verificação inválido." };
      }
    } catch (error) {
      console.error("handleVerifyEmailCode: Erro ao verificar o código:", error.response?.data?.error || error.message);
      return { success: false, error: error.response?.data?.error || "Erro ao verificar o código." };
    }
  };

  const dynamicStyles = StyleSheet.create({
    background: { flex: 1, width, height, alignItems: "center" },
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
    logo: { width: width * 0.6, height: width * 0.25, resizeMode: "contain", marginBottom: height * 0.02 },
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
    inputField: { flex: 1, fontSize: width * 0.04, color: "#333", paddingVertical: 0 },
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
    buttonText: { color: "white", fontWeight: "bold", fontSize: width * 0.045 },
    link: { fontSize: width * 0.045, color: "rgb(152, 0, 0)", fontWeight: "bold", textDecorationLine: "underline" },
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground style={dynamicStyles.background} source={require("../img/fundo.png")}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Principal")}>
            <MaterialCommunityIcons name="home-circle-outline" size={60} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.card}>
          <Image source={require("../img/logo.png")} style={dynamicStyles.logo} resizeMode="contain" />

          <View style={dynamicStyles.inputContainer}>
            <TextInput
              style={dynamicStyles.inputField}
              placeholder="Nome"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
              editable={isEditing}
              selectTextOnFocus={isEditing}
            />
          </View>

          <View style={dynamicStyles.inputContainer}>
            <TextInput
              style={dynamicStyles.inputField}
              placeholder="E-mail"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              editable={isEditing}
              keyboardType="email-address"
            />
          </View>

          {isEditing && (
            <>
              <View style={dynamicStyles.inputContainer}>
                <TextInput
                  style={dynamicStyles.inputField}
                  placeholder="Nova Senha"
                  placeholderTextColor="#999"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
              <View style={dynamicStyles.inputContainer}>
                <TextInput
                  style={dynamicStyles.inputField}
                  placeholder="Confirmar Nova Senha"
                  placeholderTextColor="#999"
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  secureTextEntry
                />
              </View>
            </>
          )}

          {isEditing ? (
            <TouchableOpacity
              style={dynamicStyles.button}
              onPress={handleUpdateUser}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={dynamicStyles.buttonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={dynamicStyles.button} onPress={() => setSenhaModalVisible(true)}>
              <Text style={dynamicStyles.buttonText}>Editar perfil</Text>
            </TouchableOpacity>
          )}

          {/* Botão para abrir modal de confirmação */}
          <TouchableOpacity
            style={[dynamicStyles.button, { backgroundColor: "red" }]}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text style={dynamicStyles.buttonText}>Deletar Perfil</Text>
          </TouchableOpacity>
        </View>

        <ConfirmPasswordModal
          visible={senhaModalVisible}
          onValidatePassword={handleValidatePasswordAndEnableEdit}
          onCancel={() => setSenhaModalVisible(false)}
        />

        <VerifyCodeModal
          visible={verifyModalVisible}
          onClose={() => setVerifyModalVisible(false)}
          formData={{ email: email || currentEmail || "" }} // garante que sempre tenha um valor
          onVerificationSuccess={async () => {
            // Atualiza o usuário no SecureStore após verificação
            try {
              const storedUser = await SecureStore.getItemAsync("user");
              if (storedUser) {
                const user = JSON.parse(storedUser);
                user.email = email; // atualiza o email
                await SecureStore.setItemAsync("user", JSON.stringify(user));
              }
              showCustomModal("Sucesso", "E-mail atualizado com sucesso!", "success");
            } catch (error) {
              showCustomModal("Erro", "Não foi possível atualizar os dados localmente.", "error");
            }
            setVerifyModalVisible(false);
          }}
        />

      <DelecaoModal
  visible={deleteModalVisible}
  title="Confirmação"
  message="Tem certeza que deseja excluir sua conta? Esta ação é irreversível."
  onConfirm={handleDeleteUser}
  onCancel={() => setDeleteModalVisible(false)}
/>

<CustomModal
  open={customModalVisible}
  onClose={onDismissCustomModal}
  title={customModalTitle}
  message={customModalMessage}
  type={customModalType}
/>

        <CustomModal
          open={customModalVisible}
          onClose={onDismissCustomModal}
          title={customModalTitle}
          message={customModalMessage}
          type={customModalType}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Seus estilos estáticos podem ir aqui para evitar recriação
});