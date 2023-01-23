// Copyright 2015-2023 Swim.inc
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

package swim.system;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Uplink;
import swim.api.auth.Identity;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.structure.Value;
import swim.uri.Uri;

public abstract class AbstractUplinkContext implements LinkContext, Uplink {

  protected volatile Object observers; // Observer | Observer[]

  public AbstractUplinkContext() {
    this.observers = null;
  }

  public abstract LaneBinding laneBinding();

  @Override
  public abstract LinkBinding linkWrapper();

  public abstract LinkBinding linkBinding();

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLink(Class<T> linkClass) {
    if (linkClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomLink(Class<T> linkClass) {
    if (linkClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  public abstract Stage stage();

  @Override
  public abstract Uri hostUri();

  @Override
  public abstract Uri nodeUri();

  @Override
  public abstract Uri laneUri();

  @Override
  public abstract Value linkKey();

  @Override
  public UplinkAddress cellAddressUp() {
    return this.laneBinding().cellAddress().linkKey(this.linkKey());
  }

  @Override
  public boolean isConnectedUp() {
    return true;
  }

  @Override
  public boolean isRemoteUp() {
    return false;
  }

  @Override
  public boolean isSecureUp() {
    return true;
  }

  @Override
  public String securityProtocolUp() {
    return null;
  }

  @Override
  public String cipherSuiteUp() {
    return null;
  }

  @Override
  public InetSocketAddress localAddressUp() {
    return null;
  }

  @Override
  public Identity localIdentityUp() {
    return null;
  }

  @Override
  public Principal localPrincipalUp() {
    return null;
  }

  @Override
  public Collection<Certificate> localCertificatesUp() {
    return FingerTrieSeq.empty();
  }

  @Override
  public InetSocketAddress remoteAddressUp() {
    return null;
  }

  @Override
  public Identity remoteIdentityUp() {
    return null;
  }

  @Override
  public Principal remotePrincipalUp() {
    return null;
  }

  @Override
  public Collection<Certificate> remoteCertificatesUp() {
    return FingerTrieSeq.empty();
  }

  @Override
  public boolean isConnected() {
    return this.linkBinding().isConnectedDown();
  }

  @Override
  public boolean isRemote() {
    return this.linkBinding().isRemoteDown();
  }

  @Override
  public boolean isSecure() {
    return this.linkBinding().isSecureDown();
  }

  @Override
  public String securityProtocol() {
    return this.linkBinding().securityProtocolDown();
  }

  @Override
  public String cipherSuite() {
    return this.linkBinding().cipherSuiteDown();
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.linkBinding().localAddressDown();
  }

  @Override
  public Identity localIdentity() {
    return this.linkBinding().localIdentityDown();
  }

  @Override
  public Principal localPrincipal() {
    return this.linkBinding().localPrincipalDown();
  }

  @Override
  public Collection<Certificate> localCertificates() {
    return this.linkBinding().localCertificatesDown();
  }

  @Override
  public InetSocketAddress remoteAddress() {
    return this.linkBinding().remoteAddressDown();
  }

  @Override
  public Identity remoteIdentity() {
    return this.linkBinding().remoteIdentityDown();
  }

  @Override
  public Principal remotePrincipal() {
    return this.linkBinding().remotePrincipalDown();
  }

  @Override
  public Collection<Certificate> remoteCertificates() {
    return this.linkBinding().remoteCertificatesDown();
  }

  @Override
  public AbstractUplinkContext observe(Object newObserver) {
    do {
      final Object oldObservers = AbstractUplinkContext.OBSERVERS.get(this);
      final Object newObservers;
      if (oldObservers == null) {
        newObservers = newObserver;
      } else if (!(oldObservers instanceof Object[])) {
        final Object[] newArray = new Object[2];
        newArray[0] = oldObservers;
        newArray[1] = newObserver;
        newObservers = newArray;
      } else {
        final Object[] oldArray = (Object[]) oldObservers;
        final int oldCount = oldArray.length;
        final Object[] newArray = new Object[oldCount + 1];
        System.arraycopy(oldArray, 0, newArray, 0, oldCount);
        newArray[oldCount] = newObserver;
        newObservers = newArray;
      }
      if (AbstractUplinkContext.OBSERVERS.compareAndSet(this, oldObservers, newObservers)) {
        break;
      }
    } while (true);
    return this;
  }

  @Override
  public AbstractUplinkContext unobserve(Object oldObserver) {
    do {
      final Object oldObservers = AbstractUplinkContext.OBSERVERS.get(this);
      final Object newObservers;
      if (oldObservers == null) {
        break;
      } else if (!(oldObservers instanceof Object[])) {
        if (oldObservers == oldObserver) { // found as sole observer
          newObservers = null;
        } else {
          break; // not found
        }
      } else {
        final Object[] oldArray = (Object[]) oldObservers;
        final int oldCount = oldArray.length;
        if (oldCount == 2) {
          if (oldArray[0] == oldObserver) { // found at index 0
            newObservers = oldArray[1];
          } else if (oldArray[1] == oldObserver) { // found at index 1
            newObservers = oldArray[0];
          } else {
            break; // not found
          }
        } else {
          int i = 0;
          while (i < oldCount) {
            if (oldArray[i] == oldObserver) { // found at index i
              break;
            }
            i += 1;
          }
          if (i < oldCount) {
            final Object[] newArray = new Object[oldCount - 1];
            System.arraycopy(oldArray, 0, newArray, 0, i);
            System.arraycopy(oldArray, i + 1, newArray, i, oldCount - 1 - i);
            newObservers = newArray;
          } else {
            break; // not found
          }
        }
      }
      if (AbstractUplinkContext.OBSERVERS.compareAndSet(this, oldObservers, newObservers)) {
        break;
      }
    } while (true);
    return this;
  }

  @Override
  public void closeUp() {
    this.didClose();
  }

  @Override
  public void close() {
    this.closeUp();
  }

  @Override
  public void didOpenDown() {
    // hook
  }

  @Override
  public void didCloseDown() {
    this.didClose();
  }

  protected void didClose() {
    this.laneBinding().closeUplink(this.linkKey());
  }

  @Override
  public void didFailDown(Throwable error) {
    try {
      if (Cont.isNonFatal(error)) {
        this.laneBinding().didFail(error);
      }
    } finally {
      this.didClose();
    }
  }

  protected void didFail(Throwable error) {
    this.laneBinding().didFail(error);
  }

  @Override
  public void traceUp(Object message) {
    this.laneBinding().trace(message);
  }

  @Override
  public void debugUp(Object message) {
    this.laneBinding().debug(message);
  }

  @Override
  public void infoUp(Object message) {
    this.laneBinding().info(message);
  }

  @Override
  public void warnUp(Object message) {
    this.laneBinding().warn(message);
  }

  @Override
  public void errorUp(Object message) {
    this.laneBinding().error(message);
  }

  @Override
  public void failUp(Object message) {
    this.laneBinding().fail(message);
  }

  @Override
  public void trace(Object message) {
    this.linkBinding().traceDown(message);
  }

  @Override
  public void debug(Object message) {
    this.linkBinding().debugDown(message);
  }

  @Override
  public void info(Object message) {
    this.linkBinding().infoDown(message);
  }

  @Override
  public void warn(Object message) {
    this.linkBinding().warnDown(message);
  }

  @Override
  public void error(Object message) {
    this.linkBinding().errorDown(message);
  }

  @Override
  public void fail(Object message) {
    this.linkBinding().failDown(message);
  }

  static final AtomicReferenceFieldUpdater<AbstractUplinkContext, Object> OBSERVERS =
      AtomicReferenceFieldUpdater.newUpdater(AbstractUplinkContext.class, Object.class, "observers");

}
