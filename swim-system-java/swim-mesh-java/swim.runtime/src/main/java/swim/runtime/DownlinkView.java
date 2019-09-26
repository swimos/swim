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

package swim.runtime;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Downlink;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.auth.Identity;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Conts;
import swim.concurrent.Stage;

public abstract class DownlinkView implements Downlink {
  protected final CellContext cellContext;
  protected final Stage stage;

  protected volatile Object observers; // Observer | Observer[]

  public DownlinkView(CellContext cellContext, Stage stage, Object observers) {
    this.cellContext = cellContext;
    this.stage = stage;
    this.observers = observers;
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
  public DownlinkView observe(Object newObserver) {
    do {
      final Object oldObservers = this.observers;
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
      if (OBSERVERS.compareAndSet(this, oldObservers, newObservers)) {
        break;
      }
    } while (true);
    return this;
  }

  @Override
  public DownlinkView unobserve(Object oldObserver) {
    do {
      final Object oldObservers = this.observers;
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
      if (OBSERVERS.compareAndSet(this, oldObservers, newObservers)) {
        break;
      }
    } while (true);
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
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidConnect) {
        if (((DidConnect) observers).isPreemptive() == preemptive) {
          try {
            ((DidConnect) observers).didConnect();
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DidConnect) {
            if (((DidConnect) observer).isPreemptive() == preemptive) {
              try {
                ((DidConnect) observer).didConnect();
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  public boolean dispatchDidDisconnect(boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidDisconnect) {
        if (((DidDisconnect) observers).isPreemptive() == preemptive) {
          try {
            ((DidDisconnect) observers).didDisconnect();
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DidDisconnect) {
            if (((DidDisconnect) observer).isPreemptive() == preemptive) {
              try {
                ((DidDisconnect) observer).didDisconnect();
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  public boolean dispatchDidClose(boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidClose) {
        if (((DidClose) observers).isPreemptive() == preemptive) {
          try {
            ((DidClose) observers).didClose();
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DidClose) {
            if (((DidClose) observer).isPreemptive() == preemptive) {
              try {
                ((DidClose) observer).didClose();
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  public boolean dispatchDidFail(Throwable cause, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidFail) {
        if (((DidFail) observers).isPreemptive() == preemptive) {
          try {
            ((DidFail) observers).didFail(cause);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DidFail) {
            if (((DidFail) observer).isPreemptive() == preemptive) {
              try {
                ((DidFail) observer).didFail(cause);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
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

  static final AtomicReferenceFieldUpdater<DownlinkView, Object> OBSERVERS =
      AtomicReferenceFieldUpdater.newUpdater(DownlinkView.class, Object.class, "observers");
}
