const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require('axios');
const dayjs = require('dayjs');
const puppeteer = require('puppeteer');
const validUrl = require("valid-url");
dayjs().format()
admin.initializeApp();

const whereIsWebbURL = 'https://www.jwst.nasa.gov/content/webbLaunch/whereIsWebb.html';
const stepExplorerURL = "https://www.jwst.nasa.gov/content/webbLaunch/deploymentExplorer.html";
const puppeteerOptions = {
    args: ['--no-sandbox'],
    headless: true,
    timeout: 0
};


async function getCurrentDeploymentStep() {
    const newDeploymentStepUrl = 'https://www.jwst.nasa.gov/content/webbLaunch/flightCurrentState2.0.json'
    const response = await axios.get(newDeploymentStepUrl)
    let currentIndex = response.data['currentState']['currentDeployTableIndex']

    const manualDeploymentStepRef = admin.firestore().collection('manualDeploymentStep')
    const manualDeploymentStepDoc = manualDeploymentStepRef.doc('manualDeploymentStep')
    const snapshot = await manualDeploymentStepDoc.get()
    if (snapshot.exists) {
        functions.logger.log("Using manual deployment step");
        currentIndex = snapshot.data()["index"];
    }

    return currentIndex;
}

async function sendNotification(newDeploymentStep) {
    // Send notification to all users
    const newStepDoc = admin.firestore().collection('steps').doc(newDeploymentStep.toString()).get();
    const step = (await newStepDoc).data()
    const messageResponse = await admin.messaging().sendToTopic("new_deployment_step", {
        notification: {
            title: step['name'],
            body: "James Webb Space Telescope has reached a new step!",
            sound: "default"
        },
        data: {
            step: newDeploymentStep.toString(),
            step_name: step['name'],
            description: step['description'],
            oneliner: step['oneliner'],
            event_datetime: step['event_datetime'],
            video_url: step['video_url'],
            video_local_url: step['video_local_url'],
            new_status: step['status'],
            custom_link: step['custom_link'],
            custom_link_text: step['custom_link_text'],

            click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
    });
}

async function sendCustomNotification(title, body, topic) {
    // Note: App only uses new_deployment_step topic, needs to stay to be backwards compatible
    const messageResponse = await admin.messaging().sendToTopic(topic, {
        notification: {
            title: title,
            body: body,
            sound: "default"
        },
        data: {
            click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
    });
}


exports.checkDeploymentStep = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
    const currentDeploymentStepRef = admin.firestore().collection('currentDeploymentStep')
    const oldDeploymentStepDoc = currentDeploymentStepRef.doc('currentDeploymentStep')
    const snapshot = await oldDeploymentStepDoc.get()
    const oldDeploymentStep = snapshot.data()["index"];
    const newDeploymentStep = await getCurrentDeploymentStep()

    if (newDeploymentStep !== oldDeploymentStep) {
        // Update the deployment step index in Firestore to the new one
        await oldDeploymentStepDoc.set({index: newDeploymentStep});
        // Update status and info url of current deployment step
        const currentStepDoc = await admin.firestore().collection('steps').doc(newDeploymentStep.toString());
        await currentStepDoc.update({
            'status': 'in progress',
            'info_url': whereIsWebbURL
        })

        // Workaround, as app needs current index from any step: Add current index to all steps
        const allSteps = await admin.firestore().collection('steps').get();
        allSteps.forEach(step => {
            const stepDoc = admin.firestore().collection('steps').doc(step['index'].toString());
            stepDoc.update({'current_index': newDeploymentStep});
        });

        functions.logger.log("Deployment step was updated: ", newDeploymentStep);
        await sendNotification(newDeploymentStep);

    }
    return null;
});


exports.checkInstrumentsTrackingImage = functions.runWith({memory: "1GB"}).pubsub.schedule('every 60 minutes').onRun(async (context) => {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();

    await page.goto('https://www.jwst.nasa.gov/content/webbLaunch/deploymentExplorer.html#41', puppeteerOptions);
    const element = await page.waitForSelector('a[title="view full size in new tab"]');
    const asset = await page.evaluate(element => element.getAttribute('href'), element);
    const newImageLink = 'https://www.jwst.nasa.gov' + asset;


    const instrumentsTrackingDoc = admin.firestore().collection('steps').doc('40');
    const snapshot = await instrumentsTrackingDoc.get()
    const oldImageLink = snapshot.data()["image_url2"];

    if (newImageLink !== oldImageLink) {
        if (validUrl.isUri(newImageLink)) {
            await sendCustomNotification("Webb Mode Commissioning Tracker", "A new mode for the James Webb Space Telescope has been commissioned", "new_deployment_step")
            functions.logger.log("Sending notification: Updated instruments tracking image link: ", newImageLink);
        } else {
            functions.logger.error(newImageLink, " is invalid")
        }
    }
    await browser.close();
});


exports.getCurrentDeploymentStepIndex = functions.https.onCall(async (data, context) => {
    return await getCurrentDeploymentStep();
});


exports.getAllDeploymentSteps = functions.https.onCall(async (data, context) => {
    functions.logger.log("Getting all deployment steps");
    const allSteps = await admin.firestore().collection('steps').orderBy("index", 'asc').get();

    const stepsJson = [];
    allSteps.forEach(step => {
        stepsJson.push(step.data());
    });

    // Quick usability fix: Update current step oneliner with a hint to tap for more information
    const currentStep = await getCurrentDeploymentStep();
    stepsJson[currentStep]['oneliner'] += " (Tap for more info)";
    return stepsJson;
});


// TODO: Check if a new step has been added by NASA, add it to the Firestore (and send a notification)
exports.checkNewStepAdded = functions.runWith({memory: "1GB"}).pubsub.schedule('every 60 minutes').onRun(async (context) => {
    const stepIds = await scrapeAllStepIds();
    const newStepId = stepIds[stepIds.length - 1];

    const latestStepIdDoc = admin.firestore().collection('latestStepId').doc('latestStepId');
    const latestStepId = (await latestStepIdDoc.get()).data()["latestStepId"];

    functions.logger.log("New step id: ", newStepId);
    if (newStepId > latestStepId) {
        const newStep = await scrapeStep(newStepId);
        const newStepDoc = admin.firestore().collection('steps').doc(newStepId.toString());
        const snapshot = await newStepDoc.get();
        if (snapshot.exists) {
            functions.logger.error("New step already exists in Firestore");
            await sendCustomNotification("Webb Error", "New step already exists in Firestore!", "new_deployment_step_test")
            return null;
        }
        await newStepDoc.set({
            index: newStepId,
            name: newStep.title,
            description: newStep.description,
            oneliner: newStep.oneliner,
            video_url: "",
            status: "future",
            image_url: newStep.thumbnailImageLink,
            image_url2: newStep.imageLink,
            youtube_url: "",
            info_url: "",
            custom_link: "",
            custom_link_text: ""
        });
        functions.logger.log("New step added: ", newStepId);
        await sendCustomNotification(newStep.title, "A new step has been added to the James Webb Space Telescope", "new_deployment_step");
    }
});


async function scrapeStepDescription(textInfoBox) {
    let description = await textInfoBox.$$eval('p.description', e => e[0].innerText);
    // Clean
    description = description.split("Video:")[0]
    description = description.split("VIDEO:")[0]
    description = description.split("IMAGE:")[0]
    description = description.split("READ:")[0]
    description = description.split("LISTEN:")[0]
    description = description.split("TRACK:")[0]
    description = description.split("Photos:")[0]
    description = description.split("Coverage Replays:")[0]
    description = description.split("Coverage Replay:")[0]
    description = description.split("TEST IMAGE:")[0]
    description = description.trim()

    return description;
}


async function scrapeStep(stepId) {
    // TODO: Move to top level for caching optimization
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();
    const url = stepExplorerURL + '#' + (stepId + 1);
    await page.goto(url);

    // Parent element
    const textInfoBox = await page.waitForSelector('header.dataInfo');

    const imageElement = await page.waitForSelector('a[title="view full size in new tab"]');
    const imageAsset = await page.evaluate(e => e.getAttribute('href'), imageElement);
    let imageLink = 'https://www.jwst.nasa.gov' + imageAsset;
    imageLink = validUrl.isUri(imageLink) ? imageLink : '';

    // TODO: Fix, sometimes not found
    let thumbnailImageLink = await page.$eval('#deployState' + stepId + ' > button > img', e => e.src);
    thumbnailImageLink = validUrl.isUri(thumbnailImageLink) ? thumbnailImageLink : '';

    const title = await textInfoBox.$$eval('h1', e => e[0].innerText);
    const oneliner = await textInfoBox.$$eval('p.oneLiner', e => e[0].innerText);
    const description = await scrapeStepDescription(textInfoBox);

    await browser.close();

    return {
        thumbnailImageLink: thumbnailImageLink,
        imageLink: imageLink,
        title: title,
        oneliner: oneliner,
        description: description
    }

}

async function scrapeAllStepIds() {
    const browser = await puppeteer.launch(puppeteerOptions);
    const page = await browser.newPage();

    await page.goto(stepExplorerURL);
    const stepIds = await page.$$eval('[id^="deployState"]', e => e.map(
        e => parseInt(e.id.replace("deployState", "")))
    );

    functions.logger.log("Scraped step ids: ", stepIds);
    await browser.close();
    return stepIds;
}

