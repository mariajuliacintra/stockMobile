import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function CustomModal({
  open,
  onClose,
  title,
  message,
  buttonText = "OK",
  type = "info", // 'success' | 'error' | 'info'
}) {
  const iconProps = {
    success: { name: "check-circle", color: "#4caf50" },
    error: { name: "error", color: "#f44336" },
  }[type] || {};

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, styles[type]]}>
          {iconProps.name && (
            <MaterialIcons
              name={iconProps.name}
              size={75}
              color={iconProps.color}
              style={styles.icon}
            />
          )}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.button, styles[`button${capitalize(type)}`]]}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    minWidth: 300,
    maxWidth: 400,
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  success: {
    backgroundColor: "#ffffff",
  },
  error: {
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonSuccess: {
    backgroundColor: "green",
  },
  buttonError: {
    backgroundColor: "rgb(226, 16, 16)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  icon: {
    marginBottom: 10,
  },
});
