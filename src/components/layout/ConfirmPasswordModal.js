import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

export default function ConfirmPasswordModal({
  visible,
  onCancel,
  onValidatePassword, // <<< Recebe a função de validação
}) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!senhaAtual) {
      alert("Digite sua senha atual.");
      return;
    }

    setLoading(true);

    try {
      const isValid = await onValidatePassword(senhaAtual);
      if (isValid) {
        onCancel(); // Se for válida, fecha o modal. A edição será habilitada no PerfilScreen.
      } else {
        alert("Senha incorreta!");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao validar senha.");
    } finally {
      setLoading(false);
      setSenhaAtual("");
    }
  };

  const handleCancel = () => {
    setSenhaAtual("");
    onCancel();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Confirme sua senha</Text>

          <TextInput
            placeholder="Senha atual"
            secureTextEntry
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            style={styles.input}
          />

          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  confirmButton: {
    backgroundColor: "rgb(177,16,16)",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelText: {
    color: "gray",
  },
});