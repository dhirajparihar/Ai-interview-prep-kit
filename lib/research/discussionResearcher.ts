export interface PublicDiscussionResult {
  snippets: string[];
  sources: string[];
}

export class DiscussionResearcher {
  private tavilyApiKey: string;

  constructor() {
    this.tavilyApiKey = process.env.TAVILY_API_KEY || "";
  }

  public async searchInterviewDiscussions(
    companyName: string,
    roleTitle: string
  ): Promise<PublicDiscussionResult> {
    const query = `${companyName} ${roleTitle} interview process questions glassdoor reddit blind`;

    if (this.tavilyApiKey) {
      try {
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: this.tavilyApiKey,
            query,
            search_depth: "basic",
            max_results: 5,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const results = data.results || [];
          const snippets = results.map(
            (r: { title?: string; content?: string }) =>
              `${r.title || ""}: ${r.content || ""}`.trim()
          );
          const sources = results.map((r: { url?: string }) => r.url).filter(Boolean);

          return { snippets, sources };
        }
      } catch {
        // Fall back gracefully if Tavily fetch fails
      }
    }

    // Return empty result gracefully if search yields no results or API key is absent
    return {
      snippets: [
        `Limited public discussion found for ${companyName} ${roleTitle} interview process. Standard domain technical and behavioral questions apply.`,
      ],
      sources: [],
    };
  }
}
