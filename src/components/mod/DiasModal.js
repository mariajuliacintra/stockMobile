import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

function DiasModal({ visible, onClose, validDays, selectedDays, toggleDay, diasSemanaMap }) {

  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modal: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      width: width * 0.75, // Levemente aumentado
      maxHeight: height * 0.6,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      padding: 5,
      zIndex: 1,
    },
    title: {
      fontSize: width * 0.05,
      fontWeight: '600',
      marginBottom: 15,
      color: '#333',
      textAlign: 'center',
    },
    scrollView: {
        width: '100%',
        marginBottom: 15,
    },
    checkboxItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 5,
      width: '100%',
      borderWidth: 1,
      borderColor: '#eee',
      borderRadius: 8,
      marginBottom: 10,
      backgroundColor: '#f9f9f9',
    },
    checkboxText: {
      fontSize: width * 0.04,
      color: '#333',
      marginLeft: 10,
      flexShrink: 1,
    },
    checkboxTextDisabled: {
      color: '#a0a0a0',
    },
    checkboxIcon: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderRadius: 4,
      borderColor: '#555',
    },
    checkboxIconChecked: {
      backgroundColor: 'rgb(177, 16, 16)',
      borderColor: 'rgb(177, 16, 16)',
    },
    confirmButton: {
      backgroundColor: "rgb(177, 16, 16)", // Cor do botão alterada para vermelho mais escuro
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    confirmButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: width * 0.04,
    }
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.overlay}>
        <View style={dynamicStyles.modal}>
          {/* O botão de fechar 'X' foi removido daqui */}

          <Text style={dynamicStyles.title}>Selecione os Dias da Semana</Text>
          <ScrollView style={dynamicStyles.scrollView} showsVerticalScrollIndicator={false}>
            {Object.entries(diasSemanaMap).map(([key, value]) => {
              const dayNum = Number(key);
              const isSelected = selectedDays.includes(dayNum);
              const isDisabled = !validDays.includes(dayNum);

              return (
                <TouchableOpacity
                  key={dayNum}
                  style={dynamicStyles.checkboxItem}
                  onPress={() => !isDisabled && toggleDay(dayNum)}
                  disabled={isDisabled}
                >
                  <View style={[
                    dynamicStyles.checkboxIcon,
                    isSelected && dynamicStyles.checkboxIconChecked
                  ]}>
                    {isSelected && <Ionicons name="checkmark-outline" size={18} color="white" />}
                  </View>
                  <Text style={[
                    dynamicStyles.checkboxText,
                    isDisabled && dynamicStyles.checkboxTextDisabled
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={dynamicStyles.confirmButton}>
            <Text style={dynamicStyles.confirmButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default DiasModal;
