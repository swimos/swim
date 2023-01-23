// Copyright 2015-2023 Swim.inc
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

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.structure.Data;

final class MqttConnectPacketDecoder extends Decoder<MqttConnectPacket> {

  final MqttDecoder mqtt;
  final int packetFlags;
  final Decoder<String> protocolNameDecoder;
  final int protocolLevel;
  final int connectFlags;
  final int keepAlive;
  final Decoder<String> clientIdDecoder;
  final Decoder<String> willTopicDecoder;
  final Decoder<Data> willMessageDecoder;
  final Decoder<String> usernameDecoder;
  final Decoder<Data> passwordDecoder;
  final int remaining;
  final int step;

  MqttConnectPacketDecoder(MqttDecoder mqtt, int packetFlags, Decoder<String> protocolNameDecoder,
                           int protocolLevel, int connectFlags, int keepAlive,
                           Decoder<String> clientIdDecoder, Decoder<String> willTopicDecoder,
                           Decoder<Data> willMessageDecoder, Decoder<String> usernameDecoder,
                           Decoder<Data> passwordDecoder, int remaining, int step) {
    this.mqtt = mqtt;
    this.packetFlags = packetFlags;
    this.remaining = remaining;
    this.protocolNameDecoder = protocolNameDecoder;
    this.protocolLevel = protocolLevel;
    this.connectFlags = connectFlags;
    this.keepAlive = keepAlive;
    this.clientIdDecoder = clientIdDecoder;
    this.willTopicDecoder = willTopicDecoder;
    this.willMessageDecoder = willMessageDecoder;
    this.usernameDecoder = usernameDecoder;
    this.passwordDecoder = passwordDecoder;
    this.step = step;
  }

  MqttConnectPacketDecoder(MqttDecoder mqtt) {
    this(mqtt, 0, null, 0, 0, 0, null, null, null, null, null, 0, 1);
  }

  @Override
  public Decoder<MqttConnectPacket> feed(InputBuffer input) {
    return MqttConnectPacketDecoder.decode(input, this.mqtt, this.packetFlags, this.protocolNameDecoder,
                                           this.protocolLevel, this.connectFlags, this.keepAlive,
                                           this.clientIdDecoder, this.willTopicDecoder, this.willMessageDecoder,
                                           this.usernameDecoder, this.passwordDecoder, this.remaining, this.step);
  }

  static Decoder<MqttConnectPacket> decode(InputBuffer input, MqttDecoder mqtt, int packetFlags,
                                           Decoder<String> protocolNameDecoder, int protocolLevel,
                                           int connectFlags, int keepAlive, Decoder<String> clientIdDecoder,
                                           Decoder<String> willTopicDecoder, Decoder<Data> willMessageDecoder,
                                           Decoder<String> usernameDecoder, Decoder<Data> passwordDecoder,
                                           int remaining, int step) {
    if (step == 1 && input.isCont()) {
      packetFlags = input.head() & 0x0f;
      input = input.step();
      step = 2;
    }
    while (step >= 2 && step <= 5 && input.isCont()) {
      final int b = input.head();
      input = input.step();
      remaining |= (b & 0x7f) << (7 * (step - 2));
      if ((b & 0x80) == 0) {
        step = 6;
        break;
      } else if (step < 5) {
        step += 1;
      } else {
        return Decoder.error(new MqttException("packet length too long"));
      }
    }
    if (step == 6) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (remaining < inputRemaining) {
        input = input.limit(inputStart + remaining);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(remaining > inputRemaining);
      if (protocolNameDecoder == null) {
        protocolNameDecoder = mqtt.decodeString(input);
      } else {
        protocolNameDecoder = protocolNameDecoder.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (protocolNameDecoder.isDone()) {
        step = 7;
      } else if (protocolNameDecoder.isError()) {
        return protocolNameDecoder.asError();
      }
    }
    if (step == 7 && remaining > 0 && input.isCont()) {
      protocolLevel = input.head();
      input = input.step();
      remaining -= 1;
      step = 8;
    }
    if (step == 8 && remaining > 0 && input.isCont()) {
      connectFlags = input.head();
      input = input.step();
      remaining -= 1;
      step = 9;
    }
    if (step == 9 && remaining > 0 && input.isCont()) {
      keepAlive = input.head() << 8;
      input = input.step();
      remaining -= 1;
      step = 10;
    }
    if (step == 10 && remaining > 0 && input.isCont()) {
      keepAlive |= input.head();
      input = input.step();
      remaining -= 1;
      step = 11;
    }
    if (step == 11) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (remaining < inputRemaining) {
        input = input.limit(inputStart + remaining);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(remaining > inputRemaining);
      if (clientIdDecoder == null) {
        clientIdDecoder = mqtt.decodeString(input);
      } else {
        clientIdDecoder = clientIdDecoder.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (clientIdDecoder.isDone()) {
        if ((connectFlags & MqttConnectPacket.WILL_FLAG) != 0) {
          step = 12;
        } else if ((connectFlags & MqttConnectPacket.USERNAME_FLAG) != 0) {
          step = 14;
        } else if ((connectFlags & MqttConnectPacket.PASSWORD_FLAG) != 0) {
          step = 15;
        } else {
          step = 16;
        }
      } else if (clientIdDecoder.isError()) {
        return clientIdDecoder.asError();
      }
    }
    if (step == 12) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (remaining < inputRemaining) {
        input = input.limit(inputStart + remaining);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(remaining > inputRemaining);
      if (willTopicDecoder == null) {
        willTopicDecoder = mqtt.decodeString(input);
      } else {
        willTopicDecoder = willTopicDecoder.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (willTopicDecoder.isDone()) {
        step = 13;
      } else if (willTopicDecoder.isError()) {
        return willTopicDecoder.asError();
      }
    }
    if (step == 13) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (remaining < inputRemaining) {
        input = input.limit(inputStart + remaining);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(remaining > inputRemaining);
      if (willMessageDecoder == null) {
        willMessageDecoder = mqtt.decodeData(input);
      } else {
        willMessageDecoder = willMessageDecoder.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (willMessageDecoder.isDone()) {
        if ((connectFlags & MqttConnectPacket.USERNAME_FLAG) != 0) {
          step = 14;
        } else if ((connectFlags & MqttConnectPacket.PASSWORD_FLAG) != 0) {
          step = 15;
        } else {
          step = 16;
        }
      } else if (willMessageDecoder.isError()) {
        return willMessageDecoder.asError();
      }
    }
    if (step == 14) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (remaining < inputRemaining) {
        input = input.limit(inputStart + remaining);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(remaining > inputRemaining);
      if (usernameDecoder == null) {
        usernameDecoder = mqtt.decodeString(input);
      } else {
        usernameDecoder = usernameDecoder.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (usernameDecoder.isDone()) {
        if ((connectFlags & MqttConnectPacket.PASSWORD_FLAG) != 0) {
          step = 15;
        } else {
          step = 16;
        }
      } else if (usernameDecoder.isError()) {
        return usernameDecoder.asError();
      }
    }
    if (step == 15) {
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (remaining < inputRemaining) {
        input = input.limit(inputStart + remaining);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(remaining > inputRemaining);
      if (passwordDecoder == null) {
        passwordDecoder = mqtt.decodeData(input);
      } else {
        passwordDecoder = passwordDecoder.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (passwordDecoder.isDone()) {
        step = 16;
      } else if (passwordDecoder.isError()) {
        return passwordDecoder.asError();
      }
    }
    if (step == 16 && remaining == 0) {
      return Decoder.done(mqtt.connectPacket(packetFlags, protocolNameDecoder.bind(),
                                             protocolLevel, connectFlags, keepAlive,
                                             clientIdDecoder != null ? clientIdDecoder.bind() : null,
                                             willTopicDecoder != null ? willTopicDecoder.bind() : null,
                                             willMessageDecoder != null ? willMessageDecoder.bind() : null,
                                             usernameDecoder != null ? usernameDecoder.bind() : null,
                                             passwordDecoder != null ? passwordDecoder.bind() : null));
    }
    if (remaining < 0) {
      return Decoder.error(new MqttException("packet length too short"));
    } else if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new MqttConnectPacketDecoder(mqtt, packetFlags, protocolNameDecoder, protocolLevel,
                                        connectFlags, keepAlive, clientIdDecoder, willTopicDecoder,
                                        willMessageDecoder, usernameDecoder, passwordDecoder, remaining, step);
  }

  static Decoder<MqttConnectPacket> decode(InputBuffer input, MqttDecoder mqtt) {
    return MqttConnectPacketDecoder.decode(input, mqtt, 0, null, 0, 0, 0,
                                           null, null, null, null, null, 0, 1);
  }

}
