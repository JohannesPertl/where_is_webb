const functions = require("firebase-functions");
const admin = require("firebase-admin");
const dayjs = require('dayjs');
const puppeteer = require('puppeteer');
dayjs().format();
admin.initializeApp();

const puppeteerOptions = {
    args: ['--no-sandbox'],
    headless: true,
    timeout: 0
};

const userAgent = 'Mozilla/5.0 (Windows NT 10.0;Win64) AppleWebkit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';

async function getCurrentDeploymentStep() {
    try {
        functions.logger.log("Getting current deployment step");
        const stepsCollection = admin.firestore().collection('steps');
        const snapshot = await stepsCollection.orderBy(admin.firestore.FieldPath.documentId(), 'desc').limit(1).get();
        const latestStep = snapshot.docs[0];  // get the first document in the snapshot
        return parseInt(latestStep.id);
    } catch (error) {
        functions.logger.error("Error getting current deployment step", error);
        throw error;
    }
}

async function sendCustomNotification(title, body, topic) {
    // Note: Old versions of the app only use new_deployment_step topic, so that topic should be used
    try {
        functions.logger.log("Sending custom notification");
        await admin.messaging().sendToTopic(topic, {
            notification: {
                title: title,
                body: body,
                sound: "default"
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK"
            },
        });
    } catch (error) {
        functions.logger.error("Error sending custom notification", error);
        throw error;
    }
}

exports.getCurrentDeploymentStepIndex = functions.https.onCall(async (data, context) => {
    try {
        return await getCurrentDeploymentStep();
    } catch (error) {
        functions.logger.error("Error in getCurrentDeploymentStepIndex", error);
        throw new functions.https.HttpsError('internal', 'Internal error occurred');
    }
});

exports.getAllDeploymentSteps = functions.https.onCall(async (data, context) => {
    try {
        functions.logger.log("Getting all deployment steps");
        const allSteps = await admin.firestore().collection('steps').orderBy("index", 'asc').get();

        const stepsJson = [];
        allSteps.forEach(step => {
            stepsJson.push(step.data());
        });

        return stepsJson;
    } catch (error) {
        functions.logger.error("Error in getAllDeploymentSteps", error);
        throw new functions.https.HttpsError('internal', 'Internal error occurred');
    }
});

exports.scrapeLatestNews = functions.runWith({memory: "1GB"}).pubsub.schedule('every 2 hours').onRun(async (context) => {
    try {
        functions.logger.log("Scraping latest news");
        await scrapeLatestNews();
    } catch (error) {
        functions.logger.error("Error in scrapeLatestNews", error);
    }
});

// TODO: Implement
// exports.importAllNews = functions.runWith({memory: "1GB"}).pubsub.schedule('every 5 minutes').onRun(async (context) => {
//     try {
//         functions.logger.log("Importing all news");
//         await importAllNews();
//     } catch (error) {
//         functions.logger.error("Error in importAllNews", error);
//     }
// });

async function importAllNews() {
    let browser;
    try {
        browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.setUserAgent(userAgent);

        const url = 'https://webbtelescope.org/news/news-releases?itemsPerPage=50&page=1';
        await page.goto(url);
        const newsDivs = await page.$$('div.news-listing');
        const newsDivsToImport = newsDivs.slice(0, newsDivs.length - 6).reverse();  // Reverse the array
        let index = 47;

        let latestIndex = newsDivsToImport.length + index;
        
        for (const div of newsDivsToImport) {
            const h4 = await div.$('h4');
            const a = await h4.$('a');

            const title = await a.evaluate(node => node.textContent);
            const link = await a.evaluate(node => node.href);
            const releaseDate = await div.$eval('span.news-release-date', node => node.textContent);
            const img = await div.$eval('img', node => node.src);

            // summary needs to be extracted by going to the link
            const summaryPage = await browser.newPage();
            await summaryPage.setUserAgent(userAgent);

            await summaryPage.goto(link);
            const summaryElement = await summaryPage.waitForSelector('div.news-abstract');
            let summary = await summaryPage.evaluate(node => node.textContent, summaryElement);
            summary = summary.replace("Summary", "").trim();
            summary = summary.replace(/\s{3,}/g, "\n\n\n");

            await summaryPage.close();

            await admin.firestore().collection('steps').doc(`${index}`).set({
                name: title,
                oneLiner: releaseDate,
                status: releaseDate,
                description: summary,
                image_url: img,
                image_url2: img,
                info_url: link,
                custom_link: link,
                custom_link_text: "Full article",
                index: index,
                current_index: latestIndex,
                video_url: "",
                youtube_url: ""
            });

            console.log("Title: ", title);
            console.log("Link: ", link);
            console.log("Release date: ", releaseDate);
            console.log("Summary: ", summary);
            console.log("Image: ", img);
            console.log("=====================================");
            index++;
        }


    } catch (error) {
        console.error(error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function scrapeLatestNews() {
    let browser;
    try {
        browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.setUserAgent(userAgent);

        const url = 'https://webbtelescope.org';
        await page.goto(url);

        const parentSection = await page.waitForSelector('section[data-name="section-latest-news"]');
        const titleElement = await parentSection.$('h3[class="content-prev__head"]');
        const rawTitle = await titleElement.evaluate(node => node.textContent);
        const title = rawTitle.trim();
        functions.logger.log("Latest news title: ", title);

        const dateElement = await parentSection.$('div.preheader__item');
        const date = await dateElement.evaluate(node => node.textContent);
        console.log("Latest news date: ", date);

        const readMoreDiv = await parentSection.$('div[data-module-dynamic="card"]');
        await readMoreDiv.click();
        await page.waitForTimeout(3000);

        const link = await page.url();
        functions.logger.log("Latest news link: ", link);

        const imageElement = await page.$('img.embedded-img__component');
        const img = await page.evaluate((img) => img.src, imageElement);

        functions.logger.log("Latest news image: ", img);

        await page.goto(link);
        const summaryElement = await page.waitForSelector('div.news-abstract');
        const rawSummary = await summaryElement.evaluate(node => node.textContent);
        let summary = rawSummary.replace("Summary", "").trim();
        summary = summary.replace(/\s{3,}/g, "\n\n\n");
        functions.logger.log("Latest news summary: ", summary);

        const latestNewsDoc = admin.firestore().collection('steps').doc('47');

        const snapshot = await latestNewsDoc.get();
        if (snapshot.exists) {
            const data = snapshot.data();
            if (data['name'] !== title) {
                functions.logger.log("New latest news found, sending notification");
                await sendCustomNotification("New JWST News", title, "new_deployment_step");
            }
            await admin.firestore().collection('steps').doc("47").update({
                name: title,
                oneliner: date,
                status: date,
                image_url: img,
                image_url2: img,
                description: summary,
                info_url: link,
                custom_link: link,
                custom_link_text: "Full article"
            });
        }
    } catch (error) {
        functions.logger.error("Error in scrapeLatestNews", error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

