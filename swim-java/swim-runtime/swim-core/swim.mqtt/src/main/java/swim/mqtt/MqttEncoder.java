// Copyright 2015-2022 Swim.inc
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
import swim.codec.OutputBuffer;
import swim.structure.Data;

public class MqttEncoder {

  public MqttEncoder() {
    // nop
  }

  public Encoder<?, MqttConnectPacket> connectPacketEncoder(MqttConnectPacket packet) {
    return new MqttConnectPacketEncoder(this, packet);
  }

  public Encoder<?, MqttConnectPacket> encodeConnectPacket(OutputBuffer<?> output, MqttConnectPacket packet) {
    return MqttConnectPacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttConnAckPacket> connAckPacketEncoder(MqttConnAckPacket packet) {
    return new MqttConnAckPacketEncoder(this, packet);
  }

  public Encoder<?, MqttConnAckPacket> encodeConnAckPacket(OutputBuffer<?> output, MqttConnAckPacket packet) {
    return MqttConnAckPacketEncoder.encode(output, this, packet);
  }

  public <T> Encoder<?, MqttPublishPacket<T>> publishPacketEncoder(MqttPublishPacket<T> packet) {
    return new MqttPublishPacketEncoder<T>(this, packet);
  }

  public <T> Encoder<?, MqttPublishPacket<T>> encodePublishPacket(OutputBuffer<?> output, MqttPublishPacket<T> packet) {
    return MqttPublishPacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPubAckPacket> pubAckPacketEncoder(MqttPubAckPacket packet) {
    return new MqttPubAckPacketEncoder(this, packet);
  }

  public Encoder<?, MqttPubAckPacket> encodePubAckPacket(OutputBuffer<?> output, MqttPubAckPacket packet) {
    return MqttPubAckPacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPubRecPacket> pubRecPacketEncoder(MqttPubRecPacket packet) {
    return new MqttPubRecPacketEncoder(this, packet);
  }

  public Encoder<?, MqttPubRecPacket> encodePubRecPacket(OutputBuffer<?> output, MqttPubRecPacket packet) {
    return MqttPubRecPacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPubRelPacket> pubRelPacketEncoder(MqttPubRelPacket packet) {
    return new MqttPubRelPacketEncoder(this, packet);
  }

  public Encoder<?, MqttPubRelPacket> encodePubRelPacket(OutputBuffer<?> output, MqttPubRelPacket packet) {
    return MqttPubRelPacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPubCompPacket> pubCompPacketEncoder(MqttPubCompPacket packet) {
    return new MqttPubCompPacketEncoder(this, packet);
  }

  public Encoder<?, MqttPubCompPacket> encodePubCompPacket(OutputBuffer<?> output, MqttPubCompPacket packet) {
    return MqttPubCompPacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttSubscribePacket> subscribePacketEncoder(MqttSubscribePacket packet) {
    return new MqttSubscribePacketEncoder(this, packet);
  }

  public Encoder<?, MqttSubscribePacket> encodeSubscribePacket(OutputBuffer<?> output, MqttSubscribePacket packet) {
    return MqttSubscribePacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttSubAckPacket> subAckPacketEncoder(MqttSubAckPacket packet) {
    return new MqttSubAckPacketEncoder(this, packet);
  }

  public Encoder<?, MqttSubAckPacket> encodeSubAckPacket(OutputBuffer<?> output, MqttSubAckPacket packet) {
    return MqttSubAckPacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttUnsubscribePacket> unsubscribePacketEncoder(MqttUnsubscribePacket packet) {
    return new MqttUnsubscribePacketEncoder(this, packet);
  }

  public Encoder<?, MqttUnsubscribePacket> encodeUnsubscribePacket(OutputBuffer<?> output, MqttUnsubscribePacket packet) {
    return MqttUnsubscribePacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttUnsubAckPacket> unsubAckPacketEncoder(MqttUnsubAckPacket packet) {
    return new MqttUnsubAckPacketEncoder(this, packet);
  }

  public Encoder<?, MqttUnsubAckPacket> encodeUnsubAckPacket(OutputBuffer<?> output, MqttUnsubAckPacket packet) {
    return MqttUnsubAckPacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPingReqPacket> pingReqPacketEncoder(MqttPingReqPacket packet) {
    return new MqttPingReqPacketEncoder(this, packet);
  }

  public Encoder<?, MqttPingReqPacket> encodePingReqPacket(OutputBuffer<?> output, MqttPingReqPacket packet) {
    return MqttPingReqPacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPingRespPacket> pingRespPacketEncoder(MqttPingRespPacket packet) {
    return new MqttPingRespPacketEncoder(this, packet);
  }

  public Encoder<?, MqttPingRespPacket> encodePingRespPacket(OutputBuffer<?> output, MqttPingRespPacket packet) {
    return MqttPingRespPacketEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttDisconnectPacket> disconnectPacketEncoder(MqttDisconnectPacket packet) {
    return new MqttDisconnectPacketEncoder(this, packet);
  }

  public Encoder<?, MqttDisconnectPacket> encodeDisconnectPacket(OutputBuffer<?> output, MqttDisconnectPacket packet) {
    return MqttDisconnectPacketEncoder.encode(output, this, packet);
  }

  public int sizeOfSubscription(MqttSubscription subscription) {
    return MqttSubscriptionEncoder.sizeOf(this, subscription);
  }

  public Encoder<MqttSubscription, MqttSubscription> subscriptionEncoder(MqttSubscription subscription) {
    return new MqttSubscriptionEncoder(this, subscription);
  }

  public Encoder<MqttSubscription, MqttSubscription> encodeSubscription(OutputBuffer<?> output, MqttSubscription subscription) {
    return MqttSubscriptionEncoder.encode(output, this, subscription);
  }

  public int sizeOfString(String string) {
    return MqttStringEncoder.sizeOf(string);
  }

  public Encoder<String, String> stringEncoder(String string) {
    return new MqttStringEncoder(string);
  }

  public Encoder<String, String> encodeString(OutputBuffer<?> output, String string) {
    return MqttStringEncoder.encode(output, string);
  }

  public int sizeOfData(Data data) {
    return MqttDataEncoder.sizeOf(data);
  }

  public Encoder<Data, Data> dataEncoder(Data data) {
    return new MqttDataEncoder(data);
  }

  public Encoder<Data, Data> encodeData(OutputBuffer<?> output, Data data) {
    return MqttDataEncoder.encode(output, data);
  }

}
