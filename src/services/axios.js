// axios.js

import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://10.89.240.82:5000/stock/",
  headers: {
    accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("tokenUsuario");
    if (token) {
      // CORREÇÃO AQUI: Adicione 'Bearer ' antes do token
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const sheets = {
  postLogin: (user) => api.post("user/login/", user),
  postSendVerificationCode: (user) => api.post("user/register/", user),
  postFinalizarCadastro: (user) => api.post("/user/verify-register", user),
  putAtualizarUsuario: (idUser, user) => api.put(`/user/${idUser}`, user),
  postRecoveryPassword: (data) => api.post("/user/recovery-password", data),
  postValidateRecoveryCode: (data) => api.post("/user/validate-recovery-code", data),
  postVerifyRecoveryPassword: (email) => api.post("user/verify-recovery-password", { email }),
  postValidatePassword: (idUser, data) => api.post(`/user/validate-password/${idUser}`, data),
  deleteUsuario: (idUser) => api.delete(`/user/${idUser}`),

  // Funções de item
  getAllItems: () => api.get("/items"),
  getItemsByCategory: (category) => api.get(`item/${category}`),
  getItemByIdDetails: (idItem) => api.get(`item/${idItem}/details`),
  

  // Função para atualizar a quantidade do lote
  updateLotQuantity: (idLot, payload) => api.put(`lot/quantity/${idLot}`, payload),

  //rota para imagem
  getImage: (idImage) => api.get(`image/${idImage}`, { responseType: "arraybuffer" }),
};

export default sheets;
