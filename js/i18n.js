
import { messages, messagesUk } from "./messages.uk.js";

export function t(key) {
  return messages[key] ?? messagesUk[key] ?? key;
}
