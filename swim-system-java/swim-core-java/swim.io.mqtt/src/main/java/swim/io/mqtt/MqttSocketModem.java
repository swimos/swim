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

package swim.io.mqtt;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.codec.Decoder;
import swim.io.FlowControl;
import swim.io.FlowModifier;
import swim.io.IpModem;
import swim.io.IpModemContext;
import swim.io.IpSocket;
import swim.mqtt.Mqtt;
import swim.mqtt.MqttPacket;

public class MqttSocketModem<I, O> implements IpModem<Object, Object>, MqttSocketContext<I, O> {
  protected final MqttSocket<I, O> socket;
  protected final MqttSettings mqttSettings;
  protected IpModemContext<Object, Object> context;

  public MqttSocketModem(MqttSocket<I, O> socket, MqttSettings mqttSettings) {
    this.socket = socket;
    this.mqttSettings = mqttSettings;
  }

  @Override
  public IpModemContext<Object, Object> ipModemContext() {
    return this.context;
  }

  @Override
  public void setIpModemContext(IpModemContext<Object, Object> context) {
    this.context = context;
    this.socket.setMqttSocketContext(this);
  }

  @Override
  public long idleTimeout() {
    return this.socket.idleTimeout();
  }

  @Override
  public void doRead() {
    this.socket.doRead();
  }

  @SuppressWarnings("unchecked")
  @Override
  public void didRead(Object input) {
    this.socket.didRead((MqttPacket<I>) input);
  }

  @Override
  public void doWrite() {
    this.socket.doWrite();
  }

  @SuppressWarnings("unchecked")
  @Override
  public void didWrite(Object output) {
    this.socket.didWrite((MqttPacket<O>) output);
  }

  @Override
  public void willConnect() {
    this.socket.willConnect();
  }

  @Override
  public void didConnect() {
    this.socket.didConnect();
  }

  @Override
  public void willSecure() {
    this.socket.willSecure();
  }

  @Override
  public void didSecure() {
    this.socket.didSecure();
  }

  @Override
  public void willBecome(IpSocket socket) {
    this.socket.willBecome(socket);
  }

  @Override
  public void didBecome(IpSocket socket) {
    this.socket.didBecome(socket);
  }

  @Override
  public void didTimeout() {
    this.socket.didTimeout();
  }

  @Override
  public void didDisconnect() {
    this.socket.didDisconnect();
  }

  @Override
  public void didFail(Throwable error) {
    this.socket.didFail(error);
    close();
  }

  @Override
  public boolean isConnected() {
    final IpModemContext<Object, Object> context = this.context;
    return context != null && context.isConnected();
  }

  @Override
  public boolean isClient() {
    final IpModemContext<Object, Object> context = this.context;
    return context != null && context.isClient();
  }

  @Override
  public boolean isServer() {
    final IpModemContext<Object, Object> context = this.context;
    return context != null && context.isServer();
  }

  @Override
  public boolean isSecure() {
    final IpModemContext<Object, Object> context = this.context;
    return context != null && context.isSecure();
  }

  @Override
  public String securityProtocol() {
    return this.context.securityProtocol();
  }

  @Override
  public String cipherSuite() {
    return this.context.cipherSuite();
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.context.localAddress();
  }

  @Override
  public Principal localPrincipal() {
    return this.context.localPrincipal();
  }

  @Override
  public Collection<Certificate> localCertificates() {
    return this.context.localCertificates();
  }

  @Override
  public InetSocketAddress remoteAddress() {
    return this.context.remoteAddress();
  }

  @Override
  public Principal remotePrincipal() {
    return this.context.remotePrincipal();
  }

  @Override
  public Collection<Certificate> remoteCertificates() {
    return this.context.remoteCertificates();
  }

  @Override
  public FlowControl flowControl() {
    return this.context.flowControl();
  }

  @Override
  public void flowControl(FlowControl flowControl) {
    this.context.flowControl(flowControl);
  }

  @Override
  public FlowControl flowControl(FlowModifier flowModifier) {
    return this.context.flowControl(flowModifier);
  }

  @Override
  public MqttSettings mqttSettings() {
    return this.mqttSettings;
  }

  @Override
  public <I2 extends I> void read(Decoder<I2> content) {
    this.context.read(Mqtt.standardDecoder().packetDecoder(content));
  }

  @Override
  public <O2 extends O> void write(MqttPacket<O2> packet) {
    this.context.write(packet.mqttEncoder(Mqtt.standardEncoder()));
  }

  @Override
  public void become(IpSocket socket) {
    this.context.become(socket);
  }

  @Override
  public void close() {
    this.context.close();
  }
}
