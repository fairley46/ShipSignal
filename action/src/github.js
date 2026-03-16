export async function fetchPRDescription(prNumber, repository, token) {
  if (!prNumber || !repository || !token) {
    return 'No pull request description available.';
  }

  try {
    const url = `https://api.github.com/repos/${repository}/pulls/${prNumber}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!res.ok) {
      console.warn(`GitHub PR fetch failed: ${res.status}`);
      return 'Pull request description unavailable.';
    }

    const data = await res.json();
    return data.body || 'No description provided.';
  } catch (err) {
    console.warn('GitHub PR fetch error:', err.message);
    return 'Pull request description unavailable.';
  }
}
