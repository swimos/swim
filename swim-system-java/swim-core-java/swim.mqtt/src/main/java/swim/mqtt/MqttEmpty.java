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

package swim.mqtt;

import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;

final class MqttEmpty extends MqttEntity<Object> implements Debug {
  @Override
  public boolean isDefined() {
    return false;
  }

  @Override
  public Object get() {
    return null;
  }

  @Override
  public int mqttSize() {
    return 0;
  }

  @Override
  public Encoder<?, ?> mqttEncoder(MqttEncoder mqtt) {
    return Encoder.done();
  }

  @Override
  public Encoder<?, ?> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return Encoder.done();
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttEntity").write('.').write("empty").write('(').write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }
}
