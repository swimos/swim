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

public final class MqttSubStatus implements Debug {
  public final int code;

  MqttSubStatus(int code) {
    this.code = code;
  }

  public boolean isSuccess() {
    return this.code != 0x80;
  }

  public boolean isAtMostOnce() {
    return this.code == 0x00;
  }

  public boolean isAtLeastOnce() {
    return this.code == 0x01;
  }

  public boolean isExactlyOnce() {
    return this.code == 0x02;
  }

  public boolean isFailure() {
    return this.code == 0x80;
  }

  public MqttQoS maxQoS() {
    return MqttQoS.from(this.code & MAX_QOS_MASK);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttSubStatus) {
      final MqttSubStatus that = (MqttSubStatus) other;
      return this.code == that.code;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MqttSubStatus.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.code));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MqttSubStatus").write('.');
    switch (code) {
      case 0x00: output.write("AT_MOST_ONCE"); break;
      case 0x01: output.write("AT_LEAST_ONCE"); break;
      case 0x02: output.write("EXACTLY_ONCE"); break;
      case 0x80: output.write("FAILURE"); break;
      default: output.write("from").write('(').debug(this.code).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int MAX_QOS_MASK = 0x3;

  private static int hashSeed;

  public static final MqttSubStatus AT_MOST_ONCE = new MqttSubStatus(0x00);
  public static final MqttSubStatus AT_LEAST_ONCE = new MqttSubStatus(0x01);
  public static final MqttSubStatus EXACTLY_ONCE = new MqttSubStatus(0x02);
  public static final MqttSubStatus FAILURE = new MqttSubStatus(0x80);

  public static MqttSubStatus from(int code) {
    switch (code) {
      case 0: return AT_MOST_ONCE;
      case 1: return AT_LEAST_ONCE;
      case 2: return EXACTLY_ONCE;
      case 3: return FAILURE;
      default: return new MqttSubStatus(code);
    }
  }
}
