"use client";

import React from "react";
import RegisterForm from "@/app/features/auth/components/RegisterForm";
import AuthLayout from "@/app/features/auth/components/AuthLayout";
const page = () => {
  return (
    <div>
      <AuthLayout>
        <RegisterForm />
      </AuthLayout>
    </div>
  );
};

export default page;
