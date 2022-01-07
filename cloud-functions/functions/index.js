const functions = require("firebase-functions");
const admin = require("firebase-admin");
const https = require('https')
const axios = require('axios')
const dayjs = require('dayjs')
dayjs().format()
admin.initializeApp();

const launchDateTime = dayjs('2021-12-25T12:20Z')

const deployment_step_list = [
    {
        "index": 0,
        "name": "Waiting For Launch",
        "event_datetime": launchDateTime.toISOString(),
        "description": `Webb is in Kourou French Guiana at the ESA Launch Facility. Webb has been placed on the Ariane 5 rocket in the tightly packed configuration shown and encapuslated in the nose fairing. For launch, Webb is rolled out to the launch pad and the countdown begins.
        
                        On its ~1000000 mile journey to L2, Webb will 'unfold' going through a number of deployments to reach its operational configuration.`,
        "oneliner": "Preparations for launch phase.",
        "video_url": null,
        "video_local_url": null,
        "status": "complete"
    },
    {
        "index": 1,
        "name": "Liftoff!",
        "event_datetime": launchDateTime.toISOString(),
        "description": `The Ariane 5 launch vehicle provides thrust for roughly 26 minutes after liftoff from French Guiana. The first stages fire, consumes their fuel, cut off and separate. Finally the 'upper' stage fires, giving Webb it's final push up and away from Earth's gravity and onto a trajectory toward its L2 orbit. The upper stage engine completes its burn, cuts-off, and separates. Webb is released from the Ariane 5 and is flying on its own in a fully stowed state.`,
        "oneliner": "Webb is on its way...GO WEBB!",
        "video_url": null,
        "video_local_url": null,
        "status": "complete"
    },
    {
        "index": 2,
        "name": "Upper Stage Separation",
        // launchDateTime + 27 minutes
        "event_datetime": (launchDateTime.add(27, 'minute')).toISOString(),
        "description": "The Ariane 5 launch vehicle provides thrust for roughly 26 minutes after liftoff from French Guiana. Moments after upper (second) stage engine cut-off, Webb is released from the Ariane 5 and is flying on its own in a fully stowed state.",
        "oneliner": "",
        "video_url": null,
        "video_local_url": null,
        "status": "complete"
    },
    {
        "index": 3,
        "name": "Solar Array",
        "event_datetime": (launchDateTime.add(33, 'minute')).toISOString(),
        "description": `After shedding its fairing and booster rocket, the first two deployments are 'automatic,' meaning they happen without the ground giving commands. Once the solar panel is deployed, the telescope will go off of battery power and start generating its own power.`,
        "oneliner": "Webb's solar array is released and deployed.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Solar_Array_Deployment_1280_30fps_h264.mp4",
        "video_local_url": "videos/3solar_array.mp4",
        "status": "complete"
    },
    {
        "index": 4,
        "name": "MCC1a",
        // launchDateTime + 12.5 hours
        "event_datetime": (launchDateTime.add(12.5, 'hour')).toISOString(),
        "description": `This burn fine-tunes Webb's trajectory after launch. The duration of the burn will depend on Ariane 5 launcher performance.

The James Webb Space Telescope is launched on a direct path to an orbit around the second Sun-Earth Lagrange Point (L2), but it needs to make its own mid-course thrust correction maneuvers to get there. This is by design, because if Webb gets too much thrust from the Ariane rocket, it can’t turn around to thrust back toward Earth because that would directly expose its telescope optics and structure to the Sun, overheating them and aborting the science mission before it can even begin. Therefore, Webb gets an intentional slight under-burn from the Ariane and uses its own small thrusters and on-board propellant to make up the difference.

There will be three mid-course correction (MCC) maneuvers: MCC-1a, MCC-1b, and MCC-2. The first burn, MCC-1a, is the most important and the only other time-critical operation aside from solar array deployment during Webb’s commissioning period.`,
        "oneliner": "Mid Course Correction Burn 1a",
        "video_url": null,
        "video_local_url": null,
        "status": "complete"
    }, {
        "index": 5,
        "name": "Gimbaled Antenna Assembly",
        "event_datetime": (launchDateTime.add(1, 'day')).toISOString(),
        "description": `The Gimbaled Antenna Assembly (GAA) holds Webb's high rate antenna. It is rotated to its parked position pointed back to the Earth. This is an 'automatic' deployment as well as the solar panel which preceded it. All other deployments will be controlled by commands from the ground.`,
        "oneliner": "",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_HGA_1280_30fps_h264.mp4",
        "video_local_url": "videos/5gimbaled_antenna_assembly.mp4",
        "status": "complete"
    },
    {
        "index": 6,
        "name": "MCC1b",
        "event_datetime": (launchDateTime.add(2, 'day')).toISOString(),
        "description": `This burn fine-tunes Webb's trajectory after launch. The duration of the burn will depend on Ariane 5 launcher performance.

There are three mid-course correction (MCC) maneuvers: MCC-1a, MCC-1b, and MCC-2. This is the second. The first burn, MCC-1a, is the most important and the only other time-critical operation aside from solar array deployment during Webb’s commissioning period.

The second, MCC-1b, is a shorter burn performed before the sunshield deployment is scheduled to start. The final maneuver, MCC-2, performed 29 days after launch, is designed to insert Webb into the optimum orbit around L2.`,
        "oneliner": "Mid Course Correction Burn 1b",
        "video_url": null,
        "video_local_url": null,
        "status": "complete"
    },
    {
        "index": 7,
        "name": "Forward Sunshield Pallet",
        "event_datetime": (launchDateTime.add(3, 'day')).toISOString(),
        "description": `The UPS supports and carries the five folded sunshield membranes. Prior to this, the spacecraft is maneuvered to provide warmer temperatures on the forward UPS and various heaters are activitated to warm key deployment components. Key release devices are activated. Various electronics and software are configured prior to support the UPS motions, which are driven by a motor. This step represents the start of the Sunshield deployment phase and the start of all major deployments.`,
        "oneliner": "The Forward Unitized Pallet Structure (UPS).\n" +
            "This step begins the Sunshield deployment phase.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_fwdPallet_1280_30fps_h264.mp4",
        "video_local_url": "videos/7forward_sunshield_pallet.mp4",
        "status": "complete"
    }, {
        "index": 8,
        "name": "Aft Sunshield Pallet",
        "event_datetime": (launchDateTime.add(3, 'day')).toISOString(),
        "description": "The UPS supports and carries the five folded sunshield membranes. Prior to this, the spacecraft will have been maneuvered to provide warmer temperatures on the forward UPS and various heaters have been activitated to warm key deployment components. Key release devices have been activated. Various electronics and software have also been configured prior to support the UPS motions, which are driven by a motor.",
        "oneliner": "The Aft Unitized Pallet Structure (UPS)",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_aftPallet_1280_30fps_h264.mp4",
        "video_local_url": "videos/8aft_sunshield_pallet.mp4",
        "status": "complete"
    },
    {
        "index": 9,
        "name": "DTA Deployment",
        "event_datetime": (launchDateTime.add(4, 'day')).toISOString(),
        "description": `The Deployable Tower Assembly (DTA) is deployed. The tower extends 1.22 meters. This movement/distance provides needed separation between the spacecraft and telescope to allow for better thermal isolation and to allow room for the sunshield membranes to unfold. Prior to this, several release devices will have been activated, and various heaters, software, and electronics have been configured to support deployments. This deployment motion is driven by a motor.`,
        "oneliner": "Deployable Tower Assembly (DTA)",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Tower_1280_30fps_h264.mp4",
        "video_local_url": "videos/9dta_deployment.mp4",
        "status": "complete"
    },
    {
        "index": 10,
        "name": "Aft Momentum Flap",
        "event_datetime": (launchDateTime.add(5, 'day')).toISOString(),
        "description": "The Aft Momentum Flap is used to help offset some of the solar pressure that impinges on the large sunshield. Use of the momentum flap helps to minimize fuel usage during the mission. After releasing hold-down devices, a spring drives the rotation of the aft flap to its final position.\n",
        "oneliner": "",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_mFlap_1280_30fps_h264.mp4",
        "video_local_url": "videos/10aft_momentum_flap.mp4",
        "status": "complete"
    }, {
        "index": 11,
        "name": "Sunshield Covers Release",
        "event_datetime": (launchDateTime.add(5, 'day')).toISOString(),
        "description": `This operation releases and rolls up the protective membrane cover. The sunshield release cover has been protecting the membranes during ground and launch activities. Release devices are electrically activated to release the covers.`,
        "oneliner": "",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_allCovers_1280_30fps_h264.mp4",
        "video_local_url": "videos/11sunshield_covers_release.mp4",
        "status": "complete"
    }, {
        "index": 12,
        "name": "Sunshield PORT Mid-Boom",
        "event_datetime": (launchDateTime.add(6, 'day')).toISOString(),
        "description": `The Port +J2 Mid-boom deployment steps include the completion of the sunshield cover roll up, the deployments team then extends the +J2 mid-boom along with the +J2 side of the five membranes. This operation is a motor-driven deployment.`,
        "oneliner": "The Left/Port (+J2) Sunshield Boom Deployment",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_JmBoom2_1280_30fps_h264.mp4",
        "video_local_url": "videos/12sunshield_port_mid_boom.mp4",
        "status": "complete"
    }, {
        "index": 13,
        "name": "Sunshield STARBOARD Mid-Boom",
        "event_datetime": (launchDateTime.add(6, 'day')).toISOString(),
        "description": `The Starboard (-J2) Mid-boom deployment steps include the completion of the sunshield cover roll up, the deployments team then extends the -J2 mid-boom along with the -J2 side of the five sunshield membranes. This operation is a motor driven deployment.`,
        "oneliner": "The Right/Starboard (-J2) Sunshield Boom Deployment",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_JmBoom2_1280_30fps_h264.mp4",
        "video_local_url": "videos/13sunshield_starboard_mid_boom.mp4",
        "status": "complete"
    }, {
        "index": 14,
        "name": "Sunshield Layer Tensioning",
        "event_datetime": (launchDateTime.add(7, 'day')).toISOString(),
        "description": `This operation is a multi-step two-day activity which completes the final membrane releases, as well as tensioning the five layers of the sunshield.

After initial sunshield deployments of the forward and aft UPS (which carry the fully folded sunshield), followed by the port and starboard mid-booms (which support and initially unfold all 5 layers of the sunshield together), each layer is successively tensioned.`,
        "oneliner": "",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_SS1_1280_30fps_h264.mp4",
        "video_local_url": "videos/14sunshield_layer_tensioning.mp4",
        "status": "complete"
    }, {
        "index": 15,
        "name": "Sunshield Tensioning Complete",
        "event_datetime": (launchDateTime.add(8, 'day')).toISOString(),
        "description": `Tensioning of layer 1 (the hottest layer, closest to the sun) through layer 5 is complete which puts the sunshield in its fully deployed state.

Temperatures on the Sun/hot side of the sunshield will reach a maximum of approximately 383K or approximately 230 degrees F and on the cold mirror/instruments side of the sunshield, a minimum of approximately 36K or around -394 degrees F. Due to the engineering of the sunshield, this incredible transition takes place across a distance of approximately six feet.`,
        "oneliner": "The Sunshield is Fully Deployed!",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_SS1_1280_30fps_h264.mp4",
        "video_local_url": "videos/14sunshield_layer_tensioning.mp4",
        "status": "complete"
    }, {
        "index": 16,
        "name": "Secondary Mirror Deployment",
        "event_datetime": (launchDateTime.add(19, 'day')).toISOString(),
        "description": `The Secondary Mirror Support Structure (SMSS) is moved into its operational position. Webb's secondary mirror is at the end of this structure. As it is deployed, its long booms will swing the secondary mirror out in front of the primary mirror. The secondary mirror plays an important role in reflecting the light from the primary mirror to where the instruments sit, behind the primary mirror.`,
        "oneliner": "This step begins the Secondary Mirror deployment phase.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_SMA_1_1280_30fps_h264.mp4",
        "video_local_url": "videos/16secondary_mirror_deployment.mp4",
        "status": "in progress"
    }, {
        "index": 17,
        "name": "Secondary Mirror Deployment",
        "event_datetime": (launchDateTime.add(10, 'day')).toISOString(),
        "description": `Webb's secondary mirror is at the end of the Secondary Mirror Support Structure (SMSS). As it is deployed, its long booms will swing the secondary mirror out in front of the primary mirror. The secondary mirror plays an important role in reflecting the light from the primary mirror to where the instruments sit, behind the primary mirror.`,
        "oneliner": "Complete - the Secondary Mirror is fully deployed and latched.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_SMA_v3_1280_30fps_h264.mp4",
        "video_local_url": "videos/16secondary_mirror_deployment.mp4",
        "status": "complete"
    }, {
        "index": 18,
        "name": "Aft Deployed Instrument Radiator",
        "event_datetime": (launchDateTime.add(11, 'day')).toISOString(),
        "description": `This activity releases the last of four launch locks that holds the Aft Deployed Instrument Radiator (ADIR) in its launch configuration. Releasing the last device allows springs to drive the ADIR into its final deployed position. The first three launch locks were released just after launch to prevent any unwanted strain in the system as the ADIR and telescope cools.`,
        "oneliner": "Aft Deployed Instrument Radiator (ADIR)",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Aft_Radiator_Deployment_1280_h264.mp4",
        "video_local_url": "videos/18aft_deployed_instrument_radiator.mp4",
        "status": "complete"
    }, {
        "index": 19,
        "name": "Port Primary Mirror Wing",
        "event_datetime": (launchDateTime.add(12, 'day')).toISOString(),
        "description": `The deployments team begins planning and operations for the deployment of the left/port (+V2) primary mirror wing. This operation deploys and latches the +V2 wing of the primary mirror. Each wing holds three of the 18 mirror segments. This is a motor-driven deployment.`,
        "oneliner": "This step begins the Primary Mirror deployment phase.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Pos_J2_Primary_Mirror_Wing_Deployment_1280_30fps_h264.mp4",
        "video_local_url": "videos/19port_primary_mirror_wing.mp4",
        "status": "in progress",
    }, {
        "index": 20,
        "name": "Port Primary Mirror Wing",
        "event_datetime": (launchDateTime.add(12, 'day')).toISOString(),
        "description": `The left/port (+V2) wing of the primary mirror is fully deployed and latched. Each wing holds three of the 18 mirror segments. This is a motor-driven deployment.`,
        "oneliner": "Complete - the Port Primary Mirror Wing is deployed and latched.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Pos_J2_Primary_Mirror_Wing_Deployment_1280_30fps_h264.mp4",
        "video_local_url": "videos/19port_primary_mirror_wing.mp4",
        "status": "complete"
    }, {
        "index": 21,
        "name": "Starboard Primary Mirror Wing",
        "event_datetime": (launchDateTime.add(13, 'day')).toISOString(),
        "description": `The deployments team begins planning and operations to deploy the right/starboard (-V2) wing of the primary mirror. Each wing holds 3 of the 18 mirror segments. This is a motor driven deployment.`,
        "oneliner": "Begin deployment of the Starboard Primary Mirror Wing.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Neg_J2_Primary_Mirror_Wing_Deployment_1280_30fps_h264.mp4",
        "video_local_url": "videos/21starboard_primary_mirror_wing.mp4",
        "status": "in progress"
    }, {
        "index": 22,
        "name": "Starboard Primary Mirror Wing",
        "event_datetime": (launchDateTime.add(13, 'day')).toISOString(),
        "description": `The right/starboard (-V2) wing of the primary mirror is fully deployed and latched. Each wing holds 3 of the 18 mirror segments. This is a motor driven deployment.`,
        "oneliner": "Complete - Deployment of the Starboard Primary Mirror Wing.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Neg_J2_Primary_Mirror_Wing_Deployment_1280_30fps_h264.mp4",
        "video_local_url": "videos/21starboard_primary_mirror_wing.mp4",
        "status": "complete"
    }, {
        "index": 23,
        "name": "WEBB IS FULLY DEPLOYED",
        "event_datetime": (launchDateTime.add(13, 'day')).toISOString(),
        "description": `It will continue to travel to the second Lagrange point (L2) for another two weeks, at which point it will enter a large orbit around the L2 point. The following five months will be used to cool the telescope to operating temperature, fine-tune the mirror alignment, and calibrate the instruments.`,
        "oneliner": "",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_PMA_midShot_1280_30fps_h264.mp4",
        "video_local_url": null,
        "status": "complete"
    }, {
        "index": 24,
        "name": "Individual Mirror Segment Movements",
        "event_datetime": (launchDateTime.add(20, 'day')).toISOString(),
        "description": `This operation is a multi-day multi-step activity to activate and move each of its 18 primary mirror segments (which are adjustable) out of their launch configuration.

The primary mirror segments and secondary mirror are moved by six actuators that are attached to the back of each mirror piece. The primary mirror segments also have an additional actuator at its center that adjusts its curvature. The telescope's tertiary mirror remains stationary.`,
        "oneliner": "",
        "video_url": null,
        "video_local_url": null,
        "status": "complete"
    }, {
        "index": 25,
        "name": "Individual Mirror Segment Movements",
        "event_datetime": (launchDateTime.add(24, 'day')).toISOString(),
        "description": `This completes the multi-day multi-step activity to activate and move each of its 18 primary mirror segments (which are adjustable) out of their launch configuration.

The primary mirror segments and secondary mirror are moved by six actuators that are attached to the back of each mirror piece. The primary mirror segments also have an additional actuator at its center that adjusts its curvature. The telescope's tertiary mirror remains stationary.`,
        "oneliner": "Completed",
        "video_url": null,
        "video_local_url": null,
        "status": "complete"
    }, {
        "index": 26,
        "name": "L2 Insertion Burn",
        "event_datetime": (launchDateTime.add(29, 'day')).toISOString(),
        "description": `A series of activites to plan and execute MCC2 - the insertion burn for Webb's L2 orbit. MCC2 corrects any residual trajectory errors and adjusts the final L2 orbit.

The James Webb Space Telescope is launched on a direct path to an orbit around the second SunEarth Lagrange Point (L2), but it needs to make its own mid-course thrust correction maneuvers to get there. This is by design, because if Webb gets too much thrust from the Ariane rocket, it can’t turn around to thrust back toward Earth because that would directly expose its telescope optics and structure to the Sun, overheating them and aborting the science mission before it can even begin. Therefore, Webb gets an intentional slight under-burn from the Ariane and uses its own small thrusters and on-board propellant to make up the difference.

There are three mid-course correction (MCC) maneuvers: MCC-1a, MCC-1b, and MCC-2. This final burn, MCC-2, which inserts Webb into its L2 halo orbit.`,
        "oneliner": "Mid Course Correction Burn (MCC2) - Begins L2 Insertion",
        "video_url": null,
        "video_local_url": "videos/26l2_insertion_burn.mp4",
        "status": "complete"
    },
    {
        "index": 27,
        "name": "WEBB IS ORBITING L2",
        "event_datetime": (launchDateTime.add(29.5, 'day')).toISOString(),
        "description": `Webb is now orbiting L2. Telescope deployment is complete. Ongoing cooldown and instrument turn-on continue. The telescope and scientific instruments started to cool rapidly in the shade of the sunshield once it was deployed, but it will take several weeks for them to cool all the way down and reach stable temperatures. This cooldown will be carefully controlled with strategically-placed electric heater strips. The remaining five months of commissioning will be all about aligning the optics and calibrating the scientific instruments.`,
        "oneliner": "Orbit Insertion Complete.\n" +
            "Webb is Orbiting L2 in a HALO Orbit.",
        "video_url": null,
        "video_local_url": null,
        "status": "complete"
    }
]

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
//            description: deployment_step_list[newDeploymentStep]['description'],
//            oneliner: deployment_step_list[newDeploymentStep]['oneliner'],
//            event_datetime: deployment_step_list[newDeploymentStep]['event_datetime'],
//            video_url: deployment_step_list[newDeploymentStep]['video_url'],
//            video_local_url: deployment_step_list[newDeploymentStep]['video_local_url'],
//            status: "success",
//            nextStepName: deployment_step_list[newDeploymentStep + 1]['name'],

            click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
    });
}


async function sendTestNotification(newDeploymentStep) {
    // Send notification to all users
    const messageResponse = await admin.messaging().sendToTopic("new_deployment_step_test", {
        notification: {
            title: deployment_step_list[newDeploymentStep]['name'],
            body: "James Webb Space Telescope has completed the next deployment step!",
            sound: "default"
        },
        data: {
            step: newDeploymentStep.toString(),
            step_name: deployment_step_list[newDeploymentStep]['name'],
            description: deployment_step_list[newDeploymentStep]['description'],
            oneliner: deployment_step_list[newDeploymentStep]['oneliner'],
            event_datetime: deployment_step_list[newDeploymentStep]['event_datetime'],
            video_url: deployment_step_list[newDeploymentStep]['video_url'],
            video_local_url: deployment_step_list[newDeploymentStep]['video_local_url'],
            status: "complete",
            nextStepName: deployment_step_list[newDeploymentStep + 1]['name'],

            click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
    });
}

exports.checkDeploymentStepTest = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
    const currentDeploymentStepRef = admin.firestore().collection('currentDeploymentStepTest')
    const oldDeploymentStepDoc = currentDeploymentStepRef.doc('currentDeploymentStepTest')
    const snapshot = await oldDeploymentStepDoc.get()
    const oldDeploymentStep = snapshot.data()["index"];
    const newDeploymentStep = await getNewDeploymentStep()

    functions.logger.log("New Deployment Step: ", newDeploymentStep);

    await sendTestNotification(oldDeploymentStep);

    return null;
});


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
        step: newDeploymentStep,
        step_name: deployment_step_list[newDeploymentStep]['name'],
        description: deployment_step_list[newDeploymentStep]['description'],
        oneliner: deployment_step_list[newDeploymentStep]['oneliner'],
        event_datetime: deployment_step_list[newDeploymentStep]['event_datetime'],
        video_url: deployment_step_list[newDeploymentStep]['video_url'],
        video_local_url: deployment_step_list[newDeploymentStep]['video_local_url'],
        status: "success",
        new_status: deployment_step_list[newDeploymentStep]['status'],
        nextStepName: deployment_step_list[newDeploymentStep + 1]['name'],
    };
});



