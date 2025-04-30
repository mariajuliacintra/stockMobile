import axios from "axios";

const api = axios.create({
  baseURL: "http://10.89.240.91:5000/reservas/v1/",
  headers: {
    accept: "application/json",
  },
});

const sheets = {
  postLogin: (usuario) => api.post("login/", usuario),
  getPerfil: (usuario) => api.get("/usuario/perfil/:id_usuario", usuario),
  postCadastro: (usuario) => api.post("cadastro/", usuario),
  getSalas: (sala) => api.get("salas/", sala),
  getSalasDisponivelHorario: (sala) => api.post(`salasdisponivelhorario/`, sala),
  getUsuarioByEmail: (email) => api.get("usuario/perfil/", { params: { email } }),
  getUsuarioReservasByEmail: (email) => api.get("usuario/email/perfil/reservas", { params: { email } }),
  postReserva: (reserva) => api.post("reserva/", reserva),
};

export default sheets;