export async function fetchStats(githubUsername, codewarsUsername) {
  try {
    // GitHub Stats
    const githubResponse = await fetch(`https://api.github.com/users/${githubUsername}`);
    if (!githubResponse.ok) {
      console.warn("⚠️  Error fetching GitHub data, using fallback");
      return {
        github: "GitHub stats not available",
        codewars: "Codewars stats not available"
      };
    }
    
    const githubData = await githubResponse.json();
    const githubStats = `📊 **GitHub Stats:**\n- Repos: ${githubData.public_repos}\n- Followers: ${githubData.followers}\n- Following: ${githubData.following}`;

    // Codewars Stats con mejor manejo de errores
    let codewarsStats = "Codewars stats not available";
    try {
      const codewarsResponse = await fetch(`https://www.codewars.com/api/v1/users/${codewarsUsername}`);
      if (codewarsResponse.ok) {
        const codewarsData = await codewarsResponse.json();
        codewarsStats = `⚔️ **Codewars:**\n- Rank: ${codewarsData.ranks?.overall?.name || 'N/A'}\n- Honor: ${codewarsData.honor || 0}\n- Completed Kata: ${codewarsData.codeChallenges?.totalCompleted || 0}`;
      }
    } catch (codewarsError) {
      console.warn("⚠️  Error fetching Codewars data:", codewarsError.message);
    }

    return {
      github: githubStats,
      codewars: codewarsStats
    };
    
  } catch (error) {
    console.error("❌ Error fetching stats:", error.message);
    return {
      github: "GitHub stats not available",
      codewars: "Codewars stats not available"
    };
  }
}