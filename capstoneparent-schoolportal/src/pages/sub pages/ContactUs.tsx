import { Navbar } from "@/components/Navbar";

export const ContactUs = () => {
  return (
    <div className="text-center">
      <Navbar />
      <div className="max-w-4xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-4">Contact Page</h1>
        <p>This is the contact page content.</p>
      </div>
    </div>
  );
};