import { Lock, Mail, User } from "lucide-react";
import { onboardingTexts as T } from "../../texts/onboardingTexts";
import IconInput from "./IconInput";
import StepLabel from "./StepLabel";

interface LeaderAccessFieldsProps {
  name: string;
  email: string;
  password: string;
  onName: (value: string) => void;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
}

/** Schritt 3: Zugang des Teamleiters, wird sofort freigeschaltet. */
export default function LeaderAccessFields(props: LeaderAccessFieldsProps) {
  return (
    <div className="space-y-3">
      <StepLabel step={3} label={T.stepAccess} htmlFor="leader-name" />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <IconInput id="leader-name" Icon={User} value={props.name} onChange={props.onName} placeholder={T.namePlaceholder} label={T.namePlaceholder} autoComplete="name" />
        <IconInput
          id="leader-email"
          Icon={Mail}
          type="email"
          value={props.email}
          onChange={props.onEmail}
          placeholder={T.emailPlaceholder}
          label={T.emailPlaceholder}
          autoComplete="email"
        />
        <div className="sm:col-span-2">
          <IconInput
            id="leader-password"
            Icon={Lock}
            type="password"
            value={props.password}
            onChange={props.onPassword}
            placeholder={T.passwordPlaceholder}
            label={T.passwordPlaceholder}
            autoComplete="new-password"
          />
        </div>
      </div>
    </div>
  );
}
