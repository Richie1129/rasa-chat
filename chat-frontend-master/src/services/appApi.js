import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// define a service user a base URL

const appApi = createApi({
    reducerPath: "appApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5001",
    }),

    endpoints: (builder) => ({
        // creating the user
        signupUser: builder.mutation({
            query: (user) => ({
                url: "/users",
                method: "POST",
                body: user,
            }),
        }),

        // login
        loginUser: builder.mutation({
            query: (user) => ({
                url: "/users/login",
                method: "POST",
                body: user,
            }),
        }),

        // logout

        logoutUser: builder.mutation({
            query: (payload) => ({
                url: "/logout",
                method: "DELETE",
                body: payload,
            }),
        }),
    }),
});

export const { useSignupUserMutation, useLoginUserMutation, useLogoutUserMutation } = appApi;

export default appApi;

// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


// // 定義一個基礎的 API 服務，使用代理


// const appApi = createApi({
//     reducerPath: "appApi",
//     baseQuery: fetchBaseQuery({
//         baseUrl: "/api/express",
//     }),


//     endpoints: (builder) => ({
//         // 創建用戶
//         signupUser: builder.mutation({
//             query: (user) => ({
//                 url: "/users",
//                 method: "POST",
//                 body: user,
//             }),
//         }),


//         // 登入
//         loginUser: builder.mutation({
//             query: (user) => ({
//                 url: "/users/login",
//                 method: "POST",
//                 body: user,
//             }),
//         }),


//         // 登出
//         logoutUser: builder.mutation({
//             query: (payload) => ({
//                 url: "/logout",
//                 method: "DELETE",
//                 body: payload,
//             }),
//         }),


//         // 文字雲
//         // wordCloud: builder.mutation({
//         //     query: (payload) => ({
//         //         url: "/admin/wordCloud",
//         //         method: "GET",
//         //         body: payload,
//         //     }),
//         // }),
//     }),
// });


// export const { useSignupUserMutation, useLoginUserMutation, useLogoutUserMutation } = appApi;


// export default appApi;



