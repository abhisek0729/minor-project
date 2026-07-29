import RegisterForm from "@/app/features/auth/components/RegisterForm";
import AuthLayout from "@/app/features/auth/components/AuthLayout";

const page = async () => {
 
  return (
    <div>
      <AuthLayout>
        <RegisterForm role={"tourist"} mode={"tourist-signup"} />
      </AuthLayout>
    </div>
  );
};

export default page;
