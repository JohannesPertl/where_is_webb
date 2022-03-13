const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require('axios')
const dayjs = require('dayjs')
dayjs().format()
admin.initializeApp();

const launchDateTime = dayjs('2021-12-25T12:20Z')
const whereIsWebbURL = 'https://www.jwst.nasa.gov/content/webbLaunch/whereIsWebb.html';

const deployment_step_list = [
    {
        "index": 0,
        "name": "Waiting For Launch",
        "event_datetime": launchDateTime.toISOString(),
        "description": `Webb is in Kourou French Guiana at the ESA Launch Facility. Webb has been placed on the Ariane 5 rocket in the tightly packed configuration shown and encapuslated in the nose fairing. For launch, Webb is rolled out to the launch pad and the countdown begins.

On its ~1000000 mile journey to L2, Webb will 'unfold' going through a number of deployments to reach its operational configuration.`,
        "oneliner": "Preparations for launch phase.",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/100-1.png",
        "youtube_url": "https://www.youtube.com/watch?v=uUAvXYW5bmI"
    },
    {
        "index": 1,
        "name": "Liftoff!",
        "event_datetime": launchDateTime.toISOString(),
        "description": `The Ariane 5 launch vehicle provides thrust for roughly 26 minutes after liftoff from French Guiana. The first stages fire, consumes their fuel, cut off and separate. Finally the 'upper' stage fires, giving Webb it's final push up and away from Earth's gravity and onto a trajectory toward its L2 orbit. The upper stage engine completes its burn, cuts-off, and separates. Webb is released from the Ariane 5 and is flying on its own in a fully stowed state.`,
        "oneliner": "Webb is on its way...GO WEBB!",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/101.png",
        "youtube_url": "https://www.youtube.com/watch?v=9tXlqWldVVk"
    },
    {
        "index": 2,
        "name": "Upper Stage Separation",
        // launchDateTime + 27 minutes
        "event_datetime": (launchDateTime.add(27, 'minute')).toISOString(),
        "description": "The Ariane 5 launch vehicle provides thrust for roughly 26 minutes after liftoff from French Guiana. Moments after upper (second) stage engine cut-off, Webb is released from the Ariane 5 and is flying on its own in a fully stowed state.",
        "oneliner": "Webb is released from the Ariane 5 and is flying on its own in a fully stowed state.",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/102.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    },
    {
        "index": 3,
        "name": "Solar Array",
        "event_datetime": (launchDateTime.add(33, 'minute')).toISOString(),
        "description": `After shedding its fairing and booster rocket, the first two deployments are 'automatic,' meaning they happen without the ground giving commands. Once the solar panel is deployed, the telescope will go off of battery power and start generating its own power.`,
        "oneliner": "Webb's solar array is released and deployed.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Solar_Array_Deployment_1280_30fps_h264.mp4",
        "video_local_url": "videos/3solar_array.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/103.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    },
    {
        "index": 4,
        "name": "MCC1a",
        // launchDateTime + 12.5 hours
        "event_datetime": (launchDateTime.add(12.5, 'hour')).toISOString(),
        "description": `This burn fine-tunes Webb's trajectory after launch. The duration of the burn will depend on Ariane 5 launcher performance.

The James Webb Space Telescope is launched on a direct path to an orbit around the second Sun-Earth Lagrange Point (L2), but it needs to make its own mid-course thrust correction maneuvers to get there. This is by design, because if Webb gets too much thrust from the Ariane rocket, it can’t turn around to thrust back toward Earth because that would directly expose its telescope optics and structure to the Sun, overheating them and aborting the science mission before it can even begin. Therefore, Webb gets an intentional slight under-burn from the Ariane and uses its own small thrusters and on-board propellant to make up the difference.

There will be three mid-course correction (MCC) maneuvers: MCC-1a, MCC-1b, and MCC-2. The first burn, MCC-1a, is the most important and the only other time-critical operation aside from solar array deployment during Webb’s commissioning period.`,
        "oneliner": "Mid Course Correction Burn 1a.",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/104.png",
        "youtube_url": ""
    }, {
        "index": 5,
        "name": "Gimbaled Antenna Assembly",
        "event_datetime": (launchDateTime.add(1, 'day')).toISOString(),
        "description": `The Gimbaled Antenna Assembly (GAA) holds Webb's high rate antenna. It is rotated to its parked position pointed back to the Earth. This is an 'automatic' deployment as well as the solar panel which preceded it. All other deployments will be controlled by commands from the ground.`,
        "oneliner": "Deployment of Webb's high rate antenna.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_HGA_1280_30fps_h264.mp4",
        "video_local_url": "videos/5gimbaled_antenna_assembly.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/105.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    },
    {
        "index": 6,
        "name": "MCC1b",
        "event_datetime": (launchDateTime.add(2, 'day')).toISOString(),
        "description": `This burn fine-tunes Webb's trajectory after launch. The duration of the burn will depend on Ariane 5 launcher performance.

There are three mid-course correction (MCC) maneuvers: MCC-1a, MCC-1b, and MCC-2. This is the second. The first burn, MCC-1a, is the most important and the only other time-critical operation aside from solar array deployment during Webb’s commissioning period.

The second, MCC-1b, is a shorter burn performed before the sunshield deployment is scheduled to start. The final maneuver, MCC-2, performed 29 days after launch, is designed to insert Webb into the optimum orbit around L2.`,
        "oneliner": "Mid Course Correction Burn 1b.",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/106.png",
        "youtube_url": ""
    },
    {
        "index": 7,
        "name": "Forward Sunshield Pallet",
        "event_datetime": (launchDateTime.add(3, 'day')).toISOString(),
        "description": `The UPS supports and carries the five folded sunshield membranes. Prior to this, the spacecraft is maneuvered to provide warmer temperatures on the forward UPS and various heaters are activitated to warm key deployment components. Key release devices are activated. Various electronics and software are configured prior to support the UPS motions, which are driven by a motor. This step represents the start of the Sunshield deployment phase and the start of all major deployments.`,
        "oneliner": "The Unitized Pallet Structure (UPS) carries the five folded sunshield membranes. In this step, the forward pallet is deployed.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_fwdPallet_1280_30fps_h264.mp4",
        "video_local_url": "videos/7forward_sunshield_pallet.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/107.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 8,
        "name": "Aft Sunshield Pallet",
        "event_datetime": (launchDateTime.add(3, 'day')).toISOString(),
        "description": "The UPS supports and carries the five folded sunshield membranes. Prior to this, the spacecraft will have been maneuvered to provide warmer temperatures on the forward UPS and various heaters have been activitated to warm key deployment components. Key release devices have been activated. Various electronics and software have also been configured prior to support the UPS motions, which are driven by a motor.",
        "oneliner": "The Unitized Pallet Structure (UPS) carries the five folded sunshield membranes. In this step, the aft pallet is deployed.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_aftPallet_1280_30fps_h264.mp4",
        "video_local_url": "videos/8aft_sunshield_pallet.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/108.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    },
    {
        "index": 9,
        "name": "DTA Deployment",
        "event_datetime": (launchDateTime.add(4, 'day')).toISOString(),
        "description": `The Deployable Tower Assembly (DTA) is deployed. The tower extends 1.22 meters. This movement/distance provides needed separation between the spacecraft and telescope to allow for better thermal isolation and to allow room for the sunshield membranes to unfold. Prior to this, several release devices will have been activated, and various heaters, software, and electronics have been configured to support deployments. This deployment motion is driven by a motor.`,
        "oneliner": "This movement provides a separation of 1.22 meters between the spacecraft and the telescope.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Tower_1280_30fps_h264.mp4",
        "video_local_url": "videos/9dta_deployment.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/109.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    },
    {
        "index": 10,
        "name": "Aft Momentum Flap",
        "event_datetime": (launchDateTime.add(5, 'day')).toISOString(),
        "description": "The Aft Momentum Flap is used to help offset some of the solar pressure that impinges on the large sunshield. Use of the momentum flap helps to minimize fuel usage during the mission. After releasing hold-down devices, a spring drives the rotation of the aft flap to its final position.\n",
        "oneliner": "The Aft Momentum Flap helps offset some of the solar pressure that impinges on the large sunshield.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_mFlap_1280_30fps_h264.mp4",
        "video_local_url": "videos/10aft_momentum_flap.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/110.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 11,
        "name": "Sunshield Covers Release",
        "event_datetime": (launchDateTime.add(5, 'day')).toISOString(),
        "description": `This operation releases and rolls up the protective membrane cover. The sunshield release cover has been protecting the membranes during ground and launch activities. Release devices are electrically activated to release the covers.`,
        "oneliner": "This operation releases and rolls up the protective membrane cover.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_allCovers_1280_30fps_h264.mp4",
        "video_local_url": "videos/11sunshield_covers_release.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/111.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 12,
        "name": "Sunshield PORT Mid-Boom",
        "event_datetime": (launchDateTime.add(6, 'day')).toISOString(),
        "description": `The Port +J2 Mid-boom deployment steps include the completion of the sunshield cover roll up, the deployments team then extends the +J2 mid-boom along with the +J2 side of the five membranes. This operation is a motor-driven deployment.`,
        "oneliner": "The Left/Port (+J2) Sunshield Boom Deployment.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_JmBoom2_1280_30fps_h264.mp4",
        "video_local_url": "videos/12sunshield_port_mid_boom.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/112.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 13,
        "name": "Sunshield STARBOARD Mid-Boom",
        "event_datetime": (launchDateTime.add(6, 'day')).toISOString(),
        "description": `The Starboard (-J2) Mid-boom deployment steps include the completion of the sunshield cover roll up, the deployments team then extends the -J2 mid-boom along with the -J2 side of the five sunshield membranes. This operation is a motor driven deployment.`,
        "oneliner": "The Right/Starboard (-J2) Sunshield Boom Deployment.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_JmBoom2_1280_30fps_h264.mp4",
        "video_local_url": "videos/13sunshield_starboard_mid_boom.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/113.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 14,
        "name": "Sunshield Layer Tensioning",
        "event_datetime": (launchDateTime.add(7, 'day')).toISOString(),
        "description": `This operation is a multi-step two-day activity which completes the final membrane releases, as well as tensioning the five layers of the sunshield.

After initial sunshield deployments of the forward and aft UPS (which carry the fully folded sunshield), followed by the port and starboard mid-booms (which support and initially unfold all 5 layers of the sunshield together), each layer is successively tensioned.`,
        "oneliner": "Tensioning of the five layers of the sunshield.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_SS1_1280_30fps_h264.mp4",
        "video_local_url": "videos/14sunshield_layer_tensioning.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/114.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 15,
        "name": "Sunshield Tensioning Complete",
        "event_datetime": (launchDateTime.add(8, 'day')).toISOString(),
        "description": `Tensioning of layer 1 (the hottest layer, closest to the sun) through layer 5 is complete which puts the sunshield in its fully deployed state.

Temperatures on the Sun/hot side of the sunshield will reach a maximum of approximately 383K or approximately 230 degrees F and on the cold mirror/instruments side of the sunshield, a minimum of approximately 36K or around -394 degrees F. Due to the engineering of the sunshield, this incredible transition takes place across a distance of approximately six feet.`,
        "oneliner": "The Sunshield is Fully Deployed!",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_SS1_1280_30fps_h264.mp4",
        "video_local_url": "videos/14sunshield_layer_tensioning.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/115.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 16,
        "name": "Secondary Mirror Deployment",
        "event_datetime": (launchDateTime.add(19, 'day')).toISOString(),
        "description": `The Secondary Mirror Support Structure (SMSS) is moved into its operational position. Webb's secondary mirror is at the end of this structure. As it is deployed, its long booms will swing the secondary mirror out in front of the primary mirror. The secondary mirror plays an important role in reflecting the light from the primary mirror to where the instruments sit, behind the primary mirror.`,
        "oneliner": "This step begins the Secondary Mirror deployment phase.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_SMA_1_1280_30fps_h264.mp4",
        "video_local_url": "videos/16secondary_mirror_deployment.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/116.png",
        "youtube_url": "https://svs.gsfc.nasa.gov/vis/a010000/a013200/a013273/SMSDeployVideo.mp4"
    }, {
        "index": 17,
        "name": "Secondary Mirror Deployment",
        "event_datetime": (launchDateTime.add(10, 'day')).toISOString(),
        "description": `Webb's secondary mirror is at the end of the Secondary Mirror Support Structure (SMSS). As it is deployed, its long booms will swing the secondary mirror out in front of the primary mirror. The secondary mirror plays an important role in reflecting the light from the primary mirror to where the instruments sit, behind the primary mirror.`,
        "oneliner": "Complete - the Secondary Mirror is fully deployed and latched.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_SMA_v3_1280_30fps_h264.mp4",
        "video_local_url": "videos/16secondary_mirror_deployment.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/117.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 18,
        "name": "Aft Deployed Instrument Radiator",
        "event_datetime": (launchDateTime.add(11, 'day')).toISOString(),
        "description": `This activity releases the last of four launch locks that holds the Aft Deployed Instrument Radiator (ADIR) in its launch configuration. Releasing the last device allows springs to drive the ADIR into its final deployed position. The first three launch locks were released just after launch to prevent any unwanted strain in the system as the ADIR and telescope cools.`,
        "oneliner": "The radiator draws heat out of the instruments and dumps it overboard to the extreme cold background of deep space.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Aft_Radiator_Deployment_1280_h264.mp4",
        "video_local_url": "videos/18aft_deployed_instrument_radiator.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/118.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 19,
        "name": "Port Primary Mirror Wing",
        "event_datetime": (launchDateTime.add(12, 'day')).toISOString(),
        "description": `The deployments team begins planning and operations for the deployment of the left/port (+V2) primary mirror wing. This operation deploys and latches the +V2 wing of the primary mirror. Each wing holds three of the 18 mirror segments. This is a motor-driven deployment.`,
        "oneliner": "This step begins the Primary Mirror deployment phase.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Pos_J2_Primary_Mirror_Wing_Deployment_1280_30fps_h264.mp4",
        "video_local_url": "videos/19port_primary_mirror_wing.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/119.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 20,
        "name": "Port Primary Mirror Wing",
        "event_datetime": (launchDateTime.add(12, 'day')).toISOString(),
        "description": `The left/port (+V2) wing of the primary mirror is fully deployed and latched. Each wing holds three of the 18 mirror segments. This is a motor-driven deployment.`,
        "oneliner": "Complete - the Port Primary Mirror Wing is deployed and latched.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Pos_J2_Primary_Mirror_Wing_Deployment_1280_30fps_h264.mp4",
        "video_local_url": "videos/19port_primary_mirror_wing.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/120.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 21,
        "name": "Starboard Primary Mirror Wing",
        "event_datetime": (launchDateTime.add(13, 'day')).toISOString(),
        "description": `The deployments team begins planning and operations to deploy the right/starboard (-V2) wing of the primary mirror. Each wing holds 3 of the 18 mirror segments. This is a motor driven deployment.`,
        "oneliner": "Begin deployment of the Starboard Primary Mirror Wing.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Neg_J2_Primary_Mirror_Wing_Deployment_1280_30fps_h264.mp4",
        "video_local_url": "videos/21starboard_primary_mirror_wing.mp4",
        "status": "success",
//        "custom_link": "https://www.youtube.com/watch?v=21X5lGlDOfg",
//        "custom_link_text": "WATCH LIVE",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/121.png",
        "youtube_url": "https://www.youtube.com/watch?v=RzGLKQ7_KZQ"
    }, {
        "index": 22,
        "name": "Starboard Primary Mirror Wing",
        "event_datetime": (launchDateTime.add(13, 'day')).toISOString(),
        "description": `The right/starboard (-V2) wing of the primary mirror is fully deployed and latched. Each wing holds 3 of the 18 mirror segments. This is a motor driven deployment.`,
        "oneliner": "Complete - Deployment of the Starboard Primary Mirror Wing.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/deploymentSteps/1k/WEBB_Neg_J2_Primary_Mirror_Wing_Deployment_1280_30fps_h264.mp4",
        "video_local_url": "videos/21starboard_primary_mirror_wing.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/122.png",
        "youtube_url": "https://www.youtube.com/watch?v=IvwWb48E-k8&list=PLcy1hEnsejK1JKdJlg4HSZMvOkRgN9cd8"
    }, {
        "index": 23,
        "name": "WEBB IS FULLY DEPLOYED",
        "event_datetime": (launchDateTime.add(13, 'day')).toISOString(),
        "description": `It will continue to travel to the second Lagrange point (L2) for another two weeks, at which point it will enter a large orbit around the L2 point. The following five months will be used to cool the telescope to operating temperature, fine-tune the mirror alignment, and calibrate the instruments.`,
        "oneliner": "The largest, most complex telescope ever launched into space is fully deployed.",
        "video_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/video/webbSpins/WEBB_TurnAround_AboveHorizon_1280p30.mp4",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/123Crop.png",
        "youtube_url": "https://www.youtube.com/watch?v=hET2MS1tIjA"
    }, {
        "index": 24,
        "name": "Individual Mirror Segment Movements",
        "event_datetime": (launchDateTime.add(20, 'day')).toISOString(),
        "description": `The primary mirror wings are now fully deployed and latched into place, but the individual mirror segments remain in their launch configuration. This operation is a multi-day, multi-step activity to activate and move each of the 18 primary mirror segments and the secondary mirror from their stowed launch configuration to a deployed position ready for alignment.

The 18 primary mirror segments and secondary mirror are adjustable via six actuators that are attached to the back of each mirror. The primary mirror segments also have an additional actuator at its center that adjusts its curvature. The telescope's tertiary mirror remains stationary. The primary and secondary mirror segments will move a total of 12.5mm, in small increments, over the course of ~10 days to complete each segment's deployment.`,
        "oneliner": "The mirror segments are calibrated by six actuators that are attached to the back of each mirror piece.",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/124.png",
        "youtube_url": "https://www.youtube.com/watch?v=_2zQiWeXTg4"
    }, {
        "index": 25,
        "name": "Mirror Segment Deployment Tracker",
        "event_datetime": (launchDateTime.add(24, 'day')).toISOString(),
        "description": `This completes the multi-day multi-step activity to activate and move each of the 18 primary mirror segments and the secondary mirror out of their launch configuration.

The primary mirror segments were driven 12.5 millimeters away from the telescope structure. Using six motors that deploy each segment approximately half the length of a paper clip, these actuators clear the mirrors from their launch restraints and give each segment enough space to later be adjusted in other directions to the optical starting position for the upcoming wavefront alignment process. The 18 radius of curvature (ROC) actuators were moved from their launch position as well. The ROC actuators individually shape the curvature of each beryllium mirror segment to set the initial parabolic shape of the primary mirror.

Next up in the wavefront process will be moving mirrors in the micron and nanometer ranges to reach the final optical positions for an aligned telescope. The process of telescope alignment will take approximately three months.`,
        "oneliner": "The adjacent image tracks the progress of the individual primary mirror segments (A,B,C) and the secondary (SM) mirror as they are aligned.",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/mirrorMoves/mirrorAlignmentTracker-1-19-22-1-1000px.png",
        "youtube_url": "https://www.youtube.com/watch?v=_2zQiWeXTg4"
    },
    {
        "index": 26,
        "name": "Mirror Segment Deployments Completed",
        "event_datetime": (launchDateTime.add(24, 'day')).toISOString(),
        "description": `This completes the multi-day multi-step activity to activate and move each of its 18 primary mirror segments (which are adjustable) out of their launch configuration.

The primary mirror segments and secondary mirror are moved by six actuators that are attached to the back of each mirror piece. The primary mirror segments also have an additional actuator at its center that adjusts its curvature. The telescope's tertiary mirror remains stationary.`,
        "oneliner": "Complete - The mirror segments were successfully calibrated by six actuators that are attached to the back of each mirror piece.",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/125.png",
        "youtube_url": "https://www.youtube.com/watch?v=_2zQiWeXTg4"
    }, {
        "index": 27,
        "name": "L2 Insertion Burn",
        "event_datetime": (launchDateTime.add(29, 'day')).toISOString(),
        "description": `A series of activites to plan and execute MCC2 - the insertion burn for Webb's L2 orbit. MCC2 corrects any residual trajectory errors and adjusts the final L2 orbit.

The James Webb Space Telescope is launched on a direct path to an orbit around the second SunEarth Lagrange Point (L2), but it needs to make its own mid-course thrust correction maneuvers to get there. This is by design, because if Webb gets too much thrust from the Ariane rocket, it can’t turn around to thrust back toward Earth because that would directly expose its telescope optics and structure to the Sun, overheating them and aborting the science mission before it can even begin. Therefore, Webb gets an intentional slight under-burn from the Ariane and uses its own small thrusters and on-board propellant to make up the difference.

There are three mid-course correction (MCC) maneuvers: MCC-1a, MCC-1b, and MCC-2. This final burn, MCC-2, inserts Webb into its L2 halo orbit.`,
        "oneliner": "Mid Course Correction Burn (MCC2) - Begins L2 Insertion.",
        "video_url": "",
        "video_local_url": "videos/26l2_insertion_burn.mp4",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/126.png",
        "image_url2": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/orbit/trajectoryMapping2.41-NoText-1800px.jpg",
        "youtube_url": "",
        "custom_link": "",
        "custom_link_text": ""
    },
    {
        "index": 28,
        "name": "WEBB IS ORBITING L2",
        "event_datetime": (launchDateTime.add(29.5, 'day')).toISOString(),
        "description": `Telescope deployment is complete. Webb is now orbiting L2. Ongoing cooldown and eventual instrument turn-on, testing and calibration occur. Telescope mirror alignment and calibration also begin as temperatures fall within range and instruments are enabled.

The telescope and scientific instruments started to cool rapidly in the shade of the sunshield once it was deployed, but it will take several weeks for them to cool all the way down to stable operational temperatures. This cooldown will be carefully controlled with strategically-placed electric heater strips. The remaining five months of commissioning will be all about aligning the optics and calibrating the scientific instruments.`,
        "oneliner": "Next Steps: Cooldown, Alignment, Calibration",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/deployment/1000pxWide/127.png",
        "youtube_url": "https://www.youtube.com/watch?v=6cUe4oMk69E",
        "custom_link": "https://www.youtube.com/watch?v=pWklR2PBfQU",
        "custom_link_text": "What's next?"
    },


    {
        "index": 29,
        "name": "NIRCam Cooling To Threshold",
        "event_datetime": (launchDateTime.add(6, 'month')).toISOString(),
        "description": `When NIRCam reaches 120 kelvins (approximately -244 degrees Fahrenheit, or -153 degrees Celsius), Webb’s optics team will be ready to begin meticulously moving the 18 primary mirror segments to form a single mirror surface. The team has selected the star HD 84406 as its target to begin this process. It will be the first object NIRCam “sees” when photons of light hit the instrument’s powered-on detectors. The process will essentially create an image of 18 random, blurry points of light. For the first few weeks of mirror alignment, the team will keep the instrument trained on the star while they make microscopic adjustments to the mirror segments; ultimately that collection of 18 blurry dots will become a focused image of a single star. Cooling of the telescope and instruments will also continue over the next month, with the near-infrared instruments ultimately reaching 37-39 kelvins.`,
        "oneliner": "Mirror Alignment Process to Begin",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://jwst.nasa.gov/content/webbLaunch/assets/images/mirrorAlignment/webbTempLocationsGradient1.4NoLabels-600px.jpg",
        "image_url2": "",
        "youtube_url": "https://www.youtube.com/watch?v=s8fwNTM_11g",
        "info_url": "",
        "custom_link": "https://blogs.nasa.gov/webb/2022/01/31/following-webbs-arrival-at-l2-telescope-commissioning-set-to-begin/",
        "custom_link_text": "Blog: Commissioning"
    },
    {
        "index": 30,
        "name": "Mirror Alignment Process Steps",
        "event_datetime": (launchDateTime.add(6, 'month')).toISOString(),
        "description": `With deployment of the mirror segments now complete, and the instruments turned on, the team has begun the numerous steps required to prepare and calibrate the telescope to do its job. The telescope commissioning process will take much longer than previous space telescopes because Webb’s primary mirror consists of 18 individual mirror segments that need to work together as a single high-precision optical surface. The steps in the commissioning process include:

1. Segment Image Identification
2. Segment Alignment
3. Image Stacking
4. Coarse Phasing
5. Fine Phasing
6. Telescope Alignment
7. Iterate Alignment for Final Correction`,
        "oneliner": "The Seven Steps to Mirror Alignment",
        "video_url": "",
        "video_local_url": "",
        "status": "in progress",
        "image_url": "https://blogs.nasa.gov/webb/wp-content/uploads/sites/326/2022/02/alignment_mosaic_compressed-1024x694.png",
        "image_url2": "",
        "youtube_url": "https://www.youtube.com/watch?v=QlwatKpla8s",
        "info_url": "",
        "custom_link": "https://blogs.nasa.gov/webb/2022/02/03/photons-incoming-webb-team-begins-aligning-the-telescope/",
        "custom_link_text": "Blog: Photons Incoming"
    },
    {
        "index": 31,
        "name": "Segment Image Identification",
        "event_datetime": (launchDateTime.add(6, 'month')).toISOString(),
        "description": `Webb team members saw the first photons of starlight that traveled through the entire telescope and were detected by the Near Infrared Camera (NIRCam) instrument. This milestone marks the first of many steps to capture images that are at first unfocused and use them to slowly fine-tune the telescope. This is the very beginning of the process as Segment Image Identification begins.

We are pointing the telescope at a bright, isolated star (HD 84406) to capture a series of images that are then stitched together to form a picture of that part of the sky. We don’t have just one mirror looking at this star; we have 18 mirrors, each of which is initially tilted towards a different part of the sky. As a result, we’ll actually capture 18 slightly shifted copies of the star – each one out of focus and uniquely distorted. We refer to these initial star-copies as 'segment images.'

One by one, we will move the 18 mirror segments to determine which segment creates which segment image. After matching the mirror segments to their respective images, we can tilt the mirrors to bring all the images near a common point for further analysis. We call this arrangement an 'image array.'`,
        "oneliner": "Mirror Alignment Step 1 of 7",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://jwst.nasa.gov/content/webbLaunch/assets/images/mirrorAlignment/segmentIdPhaseStep1-1000px-trans.png",
        "image_url2": "",
        "youtube_url": "https://www.youtube.com/watch?v=QlwatKpla8s",
        "info_url": "",
        "custom_link": "https://blogs.nasa.gov/webb/2022/02/17/webbs-fine-guidance-sensor-is-guiding/",
        "custom_link_text": "Blog: Fine Guidance Sensor"
    },
    {
        "index": 32,
        "name": "Segment Alignment",
        "event_datetime": (launchDateTime.add(6, 'month')).toISOString(),
        "description": `After we have the image array, we can perform Segment Alignment, which corrects most of the large positioning errors of the mirror segments.

We begin by defocusing the segment images by moving the secondary mirror slightly. Mathematical analysis, called Phase Retrieval, is applied to the defocused images to determine the precise positioning errors of the segments. Adjustments of the segments then result in 18 well-corrected “telescopes.” However, the segments still don’t work together as a single mirror.`,
        "oneliner": "Mirror Alignment Step 2 of 7",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://jwst.nasa.gov/content/webbLaunch/assets/images/mirrorAlignment/mirrorAlignStep2-1000px.jpg",
        "image_url2": "",
        "youtube_url": "https://www.youtube.com/watch?v=QlwatKpla8s&t=96s",
        "info_url": "",
        "custom_link": "https://blogs.nasa.gov/webb/2022/02/25/webb-mirror-alignment-continues-successfully/",
        "custom_link_text": "Blog: Mirror Alignment Continues Successfully"
    },
    {
        "index": 33,
        "name": "Image Stacking",
        "event_datetime": (launchDateTime.add(6, 'month')).toISOString(),
        "description": `To put all of the light in a single place, each segment image must be stacked on top of one another. In the Image Stacking step, we move the individual segment images so that they fall precisely at the center of the field to produce one unified image. This process prepares the telescope for Coarse Phasing.

The stacking is performed sequentially in three groups (A-segments, B-segments, and C-segments).`,
        "oneliner": "Mirror Alignment Step 3 of 7",
        "video_url": "",
        "video_local_url": "",
        "status": "success",
        "image_url": "https://jwst.nasa.gov/content/webbLaunch/assets/images/mirrorAlignment/mirrorAlignStep3-1000px.jpg",
        "image_url2": "https://blogs.nasa.gov/webb/wp-content/uploads/sites/326/2022/02/PostImageStacking.jpeg",
        "youtube_url": "",
        "info_url": "",
        "custom_link": "https://blogs.nasa.gov/webb/2022/02/25/webb-mirror-alignment-continues-successfully/",
        "custom_link_text": "Blog: Mirror Alignment Continues Successfully"
    },
    {
        "index": 34,
        "name": "Coarse Phasing",
        "event_datetime": (launchDateTime.add(6, 'month')).toISOString(),
        "description": `Although Image Stacking puts all the light in one place on the detector, the segments are still acting as 18 small telescopes rather than one big one. The segments need to be lined up with each other with an accuracy smaller than the wavelength of the light.

Conducted three times during the commissioning process, Coarse Phasing measures and corrects the vertical displacement (piston difference) of the mirror segments. Using a technology known as Dispersed Fringe Sensing, we use NIRCam to capture light spectra from 20 separate pairings of mirror segments. The spectrum will resemble a barber pole pattern with a slope (or angle) determined by the piston difference of the two segments in the pairing.
`,
        "oneliner": "Mirror Alignment Step 4 of 7",
        "video_url": "https://svs.gsfc.nasa.gov/vis/a020000/a020300/a020358/WEBB_CoarsePhasing_4k_30fps_h264.mp4",
        "video_local_url": "",
        "status": "in progress",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/mirrorAlignment/step4VideoGrab-1000px.jpg",
        "image_url2": "",
        "youtube_url": "",
        "info_url": "",
        "custom_link": "https://blogs.nasa.gov/webb/2022/02/25/webb-mirror-alignment-continues-successfully/",
        "custom_link_text": "Blog: Mirror Alignment Continues Successfully"
    },
    {
        "index": 35,
        "name": "Fine Phasing",
        "event_datetime": (launchDateTime.add(6, 'month')).toISOString(),
        "description": `Fine Phasing is also conducted three times, directly after each round of Coarse Phasing, and then routinely throughout Webb’s lifespan. These operations measure and correct the remaining alignment errors using the same defocusing method applied during Segment Alignment. However, instead of using the secondary mirror, we use special optical elements inside the science instrument which introduce varying amounts of defocus for each image (-8, -4, +4, and +8 waves of defocus).`,
        "oneliner": "Mirror Alignment Step 5 of 7",
        "video_url": "https://svs.gsfc.nasa.gov/vis/a020000/a020300/a020358/WEBB_FinePhasing_4k_30fps_h264.mp4",
        "video_local_url": "",
        "status": "future",
        "image_url": "https://www.jwst.nasa.gov/content/webbLaunch/assets/images/mirrorAlignment/step5VideoGrab-1000px.jpg",
        "image_url2": "",
        "youtube_url": "",
        "info_url": "",
        "custom_link": "",
        "custom_link_text": ""
    },
    {
        "index": 36,
        "name": "Telescope Alignment Over Instrument Fields of View",
        "event_datetime": (launchDateTime.add(6, 'month')).toISOString(),
        "description": `After Fine Phasing, the telescope will be well aligned at one place in the NIRCam field of view. Now we need to extend the alignment to the rest of the instruments.

In this phase of the commissioning process, we make measurements at multiple locations, or field points, across each of the science instruments, as shown below. More variation in intensity indicates larger errors at that field point. An algorithm calculates the final corrections needed to achieve a well-aligned telescope across all science instruments.

The image shows the simulated analysis of the Field of View correction.`,
        "oneliner": "Mirror Alignment Step 6 of 7",
        "video_url": "",
        "video_local_url": "",
        "status": "future",
        "image_url": "https://blogs.nasa.gov/webb/wp-content/uploads/sites/326/2022/02/Step-6-Sim-768x306.jpg",
        "image_url2": "https://blogs.nasa.gov/webb/wp-content/uploads/sites/326/2022/02/Step-6-Sim-768x306.jpg",
        "youtube_url": "",
        "info_url": "",
        "custom_link": "",
        "custom_link_text": ""
    },
    {
        "index": 37,
        "name": "Iterate Alignment for Final Correction",
        "event_datetime": (launchDateTime.add(6, 'month')).toISOString(),
        "description": `After applying the Field of View correction, the key thing left to address is the removal of any small, residual positioning errors in the primary mirror segments. We measure and make corrections using the Fine Phasing process. We will do a final check of the image quality across each of the science instruments; once this is verified, the wavefront sensing and controls process will be complete.

As we go through the seven steps, we may find that we need to iterate earlier steps as well. The process is flexible and modular to allow for iteration. After roughly three months of aligning the telescope, we will be ready to proceed to commissioning the instruments.`,
        "oneliner": "Mirror Alignment Step 7 of 7",
        "video_url": "",
        "video_local_url": "",
        "status": "future",
        "image_url": "https://jwst.nasa.gov/content/webbLaunch/assets/images/mirrorAlignment/primaryMirrorGrid-1000px.png",
        "image_url2": "",
        "youtube_url": "",
        "info_url": "",
        "custom_link": "",
        "custom_link_text": ""
    },
    {
        "index": 38,
        "name": "First science image",
        "event_datetime": (launchDateTime.add(6, 'month')).toISOString(),
        "description": `We expect the first science images from JWST to come back in late July. You will be notified as soon as the first image is available.

Are you as excited as I am?`,
        "oneliner": "Webb's first image. You will be notified when it is available.",
        "video_url": "",
        "video_local_url": "",
        "status": "future",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/af/Question_mark.png",
        "image_url2": "https://upload.wikimedia.org/wikipedia/commons/a/af/Question_mark.png",
        "youtube_url": "",
        "info_url": ""
    },
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
            body: "James Webb Space Telescope has reached a new step!",
            sound: "default"
        },
        data: {
            step: newDeploymentStep.toString(),
            step_name: deployment_step_list[newDeploymentStep]['name'] ??= "",
            description: deployment_step_list[newDeploymentStep]['description'] ??= "",
            oneliner: deployment_step_list[newDeploymentStep]['oneliner'] ??= "",
            event_datetime: deployment_step_list[newDeploymentStep]['event_datetime'] ??= "",
            video_url: deployment_step_list[newDeploymentStep]['video_url'] ??= "",
            video_local_url: deployment_step_list[newDeploymentStep]['video_local_url'] ??= "",
            new_status: deployment_step_list[newDeploymentStep]['status'] ??= "",
            next_step_name: deployment_step_list[newDeploymentStep + 1]['name'] ??= "",
            custom_link: deployment_step_list[newDeploymentStep]['custom_link'] ??= "",
            custom_link_text: deployment_step_list[newDeploymentStep]['custom_link_text'] ??= "",

            click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
    });
}


async function sendTestNotification(newDeploymentStep) {
    const messageResponse = await admin.messaging().sendToTopic("new_deployment_step_test", {
        notification: {
            title: deployment_step_list[newDeploymentStep]['name'],
            body: "James Webb Space Telescope has completed the next deployment step!",
            sound: "default"
        },
        data: {
            step: newDeploymentStep.toString(),
            step_name: deployment_step_list[newDeploymentStep]['name'] ??= "",
            description: deployment_step_list[newDeploymentStep]['description'] ??= "",
            oneliner: deployment_step_list[newDeploymentStep]['oneliner'] ??= "",
            event_datetime: deployment_step_list[newDeploymentStep]['event_datetime'] ??= "",
            video_url: deployment_step_list[newDeploymentStep]['video_url'] ??= "",
            video_local_url: deployment_step_list[newDeploymentStep]['video_local_url'] ??= "",
            new_status: deployment_step_list[newDeploymentStep]['status'] ??= "",
            next_step_name: deployment_step_list[newDeploymentStep + 1]['name'] ??= "",
            custom_link: deployment_step_list[newDeploymentStep]['custom_link'] ??= "",
            custom_link_text: deployment_step_list[newDeploymentStep]['custom_link_text'] ??= "",

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
        next_step_name: deployment_step_list[newDeploymentStep + 1]['name'],
        custom_link: deployment_step_list[newDeploymentStep]['custom_link'],
        custom_link_text: deployment_step_list[newDeploymentStep]['custom_link_text'],
    };
});

exports.getCurrentDeploymentStepIndex = functions.https.onCall(async (data, context) => {
    return await getNewDeploymentStep();
});


exports.getAllDeploymentSteps = functions.https.onCall(async (data, context) => {
    functions.logger.log("Getting all deployment steps");
    let current_index = await getNewDeploymentStep();
    for (let i = 0; i < deployment_step_list.length; i++) {
        if (!deployment_step_list[i]['info_url']) {
            if (i === current_index) {
                deployment_step_list[i]['info_url'] = whereIsWebbURL;
            } else {
                deployment_step_list[i]['info_url'] = "https://www.jwst.nasa.gov/content/webbLaunch/deploymentExplorer.html#" + (i + 1);
            }
        }
        deployment_step_list[i]['current_index'] = current_index;
    }

    if (deployment_step_list[current_index]['status'] !== "success") {
        deployment_step_list[current_index]['status'] = "in progress";
    }
    return deployment_step_list;
});


exports.getAllDeploymentStepsTest = functions.https.onCall(async (data, context) => {
    functions.logger.log("TEST: Getting all deployment steps");
    let current_index = await getNewDeploymentStep();
    for (let i = 0; i < deployment_step_list.length; i++) {
        if (!deployment_step_list[i]['info_url']) {
            if (i === current_index) {
                deployment_step_list[i]['info_url'] = whereIsWebbURL;
            } else {
                deployment_step_list[i]['info_url'] = "https://www.jwst.nasa.gov/content/webbLaunch/deploymentExplorer.html#" + (i + 1);
            }
        }
        deployment_step_list[i]['current_index'] = current_index;
    }

    if (deployment_step_list[current_index]['status'] !== "success") {
        deployment_step_list[current_index]['status'] = "in progress";
    }
    return deployment_step_list;
});



