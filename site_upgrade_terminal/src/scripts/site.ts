import { initGlitchText } from "./effects/glitch-text";
import { initMatrixRain } from "./effects/matrix-rain";
import { initMotionController } from "./effects/motion-controller";
import { initTerminalTyping } from "./effects/terminal-typing";
import { initBootSequences } from "./widgets/boot-sequence";
import { initFaqSearch } from "./widgets/faq-search";
import { initJoinForm } from "./widgets/join-form";
import { initServerStatus } from "./widgets/server-status";

export function initSite() {
  initMotionController();
  initMatrixRain();
  initGlitchText();
  initTerminalTyping();
  initBootSequences();
  initServerStatus();
  initJoinForm();
  initFaqSearch();
}
