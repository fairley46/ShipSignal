export interface PRMetadata {
  title: string;
  description: string;
  author: string;
}

export async function fetchPRMetadata(
  workspace: string,
  repoSlug: string,
  prId: string | undefined
): Promise<PRMetadata | null> {
  const token = process.env.BITBUCKET_ACCESS_TOKEN;
  if (!token || !prId || !workspace || !repoSlug) return null;

  try {
    const res = await fetch(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/pullrequests/${prId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;

    const pr = await res.json() as {
      title: string;
      description: { raw: string };
      author: { display_name: string };
    };

    return {
      title: pr.title,
      description: pr.description?.raw ?? '',
      author: pr.author?.display_name ?? '',
    };
  } catch {
    return null;
  }
}
