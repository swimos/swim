// Copyright 2015-2023 Nstream, inc.
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

import swim.codec.Encoder;
import swim.codec.OutputBuffer;

public abstract class MqttPacket<T> {

  MqttPacket() {
    // sealed
  }

  public abstract int packetType();

  public abstract int packetFlags();

  abstract int variableHeaderSize(MqttEncoder mqtt);

  public abstract Encoder<?, ?> mqttEncoder(MqttEncoder mqtt);

  public Encoder<?, ?> mqttEncoder() {
    return this.mqttEncoder(Mqtt.standardEncoder());
  }

  public abstract Encoder<?, ?> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt);

  public Encoder<?, ?> encodeMqtt(OutputBuffer<?> output) {
    return this.encodeMqtt(output, Mqtt.standardEncoder());
  }

}
