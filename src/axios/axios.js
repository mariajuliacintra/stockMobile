import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.12.225:5000/reservas/v1/",
  headers: {
    accept: "application/json",
  },
});

const sheets = {
  postLogin: (usuario) => api.post("login/", usuario),
  postCadastro: (usuario) => api.post("cadastro/", usuario),
};

export default sheets