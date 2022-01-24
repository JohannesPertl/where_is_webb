import 'package:card_swiper/card_swiper.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:video_player/video_player.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'notification.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

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
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  SwiperController? _swiperController;

  late Future<void> _initializeVideoPlayerFuture;
  Future<List<dynamic>>? deploymentSteps;

  String customLink = "";
  String customLinkText = "";

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
              text: " You will be notified about major JWST updates.",
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
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      showInfoSnackbar(4);
      setState(() {
        deploymentSteps = _fetchAllDeploymentSteps();
      });
    }
  }

  @override
  void initState() {
    final firebaseMessaging = FCM();
    firebaseMessaging.setNotifications();

    firebaseMessaging.stepIndexCtrl.stream.listen(_changeStepIndex);
    firebaseMessaging.stepNameCtrl.stream.listen(_changeStepName);
    firebaseMessaging.customLinkCtrl.stream.listen(_changeCustomLink);
    firebaseMessaging.customLinkTextCtrl.stream.listen(_changeCustomLinkText);
    firebaseMessaging.customNotificationCtrl.stream
        .listen(_triggerCustomNotification);

    _swiperController = new SwiperController();

    setState(() {
      deploymentSteps = _fetchAllDeploymentSteps();
    });

    super.initState();
    WidgetsBinding.instance!.addObserver(this);

    showInfoSnackbar(5);
  }

  _changeStepIndex(int msg) => setState(() {
        deploymentSteps = _fetchAllDeploymentSteps();
      });

  _changeCustomLink(String msg) => setState(() {
        customLink = msg;
      });

  _changeCustomLinkText(String msg) => setState(() {
        customLinkText = msg;
      });

  _changeStepName(String msg) => setState(() {
        final snackBar = SnackBar(
          behavior: SnackBarBehavior.fixed,
          backgroundColor: yellow,
          content: Text(
            'A new step has just been reached:\n$msg',
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

  Future<List> _fetchAllDeploymentSteps() async {
    HttpsCallable callable =
        FirebaseFunctions.instance.httpsCallable('getAllDeploymentSteps');
    final result = await callable();
    return result.data;
  }

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
        child: FutureBuilder(
            future: deploymentSteps,
            builder: (context, AsyncSnapshot snapshot) {
              if (!snapshot.hasData) {
                return Center(child: CircularProgressIndicator());
              } else {
                return Swiper(
                  // scrollDirection: Axis.vertical,
                  controller: _swiperController,
                  index: snapshot.data[0]['current_index'],
                  loop: true,
                  itemBuilder: (BuildContext context, int index) {
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        Column(
                          children: [
                            Hero(
                              tag: snapshot.data[index]['name'],
                              flightShuttleBuilder: flightShuttleBuilder,
                              child: Text(
                                snapshot.data[index]['name'],
                                style: TextStyle(
                                    fontSize: 24.0,
                                    fontWeight: FontWeight.bold,
                                    color: turquoise),
                                textAlign: TextAlign.center,
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(
                                snapshot.data[index]['oneliner'],
                                style: TextStyle(
                                    fontSize: 16.0,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    DeploymentStepDetailScreen(
                                  deploymentStep: snapshot.data[index],
                                  deploymentStepIndex: index,
                                ),
                              ),
                            );
                          },
                          child: Image(
                            image: CachedNetworkImageProvider(
                                snapshot.data[index]['image_url']),
                          ),
                        ),
                        index == snapshot.data[0]['current_index']
                            ? Text(
                                "Current Step",
                                style: TextStyle(
                                    fontSize: 16.0,
                                    fontWeight: FontWeight.bold,
                                    color: yellow),
                                textAlign: TextAlign.center,
                              )
                            : ElevatedButton(
                                onPressed: () {
                                  _swiperController
                                      ?.move(snapshot.data[0]['current_index']);
                                },
                                child: FaIcon(FontAwesomeIcons.sync, size: 17),
                                style: ButtonStyle(
                                    backgroundColor:
                                        MaterialStateProperty.all<Color>(
                                            yellow),
                                    foregroundColor:
                                        MaterialStateProperty.all<Color>(
                                            Colors.black),
                                    shape: MaterialStateProperty.all<
                                            RoundedRectangleBorder>(
                                        RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(50.0),
                                    ))),
                              ),
                      ],
                    );
                  },
                  itemCount: snapshot.data.length,
                  pagination: SwiperPagination(
                      builder: FractionPaginationBuilder(color: yellow)),
                  control: SwiperControl(),
                );
              }
            }),
      ),
    );
  }
}

void _launchURL(url) async {
  if (!await launch(url)) throw 'Could not launch $url';
}

class DeploymentStepDetailScreen extends StatefulWidget {
  const DeploymentStepDetailScreen(
      {Key? key, required this.deploymentStep, this.deploymentStepIndex})
      : super(key: key);

  final deploymentStep;
  final deploymentStepIndex;

  @override
  State<DeploymentStepDetailScreen> createState() =>
      _DeploymentStepDetailScreenState();
}

class _DeploymentStepDetailScreenState
    extends State<DeploymentStepDetailScreen> {
  VideoPlayerController? _videoPlayerController;
  YoutubePlayerController? _youtubePlayerController;
  late Future<void> _initializeVideoPlayerFuture;

  @override
  void initState() {
    String videoURL = widget.deploymentStep['video_url'];
    String youtubeURL = widget.deploymentStep['youtube_url'];

    if (videoURL != "") {
      setState(() {
        _initializeVideoPlayerFuture = playVideo(videoURL, false);
      });
    } else if (youtubeURL != "") {
      playYoutubeVideo(youtubeURL);
    }

    super.initState();
  }

  @override
  void dispose() {
    if (_videoPlayerController != null) {
      _videoPlayerController!.dispose();
    }
    if (_youtubePlayerController != null) {
      _youtubePlayerController!.close();
    }
    super.dispose();
  }

  playYoutubeVideo(String url) {
    String? videoId = YoutubePlayerController.convertUrlToId(url);
    _youtubePlayerController = YoutubePlayerController(
      initialVideoId: videoId!,
      params: YoutubePlayerParams(
        showControls: true,
        showFullscreenButton: true,
        mute: false,
        enableCaption: false,
        showVideoAnnotations: false,
        autoPlay: true,
      ),
    );
  }

  Future<void> playVideo(String url, bool local) {
    // Dispose controller if it is already initialized
    if (_videoPlayerController != null) {
      print("dispose controller");
      _videoPlayerController?.dispose();
    }
    if (local) {
      _videoPlayerController = VideoPlayerController.asset(
        url,
        videoPlayerOptions: VideoPlayerOptions(
          mixWithOthers: true,
        ),
      );
    } else {
      _videoPlayerController = VideoPlayerController.network(
        url,
        videoPlayerOptions: VideoPlayerOptions(
          mixWithOthers: true,
        ),
      );
    }

    _initializeVideoPlayerFuture = _videoPlayerController!.initialize();
    _videoPlayerController?.setLooping(true);
    _videoPlayerController?.setVolume(0.0);
    // _videoPlayerController?.setPlaybackSpeed(1);
    _videoPlayerController?.play();

    return _initializeVideoPlayerFuture;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Deployment ${widget.deploymentStepIndex + 1} of 29',
          style: TextStyle(fontWeight: FontWeight.bold, color: yellow),
          textAlign: TextAlign.center,
        ),
        backgroundColor: background,
        elevation: 0,
        centerTitle: true,
      ),
      body: Scrollbar(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(20),
          child: Column(
            children: [
              Text(
                '${widget.deploymentStep['name']}',
                style: TextStyle(
                    fontSize: 24.0,
                    fontWeight: FontWeight.bold,
                    color: turquoise),
                textAlign: TextAlign.center,
              ),
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: "Status:  ",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                        ),
                      ),
                      TextSpan(
                        text:
                            "${widget.deploymentStep['status'].toUpperCase()}",
                        style: TextStyle(
                          color: yellow,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (_youtubePlayerController != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(0, 20, 0, 20),
                  child: YoutubePlayerIFrame(
                    controller: _youtubePlayerController,
                    aspectRatio: 16 / 9,
                  ),
                ),
              if (widget.deploymentStep['video_url'] != "")
                Padding(
                  padding: const EdgeInsets.fromLTRB(0, 20, 0, 20),
                  child: FutureBuilder(
                    future: _initializeVideoPlayerFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.done) {
                        return AspectRatio(
                          aspectRatio:
                              _videoPlayerController!.value.aspectRatio,
                          child: VideoPlayer(_videoPlayerController!),
                        );
                      } else {
                        return Center(
                          child: CircularProgressIndicator(),
                        );
                      }
                    },
                  ),
                ),
              Padding(
                padding: const EdgeInsets.fromLTRB(0, 20, 0, 20),
                child: Text(
                  '${widget.deploymentStep['description']}',
                  style: TextStyle(
                    fontSize: 15.0,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(15.0),
                child: ElevatedButton(
                  // Change color of button
                  style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all<Color>(blue),
                    minimumSize: MaterialStateProperty.all<Size>(Size(0, 45)),
                  ),
                  child: RichText(
                    text: TextSpan(
                      children: [
                        WidgetSpan(
                          child: FaIcon(FontAwesomeIcons.infoCircle, size: 20),
                        ),
                        TextSpan(
                          text: " Learn more",
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
                  onPressed: () =>
                      _launchURL(widget.deploymentStep['info_url']),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Workaround to fix Hero bugging with Text
Widget flightShuttleBuilder(
  BuildContext flightContext,
  Animation<double> animation,
  HeroFlightDirection flightDirection,
  BuildContext fromHeroContext,
  BuildContext toHeroContext,
) {
  return DefaultTextStyle(
    style: DefaultTextStyle.of(toHeroContext).style,
    child: toHeroContext.widget,
  );
}
