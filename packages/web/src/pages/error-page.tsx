import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError() as { statusText?: string; message?: string };
  console.error(error);

  return (
    <div className="w-full h-screen flex justify-center items-center flex-col">
      <h1>哎呀！出错了</h1>
      <p>抱歉，发生了意外错误。</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
};

export default ErrorPage;
