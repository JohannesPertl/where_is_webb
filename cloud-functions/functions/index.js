const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require('axios')
const dayjs = require('dayjs')
const puppeteer = require('puppeteer')
dayjs().format()
admin.initializeApp();

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

async function sendCustomNotification(title, body) {
    // Note: App only uses new_deployment_step topic, needs to stay to be backwards compatible
    const messageResponse = await admin.messaging().sendToTopic("new_deployment_step_test", {
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
        // TODO: Validate!
        await instrumentsTrackingDoc.update({'image_url2': newImageLink});
        functions.logger.log("Updated instruments tracking image link: ", newImageLink);
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


// exports.updateSteps = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
//     // TODO: Update steps by scraping NASA website
//     const browser = await puppeteer.launch({});
//     const page = await browser.newPage();
//
//     await page.goto('https://www.jwst.nasa.gov/content/webbLaunch/deploymentExplorer.html#41');
//     const element = await page.waitForSelector('a[title="view full size in new tab"]');
//     const asset = await page.evaluate(element => element.getAttribute('href'), element);
//     const newImageLink = 'https://www.jwst.nasa.gov' + asset;
//
//
//
//
//
//
//
//
//     let db = admin.firestore();
//
//     steps.forEach(function (step) {
//         db.collection("steps").doc(step.index.toString()).set({
//             index: step.index,
//             name: step.name,
//             event_datetime: step.event_datetime,
//             description: step.description,
//             oneliner: step.oneliner,
//             video_url: step.video_url != null ? step.video_url : "",
//             status: step.status != null ? step.status : "",
//             image_url: step.image_url != null ? step.image_url : "",
//             image_url2: step.image_url2 != null ? step.image_url : "",
//             youtube_url: step.youtube_url != null ? step.youtube_url : "",
//             info_url: step.info_url != null ? step.info_url : "",
//             custom_link: step.custom_link != null ? step.custom_link : "",
//             custom_link_text: step.custom_link_text != null ? step.custom_link_text : ""
//         }).then(function (docRef) {
//             console.log("Document written with ID: ", docRef.id);
//         })
//             .catch(function (error) {
//                 console.error("Error adding document: ", error);
//             });
//     });
// });

