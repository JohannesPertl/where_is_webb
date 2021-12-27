const functions = require("firebase-functions");
const admin = require("firebase-admin");
const https = require('https')
const axios = require('axios')
admin.initializeApp();


const deployment_step_list = [
    {
        "index": 0,
        "name": "Waiting For Launch",
        "time_since_launch": 0,
        "description": null,
        "oneliner": null
    },
    {
        "index": 1,
        "name": "Liftoff!",
        "time_since_launch": 0,
        "description": null,
        "oneliner": null
    },
    {
        "index": 2,
        "name": "Upper Stage Separation",
        "time_since_launch": 0,
        "description": null,
        "oneliner": null
    }, {"index": 3, "name": "Solar Array", "time_since_launch": 0, "description": null, "oneliner": null}, {
        "index": 4,
        "name": "MCC1a",
        "time_since_launch": 0,
        "description": null,
        "oneliner": null
    }, {
        "index": 5,
        "name": "Gimbaled Antenna Assembly",
        "time_since_launch": 1,
        "description": null,
        "oneliner": null
    }, {"index": 6, "name": "MCC1b", "time_since_launch": 2, "description": null, "oneliner": null}, {
        "index": 7,
        "name": "Forward Sunshield Pallet",
        "time_since_launch": 3,
        "description": null,
        "oneliner": null
    }, {
        "index": 8,
        "name": "Aft Sunshield Pallet",
        "time_since_launch": 3,
        "description": null,
        "oneliner": null
    }, {"index": 9, "name": "DTA Deployment", "time_since_launch": 4, "description": null, "oneliner": null}, {
        "index": 10,
        "name": "Aft Momentum Flap",
        "time_since_launch": 5,
        "description": null,
        "oneliner": null
    }, {
        "index": 11,
        "name": "Sunshield Covers Release",
        "time_since_launch": 5,
        "description": null,
        "oneliner": null
    }, {
        "index": 12,
        "name": "Sunshield PORT Mid-Boom",
        "time_since_launch": 6,
        "description": null,
        "oneliner": null
    }, {
        "index": 13,
        "name": "Sunshield STARBOARD Mid-Boom",
        "time_since_launch": 6,
        "description": null,
        "oneliner": null
    }, {
        "index": 14,
        "name": "Sunshield Layer Tensioning",
        "time_since_launch": 7,
        "description": null,
        "oneliner": null
    }, {
        "index": 15,
        "name": "Sunshield Tensioning Complete",
        "time_since_launch": 8,
        "description": null,
        "oneliner": null
    }, {
        "index": 16,
        "name": "Secondary Mirror Deployment",
        "time_since_launch": 10,
        "description": null,
        "oneliner": null
    }, {
        "index": 17,
        "name": "Secondary Mirror Deployment",
        "time_since_launch": 10,
        "description": null,
        "oneliner": "Complete - the Secondary Mirror is fully deployed and latched."
    }, {
        "index": 18,
        "name": "Aft Deployed Instrument Radiator",
        "time_since_launch": 11,
        "description": null,
        "oneliner": null
    }, {
        "index": 19,
        "name": "Port Primary Mirror Wing",
        "time_since_launch": 12,
        "description": null,
        "oneliner": null
    }, {
        "index": 20,
        "name": "Port Primary Mirror Wing",
        "time_since_launch": 12,
        "description": null,
        "oneliner": "Complete - the Port Primary Mirror Wing is deployed and latched."
    }, {
        "index": 21,
        "name": "Starboard Primary Mirror Wing",
        "time_since_launch": 13,
        "description": null,
        "oneliner": null
    }, {
        "index": 22,
        "name": "Starboard Primary Mirror Wing",
        "time_since_launch": 13,
        "description": null,
        "oneliner": "Complete - Deployment of the Starboard Primary Mirror Wing."
    }, {
        "index": 23,
        "name": "WEBB IS FULLY DEPLOYED",
        "time_since_launch": 13,
        "description": null,
        "oneliner": null
    }, {
        "index": 24,
        "name": "Individual Mirror Segment Movements",
        "time_since_launch": 15,
        "description": null,
        "oneliner": null
    }, {
        "index": 25,
        "name": "Individual Mirror Segment Movements",
        "time_since_launch": 15,
        "description": null,
        "oneliner": "Completed"
    }, {
        "index": 26,
        "name": "L2 Insertion Burn",
        "time_since_launch": 29,
        "description": null,
        "oneliner": null
    }, {"index": 27, "name": "WEBB IS ORBITING L2", "time_since_launch": 29, "description": null, "oneliner": null}]

async function getNewDeploymentStep() {
    const newDeploymentStepUrl = 'https://jwst.nasa.gov/content/webbLaunch/flightCurrentState2.0.json'
    const response = await axios.get(newDeploymentStepUrl)
    return response.data['currentState']['currentDeployTableIndex']
}

async function sendNotification(newDeploymentStep) {
    // Send notification to all users
    const messageResponse = await admin.messaging().sendToTopic("new_deployment_step", {
        notification: {
            title: deployment_step_list[newDeploymentStep]['name'],
            body: "James Webb Space Telescope has reached the next deployment step!",
            sound: "default"
        },
        data: {
            step: newDeploymentStep.toString(),
            step_name: deployment_step_list[newDeploymentStep]['name'],
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
        // Update the deployment step in Firestore to the new one
        const writeResult = await oldDeploymentStepDoc.set({index: newDeploymentStep});
        functions.logger.log("Deployment step was updated: ", writeResult.id);
        await sendNotification(newDeploymentStep);
    }
    return null;
});


exports.getCurrentDeploymentStep = functions.https.onCall(async (data, context) => {
    functions.logger.log("Getting current deployment step for user");
    const newDeploymentStep = await getNewDeploymentStep()
    return {
        step_name: deployment_step_list[newDeploymentStep]['name'],
        step: newDeploymentStep,
    };
});





