import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://10.89.240.82:5000/stock/",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("tokenUsuario");
    if (token) {
      config.headers["Authorization"] = token; // sem Bearer
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const sheets = {
  // Usuário
  postLogin: (user) => api.post("user/login", user),
  postSendVerificationCode: (user) => api.post("user/register", user),
  postFinalizarCadastro: (user) => api.post("user/verify-register", user),
  putAtualizarUsuario: (idUser, user) => api.put(`user/${idUser}`, user),
  postRecoveryPassword: (data) => api.post("user/recovery-password", data),
  postValidateRecoveryCode: (data) => api.post("user/validate-recovery-code", data),
  postVerifyRecoveryPassword: (email) => api.post("user/verify-recovery-password", { email }),
  postValidatePassword: (idUser, data) => api.post(`user/validate-password/${idUser}`, data),
  deleteUsuario: (idUser) => api.delete(`user/${idUser}`),
  verifyUpdate: (data) => api.post("user/verify-update", data),
  getUserById: (idUser) => api.get(`user/${idUser}`),
  TransactionUser: (userId) => api.get(`transactions/user/${userId}`),

  // Itens / Lotes
  updateLotQuantity: (idLot, payload) => api.put(`lot/quantity/${idLot}`, payload),
  getAllItems: (params) => api.get("items", { params }),
  getItemByIdDetails: (idItem) => api.get(`item/${idItem}/details`),
  createItem: (payload) => api.post("item", payload), // POST /stock/item
  filtroItems: (body) => api.post("items/filter?page=1&limit=50", body),

  // Dropdowns
  getCategories: () => api.get("category"),
  getLocations: () => api.get("location"),
  getTechnicalSpecs: () => api.get("technicalSpec"),
};

export default sheets;
