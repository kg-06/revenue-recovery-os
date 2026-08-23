import API from "./api";

export async function getRecoveryCases() {
  const response = await API.get("/recovery/cases");

  // Only show active cases in the Recovery Queue
  return response.data.filter(
    (c: any) =>
      (c.current_state ?? c.workflow_state ?? "at_risk") !== "closed",
  );
}

export async function getRecoveredCases() {
  const response = await API.get("/recovery/cases");

  // Completed cases for the future audit page
  return response.data.filter(
    (c: any) =>
      (c.current_state ?? c.workflow_state ?? "at_risk") === "closed",
  );
}