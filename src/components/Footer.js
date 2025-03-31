import { TouchableOpacity, StyleSheet, View, Text } from "react-native";

function Footer() {
    return (
        <View style={styles.footer}>
            <Text style={styles.textDesenvolvido}>
                &copy; Desenvolvido por: Vinicius Fogaça, Maria Júlia e Maria Fernanda
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    footer: {
        backgroundColor: "rgb(166, 13, 13)",
        height: 70,
        width: 600,
        borderTopColor: "white",
        borderTopWidth: 3,
        alignItems: "center",
        justifyContent: "center",
    },
    textDesenvolvido: { color: "white", fontWeight: "bold" },
});

export default Footer;