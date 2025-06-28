import FormField from '../molecules/FormField';

export default function SignInForm({ form, errors, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign In</h2>
      <FormField
        label="Email or Username"
        name="email"
        value={form.email}
        onChange={onChange}
        error={errors.email}
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        error={errors.password}
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
      >
        Sign In
      </button>
    </form>
  );
}
