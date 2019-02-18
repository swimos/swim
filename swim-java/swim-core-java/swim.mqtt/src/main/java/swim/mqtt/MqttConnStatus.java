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
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public final class MqttConnStatus implements Debug {
  public final int code;

  MqttConnStatus(int code) {
    this.code = code;
  }

  public boolean isAccepted() {
    return this.code == 0;
  }

  public boolean isRefused() {
    return this.code != 0;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttConnStatus) {
      final MqttConnStatus that = (MqttConnStatus) other;
      return this.code == that.code;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MqttConnStatus.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.code));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttConnStatus").write('.');
    switch (this.code) {
      case 0: output.write("ACCEPTED"); break;
      case 1: output.write("UNACCEPTABLE_PROTOCOL_VERSION"); break;
      case 2: output.write("IDENTIFIER_REJECTED"); break;
      case 3: output.write("SERVER_UNAVAILABLE"); break;
      case 4: output.write("BAD_USERNAME_OR_PASSWORD"); break;
      case 5: output.write("NOT_AUTHORIZED"); break;
      default: output.write("from").write('(').debug(this.code).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static final MqttConnStatus ACCEPTED = new MqttConnStatus(0);
  public static final MqttConnStatus UNACCEPTABLE_PROTOCOL_VERSION = new MqttConnStatus(1);
  public static final MqttConnStatus IDENTIFIER_REJECTED = new MqttConnStatus(2);
  public static final MqttConnStatus SERVER_UNAVAILABLE = new MqttConnStatus(3);
  public static final MqttConnStatus BAD_USERNAME_OR_PASSWORD = new MqttConnStatus(4);
  public static final MqttConnStatus NOT_AUTHORIZED = new MqttConnStatus(5);

  public static MqttConnStatus from(int code) {
    switch (code) {
      case 0: return ACCEPTED;
      case 1: return UNACCEPTABLE_PROTOCOL_VERSION;
      case 2: return IDENTIFIER_REJECTED;
      case 3: return SERVER_UNAVAILABLE;
      case 4: return BAD_USERNAME_OR_PASSWORD;
      case 5: return NOT_AUTHORIZED;
      default: return new MqttConnStatus(code);
    }
  }
}
