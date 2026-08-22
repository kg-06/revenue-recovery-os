import API from "./api";

export async function generateDiagnoses() {
  const response = await API.post("/diagnosis/generate");
  return response.data;
}