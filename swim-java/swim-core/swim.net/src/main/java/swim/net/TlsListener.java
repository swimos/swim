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

package swim.net;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.SocketException;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Collection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLEngine;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.log.Log;
import swim.repr.ArrayRepr;
import swim.repr.Repr;
import swim.repr.TupleRepr;
import swim.util.Severity;

@Public
@Since("5.0")
public class TlsListener extends TcpListener {

  /**
   * TLS options used to configure accepted connections.
   */
  protected TlsOptions tlsOptions;

  public TlsListener(ServerSocketChannel channel, NetListener listener,
                     TcpOptions tcpOptions, TlsOptions tlsOptions) {
    super(channel, listener, tcpOptions);
    this.tlsOptions = tlsOptions;
  }

  @Override
  protected Log initLog() {
    return Log.forTopic("swim.net.tls.listener").withFocus(this.logFocus());
  }

  @Override
  String protocol() {
    return "tls";
  }

  @Override
  public @Nullable NetSocketRef accept(NetSocket socket) throws IOException {
    final SocketChannel channel = this.channel.accept();
    channel.configureBlocking(false);
    this.tcpOptions.configure(channel.socket());

    final SSLEngine sslEngine = this.tlsOptions.createSSLEngine();
    sslEngine.setUseClientMode(false);

    final TlsSocket transport = new TlsSocket(channel, socket, sslEngine);
    transport.setScheduler(this.scheduler);
    this.getTransportContext().dispatcher().bindTransport(transport);
    socket.setSocketContext(transport);

    transport.open();

    this.log.infoEntity("accepted socket", transport);

    return transport;
  }

  @Override
  public @Nullable Object toLogConfig(Severity level) {
    final ServerSocket socket = this.channel.socket();
    final TupleRepr context = TupleRepr.of();
    context.put("localAddress", Repr.from(this.localAddress));
    try {
      context.put("reuseAddress", Repr.of(socket.getReuseAddress()));
    } catch (SocketException e) {
      // ignore
    }
    context.put("protocol", Repr.of(this.tlsOptions.sslContext().getProtocol()));
    final Collection<String> protocols = this.tlsOptions.protocols();
    if (protocols != null) {
      context.put("protocols", ArrayRepr.from(protocols));
    }
    final Collection<String> cipherSuites = this.tlsOptions.cipherSuites();
    if (cipherSuites != null) {
      context.put("cipherSuites", ArrayRepr.from(cipherSuites));
    }
    context.put("clientAuth", Repr.of(this.tlsOptions.clientAuth().label()));
    return context;
  }

}
