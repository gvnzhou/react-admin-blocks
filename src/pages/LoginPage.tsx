import { Button } from "@/components/ui/button";

const LoginPage = () => {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-center">Login</h1>
      <form className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          className="border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded px-3 py-2"
        />
        <Button>Login</Button>
      </form>
    </div>
  );
};

export default LoginPage;
