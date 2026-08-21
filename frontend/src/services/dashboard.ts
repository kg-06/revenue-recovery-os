import API from "./api";

export async function getDashboardSummary() {
  const response = await API.get("/dashboard/summary");
  return response.data;
}