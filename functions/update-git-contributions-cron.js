const { getStore } = require('@netlify/blobs');

export default async (req) => {
    const url = new URL(req.url);
    const getYear = url.searchParams.get('year');

    let query = `
        query($userName: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $userName) {
                contributionsCollection(from: $from, to: $to) {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                            }
                        }
                    }
                }
            }
        }
    `

    let thisYear = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})).getFullYear();
    let fromYear = `${thisYear}-01-01T00:00:00Z`;
    let now = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})).toISOString();
    if (getYear && /^20\d\d$/.test(getYear)) {
        thisYear = getYear;
        fromYear = `${getYear}-01-01T00:00:00Z`;
        now = `${getYear}-12-31T23:59:59Z`;
    }

    let variables = {
        userName: "elliottprogrammer",
        from: `${fromYear}`,
        to: `${now}`,
    }

    try {
        const response = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GITHUB_PAT}`,
                "User-Agent": "elliottprogrammer"
            },
            body: JSON.stringify({
                query: query,
                variables: variables,
            }),
        });

        const data = await response.json();
        const store = getStore({ name: 'git-contribution-data' });
        await store.setJSON(`${thisYear}`, data);

        console.log(`JSON data saved to blob store git-contribution-data with key ${thisYear}`);

    } catch (err) {
        console.log(`There was an error fetching or writing blob: contributions-${thisYear}`, err);
    }
}
