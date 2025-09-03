// import CredentialProvider from "next-auth/providers/credentials";

// export const authOptions = {
//   providers: [
//     CredentialProvider({
//       name: "Vendor Login",
//       credentials: {
//         mobile: { label: "Mobile", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const { mobile, password } = credentials;

//         try {
//           const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ mobile, password }),
//           });

//           const data = await res.json();

//           if (!res.ok) {
//             throw new Error(data.message || "Login failed");
//           }

//           console.log("Login successful:", data);

//           // Return user data (do NOT use localStorage here)
//           return {
//             id: data.vendorId,
//             name: data.vendorName,
//             contacts: data.contacts,
//             latitude: data.latitude,
//             longitude: data.longitude,
//             address: data.address,
//             image: data.image,
//             parkingEntries: data.parkingEntries,
//           };
//         } catch (error) {
//           console.error("Error during login:", error);
//           throw new Error(error.message || "Internal server error");
//         }
//       },
//     }),
//   ],
//   session: { strategy: "jwt" },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token = { ...token, ...user };
//       }

      
// return token;
//     },
//     async session({ session, token }) {
//       session.user = token;
      
// return session;
//     },
//   },
//   pages: { signIn: "/login" },
// };

import CredentialProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialProvider({
      name: "Vendor Login",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Login failed");
          }

          const data = await res.json();
          
          return {
            id: data.adminId,
            name: data.adminName,
            contacts: data.contacts,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            image: data.image,
            parkingEntries: data.parkingEntries,
          };
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 }, // 24 hours
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, ...user };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },
  pages: { 
    signIn: "/admin",
    error: "/admin" 
  },
  secret: process.env.NEXTAUTH_SECRET,
};
