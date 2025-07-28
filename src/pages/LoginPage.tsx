import React from "react";

const LoginPage: React.FC = () => {
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
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
