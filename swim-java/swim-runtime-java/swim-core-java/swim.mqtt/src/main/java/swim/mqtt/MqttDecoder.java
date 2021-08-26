// Copyright 2015-2021 Swim Inc.
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
import swim.codec.InputBuffer;
import swim.collections.FingerTrieSeq;
import swim.structure.Data;

public class MqttDecoder {

  public MqttConnect connect(int packetFlags, String protocolName, int protocolLevel,
                             int connectFlags, int keepAlive, String clientId, String willTopic,
                             Data willMessage, String username, Data password) {
    return MqttConnect.create(packetFlags, protocolName, protocolLevel,
                              connectFlags, keepAlive, clientId, willTopic,
                              willMessage, username, password);
  }

  public MqttConnAck connAck(int packetFlags, int connectFlags, int connectCode) {
    return MqttConnAck.create(packetFlags, connectFlags, connectCode);
  }

  public <T> MqttPublish<T> publish(int packetFlags, String topicName,
                                    int packetId, MqttEntity<T> payload) {
    return MqttPublish.create(packetFlags, topicName, packetId, payload);
  }

  public MqttPubAck pubAck(int packetFlags, int packetId) {
    return MqttPubAck.create(packetFlags, packetId);
  }

  public MqttPubRec pubRec(int packetFlags, int packetId) {
    return MqttPubRec.create(packetFlags, packetId);
  }

  public MqttPubRel pubRel(int packetFlags, int packetId) {
    return MqttPubRel.create(packetFlags, packetId);
  }

  public MqttPubComp pubComp(int packetFlags, int packetId) {
    return MqttPubComp.create(packetFlags, packetId);
  }

  public MqttSubscribe subscribe(int packetFlags, int packetId,
                                 FingerTrieSeq<MqttSubscription> subscriptions) {
    return MqttSubscribe.create(packetFlags, packetId, subscriptions);
  }

  public MqttSubAck subAck(int packetFlags, int packetId,
                           FingerTrieSeq<MqttSubStatus> subscriptions) {
    return MqttSubAck.create(packetFlags, packetId, subscriptions);
  }

  public MqttUnsubscribe unsubscribe(int packetFlags, int packetId,
                                     FingerTrieSeq<String> topicNames) {
    return MqttUnsubscribe.create(packetFlags, packetId, topicNames);
  }

  public MqttUnsubAck unsubAck(int packetFlags, int packetId) {
    return MqttUnsubAck.create(packetFlags, packetId);
  }

  public MqttPingReq pingReq(int packetFlags) {
    return MqttPingReq.create(packetFlags);
  }

  public MqttPingResp pingResp(int packetFlags) {
    return MqttPingResp.create(packetFlags);
  }

  public MqttDisconnect disconnect(int packetFlags) {
    return MqttDisconnect.create(packetFlags);
  }

  public MqttSubscription subscription(String topicName, int flags) {
    return MqttSubscription.create(topicName, flags);
  }

  public MqttSubStatus subStatus(int code) {
    return MqttSubStatus.create(code);
  }

  public <T> Decoder<MqttPacket<T>> packetDecoder(Decoder<T> content) {
    return new MqttPacketDecoder<T>(this, content);
  }

  public <T> Decoder<MqttPacket<T>> decodePacket(Decoder<T> content, InputBuffer input) {
    return MqttPacketDecoder.decode(input, this, content);
  }

  @SuppressWarnings("unchecked")
  public <T> Decoder<MqttPacket<T>> decodePacketType(int packetType, Decoder<T> content, InputBuffer input) {
    final Decoder<?> decoder;
    switch (packetType) {
      case 1: decoder = this.decodeConnect(input); break;
      case 2: decoder = this.decodeConnAck(input); break;
      case 3: decoder = this.decodePublish(content, input); break;
      case 4: decoder = this.decodePubAck(input); break;
      case 5: decoder = this.decodePubRec(input); break;
      case 6: decoder = this.decodePubRel(input); break;
      case 7: decoder = this.decodePubComp(input); break;
      case 8: decoder = this.decodeSubscribe(input); break;
      case 9: decoder = this.decodeSubAck(input); break;
      case 10: decoder = this.decodeUnsubscribe(input); break;
      case 11: decoder = this.decodeUnsubAck(input); break;
      case 12: decoder = this.decodePingReq(input); break;
      case 13: decoder = this.decodePingResp(input); break;
      case 14: decoder = this.decodeDisconnect(input); break;
      default: return Decoder.error(new MqttException("reserved packet type: " + packetType));
    }
    return (Decoder<MqttPacket<T>>) decoder;
  }

  public Decoder<MqttConnect> decodeConnect(InputBuffer input) {
    return MqttConnectDecoder.decode(input, this);
  }

  public Decoder<MqttConnAck> decodeConnAck(InputBuffer input) {
    return MqttConnAckDecoder.decode(input, this);
  }

  public <T> Decoder<MqttPublish<T>> decodePublish(Decoder<T> content, InputBuffer input) {
    return MqttPublishDecoder.decode(input, this, content);
  }

  public Decoder<MqttPubAck> decodePubAck(InputBuffer input) {
    return MqttPubAckDecoder.decode(input, this);
  }

  public Decoder<MqttPubRec> decodePubRec(InputBuffer input) {
    return MqttPubRecDecoder.decode(input, this);
  }

  public Decoder<MqttPubRel> decodePubRel(InputBuffer input) {
    return MqttPubRelDecoder.decode(input, this);
  }

  public Decoder<MqttPubComp> decodePubComp(InputBuffer input) {
    return MqttPubCompDecoder.decode(input, this);
  }

  public Decoder<MqttSubscribe> decodeSubscribe(InputBuffer input) {
    return MqttSubscribeDecoder.decode(input, this);
  }

  public Decoder<MqttSubAck> decodeSubAck(InputBuffer input) {
    return MqttSubAckDecoder.decode(input, this);
  }

  public Decoder<MqttUnsubscribe> decodeUnsubscribe(InputBuffer input) {
    return MqttUnsubscribeDecoder.decode(input, this);
  }

  public Decoder<MqttUnsubAck> decodeUnsubAck(InputBuffer input) {
    return MqttUnsubAckDecoder.decode(input, this);
  }

  public Decoder<MqttPingReq> decodePingReq(InputBuffer input) {
    return MqttPingReqDecoder.decode(input, this);
  }

  public Decoder<MqttPingResp> decodePingResp(InputBuffer input) {
    return MqttPingRespDecoder.decode(input, this);
  }

  public Decoder<MqttDisconnect> decodeDisconnect(InputBuffer input) {
    return MqttDisconnectDecoder.decode(input, this);
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
