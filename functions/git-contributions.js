const { getStore, connectLambda } = require('@netlify/blobs');

exports.handler = async (event, context) => {
    const storeName = 'git-contribution-data';

    connectLambda(event);
    const store = getStore( storeName, { siteID: 'eca3c870-a786-41b5-b767-e15b52d7bac3' } );

    try {
        const { blobs } = await store.list();
        const jsonObjects = [];

        for (const blob of blobs) {
            const data = await store.get(blob.key, { type: 'json' } );
            jsonObjects.push( { key: blob.key, data } );
        }

        const contributions = jsonObjects.map((obj) => ({
            year: obj.key,
            total_contributions:
            obj.data?.data?.user?.contributionsCollection?.contributionCalendar
                ?.totalContributions,
            weeks:
            obj.data?.data?.user?.contributionsCollection?.contributionCalendar
                ?.weeks,
        }));

        return {
            body: JSON.stringify(contributions),
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
        };

    } catch(err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: {
                    code: "BLOB_STORE_READ_ERROR",
                    message: `Error reading blob store.`,
                    details: err,
                },
            }),
        };

    }
};
