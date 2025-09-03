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
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const sheets = {
  postLogin: (user) => api.post("user/login/", user),
  postSendVerificationCode: (user) => api.post("user/register/", user),
  postFinalizarCadastro: (user) => api.post("/user/verify-register", user),
  putAtualizarUsuario:(user) => api.put("/user/:idUser", user),
  postRecoveryPassword: (data) => api.post("/user/recovery-password", data),
  postValidateRecoveryCode: (data) => api.post('/user/validate-recovery-code', data),
  postVerifyRecoveryPassword: (email) => api.post("user/verify-recovery-password", { email }),
  
  getAllItems: () => api.get("item"),

  getItemsByCategory: (category) => api.get(`item/${category}`),
};

export default sheets;
