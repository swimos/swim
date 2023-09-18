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

package swim.io.warp;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import swim.concurrent.ConcurrentTrancheQueue;
import swim.concurrent.Cont;
import swim.concurrent.DropException;
import swim.concurrent.PullContext;
import swim.concurrent.PullRequest;
import swim.concurrent.PushRequest;
import swim.concurrent.StayContext;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.FlowControl;
import swim.io.FlowModifier;
import swim.io.IpSocket;
import swim.io.ws.WebSocket;
import swim.io.ws.WebSocketContext;
import swim.warp.Envelope;
import swim.warp.WarpException;
import swim.ws.WsCloseFrame;
import swim.ws.WsControlFrame;
import swim.ws.WsDataFrame;
import swim.ws.WsFragmentFrame;
import swim.ws.WsFrame;
import swim.ws.WsTextFrame;

public class WarpWebSocket implements WebSocket<Envelope, Envelope>, WarpSocketContext, PullContext<Envelope>, StayContext {

  protected final WarpSocket socket;
  protected final WarpSettings warpSettings;
  final ConcurrentTrancheQueue<PullRequest<Envelope>> supply;
  protected WebSocketContext<Envelope, Envelope> context;
  volatile long status;

  public WarpWebSocket(WarpSocket socket, WarpSettings warpSettings) {
    this.socket = socket;
    this.warpSettings = warpSettings;
    this.supply = new ConcurrentTrancheQueue<PullRequest<Envelope>>(WarpWebSocket.TRANCHES);
    this.context = null;
    this.status = 0L;
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
    if (frame instanceof WsFragmentFrame<?>) {
      final WsFragmentFrame<? extends Envelope> fragment = (WsFragmentFrame<? extends Envelope>) frame;
      this.context.read(fragment.frameType(), fragment.payloadDecoder());
    } else {
      if (frame instanceof WsDataFrame<?>) {
        this.socket.didRead(((WsDataFrame<? extends Envelope>) frame).payloadValue());
      } else if (frame instanceof WsControlFrame<?, ?>) {
        this.socket.didRead((WsControlFrame<?, ?>) frame);
      }
      this.context.read(Envelope.decoder());
    }
  }

  @Override
  public void doWrite() {
    this.socket.doWrite();
    this.generateDemand();
  }

  @Override
  public void didWrite(WsFrame<? extends Envelope> frame) {
    if (frame instanceof WsDataFrame<?>) {
      do {
        final long oldStatus = WarpWebSocket.STATUS.get(this);
        final long oldBuffer = (oldStatus & WarpWebSocket.BUFFER_MASK) >>> WarpWebSocket.BUFFER_SHIFT;
        final long newBuffer = oldBuffer - 1L;
        if (newBuffer >= 0L) {
          final long newStatus = oldStatus & ~WarpWebSocket.BUFFER_MASK | newBuffer << WarpWebSocket.BUFFER_SHIFT;
          if (WarpWebSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
            break;
          }
        } else {
          throw new WarpException("overbuffer");
        }
      } while (true);
      this.socket.didWrite(((WsDataFrame<? extends Envelope>) frame).payloadValue());
    } else if (frame instanceof WsControlFrame<?, ?>) {
      this.socket.didWrite((WsControlFrame<?, ?>) frame);
    }
    this.generateDemand();
  }

  @Override
  public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
    do {
      final long oldStatus = WarpWebSocket.STATUS.get(this);
      final long newStatus = oldStatus | WarpWebSocket.UPGRADED;
      if (oldStatus != newStatus) {
        if (WarpWebSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.socket.didUpgrade(httpRequest, httpResponse);
          this.context.read(Envelope.decoder());
          this.generateDemand();
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
      final long oldStatus = WarpWebSocket.STATUS.get(this);
      final long newStatus = oldStatus & ~(WarpWebSocket.UPGRADED | WarpWebSocket.CLOSING);
      if (oldStatus != newStatus) {
        if (WarpWebSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    Throwable failure = null;
    try {
      this.socket.didDisconnect();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    this.close();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  @Override
  public void didFail(Throwable error) {
    Throwable failure = null;
    try {
      this.socket.didFail(error);
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    this.close();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
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
      final long oldStatus = WarpWebSocket.STATUS.get(this);
      final long oldSupply = oldStatus & WarpWebSocket.SUPPLY_MASK;
      final long newSupply = oldSupply + 1L;
      if (newSupply <= WarpWebSocket.SUPPLY_MAX) {
        if (pullRequest.stay(this, (int) oldSupply)) {
          final long newStatus = oldStatus & ~WarpWebSocket.SUPPLY_MASK | newSupply;
          if (WarpWebSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
            break;
          }
        } else {
          pullRequest.drop(new DropException("exceeded desired backlog: " + oldSupply));
          return;
        }
      } else {
        pullRequest.drop(new DropException("exceeded maximum supply: " + newSupply));
        return;
      }
    } while (true);
    this.supply.add(pullRequest, pullRequest.prio());
    this.generateDemand();
  }

  @Override
  public void feed(Envelope envelope, float prio) {
    this.feed(new PushRequest<Envelope>(envelope, prio));
  }

  @Override
  public void feed(Envelope envelope) {
    this.feed(envelope, 0.0f);
  }

  @Override
  public void push(Envelope envelope) {
    do {
      final long oldStatus = WarpWebSocket.STATUS.get(this);
      final long oldDemand = (oldStatus & WarpWebSocket.DEMAND_MASK) >>> WarpWebSocket.DEMAND_SHIFT;
      final long oldBuffer = (oldStatus & WarpWebSocket.BUFFER_MASK) >>> WarpWebSocket.BUFFER_SHIFT;
      final long newDemand = oldDemand - 1L;
      final long newBuffer = oldBuffer + 1L;
      if (newDemand >= 0L) {
        if (newBuffer <= WarpWebSocket.BUFFER_MAX) {
          final long newStatus = oldStatus & ~(WarpWebSocket.DEMAND_MASK | WarpWebSocket.BUFFER_MASK)
                                           | newDemand << WarpWebSocket.DEMAND_SHIFT
                                           | newBuffer << WarpWebSocket.BUFFER_SHIFT;
          if (WarpWebSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
            break;
          }
        } else {
          throw new WarpException("exceeded maximum buffer: " + newBuffer);
        }
      } else {
        throw new WarpException("overdemand");
      }
    } while (true);
    this.context.write(WsTextFrame.create(envelope, envelope.reconEncoder()));
  }

  @Override
  public void skip() {
    do {
      final long oldStatus = WarpWebSocket.STATUS.get(this);
      final long oldDemand = (oldStatus & WarpWebSocket.DEMAND_MASK) >>> WarpWebSocket.DEMAND_SHIFT;
      final long newDemand = oldDemand - 1L;
      if (newDemand >= 0L) {
        final long newStatus = oldStatus & ~WarpWebSocket.DEMAND_MASK | newDemand << WarpWebSocket.DEMAND_SHIFT;
        if (WarpWebSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      } else {
        throw new WarpException("overdemand");
      }
    } while (true);
  }

  protected void generateDemand() {
    demand:
    do {
      PullRequest<Envelope> pullRequest = null;
      do {
        final long oldStatus = WarpWebSocket.STATUS.get(this);
        if ((oldStatus & WarpWebSocket.UPGRADED) == 0) {
          return;
        }
        final long oldSupply = oldStatus & WarpWebSocket.SUPPLY_MASK;
        final long oldDemand = (oldStatus & WarpWebSocket.DEMAND_MASK) >>> WarpWebSocket.DEMAND_SHIFT;
        final long oldBuffer = (oldStatus & WarpWebSocket.BUFFER_MASK) >>> WarpWebSocket.BUFFER_SHIFT;
        if (pullRequest == null && oldSupply > 0L && oldDemand + oldBuffer < WarpWebSocket.TARGET_DEMAND) {
          pullRequest = this.supply.poll();
        }
        if (pullRequest != null) {
          final long newDemand = oldDemand + 1L;
          final long newSupply = oldSupply - 1L;
          if (newSupply >= 0L) {
            if (newDemand <= WarpWebSocket.DEMAND_MAX) {
              final long newStatus = oldStatus & ~(WarpWebSocket.SUPPLY_MASK | WarpWebSocket.DEMAND_MASK) | newSupply | newDemand << WarpWebSocket.DEMAND_SHIFT;
              if (WarpWebSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
                pullRequest.pull(this);
                if (newDemand < WarpWebSocket.TARGET_DEMAND) {
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
  public void write(WsControlFrame<?, ? extends Envelope> frame) {
    if (frame instanceof WsCloseFrame<?, ?>) {
      do {
        final long oldStatus = WarpWebSocket.STATUS.get(this);
        if ((oldStatus & (WarpWebSocket.UPGRADED | WarpWebSocket.CLOSING)) == WarpWebSocket.UPGRADED) {
          final long newStatus = oldStatus | WarpWebSocket.CLOSING;
          if (WarpWebSocket.STATUS.compareAndSet(this, oldStatus, newStatus)) {
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
    Throwable failure = null;
    try {
      PullRequest<Envelope> pullRequest = null;
      Throwable reason = null;
      do {
        pullRequest = this.supply.poll();
        if (pullRequest != null) {
          if (reason == null) {
            reason = new DropException("warp websocket closed");
          }
          try {
            pullRequest.drop(reason);
          } catch (Throwable cause) {
            if (!Cont.isNonFatal(cause)) {
              throw cause;
            }
            failure = cause;
          }
          continue;
        }
        break;
      } while (true);
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    final WebSocketContext<Envelope, Envelope> context = this.context;
    if (context != null) {
      context.close();
    }
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
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
      targetDemand = Math.min(Math.max(32, 4 * Runtime.getRuntime().availableProcessors()), (int) DEMAND_MAX - 1);
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
