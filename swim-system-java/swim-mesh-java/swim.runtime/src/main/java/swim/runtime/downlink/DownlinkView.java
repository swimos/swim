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

package swim.runtime.downlink;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.auth.Identity;
import swim.api.downlink.Downlink;
import swim.api.downlink.function.DidLink;
import swim.api.downlink.function.DidReceive;
import swim.api.downlink.function.DidSync;
import swim.api.downlink.function.DidUnlink;
import swim.api.downlink.function.WillLink;
import swim.api.downlink.function.WillReceive;
import swim.api.downlink.function.WillSync;
import swim.api.downlink.function.WillUnlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.function.WillCommand;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Conts;
import swim.concurrent.Stage;
import swim.runtime.CellContext;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;
import swim.warp.EventMessage;
import swim.warp.LinkRequest;
import swim.warp.LinkedResponse;
import swim.warp.SyncRequest;
import swim.warp.SyncedResponse;
import swim.warp.UnlinkRequest;
import swim.warp.UnlinkedResponse;

public abstract class DownlinkView implements Downlink {
  protected final CellContext cellContext;
  protected final Stage stage;
  protected final Uri meshUri;
  protected final Uri hostUri;
  protected final Uri nodeUri;
  protected final Uri laneUri;
  protected final float prio;
  protected final float rate;
  protected final Value body;

  protected volatile int flags;
  protected volatile Object observers; // Observer | Observer[]

  public DownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                      Uri hostUri, Uri nodeUri, Uri laneUri, float prio,
                      float rate, Value body, int flags, Object observers) {
    this.cellContext = cellContext;
    this.stage = stage;
    this.meshUri = meshUri.isDefined() ? meshUri : hostUri;
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.prio = prio;
    this.rate = rate;
    this.body = body;
    this.flags = flags;
    this.observers = observers;
  }

  public final CellContext cellContext() {
    return this.cellContext;
  }

  public abstract DownlinkModel<?> downlinkModel();

  public final Stage stage() {
    return this.stage;
  }

  public final Uri meshUri() {
    return this.meshUri;
  }

  @Override
  public final Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public abstract DownlinkView hostUri(Uri hostUri);

  @Override
  public abstract DownlinkView hostUri(String hostUri);

  @Override
  public final Uri nodeUri() {
    return this.nodeUri;
  }

  @Override
  public abstract DownlinkView nodeUri(Uri nodeUri);

  @Override
  public abstract DownlinkView nodeUri(String nodeUri);

  @Override
  public final Uri laneUri() {
    return this.laneUri;
  }

  @Override
  public abstract DownlinkView laneUri(Uri laneUri);

  @Override
  public abstract DownlinkView laneUri(String laneUri);

  @Override
  public final float prio() {
    return this.prio;
  }

  @Override
  public abstract DownlinkView prio(float prio);

  @Override
  public final float rate() {
    return this.rate;
  }

  @Override
  public abstract DownlinkView rate(float rate);

  @Override
  public final Value body() {
    return this.body;
  }

  @Override
  public abstract DownlinkView body(Value body);

  @Override
  public final boolean keepLinked() {
    return (this.flags & KEEP_LINKED) != 0;
  }

  @Override
  public abstract DownlinkView keepLinked(boolean keepLinked);

  @Override
  public final boolean keepSynced() {
    return (this.flags & KEEP_SYNCED) != 0;
  }

  @Override
  public abstract DownlinkView keepSynced(boolean keepSynced);

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
  public abstract DownlinkView willReceive(WillReceive willReceive);

  @Override
  public abstract DownlinkView didReceive(DidReceive didReceive);

  @Override
  public abstract DownlinkView willCommand(WillCommand willCommand);

  @Override
  public abstract DownlinkView willLink(WillLink willLink);

  @Override
  public abstract DownlinkView didLink(DidLink didLink);

  @Override
  public abstract DownlinkView willSync(WillSync willSync);

  @Override
  public abstract DownlinkView didSync(DidSync didSync);

  @Override
  public abstract DownlinkView willUnlink(WillUnlink willUnlink);

  @Override
  public abstract DownlinkView didUnlink(DidUnlink didUnlink);

  @Override
  public abstract DownlinkView didConnect(DidConnect didConnect);

  @Override
  public abstract DownlinkView didDisconnect(DidDisconnect didDisconnect);

  @Override
  public abstract DownlinkView didClose(DidClose didClose);

  @Override
  public abstract DownlinkView didFail(DidFail didFail);

  protected boolean dispatchWillReceive(Value body, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillReceive) {
        if (((WillReceive) observers).isPreemptive() == preemptive) {
          try {
            ((WillReceive) observers).willReceive(body);
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
          if (observer instanceof WillReceive) {
            if (((WillReceive) observer).isPreemptive() == preemptive) {
              try {
                ((WillReceive) observer).willReceive(body);
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

  protected boolean dispatchDidReceive(Value body, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidReceive) {
        if (((DidReceive) observers).isPreemptive() == preemptive) {
          try {
            ((DidReceive) observers).didReceive(body);
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
          if (observer instanceof DidReceive) {
            if (((DidReceive) observer).isPreemptive() == preemptive) {
              try {
                ((DidReceive) observer).didReceive(body);
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

  protected boolean dispatchWillCommand(Value body, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillCommand) {
        if (((WillCommand) observers).isPreemptive() == preemptive) {
          try {
            ((WillCommand) observers).willCommand(body);
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
          if (observer instanceof WillCommand) {
            if (((WillCommand) observer).isPreemptive() == preemptive) {
              try {
                ((WillCommand) observer).willCommand(body);
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

  protected boolean dispatchWillLink(boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillLink) {
        if (((WillLink) observers).isPreemptive() == preemptive) {
          try {
            ((WillLink) observers).willLink();
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
          if (observer instanceof WillLink) {
            if (((WillLink) observer).isPreemptive() == preemptive) {
              try {
                ((WillLink) observer).willLink();
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

  protected boolean dispatchDidLink(boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidLink) {
        if (((DidLink) observers).isPreemptive() == preemptive) {
          try {
            ((DidLink) observers).didLink();
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
          if (observer instanceof DidLink) {
            if (((DidLink) observer).isPreemptive() == preemptive) {
              try {
                ((DidLink) observer).didLink();
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

  protected boolean dispatchWillSync(boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillSync) {
        if (((WillSync) observers).isPreemptive() == preemptive) {
          try {
            ((WillSync) observers).willSync();
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
          if (observer instanceof WillSync) {
            if (((WillSync) observer).isPreemptive() == preemptive) {
              try {
                ((WillSync) observer).willSync();
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

  protected boolean dispatchDidSync(boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidSync) {
        if (((DidSync) observers).isPreemptive() == preemptive) {
          try {
            ((DidSync) observers).didSync();
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
          if (observer instanceof DidSync) {
            if (((DidSync) observer).isPreemptive() == preemptive) {
              try {
                ((DidSync) observer).didSync();
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

  protected boolean dispatchWillUnlink(boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillUnlink) {
        if (((WillUnlink) observers).isPreemptive() == preemptive) {
          try {
            ((WillUnlink) observers).willUnlink();
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
          if (observer instanceof WillUnlink) {
            if (((WillUnlink) observer).isPreemptive() == preemptive) {
              try {
                ((WillUnlink) observer).willUnlink();
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

  protected boolean dispatchDidUnlink(boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidUnlink) {
        if (((DidUnlink) observers).isPreemptive() == preemptive) {
          try {
            ((DidUnlink) observers).didUnlink();
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
          if (observer instanceof DidUnlink) {
            if (((DidUnlink) observer).isPreemptive() == preemptive) {
              try {
                ((DidUnlink) observer).didUnlink();
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

  protected boolean dispatchDidConnect(boolean preemptive) {
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

  protected boolean dispatchDidDisconnect(boolean preemptive) {
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

  protected boolean dispatchDidClose(boolean preemptive) {
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

  protected boolean dispatchDidFail(Throwable cause, boolean preemptive) {
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

  public void downlinkWillReceive(EventMessage message) {
    // stub
  }

  public void downlinkDidReceive(EventMessage message) {
    // stub
  }

  public void downlinkWillCommand(CommandMessage message) {
    // stub
  }

  public void downlinkWillLink(LinkRequest request) {
    // stub
  }

  public void downlinkDidLink(LinkedResponse response) {
    // stub
  }

  public void downlinkWillSync(SyncRequest request) {
    // stub
  }

  public void downlinkDidSync(SyncedResponse response) {
    // stub
  }

  public void downlinkWillUnlink(UnlinkRequest request) {
    // stub
  }

  public void downlinkDidUnlink(UnlinkedResponse response) {
    // stub
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

  @Override
  public void command(float prio, Value body) {
    downlinkModel().command(prio, body);
  }

  @Override
  public void command(Value body) {
    downlinkModel().command(body);
  }

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

  protected static final int KEEP_LINKED = 1 << 0;
  protected static final int KEEP_SYNCED = 1 << 1;

  static final AtomicReferenceFieldUpdater<DownlinkView, Object> OBSERVERS =
      AtomicReferenceFieldUpdater.newUpdater(DownlinkView.class, Object.class, "observers");
}
