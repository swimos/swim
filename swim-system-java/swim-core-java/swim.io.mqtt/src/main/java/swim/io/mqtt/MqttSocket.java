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

import swim.io.IpSocket;
import swim.mqtt.MqttPacket;

public interface MqttSocket<I, O> {
  MqttSocketContext<I, O> mqttSocketContext();

  void setMqttSocketContext(MqttSocketContext<I, O> context);

  long idleTimeout();

  void doRead();

  void didRead(MqttPacket<? extends I> packet);

  void doWrite();

  void didWrite(MqttPacket<? extends O> packet);

  void willConnect();

  void didConnect();

  void willSecure();

  void didSecure();

  void willBecome(IpSocket socket);

  void didBecome(IpSocket socket);

  void didTimeout();

  void didDisconnect();

  void didFail(Throwable error);
}
