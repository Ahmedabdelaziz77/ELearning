import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { Clerk } from "@clerk/clerk-js";
import { toast } from "sonner";
const customBaseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: any
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await window.Clerk?.session?.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });
  try {
    const result: any = await baseQuery(args, api, extraOptions);
    if (result.error) {
      const errorData = result.error.data;
      const errorMessage =
        errorData?.message ||
        result.error.status.toString() ||
        "An error occured";
      toast.error(`Error : ${errorMessage}`);
    }
    const isMutationRequest =
      (args as FetchArgs).method && (args as FetchArgs).method !== "GET";
    if (isMutationRequest) {
      const successMessage = result.data?.message;
      if (successMessage) toast.success(successMessage);
    }
    if (result.data) {
      result.data = result.data.data;
    } else if (
      result.error?.status === 204 ||
      result.meta?.response?.status === 24
    ) {
      return { data: null };
    }
    return result;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return { error: { status: "FETCH_ERROR", error: errorMessage } };
  }
};

export const api = createApi({
  baseQuery: customBaseQuery,
  reducerPath: "api",
  tagTypes: ["Courses", "Users", "UserCourseProgress"],
  endpoints: (build) => ({
    // user clerk
    updateUser: build.mutation<User, Partial<User> & { userId: string }>({
      query: ({ userId, ...updatedUser }) => ({
        url: `api/v1/users/clerk/${userId}`,
        method: "PUT",
        body: updatedUser,
      }),
      invalidatesTags: ["Users"],
    }),
    // courses
    getAllCourses: build.query<Course[], { category?: string }>({
      query: ({ category }) => ({
        url: "api/v1/courses",
        params: { category },
      }),
      providesTags: ["Courses"],
    }),
    getCourse: build.query<Course, string>({
      query: (courseId) => `api/v1/courses/${courseId}`,
      providesTags: (result, error, id) => [{ type: "Courses", id }],
    }),
    createCourse: build.mutation<
      Course,
      { teacherId: string; teacherName: string }
    >({
      query: ({ teacherId, teacherName }) => ({
        url: `api/v1/courses`,
        method: "POST",
        body: { teacherId, teacherName },
      }),
      invalidatesTags: ["Courses"],
    }),
    updateCourse: build.mutation<
      Course,
      { courseId: string; formData: FormData }
    >({
      query: ({ courseId, formData }) => ({
        url: `api/v1/courses/${courseId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        {
          type: "Courses",
          id: courseId,
        },
      ],
    }),
    deleteCourse: build.mutation<Course, string>({
      query: (courseId) => ({
        url: `api/v1/courses/${courseId}`,
        method: "DELETE",
      }),
    }),
    // transactions
    getAllTransactions: build.query<Transaction[], string>({
      query: (userId) => `api/v1/transactions?userId=${userId}`,
    }),
    createStripePaymentIntent: build.mutation<
      { clientSecret: string },
      { amount: number }
    >({
      query: ({ amount }) => ({
        url: "api/v1/transactions/stripe/payment-intent",
        method: "POST",
        body: { amount },
      }),
    }),
    createTransaction: build.mutation<Transaction, Partial<Transaction>>({
      query: (data) => ({
        url: "api/v1/transactions",
        method: "POST",
        body: data,
      }),
    }),
    // user progress for courses
    getUserEnrolledCourses: build.query<Course[], string>({
      query: (userId) =>
        `api/v1/users/course-progress/${userId}/enrolled-courses`,
      providesTags: ["Courses", "UserCourseProgress"],
    }),

    getUserCourseProgress: build.query<
      UserCourseProgress,
      { userId: string; courseId: string }
    >({
      query: ({ userId, courseId }) =>
        `api/v1/users/course-progress/${userId}/courses/${courseId}`,
      providesTags: ["UserCourseProgress"],
    }),

    updateUserCourseProgress: build.mutation<
      UserCourseProgress,
      {
        userId: string;
        courseId: string;
        progressData: {
          sections: SectionProgress[];
        };
      }
    >({
      query: ({ userId, courseId, progressData }) => ({
        url: `api/v1/users/course-progress/${userId}/courses/${courseId}`,
        method: "PUT",
        body: progressData,
      }),
      invalidatesTags: ["UserCourseProgress"],
      async onQueryStarted(
        { userId, courseId, progressData },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          api.util.updateQueryData(
            "getUserCourseProgress",
            { userId, courseId },
            (draft) => {
              Object.assign(draft, {
                ...draft,
                sections: progressData.sections,
              });
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetAllCoursesQuery,
  useGetCourseQuery,
  useGetAllTransactionsQuery,
  useGetUserCourseProgressQuery,
  useGetUserEnrolledCoursesQuery,
  useUpdateUserMutation,
  useUpdateCourseMutation,
  useUpdateUserCourseProgressMutation,
  useCreateCourseMutation,
  useCreateTransactionMutation,
  useCreateStripePaymentIntentMutation,
  useDeleteCourseMutation,
} = api;
