import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/services/user.service";
import { createUserSchema } from "@/validations/user.validation";
import { ApiResponse } from "@/types/api.types";

// GET /api/v1/users - Get all users
export async function GET() {
  try {
    const users = await userService.getAll();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: users,
      message: "Users fetched successfully",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// POST /api/v1/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createUserSchema.parse(body);
    const user = await userService.create(validated);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: user,
        message: "User created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 400 },
    );
  }
}
