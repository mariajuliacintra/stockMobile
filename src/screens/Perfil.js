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
import Entypo from "@expo/vector-icons/Entypo";
import { Ionicons } from "@expo/vector-icons";
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
  const { width, height } = useWindowDimensions();

  // Estados principais
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Modais
  const [senhaModalVisible, setSenhaModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [transactionsModalVisible, setTransactionsModalVisible] = useState(false);

  // Modal personalizado
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customModalTitle, setCustomModalTitle] = useState("");
  const [customModalMessage, setCustomModalMessage] = useState("");
  const [customModalType, setCustomModalType] = useState("info");

  // Mostrar/ocultar senhas
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showCustomModal = (title, message, type = "info") => {
    setCustomModalTitle(title);
    setCustomModalMessage(message);
    setCustomModalType(type);
    setCustomModalVisible(true);
  };
  const onDismissCustomModal = () => setCustomModalVisible(false);

  // Verifica papel do usuário
  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await SecureStore.getItemAsync("userRole");
      const storedEmail = await SecureStore.getItemAsync("userEmail");
      if (storedRole === "manager" || (storedEmail && storedEmail.includes("@sp.senai.br"))) {
        setIsManager(true);
      }
    };
    fetchRole();
  }, []);

  // Busca dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      setIsDataLoading(true);
      try {
        const idUser = await SecureStore.getItemAsync("userId");
        if (!idUser) {
          showCustomModal("Erro", "ID do usuário não encontrado.", "error");
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
      } catch {
        showCustomModal("Erro", "Falha ao carregar dados do usuário.", "error");
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Valida senha atual
  const handleValidatePassword = async (senhaAtual) => {
    try {
      const storedToken = await SecureStore.getItemAsync("tokenUsuario");
      if (!userId || !storedToken) {
        showCustomModal("Erro", "Token ou ID ausente.", "error");
        return false;
      }

      const headers = { Authorization: storedToken };
      const response = await sheets.postValidatePassword(userId, { password: senhaAtual }, { headers });

      const data = response.data;
      return (
        data?.isValid === true ||
        data?.data?.[0]?.isValid === true ||
        data?.data?.isValid === true ||
        (data?.success === true && data?.details?.toLowerCase().includes("válida"))
      );
    } catch {
      showCustomModal("Erro", "Erro ao validar senha.", "error");
      return false;
    }
  };

  // Atualiza perfil
  const handleUpdateUser = async () => {
    if (newPassword && newPassword !== confirmNewPassword) {
      showCustomModal("Erro", "As senhas não coincidem.", "error");
      return;
    }

    setLoading(true);
    try {
      const storedToken = await SecureStore.getItemAsync("tokenUsuario");
      if (!userId || !storedToken) {
        showCustomModal("Erro", "Token ou ID ausente.", "error");
        return;
      }

      const dadosAtualizados = { name: nome, email };
      if (newPassword) {
        dadosAtualizados.password = newPassword;
        dadosAtualizados.confirmPassword = confirmNewPassword;
      }

      const headers = { Authorization: storedToken };
      const response = await sheets.putAtualizarUsuario(userId, dadosAtualizados, { headers });
      const responseData = response.data;

      if (responseData?.data?.[0]?.requiresEmailVerification) {
        setVerifyModalVisible(true);
        showCustomModal(
          "Verificação Pendente",
          responseData.message ||
            "Seu e-mail foi alterado. Verifique o código enviado para concluir a atualização.",
          "info"
        );
      } else if (responseData?.user) {
        const updatedUser = Array.isArray(responseData.user)
          ? responseData.user[0]
          : responseData.user;

        setNome(updatedUser.name || nome);
        setEmail(updatedUser.email || email);
        setCurrentEmail(updatedUser.email || email);
        await SecureStore.setItemAsync("user", JSON.stringify([updatedUser]));

        showCustomModal("Sucesso", "Perfil atualizado com sucesso!", "success");
        setNewPassword("");
        setConfirmNewPassword("");
        setIsEditing(false);
      } else {
        showCustomModal("Erro", "Falha na atualização do perfil.", "error");
      }
    } catch {
      showCustomModal("Erro", "Erro ao atualizar perfil.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Deletar usuário
  const handleDeleteUser = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("tokenUsuario");
      if (!userId || !storedToken) {
        showCustomModal("Erro", "Token ou ID ausente.", "error");
        return;
      }

      const headers = { Authorization: storedToken };
      const response = await sheets.deleteUsuario(userId, { headers });

      if (response.data?.success) {
        await SecureStore.deleteItemAsync("tokenUsuario");
        await SecureStore.deleteItemAsync("userId");
        showCustomModal("Sucesso", response.data.message, "success");
        setTimeout(() => navigation.reset({ index: 0, routes: [{ name: "Home" }] }), 1500);
      } else {
        showCustomModal("Erro", response.data.error || "Erro ao deletar usuário.", "error");
      }
    } catch {
      showCustomModal("Erro", "Falha ao deletar usuário.", "error");
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const styles = createDynamicStyles(width, height);

  if (isDataLoading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="rgb(177,16,16)" />
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground style={styles.background} source={require("../img/fundo.png")}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Principal")}
            style={[styles.home, { marginRight: isManager ? 10 : -20 }]}
          >
            <Entypo name="home" size={40} color="white" />
          </TouchableOpacity>

          {isManager && (
            <TouchableOpacity
              onPress={() => navigation.navigate("NoUsers")}
              style={styles.engrenagem}
            >
              <MaterialCommunityIcons name="account-cog-outline" size={40} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Image source={require("../img/logo.png")} style={styles.logo} />

          {/* Campos */}
          <CustomInput placeholder="Nome" value={nome} onChangeText={setNome} editable={isEditing} />
          <CustomInput
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            keyboardType="email-address"
          />

          {isEditing && (
            <>
              <PasswordInput
                placeholder="Nova Senha"
                value={newPassword}
                onChangeText={setNewPassword}
                visible={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
              />
              <PasswordInput
                placeholder="Confirmar Nova Senha"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </>
          )}

          {/* Botões */}
          {isEditing ? (
            <TouchableOpacity style={styles.button} onPress={handleUpdateUser} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => setSenhaModalVisible(true)}>
              <Text style={styles.buttonText}>Editar perfil</Text>
            </TouchableOpacity>
          )}

          {isEditing ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "red" }]}
              onPress={() => setDeleteModalVisible(true)}
            >
              <Text style={styles.buttonText}>Deletar Perfil</Text>
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
            showCustomModal("Sucesso", "Senha confirmada! Você pode editar o perfil.", "success");
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
            setEmail(updatedUser.email);
            setCurrentEmail(updatedUser.email);
            setIsEditing(false);
            await SecureStore.setItemAsync("user", JSON.stringify([updatedUser]));
            showCustomModal("Sucesso", "E-mail atualizado!", "success");
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

const CustomInput = ({ placeholder, value, onChangeText, editable, keyboardType }) => {
  return (
    <View style={stylesGlobal.inputContainer}>
      <TextInput
        style={stylesGlobal.inputField}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
      />
    </View>
  );
};

const PasswordInput = ({ placeholder, value, onChangeText, visible, onToggle }) => {
  return (
    <View style={stylesGlobal.inputContainer}>
      <TextInput
        style={stylesGlobal.inputField}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
      />
      <TouchableOpacity onPress={onToggle}>
        <Ionicons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={24}
          color="gray"
        />
      </TouchableOpacity>
    </View>
  );
};

const createDynamicStyles = (width, height) =>
  StyleSheet.create({
    background: { flex: 1, width, height, alignItems: "center" },
    header: {
      backgroundColor: "rgba(177,16,16,1)",
      height: 80,
      borderBottomColor: "white",
      borderBottomWidth: 3,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      width,
      paddingRight: width * 0.06,
    },
    card: {
      backgroundColor: "#fff",
      padding: width * 0.06,
      borderRadius: 15,
      width: width * 0.85,
      maxWidth: 400,
      alignItems: "center",
      elevation: 10,
      marginTop: height * 0.08,
    },
    logo: {
      width: width * 0.6,
      height: width * 0.25,
      resizeMode: "contain",
      marginBottom: height * 0.02,
    },
    button: {
      backgroundColor: "rgb(177,16,16)",
      paddingVertical: height * 0.02,
      borderRadius: 10,
      alignItems: "center",
      width: "100%",
      elevation: 6,
      marginBottom: height * 0.015,
    },
    buttonText: { color: "white", fontWeight: "bold", fontSize: width * 0.045 },
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    home: {
      backgroundColor: "#600000",
      borderRadius: 50,
      padding: 8.5,
      justifyContent: "center",
      alignItems: "center",
      borderColor: "white",
      borderWidth: 2,
    },
    engrenagem: {
      backgroundColor: "#600000",
      borderRadius: 50,
      padding: 8.5,
      justifyContent: "center",
      alignItems: "center",
      borderColor: "white",
      borderWidth: 2,
      marginRight: -20,
    },
  });

const stylesGlobal = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 18,
  },
  inputField: { flex: 1, fontSize: 18, color: "#333" },
});
