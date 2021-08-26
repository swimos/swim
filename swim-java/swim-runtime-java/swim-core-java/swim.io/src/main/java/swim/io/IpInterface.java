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

package swim.io;

import java.net.InetSocketAddress;

public interface IpInterface {

  IpSettings ipSettings();

  IpServiceRef bindTcp(InetSocketAddress localAddress, IpService service, IpSettings ipSettings);

  default IpServiceRef bindTcp(InetSocketAddress localAddress, IpService service) {
    return this.bindTcp(localAddress, service, this.ipSettings());
  }

  default IpServiceRef bindTcp(String address, int port, IpService service, IpSettings ipSettings) {
    return this.bindTcp(new InetSocketAddress(address, port), service, ipSettings);
  }

  default IpServiceRef bindTcp(String address, int port, IpService service) {
    return this.bindTcp(new InetSocketAddress(address, port), service, this.ipSettings());
  }

  IpServiceRef bindTls(InetSocketAddress localAddress, IpService service, IpSettings ipSettings);

  default IpServiceRef bindTls(InetSocketAddress localAddress, IpService service) {
    return this.bindTls(localAddress, service, this.ipSettings());
  }

  default IpServiceRef bindTls(String address, int port, IpService service, IpSettings ipSettings) {
    return this.bindTls(new InetSocketAddress(address, port), service, ipSettings);
  }

  default IpServiceRef bindTls(String address, int port, IpService service) {
    return this.bindTls(new InetSocketAddress(address, port), service, this.ipSettings());
  }

  IpSocketRef connectTcp(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings);

  default IpSocketRef connectTcp(InetSocketAddress remoteAddress, IpSocket socket) {
    return this.connectTcp(remoteAddress, socket, this.ipSettings());
  }

  default IpSocketRef connectTcp(String address, int port, IpSocket socket, IpSettings ipSettings) {
    return this.connectTcp(new InetSocketAddress(address, port), socket, ipSettings);
  }

  default IpSocketRef connectTcp(String address, int port, IpSocket socket) {
    return this.connectTcp(new InetSocketAddress(address, port), socket, this.ipSettings());
  }

  default <I, O> IpSocketRef connectTcp(InetSocketAddress remoteAddress, IpModem<I, O> modem, IpSettings ipSettings) {
    final IpSocket socket = new IpSocketModem<I, O>(modem);
    return this.connectTcp(remoteAddress, socket, ipSettings);
  }

  default <I, O> IpSocketRef connectTcp(InetSocketAddress remoteAddress, IpModem<I, O> modem) {
    final IpSocket socket = new IpSocketModem<I, O>(modem);
    return this.connectTcp(remoteAddress, socket, this.ipSettings());
  }

  default <I, O> IpSocketRef connectTcp(String address, int port, IpModem<I, O> modem, IpSettings ipSettings) {
    final IpSocket socket = new IpSocketModem<I, O>(modem);
    return this.connectTcp(new InetSocketAddress(address, port), socket, ipSettings);
  }

  default <I, O> IpSocketRef connectTcp(String address, int port, IpModem<I, O> modem) {
    final IpSocket socket = new IpSocketModem<I, O>(modem);
    return this.connectTcp(new InetSocketAddress(address, port), socket, this.ipSettings());
  }

  IpSocketRef connectTls(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings);

  default IpSocketRef connectTls(InetSocketAddress remoteAddress, IpSocket socket) {
    return this.connectTls(remoteAddress, socket, this.ipSettings());
  }

  default IpSocketRef connectTls(String address, int port, IpSocket socket, IpSettings ipSettings) {
    return this.connectTls(new InetSocketAddress(address, port), socket, ipSettings);
  }

  default IpSocketRef connectTls(String address, int port, IpSocket socket) {
    return this.connectTls(new InetSocketAddress(address, port), socket, this.ipSettings());
  }

  default <I, O> IpSocketRef connectTls(InetSocketAddress remoteAddress, IpModem<I, O> modem, IpSettings ipSettings) {
    final IpSocket socket = new IpSocketModem<I, O>(modem);
    return this.connectTls(remoteAddress, socket, ipSettings);
  }

  default <I, O> IpSocketRef connectTls(InetSocketAddress remoteAddress, IpModem<I, O> modem) {
    final IpSocket socket = new IpSocketModem<I, O>(modem);
    return this.connectTls(remoteAddress, socket, this.ipSettings());
  }

  default <I, O> IpSocketRef connectTls(String address, int port, IpModem<I, O> modem, IpSettings ipSettings) {
    final IpSocket socket = new IpSocketModem<I, O>(modem);
    return this.connectTls(new InetSocketAddress(address, port), socket, ipSettings);
  }

  default <I, O> IpSocketRef connectTls(String address, int port, IpModem<I, O> modem) {
    final IpSocket socket = new IpSocketModem<I, O>(modem);
    return this.connectTls(new InetSocketAddress(address, port), socket, this.ipSettings());
  }

}
