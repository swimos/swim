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
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;

final class MqttConnectPacketEncoder extends Encoder<Object, MqttConnectPacket> {

  final MqttEncoder mqtt;
  final MqttConnectPacket packet;
  final Encoder<?, ?> part;
  final int length;
  final int remaining;
  final int step;

  MqttConnectPacketEncoder(MqttEncoder mqtt, MqttConnectPacket packet, Encoder<?, ?> part,
                           int length, int remaining, int step) {
    this.mqtt = mqtt;
    this.packet = packet;
    this.part = part;
    this.length = length;
    this.remaining = remaining;
    this.step = step;
  }

  MqttConnectPacketEncoder(MqttEncoder mqtt, MqttConnectPacket packet) {
    this(mqtt, packet, null, 0, 0, 1);
  }

  @Override
  public Encoder<Object, MqttConnectPacket> pull(OutputBuffer<?> output) {
    return MqttConnectPacketEncoder.encode(output, this.mqtt, this.packet, this.part,
                                           this.length, this.remaining, this.step);
  }

  static Encoder<Object, MqttConnectPacket> encode(OutputBuffer<?> output, MqttEncoder mqtt,
                                                   MqttConnectPacket packet, Encoder<?, ?> part,
                                                   int length, int remaining, int step) {
    if (step == 1 && output.isCont()) {
      length = packet.variableHeaderSize(mqtt);
      remaining = length;
      output = output.write(packet.packetType() << 4 | packet.packetFlags & 0x0f);
      step = 2;
    }
    while (step >= 2 && step <= 5 && output.isCont()) {
      int b = length & 0x7f;
      length = length >>> 7;
      if (length > 0) {
        b |= 0x80;
      }
      output = output.write(b);
      if (length == 0) {
        step = 6;
        break;
      } else if (step < 5) {
        step += 1;
      } else {
        return Encoder.error(new MqttException("packet length too long: " + remaining));
      }
    }
    if (step == 6) {
      final int outputStart = output.index();
      final int outputLimit = output.limit();
      final int outputRemaining = outputLimit - outputStart;
      if (remaining < outputRemaining) {
        output = output.limit(outputStart + remaining);
      }
      final boolean outputPart = output.isPart();
      output = output.isPart(remaining > outputRemaining);
      if (part == null) {
        part = mqtt.encodeString(output, packet.protocolName);
      } else {
        part = part.pull(output);
      }
      output = output.limit(outputLimit).isPart(outputPart);
      remaining -= output.index() - outputStart;
      if (part.isDone()) {
        part = null;
        step = 7;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 7 && remaining > 0 && output.isCont()) {
      output = output.write(packet.protocolLevel);
      remaining -= 1;
      step = 8;
    }
    if (step == 8 && remaining > 0 && output.isCont()) {
      output = output.write(packet.connectFlags);
      remaining -= 1;
      step = 9;
    }
    if (step == 9 && remaining > 0 && output.isCont()) {
      output = output.write(packet.keepAlive >>> 8);
      remaining -= 1;
      step = 10;
    }
    if (step == 10 && remaining > 0 && output.isCont()) {
      output = output.write(packet.keepAlive);
      remaining -= 1;
      step = 11;
    }
    if (step == 11) {
      final int outputStart = output.index();
      final int outputLimit = output.limit();
      final int outputRemaining = outputLimit - outputStart;
      if (remaining < outputRemaining) {
        output = output.limit(outputStart + remaining);
      }
      final boolean outputPart = output.isPart();
      output = output.isPart(remaining > outputRemaining);
      if (part == null) {
        part = mqtt.encodeString(output, packet.clientId);
      } else {
        part = part.pull(output);
      }
      output = output.limit(outputLimit).isPart(outputPart);
      remaining -= output.index() - outputStart;
      if (part.isDone()) {
        part = null;
        if ((packet.connectFlags & MqttConnectPacket.WILL_FLAG) != 0) {
          step = 12;
        } else if ((packet.connectFlags & MqttConnectPacket.USERNAME_FLAG) != 0) {
          step = 14;
        } else if ((packet.connectFlags & MqttConnectPacket.PASSWORD_FLAG) != 0) {
          step = 15;
        } else {
          step = 16;
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 12) {
      final int outputStart = output.index();
      final int outputLimit = output.limit();
      final int outputRemaining = outputLimit - outputStart;
      if (remaining < outputRemaining) {
        output = output.limit(outputStart + remaining);
      }
      final boolean outputPart = output.isPart();
      output = output.isPart(remaining > outputRemaining);
      if (part == null) {
        part = mqtt.encodeString(output, packet.willTopic);
      } else {
        part = part.pull(output);
      }
      output = output.limit(outputLimit).isPart(outputPart);
      remaining -= output.index() - outputStart;
      if (part.isDone()) {
        part = null;
        step = 13;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 13) {
      final int outputStart = output.index();
      final int outputLimit = output.limit();
      final int outputRemaining = outputLimit - outputStart;
      if (remaining < outputRemaining) {
        output = output.limit(outputStart + remaining);
      }
      final boolean outputPart = output.isPart();
      output = output.isPart(remaining > outputRemaining);
      if (part == null) {
        part = mqtt.encodeData(output, packet.willMessage);
      } else {
        part = part.pull(output);
      }
      output = output.limit(outputLimit).isPart(outputPart);
      remaining -= output.index() - outputStart;
      if (part.isDone()) {
        part = null;
        if ((packet.connectFlags & MqttConnectPacket.USERNAME_FLAG) != 0) {
          step = 14;
        } else if ((packet.connectFlags & MqttConnectPacket.PASSWORD_FLAG) != 0) {
          step = 15;
        } else {
          step = 16;
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 14) {
      final int outputStart = output.index();
      final int outputLimit = output.limit();
      final int outputRemaining = outputLimit - outputStart;
      if (remaining < outputRemaining) {
        output = output.limit(outputStart + remaining);
      }
      final boolean outputPart = output.isPart();
      output = output.isPart(remaining > outputRemaining);
      if (part == null) {
        part = mqtt.encodeString(output, packet.username);
      } else {
        part = part.pull(output);
      }
      output = output.limit(outputLimit).isPart(outputPart);
      remaining -= output.index() - outputStart;
      if (part.isDone()) {
        part = null;
        if ((packet.connectFlags & MqttConnectPacket.PASSWORD_FLAG) != 0) {
          step = 15;
        } else {
          step = 16;
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 15) {
      final int outputStart = output.index();
      final int outputLimit = output.limit();
      final int outputRemaining = outputLimit - outputStart;
      if (remaining < outputRemaining) {
        output = output.limit(outputStart + remaining);
      }
      final boolean outputPart = output.isPart();
      output = output.isPart(remaining > outputRemaining);
      if (part == null) {
        part = mqtt.encodeData(output, packet.password);
      } else {
        part = part.pull(output);
      }
      output = output.limit(outputLimit).isPart(outputPart);
      remaining -= output.index() - outputStart;
      if (part.isDone()) {
        part = null;
        step = 16;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 16 && remaining == 0) {
      return Encoder.done(packet);
    }
    if (remaining < 0) {
      return Encoder.error(new MqttException("packet length too short"));
    } else if (output.isDone()) {
      return Encoder.error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return Encoder.error(output.trap());
    }
    return new MqttConnectPacketEncoder(mqtt, packet, part, length, remaining, step);
  }

  static Encoder<Object, MqttConnectPacket> encode(OutputBuffer<?> output, MqttEncoder mqtt,
                                                   MqttConnectPacket packet) {
    return MqttConnectPacketEncoder.encode(output, mqtt, packet, null, 0, 0, 1);
  }

}
