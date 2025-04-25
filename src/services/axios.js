import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.12.225:5000/reservas/v1/",
  headers: {
    accept: "application/json",
  },
});

const sheets = {
  postLogin: (usuario) => api.post("login/", usuario),
  getPerfil: (usuario) => api.get("/usuario/perfil/:id_usuario", usuario),
  postCadastro: (usuario) => api.post("cadastro/", usuario),
  getSalas: (sala) => api.get("salas/", sala),
  getUsuarioByEmail: (email) => api.get("usuario/perfil/", { params: { email } }),
  getUsuarioReservasByEmail: (email) => api.get("usuario/email/perfil/reservas", { params: { email } })  
};

export default sheets;