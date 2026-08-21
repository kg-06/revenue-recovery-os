import API from "./api";

export async function uploadCSV(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await API.post(
    "/upload/payments",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}