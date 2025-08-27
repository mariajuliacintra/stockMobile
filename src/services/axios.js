import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://10.89.240.86:5000/stock/",
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

  postRecoveryPassword: (data) => api.post("/user/recovery-password", data),
  postValidateRecoveryCode: (data) => api.post('/user/validate-recovery-code', data),
  postVerifyRecoveryPassword: (email) => api.post("user/verify-recovery-password", { email }),
  


  getSalas: () => api.get("salas"),
  getSalasDisponivelHorario: (sala) => api.post(`salasdisponivelhorario/`, sala),

  getPerfil: (id_usuario) => api.get(`usuario/perfil/${id_usuario}`),
  getUsuarioById: (id_usuario) => api.get(`usuario/perfil/${id_usuario}`),
  getUsuarioReservasById: (id_usuario) => api.get(`usuario/perfil/${id_usuario}/reservas`),

  verificarSenhaUsuario: (id_usuario, confirmarSenha) => api.post(`usuario/verificarsenha/${id_usuario}`, confirmarSenha),
  
  postReserva: (reserva) => api.post("reserva/simples/", reserva),
  postReservaPeriodica: (reserva) => api.post("reserva/periodica/", reserva),
  putReserva: (id_reserva, reservaAtualizada) => api.put(`/reserva/simples/${id_reserva}`, reservaAtualizada),
  putReservaPeriodica: (id_reserva, reservaAtualizada) => api.put(`/reserva/periodica/${id_reserva}`, reservaAtualizada),
  putAtualizarUsuario:(id_usuario, dadosAtualizados) => api.put(`/usuario/${id_usuario}`, dadosAtualizados),
  deleteReserva: (id_reserva, id_usuario) => api.delete(`reserva/${id_reserva}/${id_usuario}`),
  
  getReservasHistoricoById: (id_usuario) => api.get(`/usuario/historico/${id_usuario}`),
  getReservasDeletadasById: (id_usuario) => api.get(`/usuario/deletadas/${id_usuario}`),
  deleteUsuario: (id_usuario) => api.delete(`/usuario/${id_usuario}`),
};

export default sheets;
