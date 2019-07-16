// Copyright 2015-2019 SWIM.AI inc.
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

package swim.io.mqtt;

import swim.io.IpServiceRef;
import swim.io.IpSocketRef;

public class MqttSocketSpec extends MqttSocketBehaviors {
  final MqttSettings mqttSettings = MqttSettings.standard();

  @Override
  protected IpServiceRef bind(MqttEndpoint endpoint, MqttService service) {
    return endpoint.bindMqtt("127.0.0.1", 63556, service, this.mqttSettings);
  }

  @Override
  protected IpSocketRef connect(MqttEndpoint endpoint, MqttSocket<?, ?> socket) {
    return endpoint.connectMqtt("127.0.0.1", 63556, socket, this.mqttSettings);
  }
}
