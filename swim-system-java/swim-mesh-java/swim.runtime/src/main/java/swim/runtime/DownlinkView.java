// Copyright 2015-2020 SWIM.AI inc.
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

package swim.runtime;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.Objects;
import swim.api.Downlink;
import swim.api.auth.Identity;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Stage;
import swim.observable.Observer;
import swim.runtime.observer.LaneObserver;

public abstract class DownlinkView implements Downlink {

  //  static final AtomicReferenceFieldUpdater<DownlinkView, LaneObserver> OBSERVERS =
//      AtomicReferenceFieldUpdater.newUpdater(DownlinkView.class, LaneObserver.class, "observers");
  protected final CellContext cellContext;
  protected final Stage stage;
  //  protected volatile Object observers; // Observer | Observer[]
  protected volatile LaneObserver observers;

  public DownlinkView(CellContext cellContext, Stage stage, LaneObserver observers) {
    this.cellContext = cellContext;
    this.stage = stage;
    this.observers = Objects.requireNonNullElseGet(observers, LaneObserver::new);
  }

  public final CellContext cellContext() {
    return this.cellContext;
  }

  public abstract DownlinkModel<?> downlinkModel();

  public final Stage stage() {
    return this.stage;
  }

  @Override
  public boolean isConnected() {
    final DownlinkModel<?> model = downlinkModel();
    return model != null && model.isConnected();
  }

  @Override
  public boolean isRemote() {
    final DownlinkModel<?> model = downlinkModel();
    return model != null && model.isRemote();
  }

  @Override
  public boolean isSecure() {
    final DownlinkModel<?> model = downlinkModel();
    return model != null && model.isSecure();
  }

  @Override
  public String securityProtocol() {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      return model.securityProtocol();
    } else {
      return null;
    }
  }

  @Override
  public String cipherSuite() {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      return model.cipherSuite();
    } else {
      return null;
    }
  }

  @Override
  public InetSocketAddress localAddress() {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      return model.localAddress();
    } else {
      return null;
    }
  }

  @Override
  public Identity localIdentity() {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      return model.localIdentity();
    } else {
      return null;
    }
  }

  @Override
  public Principal localPrincipal() {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      return model.localPrincipal();
    } else {
      return null;
    }
  }

  @Override
  public Collection<Certificate> localCertificates() {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      return model.localCertificates();
    } else {
      return FingerTrieSeq.empty();
    }
  }

  @Override
  public InetSocketAddress remoteAddress() {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      return model.remoteAddress();
    } else {
      return null;
    }
  }

  @Override
  public Identity remoteIdentity() {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      return model.remoteIdentity();
    } else {
      return null;
    }
  }

  @Override
  public Principal remotePrincipal() {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      return model.remotePrincipal();
    } else {
      return null;
    }
  }

  @Override
  public Collection<Certificate> remoteCertificates() {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      return model.remoteCertificates();
    } else {
      return FingerTrieSeq.empty();
    }
  }

  @Override
  public DownlinkView observe(Observer newObserver) {
    this.observers.observe(newObserver);
    return this;
  }

  @Override
  public DownlinkView unobserve(Observer oldObserver) {
    //todo
    return this;
  }

  @Override
  public abstract DownlinkView didConnect(DidConnect didConnect);

  @Override
  public abstract DownlinkView didDisconnect(DidDisconnect didDisconnect);

  @Override
  public abstract DownlinkView didClose(DidClose didClose);

  @Override
  public abstract DownlinkView didFail(DidFail didFail);

  public boolean dispatchDidConnect(boolean preemptive) {
    return this.observers.dispatchDidConnect(this, preemptive);
  }

  public boolean dispatchDidDisconnect(boolean preemptive) {
    return this.observers.dispatchDidDisconnect(this, preemptive);
  }

  public boolean dispatchDidClose(boolean preemptive) {
    return this.observers.dispatchDidClose(this, preemptive);
  }

  public boolean dispatchDidFail(Throwable cause, boolean preemptive) {
    return this.observers.dispatchDidFail(this, preemptive, cause);
  }

  public void downlinkDidConnect() {
    // stub
  }

  public void downlinkDidDisconnect() {
    // stub
  }

  public void downlinkDidClose() {
    // stub
  }

  public void downlinkDidFail(Throwable error) {
    // stub
  }

  public abstract DownlinkModel<?> createDownlinkModel();

  @Override
  public abstract DownlinkView open();

  @SuppressWarnings("unchecked")
  @Override
  public void close() {
    ((DownlinkModel<DownlinkView>) downlinkModel()).removeDownlink(this);
  }

  @Override
  public void trace(Object message) {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      model.trace(message);
    }
  }

  @Override
  public void debug(Object message) {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      model.debug(message);
    }
  }

  @Override
  public void info(Object message) {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      model.info(message);
    }
  }

  @Override
  public void warn(Object message) {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      model.warn(message);
    }
  }

  @Override
  public void error(Object message) {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      model.error(message);
    }
  }

  @Override
  public void fail(Object message) {
    final DownlinkModel<?> model = downlinkModel();
    if (model != null) {
      model.fail(message);
    }
  }

}
