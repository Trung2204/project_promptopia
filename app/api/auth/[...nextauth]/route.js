// Handle authentication
import NextAuth from "next-auth";
import GooglepProvide from "next-auth/providers/google";

import User from "@models/user"; // Interact with user schema
import { connectToDB } from "@utils/database"; // Estabblish database connection

// Configure NextAuth function with providers
// and custom functions for session and sign-in handling
const handler = NextAuth({
  // Set up Google authentication
  providers: [
    GooglepProvide({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // Function: customize session object
    // by adding the user's ID to it
    async session({ session }) {
      // Find the user in the database using email
      // from the session object
      const sessionUser = await User.findOne({
        email: session.user.email,
      });
      // add user's ID to the session object
      session.user.id = sessionUser._id.toString();
      // return customized session object
      return session;
    },
    // Function: handle sign-in process,
    // Check if the user exists or not, then create a new user
    async signIn({ profile }) {
      try {
        await connectToDB();

        // Check if a user already exists
        const userExists = await User.findOne({
          email: profile.email,
        });

        // If not, create a new user
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture,
          });
        }

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
