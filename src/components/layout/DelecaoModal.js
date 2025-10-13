import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: W, height: H } = Dimensions.get('window');

export default function ConfirmarDelecaoModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="warning-outline" size={W * 0.12} color="#FFD700" style={styles.icon} />
            <Text style={styles.title}>{title || "Confirmação Necessária"}</Text>
          </View>
          
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {/* Botão Cancelar (Branco) */}
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>

            {/* Botão Confirmar (Vermelho) */}
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => {
                onConfirm();
                // Não fechamos aqui para permitir que a função onConfirm gerencie o fechamento
                // se ela tiver alguma lógica assíncrona, mas chamamos onCancel caso a lógica
                // de deleção seja síncrona ou não feche o modal por conta própria.
                // Na prática do PerfilScreen, o onConfirm (handleDeleteUser) fecha o modal após a operação.
              }}
            >
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: W * 0.06,
    width: W * 0.85,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: H * 0.02,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: W * 0.055,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: W * 0.04,
    color: '#555',
    textAlign: 'center',
    marginBottom: H * 0.04,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    paddingVertical: H * 0.015,
    paddingHorizontal: W * 0.06,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: W * 0.3,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  confirmButton: {
    // Cor vermelha forte, alinhada com os estilos do seu PerfilScreen
    backgroundColor: 'rgb(177, 16, 16)', 
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: W * 0.04,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgb(177, 16, 16)',
  },
  cancelButtonText: {
    color: 'rgb(177, 16, 16)',
  },
});
