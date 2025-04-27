import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/config";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("GET Session:", session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    const userProfile = await usersCollection.findOne({
      email: session.user.email,
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert ObjectId to string for JSON serialization
    const serializedProfile = {
      ...userProfile,
      _id: userProfile._id.toString(),
    };

    return NextResponse.json(serializedProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("PUT Session:", session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("PUT Data:", data);
    const { age, gender, bio, location, phoneNumber } = data;

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // First, ensure the user exists
    const existingUser = await usersCollection.findOne({
      email: session.user.email,
    });
    console.log("Existing user:", existingUser);

    if (!existingUser) {
      // Create initial user document if it doesn't exist
      const newUser = {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await usersCollection.insertOne(newUser);
      console.log("Created new user:", newUser);
    }

    // Update the user profile
    const update = {
      $set: {
        age: age ? parseInt(age) : null,
        gender,
        bio,
        location,
        phoneNumber,
        updatedAt: new Date(),
      },
    };

    console.log("Updating with:", update);

    const updatedUser = await usersCollection.findOneAndUpdate(
      { email: session.user.email },
      update,
      { returnDocument: "after" }
    );

    console.log("Update result:", updatedUser);

    if (!updatedUser) {
      console.error("Failed to update user:", session.user.email);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    // Convert ObjectId to string for JSON serialization
    const serializedUser = {
      ...updatedUser,
      _id: updatedUser._id.toString(),
    };

    return NextResponse.json(serializedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
