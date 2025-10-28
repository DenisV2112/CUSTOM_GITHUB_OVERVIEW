export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    username = 'DenisV2103',
    theme = 'dark',
    hide_border = 'false', 
    text_color = 'ffffff',
    title_color = 'ff3068',
    bg_color = '0d1117'
  } = req.query;

  try {
    // Obtener datos de CodeWars API
    const response = await fetch(`https://www.codewars.com/api/v1/users/${username}`);
    
    if (!response.ok) {
      throw new Error('Usuario no encontrado');
    }
    
    const data = await response.json();
    
    // Generar SVG
    const svg = generateStatsSVG(data, {
      theme,
      hide_border: hide_border === 'true',
      text_color,
      title_color,
      bg_color: theme === 'dark' ? '0d1117' : bg_color
    });
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache de 1 hora
    res.status(200).send(svg);
    
  } catch (error) {
    console.error('Error:', error);
    const errorSVG = generateErrorSVG(username, error.message);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(500).send(errorSVG);
  }
}

function generateStatsSVG(data, options) {
  const { hide_border, text_color, title_color, bg_color } = options;
  
  const border = hide_border ? '' : 'stroke="#9c9a9aff" stroke-width="1"';
  const width = 400;
  const height = 170;
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" ${border}>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#${title_color}" />
      <stop offset="100%" stop-color="#ff6b9d" />
    </linearGradient>
  </defs>
  
  <rect width="100%" height="100%" fill="#${bg_color}" rx="10"/>
  
  <style>
    .title { 
      font: bold 20px 'Segoe UI', Arial, sans-serif; 
      fill: url(#gradient);
    }
    .text { 
      font: 14px 'Segoe UI', Arial, sans-serif; 
      fill: #${text_color}; 
    }
    .stat { 
      font: bold 16px 'Segoe UI', Arial, sans-serif; 
      fill: #${text_color};
    }
    .rank { 
      font: bold 18px 'Segoe UI', Arial, sans-serif; 
      fill: ${getRankColor(data.ranks.overall.name)};
    }
  </style>
  
  <!-- Título -->
  <text x="20" y="35" class="title">${data.username} - CodeWars</text>
  
  <!-- Stats -->
  <text x="20" y="65" class="rank">${data.ranks.overall.name}</text>
  <text x="20" y="95" class="stat">Honor: ${data.honor} pts</text>
  <text x="20" y="120" class="stat">Katas: ${data.codeChallenges.totalCompleted}</text>
  <text x="20" y="145" class="text">Languages: ${getTopLanguages(data.ranks.languages)}</text>
  
  <!-- Rank badge --><!-- Rank badge mejorado -->
<g transform="translate(350, 60)">
  <text 
    x="0" 
    y="10" 
    text-anchor="middle" 
    font-size="36" 
    opacity="0.5">
    🔥
  </text>

  <!-- Círculo con color dinámico -->
  <circle 
    cx="0" 
    cy="0" 
    r="35" 
    fill="${getRankColor(data.ranks.overall.name)}" 
    opacity="0.25"/>

  <!-- Número o texto del rank -->
  <text 
    x="0" 
    y="10" 
    text-anchor="middle" 
    class="rank" 
    font-size="22" 
    font-weight="bold" 
    fill="#fff">
    ${getRankNumber(data.ranks.overall.name)}
  </text>
</g>

</svg>
  `;
}

function getRankColor(rankName) {
  const colors = {
    '1 kyu': '#FF0000',
    '2 kyu': '#FF4500', 
    '3 kyu': '#FF6347',
    '4 kyu': '#FF3068',
    '5 kyu': '#FFFF00',
    '6 kyu': '#ADFF2F',
    '7 kyu': '#00FF00',
    '8 kyu': '#87CEEB'
  };
  return colors[rankName] || '#FF3068';
}

function getRankNumber(rankName) {
  return rankName.split(' ')[0];
}

function getTopLanguages(languages, limit = 3) {
  if (!languages) return 'N/A';
  
  // Ordenar por rank score (mayor a menor)
  const sortedLanguages = Object.entries(languages)
    .sort(([,a], [,b]) => b.score - a.score)
    .slice(0, limit)
    .map(([lang]) => lang);
  
  return sortedLanguages.join(', ');
}

function generateErrorSVG(username, error) {
  return `
<svg width="400" height="120" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0d1117" rx="10"/>
  <text x="200" y="45" text-anchor="middle" font-family="Arial" font-size="16" fill="#ff3068">Error</text>
  <text x="200" y="70" text-anchor="middle" font-family="Arial" font-size="12" fill="#ffffff">${username}</text>
  <text x="200" y="90" text-anchor="middle" font-family="Arial" font-size="10" fill="#cccccc">${error}</text>
</svg>
  `;
}



