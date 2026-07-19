// import SignInPage from "@/app/features/auth/components/SignInForm";

// import React from 'react'

// const page = () => {
//   return (
//     <div>
//       <SignInPage />
//     </div>
//   )
// }

// export default page


import { AuthLayout } from "@/app/features/auth/components";
import SignInForm from "@/app/features/auth/components/SignInForm";

export default function Page() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}
