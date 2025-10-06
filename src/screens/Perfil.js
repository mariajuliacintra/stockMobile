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
import VerificationModal from "../components/layout/VerificationModal";
import CustomModal from "../components/mod/CustomModal";
import DelecaoModal from "../components/mod/ConfirmarDelecaoModal";
import TransactionModal from "../components/layout/TransactionModal";

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
  const [userId, setUserId] = useState(null);
  const { width, height } = useWindowDimensions();

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customModalTitle, setCustomModalTitle] = useState("");
  const [customModalMessage, setCustomModalMessage] = useState("");
  const [customModalType, setCustomModalType] = useState("info");

  const showCustomModal = (title, message, type = "info") => {
    setCustomModalTitle(title);
    setCustomModalMessage(message);
    setCustomModalType(type);
    setCustomModalVisible(true);
  };
  const onDismissCustomModal = () => setCustomModalVisible(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [transactionsModalVisible, setTransactionsModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsDataLoading(true);
      try {
        const idUser = await SecureStore.getItemAsync("userId");
        if (!idUser) {
          showCustomModal("Erro", "ID do usuário não encontrado.", "error");
          setIsDataLoading(false);
          return;
        }

        const response = await sheets.getUserById(idUser);
        const user = response.data?.user?.[0];

        if (user) {
          setNome(user.name || "");
          setEmail(user.email || "");
          setCurrentEmail(user.email || "");
          setUserId(user.idUser);
        } else {
          showCustomModal("Erro", "Usuário não encontrado.", "error");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        showCustomModal("Erro", "Não foi possível carregar os dados do usuário.", "error");
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Validação da senha atual
  const handleValidatePassword = async (senhaAtual) => {
    try {
      const storedToken = await SecureStore.getItemAsync("tokenUsuario");
      if (!userId || !storedToken) {
        showCustomModal("Erro", "Não foi possível encontrar o ID do usuário ou token.", "error");
        return false;
      }
      const headers = { Authorization: storedToken };
      const response = await sheets.postValidatePassword(userId, { password: senhaAtual }, { headers });

      let isValid = false;
      if (typeof response.data?.isValid === "boolean") isValid = response.data.isValid;
      else if (Array.isArray(response.data?.data) && typeof response.data.data[0]?.isValid === "boolean")
        isValid = response.data.data[0].isValid;
      else if (typeof response.data?.data?.isValid === "boolean") isValid = response.data.data.isValid;
      else if (response.data?.success === true && typeof response.data?.details === "string" &&
        response.data.details.toLowerCase().includes("válida")) isValid = true;

      return Boolean(isValid);
    } catch (error) {
      console.error("Erro na validação de senha:", error);
      showCustomModal("Erro", "Erro ao validar senha.", "error");
      return false;
    }
  };

  // Atualizar perfil
  const handleUpdateUser = async () => {
    if (newPassword && newPassword !== confirmNewPassword) {
      showCustomModal("Erro", "A confirmação de senha não corresponde à nova senha.", "error");
      return;
    }

    setLoading(true);
    try {
      const storedToken = await SecureStore.getItemAsync("tokenUsuario");
      if (!userId || !storedToken) {
        showCustomModal("Erro", "Dados de usuário ou token de acesso ausentes.", "error");
        setLoading(false);
        return;
      }

      const dadosAtualizados = { name: nome, email: email };
      if (newPassword) {
        dadosAtualizados.password = newPassword;
        dadosAtualizados.confirmPassword = confirmNewPassword;
      }

      const headers = { Authorization: storedToken };
      const response = await sheets.putAtualizarUsuario(userId, dadosAtualizados, { headers });

      const responseData = response.data;

      const requiresVerification =
        Array.isArray(responseData.data) && responseData.data[0]?.requiresEmailVerification;

      if (requiresVerification) {
        setVerifyModalVisible(true);
        const message = responseData.message || "Seu e-mail foi alterado. Por favor, insira o código enviado para concluir a verificação.";
        showCustomModal("Verificação Pendente", message, "info");
      } else if (responseData?.user) {
        const updatedUser = responseData.user;
        const userToStore = Array.isArray(updatedUser) ? updatedUser[0] : updatedUser;

        setNome(userToStore.name || nome);
        setEmail(userToStore.email || email);
        setCurrentEmail(userToStore.email || email);

        await SecureStore.setItemAsync("user", JSON.stringify([userToStore]));

        showCustomModal("Sucesso", responseData.message || "Perfil atualizado!", "success");
        setNewPassword("");
        setConfirmNewPassword("");
        setIsEditing(false);
      } else {
        showCustomModal("Erro", responseData.message || "Resposta da API incompleta ou falha na atualização.", "error");
      }
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error.response?.data.details || error.message);
      showCustomModal("Erro", "Não foi possível atualizar o perfil.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Deletar usuário
  const handleDeleteUser = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("tokenUsuario");
      if (!userId || !storedToken) {
        showCustomModal("Erro", "Dados de usuário ou token de acesso ausentes.", "error");
        setDeleteModalVisible(false);
        return;
      }
      const headers = { Authorization: storedToken };
      const response = await sheets.deleteUsuario(userId, { headers });

      if (response.data?.success) {
        await SecureStore.deleteItemAsync("tokenUsuario");
        await SecureStore.deleteItemAsync("userId");

        showCustomModal(response.data.message, response.data.details, "success");

        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: "Home" }] });
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
      width,
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
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  });

  if (isDataLoading) {
    return (
      <View style={dynamicStyles.loaderContainer}>
        <ActivityIndicator size="large" color="rgb(177, 16, 16)" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground style={dynamicStyles.background} source={require("../img/fundo.png")}>
        <View style={dynamicStyles.header}>
          {/* Botão home */}
          <TouchableOpacity onPress={() => navigation.navigate("Principal")}>
            <MaterialCommunityIcons name="home-circle-outline" size={60} color="#fff" />
          </TouchableOpacity>

          {/* Botão engrenagem */}
          <TouchableOpacity onPress={() => navigation.navigate("NoUsers")} style={{ marginLeft: 15 }}>
            <MaterialCommunityIcons name="account-cog-outline" size={60} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Card */}
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
            <TouchableOpacity style={dynamicStyles.button} onPress={handleUpdateUser} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={dynamicStyles.buttonText}>Salvar</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={dynamicStyles.button} onPress={() => setSenhaModalVisible(true)}>
              <Text style={dynamicStyles.buttonText}>Editar perfil</Text>
            </TouchableOpacity>
          )}

          {isEditing ? (
            <TouchableOpacity
              style={[dynamicStyles.button, { backgroundColor: "red" }]}
              onPress={() => setDeleteModalVisible(true)}
            >
              <Text style={dynamicStyles.buttonText}>Deletar Perfil</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setTransactionsModalVisible(true)}>
              <Text
                style={{
                  color: "red",
                  textDecorationLine: "underline",
                  fontSize: width * 0.045,
                  fontWeight: "bold",
                  marginTop: height * 0.02,
                }}
              >
                Minhas Transações
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Modais */}
        <ConfirmPasswordModal
          visible={senhaModalVisible}
          onValidatePassword={handleValidatePassword}
          onSuccess={() => {
            setIsEditing(true);
            setSenhaModalVisible(false);
            showCustomModal("Sucesso", "Senha confirmada! Agora você pode editar seu perfil.", "success");
          }}
          onCancel={() => setSenhaModalVisible(false)}
          showCustomModal={showCustomModal}
        />

        <VerificationModal
          visible={verifyModalVisible}
          onClose={() => setVerifyModalVisible(false)}
          formData={{ email }}
          mode="update"
          onVerificationSuccess={async (updatedUser) => {
            if (!updatedUser) return;
            setEmail(updatedUser.email || email);
            setCurrentEmail(updatedUser.email || email);
            setIsEditing(false);
            await SecureStore.setItemAsync("user", JSON.stringify([updatedUser]));
            showCustomModal("Sucesso", "E-mail atualizado com sucesso!", "success");
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

        <TransactionModal
          visible={transactionsModalVisible}
          onClose={() => setTransactionsModalVisible(false)}
          userId={userId}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}
