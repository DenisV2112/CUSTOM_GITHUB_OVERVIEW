import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initI18n } from "./i18n/i18n.js";
import { fetchStats } from "./utils/fetchStats.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const now = new Date().toLocaleDateString();

// ✅ Manejar parámetros de línea de comandos
const args = process.argv.slice(2);
const langFromArgs = args[0]; // Primer argumento: 'en' o 'es'

// Cargar configuración
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Función para normalizar el idioma
function normalizeLang(lang) {
  const localeMap = {
    'en_US.UTF-8': 'en',
    'es_ES.UTF-8': 'es',
    'en': 'en',
    'es': 'es'
  };
  return localeMap[lang] || lang || 'es';
}

// ✅ Prioridad: argumento > variable entorno > config
const rawLang = langFromArgs || process.env.LANG || config.lang;
const lang = normalizeLang(rawLang);

console.log("Selected language:", lang);

// Inicializar i18n
const t = await initI18n(lang);

// Cargar plantilla
const templatePath = path.join(__dirname, "templates", "template.md");
let template = fs.readFileSync(templatePath, "utf8");

// Obtener estadísticas dinámicas
const stats = await fetchStats(config.githubUsername, config.codewarsUsername);

// ✅ NUEVO: Función para reemplazar TODAS las variables dinámicamente
function replaceTemplateVariables(template, translations, dynamicData = {}) {
  let result = template;
  
  // Reemplazar variables de traducción {{key}}
  Object.keys(translations).forEach(key => {
    const value = translations[key];
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  
  // Reemplazar variables dinámicas {{dynamic_key}}
  Object.keys(dynamicData).forEach(key => {
    const value = dynamicData[key];
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

// ✅ NUEVO: Función para generar el header con selector de idioma
function generateLanguageHeader(currentLang, githubUsername) {
  const languages = {
    'en': { flag: '🇺🇸', name: 'English' },
    'es': { flag: '🇪🇸', name: 'Español' }
  };

  const currentLangInfo = languages[currentLang];
  const otherLang = currentLang === 'en' ? 'es' : 'en';
  const otherLangInfo = languages[otherLang];

  return `
<table width="100%">
  <tr>
    <td width="50%" align="left">
      <a href="https://github.com/${githubUsername}/${githubUsername}?locale=${otherLang}" alt="Change language">
        <img width="22px" src="https://img.icons8.com/color/48/000000/globe.png" style="vertical-align: middle;"/>
        <span style="vertical-align: middle;"><b>${currentLangInfo.name}</b></span>
      </a>
      <br/>
      <sub><i>${t('click_to_change_language')}</i></sub>
    </td>
    <td width="50%" align="right">
      <sub><i>${t('dynamic_update')}</i></sub>
    </td>
  </tr>
</table>
  `.trim();
}

// ✅ NUEVO: Datos dinámicos adicionales
const dynamicData = {
  current_time: now,
  githubStats: stats.github,
  codewarsStats: stats.codewars,
  last_updated_value: now,
  github_username: config.githubUsername,
  codewars_username: config.codewarsUsername
};

// ✅ NUEVO: Generar y reemplazar el header de idiomas
const languageHeader = generateLanguageHeader(lang, config.githubUsername);
template = template.replace('{{language_header}}', languageHeader);

// ✅ NUEVO: Reemplazar TODAS las variables automáticamente
const readme = replaceTemplateVariables(template, t, dynamicData);

// Sobrescribir el README.md principal
fs.writeFileSync(path.join(__dirname, "..", "README.md"), readme, "utf8");

console.log(`✅ README actualizado en idioma: ${lang.toUpperCase()}`);
console.log(`📊 Stats obtenidos: GitHub(${config.githubUsername}), CodeWars(${config.codewarsUsername})`);