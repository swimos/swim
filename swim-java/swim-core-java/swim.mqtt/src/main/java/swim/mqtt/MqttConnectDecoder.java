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

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.structure.Data;

final class MqttConnectDecoder extends Decoder<MqttConnect> {
  final MqttDecoder mqtt;
  final int packetFlags;
  final Decoder<String> protocolName;
  final int protocolLevel;
  final int connectFlags;
  final int keepAlive;
  final Decoder<String> clientId;
  final Decoder<String> willTopic;
  final Decoder<Data> willMessage;
  final Decoder<String> username;
  final Decoder<Data> password;
  final int remaining;
  final int step;

  MqttConnectDecoder(MqttDecoder mqtt, int packetFlags, Decoder<String> protocolName,
                     int protocolLevel, int connectFlags, int keepAlive, Decoder<String> clientId,
                     Decoder<String> willTopic, Decoder<Data> willMessage, Decoder<String> username,
                     Decoder<Data> password, int remaining, int step) {
    this.mqtt = mqtt;
    this.packetFlags = packetFlags;
    this.remaining = remaining;
    this.protocolName = protocolName;
    this.protocolLevel = protocolLevel;
    this.connectFlags = connectFlags;
    this.keepAlive = keepAlive;
    this.clientId = clientId;
    this.willTopic = willTopic;
    this.willMessage = willMessage;
    this.username = username;
    this.password = password;
    this.step = step;
  }

  MqttConnectDecoder(MqttDecoder mqtt) {
    this(mqtt, 0, null, 0, 0, 0, null, null, null, null, null, 0, 1);
  }

  @Override
  public Decoder<MqttConnect> feed(InputBuffer input) {
    return decode(input, this.mqtt, this.packetFlags, this.protocolName, this.protocolLevel,
                  this.connectFlags, this.keepAlive, this.clientId, this.willTopic,
                  this.willMessage, this.username, this.password, this.remaining, this.step);
  }

  static Decoder<MqttConnect> decode(InputBuffer input, MqttDecoder mqtt, int packetFlags,
                                     Decoder<String> protocolName, int protocolLevel,
                                     int connectFlags, int keepAlive, Decoder<String> clientId,
                                     Decoder<String> willTopic, Decoder<Data> willMessage,
                                     Decoder<String> username, Decoder<Data> password,
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
        return error(new MqttException("packet length too long"));
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
      if (protocolName == null) {
        protocolName = mqtt.decodeString(input);
      } else {
        protocolName = protocolName.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (protocolName.isDone()) {
        step = 7;
      } else if (protocolName.isError()) {
        return protocolName.asError();
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
      if (clientId == null) {
        clientId = mqtt.decodeString(input);
      } else {
        clientId = clientId.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (clientId.isDone()) {
        if ((connectFlags & MqttConnect.WILL_FLAG) != 0) {
          step = 12;
        } else if ((connectFlags & MqttConnect.USERNAME_FLAG) != 0) {
          step = 14;
        } else if ((connectFlags & MqttConnect.PASSWORD_FLAG) != 0) {
          step = 15;
        } else {
          step = 16;
        }
      } else if (clientId.isError()) {
        return clientId.asError();
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
      if (willTopic == null) {
        willTopic = mqtt.decodeString(input);
      } else {
        willTopic = willTopic.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (willTopic.isDone()) {
        step = 13;
      } else if (willTopic.isError()) {
        return willTopic.asError();
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
      if (willMessage == null) {
        willMessage = mqtt.decodeData(input);
      } else {
        willMessage = willMessage.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (willMessage.isDone()) {
        if ((connectFlags & MqttConnect.USERNAME_FLAG) != 0) {
          step = 14;
        } else if ((connectFlags & MqttConnect.PASSWORD_FLAG) != 0) {
          step = 15;
        } else {
          step = 16;
        }
      } else if (willMessage.isError()) {
        return willMessage.asError();
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
      if (username == null) {
        username = mqtt.decodeString(input);
      } else {
        username = username.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (username.isDone()) {
        if ((connectFlags & MqttConnect.PASSWORD_FLAG) != 0) {
          step = 15;
        } else {
          step = 16;
        }
      } else if (username.isError()) {
        return username.asError();
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
      if (password == null) {
        password = mqtt.decodeData(input);
      } else {
        password = password.feed(input);
      }
      input = input.limit(inputLimit).isPart(inputPart);
      remaining -= input.index() - inputStart;
      if (password.isDone()) {
        step = 16;
      } else if (password.isError()) {
        return password.asError();
      }
    }
    if (step == 16 && remaining == 0) {
      return done(mqtt.connect(packetFlags, protocolName.bind(),
                               protocolLevel, connectFlags, keepAlive,
                               clientId != null ? clientId.bind() : null,
                               willTopic != null ? willTopic.bind() : null,
                               willMessage != null ? willMessage.bind() : null,
                               username != null ? username.bind() : null,
                               password != null ? password.bind() : null));
    }
    if (remaining < 0) {
      return error(new MqttException("packet length too short"));
    } else if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new MqttConnectDecoder(mqtt, packetFlags, protocolName, protocolLevel,
                                  connectFlags, keepAlive, clientId, willTopic,
                                  willMessage, username, password, remaining, step);
  }

  static Decoder<MqttConnect> decode(InputBuffer input, MqttDecoder mqtt) {
    return decode(input, mqtt, 0, null, 0, 0, 0, null, null, null, null, null, 0, 1);
  }
}
