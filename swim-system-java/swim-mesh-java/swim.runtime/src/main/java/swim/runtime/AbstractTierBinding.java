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

import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;

public abstract class AbstractTierBinding extends AbstractSwimRef implements TierBinding {
  protected volatile int status;

  @Override
  public abstract TierContext tierContext();

  @Override
  public boolean isClosed() {
    final int phase = (this.status & PHASE_MASK) >>> PHASE_SHIFT;
    return phase == CLOSED_PHASE;
  }

  @Override
  public boolean isOpened() {
    final int phase = (this.status & PHASE_MASK) >>> PHASE_SHIFT;
    return phase >= OPENED_PHASE;
  }

  @Override
  public boolean isLoaded() {
    final int phase = (this.status & PHASE_MASK) >>> PHASE_SHIFT;
    return phase >= LOADED_PHASE;
  }

  @Override
  public boolean isStarted() {
    final int phase = (this.status & PHASE_MASK) >>> PHASE_SHIFT;
    return phase == STARTED_PHASE;
  }

  protected void activate(TierBinding childTier) {
    final int state = this.status & STATE_MASK;
    if (state >= STARTING_STATE) {
      childTier.start();
    } else if (state >= LOADING_STATE) {
      childTier.load();
    } else if (state >= OPENING_STATE) {
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
    final int newPhase = OPENED_PHASE;
    do {
      oldStatus = this.status;
      oldState = oldStatus & STATE_MASK;
      oldPhase = (oldStatus & PHASE_MASK) >>> PHASE_SHIFT;
      if (newPhase > oldPhase) {
        if (oldState == CLOSED_STATE) {
          newState = OPENING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & STATE_MASK | (newPhase << PHASE_SHIFT) & PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == OPENING_STATE) {
        willOpen();
        convergeState();
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
    final int newPhase = LOADED_PHASE;
    do {
      oldStatus = this.status;
      oldState = oldStatus & STATE_MASK;
      oldPhase = (oldStatus & PHASE_MASK) >>> PHASE_SHIFT;
      if (newPhase > oldPhase) {
        if (oldState == OPENED_STATE) {
          newState = LOADING_STATE;
        } else if (oldState == CLOSED_STATE) {
          newState = OPENING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & STATE_MASK | (newPhase << PHASE_SHIFT) & PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == LOADING_STATE) {
        willLoad();
        convergeState();
      } else if (newState == OPENING_STATE) {
        willOpen();
        convergeState();
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
    final int newPhase = STARTED_PHASE;
    do {
      oldStatus = this.status;
      oldState = oldStatus & STATE_MASK;
      oldPhase = (oldStatus & PHASE_MASK) >>> PHASE_SHIFT;
      if (newPhase > oldPhase) {
        if (oldState == LOADED_STATE) {
          newState = STARTING_STATE;
        } else if (oldState == OPENED_STATE) {
          newState = LOADING_STATE;
        } else if (oldState == CLOSED_STATE) {
          newState = OPENING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & STATE_MASK | (newPhase << PHASE_SHIFT) & PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == STARTING_STATE) {
        willStart();
        convergeState();
      } else if (newState == LOADING_STATE) {
        willLoad();
        convergeState();
      } else if (newState == OPENING_STATE) {
        willOpen();
        convergeState();
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
    final int newPhase = LOADED_PHASE;
    do {
      oldStatus = this.status;
      oldState = oldStatus & STATE_MASK;
      oldPhase = (oldStatus & PHASE_MASK) >>> PHASE_SHIFT;
      if (newPhase < oldPhase) {
        if (oldState == STARTED_STATE) {
          newState = STOPPING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & STATE_MASK | (newPhase << PHASE_SHIFT) & PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == STOPPING_STATE) {
        willStop();
        convergeState();
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
    final int newPhase = OPENED_PHASE;
    do {
      oldStatus = this.status;
      oldState = oldStatus & STATE_MASK;
      oldPhase = (oldStatus & PHASE_MASK) >>> PHASE_SHIFT;
      if (newPhase < oldPhase) {
        if (oldState == LOADED_STATE) {
          newState = UNLOADING_STATE;
        } else if (oldState == STARTED_STATE) {
          newState = STOPPING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & STATE_MASK | (newPhase << PHASE_SHIFT) & PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == UNLOADING_STATE) {
        willUnload();
        convergeState();
      } else if (newState == STOPPING_STATE) {
        willStop();
        convergeState();
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
    final int newPhase = CLOSED_PHASE;
    do {
      oldStatus = this.status;
      oldState = oldStatus & STATE_MASK;
      oldPhase = (oldStatus & PHASE_MASK) >>> PHASE_SHIFT;
      if (newPhase < oldPhase) {
        if (oldState == OPENED_STATE) {
          newState = CLOSING_STATE;
        } else if (oldState == LOADED_STATE) {
          newState = UNLOADING_STATE;
        } else if (oldState == STARTED_STATE) {
          newState = STOPPING_STATE;
        } else {
          newState = oldState;
        }
        newStatus = newState & STATE_MASK | (newPhase << PHASE_SHIFT) & PHASE_MASK;
      } else {
        newState = oldState;
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldState != newState) {
      if (newState == CLOSING_STATE) {
        willClose();
        convergeState();
      } else if (newState == UNLOADING_STATE) {
        willUnload();
        convergeState();
      } else if (newState == STOPPING_STATE) {
        willStop();
        convergeState();
      }
    }
  }

  void convergeState() {
    call: do {
      int oldStatus;
      int newStatus;
      int oldState;
      int newState;
      loop:
      do {
        oldStatus = this.status;
        oldState = oldStatus & STATE_MASK;
        final int phase = (oldStatus & PHASE_MASK) >>> PHASE_SHIFT;
        switch (oldState) {
          case OPENING_STATE:
            newState = phase > OPENED_PHASE ? LOADING_STATE : phase < OPENED_PHASE ? CLOSING_STATE : OPENED_STATE;
            break;
          case LOADING_STATE:
            newState = phase > LOADED_PHASE ? STARTING_STATE : phase < LOADED_PHASE ? UNLOADING_STATE : LOADED_STATE;
            break;
          case STARTING_STATE:
            newState = phase < STARTED_PHASE ? STOPPING_STATE : STARTED_STATE;
            break;
          case STOPPING_STATE:
            newState = phase < LOADED_PHASE ? UNLOADING_STATE : phase > LOADED_PHASE ? STARTING_STATE : LOADED_STATE;
            break;
          case UNLOADING_STATE:
            newState = phase < OPENED_PHASE ? CLOSING_STATE : phase > OPENED_PHASE ? LOADING_STATE : OPENED_STATE;
            break;
          case CLOSING_STATE:
            newState = phase > CLOSED_PHASE ? OPENING_STATE : CLOSED_STATE;
            break;
          default:
            newState = oldState;
            newStatus = oldStatus;
            break loop;
        }
        newStatus = oldStatus & ~STATE_MASK | newState & STATE_MASK;
      } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));

      if (oldState != newState) {
        switch (oldState) {
          case OPENING_STATE:
            didOpen();
            break;
          case LOADING_STATE:
            didLoad();
            break;
          case STARTING_STATE:
            didStart();
            break;
          case STOPPING_STATE:
            didStop();
            break;
          case UNLOADING_STATE:
            didUnload();
            break;
          case CLOSING_STATE:
            final TierContext tierContext = tierContext();
            if (tierContext != null) {
              tierContext.close();
            }
            break;
          default:
        }

        switch (newState) {
          case OPENING_STATE:
            willOpen();
            continue call;
          case LOADING_STATE:
            willLoad();
            continue call;
          case STARTING_STATE:
            willStart();
            continue call;
          case STOPPING_STATE:
            willStop();
            continue call;
          case UNLOADING_STATE:
            willUnload();
            continue call;
          case CLOSING_STATE:
            willClose();
            continue call;
          default:
            break call;
        }
      }
    } while (true);
  }

  protected void willOpen() {
    final TierContext tierContext = tierContext();
    if (tierContext != null) {
      tierContext.willOpen();
    }
  }

  protected void didOpen() {
    final TierContext tierContext = tierContext();
    if (tierContext != null) {
      tierContext.didOpen();
    }
  }

  protected void willLoad() {
    final TierContext tierContext = tierContext();
    if (tierContext != null) {
      tierContext.willLoad();
    }
  }

  protected void didLoad() {
    final TierContext tierContext = tierContext();
    if (tierContext != null) {
      tierContext.didLoad();
    }
  }

  protected void willStart() {
    final TierContext tierContext = tierContext();
    if (tierContext != null) {
      tierContext.willStart();
    }
  }

  protected void didStart() {
    final TierContext tierContext = tierContext();
    if (tierContext != null) {
      tierContext.didStart();
    }
  }

  protected void willStop() {
    final TierContext tierContext = tierContext();
    if (tierContext != null) {
      tierContext.willStop();
    }
  }

  protected void didStop() {
    final TierContext tierContext = tierContext();
    if (tierContext != null) {
      tierContext.didStop();
    }
  }

  protected void willUnload() {
    final TierContext tierContext = tierContext();
    if (tierContext != null) {
      tierContext.willUnload();
    }
  }

  protected void didUnload() {
    final TierContext tierContext = tierContext();
    if (tierContext != null) {
      tierContext.didUnload();
    }
  }

  protected void willClose() {
    final TierContext tierContext = tierContext();
    if (tierContext != null) {
      tierContext.willClose();
    }
  }

  @Override
  public void didClose() {
    // stub
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
  protected static final int PHASE_MASK = 0xf << PHASE_SHIFT;
  protected static final int CLOSED_PHASE = 0;
  protected static final int OPENED_PHASE = 1;
  protected static final int LOADED_PHASE = 2;
  protected static final int STARTED_PHASE = 3;

  protected static final AtomicIntegerFieldUpdater<AbstractTierBinding> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(AbstractTierBinding.class, "status");
}
