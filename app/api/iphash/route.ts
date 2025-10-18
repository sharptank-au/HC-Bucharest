import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    const fwd = req.headers.get("x-forwarded-for");
    const ip = (fwd?.split(",")[0] || "0.0.0.0").trim();
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
    return NextResponse.json({ ipHash });
}
