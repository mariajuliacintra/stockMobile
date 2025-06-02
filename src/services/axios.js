import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://10.89.240.91:5000/reservas/v1/",
  headers: {
    accept: "application/json",
  },
});

// Interceptor para adicionar o token em cada requisição
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
  postLogin: (usuario) => api.post("login/", usuario),
  getPerfil: (usuario) => api.get("/usuario/perfil/:id_usuario", usuario),
  postCadastro: (usuario) => api.post("cadastro/", usuario),
  getSalas: (sala) => api.get("salas/", sala),
  getSalasDisponivelHorario: (sala) => api.post(`salasdisponivelhorario/`, sala),
  getUsuarioById: (id_usuario) => api.get(`usuario/perfil/${id_usuario}`),
  getUsuarioReservasById: (id_usuario) => api.get(`usuario/perfil/${id_usuario}/reservas`),
  postReserva: (reserva) => api.post("reserva/", reserva),
  putAtualizarReserva: (id_reserva, reservaAtualizada) => api.put(`/reserva/${id_reserva}`, reservaAtualizada),
  putAtualizarUsuario:(id_usuario, dadosAtualizados) => api.put(`/usuario/${id_usuario}`, dadosAtualizados),
  deleteReserva: (id_reserva, id_usuario) => api.delete(`reserva/${id_reserva}/${id_usuario}`),
  getHistoricoReservasById: (id_usuario) => api.get(`/usuario/historico/${id_usuario}`),
  getUsuarioHistoricoReservasDelecaobyId: (id_usuario) => api.get(`/usuario/historico/delecao/${id_usuario}`),
};


export default sheets;
