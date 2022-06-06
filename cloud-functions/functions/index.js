const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require('axios')
const dayjs = require('dayjs')
const puppeteer = require('puppeteer')
dayjs().format()
admin.initializeApp();

const launchDateTime = dayjs('2021-12-25T12:20Z')
const whereIsWebbURL = 'https://www.jwst.nasa.gov/content/webbLaunch/whereIsWebb.html';


async function getNewDeploymentStep() {
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
    const messageResponse = await admin.messaging().sendToTopic("new_deployment_step", {
        notification: {
            title: steps[newDeploymentStep]['name'],
            body: "James Webb Space Telescope has reached a new step!",
            sound: "default"
        },
        data: {
            step: newDeploymentStep.toString(),
            step_name: steps[newDeploymentStep]['name'],
            description: steps[newDeploymentStep]['description'],
            oneliner: steps[newDeploymentStep]['oneliner'],
            event_datetime: steps[newDeploymentStep]['event_datetime'],
            video_url: steps[newDeploymentStep]['video_url'],
            video_local_url: steps[newDeploymentStep]['video_local_url'],
            new_status: steps[newDeploymentStep]['status'],
            next_step_name: steps[newDeploymentStep + 1]['name'],
            custom_link: steps[newDeploymentStep]['custom_link'],
            custom_link_text: steps[newDeploymentStep]['custom_link_text'],

            click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
    });
}

async function sendCustomNotification(title, body) {
    // Note: App only uses new_deployment_step topic, needs to stay to be backwards compatible
    const messageResponse = await admin.messaging().sendToTopic("new_deployment_step", {
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


exports.checkDeploymentStep = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
    const currentDeploymentStepRef = admin.firestore().collection('currentDeploymentStep')
    const oldDeploymentStepDoc = currentDeploymentStepRef.doc('currentDeploymentStep')
    const snapshot = await oldDeploymentStepDoc.get()
    const oldDeploymentStep = snapshot.data()["index"];
    const newDeploymentStep = await getNewDeploymentStep()

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


exports.checkInstrumentsTrackingImage = functions.runWith({memory: "1GB"}).pubsub.schedule('every 10 minutes').onRun(async (context) => {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();

    await page.goto('https://www.jwst.nasa.gov/content/webbLaunch/deploymentExplorer.html#41');
    const element = await page.waitForSelector('a[title="view full size in new tab"]');
    const asset = await page.evaluate(element => element.getAttribute('href'), element);
    const newImageLink = 'https://www.jwst.nasa.gov' + asset;


    const instrumentsTrackingDoc = admin.firestore().collection('steps').doc('40');
    const snapshot = await instrumentsTrackingDoc.get()
    const oldImageLink = snapshot.data()["image_url2"];

    if (newImageLink !== oldImageLink) {
        await instrumentsTrackingDoc.update({'image_url2': newImageLink});
        functions.logger.log("Updated instruments tracking image");
        await sendCustomNotification("Webb Mode Commissioning Tracker", "A new mode for the James Webb Space Telescope has been approved")
    }

    await browser.close();
});


exports.getCurrentDeploymentStepIndex = functions.https.onCall(async (data, context) => {
    return await getNewDeploymentStep();
});


exports.getAllDeploymentSteps = functions.https.onCall(async (data, context) => {
    functions.logger.log("Getting all deployment steps");
    const allSteps = await admin.firestore().collection('steps').orderBy("index", 'asc').get();


    const stepsJson = [];
    allSteps.forEach(step => {
        stepsJson.push(step.data());
    });

    return stepsJson;
});


