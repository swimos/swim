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

package swim.runtime.warp;

import swim.api.Link;
import swim.api.SwimContext;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.warp.WarpDownlink;
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillReceive;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.concurrent.Stage;
import swim.runtime.CellContext;
import swim.runtime.DownlinkView;
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

public abstract class WarpDownlinkView extends DownlinkView implements WarpDownlink {
  protected final Uri meshUri;
  protected final Uri hostUri;
  protected final Uri nodeUri;
  protected final Uri laneUri;
  protected final float prio;
  protected final float rate;
  protected final Value body;
  protected volatile int flags;

  public WarpDownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                          Uri hostUri, Uri nodeUri, Uri laneUri, float prio,
                          float rate, Value body, int flags, Object observers) {
    super(cellContext, stage, observers);
    this.meshUri = meshUri.isDefined() ? meshUri : hostUri;
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.prio = prio;
    this.rate = rate;
    this.body = body;
    this.flags = flags;
  }

  @Override
  public abstract WarpDownlinkModel<?> downlinkModel();

  public final Uri meshUri() {
    return this.meshUri;
  }

  @Override
  public final Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public abstract WarpDownlinkView hostUri(Uri hostUri);

  @Override
  public abstract WarpDownlinkView hostUri(String hostUri);

  @Override
  public final Uri nodeUri() {
    return this.nodeUri;
  }

  @Override
  public abstract WarpDownlinkView nodeUri(Uri nodeUri);

  @Override
  public abstract WarpDownlinkView nodeUri(String nodeUri);

  @Override
  public final Uri laneUri() {
    return this.laneUri;
  }

  @Override
  public abstract WarpDownlinkView laneUri(Uri laneUri);

  @Override
  public abstract WarpDownlinkView laneUri(String laneUri);

  @Override
  public final float prio() {
    return this.prio;
  }

  @Override
  public abstract WarpDownlinkView prio(float prio);

  @Override
  public final float rate() {
    return this.rate;
  }

  @Override
  public abstract WarpDownlinkView rate(float rate);

  @Override
  public final Value body() {
    return this.body;
  }

  @Override
  public abstract WarpDownlinkView body(Value body);

  @Override
  public final boolean keepLinked() {
    return (this.flags & KEEP_LINKED) != 0;
  }

  @Override
  public abstract WarpDownlinkView keepLinked(boolean keepLinked);

  @Override
  public final boolean keepSynced() {
    return (this.flags & KEEP_SYNCED) != 0;
  }

  @Override
  public abstract WarpDownlinkView keepSynced(boolean keepSynced);

  @Override
  public WarpDownlinkView observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public WarpDownlinkView unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public abstract WarpDownlinkView willReceive(WillReceive willReceive);

  @Override
  public abstract WarpDownlinkView didReceive(DidReceive didReceive);

  @Override
  public abstract WarpDownlinkView willCommand(WillCommand willCommand);

  @Override
  public abstract WarpDownlinkView willLink(WillLink willLink);

  @Override
  public abstract WarpDownlinkView didLink(DidLink didLink);

  @Override
  public abstract WarpDownlinkView willSync(WillSync willSync);

  @Override
  public abstract WarpDownlinkView didSync(DidSync didSync);

  @Override
  public abstract WarpDownlinkView willUnlink(WillUnlink willUnlink);

  @Override
  public abstract WarpDownlinkView didUnlink(DidUnlink didUnlink);

  @Override
  public abstract WarpDownlinkView didConnect(DidConnect didConnect);

  @Override
  public abstract WarpDownlinkView didDisconnect(DidDisconnect didDisconnect);

  @Override
  public abstract WarpDownlinkView didClose(DidClose didClose);

  @Override
  public abstract WarpDownlinkView didFail(DidFail didFail);

  public boolean dispatchWillReceive(Value body, boolean preemptive) {
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

  public boolean dispatchDidReceive(Value body, boolean preemptive) {
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

  public boolean dispatchWillCommand(Value body, boolean preemptive) {
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

  public boolean dispatchWillLink(boolean preemptive) {
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

  public boolean dispatchDidLink(boolean preemptive) {
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

  public boolean dispatchWillSync(boolean preemptive) {
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

  public boolean dispatchDidSync(boolean preemptive) {
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

  public boolean dispatchWillUnlink(boolean preemptive) {
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

  public boolean dispatchDidUnlink(boolean preemptive) {
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

  @Override
  public abstract WarpDownlinkModel<?> createDownlinkModel();

  @Override
  public abstract WarpDownlinkView open();

  @Override
  public void command(float prio, Value body, Cont<CommandMessage> cont) {
    downlinkModel().command(prio, body, cont);
  }

  @Override
  public void command(Value body, Cont<CommandMessage> cont) {
    downlinkModel().command(body, cont);
  }

  @Override
  public void command(float prio, Value body) {
    downlinkModel().command(prio, body);
  }

  @Override
  public void command(Value body) {
    downlinkModel().command(body);
  }

  protected static final int KEEP_LINKED = 1 << 0;
  protected static final int KEEP_SYNCED = 1 << 1;
}
