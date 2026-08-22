import API from "./api";

export async function getRecoveryCases() {
  const response = await API.get("/recovery/cases");
  return response.data;
}