// Copyright 2015-2023 Nstream, inc.
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
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import javax.net.ssl.SSLSession;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.exec.Scheduler;

/**
 * Generic implementation of a {@link NetSocket}.
 */
@Public
@Since("5.0")
public abstract class AbstractNetSocket implements NetSocket {

  /**
   * The management context that binds this socket to a network transport,
   * or {@code null} if this task is not currently bound to a transport.
   */
  protected @Nullable NetSocketContext context;

  protected AbstractNetSocket() {
    this.context = null;
  }

  @Override
  public final @Nullable NetSocketContext socketContext() {
    return this.context;
  }

  @Override
  public void setSocketContext(@Nullable NetSocketContext context) {
    this.context = context;
  }

  public @Nullable Scheduler scheduler() {
    final NetSocketContext context = this.context;
    return context != null ? context.scheduler() : null;
  }

  public boolean isClient() {
    final NetSocketContext context = this.context;
    return context != null && context.isClient();
  }

  public boolean isServer() {
    final NetSocketContext context = this.context;
    return context != null && context.isServer();
  }

  public boolean isConnecting() {
    final NetSocketContext context = this.context;
    return context != null && context.isConnecting();
  }

  public boolean isOpening() {
    final NetSocketContext context = this.context;
    return context != null && context.isOpening();
  }

  public boolean isOpen() {
    final NetSocketContext context = this.context;
    return context != null && context.isOpen();
  }

  public @Nullable InetSocketAddress localAddress() {
    final NetSocketContext context = this.context;
    return context != null ? context.localAddress() : null;
  }

  public @Nullable InetSocketAddress remoteAddress() {
    final NetSocketContext context = this.context;
    return context != null ? context.remoteAddress() : null;
  }

  public @Nullable SSLSession sslSession() {
    final NetSocketContext context = this.context;
    return context != null ? context.sslSession() : null;
  }

  protected void become(NetSocket socket) {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound socket");
    }
    context.become(socket);
  }

  protected boolean requestRead() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound socket");
    }
    return context.requestRead();
  }

  protected boolean cancelRead() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound socket");
    }
    return context.cancelRead();
  }

  @Override
  public void doRead() throws IOException {
    // hook
  }

  protected int read(ByteBuffer readBuffer) throws IOException {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound socket");
    }
    return context.read(readBuffer);
  }

  protected boolean requestWrite() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound socket");
    }
    return context.requestWrite();
  }

  protected boolean cancelWrite() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound socket");
    }
    return context.cancelWrite();
  }

  @Override
  public void doWrite() throws IOException {
    // hook
  }

  protected int write(ByteBuffer writeBuffer) throws IOException {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound socket");
    }
    return context.write(writeBuffer);
  }

  public boolean isDoneReading() {
    final NetSocketContext context = this.context;
    return context != null && context.isDoneReading();
  }

  protected boolean doneReading() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound socket");
    }
    return context.doneReading();
  }

  public boolean isDoneWriting() {
    final NetSocketContext context = this.context;
    return context != null && context.isDoneWriting();
  }

  protected boolean doneWriting() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound socket");
    }
    return context.doneWriting();
  }

  public void close() {
    final NetSocketContext context = this.context;
    if (context != null) {
      context.close();
    }
  }

}
