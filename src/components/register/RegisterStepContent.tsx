import type { useRegisterFlow } from "../../hooks/useRegisterFlow";
import StepCode from "./StepCode";
import StepCompanyEmail from "./StepCompanyEmail";
import StepData from "./StepData";
import StepPassword from "./StepPassword";
import StepTeam from "./StepTeam";

interface RegisterStepContentProps {
  flow: ReturnType<typeof useRegisterFlow>;
}

/** Zeigt die Felder des aktuellen Schritts. */
export default function RegisterStepContent({ flow }: RegisterStepContentProps) {
  const { state, update, password, setPassword, confirmPassword, setConfirmPassword } = flow.form;
  switch (state.step) {
    case "data":
      return <StepData name={state.name} email={state.email} onName={(value) => update("name", value)} onEmail={(value) => update("email", value)} />;
    case "team":
      return (
        <StepTeam
          teams={flow.teams}
          teamId={state.selectedTeamId}
          onTeam={(id) => {
            update("selectedTeamId", id);
            const name = flow.teams.find((team) => team.id === id)?.name.toLowerCase() ?? "";
            if (!name.includes("vodafone")) update("vpkn", "");
          }}
          isVodafoneTeam={flow.isVodafoneTeam}
          vpkn={state.vpkn}
          onVpkn={(value) => update("vpkn", value)}
          contractStart={state.contractStart}
          onContractStart={(value) => update("contractStart", value)}
        />
      );
    case "code":
      return <StepCode variant="primary" email={state.email} value={state.verificationCode} onChange={(value) => update("verificationCode", value)} />;
    case "companyEmail":
      return <StepCompanyEmail value={state.secondaryEmail} onChange={(value) => update("secondaryEmail", value)} />;
    case "companyCode":
      return (
        <StepCode
          variant="company"
          email={state.secondaryEmail}
          value={state.secondaryVerificationCode}
          onChange={(value) => update("secondaryVerificationCode", value)}
        />
      );
    case "password":
      return <StepPassword password={password} confirm={confirmPassword} onPassword={setPassword} onConfirm={setConfirmPassword} check={flow.passwordCheck} />;
  }
}
