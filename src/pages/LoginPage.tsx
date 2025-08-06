import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from '@/shared/components';
import { useLogin } from '@/shared/hooks';
import { type LoginForm, loginSchema } from '@/shared/schemas/auth';

const LoginPage = () => {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Login failed. Please try again.',
      });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in to Admin</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username Field */}
          <div>
            <Input
              type="text"
              placeholder="Username"
              {...register('username')}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <Input
              type="password"
              placeholder="Password"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Global Error Message */}
          {errors.root && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
              {errors.root.message}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="text-blue-700 font-medium mb-1">Demo Credentials:</p>
          <p className="text-blue-600">
            Username: <code>admin</code>
          </p>
          <p className="text-blue-600">
            Password: <code>admin123</code>
          </p>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground text-center">
        © 2025 React Admin Blocks
      </CardFooter>
    </Card>
  );
};

export default LoginPage;
