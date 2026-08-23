import RegisterForm from "@/app/features/auth/components/RegisterForm";
import AuthLayout from "@/app/features/auth/components/AuthLayout";

interface PageProps {
  searchParams: Promise<{
    role?: string;
  }>;
}

const page = async ({searchParams} : PageProps) => {

    const { role } = await searchParams;

  return (
    <div>
      <AuthLayout>
        <RegisterForm role = {role} mode = {"partner-signup"}/>
      </AuthLayout>
    </div>
  )
}

export default page
