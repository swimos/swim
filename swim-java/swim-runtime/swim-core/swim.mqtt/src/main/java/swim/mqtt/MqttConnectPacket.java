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
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.structure.Data;
import swim.util.Murmur3;

public final class MqttConnectPacket extends MqttPacket<Object> implements Debug {

  final int packetFlags;
  final String protocolName;
  final int protocolLevel;
  final int connectFlags;
  final int keepAlive;
  final String clientId;
  final String willTopic;
  final Data willMessage;
  final String username;
  final Data password;

  MqttConnectPacket(int packetFlags, String protocolName, int protocolLevel, int connectFlags,
                    int keepAlive, String clientId, String willTopic, Data willMessage,
                    String username, Data password) {
    this.packetFlags = packetFlags;
    this.protocolName = protocolName;
    this.protocolLevel = protocolLevel;
    this.connectFlags = connectFlags;
    this.keepAlive = keepAlive;
    this.clientId = clientId;
    this.willTopic = willTopic;
    this.willMessage = willMessage != null ? willMessage.commit() : null;
    this.username = username;
    this.password = password != null ? password.commit() : null;
  }

  @Override
  public int packetType() {
    return 1;
  }

  @Override
  public int packetFlags() {
    return this.packetFlags;
  }

  public MqttConnectPacket packetFlags(int packetFlags) {
    return new MqttConnectPacket(packetFlags, this.protocolName, this.protocolLevel,
                                 this.connectFlags, this.keepAlive, this.clientId,
                                 this.willTopic, this.willMessage, this.username, this.password);
  }

  public String protocolName() {
    return this.protocolName;
  }

  public MqttConnectPacket protocolName(String protocolName) {
    return new MqttConnectPacket(this.packetFlags, protocolName, this.protocolLevel,
                                 this.connectFlags, this.keepAlive, this.clientId,
                                 this.willTopic, this.willMessage, this.username, this.password);
  }

  public int protocolLevel() {
    return this.protocolLevel;
  }

  public MqttConnectPacket protocolLevel(int protocolLevel) {
    return new MqttConnectPacket(this.packetFlags, this.protocolName, protocolLevel,
                                 this.connectFlags, this.keepAlive, this.clientId,
                                 this.willTopic, this.willMessage, this.username, this.password);
  }

  public int connectFlags() {
    return this.connectFlags;
  }

  public int keepAlive() {
    return this.keepAlive;
  }

  public MqttConnectPacket keepAlive(int keepAlive) {
    return new MqttConnectPacket(this.packetFlags, this.protocolName, this.protocolLevel,
                                 this.connectFlags, keepAlive, this.clientId, this.willTopic,
                                 this.willMessage, this.username, this.password);
  }

  public String clientId() {
    return this.clientId;
  }

  public MqttConnectPacket clientId(String clientId) {
    return new MqttConnectPacket(this.packetFlags, this.protocolName, this.protocolLevel,
                                 this.connectFlags, this.keepAlive, clientId, this.willTopic,
                                 this.willMessage, this.username, this.password);
  }

  public boolean cleanSession() {
    return (this.connectFlags & MqttConnectPacket.CLEAN_SESSION_FLAG) != 0;
  }

  public MqttConnectPacket cleanSession(boolean cleanSession) {
    final int connectFlags = cleanSession
                           ? this.connectFlags | MqttConnectPacket.CLEAN_SESSION_FLAG
                           : this.connectFlags & ~MqttConnectPacket.CLEAN_SESSION_FLAG;
    return new MqttConnectPacket(this.packetFlags, this.protocolName, this.protocolLevel,
                                 connectFlags, this.keepAlive, this.clientId, this.willTopic,
                                 this.willMessage, this.username, this.password);
  }

  public String willTopic() {
    return this.willTopic;
  }

  public MqttConnectPacket willTopic(String willTopic) {
    final int connectFlags = willTopic != null && this.willMessage != null
                           ? this.connectFlags | MqttConnectPacket.WILL_FLAG
                           : this.connectFlags & ~MqttConnectPacket.WILL_FLAG;
    return new MqttConnectPacket(this.packetFlags, this.protocolName, this.protocolLevel,
                                 connectFlags, this.keepAlive, this.clientId, willTopic,
                                 this.willMessage, this.username, this.password);
  }

  public Data willMessage() {
    return this.willMessage;
  }

  public MqttConnectPacket willMessage(Data willMessage) {
    final int connectFlags = this.willTopic != null && willMessage != null
                           ? this.connectFlags | MqttConnectPacket.WILL_FLAG
                           : this.connectFlags & ~MqttConnectPacket.WILL_FLAG;
    return new MqttConnectPacket(this.packetFlags, this.protocolName, this.protocolLevel,
                                 connectFlags, this.keepAlive, this.clientId, this.willTopic,
                                 willMessage != null ? willMessage.commit() : null,
                                 this.username, this.password);
  }

  public MqttQoS willQoS() {
    return MqttQoS.from((this.connectFlags & MqttConnectPacket.WILL_QOS_MASK) >>> MqttConnectPacket.WILL_QOS_SHIFT);
  }

  public MqttConnectPacket willQoS(MqttQoS willQoS) {
    final int connectFlags = this.connectFlags & ~MqttConnectPacket.WILL_QOS_MASK
                           | (willQoS.code << MqttConnectPacket.WILL_QOS_SHIFT) & MqttConnectPacket.WILL_QOS_MASK;
    return new MqttConnectPacket(this.packetFlags, this.protocolName, this.protocolLevel,
                                 connectFlags, this.keepAlive, this.clientId, this.willTopic,
                                 this.willMessage, this.username, this.password);
  }

  public boolean willRetain() {
    return (this.connectFlags & MqttConnectPacket.WILL_RETAIN_FLAG) != 0;
  }

  public MqttConnectPacket willRetain(boolean willRetain) {
    final int connectFlags = willRetain
                           ? this.connectFlags | MqttConnectPacket.WILL_RETAIN_FLAG
                           : this.connectFlags & ~MqttConnectPacket.WILL_RETAIN_FLAG;
    return new MqttConnectPacket(this.packetFlags, this.protocolName, this.protocolLevel,
                                 connectFlags, this.keepAlive, this.clientId, this.willTopic,
                                 this.willMessage, this.username, this.password);
  }

  public String username() {
    return this.username;
  }

  public MqttConnectPacket username(String username) {
    final int connectFlags = username != null
                           ? this.connectFlags | MqttConnectPacket.USERNAME_FLAG
                           : this.connectFlags & ~MqttConnectPacket.USERNAME_FLAG;
    return new MqttConnectPacket(this.packetFlags, this.protocolName, this.protocolLevel,
                                 connectFlags, this.keepAlive, this.clientId, this.willTopic,
                                 this.willMessage, username, this.password);
  }

  public Data password() {
    return this.password;
  }

  public MqttConnectPacket password(Data password) {
    final int connectFlags = password != null
                           ? this.connectFlags | MqttConnectPacket.PASSWORD_FLAG
                           : this.connectFlags & ~MqttConnectPacket.PASSWORD_FLAG;
    return new MqttConnectPacket(this.packetFlags, this.protocolName, this.protocolLevel,
                                 connectFlags, this.keepAlive, this.clientId, this.willTopic,
                                 this.willMessage, this.username,
                                 password != null ? password.commit() : null);
  }

  @Override
  int variableHeaderSize(MqttEncoder mqtt) {
    int size = mqtt.sizeOfString(this.protocolName) + 4;
    size += mqtt.sizeOfString(this.clientId);
    if ((this.connectFlags & MqttConnectPacket.WILL_FLAG) != 0) {
      size += mqtt.sizeOfString(this.willTopic);
      size += mqtt.sizeOfData(this.willMessage);
    }
    if ((this.connectFlags & MqttConnectPacket.USERNAME_FLAG) != 0) {
      size += mqtt.sizeOfString(this.username);
    }
    if ((this.connectFlags & MqttConnectPacket.PASSWORD_FLAG) != 0) {
      size += mqtt.sizeOfData(this.password);
    }
    return size;
  }

  @Override
  public Encoder<?, MqttConnectPacket> mqttEncoder(MqttEncoder mqtt) {
    return mqtt.connectPacketEncoder(this);
  }

  @Override
  public Encoder<?, MqttConnectPacket> encodeMqtt(OutputBuffer<?> output, MqttEncoder mqtt) {
    return mqtt.encodeConnectPacket(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MqttConnectPacket) {
      final MqttConnectPacket that = (MqttConnectPacket) other;
      return this.packetFlags == that.packetFlags && this.protocolName.equals(that.protocolName)
          && this.protocolLevel == that.protocolLevel && this.connectFlags == that.connectFlags
          && this.keepAlive == that.keepAlive && this.clientId.equals(that.clientId)
          && (this.willTopic == null ? that.willTopic == null : this.willTopic.equals(that.willTopic))
          && (this.willMessage == null ? that.willMessage == null : this.willMessage.equals(that.willMessage))
          && (this.username == null ? that.username == null : this.username.equals(that.username))
          && (this.password == null ? that.password == null : this.password.equals(that.password));
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MqttConnectPacket.hashSeed == 0) {
      MqttConnectPacket.hashSeed = Murmur3.seed(MqttConnectPacket.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(MqttConnectPacket.hashSeed,
        this.packetFlags), this.protocolName.hashCode()), this.protocolLevel),
        this.connectFlags), this.keepAlive), this.clientId.hashCode()),
        Murmur3.hash(this.willTopic)), Murmur3.hash(this.willMessage)),
        Murmur3.hash(this.username)), Murmur3.hash(this.password)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MqttConnectPacket").write('.').write("create").write('(')
                   .debug(this.clientId).write(')');
    if (this.packetFlags != 0) {
      output = output.write('.').write("packetFlags").write('(').debug(this.packetFlags).write(')');
    }
    if ("MQTT".equals(this.protocolName)) {
      output = output.write('.').write("protocolName").write('(').debug(this.protocolName).write(')');
    }
    if (this.protocolLevel != 4) {
      output = output.write('.').write("protocolLevel").write('(').debug(this.protocolLevel).write(')');
    }
    if (this.keepAlive != 0) {
      output = output.write('.').write("keepAlive").write('(').debug(this.keepAlive).write(')');
    }
    if (this.cleanSession()) {
      output = output.write('.').write("cleanSession").write('(').write("true").write(')');
    }
    if (this.willTopic != null) {
      output = output.write('.').write("willTopic").write('(').debug(this.willTopic).write(')');
    }
    if (this.willMessage != null) {
      output = output.write('.').write("willMessage").write('(').debug(this.willMessage).write(')');
    }
    if (this.willQoS().code != 0) {
      output = output.write('.').write("willQoS").write('(').debug(this.willQoS()).write(')');
    }
    if (this.willRetain()) {
      output = output.write('.').write("willRetain").write('(').write("true").write(')');
    }
    if (this.username != null) {
      output = output.write('.').write("username").write('(').debug(this.username).write(')');
    }
    if (this.password != null) {
      output = output.write('.').write("password").write('(').debug(this.password).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int CLEAN_SESSION_FLAG = 0x02;
  static final int WILL_FLAG = 0x04;
  static final int WILL_QOS_MASK = 0x18;
  static final int WILL_QOS_SHIFT = 3;
  static final int WILL_RETAIN_FLAG = 0x20;
  static final int PASSWORD_FLAG = 0x40;
  static final int USERNAME_FLAG = 0x80;

  public static MqttConnectPacket create(int packetFlags, String protocolName, int protocolLevel,
                                         int connectFlags, int keepAlive, String clientId, String willTopic,
                                         Data willMessage, String username, Data password) {
    return new MqttConnectPacket(packetFlags, protocolName, protocolLevel, connectFlags,
                                 keepAlive, clientId, willTopic, willMessage, username, password);
  }

  public static MqttConnectPacket create(String clientId) {
    return new MqttConnectPacket(0, "MQTT", 4, MqttConnectPacket.CLEAN_SESSION_FLAG, 0, clientId, null, null, null, null);
  }

}
