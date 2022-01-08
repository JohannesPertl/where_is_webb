import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:video_player/video_player.dart';

import 'notification.dart';

const String _currentStepURL =
    'https://www.jwst.nasa.gov/content/webbLaunch/whereIsWebb.html';
const String _allStepsURL =
    'https://www.jwst.nasa.gov/content/webbLaunch/deploymentExplorer.html';
const String _twitterUrl = 'https://twitter.com/NASAWebb';

const yellow = Color(0xFFFFCC00);
const grey = Color(0xFF1D1D1D);
const background = Colors.black;
const turquoise = Color(0xFF41DCEA);
const pink = Color(0xFFFF206E);
const lightPink = Color(0xFFF14D96);
const blue = Color(0xFF0B3D91);
const twitterBlue = Color(0xFF1D9BF0);
const lighterBlue = Color(0xFF5AEFD4);

bool _isSnackbarActive = false;

void main() async {
  await init();
  runApp(const MyApp());
}

Future init() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  // FirebaseFunctions.instance.useFunctionsEmulator('localhost', 5001);
  await FirebaseMessaging.instance.subscribeToTopic('new_deployment_step');
}

Future<dynamic> getCurrentDeploymentStep() async {
  HttpsCallable callable =
      FirebaseFunctions.instance.httpsCallable('getCurrentDeploymentStep');
  final result = await callable();
  return result.data;
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Where is Webb?',
      theme: new ThemeData(
        scaffoldBackgroundColor: background,
        primaryColor: yellow,
        textTheme: const TextTheme(
          headline2: TextStyle(
            fontSize: 72.0,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      home: HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with WidgetsBindingObserver {
  VideoPlayerController? _controller;
  late Future<void> _initializeVideoPlayerFuture;

  String stepName = "Loading..";
  String stepNumber = "";
  String stepOneliner = "";
  String stepVideoURL = "";
  String status = "";
  String statusText = "";
  String customLink = "";
  String customLinkText = "";

  void playVideo(String url) {
    setState(() {
      // Dispose controller if it is already initialized
      if (_controller != null) {
        _controller?.dispose();
      }
      if (url.isEmpty) {
        _controller = null;
        return;
      }
      _controller = VideoPlayerController.asset(
        url,
        videoPlayerOptions: VideoPlayerOptions(
          mixWithOthers: true,
        ),
      );
      _initializeVideoPlayerFuture = _controller!.initialize();
      _controller?.setLooping(true);
      _controller?.setVolume(0.0);
      _controller?.setPlaybackSpeed(0.75);
      _controller?.play();
    });
  }

  void showDeploymentStep() {
    getCurrentDeploymentStep().then((dynamic result) {
      setState(() {
        stepName = result['step_name'];
        stepOneliner = result['oneliner'];
        String step = (result['step'] + 1).toString();
        stepNumber = "Deployment $step of 28";
        status = result['new_status'].toUpperCase();
        statusText = "Status:  ";

        if (result['video_local_url'] != null &&
            result['video_local_url'] != stepVideoURL) {
          stepVideoURL = result['video_local_url'];
          playVideo(stepVideoURL);
        }

        if (result['custom_link'] != null) {
          customLink = result['custom_link'];
          customLinkText = result['custom_link_text'];
        }
      });
    }).timeout(Duration(seconds: 10));
  }

  void showInfoSnackbar(int duration) {
    final snackBar = SnackBar(
      behavior: SnackBarBehavior.fixed,
      backgroundColor: yellow,
      content: RichText(
        text: TextSpan(
          children: [
            WidgetSpan(
              child: FaIcon(FontAwesomeIcons.solidBell, size: 17),
            ),
            TextSpan(
              text: " You will be notified about future deployments and news.",
              style: TextStyle(
                color: background,
                fontSize: 15.0,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        textAlign: TextAlign.center,
      ),
      duration: Duration(seconds: duration),
    );
    if (!_isSnackbarActive) {
      _isSnackbarActive = true;
      Future.delayed(const Duration(seconds: 3), () {
        ScaffoldMessenger.of(context)
            .showSnackBar(snackBar)
            .closed
            .then((SnackBarClosedReason reason) {
          _isSnackbarActive = false;
        });
      });
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance!.removeObserver(this);
    _controller?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      showDeploymentStep();
      showInfoSnackbar(7);
    }
  }

  @override
  void initState() {
    final firebaseMessaging = FCM();
    firebaseMessaging.setNotifications();

    firebaseMessaging.stepCtrl.stream.listen(_changeStep);
    firebaseMessaging.stepNameCtrl.stream.listen(_changeStepName);
    firebaseMessaging.statusCtrl.stream.listen(_changeStatus);
    firebaseMessaging.videoURLCtrl.stream.listen(_changeVideoURL);
    firebaseMessaging.customLinkCtrl.stream.listen(_changeCustomLink);
    firebaseMessaging.customLinkTextCtrl.stream.listen(_changeCustomLinkText);
    firebaseMessaging.customNotificationCtrl.stream.listen(_triggerCustomNotification);

    showDeploymentStep();

    super.initState();
    WidgetsBinding.instance!.addObserver(this);

    showInfoSnackbar(10);
  }

  _changeStep(String msg) => setState(() {
        stepNumber = msg;
      });

  _changeStatus(String msg) => setState(() {
        status = msg;
      });

  _changeVideoURL(String msg) => setState(() {
        stepVideoURL = msg;
        playVideo(stepVideoURL);
      });

  _changeCustomLink(String msg) => setState(() {
        customLink = msg;
      });


  _changeCustomLinkText(String msg) => setState(() {
        customLinkText = msg;
      });

  _changeStepName(String msg) => setState(() {
        stepName = msg;
        final snackBar = SnackBar(
          behavior: SnackBarBehavior.fixed,
          backgroundColor: yellow,
          content: Text(
            'A new step has just been reached:\n$stepName',
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
            ),
          ),
          action: SnackBarAction(
            textColor: background,
            label: 'Close',
            onPressed: () {},
          ),
          duration: Duration(days: 365),
        );

        Future(() {
          _isSnackbarActive = true;
          ScaffoldMessenger.of(context)
              .showSnackBar(snackBar)
              .closed
              .then((SnackBarClosedReason reason) {
            _isSnackbarActive = false;
          });
        });
      });

  _triggerCustomNotification(String msg) => setState(() {
        final snackBar = SnackBar(
          behavior: SnackBarBehavior.fixed,
          backgroundColor: yellow,
          content: Text(
            '$msg',
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
            ),
          ),
          action: SnackBarAction(
            textColor: Colors.black,
            label: 'Close',
            onPressed: () {},
          ),
          duration: Duration(days: 365),
        );

        Future(() {
          _isSnackbarActive = true;
          ScaffoldMessenger.of(context)
              .showSnackBar(snackBar)
              .closed
              .then((SnackBarClosedReason reason) {
            _isSnackbarActive = false;
          });
        });
      });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Where is Webb?',
          style: TextStyle(
              fontSize: 35.0, fontWeight: FontWeight.bold, color: yellow),
          textAlign: TextAlign.center,
        ),
        backgroundColor: background,
        elevation: 0,
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Column(
              children: [
                Text(
                  stepNumber,
                  style: TextStyle(
                      fontSize: 18.0,
                      fontWeight: FontWeight.bold,
                      color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                Text(
                  stepName,
                  style: TextStyle(
                      fontSize: 24.0,
                      fontWeight: FontWeight.bold,
                      color: turquoise),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
            if (stepVideoURL != "")
              FutureBuilder(
                future: _initializeVideoPlayerFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.done) {
                    return Flexible(
                      flex: 2,
                      child: AspectRatio(
                        aspectRatio: _controller!.value.aspectRatio,
                        child: VideoPlayer(_controller!),
                      ),
                    );
                  } else {
                    return const Center(
                      child: CircularProgressIndicator(),
                    );
                  }
                },
              ),
            RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: "$statusText",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                    ),
                  ),
                  TextSpan(
                    text: "$status",
                    style: TextStyle(
                      color: yellow,
                      fontSize: 25,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            if (customLink != "")
              ElevatedButton(
                style: ButtonStyle(
                  backgroundColor: MaterialStateProperty.all<Color>(yellow),
                  minimumSize: MaterialStateProperty.all<Size>(Size(0, 45)),
                ),
                onPressed: () => _launchURL(customLink),
                child: RichText(
                  text: TextSpan(
                    children: [
                      WidgetSpan(
                        child: FaIcon(FontAwesomeIcons.infoCircle,
                            size: 20, color: Colors.black),
                      ),
                      TextSpan(
                        text: " $customLinkText",
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  // Change color of button
                  style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all<Color>(blue),
                    minimumSize: MaterialStateProperty.all<Size>(Size(0, 45)),
                  ),
                  child: RichText(
                    text: TextSpan(
                      children: [
                        WidgetSpan(
                          child: FaIcon(FontAwesomeIcons.rocket, size: 20),
                        ),
                        TextSpan(
                          text: "   More Info  ",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    textAlign: TextAlign.center,
                  ),
                  onPressed: () => _launchURL(_currentStepURL),
                ),
                ElevatedButton(
                  // Change color of button
                  style: ButtonStyle(
                    backgroundColor:
                        MaterialStateProperty.all<Color>(twitterBlue),
                    minimumSize: MaterialStateProperty.all<Size>(Size(0, 45)),
                  ),
                  child: RichText(
                    text: TextSpan(
                      children: [
                        WidgetSpan(
                          child: FaIcon(FontAwesomeIcons.twitter, size: 18),
                        ),
                        TextSpan(
                          text: " @NASAWebb",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    textAlign: TextAlign.center,
                  ),
                  onPressed: () => _launchURL(_twitterUrl),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

void _launchURL(url) async {
  if (!await launch(url)) throw 'Could not launch $url';
}
