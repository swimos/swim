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

import swim.codec.Encoder;
import swim.codec.OutputBuffer;
import swim.structure.Data;

public class MqttEncoder {
  public Encoder<?, MqttConnect> connectEncoder(MqttConnect packet) {
    return new MqttConnectEncoder(this, packet);
  }

  public Encoder<?, MqttConnect> encodeConnect(MqttConnect packet, OutputBuffer<?> output) {
    return MqttConnectEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttConnAck> connAckEncoder(MqttConnAck packet) {
    return new MqttConnAckEncoder(this, packet);
  }

  public Encoder<?, MqttConnAck> encodeConnAck(MqttConnAck packet, OutputBuffer<?> output) {
    return MqttConnAckEncoder.encode(output, this, packet);
  }

  public <T> Encoder<?, MqttPublish<T>> publishEncoder(MqttPublish<T> packet) {
    return new MqttPublishEncoder<T>(this, packet);
  }

  public <T> Encoder<?, MqttPublish<T>> encodePublish(MqttPublish<T> packet, OutputBuffer<?> output) {
    return MqttPublishEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPubAck> pubAckEncoder(MqttPubAck packet) {
    return new MqttPubAckEncoder(this, packet);
  }

  public Encoder<?, MqttPubAck> encodePubAck(MqttPubAck packet, OutputBuffer<?> output) {
    return MqttPubAckEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPubRec> pubRecEncoder(MqttPubRec packet) {
    return new MqttPubRecEncoder(this, packet);
  }

  public Encoder<?, MqttPubRec> encodePubRec(MqttPubRec packet, OutputBuffer<?> output) {
    return MqttPubRecEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPubRel> pubRelEncoder(MqttPubRel packet) {
    return new MqttPubRelEncoder(this, packet);
  }

  public Encoder<?, MqttPubRel> encodePubRel(MqttPubRel packet, OutputBuffer<?> output) {
    return MqttPubRelEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPubComp> pubCompEncoder(MqttPubComp packet) {
    return new MqttPubCompEncoder(this, packet);
  }

  public Encoder<?, MqttPubComp> encodePubComp(MqttPubComp packet, OutputBuffer<?> output) {
    return MqttPubCompEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttSubscribe> subscribeEncoder(MqttSubscribe packet) {
    return new MqttSubscribeEncoder(this, packet);
  }

  public Encoder<?, MqttSubscribe> encodeSubscribe(MqttSubscribe packet, OutputBuffer<?> output) {
    return MqttSubscribeEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttSubAck> subAckEncoder(MqttSubAck packet) {
    return new MqttSubAckEncoder(this, packet);
  }

  public Encoder<?, MqttSubAck> encodeSubAck(MqttSubAck packet, OutputBuffer<?> output) {
    return MqttSubAckEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttUnsubscribe> unsubscribeEncoder(MqttUnsubscribe packet) {
    return new MqttUnsubscribeEncoder(this, packet);
  }

  public Encoder<?, MqttUnsubscribe> encodeUnsubscribe(MqttUnsubscribe packet, OutputBuffer<?> output) {
    return MqttUnsubscribeEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttUnsubAck> unsubAckEncoder(MqttUnsubAck packet) {
    return new MqttUnsubAckEncoder(this, packet);
  }

  public Encoder<?, MqttUnsubAck> encodeUnsubAck(MqttUnsubAck packet, OutputBuffer<?> output) {
    return MqttUnsubAckEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPingReq> pingReqEncoder(MqttPingReq packet) {
    return new MqttPingReqEncoder(this, packet);
  }

  public Encoder<?, MqttPingReq> encodePingReq(MqttPingReq packet, OutputBuffer<?> output) {
    return MqttPingReqEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttPingResp> pingRespEncoder(MqttPingResp packet) {
    return new MqttPingRespEncoder(this, packet);
  }

  public Encoder<?, MqttPingResp> encodePingResp(MqttPingResp packet, OutputBuffer<?> output) {
    return MqttPingRespEncoder.encode(output, this, packet);
  }

  public Encoder<?, MqttDisconnect> disconnectEncoder(MqttDisconnect packet) {
    return new MqttDisconnectEncoder(this, packet);
  }

  public Encoder<?, MqttDisconnect> encodeDisconnect(MqttDisconnect packet, OutputBuffer<?> output) {
    return MqttDisconnectEncoder.encode(output, this, packet);
  }

  public int sizeOfSubscription(MqttSubscription subscription) {
    return MqttSubscriptionEncoder.sizeOf(this, subscription);
  }

  public Encoder<MqttSubscription, MqttSubscription> subscriptionEncoder(MqttSubscription subscription) {
    return new MqttSubscriptionEncoder(this, subscription);
  }

  public Encoder<MqttSubscription, MqttSubscription> encodeSubscription(MqttSubscription subscription,
                                                                        OutputBuffer<?> output) {
    return MqttSubscriptionEncoder.encode(output, this, subscription);
  }

  public int sizeOfString(String string) {
    return MqttStringEncoder.sizeOf(string);
  }

  public Encoder<String, String> stringEncoder(String string) {
    return new MqttStringEncoder(string);
  }

  public Encoder<String, String> encodeString(String string, OutputBuffer<?> output) {
    return MqttStringEncoder.encode(output, string);
  }

  public int sizeOfData(Data data) {
    return MqttDataEncoder.sizeOf(data);
  }

  public Encoder<Data, Data> dataEncoder(Data data) {
    return new MqttDataEncoder(data);
  }

  public Encoder<Data, Data> encodeData(Data data, OutputBuffer<?> output) {
    return MqttDataEncoder.encode(output, data);
  }
}
