import { handleRequest, instance } from ".";

export const updateAdminBusiness = async (body) => {
  return handleRequest(() =>
    instance.put("/admin/update/update_business", body)
  );
};

export const updateAdminCourse = async (body) => {
  return handleRequest(() => instance.put("/admin/update/update_course", body));
};

export const updateAdminModule = async (body) => {
  return handleRequest(() => instance.put("/admin/update/update_module", body));
};

export const updateAdmin_Assessment = async (body) => {
  return handleRequest(() =>
    instance.put("/admin/update/update_assessment", body)
  );
};

export const updateAdmin_Pedagogy = async (body) => {
  return handleRequest(() =>
    instance.put("/admin/update/update_pedagogy", body)
  );
};

export const updateAdmin_Subscription_Pack = async (body) => {
  return handleRequest(() =>
    instance.put("/admin/update/update_subscription_pack", body)
  );
};
