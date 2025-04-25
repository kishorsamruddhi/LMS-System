import { handleRequest, instance } from ".";

export const deleteAdminCourse = async (id) => {
  return handleRequest(() =>
    instance.delete("/admin/delete/delete_course/" + id)
  );
};

export const deleteAdminModule = async (id) => {
  return handleRequest(() =>
    instance.delete("/admin/delete/delete_module/" + id)
  );
};
export const deleteAdmin_Assessment = async (id) => {
  return handleRequest(() =>
    instance.delete("/admin/delete/delete_assessment/" + id)
  );
};

export const deleteAdmin_Pedagogy = async (id) => {
  return handleRequest(() =>
    instance.delete("/admin/delete/delete_pedagogy/" + id)
  );
};
