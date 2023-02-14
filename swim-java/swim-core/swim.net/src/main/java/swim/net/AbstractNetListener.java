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
import java.net.InetSocketAddress;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.exec.Scheduler;

/**
 * Generic implementation of a {@link NetListener}.
 */
@Public
@Since("5.0")
public abstract class AbstractNetListener implements NetListener {

  /**
   * The management context that binds this listener to a network transport,
   * or {@code null} if this task is not currently bound to a transport.
   */
  protected @Nullable NetListenerContext context;

  protected AbstractNetListener() {
    this.context = null;
  }

  @Override
  public final @Nullable NetListenerContext listenerContext() {
    return this.context;
  }

  @Override
  public void setListenerContext(@Nullable NetListenerContext context) {
    this.context = context;
  }

  public @Nullable Scheduler scheduler() {
    final NetListenerContext context = this.context;
    if (context != null) {
      return context.scheduler();
    } else {
      throw new IllegalStateException("Unbound listener");
    }
  }

  public @Nullable InetSocketAddress localAddress() {
    final NetListenerContext context = this.context;
    if (context != null) {
      return context.localAddress();
    } else {
      throw new IllegalStateException("Unbound listener");
    }
  }

  protected boolean requestAccept() {
    final NetListenerContext context = this.context;
    if (context != null) {
      return context.requestAccept();
    } else {
      throw new IllegalStateException("Unbound listener");
    }
  }

  protected boolean cancelAccept() {
    final NetListenerContext context = this.context;
    if (context != null) {
      return context.cancelAccept();
    } else {
      throw new IllegalStateException("Unbound listener");
    }
  }

  @Override
  public void doAccept() throws IOException {
    // hook
  }

  protected @Nullable NetSocketRef accept(NetSocket socket) throws IOException {
    final NetListenerContext context = this.context;
    if (context != null) {
      return context.accept(socket);
    } else {
      throw new IllegalStateException("Unbound listener");
    }
  }

  public void close() {
    final NetListenerContext context = this.context;
    if (context != null) {
      context.close();
    } else {
      throw new IllegalStateException("Unbound listener");
    }
  }

}
