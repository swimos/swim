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

import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.auth.Identity;
import swim.api.warp.WarpLane;
import swim.api.warp.WarpUplink;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.concurrent.Conts;
import swim.runtime.LaneView;
import swim.structure.Value;
import swim.warp.CommandMessage;

public abstract class WarpLaneView extends LaneView implements WarpLane {
  public WarpLaneView(Object observers) {
    super(observers);
  }

  @Override
  public WarpLaneView observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public WarpLaneView unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public abstract WarpLaneView willCommand(WillCommand willCommand);

  @Override
  public abstract WarpLaneView didCommand(DidCommand didCommand);

  @Override
  public abstract WarpLaneView willUplink(WillUplink willUplink);

  @Override
  public abstract WarpLaneView didUplink(DidUplink didUplink);

  @Override
  public abstract WarpLaneView willEnter(WillEnter willEnter);

  @Override
  public abstract WarpLaneView didEnter(DidEnter didEnter);

  @Override
  public abstract WarpLaneView willLeave(WillLeave willLeave);

  @Override
  public abstract WarpLaneView didLeave(DidLeave didLeave);

  public boolean dispatchWillCommand(Value body, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    try {
      SwimContext.setLane(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillCommand) {
        if (((WillCommand) observers).isPreemptive() == preemptive) {
          try {
            ((WillCommand) observers).willCommand(body);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              laneDidFail(error);
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
                  laneDidFail(error);
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
      SwimContext.setLane(oldLane);
    }
  }

  public boolean dispatchDidCommand(Value body, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    try {
      SwimContext.setLane(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidCommand) {
        if (((DidCommand) observers).isPreemptive() == preemptive) {
          try {
            ((DidCommand) observers).didCommand(body);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              laneDidFail(error);
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
          if (observer instanceof DidCommand) {
            if (((DidCommand) observer).isPreemptive() == preemptive) {
              try {
                ((DidCommand) observer).didCommand(body);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  laneDidFail(error);
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
      SwimContext.setLane(oldLane);
    }
  }

  public boolean dispatchWillUplink(WarpUplink uplink, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillUplink) {
        if (((WillUplink) observers).isPreemptive() == preemptive) {
          try {
            ((WillUplink) observers).willUplink(uplink);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              laneDidFail(error);
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
          if (observer instanceof WillUplink) {
            if (((WillUplink) observer).isPreemptive() == preemptive) {
              try {
                ((WillUplink) observer).willUplink(uplink);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  laneDidFail(error);
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
      SwimContext.setLane(oldLane);
    }
  }

  public boolean dispatchDidUplink(WarpUplink uplink, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidUplink) {
        if (((DidUplink) observers).isPreemptive() == preemptive) {
          try {
            ((DidUplink) observers).didUplink(uplink);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              laneDidFail(error);
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
          if (observer instanceof DidUplink) {
            if (((DidUplink) observer).isPreemptive() == preemptive) {
              try {
                ((DidUplink) observer).didUplink(uplink);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  laneDidFail(error);
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
      SwimContext.setLane(oldLane);
    }
  }

  public boolean dispatchWillEnter(Identity identity, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    SwimContext.setLane(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillEnter) {
        if (((WillEnter) observers).isPreemptive() == preemptive) {
          try {
            ((WillEnter) observers).willEnter(identity);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              laneDidFail(error);
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
          if (observer instanceof WillEnter) {
            if (((WillEnter) observer).isPreemptive() == preemptive) {
              try {
                ((WillEnter) observer).willEnter(identity);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  laneDidFail(error);
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
      SwimContext.setLane(oldLane);
    }
  }

  public boolean dispatchDidEnter(Identity identity, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    SwimContext.setLane(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidEnter) {
        if (((DidEnter) observers).isPreemptive() == preemptive) {
          try {
            ((DidEnter) observers).didEnter(identity);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              laneDidFail(error);
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
          if (observer instanceof DidEnter) {
            if (((DidEnter) observer).isPreemptive() == preemptive) {
              try {
                ((DidEnter) observer).didEnter(identity);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  laneDidFail(error);
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
      SwimContext.setLane(oldLane);
    }
  }

  public boolean dispatchWillLeave(Identity identity, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    SwimContext.setLane(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillLeave) {
        if (((WillLeave) observers).isPreemptive() == preemptive) {
          try {
            ((WillLeave) observers).willLeave(identity);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              laneDidFail(error);
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
          if (observer instanceof WillLeave) {
            if (((WillLeave) observer).isPreemptive() == preemptive) {
              try {
                ((WillLeave) observer).willLeave(identity);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  laneDidFail(error);
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
      SwimContext.setLane(oldLane);
    }
  }

  public boolean dispatchDidLeave(Identity identity, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    SwimContext.setLane(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidLeave) {
        if (((DidLeave) observers).isPreemptive() == preemptive) {
          try {
            ((DidLeave) observers).didLeave(identity);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              laneDidFail(error);
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
          if (observer instanceof DidLeave) {
            if (((DidLeave) observer).isPreemptive() == preemptive) {
              try {
                ((DidLeave) observer).didLeave(identity);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  laneDidFail(error);
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
      SwimContext.setLane(oldLane);
    }
  }

  public void laneWillCommand(CommandMessage message) {
    // stub
  }

  public void laneDidCommand(CommandMessage message) {
    // stub
  }

  public void laneWillUplink(WarpUplink uplink) {
    // stub
  }

  public void laneDidUplink(WarpUplink uplink) {
    // stub
  }

  public void laneWillEnter(Identity identity) {
    // stub
  }

  public void laneDidEnter(Identity identity) {
    // stub
  }

  public void laneWillLeave(Identity identity) {
    // stub
  }

  public void laneDidLeave(Identity identity) {
    // stub
  }
}
