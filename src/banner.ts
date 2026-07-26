import cfonts from "cfonts";

export function renderBanner() {
  cfonts.say("WAZOO", {
    font: "block",
    align: "left",
    colors: ["#ff8c00", "#ffffff"],
    gradient: ["#ff8c00", "#ff4500"],
    transitionGradient: true,
    letterSpacing: 1,
    space: true,
  });
  console.log("  Neuro-symbolic infrastructure for AI agents");
  console.log("");
}
