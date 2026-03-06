import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { toast } from "sonner";
import { LoginForm } from "./LoginForm";

const mockPush = vi.fn();
const mockLogin = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/features/auth/AuthProvider", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
  });

  describe("rendering", () => {
    it("renders email input, password input and submit button", () => {
      render(<LoginForm />);

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("renders the demo credentials section", () => {
      render(<LoginForm />);

      expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
      expect(screen.getByText(/eve\.holt@reqres\.in/)).toBeInTheDocument();
    });

    it("submit button is disabled when form is empty", () => {
      render(<LoginForm />);

      expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
    });
  });

  describe("email validation", () => {
    it("does not show an error when email field is empty", () => {
      render(<LoginForm />);

      expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
    });

    it("shows an error message for an invalid email format", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "not-an-email");

      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });

    it("hides the error message when the email becomes valid", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "valid@example.com");

      expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
    });
  });

  describe("form validity", () => {
    it("keeps the button disabled with a valid email but no password", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "valid@example.com");

      expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
    });

    it("keeps the button disabled with a password but an invalid email", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "not-an-email");
      await user.type(screen.getByLabelText("Password"), "anypassword");

      expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
    });

    it("enables the button when email is valid and password is non-empty", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "valid@example.com");
      await user.type(screen.getByLabelText("Password"), "anypassword");

      expect(screen.getByRole("button", { name: /sign in/i })).toBeEnabled();
    });
  });

  describe("password visibility toggle", () => {
    it("password field type is password by default", () => {
      render(<LoginForm />);

      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    });

    it("changes password field to type text when show password is clicked", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole("button", { name: /show password/i }));

      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    });

    it("restores password field to type password when hide password is clicked", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole("button", { name: /show password/i }));
      await user.click(screen.getByRole("button", { name: /hide password/i }));

      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    });
  });

  describe("form submission", () => {
    describe("loading state", () => {
      it("shows Signing in text and disables inputs while login is pending", async () => {
        const user = userEvent.setup();
        mockLogin.mockReturnValue(new Promise(() => {}));
        render(<LoginForm />);

        await user.type(screen.getByLabelText("Email"), "eve.holt@reqres.in");
        await user.type(screen.getByLabelText("Password"), "cityslicka");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeDisabled();
        expect(screen.getByLabelText("Password")).toBeDisabled();
      });
    });

    describe("successful login", () => {
      it("calls login with the provided email and password", async () => {
        const user = userEvent.setup();
        render(<LoginForm />);

        await user.type(screen.getByLabelText("Email"), "eve.holt@reqres.in");
        await user.type(screen.getByLabelText("Password"), "cityslicka");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
          expect(mockLogin).toHaveBeenCalledWith("eve.holt@reqres.in", "cityslicka");
        });
      });

      it("shows a success toast after login", async () => {
        const user = userEvent.setup();
        render(<LoginForm />);

        await user.type(screen.getByLabelText("Email"), "eve.holt@reqres.in");
        await user.type(screen.getByLabelText("Password"), "cityslicka");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith("Logged in successfully");
        });
      });

      it("redirects to /users after a successful login", async () => {
        const user = userEvent.setup();
        render(<LoginForm />);

        await user.type(screen.getByLabelText("Email"), "eve.holt@reqres.in");
        await user.type(screen.getByLabelText("Password"), "cityslicka");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith("/users");
        });
      });
    });

    describe("failed login", () => {
      it("shows an error toast with the server message when login throws an Error", async () => {
        const user = userEvent.setup();
        mockLogin.mockRejectedValue(new Error("Invalid credentials"));
        render(<LoginForm />);

        await user.type(screen.getByLabelText("Email"), "eve.holt@reqres.in");
        await user.type(screen.getByLabelText("Password"), "wrongpassword");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
        });
      });

      it("shows a generic Login failed toast when login throws a non-Error", async () => {
        const user = userEvent.setup();
        mockLogin.mockRejectedValue("unexpected failure");
        render(<LoginForm />);

        await user.type(screen.getByLabelText("Email"), "eve.holt@reqres.in");
        await user.type(screen.getByLabelText("Password"), "wrongpassword");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith("Login failed");
        });
      });
    });
  });
});
