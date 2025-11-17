import { logout } from "../auth";
import { navigateTo } from "../router";

export function DashboardView(): string {
  return (document.getElementById("dashboardhtml") as HTMLTemplateElement).innerHTML;
}
