import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

export default function CustomModal({
  open,
  onClose,
  title,
  message,
  buttonText = "OK",
  type = "info",
}) {
  const iconProps = {
    success: { name: "check-circle", color: "#4CAF50" },
    error: { name: "error", color: "#F44336" },
    info: { name: "info", color: "#2196F3" },
  }[type] || {};

  const backgroundColors = {
    success: "#E8F5E9",
    error: "#FFEBEE",
    info: "#E3F2FD",
  };

  const borderColors = {
    success: "#4CAF50",
    error: "#F44336",
    info: "#2196F3",
  };

  const isSmallMessage = message && message.length < 60;

  const modalContent = isSmallMessage ? (
    <View style={styles.toastOverlay}>
      <View
        style={[
          styles.toastContainer,
          { backgroundColor: backgroundColors[type] || backgroundColors.info },
          { borderColor: borderColors[type] || borderColors.info },
        ]}
      >
        {iconProps.name && (
          <MaterialIcons
            name={iconProps.name}
            size={width * 0.05}
            color={iconProps.color}
            style={styles.toastIcon}
          />
        )}
        <Text style={[styles.toastMessage, { color: iconProps.color }]}>
          {message}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.toastCloseButton}>
          <MaterialIcons name="close" size={width * 0.05} color={iconProps.color} />
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {iconProps.name && (
          <MaterialIcons
            name={iconProps.name}
            size={width * 0.18}
            color={iconProps.color}
            style={styles.icon}
          />
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.button, styles[`button${type.charAt(0).toUpperCase() + type.slice(1)}`]]}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {modalContent}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
    padding: width * 0.06,
    borderRadius: 15,
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
  },
  icon: {
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "700",
    color: "#333",
    marginBottom: height * 0.015,
    textAlign: "center",
  },
  message: {
    fontSize: width * 0.045,
    color: "#666",
    lineHeight: width * 0.06,
    marginBottom: height * 0.03,
    textAlign: "center",
  },
  button: {
    width: "80%",
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.08,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.015,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonSuccess: {
    backgroundColor: "#4CAF50",
  },
  buttonError: {
    backgroundColor: "#F44336",
  },
  buttonInfo: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  toastOverlay: {
    position: "absolute",
    top: height * 0.05,
    width: "100%",
    alignItems: "center",
    zIndex: 1000,
  },
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: height * 0.08,
    width: width * 0.9,
    maxWidth: 500,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: 10,
    borderLeftWidth: width * 0.015,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  toastIcon: {
    marginRight: width * 0.03,
  },
  toastMessage: {
    flex: 1,
    fontSize: width * 0.04,
    fontWeight: "500",
    flexWrap: "wrap",
  },
  toastCloseButton: {
    marginLeft: width * 0.03,
    padding: width * 0.01,
  },
});