import { AuthLayout } from "@/app/features/auth/components";
import SignInForm from "@/app/features/auth/components/SignInForm";

export default function Page() {
  return (
    <AuthLayout showBackground = {true}>
      <SignInForm />
    </AuthLayout>
  );
}
