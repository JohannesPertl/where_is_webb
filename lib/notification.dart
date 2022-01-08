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

  final stepNameCtrl = StreamController<String>.broadcast();
  final stepCtrl = StreamController<String>.broadcast();
  final statusCtrl = StreamController<String>.broadcast();
  final videoURLCtrl = StreamController<String>.broadcast();
  final customLinkCtrl = StreamController<String>.broadcast();
  final customLinkTextCtrl = StreamController<String>.broadcast();
  final customNotificationCtrl = StreamController<String>.broadcast();

  setNotifications() {
    FirebaseMessaging.onBackgroundMessage(onBackgroundMessage);
    FirebaseMessaging.onMessage.listen(
      (message) async {
        print(message.notification?.title);

        // New deployment step
        if (message.data.containsKey('step')) {
          String step = (int.parse(message.data['step']) + 1).toString();
          stepCtrl.sink.add("Deployment $step of 28");
          stepNameCtrl.sink.add(message.data['step_name']);
          statusCtrl.sink.add(message.data['new_status'].toUpperCase());
          
          if (message.data.containsKey('video_local_url')) {
            videoURLCtrl.sink.add(message.data['video_local_url']);
          }
        }

        // Custom link button
        if (message.data.containsKey('custom_link')) {
          customLinkCtrl.sink.add(message.data['custom_link']);
          customLinkTextCtrl.sink.add(message.data['custom_link_text']);
        }

        // Custom notification
        if (message.data.containsKey('custom_notification')) {
          customNotificationCtrl.sink.add(message.data['custom_notification']);
        }
      },
    );
    final token =
        _firebaseMessaging.getToken().then((value) => print('Token: $value'));
  }

  dispose() {
    stepCtrl.close();
    stepNameCtrl.close();
    statusCtrl.close();
    videoURLCtrl.close();
    customLinkCtrl.close();
    customLinkTextCtrl.close();
    customNotificationCtrl.close();
  }
}
