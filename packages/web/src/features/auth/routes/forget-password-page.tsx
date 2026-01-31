// src/pages/forgot-password-page.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import VerifyIdentityForm from "../components/verify-identity-form";
import NewPasswordForm from "../components/new-password-form";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    email: "",
    code: "",
  });

  const handleIdentityVerified = (data: { email: string; code: string }) => {
    setFormData(data);
    setStep(2);
  };

  const handleResetSuccess = () => {
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {step === 1 ? "找回密码" : "重置密码"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1
              ? "请输入注册邮箱以获取验证码"
              : "验证成功，请设置您的新密码"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <VerifyIdentityForm
              defaultValues={formData}
              onNext={handleIdentityVerified}
            />
          )}

          {step === 2 && (
            <NewPasswordForm
              email={formData.email}
              code={formData.code}
              onBack={() => setStep(1)}
              onSuccess={handleResetSuccess}
            />
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <div className="text-sm text-gray-500">
            想起密码了？{" "}
            <Link
              to="/login"
              className="text-black font-medium hover:underline"
            >
              返回登录
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
