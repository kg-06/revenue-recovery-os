import API from "./api";

export async function getBackendHealth() {
  const response = await API.get("/health");
  return response.data;
}