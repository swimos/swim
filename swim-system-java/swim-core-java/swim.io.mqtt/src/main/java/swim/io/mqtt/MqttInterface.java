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
import swim.io.IpInterface;
import swim.io.IpServiceRef;
import swim.io.IpSocketModem;
import swim.io.IpSocketRef;

public interface MqttInterface extends IpInterface {
  MqttSettings mqttSettings();

  default IpServiceRef bindMqtt(InetSocketAddress localAddress, MqttService service, MqttSettings mqttSettings) {
    final MqttSocketService tcpService = new MqttSocketService(service, mqttSettings);
    return bindTcp(localAddress, tcpService, mqttSettings.ipSettings());
  }

  default IpServiceRef bindMqtt(InetSocketAddress localAddress, MqttService service) {
    return bindMqtt(localAddress, service, mqttSettings());
  }

  default IpServiceRef bindMqtt(String address, int port, MqttService service, MqttSettings mqttSettings) {
    return bindMqtt(new InetSocketAddress(address, port), service, mqttSettings);
  }

  default IpServiceRef bindMqtt(String address, int port, MqttService service) {
    return bindMqtt(new InetSocketAddress(address, port), service, mqttSettings());
  }

  default IpServiceRef bindMqtts(InetSocketAddress localAddress, MqttService service, MqttSettings mqttSettings) {
    final MqttSocketService tlsService = new MqttSocketService(service, mqttSettings);
    return bindTls(localAddress, tlsService, mqttSettings.ipSettings());
  }

  default IpServiceRef bindMqtts(InetSocketAddress localAddress, MqttService service) {
    return bindMqtts(localAddress, service, mqttSettings());
  }

  default IpServiceRef bindMqtts(String address, int port, MqttService service, MqttSettings mqttSettings) {
    return bindMqtts(new InetSocketAddress(address, port), service, mqttSettings);
  }

  default IpServiceRef bindMqtts(String address, int port, MqttService service) {
    return bindMqtts(new InetSocketAddress(address, port), service, mqttSettings());
  }

  default <I, O> IpSocketRef connectMqtt(InetSocketAddress localAddress, MqttSocket<I, O> socket, MqttSettings mqttSettings) {
    final MqttSocketModem<I, O> modem = new MqttSocketModem<I, O>(socket, mqttSettings);
    final IpSocketModem<Object, Object> tcpSocket = new IpSocketModem<Object, Object>(modem);
    return connectTcp(localAddress, tcpSocket, mqttSettings.ipSettings());
  }

  default <I, O> IpSocketRef connectMqtt(InetSocketAddress localAddress, MqttSocket<I, O> socket) {
    return connectMqtt(localAddress, socket, mqttSettings());
  }

  default <I, O> IpSocketRef connectMqtt(String address, int port, MqttSocket<I, O> socket, MqttSettings mqttSettings) {
    return connectMqtt(new InetSocketAddress(address, port), socket, mqttSettings);
  }

  default <I, O> IpSocketRef connectMqtt(String address, int port, MqttSocket<I, O> socket) {
    return connectMqtt(new InetSocketAddress(address, port), socket, mqttSettings());
  }

  default <I, O> IpSocketRef connectMqtts(InetSocketAddress localAddress, MqttSocket<I, O> socket, MqttSettings mqttSettings) {
    final MqttSocketModem<I, O> modem = new MqttSocketModem<I, O>(socket, mqttSettings);
    final IpSocketModem<Object, Object> tlsSocket = new IpSocketModem<Object, Object>(modem);
    return connectTls(localAddress, tlsSocket, mqttSettings.ipSettings());
  }

  default <I, O> IpSocketRef connectMqtts(InetSocketAddress localAddress, MqttSocket<I, O> socket) {
    return connectMqtts(localAddress, socket, mqttSettings());
  }

  default <I, O> IpSocketRef connectMqtts(String address, int port, MqttSocket<I, O> socket, MqttSettings mqttSettings) {
    return connectMqtts(new InetSocketAddress(address, port), socket, mqttSettings);
  }

  default <I, O> IpSocketRef connectMqtts(String address, int port, MqttSocket<I, O> socket) {
    return connectMqtts(new InetSocketAddress(address, port), socket, mqttSettings());
  }
}
