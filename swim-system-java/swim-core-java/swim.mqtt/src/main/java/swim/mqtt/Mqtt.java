// Copyright 2015-2021 Swim inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.mqtt;

public final class Mqtt {

  private Mqtt() {
    // static
  }

  private static MqttDecoder standardDecoder;

  public static MqttDecoder standardDecoder() {
    if (Mqtt.standardDecoder == null) {
      Mqtt.standardDecoder = new MqttDecoder();
    }
    return Mqtt.standardDecoder;
  }

  private static MqttEncoder standardEncoder;

  public static MqttEncoder standardEncoder() {
    if (Mqtt.standardEncoder == null) {
      Mqtt.standardEncoder = new MqttEncoder();
    }
    return Mqtt.standardEncoder;
  }

}
