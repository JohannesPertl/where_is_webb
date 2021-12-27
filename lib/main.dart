import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:url_launcher/url_launcher.dart';

import 'notification.dart';

const String _nasaUrl =
    'https://www.jwst.nasa.gov/content/webbLaunch/whereIsWebb.html';

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
      FirebaseFunctions.instance.httpsCallable('getCurrentDeploymentStep');
  final result = await callable();
  print(result.data['step_name']);
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

class _HomePageState extends State<HomePage> {
  String stepName = "";
  String stepDescription = "";

  @override
  void initState() {
    final firebaseMessaging = FCM();
    firebaseMessaging.setNotifications();

    firebaseMessaging.stepCtrl.stream.listen(_changeStep);
    firebaseMessaging.stepNameCtrl.stream.listen(_changeStepName);

    getCurrentDeploymentStep().then((dynamic result) {
      setState(() {
        stepName = result['step_name'];
        String step = (result['step'] + 1).toString();
        stepDescription = "Step $step of 28";
      });
    });

    super.initState();
    final snackBar = SnackBar(
      backgroundColor: yellow,
      content: Row(
        children: [
          Icon(CupertinoIcons.bell_solid, color: grey),
          Text(
            ' You will be notified about the next step',
            style: TextStyle(
              color: grey,
              fontSize: 15.0,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
      duration: Duration(seconds: 20),
    );
    Future.delayed(const Duration(seconds: 1), () {
      ScaffoldMessenger.of(context).showSnackBar(snackBar);
    });
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
            onPressed: () {
            },
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
            ElevatedButton(
              // Change color of button
              style: ButtonStyle(
                backgroundColor: MaterialStateProperty.all<Color>(pink),
              ),
              child: Text(
                'More info',
                style: TextStyle(
                    fontSize: 20.0,
                    fontWeight: FontWeight.bold,
                    color: Colors.white),
              ),
              onPressed: () => _launchURL(),
            ),
          ],
        ),
      ),
    );
  }
}

void _launchURL() async {
  if (!await launch(_nasaUrl)) throw 'Could not launch $_nasaUrl';
}
