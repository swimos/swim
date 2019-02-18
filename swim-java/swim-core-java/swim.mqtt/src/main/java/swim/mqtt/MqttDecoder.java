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
import swim.codec.InputBuffer;
import swim.collections.FingerTrieSeq;
import swim.structure.Data;

public class MqttDecoder {
  public MqttConnect connect(int packetFlags, String protocolName, int protocolLevel,
                             int connectFlags, int keepAlive, String clientId, String willTopic,
                             Data willMessage, String username, Data password) {
    return MqttConnect.from(packetFlags, protocolName, protocolLevel,
                            connectFlags, keepAlive, clientId, willTopic,
                            willMessage, username, password);
  }

  public MqttConnAck connAck(int packetFlags, int connectFlags, int connectCode) {
    return MqttConnAck.from(packetFlags, connectFlags, connectCode);
  }

  public <T> MqttPublish<T> publish(int packetFlags, String topicName,
                                    int packetId, MqttEntity<T> payload) {
    return MqttPublish.from(packetFlags, topicName, packetId, payload);
  }

  public MqttPubAck pubAck(int packetFlags, int packetId) {
    return MqttPubAck.from(packetFlags, packetId);
  }

  public MqttPubRec pubRec(int packetFlags, int packetId) {
    return MqttPubRec.from(packetFlags, packetId);
  }

  public MqttPubRel pubRel(int packetFlags, int packetId) {
    return MqttPubRel.from(packetFlags, packetId);
  }

  public MqttPubComp pubComp(int packetFlags, int packetId) {
    return MqttPubComp.from(packetFlags, packetId);
  }

  public MqttSubscribe subscribe(int packetFlags, int packetId,
                                 FingerTrieSeq<MqttSubscription> subscriptions) {
    return MqttSubscribe.from(packetFlags, packetId, subscriptions);
  }

  public MqttSubAck subAck(int packetFlags, int packetId,
                           FingerTrieSeq<MqttSubStatus> subscriptions) {
    return MqttSubAck.from(packetFlags, packetId, subscriptions);
  }

  public MqttUnsubscribe unsubscribe(int packetFlags, int packetId,
                                     FingerTrieSeq<String> topicNames) {
    return MqttUnsubscribe.from(packetFlags, packetId, topicNames);
  }

  public MqttUnsubAck unsubAck(int packetFlags, int packetId) {
    return MqttUnsubAck.from(packetFlags, packetId);
  }

  public MqttPingReq pingReq(int packetFlags) {
    return MqttPingReq.from(packetFlags);
  }

  public MqttPingResp pingResp(int packetFlags) {
    return MqttPingResp.from(packetFlags);
  }

  public MqttDisconnect disconnect(int packetFlags) {
    return MqttDisconnect.from(packetFlags);
  }

  public MqttSubscription subscription(String topicName, int flags) {
    return MqttSubscription.from(topicName, flags);
  }

  public MqttSubStatus subStatus(int code) {
    return MqttSubStatus.from(code);
  }

  public <T> Decoder<MqttPacket<T>> packetDecoder(Decoder<T> content) {
    return new MqttPacketDecoder<T>(this, content);
  }

  public <T> Decoder<MqttPacket<T>> decodePacket(Decoder<T> content, InputBuffer input) {
    return MqttPacketDecoder.decode(input, this, content);
  }

  @SuppressWarnings("unchecked")
  public <T> Decoder<MqttPacket<T>> decodePacketType(int packetType, Decoder<T> content,
                                                     InputBuffer input) {
    final Decoder<?> decoder;
    switch (packetType) {
      case 1: decoder = decodeConnect(input); break;
      case 2: decoder = decodeConnAck(input); break;
      case 3: decoder = decodePublish(content, input); break;
      case 4: decoder = decodePubAck(input); break;
      case 5: decoder = decodePubRec(input); break;
      case 6: decoder = decodePubRel(input); break;
      case 7: decoder = decodePubComp(input); break;
      case 8: decoder = decodeSubscribe(input); break;
      case 9: decoder = decodeSubAck(input); break;
      case 10: decoder = decodeUnsubscribe(input); break;
      case 11: decoder = decodeUnsubAck(input); break;
      case 12: decoder = decodePingReq(input); break;
      case 13: decoder = decodePingResp(input); break;
      case 14: decoder = decodeDisconnect(input); break;
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
