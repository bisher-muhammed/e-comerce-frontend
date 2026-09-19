import axios from "axios";

import { API_URL, REQUEST_TIMEOUT_MS } from "./config";

const apiPublic = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});

export default apiPublic;
