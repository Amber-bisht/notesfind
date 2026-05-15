
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function getDataFromToken(request: NextRequest): Promise<string> {
    try {
        const token = request.cookies.get("token")?.value || "";
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            throw new Error("Invalid token");
        }
        return decodedToken.userId;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred");
    }
}
