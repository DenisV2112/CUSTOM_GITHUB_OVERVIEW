import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initI18n } from "./i18n/i18n.js";
import { fetchStats } from "./utils/fetchStats.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ NUEVO: Manejar parámetros de línea de comandos
const args = process.argv.slice(2);
const langFromArgs = args[0]; // Primer argumento: 'en' o 'es'

// Cargar configuración
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Función para normalizar el idioma
function normalizeLang(lang) {
  const localeMap = {
    'en_US.UTF-8': 'en',
    'es_ES.UTF-8': 'es'
  };
  return localeMap[lang] || lang || 'es';
}

// ✅ NUEVO: Prioridad: argumento > variable entorno > config
const rawLang = langFromArgs || process.env.LANG || config.lang;
const lang = normalizeLang(rawLang);

console.log("Selected language:", lang);

// El resto del código se mantiene igual...
// Inicializar i18n
const t = await initI18n(lang);

// Cargar plantilla
const templatePath = path.join(__dirname, "templates", "template.md");
const template = fs.readFileSync(templatePath, "utf8");

// Obtener estadísticas dinámicas
const stats = await fetchStats(config.githubUsername, config.codewarsUsername);

// Generar selector de idioma
function generateLanguageSelector(currentLang) {
  const languages = {
    'en': { flag: '🇺🇸', name: 'English', param: 'en' },
    'es': { flag: '🇪🇸', name: 'Español', param: 'es' }
  };

  let selector = `## ${t('language_selector')}\n\n`;
  
  Object.entries(languages).forEach(([code, info]) => {
    if (code !== currentLang) {
      selector += `[${info.flag} ${t(code === 'en' ? 'switch_to_english' : 'switch_to_spanish')}](https://github.com/${config.githubUsername}/${config.githubUsername}?locale=${code}) | `;
    }
  });
  
  // Remover el último separador
  selector = selector.slice(0, -3);
  
  return selector;
}

// Reemplazar variables dentro del template
const readme = template
  .replace(/{{name}}/g, t("name"))
  .replace(/{{description}}/g, t("description"))
  .replace(/{{language_selector}}/g, t("language_selector"))
  .replace(/{{current_language}}/g, t("current_language"))
  .replace(/{{switch_to_english}}/g, t("switch_to_english"))
  .replace(/{{switch_to_spanish}}/g, t("switch_to_spanish"))
  .replace(/{{stats}}/g, t("stats"))
  .replace(/{{githubStats}}/g, stats.github)
  .replace(/{{codewarsStats}}/g, stats.codewars)
  .replace(/{{generated_message}}/g, t("generated_message"));
// Sobrescribir el README.md principal
fs.writeFileSync(path.join(__dirname, "..", "README.md"), readme, "utf8");

console.log(`✅ README actualizado en idioma: ${lang.toUpperCase()}`);