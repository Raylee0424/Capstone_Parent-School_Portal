import { NavbarAdmin } from "../../components/admin/NavbarAdmin";

export const ManageStudents = () => {
  return (
    <div className="text-center">
      <NavbarAdmin />
      <div className="max-w-4xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-4">Manage Students</h1>
        <p>This is the manage students page content.</p>
      </div>
    </div>
  );
};