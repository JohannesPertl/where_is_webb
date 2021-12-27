import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

Future<void> onBackgroundMessage(RemoteMessage message) async {
  await Firebase.initializeApp();

  if (message.data.containsKey('data')) {
    final data = message.data['data'];
  }
  if (message.data.containsKey('notification')) {
    final notification = message.data['notification'];
  }
}

class FCM {
  final _firebaseMessaging = FirebaseMessaging.instance;

  final streamCtrl = StreamController<String>.broadcast();
  final stepNameCtrl = StreamController<String>.broadcast();
  final stepCtrl = StreamController<String>.broadcast();

  setNotifications() {
    FirebaseMessaging.onBackgroundMessage(onBackgroundMessage);
    FirebaseMessaging.onMessage.listen(
      (message) async {
        if (message.data.containsKey('data')) {
          streamCtrl.sink.add(message.data['data']);
          String step = (message.data['step']+1).toString();
          stepCtrl.sink.add(
              "Step $step of 28"
          );
        }
        if (message.data.containsKey('notification')) {
          streamCtrl.sink.add(message.data['notification']);
        }
        stepNameCtrl.sink.add(message.notification!.title!);

      },
    );
    // final token =
    // _firebaseMessaging.getToken().then((value) => print('Token: $value'));
  }

  dispose() {
    streamCtrl.close();
    stepCtrl.close();
    stepNameCtrl.close();
  }
}
