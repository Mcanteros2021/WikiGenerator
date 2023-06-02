import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
dotenv.config();

async function createHeadline(keyword, openAi) {
    try {
        const response = await openAi.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Act as Copywriter and SEO Expert. Write me 1 Headline for a Wiki Article for the keyword: ${keyword}
          Write just the Headline, nothing else.`
            }],
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function createSubheadlines(headline, openAi) {
    try {
        const response = await openAi.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Act as Copywriter and SEO Expert. Write me 5 Subheadlines for the Wiki Article: ${headline}
          List subheadlines with ID
          Write just the Headline, nothing else.`
            }],
        });

        return response.data.choices[0].message.content.split('\n');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function createContent(subheadline, openAi) {
    try {
        const response = await openAi.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Act as a Copywriter and SEO Expert. Write me 2 paragraphs of content for the subheadline: ${subheadline}
          Write just the content, nothing else.`
            }],
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function main(keyword) {
    const openAi1 = new OpenAIApi(
        new Configuration({
            organization: 'org-6ywHEAoJY45O4p9BVf2K5hsF',
            apiKey: process.env.OPENAI_API_KEY,
        })
    );

    const openAi2 = new OpenAIApi(
        new Configuration({
            organization: 'org-6ywHEAoJY45O4p9BVf2K5hsF',
            apiKey: process.env.OPENAI_API_KEY2,
        })
    );

    const openAi3 = new OpenAIApi(
        new Configuration({
            organization: 'org-6ywHEAoJY45O4p9BVf2K5hsF',
            apiKey: process.env.OPENAI_API_KEY3,
        })
    );

    // Get headline and subheadlines from OpenAI with first key
    const headline = await createHeadline(keyword, openAi1);
    const subheadlines = await createSubheadlines(headline, openAi1);

    // Get contents for each subheadline
    const contents = [];
    for (let i = 0; i < subheadlines.length; i++) {
        await delay(61000); // Wait 61 seconds
        if (i < 1) {
            const content = await createContent(subheadlines[i], openAi1);
            contents.push(content);
        } else if (i < 3) {
            const content = await createContent(subheadlines[i], openAi2);
            contents.push(content);
        } else {
            const content = await createContent(subheadlines[i], openAi3);
            contents.push(content);
        }
    }

    // Create and return the JSON object
    return {
        title: headline,
        subheadlines: subheadlines,
        contents: contents
    };
}
export default main;



