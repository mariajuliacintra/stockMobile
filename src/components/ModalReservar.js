import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

const InputGroup = ({ label, value, onChangeText, placeholder }) => (
  <View style={styles.inputGroup}>
    <Text>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  </View>
);

const ModalReservar = ({ isOpen, onClose, onSave }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSave = () => {
    onSave({ date, startTime, endTime });
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Reservar</Text>

          <InputGroup
            label="Data:"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            type="date"
          />
          <InputGroup
            label="Hora de Início:"
            value={startTime}
            onChangeText={setStartTime}
            placeholder="HH:MM"
          />
          <InputGroup
            label="Hora de Término:"
            value={endTime}
            onChangeText={setEndTime}
            placeholder="HH:MM"
          />

          <View style={styles.actions}>
            <Button title="Cancelar" onPress={onClose} />
            <Button title="Reservar" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: 300,
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ModalReservar;
