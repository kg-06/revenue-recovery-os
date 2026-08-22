import API from "./api";

export async function getWorkflow(paymentId: string) {
  const response = await API.get(`/workflow/${paymentId}`);
  return response.data;
}