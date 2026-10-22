import { connection } from "next/server";
import { Suspense } from "react";

async function Connection() {
  await connection();
  return null;
}

/**
 * Markiert die Seiten als "pro Anfrage gerendert". Nötig, weil generateMetadata() Cookie und
 * Accept-Language liest (Sprache der Meta-Tags), der Rest aber im Browser entsteht.
 * Siehe https://nextjs.org/docs/messages/blocking-prerender-metadata-runtime
 */
export default function RequestTimeMarker() {
  return (
    <Suspense>
      <Connection />
    </Suspense>
  );
}
