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

package swim.io;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Collection;
import javax.net.ssl.SSLEngine;
import swim.concurrent.Stage;

/**
 * Network interface for binding and connecting IP sockets and modems.
 */
public class Endpoint {
  protected final Station station;
  protected SocketSettings socketSettings;

  public Endpoint(Station station, SocketSettings socketSettings) {
    this.station = station;
    this.socketSettings = socketSettings;
  }

  public Endpoint(Station station) {
    this(station, SocketSettings.standard());
  }

  public Endpoint(Stage stage, SocketSettings socketSettings) {
    this(new Station(stage), socketSettings);
  }

  public Endpoint(Stage stage) {
    this(new Station(stage), SocketSettings.standard());
  }

  public final SocketSettings socketSettings() {
    return this.socketSettings;
  }

  public final Stage stage() {
    return this.station.stage;
  }

  public final Station station() {
    return this.station;
  }

  public void start() {
    this.station.start();
  }

  public void stop() {
    this.station.stop();
  }

  public ServiceRef bindTcp(InetSocketAddress localAddress, Service service, SocketSettings socketSettings) {
    try {
      final ServerSocketChannel serverChannel = ServerSocketChannel.open();
      serverChannel.configureBlocking(false);
      serverChannel.socket().setReuseAddress(true);
      serverChannel.socket().bind(localAddress, this.station.transportSettings.backlog);

      final TcpService context = new TcpService(this.station, localAddress, serverChannel, service, socketSettings);
      service.setServiceContext(context);
      this.station.transport(context, FlowControl.ACCEPT);
      context.didBind();
      return context;
    } catch (IOException error) {
      throw new StationException(error);
    }
  }

  public ServiceRef bindTcp(InetSocketAddress localAddress, Service service) {
    return bindTcp(localAddress, service, this.socketSettings);
  }

  public ServiceRef bindTcp(String address, int port, Service service, SocketSettings socketSettings) {
    return bindTcp(new InetSocketAddress(address, port), service, socketSettings);
  }

  public ServiceRef bindTcp(String address, int port, Service service) {
    return bindTcp(new InetSocketAddress(address, port), service, this.socketSettings);
  }

  public ServiceRef bindTls(InetSocketAddress localAddress, Service service, SocketSettings socketSettings) {
    try {
      final ServerSocketChannel serverChannel = ServerSocketChannel.open();
      serverChannel.configureBlocking(false);
      serverChannel.socket().setReuseAddress(true);
      serverChannel.socket().bind(localAddress, this.station.transportSettings.backlog);

      final TlsService context = new TlsService(this.station, localAddress, serverChannel, service, socketSettings);
      service.setServiceContext(context);
      this.station.transport(context, FlowControl.ACCEPT);
      context.didBind();
      return context;
    } catch (IOException error) {
      throw new StationException(error);
    }
  }

  public ServiceRef bindTls(InetSocketAddress localAddress, Service service) {
    return bindTls(localAddress, service, this.socketSettings);
  }

  public ServiceRef bindTls(String address, int port, Service service, SocketSettings socketSettings) {
    return bindTls(new InetSocketAddress(address, port), service, socketSettings);
  }

  public ServiceRef bindTls(String address, int port, Service service) {
    return bindTls(new InetSocketAddress(address, port), service, this.socketSettings);
  }

  public SocketRef connectTcp(InetSocketAddress remoteAddress, Socket socket, SocketSettings socketSettings) {
    try {
      final SocketChannel channel = SocketChannel.open();
      channel.configureBlocking(false);
      socketSettings.configure(channel.socket());

      final boolean connected = channel.connect(remoteAddress);
      final InetSocketAddress localAddress = (InetSocketAddress) channel.socket().getLocalSocketAddress();
      final TcpSocket context = new TcpSocket(localAddress, remoteAddress, channel, socketSettings, true);
      context.become(socket);
      if (connected) {
        this.station.transport(context, FlowControl.WAIT);
        context.didConnect();
      } else {
        context.willConnect();
        this.station.transport(context, FlowControl.CONNECT);
      }
      return context;
    } catch (IOException error) {
      throw new StationException(error);
    }
  }

  public SocketRef connectTcp(InetSocketAddress remoteAddress, Socket socket) {
    return connectTcp(remoteAddress, socket, this.socketSettings);
  }

  public SocketRef connectTcp(String address, int port, Socket socket, SocketSettings socketSettings) {
    return connectTcp(new InetSocketAddress(address, port), socket, socketSettings);
  }

  public SocketRef connectTcp(String address, int port, Socket socket) {
    return connectTcp(new InetSocketAddress(address, port), socket, this.socketSettings);
  }

  public <I, O> SocketRef connectTcp(InetSocketAddress remoteAddress, Modem<I, O> modem, SocketSettings socketSettings) {
    final Socket socket = new SocketModem<I, O>(modem);
    return connectTcp(remoteAddress, socket, socketSettings);
  }

  public <I, O> SocketRef connectTcp(InetSocketAddress remoteAddress, Modem<I, O> modem) {
    final Socket socket = new SocketModem<I, O>(modem);
    return connectTcp(remoteAddress, socket, this.socketSettings);
  }

  public <I, O> SocketRef connectTcp(String address, int port, Modem<I, O> modem, SocketSettings socketSettings) {
    final Socket socket = new SocketModem<I, O>(modem);
    return connectTcp(new InetSocketAddress(address, port), socket, socketSettings);
  }

  public <I, O> SocketRef connectTcp(String address, int port, Modem<I, O> modem) {
    final Socket socket = new SocketModem<I, O>(modem);
    return connectTcp(new InetSocketAddress(address, port), socket, this.socketSettings);
  }

  public SocketRef connectTls(InetSocketAddress remoteAddress, Socket socket, SocketSettings socketSettings) {
    try {
      final SocketChannel channel = SocketChannel.open();
      channel.configureBlocking(false);
      socketSettings.configure(channel.socket());

      final TlsSettings tlsSettings = socketSettings.tlsSettings();
      final SSLEngine sslEngine = tlsSettings.sslContext().createSSLEngine();
      sslEngine.setUseClientMode(true);
      switch (tlsSettings.clientAuth()) {
        case NEED: sslEngine.setNeedClientAuth(true); break;
        case WANT: sslEngine.setWantClientAuth(true); break;
        case NONE: sslEngine.setWantClientAuth(false); break;
        default:
      }
      final Collection<String> cipherSuites = tlsSettings.cipherSuites();
      if (cipherSuites != null) {
        sslEngine.setEnabledCipherSuites(cipherSuites.toArray(new String[cipherSuites.size()]));
      }
      final Collection<String> protocols = tlsSettings.protocols();
      if (protocols != null) {
        sslEngine.setEnabledProtocols(protocols.toArray(new String[protocols.size()]));
      }

      final boolean connected = channel.connect(remoteAddress);
      final InetSocketAddress localAddress = (InetSocketAddress) channel.socket().getLocalSocketAddress();
      final TlsSocket context = new TlsSocket(localAddress, remoteAddress, channel, sslEngine, socketSettings, true);
      context.become(socket);
      if (connected) {
        this.station.transport(context, FlowControl.WAIT);
        context.didConnect();
      } else {
        context.willConnect();
        this.station.transport(context, FlowControl.CONNECT);
      }
      return context;
    } catch (IOException error) {
      throw new StationException(error);
    }
  }

  public SocketRef connectTls(InetSocketAddress remoteAddress, Socket socket) {
    return connectTls(remoteAddress, socket, this.socketSettings);
  }

  public SocketRef connectTls(String address, int port, Socket socket, SocketSettings socketSettings) {
    return connectTls(new InetSocketAddress(address, port), socket, socketSettings);
  }

  public SocketRef connectTls(String address, int port, Socket socket) {
    return connectTls(new InetSocketAddress(address, port), socket, this.socketSettings);
  }

  public <I, O> SocketRef connectTls(InetSocketAddress remoteAddress, Modem<I, O> modem, SocketSettings socketSettings) {
    final Socket socket = new SocketModem<I, O>(modem);
    return connectTls(remoteAddress, socket, socketSettings);
  }

  public <I, O> SocketRef connectTls(InetSocketAddress remoteAddress, Modem<I, O> modem) {
    final Socket socket = new SocketModem<I, O>(modem);
    return connectTls(remoteAddress, socket, this.socketSettings);
  }

  public <I, O> SocketRef connectTls(String address, int port, Modem<I, O> modem, SocketSettings socketSettings) {
    final Socket socket = new SocketModem<I, O>(modem);
    return connectTls(new InetSocketAddress(address, port), socket, socketSettings);
  }

  public <I, O> SocketRef connectTls(String address, int port, Modem<I, O> modem) {
    final Socket socket = new SocketModem<I, O>(modem);
    return connectTls(new InetSocketAddress(address, port), socket, this.socketSettings);
  }
}
