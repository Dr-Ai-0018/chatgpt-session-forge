import { useForge } from "../store";
import { useI18n } from "../lib/i18n";
import { pad2 } from "../lib/ui";
import { AccountsList } from "./AccountsList";

/** Desktop right rail: header + shared list + hint. */
export function AccountsRail() {
  const { t } = useI18n();
  const accounts = useForge((s) => s.accounts);

  return (
    <>
      <div className="sf-hd">
        <span className="sf-hd-title">
          <span className="acc">◈</span>
          {t("stAccounts")}
        </span>
        <span className="sf-meta">{pad2(accounts.length)}</span>
      </div>

      <AccountsList />

      {accounts.length > 0 && (
        <div style={{ flex: "0 0 auto", padding: "7px 12px", borderTop: "1px solid var(--color-b2)", fontSize: 10, letterSpacing: ".06em", color: "var(--color-faint)", textAlign: "center" }}>
          {t("detailHint")}
        </div>
      )}
    </>
  );
}
