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
import DelecaoModal from "../components/mod/ConfirmarDelecaoModal";

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
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [userId, setUserId] = useState(null); // Estado centralizado para o ID do usuário
  const { width, height } = useWindowDimensions();

  // Estados que controlam a visibilidade e o conteúdo do CustomModal
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customModalTitle, setCustomModalTitle] = useState("");
  const [customModalMessage, setCustomModalMessage] = useState("");
  const [customModalType, setCustomModalType] = useState("info");

  // Estado para confirmação de exclusão
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // A função showCustomModal é a lógica que controla o estado do CustomModal.
  // Ela define o conteúdo e torna o modal visível.
  const showCustomModal = (title, message, type = "info") => {
    setCustomModalTitle(title);
    setCustomModalMessage(message);
    setCustomModalType(type);
    setCustomModalVisible(true);
  };
  const onDismissCustomModal = () => setCustomModalVisible(false);

  // Função auxiliar para obter os dados do usuário de forma consistente
  const getUserDataFromSecureStore = async () => {
    const storedUserData = await SecureStore.getItemAsync("user");
    if (storedUserData) {
      try {
        const userArray = JSON.parse(storedUserData);
        if (
          userArray &&
          userArray.length > 0 &&
          userArray[0] &&
          userArray[0].idUser
        ) {
          const userObject = userArray[0];
          return {
            ...userObject,
            idUser: parseInt(userObject.idUser, 10),
          };
        }
      } catch (e) {
        console.error("Erro ao parsear dados do usuário do SecureStore:", e);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("useEffect: Iniciando a busca pelos dados do usuário.");
      setIsDataLoading(true);
      try {
        const userData = await getUserDataFromSecureStore();

        if (userData && userData.idUser) {
          console.log("Dados do usuário processados:", userData);
          setNome(userData.name || "");
          setEmail(userData.email || "");
          setCurrentEmail(userData.email || "");
          setUserId(userData.idUser); // Define o userId no estado centralizado
          console.log("Estado 'nome' definido para:", userData.name);
          console.log("Estado 'email' definido para:", userData.email);
        } else {
          console.log("Nenhum dado de usuário ou ID válido encontrado.");
          showCustomModal(
            "Erro",
            "Usuário não encontrado ou ID inválido. Por favor, faça login novamente.",
            "error"
          );
          navigation.navigate("Login");
        }
      } catch (error) {
        console.error(
          "Erro ao carregar dados do usuário:",
          error.message,
          error
        );
        showCustomModal(
          "Erro",
          "Não foi possível carregar os dados do usuário.",
          "error"
        );
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchUserData();
  }, [navigation]);

const handleValidatePassword = async (senhaAtual) => {
  console.log("Iniciando validação de senha.");
  console.log("ID do usuário:", userId);
  try {
    const storedToken = await SecureStore.getItemAsync("tokenUsuario");
    console.log("Token do usuário obtido. Token existe?", !!storedToken);

    if (!userId || !storedToken) {
      console.error("Erro: Dados de usuário (ID) ou token de autenticação não encontrados.");
      showCustomModal("Erro", "Não foi possível encontrar o ID do usuário. Tente fazer login novamente.", "error");
      return false;
    }

    const headers = {
      'Authorization': `Bearer ${storedToken}`,
      'Content-Type': 'application/json'
    };

    console.log("Fazendo chamada à API para validar a senha...");
    const response = await sheets.postValidatePassword(
      userId,
      { password: senhaAtual },
      { headers }
    );
    console.log("Resposta da API de validação recebida:", response.data);

    // --- Normaliza o isValid conforme diferentes formatos possíveis ---
    let isValid = false;

    // 1) caso esperado simples: { isValid: true }
    if (typeof response.data?.isValid === "boolean") {
      isValid = response.data.isValid;
    }
    // 2) caso que seus logs mostram: { data: [{ isValid: true }], ... }
    else if (Array.isArray(response.data?.data) && typeof response.data.data[0]?.isValid === "boolean") {
      isValid = response.data.data[0].isValid;
    }
    // 3) caso { data: { isValid: true } }
    else if (typeof response.data?.data?.isValid === "boolean") {
      isValid = response.data.data.isValid;
    }
    // 4) fallback heurístico: success/details indicam validação bem-sucedida
    else if (response.data?.success === true && typeof response.data?.details === "string" &&
             response.data.details.toLowerCase().includes("válida")) {
      isValid = true;
    }

    console.log("isValid resolvido para:", isValid);
    return Boolean(isValid);
  } catch (error) {
    console.error("Ocorreu um erro na validação da senha.");
    if (error.response) {
      console.error("Detalhes do erro da API:", error.response.status, error.response.data);
      if (error.response?.status === 401 || (error.response?.data?.error === "Usuário não encontrado.")) {
        showCustomModal("Sessão Expirada", "Sua sessão expirou ou o usuário não foi encontrado. Por favor, faça login novamente.", "error");
        await SecureStore.deleteItemAsync("user");
        await SecureStore.deleteItemAsync("tokenUsuario");
        setTimeout(() => {
          navigation.navigate("Login");
        }, 1500);
      } else {
        showCustomModal("Erro", "Erro ao validar senha.", "error");
      }
    } else {
      console.error("Erro de rede ou outra falha:", error.message);
      showCustomModal("Erro", "Erro de conexão. Verifique sua rede e tente novamente.", "error");
    }
    return false;
  }
};


  const handleUpdateUser = async () => {
    console.log("handleUpdateUser: Iniciando atualização do usuário.");
    if (newPassword && newPassword !== confirmNewPassword) {
      showCustomModal(
        "Erro",
        "A confirmação de senha não corresponde à nova senha.",
        "error"
      );
      return;
    }
    setLoading(true);
    try {
      const storedToken = await SecureStore.getItemAsync("tokenUsuario");

      if (!userId || !storedToken) {
        console.error(
          "handleUpdateUser: Erro, dados de usuário ou token não encontrados."
        );
        showCustomModal(
          "Erro",
          "Dados de usuário ou token de acesso ausentes.",
          "error"
        );
        setLoading(false);
        return;
      }

      console.log("handleUpdateUser: Usando o ID do usuário:", userId);

      const dadosAtualizados = {
        name: nome,
        email: email,
      };
      if (newPassword) {
        dadosAtualizados.password = newPassword;
        dadosAtualizados.confirmPassword = confirmNewPassword;
      }

      const headers = {
        Authorization: `Bearer ${storedToken}`,
        "Content-Type": "application/json",
      };

      const response = await sheets.putAtualizarUsuario(
        userId,
        dadosAtualizados,
        { headers }
      );
      console.log(
        "handleUpdateUser: Resposta da API de atualização:",
        response.data
      );

      if (response.data && response.data.requiresEmailVerification) {
        setVerifyModalVisible(true);
      } else if (response.data && response.data.user) {
        console.log(
          "handleUpdateUser: Atualização local do usuário no SecureStore."
        );
        await SecureStore.setItemAsync(
          "user",
          JSON.stringify([response.data.user])
        );
        showCustomModal(
          "Sucesso",
          response.data.message || "Perfil atualizado!",
          "success"
        );
        setNewPassword("");
        setConfirmNewPassword("");
        setIsEditing(false);
      } else {
        showCustomModal(
          "Erro",
          response.data.message ||
            "Resposta da API incompleta. Perfil pode não ter sido atualizado corretamente.",
          "error"
        );
      }
    } catch (error) {
      if (error.response?.status === 401) {
        showCustomModal(
          "Sessão Expirada",
          "Sua sessão expirou. Por favor, faça login novamente.",
          "error"
        );
        setTimeout(() => {
          navigation.navigate("Login");
        }, 1500);
      } else {
        console.error(
          "Erro ao atualizar o perfil:",
          error.response?.data || error.message
        );
        showCustomModal(
          "Erro",
          "Não foi possível atualizar o perfil.",
          "error"
        );
      }
    } finally {
      setLoading(false);
      console.log("handleUpdateUser: Processo de atualização finalizado.");
    }
  };

  const handleDeleteUser = async () => {
    console.log("handleDeleteUser: Iniciando exclusão do usuário.");
    try {
      const storedToken = await SecureStore.getItemAsync("tokenUsuario");

      if (!userId || !storedToken) {
        console.error(
          "handleDeleteUser: Erro, dados de usuário ou token não encontrados."
        );
        showCustomModal(
          "Erro",
          "Dados de usuário ou token de acesso ausentes.",
          "error"
        );
        setDeleteModalVisible(false);
        return;
      }

      console.log("handleDeleteUser: Usando o ID do usuário:", userId);

      const headers = {
        Authorization: `Bearer ${storedToken}`,
        "Content-Type": "application/json",
      };

      const response = await sheets.deleteUsuario(userId, { headers });
      console.log(
        "handleDeleteUser: Resposta da API de exclusão:",
        response.data
      );

      if (response.data && response.data.auth) {
        await SecureStore.deleteItemAsync("user");
        await SecureStore.deleteItemAsync("tokenUsuario");
        console.log(
          "handleDeleteUser: Dados do usuário deletados do SecureStore."
        );

        showCustomModal(
          "Sucesso",
          response.data.message || "Conta deletada!",
          "success"
        );

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Principal" }],
          });
        }, 1500);
      } else {
        showCustomModal(
          "Erro",
          response.data.error || "Erro ao deletar usuário",
          "error"
        );
      }
    } catch (error) {
      if (error.response?.status === 401) {
        showCustomModal(
          "Sessão Expirada",
          "Sua sessão expirou. Por favor, faça login novamente.",
          "error"
        );
        setTimeout(() => {
          navigation.navigate("Login");
        }, 1500);
      } else {
        console.error(
          "Erro ao deletar usuário:",
          error.response?.data || error.message
        );
        showCustomModal("Erro", "Não foi possível deletar o usuário.", "error");
      }
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const handleVerifyEmailCode = async (code) => {
    console.log("handleVerifyEmailCode: Iniciando verificação de código.");
    try {
      const storedUser = await SecureStore.getItemAsync("user");
      if (!storedUser) throw new Error("Usuário não encontrado");

      const userArray = JSON.parse(storedUser);
      if (!userArray || userArray.length === 0 || !userArray[0]) {
        throw new Error("Dados de usuário inválidos no SecureStore");
      }
      const user = userArray[0];

      const response = await sheets.postVerifyUpdate({
        email: email,
        code: code,
      });
      console.log(
        "handleVerifyEmailCode: Resposta da verificação:",
        response.data
      );

      if (response.data.auth && response.data.user) {
        await SecureStore.setItemAsync(
          "user",
          JSON.stringify([response.data.user])
        );
        return {
          success: true,
          message: response.data.message || "E-mail atualizado com sucesso!",
        };
      } else {
        return {
          success: false,
          error: response.data.error || "Código de verificação inválido.",
        };
      }
    } catch (error) {
      console.error(
        "handleVerifyEmailCode: Erro ao verificar o código:",
        error.response?.data?.error || error.message
      );
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao verificar o código.",
      };
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
    buttonText: { color: "white", fontWeight: "bold", fontSize: width * 0.045 },
    link: {
      fontSize: width * 0.045,
      color: "rgb(152, 0, 0)",
      fontWeight: "bold",
      textDecorationLine: "underline",
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  // Mostra um indicador de carregamento enquanto os dados são buscados
  if (isDataLoading) {
    return (
      <View style={dynamicStyles.loaderContainer}>
        <ActivityIndicator size="large" color="#B11010" />
      </View>
    );
  }

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
            <TouchableOpacity
              style={dynamicStyles.button}
              onPress={() => setSenhaModalVisible(true)}
            >
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
          onValidatePassword={handleValidatePassword}
          onSuccess={() => {
            setIsEditing(true);
            setSenhaModalVisible(false);
            showCustomModal(
              "Sucesso",
              "Senha confirmada! Agora você pode editar seu perfil.",
              "success"
            );
          }}
          onCancel={() => setSenhaModalVisible(false)}
          showCustomModal={showCustomModal}
        />

        <VerifyCodeModal
          visible={verifyModalVisible}
          onClose={() => setVerifyModalVisible(false)}
          formData={{ email: email || currentEmail || "" }}
          onVerificationSuccess={async () => {
            try {
              const storedUser = await SecureStore.getItemAsync("user");
              if (storedUser) {
                const user = JSON.parse(storedUser);
                user.email = email;
                await SecureStore.setItemAsync("user", JSON.stringify(user));
              }
              showCustomModal(
                "Sucesso",
                "E-mail atualizado com sucesso!",
                "success"
              );
            } catch (error) {
              showCustomModal(
                "Erro",
                "Não foi possível atualizar os dados localmente.",
                "error"
              );
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

        {/* O componente CustomModal "ouve" as mudanças de estado controladas por showCustomModal. */}
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
