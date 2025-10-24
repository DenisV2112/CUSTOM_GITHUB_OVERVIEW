export async function fetchStats(githubUsername, codewarsUsername) {
  try {
    // GitHub Stats mejoradas
    const githubResponse = await fetch(`https://api.github.com/users/${githubUsername}`);
    const githubData = await githubResponse.json();
    
    const githubStats = `📊 **GitHub Stats:**\n- Repositorios: ${githubData.public_repos}\n- Seguidores: ${githubData.followers}\n- Siguiendo: ${githubData.following}\n- Estrellas: ${githubData.public_gists}`;

    // Codewars Stats
    let codewarsStats = "⚔️ **Codewars:** No disponible";
    try {
      const codewarsResponse = await fetch(`https://www.codewars.com/api/v1/users/${codewarsUsername}`);
      if (codewarsResponse.ok) {
        const codewarsData = await codewarsResponse.json();
        codewarsStats = `⚔️ **Codewars:**\n- Rango: ${codewarsData.ranks?.overall?.name || 'N/A'}\n- Honor: ${codewarsData.honor || 0}\n- Kata Completados: ${codewarsData.codeChallenges?.totalCompleted || 0}`;
      }
    } catch (error) {
      console.warn("Codewars no disponible");
    }

    return { github: githubStats, codewars: codewarsStats };
  } catch (error) {
    return {
      github: "📊 **GitHub Stats:** No disponibles temporalmente",
      codewars: "⚔️ **Codewars:** No disponibles temporalmente"
    };
  }
}