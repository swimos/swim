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

package swim.io.warp;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import swim.concurrent.ConcurrentTrancheQueue;
import swim.concurrent.PullContext;
import swim.concurrent.PullRequest;
import swim.concurrent.PushRequest;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.FlowControl;
import swim.io.FlowModifier;
import swim.io.IpSocket;
import swim.io.ws.WebSocket;
import swim.io.ws.WebSocketContext;
import swim.warp.Envelope;
import swim.warp.WarpException;
import swim.ws.WsClose;
import swim.ws.WsControl;
import swim.ws.WsData;
import swim.ws.WsFragment;
import swim.ws.WsFrame;
import swim.ws.WsText;

public class WarpWebSocket implements WebSocket<Envelope, Envelope>, WarpSocketContext, PullContext<Envelope> {
  protected final WarpSocket socket;
  protected final WarpSettings warpSettings;
  final ConcurrentTrancheQueue<PullRequest<Envelope>> supply;
  protected WebSocketContext<Envelope, Envelope> context;
  volatile long status;

  public WarpWebSocket(WarpSocket socket, WarpSettings warpSettings) {
    this.socket = socket;
    this.warpSettings = warpSettings;
    this.supply = new ConcurrentTrancheQueue<PullRequest<Envelope>>(TRANCHES);
  }

  @Override
  public WebSocketContext<Envelope, Envelope> webSocketContext() {
    return this.context;
  }

  @Override
  public void setWebSocketContext(WebSocketContext<Envelope, Envelope> context) {
    this.context = context;
    this.socket.setWarpSocketContext(this);
  }

  @Override
  public long idleTimeout() {
    return this.socket.idleTimeout();
  }

  @Override
  public void doRead() {
    this.socket.doRead();
  }

  @Override
  public void didRead(WsFrame<? extends Envelope> frame) {
    if (frame instanceof WsFragment<?>) {
      final WsFragment<? extends Envelope> fragment = (WsFragment<? extends Envelope>) frame;
      this.context.read(fragment.contentDecoder());
    } else {
      if (frame instanceof WsData<?>) {
        this.socket.didRead(frame.get());
      } else if (frame instanceof WsControl<?, ?>) {
        this.socket.didRead((WsControl<?, ?>) frame);
      }
      this.context.read(Envelope.decoder());
    }
  }

  @Override
  public void doWrite() {
    this.socket.doWrite();
    generateDemand();
  }

  @Override
  public void didWrite(WsFrame<? extends Envelope> frame) {
    if (frame instanceof WsData<?>) {
      do {
        final long oldStatus = this.status;
        final long oldBuffer = (oldStatus & BUFFER_MASK) >>> BUFFER_SHIFT;
        final long newBuffer = oldBuffer - 1L;
        if (newBuffer >= 0L) {
          final long newStatus = oldStatus & ~BUFFER_MASK | newBuffer << BUFFER_SHIFT;
          if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
            break;
          }
        } else {
          throw new WarpException("overbuffer");
        }
      } while (true);
      this.socket.didWrite(frame.get());
    } else if (frame instanceof WsControl<?, ?>) {
      this.socket.didWrite((WsControl<?, ?>) frame);
    }
    generateDemand();
  }

  @Override
  public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
    do {
      final long oldStatus = this.status;
      final long newStatus = oldStatus | UPGRADED;
      if (oldStatus != newStatus) {
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.socket.didUpgrade(httpRequest, httpResponse);
          this.context.read(Envelope.decoder());
          generateDemand();
          break;
        }
      } else {
        break;
      }
    } while (true);
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
    do {
      final long oldStatus = this.status;
      final long newStatus = oldStatus & ~(UPGRADED | CLOSING);
      if (oldStatus != newStatus) {
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    this.socket.didDisconnect();
    close();
  }

  @Override
  public void didFail(Throwable error) {
    this.socket.didFail(error);
    close();
  }

  @Override
  public boolean isConnected() {
    final WebSocketContext<Envelope, Envelope> context = this.context;
    return context != null && context.isConnected();
  }

  @Override
  public boolean isClient() {
    final WebSocketContext<Envelope, Envelope> context = this.context;
    return context != null && context.isClient();
  }

  @Override
  public boolean isServer() {
    final WebSocketContext<Envelope, Envelope> context = this.context;
    return context != null && context.isServer();
  }

  @Override
  public boolean isSecure() {
    final WebSocketContext<Envelope, Envelope> context = this.context;
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
  public WarpSettings warpSettings() {
    return this.warpSettings;
  }

  @Override
  public void feed(PullRequest<Envelope> pullRequest) {
    do {
      final long oldStatus = this.status;
      final long oldSupply = oldStatus & SUPPLY_MASK;
      final long newSupply = oldSupply + 1L;
      if (newSupply <= SUPPLY_MAX) {
        final long newStatus = oldStatus & ~SUPPLY_MASK | newSupply;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      } else {
        throw new WarpException("exceeded maximum supply: " + newSupply);
      }
    } while (true);
    this.supply.add(pullRequest, pullRequest.prio());
    generateDemand();
  }

  @Override
  public void feed(Envelope envelope, float prio) {
    feed(new PushRequest<Envelope>(envelope, prio));
  }

  @Override
  public void feed(Envelope envelope) {
    feed(envelope, 0.0f);
  }

  @Override
  public void push(Envelope envelope) {
    do {
      final long oldStatus = this.status;
      final long oldDemand = (oldStatus & DEMAND_MASK) >>> DEMAND_SHIFT;
      final long oldBuffer = (oldStatus & BUFFER_MASK) >>> BUFFER_SHIFT;
      final long newDemand = oldDemand - 1L;
      final long newBuffer = oldBuffer + 1L;
      if (newDemand >= 0L) {
        if (newBuffer <= BUFFER_MAX) {
          final long newStatus = oldStatus & ~(DEMAND_MASK | BUFFER_MASK)
                                           | newDemand << DEMAND_SHIFT
                                           | newBuffer << BUFFER_SHIFT;
          if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
            break;
          }
        } else {
          throw new WarpException("exceeded maximum buffer: " + newBuffer);
        }
      } else {
        throw new WarpException("overdemand");
      }
    } while (true);
    this.context.write(WsText.from(envelope, envelope.reconEncoder()));
  }

  @Override
  public void skip() {
    do {
      final long oldStatus = this.status;
      final long oldDemand = (oldStatus & DEMAND_MASK) >>> DEMAND_SHIFT;
      final long newDemand = oldDemand - 1L;
      if (newDemand >= 0L) {
        final long newStatus = oldStatus & ~DEMAND_MASK | newDemand << DEMAND_SHIFT;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      } else {
        throw new WarpException("overdemand");
      }
    } while (true);
  }

  protected void generateDemand() {
    demand: do {
      PullRequest<Envelope> pullRequest = null;
      do {
        final long oldStatus = this.status;
        if ((oldStatus & UPGRADED) == 0) {
          return;
        }
        final long oldSupply = oldStatus & SUPPLY_MASK;
        final long oldDemand = (oldStatus & DEMAND_MASK) >>> DEMAND_SHIFT;
        final long oldBuffer = (oldStatus & BUFFER_MASK) >>> BUFFER_SHIFT;
        if (pullRequest == null && oldSupply > 0L && oldDemand + oldBuffer < TARGET_DEMAND) {
          pullRequest = supply.poll();
        }
        if (pullRequest != null) {
          final long newDemand = oldDemand + 1L;
          final long newSupply = oldSupply - 1L;
          if (newSupply >= 0L) {
            if (newDemand <= DEMAND_MAX) {
              final long newStatus = oldStatus & ~(SUPPLY_MASK | DEMAND_MASK) | newSupply | newDemand << DEMAND_SHIFT;
              if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
                pullRequest.pull(this);
                if (newDemand < TARGET_DEMAND) {
                  continue demand;
                }
                break;
              }
            } else {
              throw new WarpException("exceeded maximum demand: " + newDemand);
            }
          } else {
            throw new WarpException("oversupply");
          }
        } else {
          break demand;
        }
      } while (true);
    } while (true);
  }

  @Override
  public void write(WsControl<?, ? extends Envelope> frame) {
    if (frame instanceof WsClose<?, ?>) {
      do {
        final long oldStatus = this.status;
        if ((oldStatus & (UPGRADED | CLOSING)) == UPGRADED) {
          final long newStatus = oldStatus | CLOSING;
          if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
            this.context.write(frame);
            break;
          }
        } else {
          break;
        }
      } while (true);
    } else {
      this.context.write(frame);
    }
  }

  @Override
  public void become(IpSocket socket) {
    this.context.become(socket);
  }

  @Override
  public void close() {
    final WebSocketContext<Envelope, Envelope> context = this.context;
    if (context != null) {
      context.close();
    }
  }

  static final long SUPPLY_MAX;
  static final long DEMAND_MAX;
  static final long BUFFER_MAX;
  static final int DEMAND_SHIFT;
  static final int BUFFER_SHIFT;
  static final long SUPPLY_MASK;
  static final long DEMAND_MASK;
  static final long BUFFER_MASK;
  static final long UPGRADED;
  static final long CLOSING;

  static final long TARGET_DEMAND;
  static final int TRANCHES;

  static final AtomicLongFieldUpdater<WarpWebSocket> STATUS =
      AtomicLongFieldUpdater.newUpdater(WarpWebSocket.class, "status");

  static {
    int supplyBits;
    try {
      supplyBits = Integer.parseInt(System.getProperty("swim.warp.supply.bits"));
    } catch (NumberFormatException e) {
      supplyBits = 24;
    }

    int demandBits;
    try {
      demandBits = Integer.parseInt(System.getProperty("swim.warp.demand.bits"));
    } catch (NumberFormatException e) {
      demandBits = 12;
    }

    int bufferBits;
    try {
      bufferBits = Integer.parseInt(System.getProperty("swim.warp.buffer.bits"));
    } catch (NumberFormatException e) {
      bufferBits = 24;
    }

    if (supplyBits < 0 || demandBits < 0 || bufferBits < 0 || supplyBits + demandBits + bufferBits > 60) {
      throw new ExceptionInInitializerError();
    }

    SUPPLY_MAX = (1L << supplyBits) - 1L;
    DEMAND_MAX = (1L << demandBits) - 1L;
    BUFFER_MAX = (1L << bufferBits) - 1L;
    DEMAND_SHIFT = supplyBits;
    BUFFER_SHIFT = supplyBits + demandBits;
    SUPPLY_MASK = SUPPLY_MAX;
    DEMAND_MASK = DEMAND_MAX << DEMAND_SHIFT;
    BUFFER_MASK = BUFFER_MAX << BUFFER_SHIFT;
    UPGRADED = 1L << 60;
    CLOSING = 1L << 61;

    int targetDemand;
    try {
      targetDemand = Integer.parseInt(System.getProperty("swim.warp.demand.target"));
    } catch (NumberFormatException e) {
      targetDemand = 32;
    }
    TARGET_DEMAND = targetDemand;

    int tranches;
    try {
      tranches = Integer.parseInt(System.getProperty("swim.warp.tranches"));
    } catch (NumberFormatException e) {
      tranches = 5;
    }
    TRANCHES = tranches;
  }
}
