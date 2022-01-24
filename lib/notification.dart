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
  final stepIndexCtrl = StreamController<int>.broadcast();
  final customLinkCtrl = StreamController<String>.broadcast();
  final customLinkTextCtrl = StreamController<String>.broadcast();
  final customNotificationCtrl = StreamController<String>.broadcast();

  setNotifications() {
    FirebaseMessaging.onBackgroundMessage(onBackgroundMessage);
    FirebaseMessaging.onMessage.listen(
      (message) async {
        // New deployment step
        if (message.data.containsKey('step')) {
          int step = int.parse(message.data['step']) + 1;
          stepIndexCtrl.sink.add(step);
          stepNameCtrl.sink.add(message.data['step_name']);
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
    stepIndexCtrl.close();
    stepNameCtrl.close();
    customLinkCtrl.close();
    customLinkTextCtrl.close();
    customNotificationCtrl.close();
  }
}
