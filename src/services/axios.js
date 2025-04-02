import axios from "axios";

const api = axios.create({
  baseURL: "http://10.89.240.39:5000/reservas/v1/",
  headers: {
    accept: "application/json",
  },
});

const sheets = {
  postLogin: (usuario) => api.post("login/", usuario),
  postCadastro: (usuario) => api.post("cadastro/", usuario),
};

export default sheets;
