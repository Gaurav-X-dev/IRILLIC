import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/services/user.service";
import { updateUserSchema } from "@/validations/user.validation";
import { ApiResponse } from "@/types/api.types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/users/:id
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await userService.getById(id);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
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

// PATCH /api/v1/users/:id
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateUserSchema.parse(body);
    const user = await userService.update(id, validated);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
      message: "User updated successfully",
    });
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

// DELETE /api/v1/users/:id
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await userService.delete(id);

    if (!deleted) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "User deleted successfully",
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
