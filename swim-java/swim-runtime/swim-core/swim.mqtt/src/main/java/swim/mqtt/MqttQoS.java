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

import swim.codec.Debug;
import swim.codec.Output;

public enum MqttQoS implements Debug {

  AT_MOST_ONCE(0),
  AT_LEAST_ONCE(1),
  EXACTLY_ONCE(2);

  public final int code;

  MqttQoS(int code) {
    this.code = code;
  }

  public boolean isAtMostOnce() {
    return this.code == 0;
  }

  public boolean isAtLeastOnce() {
    return this.code == 1;
  }

  public boolean isExactlyOnce() {
    return this.code == 2;
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttQoS").write('.').write(this.name());
    return output;
  }

  public static MqttQoS from(int code) {
    switch (code) {
      case 0: return MqttQoS.AT_MOST_ONCE;
      case 1: return MqttQoS.AT_LEAST_ONCE;
      case 2: return MqttQoS.EXACTLY_ONCE;
      default: throw new IllegalArgumentException(Integer.toString(code));
    }
  }

}
