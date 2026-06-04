// Shared axios instance for the app
import axios from "axios";
import { buildApiUrl } from "../lib/api";

export const api = axios.create({
  baseURL: buildApiUrl(""),
  timeout: 10000,
});

export default api;

