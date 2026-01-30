
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SubCategory from "@/models/SubCategory";

dbConnect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { id } = reqBody;

        if (!id) {
            return NextResponse.json({ error: "SubCategory ID is required" }, { status: 400 });
        }

        const subCategory = await SubCategory.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!subCategory) {
            return NextResponse.json({ error: "SubCategory not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "View count updated",
            views: subCategory.views
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
