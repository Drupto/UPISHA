import { NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";

export async function GET() {
  return withSecurityHeaders(NextResponse.json({ message: "Hello, world!" }));
}