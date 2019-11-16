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
import java.nio.channels.UnresolvedAddressException;
import java.util.Collection;
import javax.net.ssl.SSLEngine;

public interface IpStation extends IpInterface {
  Station station();

  @Override
  default IpServiceRef bindTcp(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    try {
      final Station station = station();
      final ServerSocketChannel serverChannel = ServerSocketChannel.open();
      serverChannel.configureBlocking(false);
      serverChannel.socket().setReuseAddress(true);
      serverChannel.socket().bind(localAddress, station().transportSettings.backlog);

      final TcpService context = new TcpService(station(), localAddress, serverChannel, service, ipSettings);
      service.setIpServiceContext(context);
      station().transport(context, FlowControl.ACCEPT);
      context.didBind();
      return context;
    } catch (IOException | UnresolvedAddressException error) {
      throw new StationException(localAddress.toString(), error);
    }
  }

  @Override
  default IpServiceRef bindTls(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    try {
      final Station station = station();
      final ServerSocketChannel serverChannel = ServerSocketChannel.open();
      serverChannel.configureBlocking(false);
      serverChannel.socket().setReuseAddress(true);
      serverChannel.socket().bind(localAddress, station.transportSettings.backlog);

      final TlsService context = new TlsService(station, localAddress, serverChannel, service, ipSettings);
      service.setIpServiceContext(context);
      station.transport(context, FlowControl.ACCEPT);
      context.didBind();
      return context;
    } catch (IOException | UnresolvedAddressException error) {
      throw new StationException(localAddress.toString(), error);
    }
  }

  @Override
  default IpSocketRef connectTcp(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    try {
      final Station station = station();
      final SocketChannel channel = SocketChannel.open();
      channel.configureBlocking(false);
      ipSettings.configure(channel.socket());

      final boolean connected = channel.connect(remoteAddress);
      final InetSocketAddress localAddress = (InetSocketAddress) channel.socket().getLocalSocketAddress();
      final TcpSocket context = new TcpSocket(localAddress, remoteAddress, channel, ipSettings, true);
      context.become(socket);
      if (connected) {
        station.transport(context, FlowControl.WAIT);
        context.didConnect();
      } else {
        context.willConnect();
        station.transport(context, FlowControl.CONNECT);
      }
      return context;
    } catch (IOException | UnresolvedAddressException error) {
      throw new StationException(remoteAddress.toString(), error);
    }
  }

  @Override
  default IpSocketRef connectTls(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    try {
      final Station station = station();
      final SocketChannel channel = SocketChannel.open();
      channel.configureBlocking(false);
      ipSettings.configure(channel.socket());

      final TlsSettings tlsSettings = ipSettings.tlsSettings();
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
      final TlsSocket context = new TlsSocket(localAddress, remoteAddress, channel, sslEngine, ipSettings, true);
      context.become(socket);
      if (connected) {
        station.transport(context, FlowControl.WAIT);
        context.didConnect();
      } else {
        context.willConnect();
        station.transport(context, FlowControl.CONNECT);
      }
      return context;
    } catch (IOException | UnresolvedAddressException error) {
      throw new StationException(remoteAddress.toString(), error);
    }
  }
}
