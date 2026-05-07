import AuthForm from "./AuthForm";

export const metadata = { title: "Sign in — SlipGen" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
