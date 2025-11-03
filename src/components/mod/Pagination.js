import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  if (totalPages <= 1) return null; // não renderiza se só há 1 página

  const maxPagesToShow = 2; // número máximo de botões visíveis
  const half = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, currentPage - half);
  let endPage = Math.min(totalPages, currentPage + half);

  // ajusta para sempre mostrar 5 botões se possível
  if (endPage - startPage < maxPagesToShow - 1) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <View style={styles.container}>
      {/* Botão Anterior */}
      <TouchableOpacity
        style={[styles.navButton, currentPage === 1 && styles.disabled]}
        disabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
      >
        <AntDesign name="left" size={16} color="#fff" />
      </TouchableOpacity>

      {/* Botões numéricos */}
      {pageNumbers.map((page) => (
        <TouchableOpacity
          key={page}
          style={[
            styles.pageButton,
            page === currentPage && styles.activePageButton,
          ]}
          onPress={() => onPageChange(page)}
        >
          <Text
            style={[
              styles.pageText,
              page === currentPage && styles.activePageText,
            ]}
          >
            {page}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Botão Próximo */}
      <TouchableOpacity
        style={[
          styles.navButton,
          currentPage === totalPages && styles.disabled,
        ]}
        disabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
      >
        <AntDesign name="right" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  navButton: {
    backgroundColor: "#600000",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 3,
  },
  pageButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#600000",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 3,
  },
  pageText: {
    color: "#600000",
    fontWeight: "500",
  },
  activePageButton: {
    backgroundColor: "#600000",
  },
  activePageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Pagination;
