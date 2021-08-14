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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttConnStatus.hashSeed == 0) {
      MqttConnStatus.hashSeed = Murmur3.seed(MqttConnStatus.class);
    }
    return Murmur3.mash(Murmur3.mix(MqttConnStatus.hashSeed, this.code));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttConnStatus").write('.');
    switch (this.code) {
      case 0: output = output.write("ACCEPTED"); break;
      case 1: output = output.write("UNACCEPTABLE_PROTOCOL_VERSION"); break;
      case 2: output = output.write("IDENTIFIER_REJECTED"); break;
      case 3: output = output.write("SERVER_UNAVAILABLE"); break;
      case 4: output = output.write("BAD_USERNAME_OR_PASSWORD"); break;
      case 5: output = output.write("NOT_AUTHORIZED"); break;
      default: output = output.write("create").write('(').debug(this.code).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static final MqttConnStatus ACCEPTED = new MqttConnStatus(0);
  public static final MqttConnStatus UNACCEPTABLE_PROTOCOL_VERSION = new MqttConnStatus(1);
  public static final MqttConnStatus IDENTIFIER_REJECTED = new MqttConnStatus(2);
  public static final MqttConnStatus SERVER_UNAVAILABLE = new MqttConnStatus(3);
  public static final MqttConnStatus BAD_USERNAME_OR_PASSWORD = new MqttConnStatus(4);
  public static final MqttConnStatus NOT_AUTHORIZED = new MqttConnStatus(5);

  public static MqttConnStatus create(int code) {
    switch (code) {
      case 0: return MqttConnStatus.ACCEPTED;
      case 1: return MqttConnStatus.UNACCEPTABLE_PROTOCOL_VERSION;
      case 2: return MqttConnStatus.IDENTIFIER_REJECTED;
      case 3: return MqttConnStatus.SERVER_UNAVAILABLE;
      case 4: return MqttConnStatus.BAD_USERNAME_OR_PASSWORD;
      case 5: return MqttConnStatus.NOT_AUTHORIZED;
      default: return new MqttConnStatus(code);
    }
  }

}
