import API from "./api";

export async function getDashboardSummary() {
  const response = await API.get("/dashboard/summary");
  return response.data;
}

export async function resetDemoData() {
  const response = await API.post("/dashboard/reset-demo");
  return response.data;
}