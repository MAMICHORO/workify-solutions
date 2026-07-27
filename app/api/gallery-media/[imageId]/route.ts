import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SIGNED_URL_LIFETIME_SECONDS = 60 * 60;
const DELIVERY_CACHE_SECONDS = 5 * 60;

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ imageId: string }>;
  }
) {
  const { imageId } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return NextResponse.json(
      { error: "Gallery delivery is not configured." },
      { status: 503 }
    );
  }

  // Always use an anonymous client so authenticated admin policies can never
  // broaden this public delivery endpoint.
  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: image, error } = await supabase
    .from("gallery_images")
    .select("storage_path")
    .eq("id", imageId)
    .maybeSingle();

  // RLS returns no row unless the parent presentation is published and active.
  if (error || !image) {
    return NextResponse.json(
      { error: "Gallery image not found." },
      {
        status: 404,
        headers: { "Cache-Control": "private, no-store" },
      }
    );
  }

  const { data: signed, error: signedError } =
    await supabase.storage
      .from("gallery-images")
      .createSignedUrl(
        image.storage_path,
        SIGNED_URL_LIFETIME_SECONDS
      );

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json(
      { error: "Gallery image is temporarily unavailable." },
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      }
    );
  }

  return NextResponse.redirect(signed.signedUrl, {
    status: 307,
    headers: {
      "Cache-Control": `public, max-age=${DELIVERY_CACHE_SECONDS}, s-maxage=${DELIVERY_CACHE_SECONDS}, stale-while-revalidate=60`,
    },
  });
}
