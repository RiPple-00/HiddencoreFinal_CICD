import api from "../index";

/** @param {number} postId */
export const applyGuardianProgram = (postId) =>
  api.post(`/api/guardian/programs/${postId}/apply`);

export const getGuardianProgramApplications = () =>
  api.get("/api/guardian/programs/applications");

/** @param {string|number} documentId */
export const cancelGuardianProgramApplication = (documentId) =>
  api.delete(`/api/guardian/programs/applications/${documentId}`);
