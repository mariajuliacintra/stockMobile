import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://10.89.240.83:5000/reservas/v1/",
  headers: {
    accept: "application/json",
  },
});

// Interceptor para adicionar o token em cada requisição
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("tokenUsuario");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const sheets = {
  postLogin: (usuario) => api.post("login/", usuario),
  getPerfil: (usuario) => api.get("/usuario/perfil/:id_usuario", usuario),
  postCadastro: (usuario) => api.post("cadastro/", usuario),
  getSalas: (sala) => api.get("salas/", sala),
  getSalasDisponivelHorario: (sala) => api.post(`salasdisponivelhorario/`, sala),
  getUsuarioById: (id_usuario) => api.get(`usuario/perfil/${id_usuario}`),
  getUsuarioReservasById: (id_usuario) => api.get(`usuario/perfil/${id_usuario}/reservas`),
  postReserva: (reserva) => api.post("reserva/", reserva),
};

export default sheets;
