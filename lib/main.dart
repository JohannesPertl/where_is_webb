import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import 'notification.dart';

const String _currentStepURL =
    'https://www.jwst.nasa.gov/content/webbLaunch/whereIsWebb.html';
const String _allStepsURL =
    'https://www.jwst.nasa.gov/content/webbLaunch/deploymentExplorer.html';
const String _twitterUrl = 'https://twitter.com/NASAWebb';

const yellow = Color(0xFFFFCC00);
const grey = Color(0xFF1D1D1D);
const turquoise = Color(0xFF41EAD4);
const pink = Color(0xFFFF206E);

void main() async {
  await init();
  runApp(const MyApp());
}

Future init() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await FirebaseMessaging.instance.subscribeToTopic('new_deployment_step');
}

Future<dynamic> getCurrentDeploymentStep() async {
  HttpsCallable callable =
      FirebaseFunctions.instance.httpsCallable('getCurrentDeploymentStepDev');
  final result = await callable();
  print(result.data);

  return result.data;
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Where is Webb?',
      theme: new ThemeData(
        scaffoldBackgroundColor: grey,
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
  String stepName = "Loading..";
  String stepDescription = "";

  void showDeploymentStep() {
    getCurrentDeploymentStep().then((dynamic result) {
      setState(() {
        stepName = result['step_name'];
        String step = (result['step'] + 1).toString();
        stepDescription = "Step $step of 28";
      });
    }).timeout(Duration(seconds: 10));
  }

  void showInfoSnackbar(int duration) {
    final snackBar = SnackBar(
      backgroundColor: yellow,
      content: RichText(
        text: TextSpan(
          children: [
            WidgetSpan(
              child: FaIcon(FontAwesomeIcons.solidBell, size: 20),
            ),
            TextSpan(
              text: " You will be notified as soon as a new step is reached",
              style: TextStyle(
                color: grey,
                fontSize: 18.0,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        textAlign: TextAlign.center,
      ),
      duration: Duration(seconds: duration),
    );
    Future.delayed(const Duration(seconds: 1), () {
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance!.removeObserver(this);
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
    showDeploymentStep();

    super.initState();
    WidgetsBinding.instance!.addObserver(this);

    showInfoSnackbar(10);
  }

  _changeStep(String msg) => setState(() {
        stepDescription = msg;
      });

  _changeStepName(String msg) => setState(() {
        stepName = msg;
        final snackBar = SnackBar(
          backgroundColor: pink,
          content: Text(
            'A new step has just been reached:\n$stepName',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
            // textAlign: TextAlign.center,
          ),
          action: SnackBarAction(
            textColor: grey,
            label: 'Close',
            onPressed: () {},
          ),
          duration: Duration(days: 365),
        );

        Future(() {
          ScaffoldMessenger.of(context).showSnackBar(snackBar);
        });
      });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Flexible(
              flex: 2,
              child: Text(
                'Where\nis\nWebb?',
                style: TextStyle(
                    fontSize: 72.0, fontWeight: FontWeight.bold, color: yellow),
                textAlign: TextAlign.center,
              ),
            ),
            Column(
              children: [
                Text(
                  stepDescription,
                  // "test",
                  style: TextStyle(
                      fontSize: 20.0,
                      fontWeight: FontWeight.bold,
                      color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                Text(
                  stepName,
                  style: TextStyle(
                      fontSize: 30.0,
                      fontWeight: FontWeight.bold,
                      color: turquoise),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  // Change color of button
                  style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all<Color>(pink),
                    minimumSize: MaterialStateProperty.all<Size>(Size(0, 45)),
                  ),
                  child: RichText(
                    text: TextSpan(
                      children: [
                        WidgetSpan(
                          child: FaIcon(FontAwesomeIcons.rocket, size: 20),
                        ),
                        TextSpan(
                          text: " More info",
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
                        MaterialStateProperty.all<Color>(Color(0xFF1D9BF0)),
                    minimumSize: MaterialStateProperty.all<Size>(Size(0, 45)),
                  ),
                  child: RichText(
                    text: TextSpan(
                      children: [
                        WidgetSpan(
                          child: FaIcon(FontAwesomeIcons.twitter, size: 20),
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
