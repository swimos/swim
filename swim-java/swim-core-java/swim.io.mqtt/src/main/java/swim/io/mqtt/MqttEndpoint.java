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
import swim.concurrent.Stage;
import swim.io.Endpoint;
import swim.io.ServiceRef;
import swim.io.SocketModem;
import swim.io.SocketRef;

public class MqttEndpoint {
  protected final Endpoint endpoint;
  protected MqttSettings mqttSettings;

  public MqttEndpoint(Endpoint endpoint, MqttSettings mqttSettings) {
    this.endpoint = endpoint;
    this.mqttSettings = mqttSettings;
  }

  public MqttEndpoint(Endpoint endpoint) {
    this(endpoint, MqttSettings.standard());
  }

  public MqttEndpoint(Stage stage, MqttSettings mqttSettings) {
    this(new Endpoint(stage), mqttSettings);
  }

  public MqttEndpoint(Stage stage) {
    this(new Endpoint(stage), MqttSettings.standard());
  }

  public final MqttSettings mqttSettings() {
    return this.mqttSettings;
  }

  public final Stage stage() {
    return this.endpoint.stage();
  }

  public final Endpoint endpoint() {
    return this.endpoint;
  }

  public void start() {
    this.endpoint.start();
  }

  public void stop() {
    this.endpoint.stop();
  }

  public ServiceRef bindMqtt(InetSocketAddress localAddress, MqttService service, MqttSettings mqttSettings) {
    final MqttSocketService tcpService = new MqttSocketService(service, mqttSettings);
    return this.endpoint.bindTcp(localAddress, tcpService, mqttSettings.socketSettings());
  }

  public ServiceRef bindMqtt(InetSocketAddress localAddress, MqttService service) {
    return bindMqtt(localAddress, service, this.mqttSettings);
  }

  public ServiceRef bindMqtt(String address, int port, MqttService service, MqttSettings mqttSettings) {
    return bindMqtt(new InetSocketAddress(address, port), service, mqttSettings);
  }

  public ServiceRef bindMqtt(String address, int port, MqttService service) {
    return bindMqtt(new InetSocketAddress(address, port), service, this.mqttSettings);
  }

  public ServiceRef bindMqtts(InetSocketAddress localAddress, MqttService service, MqttSettings mqttSettings) {
    final MqttSocketService tlsService = new MqttSocketService(service, mqttSettings);
    return this.endpoint.bindTls(localAddress, tlsService, mqttSettings.socketSettings());
  }

  public ServiceRef bindMqtts(InetSocketAddress localAddress, MqttService service) {
    return bindMqtts(localAddress, service, this.mqttSettings);
  }

  public ServiceRef bindMqtts(String address, int port, MqttService service, MqttSettings mqttSettings) {
    return bindMqtts(new InetSocketAddress(address, port), service, mqttSettings);
  }

  public ServiceRef bindMqtts(String address, int port, MqttService service) {
    return bindMqtts(new InetSocketAddress(address, port), service, this.mqttSettings);
  }

  public <I, O> SocketRef connectMqtt(InetSocketAddress localAddress, MqttSocket<I, O> socket, MqttSettings mqttSettings) {
    final MqttSocketModem<I, O> modem = new MqttSocketModem<I, O>(socket, mqttSettings);
    final SocketModem<Object, Object> tcpSocket = new SocketModem<Object, Object>(modem);
    return this.endpoint.connectTcp(localAddress, tcpSocket, mqttSettings.socketSettings());
  }

  public <I, O> SocketRef connectMqtt(InetSocketAddress localAddress, MqttSocket<I, O> socket) {
    return connectMqtt(localAddress, socket, this.mqttSettings);
  }

  public <I, O> SocketRef connectMqtt(String address, int port, MqttSocket<I, O> socket, MqttSettings mqttSettings) {
    return connectMqtt(new InetSocketAddress(address, port), socket, mqttSettings);
  }

  public <I, O> SocketRef connectMqtt(String address, int port, MqttSocket<I, O> socket) {
    return connectMqtt(new InetSocketAddress(address, port), socket, this.mqttSettings);
  }

  public <I, O> SocketRef connectMqtts(InetSocketAddress localAddress, MqttSocket<I, O> socket, MqttSettings mqttSettings) {
    final MqttSocketModem<I, O> modem = new MqttSocketModem<I, O>(socket, mqttSettings);
    final SocketModem<Object, Object> tlsSocket = new SocketModem<Object, Object>(modem);
    return this.endpoint.connectTls(localAddress, tlsSocket, mqttSettings.socketSettings());
  }

  public <I, O> SocketRef connectMqtts(InetSocketAddress localAddress, MqttSocket<I, O> socket) {
    return connectMqtts(localAddress, socket, this.mqttSettings);
  }

  public <I, O> SocketRef connectMqtts(String address, int port, MqttSocket<I, O> socket, MqttSettings mqttSettings) {
    return connectMqtts(new InetSocketAddress(address, port), socket, mqttSettings);
  }

  public <I, O> SocketRef connectMqtts(String address, int port, MqttSocket<I, O> socket) {
    return connectMqtts(new InetSocketAddress(address, port), socket, this.mqttSettings);
  }
}
