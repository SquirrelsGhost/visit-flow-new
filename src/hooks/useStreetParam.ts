import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { STREET_PARAMS, streetRefFromParams, type StreetRef } from "../lib/streets/streetLinks";

/**
 * Straße aus der Adresse (?strasse=…&plz=…&ort=…), mit der Straßenliste und CRM aufeinander verlinken.
 * `clear` nimmt sie aus der Adresse, damit Neuladen nicht wieder filtert.
 */
export function useStreetParam(): { street: StreetRef | null; clear: () => void } {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const street = useMemo(() => streetRefFromParams(params), [params]);
  const clear = useCallback(() => {
    const next = new URLSearchParams(window.location.search);
    Object.values(STREET_PARAMS).forEach((name) => next.delete(name));
    const rest = next.toString();
    router.replace(rest ? `${pathname}?${rest}` : pathname, { scroll: false });
  }, [pathname, router]);
  return { street, clear };
}
