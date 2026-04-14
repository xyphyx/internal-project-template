import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HealthResponse = {
  status: "ok" | "error";
  version: string;
  environment: string;
  timestamp: string;
  message?: string;
};

export function GET() {
  try {
    const body: HealthResponse = {
      status: "ok",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
      environment: process.env.NODE_ENV ?? "unknown",
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(body);
  } catch (err) {
    const body: HealthResponse = {
      status: "error",
      version: "unknown",
      environment: process.env.NODE_ENV ?? "unknown",
      timestamp: new Date().toISOString(),
      message: err instanceof Error ? err.message : "unexpected error",
    };
    return NextResponse.json(body, { status: 500 });
  }
}
