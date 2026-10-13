import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@researchgrid.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Send the login request to your Spring Boot backend
        const res = await fetch("http://localhost:8080/api/auth/login", {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        });
        
        const data = await res.json();
        
        // 2. If Spring Boot returns a valid token, decode it and save the user
        if (res.ok && data.token) {
          const decoded = jwtDecode(data.token);
          
          return {
            id: decoded.sub,       // The email
            email: decoded.sub,
            role: decoded.role,    // The RBAC role (e.g., ADMIN)
            accessToken: data.token // The raw JWT to send on future requests
          };
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    // 3. Persist the Java token and role into the Next.js session
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/login', // We will build a custom Tailwind login page next
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };