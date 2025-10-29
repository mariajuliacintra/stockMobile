import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

const Header = ({ isManager, onProfilePress, onLogoutPress, onArquivosPress }) => {
  return (
    <View style={styles.header}>
      {/* Profile */}
      <TouchableOpacity
        onPress={onProfilePress}
        style={[
          styles.profile,
          isManager ? { marginRight: 10 } : { marginRight: 30 },
        ]}
      >
        <Ionicons name="person-circle-outline" color="#FFF" size={40} />
      </TouchableOpacity>

      {/* Apenas managers veem o folderButton */}
      {isManager && (
        <TouchableOpacity onPress={onArquivosPress} style={styles.folderButton}>
          <MaterialCommunityIcons name="folder-outline" color="#FFF" size={40} />
        </TouchableOpacity>
      )}

      {/* Logout */}
      <TouchableOpacity onPress={onLogoutPress} style={styles.logoutButton}>
        <AntDesign name="logout" color="#FFF" size={25} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "rgba(177, 16, 16, 1)",
    height: 80,
    borderBottomColor: "white",
    borderBottomWidth: 3,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: width,
    paddingRight: 20,
  },
  profile: {
    backgroundColor: "#600000",
    borderRadius: 50,
    padding: 8.5,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 2,
  },
  folderButton: {
    backgroundColor: "#600000",
    borderRadius: 50,
    padding: 8.5,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 2,
    marginRight: 30,
  },
  logoutButton: {
    backgroundColor: "#600000",
    borderRadius: 50,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 2,
    marginLeft: -22,
    marginRight: -10,
  },
});

export default Header;
