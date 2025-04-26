import { handleRequest, instance } from ".";

export const createAdminBusiness = async (body) => {
  return handleRequest(() =>
    instance.post("/admin/create/create_business", body)
  );
};

export const createAdminCourse = async (body) => {
  return handleRequest(() =>
    instance.post("/admin/create/create_course", body)
  );
};

export const createAdminModule = async (body) => {
  return handleRequest(() =>
    instance.post("/admin/create/create_module", body)
  );
};

export const createAdmin_Assessment = async (body) => {
  return handleRequest(() =>
    instance.post("/admin/create/create_assessment", body)
  );
};

export const createAdmin_Pedagogy = async (body) => {
  return handleRequest(() =>
    instance.post("/admin/create/create_pedagogy", body)
  );
};

export const createAdmin_subscription = async (body) => {
  return handleRequest(() =>
    instance.post("/admin/create/create_subscription", body)
  );
};
