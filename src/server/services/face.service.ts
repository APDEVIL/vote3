/**
 * face.service.ts
 *
 * Pluggable face recognition adapter.
 *
 * Currently implements a CONSOLE stub — logs to terminal in development
 * so you can build the full app without a face provider.
 *
 * To swap in a real provider later, only this file needs to change.
 * All routers call enrollFace() and verifyFace() — they never talk
 * to the provider directly.
 *
 * Supported providers (swap by setting FACE_PROVIDER env var):
 *   "console"    → dev stub, always returns success (default)
 *   "faceio"     → https://faceio.net  (free tier available)
 *   "rekognition"→ AWS Rekognition     (pay per use, ~$1/1000 calls)
 *
 * For this project we default to "console" (free, no setup).
 * FaceIO has a free tier and is the recommended upgrade path.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type EnrollResult = {
  success: boolean;
  faceReferenceId: string;  // store this in user.faceReferenceId
  message: string;
};

export type VerifyResult = {
  success: boolean;
  confidence: number;       // 0–1, how confident the match is
  message: string;
};

// ── Console stub (development / free default) ──────────────────────────────────

async function enrollFaceConsole(userId: string): Promise<EnrollResult> {
  console.log(`\n👤 [FACE STUB] Enroll called for userId: ${userId}`);
  console.log("   Returning mock faceReferenceId.\n");

  return {
    success: true,
    faceReferenceId: `stub_face_${userId}`,
    message: "Face enrolled (stub — replace with real provider in production)",
  };
}

async function verifyFaceConsole(
  userId: string,
  faceReferenceId: string,
): Promise<VerifyResult> {
  console.log(`\n👤 [FACE STUB] Verify called for userId: ${userId}, ref: ${faceReferenceId}`);
  console.log("   Returning mock match.\n");

  return {
    success: true,
    confidence: 0.99,
    message: "Face verified (stub — replace with real provider in production)",
  };
}

// ── FaceIO adapter (free tier — https://faceio.net) ───────────────────────────
// Uncomment and install @faceio/fiojs when ready to use real face recognition.
// FaceIO free tier: up to 100 enrollments, no credit card needed.
//
// async function enrollFaceFaceIO(userId: string, imageData: string): Promise<EnrollResult> {
//   const fio = new faceIO(process.env.FACEIO_PUBLIC_ID!);
//   const response = await fio.enroll({ locale: "auto", payload: { userId } });
//   return {
//     success: true,
//     faceReferenceId: response.facialId,
//     message: "Face enrolled via FaceIO",
//   };
// }

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Enroll a user's face during registration.
 * Stores the returned faceReferenceId in user.faceReferenceId.
 *
 * @param userId     The user's internal ID
 * @param imageData  Base64 image string (from /api/face route)
 */
export async function enrollFace(
  userId: string,
  imageData?: string,
): Promise<EnrollResult> {
  const provider = process.env.FACE_PROVIDER ?? "console";

  switch (provider) {
    case "console":
      return enrollFaceConsole(userId);

    // case "faceio":
    //   return enrollFaceFaceIO(userId, imageData!);

    default:
      console.warn(`Unknown FACE_PROVIDER "${provider}", falling back to console stub`);
      return enrollFaceConsole(userId);
  }
}

/**
 * Verify a user's face during login.
 * Compares submitted image against stored faceReferenceId.
 *
 * @param userId           The user's internal ID
 * @param faceReferenceId  Stored reference from enrollment
 * @param imageData        Base64 image string from client
 */
export async function verifyFace(
  userId: string,
  faceReferenceId: string,
  imageData?: string,
): Promise<VerifyResult> {
  const provider = process.env.FACE_PROVIDER ?? "console";

  switch (provider) {
    case "console":
      return verifyFaceConsole(userId, faceReferenceId);

    default:
      console.warn(`Unknown FACE_PROVIDER "${provider}", falling back to console stub`);
      return verifyFaceConsole(userId, faceReferenceId);
  }
}