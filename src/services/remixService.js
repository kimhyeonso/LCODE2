import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { firebaseApp } from "../firebase/config";

let client;
export async function requestRemix(input) {
  if (!firebaseApp) throw new Error("Firebase 설정을 확인해 주세요.");
  if (!client) {
    client = getFunctions(firebaseApp, "asia-northeast3");
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === "true") {
      connectFunctionsEmulator(client, "127.0.0.1", 5001);
    }
  }
  const response = await httpsCallable(client, "remixPlan", { timeout: 65000 })(input);
  return response.data;
}
