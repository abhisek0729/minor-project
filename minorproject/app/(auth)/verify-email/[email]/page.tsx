import VerifyEmailForm from '@/app/features/auth/components/VerifyEmailForm'

type PageProps = {
  params: Promise<{
    email: string;
  }>;
};

export default async function Page({
  params,
}: PageProps) {
  const { email } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <VerifyEmailForm
        email={decodeURIComponent(email)}
      />
    </div>
  );
}