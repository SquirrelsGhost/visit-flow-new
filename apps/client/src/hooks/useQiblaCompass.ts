import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { currentPosition } from "../lib/geo/currentPosition";
import { requestOrientationPermission } from "../lib/geo/orientationPermission";
import { cardinalDirection, headingFromOrientation, qiblaDirection } from "../lib/geo/qibla";
import { compassTexts } from "../texts/loginTexts";

const POSITION_ERRORS = {
  denied: compassTexts.gpsRequired,
  unsupported: compassTexts.gpsUnsupported,
  failed: compassTexts.gpsFailed,
} as const;

/**
 * Kompass im Login-Kopf (v1 AuthHeader): Doppelklick schaltet auf die Qibla-Richtung um,
 * die Nadel folgt dann der Ausrichtung des Geräts. Nochmal doppelklicken schaltet zurück.
 */
export function useQiblaCompass() {
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const clicks = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qiblaMode = qiblaBearing !== null;

  useEffect(() => {
    if (!qiblaMode) return;
    const onOrientation = (event: Event) => setDeviceHeading(headingFromOrientation(event as DeviceOrientationEvent));
    let attached = false;
    void requestOrientationPermission().then((granted) => {
      if (!granted) return toast.error(compassTexts.orientationRequired);
      attached = true;
      window.addEventListener("deviceorientationabsolute", onOrientation, true);
      window.addEventListener("deviceorientation", onOrientation, true);
    });
    return () => {
      if (!attached) return;
      window.removeEventListener("deviceorientationabsolute", onOrientation, true);
      window.removeEventListener("deviceorientation", onOrientation, true);
    };
  }, [qiblaMode]);

  const startQibla = useCallback(async () => {
    setIsCalculating(true);
    const position = await currentPosition();
    setIsCalculating(false);
    if (!position.ok) return void toast.error(POSITION_ERRORS[position.reason]);
    const bearing = qiblaDirection(position.latitude, position.longitude);
    setQiblaBearing(bearing);
    toast.success(compassTexts.qibla(bearing, cardinalDirection(bearing), position.accuracy), { duration: 5000 });
  }, []);

  const onCompassClick = useCallback(() => {
    clicks.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => (clicks.current = 0), 500);
    if (clicks.current !== 2) return;
    clicks.current = 0;
    if (qiblaMode) {
      setQiblaBearing(null);
      toast.info(compassTexts.normalMode);
      return;
    }
    void startQibla();
  }, [qiblaMode, startQibla]);

  const needleRotation = qiblaBearing === null ? null : qiblaBearing - deviceHeading;
  return { qiblaMode, isCalculating, needleRotation, onCompassClick };
}
