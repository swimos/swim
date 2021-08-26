// Copyright 2015-2021 Swim Inc.
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

import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;

public abstract class AbstractTierBinding extends AbstractWarpRef implements TierBinding {

  protected volatile int status;

  public AbstractTierBinding() {
    this.status = 0;
  }

  @Override
  public abstract TierContext tierContext();

  @Override
  public boolean isClosed() {
    final int state = (AbstractTierBinding.STATUS.get(this) & AbstractTierBinding.STATE_MASK);
    return state == AbstractTierBinding.CLOSED_STATE;
  }

  @Override
  public boolean isOpened() {
    final int state = (AbstractTierBinding.STATUS.get(this) & AbstractTierBinding.STATE_MASK);
    return state >= AbstractTierBinding.OPENED_STATE;
  }

  @Override
  public boolean isLoaded() {
    final int state = (AbstractTierBinding.STATUS.get(this) & AbstractTierBinding.STATE_MASK);
    return state >= AbstractTierBinding.LOADED_STATE;
  }

  @Override
  public boolean isStarted() {
    final int state = (AbstractTierBinding.STATUS.get(this) & AbstractTierBinding.STATE_MASK);
    return state == AbstractTierBinding.STARTED_STATE;
  }

  protected void activate(TierBinding childTier) {
    final int state = AbstractTierBinding.STATUS.get(this) & AbstractTierBinding.STATE_MASK;
    if (state >= AbstractTierBinding.STARTING_STATE) {
      childTier.start();
    } else if (state >= AbstractTierBinding.LOADING_STATE) {
      childTier.load();
    } else if (state >= AbstractTierBinding.OPENING_STATE) {
      childTier.open();
    }
  }

  @Override
  public void open() {
    int oldStatus;
    int newStatus;
    int oldState;
    int newState;
    int oldPhase;
    final int newPhase = AbstractTierBinding.OPENED_PHASE;
    do {
      oldStatus = AbstractTierBinding.STATUS.get(this);
      oldState = oldStatus & AbstractTierBinding.STATE_MASK;
      oldPhase = (oldStatus & AbstractTierBinding.PHASE_MASK) >>> AbstractTierBinding.PHASE_SHIFT;
      if (newPhase > oldPhase) {
        if (oldState == AbstractTierBinding.CLOSED_STATE) {
          newState = AbstractTierBinding.OPENING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & AbstractTierBinding.STATE_MASK | (newPhase << AbstractTierBinding.PHASE_SHIFT) & AbstractTierBinding.PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !AbstractTierBinding.STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == AbstractTierBinding.OPENING_STATE) {
        this.willOpen();
        this.convergeState();
      }
    }
  }

  @Override
  public void load() {
    int oldStatus;
    int newStatus;
    int oldState;
    int newState;
    int oldPhase;
    final int newPhase = AbstractTierBinding.LOADED_PHASE;
    do {
      oldStatus = AbstractTierBinding.STATUS.get(this);
      oldState = oldStatus & AbstractTierBinding.STATE_MASK;
      oldPhase = (oldStatus & AbstractTierBinding.PHASE_MASK) >>> AbstractTierBinding.PHASE_SHIFT;
      if (newPhase > oldPhase) {
        if (oldState == AbstractTierBinding.OPENED_STATE) {
          newState = AbstractTierBinding.LOADING_STATE;
        } else if (oldState == AbstractTierBinding.CLOSED_STATE) {
          newState = AbstractTierBinding.OPENING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & AbstractTierBinding.STATE_MASK | (newPhase << AbstractTierBinding.PHASE_SHIFT) & AbstractTierBinding.PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !AbstractTierBinding.STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == AbstractTierBinding.LOADING_STATE) {
        this.willLoad();
        this.convergeState();
      } else if (newState == AbstractTierBinding.OPENING_STATE) {
        this.willOpen();
        this.convergeState();
      }
    }
  }

  @Override
  public void start() {
    int oldStatus;
    int newStatus;
    int oldState;
    int newState;
    int oldPhase;
    final int newPhase = AbstractTierBinding.STARTED_PHASE;
    do {
      oldStatus = AbstractTierBinding.STATUS.get(this);
      oldState = oldStatus & AbstractTierBinding.STATE_MASK;
      oldPhase = (oldStatus & PHASE_MASK) >>> AbstractTierBinding.PHASE_SHIFT;
      if (newPhase > oldPhase) {
        if (oldState == AbstractTierBinding.LOADED_STATE) {
          newState = AbstractTierBinding.STARTING_STATE;
        } else if (oldState == AbstractTierBinding.OPENED_STATE) {
          newState = AbstractTierBinding.LOADING_STATE;
        } else if (oldState == AbstractTierBinding.CLOSED_STATE) {
          newState = AbstractTierBinding.OPENING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & AbstractTierBinding.STATE_MASK | (newPhase << AbstractTierBinding.PHASE_SHIFT) & PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !AbstractTierBinding.STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == AbstractTierBinding.STARTING_STATE) {
        this.willStart();
        this.convergeState();
      } else if (newState == AbstractTierBinding.LOADING_STATE) {
        this.willLoad();
        this.convergeState();
      } else if (newState == AbstractTierBinding.OPENING_STATE) {
        this.willOpen();
        this.convergeState();
      }
    }
  }

  @Override
  public void stop() {
    int oldStatus;
    int newStatus;
    int oldState;
    int newState;
    int oldPhase;
    final int newPhase = AbstractTierBinding.LOADED_PHASE;
    do {
      oldStatus = AbstractTierBinding.STATUS.get(this);
      oldState = oldStatus & AbstractTierBinding.STATE_MASK;
      oldPhase = (oldStatus & PHASE_MASK) >>> AbstractTierBinding.PHASE_SHIFT;
      if (newPhase < oldPhase) {
        if (oldState == AbstractTierBinding.STARTED_STATE) {
          newState = AbstractTierBinding.STOPPING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & AbstractTierBinding.STATE_MASK | (newPhase << AbstractTierBinding.PHASE_SHIFT) & PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !AbstractTierBinding.STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == AbstractTierBinding.STOPPING_STATE) {
        this.willStop();
        this.convergeState();
      }
    }
  }

  @Override
  public void unload() {
    int oldStatus;
    int newStatus;
    int oldState;
    int newState;
    int oldPhase;
    final int newPhase = AbstractTierBinding.OPENED_PHASE;
    do {
      oldStatus = AbstractTierBinding.STATUS.get(this);
      oldState = oldStatus & AbstractTierBinding.STATE_MASK;
      oldPhase = (oldStatus & PHASE_MASK) >>> AbstractTierBinding.PHASE_SHIFT;
      if (newPhase < oldPhase) {
        if (oldState == AbstractTierBinding.LOADED_STATE) {
          newState = AbstractTierBinding.UNLOADING_STATE;
        } else if (oldState == AbstractTierBinding.STARTED_STATE) {
          newState = AbstractTierBinding.STOPPING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & AbstractTierBinding.STATE_MASK | (newPhase << AbstractTierBinding.PHASE_SHIFT) & PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !AbstractTierBinding.STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == AbstractTierBinding.UNLOADING_STATE) {
        this.willUnload();
        this.convergeState();
      } else if (newState == AbstractTierBinding.STOPPING_STATE) {
        this.willStop();
        this.convergeState();
      }
    }
  }

  @Override
  public void close() {
    int oldStatus;
    int newStatus;
    int oldState;
    int newState;
    int oldPhase;
    final int newPhase = AbstractTierBinding.CLOSED_PHASE;
    do {
      oldStatus = AbstractTierBinding.STATUS.get(this);
      oldState = oldStatus & AbstractTierBinding.STATE_MASK;
      oldPhase = (oldStatus & PHASE_MASK) >>> AbstractTierBinding.PHASE_SHIFT;
      if (newPhase < oldPhase) {
        if (oldState == AbstractTierBinding.OPENED_STATE) {
          newState = AbstractTierBinding.CLOSING_STATE;
        } else if (oldState == AbstractTierBinding.LOADED_STATE) {
          newState = AbstractTierBinding.UNLOADING_STATE;
        } else if (oldState == AbstractTierBinding.STARTED_STATE) {
          newState = AbstractTierBinding.STOPPING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & AbstractTierBinding.STATE_MASK | (newPhase << AbstractTierBinding.PHASE_SHIFT) & PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !AbstractTierBinding.STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == AbstractTierBinding.CLOSING_STATE) {
        this.willClose();
        this.convergeState();
      } else if (newState == AbstractTierBinding.UNLOADING_STATE) {
        this.willUnload();
        this.convergeState();
      } else if (newState == AbstractTierBinding.STOPPING_STATE) {
        this.willStop();
        this.convergeState();
      }
    }
  }

  void convergeState() {
    call: do {
      int oldStatus;
      int newStatus;
      int oldState;
      int newState;
      loop: do {
        oldStatus = AbstractTierBinding.STATUS.get(this);
        oldState = oldStatus & AbstractTierBinding.STATE_MASK;
        final int phase = (oldStatus & PHASE_MASK) >>> AbstractTierBinding.PHASE_SHIFT;
        switch (oldState) {
          case AbstractTierBinding.OPENING_STATE:
            newState = phase > AbstractTierBinding.OPENED_PHASE ? AbstractTierBinding.LOADING_STATE : phase < AbstractTierBinding.OPENED_PHASE ? AbstractTierBinding.CLOSING_STATE : AbstractTierBinding.OPENED_STATE;
            break;
          case AbstractTierBinding.LOADING_STATE:
            newState = phase > AbstractTierBinding.LOADED_PHASE ? AbstractTierBinding.STARTING_STATE : phase < AbstractTierBinding.LOADED_PHASE ? AbstractTierBinding.UNLOADING_STATE : AbstractTierBinding.LOADED_STATE;
            break;
          case AbstractTierBinding.STARTING_STATE:
            newState = phase < AbstractTierBinding.STARTED_PHASE ? AbstractTierBinding.STOPPING_STATE : AbstractTierBinding.STARTED_STATE;
            break;
          case AbstractTierBinding.STOPPING_STATE:
            newState = phase < AbstractTierBinding.LOADED_PHASE ? AbstractTierBinding.UNLOADING_STATE : phase > AbstractTierBinding.LOADED_PHASE ? AbstractTierBinding.STARTING_STATE : AbstractTierBinding.LOADED_STATE;
            break;
          case AbstractTierBinding.UNLOADING_STATE:
            newState = phase < AbstractTierBinding.OPENED_PHASE ? AbstractTierBinding.CLOSING_STATE : phase > AbstractTierBinding.OPENED_PHASE ? AbstractTierBinding.LOADING_STATE : AbstractTierBinding.OPENED_STATE;
            break;
          case AbstractTierBinding.CLOSING_STATE:
            newState = phase > AbstractTierBinding.CLOSED_PHASE ? AbstractTierBinding.OPENING_STATE : AbstractTierBinding.CLOSED_STATE;
            break;
          default:
            newState = oldState;
            newStatus = oldStatus;
            break loop;
        }
        newStatus = oldStatus & ~AbstractTierBinding.STATE_MASK | newState & AbstractTierBinding.STATE_MASK;
      } while (oldStatus != newStatus && !AbstractTierBinding.STATUS.compareAndSet(this, oldStatus, newStatus));

      if (oldState != newState) {
        switch (oldState) {
          case AbstractTierBinding.OPENING_STATE:
            this.didOpen();
            break;
          case AbstractTierBinding.LOADING_STATE:
            this.didLoad();
            break;
          case AbstractTierBinding.STARTING_STATE:
            this.didStart();
            break;
          case AbstractTierBinding.STOPPING_STATE:
            this.didStop();
            break;
          case AbstractTierBinding.UNLOADING_STATE:
            this.didUnload();
            break;
          case AbstractTierBinding.CLOSING_STATE:
            final TierContext tierContext = this.tierContext();
            if (tierContext != null) {
              tierContext.close();
            }
            break;
          default:
        }

        switch (newState) {
          case AbstractTierBinding.OPENING_STATE:
            this.willOpen();
            continue call;
          case AbstractTierBinding.LOADING_STATE:
            this.willLoad();
            continue call;
          case AbstractTierBinding.STARTING_STATE:
            this.willStart();
            continue call;
          case AbstractTierBinding.STOPPING_STATE:
            this.willStop();
            continue call;
          case AbstractTierBinding.UNLOADING_STATE:
            this.willUnload();
            continue call;
          case AbstractTierBinding.CLOSING_STATE:
            this.willClose();
            continue call;
          default:
            break call;
        }
      }
    } while (true);
  }

  protected void willOpen() {
    final TierContext tierContext = this.tierContext();
    if (tierContext != null) {
      tierContext.willOpen();
    }
  }

  protected void didOpen() {
    final TierContext tierContext = this.tierContext();
    if (tierContext != null) {
      tierContext.didOpen();
    }
  }

  protected void willLoad() {
    final TierContext tierContext = this.tierContext();
    if (tierContext != null) {
      tierContext.willLoad();
    }
  }

  protected void didLoad() {
    final TierContext tierContext = this.tierContext();
    if (tierContext != null) {
      tierContext.didLoad();
    }
  }

  protected void willStart() {
    final TierContext tierContext = this.tierContext();
    if (tierContext != null) {
      tierContext.willStart();
    }
  }

  protected void didStart() {
    final TierContext tierContext = this.tierContext();
    if (tierContext != null) {
      tierContext.didStart();
    }
  }

  protected void willStop() {
    final TierContext tierContext = this.tierContext();
    if (tierContext != null) {
      tierContext.willStop();
    }
  }

  protected void didStop() {
    final TierContext tierContext = this.tierContext();
    if (tierContext != null) {
      tierContext.didStop();
    }
  }

  protected void willUnload() {
    final TierContext tierContext = this.tierContext();
    if (tierContext != null) {
      tierContext.willUnload();
    }
  }

  protected void didUnload() {
    final TierContext tierContext = this.tierContext();
    if (tierContext != null) {
      tierContext.didUnload();
    }
  }

  protected void willClose() {
    final TierContext tierContext = this.tierContext();
    if (tierContext != null) {
      tierContext.willClose();
    }
  }

  @Override
  public void didClose() {
    // hook
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }

  protected static final int STATE_MASK = 0xf;
  protected static final int CLOSED_STATE = 0;
  protected static final int CLOSING_STATE = 1;
  protected static final int UNLOADING_STATE = 2;
  protected static final int STOPPING_STATE = 3;
  protected static final int RECOVERING_STATE = 4;
  protected static final int FAILING_STATE = 5;
  protected static final int FAILED_STATE = 6;
  protected static final int OPENING_STATE = 7;
  protected static final int OPENED_STATE = 8;
  protected static final int LOADING_STATE = 9;
  protected static final int LOADED_STATE = 10;
  protected static final int STARTING_STATE = 11;
  protected static final int STARTED_STATE = 12;
  protected static final int PHASE_SHIFT = 4;
  protected static final int PHASE_MASK = 0xf << AbstractTierBinding.PHASE_SHIFT;
  protected static final int CLOSED_PHASE = 0;
  protected static final int OPENED_PHASE = 1;
  protected static final int LOADED_PHASE = 2;
  protected static final int STARTED_PHASE = 3;

  protected static final AtomicIntegerFieldUpdater<AbstractTierBinding> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(AbstractTierBinding.class, "status");

}
