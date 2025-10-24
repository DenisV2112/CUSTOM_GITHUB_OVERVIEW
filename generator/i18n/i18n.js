import i18next from "i18next";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initI18n(lang = "es") {
     console.log("Language received:", lang); // ← Agrega esta línea
  const translationsPath = path.join(__dirname, "locales", lang, "translation.json");
  const translations = JSON.parse(fs.readFileSync(translationsPath, "utf8"));
 console.log("Looking for file:", translationsPath); // ← Y esta línea
 console.log("Looking for file:",translations)
  await i18next.init({
    lng: lang,
    fallbackLng: "es",
    resources: {
      [lang]: { translation: translations }
    }
  });

  return i18next.t.bind(i18next);
}
