import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";

/**
 * Face recognition image upload endpoint.
 *
 * Kept outside tRPC because it handles binary/multipart data.
 * In dev this does nothing — face.service.ts console stub handles it.
 * In production, swap the body of handleFaceUpload() to call your provider.
 *
 * POST /api/face
 * Body: multipart/form-data with field "image" (JPEG/PNG)
 * Returns: { faceReferenceId: string }
 */
export async function POST(req: NextRequest) {
  // Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData  = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPEG or PNG." }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large. Max 5MB." }, { status: 400 });
    }

    // Convert to base64 for face service
    const buffer     = await imageFile.arrayBuffer();
    const base64     = Buffer.from(buffer).toString("base64");
    const imageData  = `data:${imageFile.type};base64,${base64}`;

    // In dev: console stub — logs to terminal, returns mock ID
    // In prod: replace enrollFace import with your real provider
    const { enrollFace } = await import("@/server/services/face.service");
    const result = await enrollFace(session.user.id, imageData);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      faceReferenceId: result.faceReferenceId,
      message: result.message,
    });
  } catch (err) {
    console.error("[/api/face] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}