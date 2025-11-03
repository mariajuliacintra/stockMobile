import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "https://senai604estoque.eastus2.cloudapp.azure.com/api",
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
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const sheets = {
  // Usuário
  postLogin: (user) => api.post("user/login/", user),
  postSendVerificationCode: (user) => api.post("user/register/", user),
  postFinalizarCadastro: (user) => api.post("/user/verify-register", user),
  putAtualizarUsuario: (idUser, user) => api.put(`/user/${idUser}`, user),
  postRecoveryPassword: (data) => api.post("/user/recovery-password", data),
  postValidateRecoveryCode: (data) =>
    api.post("/user/validate-recovery-code", data),
  postVerifyRecoveryPassword: (email) =>
    api.post("user/verify-recovery-password", { email }),
  postValidatePassword: (idUser, data) =>
    api.post(`/user/validate-password/${idUser}`, data),
  deleteUsuario: (idUser) => api.delete(`/user/${idUser}`),
  verifyUpdate: (data) => api.post("/user/verify-update", data),
  getUserById: (idUser) => api.get(`/user/${idUser}`),
  TransactionUser: (userId) => api.get(`/transactions/user/${userId}`),
  getAllUsers: (page = 1, limit = 2) =>
    api.get("/users", {
      params: {
        page: page,
        limit: limit,
      },
    }),
  registerUserByManager: (idUser) => api.post(`/user/register/manager`, idUser),

  // Itens / Lotes
  updateLotQuantity: (idLot, payload) =>
    api.put(`lot/quantity/${idLot}`, payload),

  getAllItems: (page = 1, limit = 3) => {
    return api.get(`/items?page=${page}&limit=${limit}`);
  },  

  filterItems: (payload, page = 1, limit = 10) =>
    api.post(`/items/filter?page=${page}&limit=${limit}`, payload),

  deleteItem: (idItem) => api.delete(`/item/${idItem}`, idItem),

  getItemByIdDetails: (idItem) => api.get(`item/${idItem}/details/`),



  //EXCELL
  getExcelGeneral: () =>
    api.get("report/excel/general", { responseType: "arraybuffer" }),
  getExcelLowStock: () =>
    api.get("report/excel/low-stock", { responseType: "arraybuffer" }),
  getExcelTransactions: () =>
    api.get("report/excel/transactions", { responseType: "arraybuffer" }),

  //PDF
  getPdfGeneral: () =>
    api.get("report/pdf/general", { responseType: "arraybuffer" }),
  getPdfLowStock: () =>
    api.get("report/pdf/low-stock", { responseType: "arraybuffer" }),
  getPdfTransactions: () =>
    api.get("report/pdf/transactions", { responseType: "arraybuffer" }),
  createItem: (payload) => api.post("item", payload), // POST /stock/item
  filtroItems: (body) => api.post("items/filter?page=1&limit=50", body),

  // Dropdowns
  getCategories: () => api.get("category"),
  getLocations: () => api.get("location"),
  getTechnicalSpecs: () => api.get("technicalSpec"),

  createLocation: (data) => api.post("location", data),
  createCategory: (data) => api.post("category", data),
  createTechnicalSpec: (data) => api.post("technicalSpec", data),

  // Upload de imagem do usuário
  uploadItemImage: async (idItem, imageUri) => {
    if (!imageUri || typeof imageUri !== "string") {
      console.warn("URI da imagem não fornecida ou inválida para upload.");
      return;
    }

    const data = new FormData();

    const filename = imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    data.append("image", {
      uri: imageUri,
      name: filename,
      type: type,
    });
    return api.post(`/item/image/${idItem}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default sheets;
