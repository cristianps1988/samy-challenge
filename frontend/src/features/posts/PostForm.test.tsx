import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { toast } from "sonner";
import { PostForm } from "./PostForm";
import { useCreatePost, useUpdatePost, usePost } from "./usePosts";
import { useSavedUsers } from "../users/useUsers";

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockCreatePost = vi.fn();
const mockUpdatePost = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

vi.mock("./usePosts", () => ({
  useCreatePost: vi.fn(),
  useUpdatePost: vi.fn(),
  usePost: vi.fn(),
}));

vi.mock("../users/useUsers", () => ({
  useSavedUsers: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUsers = [
  { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com" },
];

const mockExistingPost = {
  id: 5,
  title: "Existing Title",
  content: "Existing content text here",
  authorId: 1,
};

describe("PostForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreatePost.mockResolvedValue(undefined);
    mockUpdatePost.mockResolvedValue(undefined);
    vi.mocked(usePost).mockReturnValue({ data: undefined, isLoading: false } as unknown as ReturnType<typeof usePost>);
    vi.mocked(useSavedUsers).mockReturnValue({ data: mockUsers, isLoading: false } as unknown as ReturnType<typeof useSavedUsers>);
    vi.mocked(useCreatePost).mockReturnValue({ mutateAsync: mockCreatePost, isPending: false } as unknown as ReturnType<typeof useCreatePost>);
    vi.mocked(useUpdatePost).mockReturnValue({ mutateAsync: mockUpdatePost, isPending: false } as unknown as ReturnType<typeof useUpdatePost>);
  });

  describe("create mode", () => {
    describe("rendering", () => {
      it("shows the Create Post heading and Publish Post button", () => {
        render(<PostForm mode="create" />);

        expect(screen.getByText("Create Post")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /publish post/i })).toBeInTheDocument();
      });

      it("shows the author selector", () => {
        render(<PostForm mode="create" />);

        expect(screen.getByLabelText("Author")).toBeInTheDocument();
      });

      it("disables the submit button when there are no available users", () => {
        vi.mocked(useSavedUsers).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useSavedUsers>);
        render(<PostForm mode="create" />);

        expect(screen.getByRole("button", { name: /publish post/i })).toBeDisabled();
      });
    });

    describe("validation", () => {
      it("shows an error when the title is empty on submit", async () => {
        const user = userEvent.setup();
        render(<PostForm mode="create" />);

        await user.click(screen.getByRole("button", { name: /publish post/i }));

        expect(screen.getByText("Title is required")).toBeInTheDocument();
      });

      it("shows an error when the title is shorter than 3 characters", async () => {
        const user = userEvent.setup();
        render(<PostForm mode="create" />);

        await user.type(screen.getByLabelText("Title"), "Hi");
        await user.click(screen.getByRole("button", { name: /publish post/i }));

        expect(screen.getByText("Title must be at least 3 characters")).toBeInTheDocument();
      });

      it("shows an error when the content is empty on submit", async () => {
        const user = userEvent.setup();
        render(<PostForm mode="create" />);

        await user.type(screen.getByLabelText("Title"), "Valid Title");
        await user.click(screen.getByRole("button", { name: /publish post/i }));

        expect(screen.getByText("Content is required")).toBeInTheDocument();
      });

      it("shows an error when the content is shorter than 10 characters", async () => {
        const user = userEvent.setup();
        render(<PostForm mode="create" />);

        await user.type(screen.getByLabelText("Title"), "Valid Title");
        await user.type(screen.getByLabelText("Content"), "Short");
        await user.click(screen.getByRole("button", { name: /publish post/i }));

        expect(screen.getByText("Content must be at least 10 characters")).toBeInTheDocument();
      });

      it("shows an error when no author is selected on submit", async () => {
        const user = userEvent.setup();
        render(<PostForm mode="create" />);

        await user.type(screen.getByLabelText("Title"), "Valid Title");
        await user.type(screen.getByLabelText("Content"), "Valid content text here");
        await user.click(screen.getByRole("button", { name: /publish post/i }));

        expect(screen.getByText("Author is required")).toBeInTheDocument();
      });

      it("clears the title error when the field is corrected", async () => {
        const user = userEvent.setup();
        render(<PostForm mode="create" />);

        await user.click(screen.getByRole("button", { name: /publish post/i }));
        expect(screen.getByText("Title is required")).toBeInTheDocument();

        await user.type(screen.getByLabelText("Title"), "Valid Title");

        expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
      });

      it("clears the content error when the field is corrected", async () => {
        const user = userEvent.setup();
        render(<PostForm mode="create" />);

        await user.type(screen.getByLabelText("Title"), "Valid Title");
        await user.click(screen.getByRole("button", { name: /publish post/i }));
        expect(screen.getByText("Content is required")).toBeInTheDocument();

        await user.type(screen.getByLabelText("Content"), "Valid content text here");

        expect(screen.queryByText("Content is required")).not.toBeInTheDocument();
      });
    });

    describe("loading state", () => {
      it("shows Saving text and disables inputs while the mutation is pending", () => {
        vi.mocked(useCreatePost).mockReturnValue({ mutateAsync: mockCreatePost, isPending: true } as unknown as ReturnType<typeof useCreatePost>);
        render(<PostForm mode="create" />);

        expect(screen.getByText(/saving/i)).toBeInTheDocument();
        expect(screen.getByLabelText("Title")).toBeDisabled();
        expect(screen.getByLabelText("Content")).toBeDisabled();
      });
    });

    describe("successful submission", () => {
      async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
        await user.type(screen.getByLabelText("Title"), "My New Post");
        await user.type(screen.getByLabelText("Content"), "Content that is long enough");
        await user.selectOptions(screen.getByLabelText("Author"), "John Doe (john@example.com)");
        await user.click(screen.getByRole("button", { name: /publish post/i }));
      }

      it("calls createPostMutation with the correct form data", async () => {
        const user = userEvent.setup();
        render(<PostForm mode="create" />);

        await fillAndSubmit(user);

        await waitFor(() => {
          expect(mockCreatePost).toHaveBeenCalledWith({
            title: "My New Post",
            content: "Content that is long enough",
            authorId: 1,
          });
        });
      });

      it("shows a success toast after creating the post", async () => {
        const user = userEvent.setup();
        render(<PostForm mode="create" />);

        await fillAndSubmit(user);

        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith("Post created successfully");
        });
      });

      it("redirects to /posts after creating the post", async () => {
        const user = userEvent.setup();
        render(<PostForm mode="create" />);

        await fillAndSubmit(user);

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith("/posts");
        });
      });
    });

    describe("failed submission", () => {
      it("shows an error toast when the mutation fails", async () => {
        const user = userEvent.setup();
        mockCreatePost.mockRejectedValue(new Error("Network error"));
        render(<PostForm mode="create" />);

        await user.type(screen.getByLabelText("Title"), "My New Post");
        await user.type(screen.getByLabelText("Content"), "Content that is long enough");
        await user.selectOptions(screen.getByLabelText("Author"), "John Doe (john@example.com)");
        await user.click(screen.getByRole("button", { name: /publish post/i }));

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith("Failed to save post. Please try again.");
        });
      });
    });
  });

  describe("edit mode", () => {
    const editProps = {
      mode: "edit" as const,
      postId: 5,
      initialData: { title: "Original Title", content: "Original content here okay", authorId: 1 },
    };

    describe("rendering", () => {
      it("shows the Edit Post heading and Save Changes button", () => {
        render(<PostForm {...editProps} />);

        expect(screen.getByText("Edit Post")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
      });

      it("does not show the author selector", () => {
        render(<PostForm {...editProps} />);

        expect(screen.queryByLabelText("Author")).not.toBeInTheDocument();
      });

      it("pre-fills the form with the existing post data", () => {
        vi.mocked(usePost).mockReturnValue({ data: mockExistingPost, isLoading: false } as unknown as ReturnType<typeof usePost>);
        render(<PostForm mode="edit" postId={5} />);

        expect(screen.getByLabelText("Title")).toHaveValue("Existing Title");
        expect(screen.getByLabelText("Content")).toHaveValue("Existing content text here");
      });
    });

    describe("loading state", () => {
      it("shows Saving text and disables inputs while the mutation is pending", () => {
        vi.mocked(useUpdatePost).mockReturnValue({ mutateAsync: mockUpdatePost, isPending: true } as unknown as ReturnType<typeof useUpdatePost>);
        render(<PostForm {...editProps} />);

        expect(screen.getByText(/saving/i)).toBeInTheDocument();
        expect(screen.getByLabelText("Title")).toBeDisabled();
        expect(screen.getByLabelText("Content")).toBeDisabled();
      });
    });

    describe("successful submission", () => {
      it("calls updatePostMutation with the post id and updated fields", async () => {
        const user = userEvent.setup();
        render(<PostForm {...editProps} />);

        await user.click(screen.getByRole("button", { name: /save changes/i }));

        await waitFor(() => {
          expect(mockUpdatePost).toHaveBeenCalledWith({
            id: 5,
            data: { title: "Original Title", content: "Original content here okay" },
          });
        });
      });

      it("shows a success toast after updating the post", async () => {
        const user = userEvent.setup();
        render(<PostForm {...editProps} />);

        await user.click(screen.getByRole("button", { name: /save changes/i }));

        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith("Post updated successfully");
        });
      });

      it("redirects to the post detail page after updating", async () => {
        const user = userEvent.setup();
        render(<PostForm {...editProps} />);

        await user.click(screen.getByRole("button", { name: /save changes/i }));

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith("/posts/5");
        });
      });
    });
  });

  describe("navigation", () => {
    it("calls router.back when the back button is clicked", async () => {
      const user = userEvent.setup();
      render(<PostForm mode="create" />);

      await user.click(screen.getByRole("button", { name: /back to posts/i }));

      expect(mockBack).toHaveBeenCalled();
    });

    it("calls router.back when the cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<PostForm mode="create" />);

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(mockBack).toHaveBeenCalled();
    });
  });
});
