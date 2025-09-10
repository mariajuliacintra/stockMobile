import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Modal,
    Image,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import sheets from "../../services/axios"; // Importação do serviço de API
import * as SecureStore from "expo-secure-store";
import * as jwtDecode from "jwt-decode";

const categoryMapping = {
    tool: { title: "Ferramentas", description: "Instrumentos para trabalhos manuais." },
    material: { title: "Material", description: "Itens de consumo, como fitas e tintas." },
    rawMaterial: { title: "Matéria-Prima", description: "Insumos brutos para produção." },
    equipment: { title: "Equipamentos", description: "Máquinas e aparelhos em geral." },
    product: { title: "Produto", description: "Itens finais para comercialização." },
    diverses: { title: "Diversos", description: "Itens variados e de uso geral." },
};

const ItemDetailModal = ({ isVisible, onClose, item }) => {
    // Estado para o novo campo de quantidade
    const [quantityChange, setQuantityChange] = useState('');
    // Estado para o tipo de ação (IN/OUT)
    const [actionDescription, setActionDescription] = useState('IN');
    // Estado para o modal do seletor de ação
    const [isActionPickerVisible, setActionPickerVisible] = useState(false);
    // Estado para o carregamento da transação
    const [loading, setLoading] = useState(false);
    // Estado para a mensagem de feedback
    const [message, setMessage] = useState(null);

    // Função para lidar com a transação
    const handleTransaction = async () => {
        // Validação básica para a quantidade
        if (!quantityChange || isNaN(quantityChange) || parseFloat(quantityChange) <= 0) {
            setMessage({ type: 'error', text: 'Por favor, insira uma quantidade válida.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            // Obtém o token do SecureStore
            const token = await SecureStore.getItemAsync("tokenUsuario");

            // Decodifica o token para obter o ID do usuário
            const decodedToken = jwtDecode.default(token);
            const fkIdUser = decodedToken.idUser;

            const payload = {
                fkIdUser,
                fkIdItem: item.idItem,
                actionDescription,
                quantityChange: parseFloat(quantityChange),
            };
            
            await sheets.addTransaction(payload);
            setMessage({ type: 'success', text: 'Transação registrada com sucesso!' });
            setQuantityChange(''); // Limpa o campo de quantidade após o sucesso
            // Você também pode querer chamar uma função para recarregar a lista de itens aqui
            // para que a quantidade seja atualizada na tela principal.
        } catch (error) {
            console.error("Erro ao registrar a transação:", error);
            setMessage({ type: 'error', text: 'Erro ao registrar a transação. Verifique suas permissões e a quantidade.' });
        } finally {
            setLoading(false);
        }
    };

    if (!item) {
        return null;
    }

    const categoryInfo = categoryMapping[item.category];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{item.name}</Text>
                    {item.image && (
                        <Image
                            source={{ uri: item.image }}
                            style={styles.itemImage}
                            resizeMode="contain"
                        />
                    )}
                    <Text style={styles.modalText}>Descrição: {item.description}</Text>
                    <Text style={styles.modalText}>
                        Categoria: {categoryInfo?.title || item.category}
                    </Text>
                    {/* Adição dos novos campos */}
                    {item.brand && <Text style={styles.modalText}>Marca: {item.brand}</Text>}
                    {item.technicalSpecs && <Text style={styles.modalText}>Especificações: {item.technicalSpecs}</Text>}
                    {item.aliases && <Text style={styles.modalText}>Aliases: {item.aliases}</Text>}
                    {item.batchCode && <Text style={styles.modalText}>Código do Lote: {item.batchCode}</Text>}
                    {item.lotNumber && <Text style={styles.modalText}>Número do Lote: {item.lotNumber}</Text>}
                    {item.expirationDate && <Text style={styles.modalText}>Data de Vencimento: {item.expirationDate}</Text>}
                    
                    {/* Campo de quantidade existente */}
                    {item.quantity && <Text style={styles.modalText}>Quantidade em Estoque: {item.quantity}</Text>}
                    
                    {/* Campos de Input para Transação */}
                    <View style={styles.transactionContainer}>
                        {/* Seletor de Tipo de Ação */}
                        <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={() => setActionPickerVisible(true)}
                        >
                            <Text style={styles.actionButtonText}>
                                {actionDescription === 'IN' ? 'Entrada' : 'Saída'}
                            </Text>
                            <Ionicons name="caret-down-outline" size={20} color="#fff" />
                        </TouchableOpacity>

                        {/* Input de Quantidade */}
                        <TextInput
                            style={styles.quantityInput}
                            placeholder="Quantidade"
                            placeholderTextColor="#888"
                            keyboardType="numeric"
                            value={quantityChange}
                            onChangeText={setQuantityChange}
                        />
                    </View>

                    {/* Botão de Transação */}
                    <TouchableOpacity
                        style={styles.transactButton}
                        onPress={handleTransaction}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Registrar Transação</Text>
                        )}
                    </TouchableOpacity>

                    {/* Mensagem de feedback */}
                    {message && (
                        <Text style={[
                            styles.messageText,
                            { color: message.type === 'success' ? 'green' : 'red' }
                        ]}>
                            {message.text}
                        </Text>
                    )}

                    {/* Botão de Fechar */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.buttonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>

                {/* Modal para o seletor de ação */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isActionPickerVisible}
                    onRequestClose={() => setActionPickerVisible(false)}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.pickerModalView}>
                            <TouchableOpacity 
                                style={styles.pickerOption} 
                                onPress={() => {
                                    setActionDescription('IN');
                                    setActionPickerVisible(false);
                                }}
                            >
                                <Text style={styles.pickerOptionText}>Entrada</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.pickerOption} 
                                onPress={() => {
                                    setActionDescription('OUT');
                                    setActionPickerVisible(false);
                                }}
                            >
                                <Text style={styles.pickerOptionText}>Saída</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "left",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'left',
        width: '100%',
    },
    modalSubText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        textAlign: 'left',
        width: '100%',
        marginLeft: 15,
    },
    itemImage: {
        width: 150,
        height: 150,
        marginBottom: 15,
        borderRadius: 10,
    },
    closeButton: {
        backgroundColor: '#600000',
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 15,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    transactionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#600000',
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 5,
    },
    quantityInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    transactButton: {
        backgroundColor: '#600000',
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 15,
    },
    messageText: {
        textAlign: 'center',
        marginTop: 10,
        fontWeight: 'bold',
    },
    pickerModalView: {
        margin: 50,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    pickerOption: {
        padding: 15,
        width: '100%',
        alignItems: 'center',
    },
    pickerOptionText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ItemDetailModal;
