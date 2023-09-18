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

import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.InputBuffer;
import swim.collections.FingerTrieSeq;
import swim.structure.Data;

public class MqttDecoder {

  public MqttDecoder() {
    // nop
  }

  public MqttConnectPacket connectPacket(int packetFlags, String protocolName, int protocolLevel,
                                         int connectFlags, int keepAlive, String clientId, String willTopic,
                                         Data willMessage, String username, Data password) {
    return MqttConnectPacket.create(packetFlags, protocolName, protocolLevel,
                                    connectFlags, keepAlive, clientId, willTopic,
                                    willMessage, username, password);
  }

  public MqttConnAckPacket connAckPacket(int packetFlags, int connectFlags, int connectCode) {
    return MqttConnAckPacket.create(packetFlags, connectFlags, connectCode);
  }

  public <T> MqttPublishPacket<T> publishPacket(int packetFlags, String topicName, int packetId, T payloadValue) {
    return MqttPublishPacket.create(packetFlags, topicName, packetId, payloadValue, Encoder.done(), 0);
  }

  public MqttPubAckPacket pubAckPacket(int packetFlags, int packetId) {
    return MqttPubAckPacket.create(packetFlags, packetId);
  }

  public MqttPubRecPacket pubRecPacket(int packetFlags, int packetId) {
    return MqttPubRecPacket.create(packetFlags, packetId);
  }

  public MqttPubRelPacket pubRelPacket(int packetFlags, int packetId) {
    return MqttPubRelPacket.create(packetFlags, packetId);
  }

  public MqttPubCompPacket pubCompPacket(int packetFlags, int packetId) {
    return MqttPubCompPacket.create(packetFlags, packetId);
  }

  public MqttSubscribePacket subscribePacket(int packetFlags, int packetId,
                                             FingerTrieSeq<MqttSubscription> subscriptions) {
    return MqttSubscribePacket.create(packetFlags, packetId, subscriptions);
  }

  public MqttSubAckPacket subAckPacket(int packetFlags, int packetId,
                                       FingerTrieSeq<MqttSubStatus> subscriptions) {
    return MqttSubAckPacket.create(packetFlags, packetId, subscriptions);
  }

  public MqttUnsubscribePacket unsubscribePacket(int packetFlags, int packetId,
                                                 FingerTrieSeq<String> topicNames) {
    return MqttUnsubscribePacket.create(packetFlags, packetId, topicNames);
  }

  public MqttUnsubAckPacket unsubAckPacket(int packetFlags, int packetId) {
    return MqttUnsubAckPacket.create(packetFlags, packetId);
  }

  public MqttPingReqPacket pingReqPacket(int packetFlags) {
    return MqttPingReqPacket.create(packetFlags);
  }

  public MqttPingRespPacket pingRespPacket(int packetFlags) {
    return MqttPingRespPacket.create(packetFlags);
  }

  public MqttDisconnectPacket disconnectPacket(int packetFlags) {
    return MqttDisconnectPacket.create(packetFlags);
  }

  public MqttSubscription subscription(String topicName, int flags) {
    return MqttSubscription.create(topicName, flags);
  }

  public MqttSubStatus subStatus(int code) {
    return MqttSubStatus.create(code);
  }

  public <T> Decoder<MqttPacket<T>> packetDecoder(Decoder<T> payloadDecoder) {
    return new MqttPacketDecoder<T>(this, payloadDecoder);
  }

  public <T> Decoder<MqttPacket<T>> decodePacket(InputBuffer input, Decoder<T> payloadDecoder) {
    return MqttPacketDecoder.decode(input, this, payloadDecoder);
  }

  @SuppressWarnings("unchecked")
  public <T> Decoder<MqttPacket<T>> decodePacketType(InputBuffer input, int packetType, Decoder<T> payloadDecoder) {
    final Decoder<?> decoder;
    switch (packetType) {
      case 1: decoder = this.decodeConnectPacket(input); break;
      case 2: decoder = this.decodeConnAckPacket(input); break;
      case 3: decoder = this.decodePublishPacket(input, payloadDecoder); break;
      case 4: decoder = this.decodePubAckPacket(input); break;
      case 5: decoder = this.decodePubRecPacket(input); break;
      case 6: decoder = this.decodePubRelPacket(input); break;
      case 7: decoder = this.decodePubCompPacket(input); break;
      case 8: decoder = this.decodeSubscribePacket(input); break;
      case 9: decoder = this.decodeSubAckPacket(input); break;
      case 10: decoder = this.decodeUnsubscribePacket(input); break;
      case 11: decoder = this.decodeUnsubAckPacket(input); break;
      case 12: decoder = this.decodePingReqPacket(input); break;
      case 13: decoder = this.decodePingRespPacket(input); break;
      case 14: decoder = this.decodeDisconnectPacket(input); break;
      default: return Decoder.error(new MqttException("reserved packet type: " + packetType));
    }
    return (Decoder<MqttPacket<T>>) decoder;
  }

  public Decoder<MqttConnectPacket> decodeConnectPacket(InputBuffer input) {
    return MqttConnectPacketDecoder.decode(input, this);
  }

  public Decoder<MqttConnAckPacket> decodeConnAckPacket(InputBuffer input) {
    return MqttConnAckPacketDecoder.decode(input, this);
  }

  public <T> Decoder<MqttPublishPacket<T>> decodePublishPacket(InputBuffer input, Decoder<T> payloadDecoder) {
    return MqttPublishPacketDecoder.decode(input, this, payloadDecoder);
  }

  public Decoder<MqttPubAckPacket> decodePubAckPacket(InputBuffer input) {
    return MqttPubAckPacketDecoder.decode(input, this);
  }

  public Decoder<MqttPubRecPacket> decodePubRecPacket(InputBuffer input) {
    return MqttPubRecPacketDecoder.decode(input, this);
  }

  public Decoder<MqttPubRelPacket> decodePubRelPacket(InputBuffer input) {
    return MqttPubRelPacketDecoder.decode(input, this);
  }

  public Decoder<MqttPubCompPacket> decodePubCompPacket(InputBuffer input) {
    return MqttPubCompPacketDecoder.decode(input, this);
  }

  public Decoder<MqttSubscribePacket> decodeSubscribePacket(InputBuffer input) {
    return MqttSubscribePacketDecoder.decode(input, this);
  }

  public Decoder<MqttSubAckPacket> decodeSubAckPacket(InputBuffer input) {
    return MqttSubAckPacketDecoder.decode(input, this);
  }

  public Decoder<MqttUnsubscribePacket> decodeUnsubscribePacket(InputBuffer input) {
    return MqttUnsubscribePacketDecoder.decode(input, this);
  }

  public Decoder<MqttUnsubAckPacket> decodeUnsubAckPacket(InputBuffer input) {
    return MqttUnsubAckPacketDecoder.decode(input, this);
  }

  public Decoder<MqttPingReqPacket> decodePingReqPacket(InputBuffer input) {
    return MqttPingReqPacketDecoder.decode(input, this);
  }

  public Decoder<MqttPingRespPacket> decodePingRespPacket(InputBuffer input) {
    return MqttPingRespPacketDecoder.decode(input, this);
  }

  public Decoder<MqttDisconnectPacket> decodeDisconnectPacket(InputBuffer input) {
    return MqttDisconnectPacketDecoder.decode(input, this);
  }

  public Decoder<MqttSubscription> subscriptionDecoder() {
    return new MqttSubscriptionDecoder(this);
  }

  public Decoder<MqttSubscription> decodeSubscription(InputBuffer input) {
    return MqttSubscriptionDecoder.decode(input, this);
  }

  public Decoder<String> stringDecoder() {
    return new MqttStringDecoder();
  }

  public Decoder<String> decodeString(InputBuffer input) {
    return MqttStringDecoder.decode(input);
  }

  public Decoder<Data> dataDecoder() {
    return new MqttDataDecoder();
  }

  public Decoder<Data> decodeData(InputBuffer input) {
    return MqttDataDecoder.decode(input);
  }

}
